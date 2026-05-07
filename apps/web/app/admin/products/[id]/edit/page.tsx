"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  AdminProduct,
  getAdminProductById,
  ProductFormData,
  updateProduct,
} from "@/services/admin-products.service";
import {
  Category,
  getCategories,
} from "@/services/admin-categories.service";
import { uploadProductImage } from "@/services/admin-upload.service";
import { useAuthStore } from "@/store/auth.store";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      const [productData, categoriesData] = await Promise.all([
        getAdminProductById(id),
        getCategories(),
      ]);

      setProduct(productData);
      setCategories(categoriesData);
    } catch {
      alert("Error al cargar datos del producto");
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
      await updateProduct(id, data, token);
      router.push("/admin/products");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Error al actualizar producto"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!product || categories.length === 0) {
    return (
      <section className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-gray-600">
          Carga los datos del producto para editarlo.
        </p>

        <button
          onClick={loadData}
          className="mt-5 rounded-xl bg-black px-6 py-3 font-bold text-white"
        >
          Cargar datos
        </button>
      </section>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Editar producto</h1>
      <p className="mt-1 text-gray-500">{product.name}</p>

      <div className="mt-6">
        <ProductForm
          categories={categories}
          initialData={{
            name: product.name,
            description: product.description,
            price: Number(product.price),
            imageUrl: product.imageUrl,
            stock: product.stock,
            categoryId: product.categoryId,
            isActive: product.isActive,
          }}
          submitLabel="Guardar cambios"
          loading={loading}
          onSubmit={handleSubmit}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
}