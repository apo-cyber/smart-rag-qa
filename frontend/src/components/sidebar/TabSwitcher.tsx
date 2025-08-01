// frontend/src/components/sidebar/TabSwitcher.tsx
import React from "react";
import { MessageSquare, FileText } from "lucide-react";

interface TabSwitcherProps {
  activeTab: "chat" | "documents";
  onTabChange: (tab: "chat" | "documents") => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => onTabChange("chat")}
        className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center ${
          activeTab === "chat"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        会話履歴
      </button>
      <button
        onClick={() => onTabChange("documents")}
        className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center ${
          activeTab === "documents"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <FileText className="w-4 h-4 mr-2" />
        文書管理
      </button>
    </div>
  );
};
