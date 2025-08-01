// frontend/src/hooks/useDocuments.ts
import { useState, useEffect } from "react";
import { Document } from "@/types";
import { apiService } from "@/services/api";
import { MESSAGES } from "@/utils/constants";

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await apiService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("ドキュメント取得エラー:", error);
    }
  };

  const uploadDocument = async (file: File) => {
    if (!file) return false;

    setIsUploading(true);

    try {
      let content = "";

      // テキストファイルの場合、内容を読み取り
      if (
        file.type === "text/plain" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md")
      ) {
        content = await file.text();
      } else {
        content = `${file.name}ファイルがアップロードされました。（内容解析は開発中）`;
      }

      const documentData = {
        title: file.name,
        content: content,
        file_type: file.type || "text",
      };

      await apiService.uploadDocument(documentData);
      await fetchDocuments(); // ドキュメントリストを更新
      alert(MESSAGES.UPLOAD_SUCCESS);
      return true;
    } catch (error) {
      console.error("アップロードエラー:", error);
      alert(MESSAGES.UPLOAD_ERROR);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    isUploading,
    uploadDocument,
    fetchDocuments,
  };
};
