const API_URL = process.env.NEXT_PUBLIC_API_URL;

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user?: {
    id: string;
    email: string;
    role: "admin";
  };
};

export async function loginRequest(
  payload: LoginPayload
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Error al iniciar sesión");
  }

  return data;
}