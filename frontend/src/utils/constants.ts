// frontend/src/utils/constants.ts
export const API_BASE_URL = "http://127.0.0.1:8000/api";

export const ACCEPTED_FILE_TYPES = ".txt,.md";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const MESSAGES = {
  UPLOAD_SUCCESS: "ドキュメントが正常にアップロードされました！",
  UPLOAD_ERROR: "アップロードに失敗しました。",
  API_ERROR:
    "エラーが発生しました。バックエンドサーバーが起動していることを確認してください。",
  FETCH_ERROR: "データの取得に失敗しました。",
  NO_CONVERSATIONS: "まだ会話がありません",
  NO_DOCUMENTS: "まだ文書がありません",
  PLACEHOLDER: "質問を入力してください...",
} as const;
