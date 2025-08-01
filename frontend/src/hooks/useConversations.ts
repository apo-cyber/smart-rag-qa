// frontend/src/hooks/useConversations.ts
import { useState, useEffect } from "react";
import { Conversation } from "@/types";
import { apiService } from "@/services/api";

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const fetchConversations = async () => {
    try {
      const data = await apiService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("会話取得エラー:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    fetchConversations,
  };
};
