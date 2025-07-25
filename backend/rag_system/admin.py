# backend/rag_system/admin.py
from django.contrib import admin
from .models import (
    Document,
    DocumentChunk,
    Conversation,
    Question,
    Answer,
    UserFeedback,
)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ["title", "file_type", "uploaded_by", "is_processed", "uploaded_at"]
    list_filter = ["file_type", "is_processed", "uploaded_at"]
    search_fields = ["title", "content"]
    readonly_fields = ["id", "uploaded_at", "updated_at"]


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ["document", "chunk_index", "created_at"]
    list_filter = ["document", "created_at"]
    search_fields = ["content"]
    readonly_fields = ["id", "created_at"]


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "created_at", "updated_at"]
    list_filter = ["created_at", "updated_at"]
    search_fields = ["title", "user__username"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["text_preview", "user", "conversation", "created_at"]
    list_filter = ["created_at", "user"]
    search_fields = ["text", "user__username"]
    readonly_fields = ["id", "created_at"]

    def text_preview(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text

    text_preview.short_description = "質問内容"


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = [
        "text_preview",
        "question_preview",
        "model_used",
        "processing_time",
        "created_at",
    ]
    list_filter = ["model_used", "created_at"]
    search_fields = ["text", "question__text"]
    readonly_fields = ["id", "created_at"]

    def text_preview(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text

    text_preview.short_description = "回答内容"

    def question_preview(self, obj):
        return (
            obj.question.text[:30] + "..."
            if len(obj.question.text) > 30
            else obj.question.text
        )

    question_preview.short_description = "質問"


@admin.register(UserFeedback)
class UserFeedbackAdmin(admin.ModelAdmin):
    list_display = ["answer_preview", "user", "rating", "created_at"]
    list_filter = ["rating", "created_at"]
    search_fields = ["comment", "user__username"]
    readonly_fields = ["created_at"]

    def answer_preview(self, obj):
        return (
            obj.answer.text[:30] + "..."
            if len(obj.answer.text) > 30
            else obj.answer.text
        )

    answer_preview.short_description = "回答"
