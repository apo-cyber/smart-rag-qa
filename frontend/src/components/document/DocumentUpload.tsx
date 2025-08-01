// frontend/src/components/document/DocumentUpload.tsx
import React from "react";
import { Upload } from "lucide-react";
import { ACCEPTED_FILE_TYPES } from "@/utils/constants";

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  isUploading = false,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      // ファイル入力をリセット
      event.target.value = "";
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <label className="flex flex-col items-center cursor-pointer">
        <Upload
          className={`w-8 h-8 mb-2 ${
            isUploading ? "text-blue-500 animate-pulse" : "text-gray-400"
          }`}
        />
        <span className="text-sm text-gray-700 text-center">
          {isUploading ? (
            "アップロード中..."
          ) : (
            <>
              ファイルをドロップまたはクリック
              <br />
              (.txt, .md ファイル対応)
            </>
          )}
        </span>
        <input
          type="file"
          onChange={handleFileChange}
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          disabled={isUploading}
        />
      </label>
    </div>
  );
};
