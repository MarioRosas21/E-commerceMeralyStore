const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);

    console.error("API ERROR:", {
      status: res.status,
      error,
    });

    throw new Error(
      error?.message ||
        error?.errors?.[0]?.message ||
        `Error API: ${res.status}`
    );
  }

  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}