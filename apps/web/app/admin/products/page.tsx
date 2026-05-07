"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  AdminProduct,
  deleteProduct,
  getAdminProducts,
  ProductStatusFilter,
  ProductsPagination,
  updateProduct,
} from "@/services/admin-products.service";
import { useAuthStore } from "@/store/auth.store";
import { getSafeImageUrl } from "@/utils/image";

const PAGE_LIMIT = 10;

export default function AdminProductsPage() {
  const token = useAuthStore((state) => state.token);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [status, setStatus] = useState<ProductStatusFilter>("all");
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState<ProductsPagination>({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [productToDelete, setProductToDelete] =
    useState<AdminProduct | null>(null);

  async function loadProducts(
    nextPage = pagination.page,
    nextStatus = status,
    nextSearch = search
  ) {
    if (!token) return;

    try {
      setLoading(true);

      const result = await getAdminProducts({
        page: nextPage,
        limit: PAGE_LIMIT,
        status: nextStatus,
        search: nextSearch,
        token,
      });

      setProducts(result.data);
      setPagination(result.pagination);
      setStatus(nextStatus);
      setSearch(nextSearch);
      setHasLoaded(true);
    } catch {
      alert("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!token || !productToDelete) return;

    try {
      await deleteProduct(productToDelete.id, token);
      setProductToDelete(null);
      await loadProducts(pagination.page);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Error al desactivar producto"
      );
    }
  }

  async function handleActivate(product: AdminProduct) {
    if (!token) return;

    try {
      await updateProduct(product.id, { isActive: true }, token);
      await loadProducts(pagination.page);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Error al activar producto"
      );
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="mt-1 text-gray-500">
            Administra inventario, estado y disponibilidad.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-bold text-white"
        >
          <Plus size={20} />
          Nuevo producto
        </Link>
      </div>

      <section className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="rounded-xl border p-3 outline-none focus:border-black"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadProducts(1, "all", search)}
              className={`rounded-xl px-4 py-3 font-bold ${
                status === "all"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700"
              }`}
            >
              Todos
            </button>

            <button
              onClick={() => loadProducts(1, "active", search)}
              className={`rounded-xl px-4 py-3 font-bold ${
                status === "active"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700"
              }`}
            >
              Activos
            </button>

            <button
              onClick={() => loadProducts(1, "inactive", search)}
              className={`rounded-xl px-4 py-3 font-bold ${
                status === "inactive"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700"
              }`}
            >
              Inactivos
            </button>
          </div>

          <button
            onClick={() => loadProducts(1, status, search)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 font-bold disabled:opacity-60"
          >
            <RefreshCw size={20} />
            {loading ? "Cargando..." : "Cargar"}
          </button>
        </div>
      </section>

      {!hasLoaded ? (
        <section className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-600">
            Carga los productos para administrar el inventario.
          </p>

          <button
            onClick={() => loadProducts(1)}
            className="mt-5 rounded-xl bg-black px-6 py-3 font-bold text-white"
          >
            Cargar productos
          </button>
        </section>
      ) : (
        <section className="rounded-2xl border bg-white shadow-sm">
          {loading ? (
            <p className="p-6 font-semibold text-gray-500">
              Cargando productos...
            </p>
          ) : products.length === 0 ? (
            <p className="p-6 font-semibold text-gray-500">
              No hay productos para mostrar.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="p-4">Producto</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Precio</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-14 overflow-hidden rounded-xl border bg-gray-100">
                              <Image
                                src={getSafeImageUrl(product.imageUrl)}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div>
                              <p className="font-bold">{product.name}</p>
                              <p className="line-clamp-1 text-sm text-gray-500">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {product.category?.name || "Sin categoría"}
                        </td>

                        <td className="p-4 font-semibold">
                          MXN ${Number(product.price).toLocaleString()}
                        </td>

                        <td className="p-4">
                          <span
                            className={
                              product.stock <= 0
                                ? "font-bold text-red-600"
                                : "font-semibold"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              product.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            {!product.isActive && (
                              <button
                                onClick={() => handleActivate(product)}
                                className="rounded-lg border p-2 text-green-700 hover:bg-green-50"
                                title="Activar producto"
                              >
                                <RotateCcw size={18} />
                              </button>
                            )}

                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="rounded-lg border p-2 hover:bg-gray-50"
                              title="Editar producto"
                            >
                              <Pencil size={18} />
                            </Link>

                            {product.isActive && (
                              <button
                                onClick={() => setProductToDelete(product)}
                                className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                                title="Desactivar producto"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-semibold text-gray-500">
                  Mostrando página {pagination.page} de{" "}
                  {pagination.totalPages || 1} · {pagination.total} productos
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => loadProducts(pagination.page - 1)}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </button>

                  <button
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => loadProducts(pagination.page + 1)}
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

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Desactivar producto</h2>

            <p className="mt-3 text-gray-600">
              ¿Seguro que deseas desactivar{" "}
              <span className="font-bold text-black">
                {productToDelete.name}
              </span>
              ? No se eliminará de la base de datos y podrás activarlo después.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="rounded-xl border px-5 py-3 font-bold"
              >
                Cancelar
              </button>

              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}