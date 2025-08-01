// frontend/src/hooks/useChat.ts
import { useState } from "react";
import { Message } from "@/types";
import { apiService } from "@/services/api";
import { MESSAGES } from "@/utils/constants";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  const sendMessage = async (
    text: string,
    onConversationUpdate?: () => void
  ) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const requestBody = {
        text,
        ...(currentConversationId && {
          conversation_id: currentConversationId,
        }),
      };

      const data = await apiService.askQuestion(requestBody);

      if (data.question && data.question.answer) {
        const aiMessage: Message = {
          id: data.question.id,
          text: data.question.answer.text,
          isUser: false,
          sources: data.question.answer.sources,
          timestamp: new Date(data.question.answer.created_at),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // 新しい会話の場合、会話IDを更新
        if (data.conversation_id && !currentConversationId) {
          setCurrentConversationId(data.conversation_id);
          onConversationUpdate?.();
        }
      }
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
      const errorMessage: Message = {
        id: "error-" + Date.now(),
        text: MESSAGES.API_ERROR,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const data = await apiService.getConversation(conversationId);
      const loadedMessages: Message[] = [];

      data.questions.forEach((q: any) => {
        // 質問を追加
        loadedMessages.push({
          id: q.id,
          text: q.text,
          isUser: true,
          timestamp: new Date(q.created_at),
        });

        // 回答を追加（存在する場合）
        if (q.answer) {
          loadedMessages.push({
            id: q.answer.id,
            text: q.answer.text,
            isUser: false,
            sources: q.answer.sources,
            timestamp: new Date(q.answer.created_at),
          });
        }
      });

      setMessages(loadedMessages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error("会話読み込みエラー:", error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  return {
    messages,
    isLoading,
    currentConversationId,
    sendMessage,
    loadConversation,
    startNewConversation,
  };
};
