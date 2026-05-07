const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadProductImage(file: File, token: string) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/uploads/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Error al subir imagen");
  }

  return data.imageUrl as string;
}