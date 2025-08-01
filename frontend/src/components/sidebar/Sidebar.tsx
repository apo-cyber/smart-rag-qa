// frontend/src/components/sidebar/Sidebar.tsx
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TabSwitcher } from "./TabSwitcher";
import { ConversationList } from "./ConversationList";
import { DocumentUpload } from "@/components/document/DocumentUpload";
import { DocumentList } from "@/components/document/DocumentList";
import { useConversations } from "@/hooks/useConversations";
import { useDocuments } from "@/hooks/useDocuments";

interface SidebarProps {
  currentConversationId: string | null;
  onStartNewConversation: () => void;
  onSelectConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentConversationId,
  onStartNewConversation,
  onSelectConversation,
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "documents">("chat");
  const { conversations, fetchConversations } = useConversations();
  const { documents, isUploading, uploadDocument } = useDocuments();

  const handleNewConversation = () => {
    onStartNewConversation();
    fetchConversations();
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Smart RAG QA</h1>
        <Button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          新しい会話
        </Button>
      </div>

      {/* タブ切り替え */}
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "chat" ? (
          <ConversationList
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={onSelectConversation}
          />
        ) : (
          <div className="space-y-4">
            <DocumentUpload
              onUpload={uploadDocument}
              isUploading={isUploading}
            />
            <DocumentList documents={documents} />
          </div>
        )}
      </div>
    </div>
  );
};
