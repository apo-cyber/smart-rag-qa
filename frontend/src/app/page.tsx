"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Upload,
  MessageSquare,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";

// APIベースURL
const API_BASE_URL = "http://127.0.0.1:8000/api";

// 型定義
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  sources?: Source[];
  timestamp: Date;
}

interface Source {
  document_title: string;
  chunk_id: string;
  relevance_score: number;
}

interface Document {
  id: string;
  title: string;
  content: string;
  uploaded_at: string;
  chunks_count: number;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  questions_count: number;
}

export default function RAGChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<"chat" | "documents">("chat");

  // 初期データ読み込み
  useEffect(() => {
    fetchDocuments();
    fetchConversations();
  }, []);

  // ドキュメント一覧取得
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.results || []);
      }
    } catch (error) {
      console.error("ドキュメント取得エラー:", error);
    }
  };

  // 会話一覧取得
  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.results || []);
      }
    } catch (error) {
      console.error("会話取得エラー:", error);
    }
  };

  // 質問送信
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      const requestBody = {
        text: currentInput,
        ...(currentConversationId && {
          conversation_id: currentConversationId,
        }),
      };

      const response = await fetch(`${API_BASE_URL}/ask/ask/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.question && data.question.answer) {
          const aiMessage: Message = {
            id: data.question.id,
            text: data.question.answer.text,
            isUser: false,
            sources: data.question.answer.sources,
            timestamp: new Date(data.question.answer.created_at),
          };

          setMessages((prev) => [...prev, aiMessage]);

          // 新しい会話の場合、会話IDを更新
          if (data.conversation_id && !currentConversationId) {
            setCurrentConversationId(data.conversation_id);
            fetchConversations(); // 会話リストを更新
          }
        }
      } else {
        throw new Error("API応答エラー");
      }
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
      const errorMessage: Message = {
        id: "error-" + Date.now(),
        text: "エラーが発生しました。バックエンドサーバーが起動していることを確認してください。",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ドキュメントアップロード（JSON形式）
  const uploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      const requestData = {
        title: file.name,
        content: content,
        file_type: file.type || "text",
      };

      const response = await fetch(`${API_BASE_URL}/documents/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        fetchDocuments(); // ドキュメントリストを更新
        alert("ドキュメントが正常にアップロードされました！");
      } else {
        throw new Error("アップロード失敗");
      }
    } catch (error) {
      console.error("アップロードエラー:", error);
      alert("アップロードに失敗しました。");
    }

    // ファイル入力をリセット
    event.target.value = "";
  };

  // 新しい会話を開始
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  // 会話を読み込み
  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/`
      );
      if (response.ok) {
        const data = await response.json();
        const loadedMessages: Message[] = [];

        data.questions.forEach((q: any) => {
          // 質問を追加
          loadedMessages.push({
            id: q.id,
            text: q.text,
            isUser: true,
            timestamp: new Date(q.created_at),
          });

          // 回答を追加（存在する場合）
          if (q.answer) {
            loadedMessages.push({
              id: q.answer.id,
              text: q.answer.text,
              isUser: false,
              sources: q.answer.sources,
              timestamp: new Date(q.answer.created_at),
            });
          }
        });

        setMessages(loadedMessages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error("会話読み込みエラー:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Smart RAG QA</h1>
          <button
            onClick={startNewConversation}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            新しい会話
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("chat")}
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
            onClick={() => setActiveTab("documents")}
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

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "chat" ? (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
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
              {conversations.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  まだ会話がありません
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* ファイルアップロード */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-700 text-center">
                    ファイルをドロップまたはクリック
                    <br />
                    (.txt, .md ファイル対応)
                  </span>
                  <input
                    type="file"
                    onChange={uploadDocument}
                    accept=".txt,.md"
                    className="hidden"
                  />
                </label>
              </div>

              {/* ドキュメント一覧 */}
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
                {documents.length === 0 && (
                  <div className="text-center text-gray-500 text-sm">
                    まだ文書がありません
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col">
        {/* チャットメッセージ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">質問を入力して会話を始めましょう</p>
              <p className="text-sm mt-2">
                アップロードされた文書を基に回答します
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
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
                          • {source.document_title} (関連度:{" "}
                          {source.relevance_score})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              </div>
            </div>
          )}
        </div>

        {/* 入力エリア */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="質問を入力してください..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
