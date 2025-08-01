// frontend/src/types/index.ts
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  sources?: Source[];
  timestamp: Date;
}

export interface Source {
  document_title: string;
  chunk_id: string;
  relevance_score: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  uploaded_at: string;
  chunks_count: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  questions_count: number;
}

export interface QuestionRequest {
  text: string;
  conversation_id?: string;
}

export interface QuestionResponse {
  question: {
    id: string;
    text: string;
    created_at: string;
    answer: {
      id: string;
      text: string;
      sources: Source[];
      created_at: string;
    };
  };
  conversation_id: string;
}
