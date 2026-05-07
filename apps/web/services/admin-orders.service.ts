const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "delivered"
  | "cancelled";

export type OrderStatusFilter = OrderStatus | "all";

export type AdminOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string | number;
  product: {
    id: string;
    name: string;
    description: string;
    price: string | number;
    imageUrl: string;
    stock: number;
    isActive: boolean;
  };
};

export type AdminOrder = {
  id: string;
  customerName: string;
  total: string | number;
  status: OrderStatus;
  createdAt: string;
  items: AdminOrderItem[];
};

export type OrdersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminOrdersResponse = {
  data: AdminOrder[];
  pagination: OrdersPagination;
};

function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminOrders({
  token,
  page = 1,
  limit = 10,
  status = "all",
  search = "",
}: {
  token: string;
  page?: number;
  limit?: number;
  status?: OrderStatusFilter;
  search?: string;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
  });

  if (search) {
    params.set("search", search);
  }

  const res = await fetch(`${API_URL}/orders?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Error al obtener pedidos");
  }

  return data as AdminOrdersResponse;
}

export async function getAdminOrderById(id: string, token: string) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Error al obtener pedido");
  }

  return data as AdminOrder;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  token: string
) {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      status,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Error al actualizar estado del pedido");
  }

  return data as AdminOrder;
}