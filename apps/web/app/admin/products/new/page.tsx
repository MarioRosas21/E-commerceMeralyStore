"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  createProduct,
  ProductFormData,
} from "@/services/admin-products.service";
import {
  Category,
  getCategories,
} from "@/services/admin-categories.service";
import { uploadProductImage } from "@/services/admin-upload.service";
import { useAuthStore } from "@/store/auth.store";

export default function NewProductPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      alert("Error al cargar categorías");
    }
  }

  async function handleImageUpload(file: File) {
    if (!token) {
      throw new Error("Sesión inválida");
    }

    return uploadProductImage(file, token);
  }

  async function handleSubmit(data: ProductFormData) {
    if (!token) return;

    try {
      setLoading(true);
      await createProduct(data, token);
      router.push("/admin/products");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al crear producto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Nuevo producto</h1>
      <p className="mt-1 text-gray-500">
        Agrega un nuevo producto al catálogo.
      </p>

      {categories.length === 0 ? (
        <section className="mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-gray-600">
            Primero carga las categorías para crear el producto.
          </p>

          <button
            onClick={loadCategories}
            className="mt-5 rounded-xl bg-black px-6 py-3 font-bold text-white"
          >
            Cargar categorías
          </button>
        </section>
      ) : (
        <div className="mt-6">
          <ProductForm
            categories={categories}
            submitLabel="Crear producto"
            loading={loading}
            onSubmit={handleSubmit}
            onImageUpload={handleImageUpload}
          />
        </div>
      )}
    </div>
  );
}