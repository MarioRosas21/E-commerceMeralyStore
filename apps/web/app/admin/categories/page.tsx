"use client";

import { FormEvent, useState } from "react";
import {
  CheckCircle,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import {
  activateCategory,
  Category,
  CategoryStatusFilter,
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from "@/services/admin-categories.service";
import { useAuthStore } from "@/store/auth.store";

export default function AdminCategoriesPage() {
  const token = useAuthStore((state) => state.token);

  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<CategoryStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  async function loadCategories(
    nextStatus = status,
    nextSearch = search
  ) {
    if (!token) return;

    try {
      setError("");
      setLoading(true);

      const data = await getAdminCategories({
        token,
        status: nextStatus,
        search: nextSearch,
      });

      setCategories(data);
      setStatus(nextStatus);
      setSearch(nextSearch);
      setHasLoaded(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar categorías"
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setCategoryToEdit(null);
    setIsFormModalOpen(true);
  }

  function openEditModal(category: Category) {
    setCategoryToEdit(category);
    setIsFormModalOpen(true);
  }

  async function handleSaveCategory(name: string) {
    if (!token) return;

    try {
      setError("");
      setLoading(true);

      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, { name }, token);
      } else {
        await createCategory({ name }, token);
      }

      setIsFormModalOpen(false);
      setCategoryToEdit(null);

      await loadCategories(status, search);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar categoría"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivateCategory() {
    if (!token || !categoryToDelete) return;

    try {
      setError("");
      setLoading(true);

      await deleteCategory(categoryToDelete.id, token);

      setCategoryToDelete(null);

      await loadCategories(status, search);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al desactivar categoría"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleActivateCategory(category: Category) {
    if (!token) return;

    try {
      setError("");
      setLoading(true);

      await activateCategory(category.id, token);

      await loadCategories(status, search);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al activar categoría"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Categorías</h1>
          <p className="mt-1 text-gray-500">
            Administra las categorías del catálogo.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-bold text-white"
        >
          <Plus size={20} />
          Nueva categoría
        </button>
      </div>

      <section className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar categoría..."
            className="rounded-xl border p-3 outline-none focus:border-black"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadCategories("all", search)}
              className={`rounded-xl px-4 py-3 font-bold ${
                status === "all"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700"
              }`}
            >
              Todas
            </button>

            <button
              onClick={() => loadCategories("active", search)}
              className={`rounded-xl px-4 py-3 font-bold ${
                status === "active"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700"
              }`}
            >
              Activas
            </button>

            <button
              onClick={() => loadCategories("inactive", search)}
              className={`rounded-xl px-4 py-3 font-bold ${
                status === "inactive"
                  ? "bg-black text-white"
                  : "border bg-white text-gray-700"
              }`}
            >
              Inactivas
            </button>
          </div>

          <button
            onClick={() => loadCategories(status, search)}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 font-bold disabled:opacity-60"
          >
            <RefreshCw size={20} />
            {loading ? "Cargando..." : "Cargar"}
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
            Carga las categorías para administrarlas.
          </p>

          <button
            onClick={() => loadCategories("all", "")}
            className="mt-5 rounded-xl bg-black px-6 py-3 font-bold text-white"
          >
            Cargar categorías
          </button>
        </section>
      ) : (
        <section className="rounded-2xl border bg-white shadow-sm">
          {loading ? (
            <p className="p-6 font-semibold text-gray-500">
              Cargando categorías...
            </p>
          ) : categories.length === 0 ? (
            <p className="p-6 font-semibold text-gray-500">
              No hay categorías para mostrar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Productos asociados</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="p-4">
                        <p className="font-bold">{category.name}</p>
                        <p className="text-sm text-gray-500">
                          ID: {category.id}
                        </p>
                      </td>

                      <td className="p-4">
                        {category._count?.products ?? 0}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${
                            category.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {category.isActive && <CheckCircle size={15} />}
                          {category.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {!category.isActive && (
                            <button
                              onClick={() => handleActivateCategory(category)}
                              className="rounded-lg border p-2 text-green-700 hover:bg-green-50"
                              title="Activar categoría"
                            >
                              <RotateCcw size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(category)}
                            className="rounded-lg border p-2 hover:bg-gray-50"
                            title="Editar categoría"
                          >
                            <Pencil size={18} />
                          </button>

                          {category.isActive && (
                            <button
                              onClick={() => setCategoryToDelete(category)}
                              className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                              title="Desactivar categoría"
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
          )}
        </section>
      )}

      {isFormModalOpen && (
        <CategoryFormModal
          category={categoryToEdit}
          loading={loading}
          onClose={() => {
            setIsFormModalOpen(false);
            setCategoryToEdit(null);
          }}
          onSave={handleSaveCategory}
        />
      )}

      {categoryToDelete && (
        <ConfirmDeactivateModal
          category={categoryToDelete}
          loading={loading}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={handleDeactivateCategory}
        />
      )}
    </div>
  );
}

function CategoryFormModal({
  category,
  loading,
  onClose,
  onSave,
}: {
  category: Category | null;
  loading: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(category?.name || "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (name.trim().length < 2) {
      return;
    }

    onSave(name.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {category ? "Editar categoría" : "Nueva categoría"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mt-6">
          <label className="mb-2 block font-semibold">
            Nombre de la categoría
          </label>

          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Labiales"
            className="w-full rounded-xl border p-3 outline-none focus:border-black"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-5 py-3 font-bold"
          >
            Cancelar
          </button>

          <button
            disabled={loading}
            className="rounded-xl bg-black px-5 py-3 font-bold text-white disabled:bg-gray-400"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDeactivateModal({
  category,
  loading,
  onClose,
  onConfirm,
}: {
  category: Category;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-bold">Desactivar categoría</h2>

        <p className="mt-3 text-gray-600">
          ¿Seguro que deseas desactivar{" "}
          <span className="font-bold text-black">{category.name}</span>?
        </p>

        <p className="mt-3 rounded-xl bg-yellow-50 p-4 text-sm font-medium text-yellow-800">
          La categoría no se eliminará de la base de datos. Podrás reactivarla
          después desde el filtro de categorías inactivas.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-3 font-bold"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? "Desactivando..." : "Desactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}