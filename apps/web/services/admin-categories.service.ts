const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Category = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  _count?: {
    products: number;
  };
};

export type CategoryStatusFilter = "all" | "active" | "inactive";

export type CategoryFormData = {
  name: string;
};

function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Categorías públicas activas.
 * Se usa en ProductForm.
 */
export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`);

  if (!res.ok) {
    throw new Error("Error al obtener categorías");
  }

  return res.json() as Promise<Category[]>;
}

/**
 * Categorías para admin.
 * Devuelve activas e inactivas.
 */
export async function getAdminCategories({
  token,
  status = "all",
  search = "",
}: {
  token: string;
  status?: CategoryStatusFilter;
  search?: string;
}) {
  const params = new URLSearchParams({
    status,
  });

  if (search) {
    params.set("search", search);
  }

  const res = await fetch(`${API_URL}/categories/admin?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener categorías");
  }

  return res.json() as Promise<Category[]>;
}

export async function createCategory(data: CategoryFormData, token: string) {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || "Error al crear categoría");
  }

  return result as Category;
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>,
  token: string
) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || "Error al actualizar categoría");
  }

  return result as Category;
}

export async function deleteCategory(id: string, token: string) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || "Error al desactivar categoría");
  }

  return result as Category;
}

export async function activateCategory(id: string, token: string) {
  const res = await fetch(`${API_URL}/categories/${id}/activate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || "Error al activar categoría");
  }

  return result as Category;
}