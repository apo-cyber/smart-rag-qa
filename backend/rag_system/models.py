# backend/rag_system/models.py
from django.db import models
from django.contrib.auth.models import User
import uuid


class Document(models.Model):
    """アップロードされたドキュメント"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="documents/", null=True, blank=True)
    content = models.TextField()  # 抽出されたテキスト
    file_type = models.CharField(max_length=50, default="text")
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_processed = models.BooleanField(default=False)  # ベクトル化済みかどうか

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.title


class DocumentChunk(models.Model):
    """ドキュメントのチャンク（分割されたテキスト片）"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name="chunks"
    )
    content = models.TextField()
    chunk_index = models.IntegerField()  # ドキュメント内での順序
    embedding = models.JSONField(null=True, blank=True)  # ベクトル埋め込み
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["document", "chunk_index"]
        unique_together = ["document", "chunk_index"]

    def __str__(self):
        return f"{self.document.title} - Chunk {self.chunk_index}"


class Conversation(models.Model):
    """会話セッション"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=True)  # 会話のタイトル
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title or f"Conversation {self.id}"


class Question(models.Model):
    """ユーザーからの質問"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="questions"
    )
    text = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Q: {self.text[:50]}..."


class Answer(models.Model):
    """AIからの回答"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.OneToOneField(
        Question, on_delete=models.CASCADE, related_name="answer"
    )
    text = models.TextField()
    sources = models.JSONField(default=list)  # 参照したドキュメントチャンクのID
    model_used = models.CharField(max_length=100, default="gpt-3.5-turbo")
    processing_time = models.FloatField(null=True, blank=True)  # 処理時間（秒）
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"A: {self.text[:50]}..."


class UserFeedback(models.Model):
    """ユーザーからの回答評価"""

    RATING_CHOICES = [
        (1, "悪い"),
        (2, "普通"),
        (3, "良い"),
        (4, "とても良い"),
        (5, "優秀"),
    ]

    answer = models.OneToOneField(
        Answer, on_delete=models.CASCADE, related_name="feedback"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback: {self.rating}/5"
