// frontend/src/components/sidebar/ConversationList.tsx
import React from "react";
import { Conversation } from "@/types";
import { MESSAGES } from "@/utils/constants";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm">
        {MESSAGES.NO_CONVERSATIONS}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelectConversation(conv.id)}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            currentConversationId === conv.id
              ? "bg-blue-100 border border-blue-300"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="text-sm font-medium text-gray-900 truncate">
            {conv.title}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {conv.questions_count}件の質問
          </div>
        </div>
      ))}
    </div>
  );
};
