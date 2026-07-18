const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {

  const authState =
    localStorage.getItem("auth-state") ??
    sessionStorage.getItem("auth-session-state");

  let token: string | null = null;

  if (authState) {
    token = JSON.parse(authState).token;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : {}),

      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}