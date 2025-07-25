# backend/rag_system/services.py
import time
import random
from typing import List, Dict, Any
from .models import DocumentChunk


class MockAIService:
    """OpenAI APIのモック実装"""

    def __init__(self):
        self.mock_responses = [
            "申し訳ございませんが、その質問に関する具体的な情報を文書から見つけることができませんでした。",
            "提供された文書に基づくと、{}について以下の情報があります：\n\n{}",
            "この質問については、アップロードされた文書に関連する内容が含まれています。{}",
            "文書を参照した結果、{}に関して次のような詳細が見つかりました：\n\n{}",
        ]

    def generate_embedding(self, text: str) -> List[float]:
        """テキストのベクトル埋め込みをモック生成"""
        # 実際のembeddingは1536次元だが、モックでは簡単な128次元を使用
        random.seed(hash(text) % 10000)  # テキストベースで一貫した値を生成
        return [random.uniform(-1, 1) for _ in range(128)]

    def search_similar_chunks(
        self, query: str, chunks: List[DocumentChunk], top_k: int = 3
    ) -> List[Dict]:
        """類似チャンクの検索をモック実装"""
        # 実際は埋め込みベクトルの類似度計算を行うが、モックでは簡単な文字列マッチング
        query_words = set(query.lower().split())

        scored_chunks = []
        for chunk in chunks:
            content_words = set(chunk.content.lower().split())
            # 単純な重複単語数でスコア計算
            score = len(query_words.intersection(content_words))

            # キーワードマッチングも追加（より緩い検索）
            content_lower = chunk.content.lower()
            query_lower = query.lower()

            # 部分文字列マッチング
            if any(word in content_lower for word in query_words if len(word) > 2):
                score += 1

            # 特定のキーワードに対する特別なスコアリング
            if any(
                keyword in query_lower
                for keyword in ["rag", "システム", "ai", "機械学習", "テスト"]
            ):
                if any(
                    keyword in content_lower
                    for keyword in ["rag", "システム", "ai", "機械学習", "テスト"]
                ):
                    score += 2

            # スコアが0でも、文書があれば少しは関連があるとする
            if score == 0 and len(chunks) > 0:
                score = 0.1  # 最小スコア

            if score > 0:  # 少しでもマッチした場合
                scored_chunks.append(
                    {
                        "chunk": chunk,
                        "score": score,
                        "content": (
                            chunk.content[:200] + "..."
                            if len(chunk.content) > 200
                            else chunk.content
                        ),
                    }
                )

        # スコア順でソートして上位を返す
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]

    def generate_answer(
        self, question: str, context_chunks: List[Dict]
    ) -> Dict[str, Any]:
        """質問に対する回答を生成（モック）"""
        time.sleep(1)  # API呼び出しの遅延をシミュレート

        if not context_chunks:
            answer = "申し訳ございませんが、アップロードされた文書からは関連する情報を見つけることができませんでした。より具体的な質問をしていただくか、関連する文書をアップロードしてください。"
            sources = []
        else:
            # コンテキストに基づいたモック回答生成
            context_text = "\n".join([chunk["content"] for chunk in context_chunks])

            # より自然な回答パターンを選択
            if "とは" in question or "について" in question:
                answer = f"{question.replace('とは', '').replace('について', '')}について、アップロードされた文書から以下の情報が見つかりました：\n\n"
            elif "?" in question or "？" in question:
                answer = f"ご質問の件について、文書を参照した結果：\n\n"
            else:
                answer = f"「{question}」に関して、以下の情報があります：\n\n"

            # コンテキストの要約を追加
            for i, chunk in enumerate(context_chunks[:2], 1):
                answer += f"{i}. {chunk['content'][:150]}...\n\n"

            answer += "上記の情報がお役に立てば幸いです。さらに詳しい情報が必要でしたら、より具体的な質問をお聞かせください。"

            sources = [
                {
                    "document_title": chunk["chunk"].document.title,
                    "chunk_id": str(chunk["chunk"].id),
                    "relevance_score": chunk["score"],
                }
                for chunk in context_chunks
            ]

        return {
            "answer": answer,
            "sources": sources,
            "model_used": "mock-gpt-3.5-turbo",
            "processing_time": random.uniform(0.8, 2.5),
        }


class RAGService:
    """RAG（Retrieval-Augmented Generation）のメインサービス"""

    def __init__(self):
        self.ai_service = MockAIService()

    def process_document(self, document):
        """ドキュメントを処理してチャンクに分割"""
        # テキストをチャンクに分割（簡単な実装）
        chunks = self._split_text(document.content)

        created_chunks = []
        for i, chunk_text in enumerate(chunks):
            # ベクトル埋め込みを生成
            embedding = self.ai_service.generate_embedding(chunk_text)

            # DocumentChunkを作成
            chunk = DocumentChunk.objects.create(
                document=document,
                content=chunk_text,
                chunk_index=i,
                embedding=embedding,
            )
            created_chunks.append(chunk)

        # ドキュメントを処理済みにマーク
        document.is_processed = True
        document.save()

        return created_chunks

    def _split_text(
        self, text: str, chunk_size: int = 500, overlap: int = 50
    ) -> List[str]:
        """テキストをチャンクに分割"""
        if len(text) <= chunk_size:
            return [text]

        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size

            # 単語の境界で分割
            if end < len(text):
                # 最後の完全な文または単語で終わるように調整
                last_period = text.rfind("。", start, end)
                last_newline = text.rfind("\n", start, end)
                last_space = text.rfind(" ", start, end)

                cut_point = max(last_period, last_newline, last_space)
                if cut_point > start:
                    end = cut_point + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - overlap

        return chunks

    def answer_question(self, question_text: str, user) -> Dict[str, Any]:
        """質問に対する回答を生成"""
        # 全てのチャンクから関連するものを検索
        all_chunks = DocumentChunk.objects.all()
        print(f"総チャンク数: {all_chunks.count()}")  # デバッグ用

        similar_chunks = self.ai_service.search_similar_chunks(
            question_text, all_chunks, top_k=3
        )
        print(f"見つかったチャンク数: {len(similar_chunks)}")  # デバッグ用

        # AI回答を生成
        result = self.ai_service.generate_answer(question_text, similar_chunks)

        return result
