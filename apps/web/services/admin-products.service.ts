const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
};

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  isActive?: boolean;
};

export type ProductStatusFilter = "all" | "active" | "inactive";

export type ProductsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminProductsResponse = {
  data: AdminProduct[];
  pagination: ProductsPagination;
};

type GetAdminProductsParams = {
  page?: number;
  limit?: number;
  status?: ProductStatusFilter;
  search?: string;
  token: string;
};

function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminProducts({
  page = 1,
  limit = 10,
  status = "all",
  search = "",
  token,
}: GetAdminProductsParams) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
  });

  if (search) {
    params.set("search", search);
  }

  const res = await fetch(`${API_URL}/products/admin?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener productos");
  }

  return res.json() as Promise<AdminProductsResponse>;
}

export async function getAdminProductById(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`);

  if (!res.ok) {
    throw new Error("Error al obtener producto");
  }

  return res.json() as Promise<AdminProduct>;
}

export async function createProduct(data: ProductFormData, token: string) {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || "Error al crear producto");
  }

  return result;
}

export async function updateProduct(
  id: string,
  data: Partial<ProductFormData>,
  token: string
) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.message || "Error al actualizar producto");
  }

  return result;
}

export async function deleteProduct(id: string, token: string) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Error al eliminar producto");
  }
}