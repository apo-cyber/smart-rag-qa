# backend/rag_system/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DocumentViewSet,
    ConversationViewSet,
    QuestionViewSet,
    QuestionCreateView,
    UserFeedbackViewSet,
)

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="documents")
router.register(r"conversations", ConversationViewSet, basename="conversations")
router.register(r"questions", QuestionViewSet, basename="questions")
router.register(r"feedback", UserFeedbackViewSet, basename="feedback")
router.register(r"ask", QuestionCreateView, basename="ask")

urlpatterns = [
    path("api/", include(router.urls)),
]
