// frontend/src/components/chat/ChatArea.tsx
import React from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Message } from "@/types";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* チャットメッセージエリア */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* 入力エリア */}
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};
