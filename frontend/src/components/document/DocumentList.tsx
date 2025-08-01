// frontend/src/components/document/DocumentList.tsx
import React from "react";
import { Document } from "@/types";
import { MESSAGES } from "@/utils/constants";

interface DocumentListProps {
  documents: Document[];
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm">
        {MESSAGES.NO_DOCUMENTS}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-800">
        アップロード済み文書
      </h3>
      {documents.map((doc) => (
        <div key={doc.id} className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900 truncate">
            {doc.title}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {doc.chunks_count}個のチャンク
          </div>
        </div>
      ))}
    </div>
  );
};
