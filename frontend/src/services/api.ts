// frontend/src/services/api.ts
import { API_BASE_URL } from "@/utils/constants";
import {
  Document,
  Conversation,
  QuestionRequest,
  QuestionResponse,
} from "@/types";

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ドキュメント関連
  async getDocuments() {
    const data = await this.request<{ results: Document[] }>("/documents/");
    return data.results || [];
  }

  async uploadDocument(documentData: {
    title: string;
    content: string;
    file_type: string;
  }) {
    return this.request("/documents/", {
      method: "POST",
      body: JSON.stringify(documentData),
    });
  }

  // 会話関連
  async getConversations() {
    const data = await this.request<{ results: Conversation[] }>(
      "/conversations/"
    );
    return data.results || [];
  }

  async getConversation(id: string) {
    return this.request<Conversation & { questions: any[] }>(
      `/conversations/${id}/`
    );
  }

  // 質問・回答関連
  async askQuestion(questionData: QuestionRequest) {
    return this.request<QuestionResponse>("/ask/ask/", {
      method: "POST",
      body: JSON.stringify(questionData),
    });
  }
}

export const apiService = new ApiService();
