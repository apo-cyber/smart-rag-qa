# backend/rag_system/serializers.py
from rest_framework import serializers
from .models import (
    Document,
    DocumentChunk,
    Conversation,
    Question,
    Answer,
    UserFeedback,
)


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(
        source="uploaded_by.username", read_only=True
    )
    chunks_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "file",
            "content",
            "file_type",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",
            "updated_at",
            "is_processed",
            "chunks_count",
        ]
        read_only_fields = [
            "id",
            "uploaded_by",
            "uploaded_at",
            "updated_at",
            "is_processed",
        ]

    def get_chunks_count(self, obj):
        return obj.chunks.count()


class DocumentChunkSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source="document.title", read_only=True)

    class Meta:
        model = DocumentChunk
        fields = [
            "id",
            "document",
            "document_title",
            "content",
            "chunk_index",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "user",
            "user_name",
            "title",
            "created_at",
            "updated_at",
            "questions_count",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_questions_count(self, obj):
        return obj.questions.count()


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            "id",
            "text",
            "sources",
            "model_used",
            "processing_time",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class QuestionSerializer(serializers.ModelSerializer):
    answer = AnswerSerializer(read_only=True)
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "conversation",
            "text",
            "user",
            "user_name",
            "created_at",
            "answer",
        ]
        read_only_fields = ["id", "user", "created_at"]


class UserFeedbackSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserFeedback
        fields = ["answer", "user", "user_name", "rating", "comment", "created_at"]
        read_only_fields = ["user", "created_at"]


class QuestionCreateSerializer(serializers.Serializer):
    """質問作成用のシリアライザー"""

    conversation_id = serializers.UUIDField(required=False, allow_null=True)
    text = serializers.CharField(max_length=2000)

    def validate_text(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("質問は3文字以上で入力してください。")
        return value.strip()


class ConversationDetailSerializer(serializers.ModelSerializer):
    """会話詳細用のシリアライザー（質問・回答を含む）"""

    questions = QuestionSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "user",
            "user_name",
            "title",
            "created_at",
            "updated_at",
            "questions",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]
