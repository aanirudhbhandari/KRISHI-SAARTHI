import { apiFetch } from "./client";


export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface LoginResponse {
    message: string;
    access_token: string;
    token_type: string;
    user: User;
}


export async function registerUser(data: RegisterRequest) {
    return apiFetch<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function loginUser(data: LoginRequest) {
    return apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    });
}