import { apiFetch } from "./client";

export interface ChatRequest {
    message: string;
}

export interface ChatResponse {
    reply: string;
}

export async function sendMessage(data: ChatRequest) {
    return apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify(data),
    });
}