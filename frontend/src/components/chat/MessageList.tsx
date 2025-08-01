// frontend/src/components/chat/MessageList.tsx
import React from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
}) => {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-20">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">質問を入力して会話を始めましょう</p>
        <p className="text-sm mt-2">アップロードされた文書を基に回答します</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        </div>
      )}
    </>
  );
};
