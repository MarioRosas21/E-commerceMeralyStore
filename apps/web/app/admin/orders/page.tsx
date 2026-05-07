"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  AdminOrder,
  getAdminOrders,
  OrderStatus,
  OrderStatusFilter,
  OrdersPagination,
  updateOrderStatus,
} from "@/services/admin-orders.service";
import { useAuthStore } from "@/store/auth.store";
import { getSafeImageUrl } from "@/utils/image";

const PAGE_LIMIT = 10;

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const token = useAuthStore((state) => state.token);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<OrdersPagination>({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [status, setStatus] = useState<OrderStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");

  async function loadOrders(
    nextPage = pagination.page,
    nextStatus = status,
    nextSearch = search
  ) {
    if (!token) return;

    try {
      setError("");
      setLoading(true);

      const result = await getAdminOrders({
        token,
        page: nextPage,
        limit: PAGE_LIMIT,
        status: nextStatus,
        search: nextSearch,
      });

      setOrders(result.data);
      setPagination(result.pagination);
      setStatus(nextStatus);
      setSearch(nextSearch);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(order: AdminOrder, nextStatus: OrderStatus) {
    if (!token) return;

    try {
      setError("");
      setLoading(true);

      const updatedOrder = await updateOrderStatus(
        order.id,
        nextStatus,
        token
      );

      setSelectedOrder(updatedOrder);

      await loadOrders(pagination.page, status, search);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar estado del pedido"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="mt-1 text-gray-500">
            Consulta pedidos realizados y actualiza su estado.
          </p>
        </div>

        <button
          onClick={() => loadOrders(1, status, search)}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-bold text-white disabled:bg-gray-400"
        >
          <RefreshCw size={20} />
          {loading ? "Cargando..." : "Cargar pedidos"}
        </button>
      </div>

      <section className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div className="flex items-center gap-3 rounded-xl border px-3">
            <Search size={20} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente..."
              className="w-full py-3 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusFilterButton
              label="Todos"
              active={status === "all"}
              onClick={() => loadOrders(1, "all", search)}
            />

            <StatusFilterButton
              label="Pendientes"
              active={status === "pending"}
              onClick={() => loadOrders(1, "pending", search)}
            />

            <StatusFilterButton
              label="Confirmados"
              active={status === "confirmed"}
              onClick={() => loadOrders(1, "confirmed", search)}
            />

            <StatusFilterButton
              label="Entregados"
              active={status === "delivered"}
              onClick={() => loadOrders(1, "delivered", search)}
            />

            <StatusFilterButton
              label="Cancelados"
              active={status === "cancelled"}
              onClick={() => loadOrders(1, "cancelled", search)}
            />
          </div>

          <button
            onClick={() => loadOrders(1, status, search)}
            disabled={loading}
            className="rounded-xl border bg-white px-5 py-3 font-bold disabled:opacity-60"
          >
            Buscar
          </button>
        </div>
      </section>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </div>
      )}

      {!hasLoaded ? (
        <section className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-600">
            Carga los pedidos para revisar las ventas realizadas.
          </p>

          <button
            onClick={() => loadOrders(1, "all", "")}
            className="mt-5 rounded-xl bg-black px-6 py-3 font-bold text-white"
          >
            Cargar pedidos
          </button>
        </section>
      ) : (
        <section className="rounded-2xl border bg-white shadow-sm">
          {loading ? (
            <p className="p-6 font-semibold text-gray-500">
              Cargando pedidos...
            </p>
          ) : orders.length === 0 ? (
            <p className="p-6 font-semibold text-gray-500">
              No hay pedidos para mostrar.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="p-4">Pedido</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Productos</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="p-4">
                          <p className="font-bold">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-500">{order.id}</p>
                        </td>

                        <td className="p-4 font-semibold">
                          {order.customerName}
                        </td>

                        <td className="p-4">
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          artículos
                        </td>

                        <td className="p-4 font-bold">
                          MXN ${Number(order.total).toLocaleString()}
                        </td>

                        <td className="p-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="p-4">
                          <OrderStatusBadge status={order.status} />
                        </td>

                        <td className="p-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="flex items-center gap-2 rounded-xl border px-4 py-2 font-bold hover:bg-gray-50"
                            >
                              <Eye size={18} />
                              Ver detalle
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-semibold text-gray-500">
                  Página {pagination.page} de {pagination.totalPages || 1} ·{" "}
                  {pagination.total} pedidos
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => loadOrders(pagination.page - 1)}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </button>

                  <button
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => loadOrders(pagination.page + 1)}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Siguiente
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {selectedOrder && (
        <OrderDetailModal
          key={selectedOrder.id + selectedOrder.status}
          order={selectedOrder}
          loading={loading}
          onClose={() => setSelectedOrder(null)}
          onChangeStatus={(nextStatus) =>
            handleStatusChange(selectedOrder, nextStatus)
          }
        />
      )}
    </div>
  );
}

function StatusFilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-3 font-bold ${
        active ? "bg-black text-white" : "border bg-white text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-bold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function OrderDetailModal({
  order,
  loading,
  onClose,
  onChangeStatus,
}: {
  order: AdminOrder;
  loading: boolean;
  onClose: () => void;
  onChangeStatus: (status: OrderStatus) => void;
}) {
  const [nextStatus, setNextStatus] = useState<OrderStatus>(order.status);

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  function handleSaveStatus() {
    if (nextStatus === order.status) return;
    onChangeStatus(nextStatus);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Pedido #{order.id.slice(0, 8)}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{order.id}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-500">Cliente</p>
            <p className="mt-1 font-bold">{order.customerName}</p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-500">Fecha</p>
            <p className="mt-1 font-bold">{formatDate(order.createdAt)}</p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-500">Estado</p>
            <div className="mt-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <section className="mt-6">
          <h3 className="text-lg font-bold">Productos del pedido</h3>

          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border p-4"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-gray-100">
                  <Image
                    src={getSafeImageUrl(item.product.imageUrl)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-bold">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    Cantidad: {item.quantity} · Precio unitario: MXN $
                    {Number(item.price).toLocaleString()}
                  </p>
                </div>

                <p className="font-bold">
                  MXN $
                  {(Number(item.price) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-gray-50 p-5">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Artículos</span>
            <span className="font-bold">{totalItems}</span>
          </div>

          <div className="mt-3 flex justify-between border-t pt-3 text-xl">
            <span className="font-bold">Total</span>
            <span className="font-bold">
              MXN ${Number(order.total).toLocaleString()}
            </span>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border p-5">
          <h3 className="text-lg font-bold">Cambiar estado</h3>

          <p className="mt-2 text-sm text-gray-500">
            Si marcas un pedido como cancelado, el stock se restaurará
            automáticamente.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
              className="rounded-xl border p-3 outline-none focus:border-black"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <button
              onClick={handleSaveStatus}
              disabled={loading || nextStatus === order.status}
              className="rounded-xl bg-black px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Guardando..." : "Guardar estado"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}