"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { Category } from "@/services/admin-categories.service";
import { ProductFormData } from "@/services/admin-products.service";
import { getSafeImageUrl } from "@/utils/image";
import Image from "next/image";

type Props = {
  categories: Category[];
  initialData?: Partial<ProductFormData>;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (data: ProductFormData) => void;
  onImageUpload: (file: File) => Promise<string>;
};

type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: string;
  categoryId: string;
  isActive: boolean;
};

function getInitialForm(initialData?: Partial<ProductFormData>): ProductFormValues {
  return {
    name: initialData?.name || "",
    description: initialData?.description || "",
    price:
      initialData?.price !== undefined && initialData?.price !== null
        ? String(initialData.price)
        : "",
    imageUrl: initialData?.imageUrl || "",
    stock:
      initialData?.stock !== undefined && initialData?.stock !== null
        ? String(initialData.stock)
        : "",
    categoryId: initialData?.categoryId || "",
    isActive: initialData?.isActive ?? true,
  };
}

export function ProductForm({
  categories,
  initialData,
  submitLabel,
  loading = false,
  onSubmit,
  onImageUpload,
}: Props) {
  const [form, setForm] = useState<ProductFormValues>(() =>
    getInitialForm(initialData)
  );

  const [imageUploading, setImageUploading] = useState(false);

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setImageUploading(true);

      const imageUrl = await onImageUpload(file);

      setForm((current) => ({
        ...current,
        imageUrl,
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al subir imagen");
    } finally {
      setImageUploading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.categoryId) {
      alert("Selecciona una categoría");
      return;
    }

    if (!form.imageUrl) {
      alert("Sube una imagen del producto");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (Number.isNaN(price) || price <= 0) {
      alert("El precio debe ser mayor a 0");
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      alert("El stock no puede ser negativo");
      return;
    }

    onSubmit({
      name: form.name,
      description: form.description,
      price,
      imageUrl: form.imageUrl,
      stock,
      categoryId: form.categoryId,
      isActive: form.isActive,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">Nombre</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border p-3 outline-none focus:border-black"
            placeholder="Ej. Moño rosa grande"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Precio</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full rounded-xl border p-3 outline-none focus:border-black"
            placeholder="Ej. 45"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Stock</label>
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full rounded-xl border p-3 outline-none focus:border-black"
            placeholder="Ej. 10"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Categoría</label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full rounded-xl border p-3 outline-none focus:border-black"
          >
            <option value="">Selecciona una categoría</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-semibold">Imagen del producto</label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-gray-50 p-6 text-center transition hover:bg-gray-100">
            <ImagePlus className="mb-3 text-gray-400" size={36} />

            <span className="font-bold">
              {imageUploading ? "Subiendo imagen..." : "Seleccionar imagen"}
            </span>

            <span className="mt-1 text-sm text-gray-500">
              Puedes subir una imagen desde computadora o celular.
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={imageUploading}
            />
          </label>

          {imageUploading && (
            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-500">
              <Loader2 size={18} className="animate-spin" />
              Subiendo imagen a Cloudinary...
            </div>
          )}

          {form.imageUrl && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-gray-600">
                Vista previa
              </p>

              <div className="relative h-40 w-40 overflow-hidden rounded-2xl border bg-gray-100">
                <Image
                  src={getSafeImageUrl(form.imageUrl)}
                  alt="Vista previa del producto"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-semibold">Descripción</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full rounded-xl border p-3 outline-none focus:border-black"
            placeholder="Descripción del producto"
          />
        </div>

        <label className="flex items-center gap-3 font-semibold">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm({ ...form, isActive: e.target.checked })
            }
          />
          Producto activo
        </label>
      </div>

      <button
        disabled={loading || imageUploading}
        className="mt-6 rounded-xl bg-black px-6 py-3 font-bold text-white disabled:bg-gray-400"
      >
        {loading ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}