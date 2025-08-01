"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";

export default function RAGChatApp() {
  const {
    messages,
    isLoading,
    currentConversationId,
    sendMessage,
    loadConversation,
    startNewConversation,
  } = useChat();

  const { fetchConversations } = useConversations();

  const handleSendMessage = (text: string) => {
    sendMessage(text, fetchConversations);
  };

  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentConversationId={currentConversationId}
        onStartNewConversation={startNewConversation}
        onSelectConversation={handleSelectConversation}
      />
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
