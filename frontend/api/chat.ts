import { apiFetch } from "./client";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  type: "text" | "image" | "recommendation";
  text?: string;
  textHindi?: string;
  imageFile?: string;
  recommendation?: any;
  timestamp: string;
}

export interface ConversationSummary {
  id: number;
  title: string;
  updated_at: string;
  created_at: string;
}

export interface ConversationDetail {
  id: number;
  title: string;
  messages: ChatMessage[];
}

export interface ChatRequest {
  message: string;
  conversation_id?: number | null;
  image_file?: string;
}

export interface ChatResponse {
  reply: string;
  conversation_id: number;
  title: string;
  messages: ChatMessage[];
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  return apiFetch<ConversationSummary[]>("/chat/conversations", {
    method: "GET",
  });
}

export async function fetchConversationMessages(conversationId: number): Promise<ConversationDetail> {
  return apiFetch<ConversationDetail>(`/chat/conversations/${conversationId}`, {
    method: "GET",
  });
}

export async function deleteConversation(conversationId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/chat/conversations/${conversationId}`, {
    method: "DELETE",
  });
}

export async function sendMessage(data: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}