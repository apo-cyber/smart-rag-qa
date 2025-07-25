# backend/rag_system/views.py の修正版
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny  # AllowAnyを追加
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
import uuid
import time

from .models import (
    Document,
    DocumentChunk,
    Conversation,
    Question,
    Answer,
    UserFeedback,
)
from .serializers import (
    DocumentSerializer,
    DocumentChunkSerializer,
    ConversationSerializer,
    QuestionSerializer,
    AnswerSerializer,
    UserFeedbackSerializer,
    QuestionCreateSerializer,
    ConversationDetailSerializer,
)
from .services import RAGService


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [AllowAny]  # 開発時は認証なし

    def get_queryset(self):
        return Document.objects.all()  # 全ユーザーの文書を表示

    def perform_create(self, serializer):
        # デフォルトユーザーを取得または作成（開発用）
        user, created = User.objects.get_or_create(
            username="testuser", defaults={"email": "test@example.com"}
        )
        document = serializer.save(uploaded_by=user)

        # ファイルからテキストを抽出（簡単な実装）
        if document.file:
            try:
                content = self._extract_text_from_file(document.file)
                document.content = content
                document.save()
            except Exception as e:
                document.content = f"ファイルの読み取りに失敗しました: {str(e)}"
                document.save()

        # RAGサービスでドキュメントを処理
        rag_service = RAGService()
        rag_service.process_document(document)

    def _extract_text_from_file(self, file):
        """ファイルからテキストを抽出（簡単な実装）"""
        content = ""
        try:
            if file.name.endswith((".txt", ".md")):
                content = file.read().decode("utf-8")
            elif file.name.endswith(".pdf"):
                # 実際のPDF処理は後で実装
                content = (
                    "PDFファイルが正常にアップロードされました。（PDF処理機能は開発中）"
                )
            else:
                content = "サポートされていないファイル形式です。"
        except Exception as e:
            content = f"ファイル読み取りエラー: {str(e)}"

        return content

    @action(detail=True, methods=["get"])
    def chunks(self, request, pk=None):
        """ドキュメントのチャンク一覧を取得"""
        document = self.get_object()
        chunks = document.chunks.all()
        serializer = DocumentChunkSerializer(chunks, many=True)
        return Response(serializer.data)


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [AllowAny]  # 開発時は認証なし

    def get_queryset(self):
        return Conversation.objects.all()  # 全ユーザーの会話を表示

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ConversationDetailSerializer
        return ConversationSerializer

    def perform_create(self, serializer):
        # デフォルトユーザーを取得または作成（開発用）
        user, created = User.objects.get_or_create(
            username="testuser", defaults={"email": "test@example.com"}
        )
        serializer.save(user=user)

    @action(detail=True, methods=["post"])
    def ask_question(self, request, pk=None):
        """会話に質問を追加"""
        conversation = self.get_object()
        serializer = QuestionCreateSerializer(data=request.data)

        if serializer.is_valid():
            question_text = serializer.validated_data["text"]

            # デフォルトユーザーを取得
            user, created = User.objects.get_or_create(
                username="testuser", defaults={"email": "test@example.com"}
            )

            # 質問を作成
            question = Question.objects.create(
                conversation=conversation, text=question_text, user=user
            )

            # RAGサービスで回答を生成
            rag_service = RAGService()
            start_time = time.time()
            result = rag_service.answer_question(question_text, user)

            # 回答を保存
            answer = Answer.objects.create(
                question=question,
                text=result["answer"],
                sources=result["sources"],
                model_used=result["model_used"],
                processing_time=result["processing_time"],
            )

            # 会話のタイトルを自動生成（最初の質問の場合）
            if not conversation.title and conversation.questions.count() == 1:
                conversation.title = question_text[:50] + (
                    "..." if len(question_text) > 50 else ""
                )
                conversation.save()

            # 質問と回答をシリアライズして返す
            question_serializer = QuestionSerializer(question)
            return Response(question_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]  # 開発時は認証なし

    def get_queryset(self):
        return Question.objects.all()  # 全ユーザーの質問を表示


class QuestionCreateView(viewsets.GenericViewSet):
    """スタンドアロンの質問作成（会話なし）"""

    permission_classes = [AllowAny]  # 開発時は認証なし

    @action(detail=False, methods=["post"])
    def ask(self, request):
        """質問を送信して回答を取得"""
        serializer = QuestionCreateSerializer(data=request.data)

        if serializer.is_valid():
            question_text = serializer.validated_data["text"]
            conversation_id = serializer.validated_data.get("conversation_id")

            # デフォルトユーザーを取得または作成（開発用）
            user, created = User.objects.get_or_create(
                username="testuser", defaults={"email": "test@example.com"}
            )

            # 会話を取得または作成
            if conversation_id:
                conversation = get_object_or_404(Conversation, id=conversation_id)
            else:
                conversation = Conversation.objects.create(
                    user=user,
                    title=question_text[:50]
                    + ("..." if len(question_text) > 50 else ""),
                )

            # 質問を作成
            question = Question.objects.create(
                conversation=conversation, text=question_text, user=user
            )

            # RAGサービスで回答を生成
            rag_service = RAGService()
            result = rag_service.answer_question(question_text, user)

            # 回答を保存
            answer = Answer.objects.create(
                question=question,
                text=result["answer"],
                sources=result["sources"],
                model_used=result["model_used"],
                processing_time=result["processing_time"],
            )

            # レスポンスデータを準備
            response_data = {
                "question": QuestionSerializer(question).data,
                "conversation_id": str(conversation.id),
            }

            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserFeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = UserFeedbackSerializer
    permission_classes = [AllowAny]  # 開発時は認証なし

    def get_queryset(self):
        return UserFeedback.objects.all()  # 全ユーザーのフィードバックを表示

    def perform_create(self, serializer):
        # デフォルトユーザーを取得または作成（開発用）
        user, created = User.objects.get_or_create(
            username="testuser", defaults={"email": "test@example.com"}
        )
        serializer.save(user=user)
