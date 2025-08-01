// frontend/src/components/chat/MessageBubble.tsx
import React from "react";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl p-4 rounded-lg ${
          message.isUser
            ? "bg-blue-600 text-white"
            : "bg-white border border-gray-200 text-gray-800"
        }`}
      >
        <div
          className={`whitespace-pre-wrap ${
            message.isUser ? "text-white" : "text-gray-800"
          }`}
        >
          {message.text}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-700 font-medium mb-2">
              参照された文書:
            </div>
            {message.sources.map((source, idx) => (
              <div key={idx} className="text-xs text-gray-600">
                • {source.document_title} (関連度: {source.relevance_score})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
