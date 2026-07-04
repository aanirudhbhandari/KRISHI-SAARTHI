const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(
  endpoint: string,
  options?: RequestInit
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json();
}