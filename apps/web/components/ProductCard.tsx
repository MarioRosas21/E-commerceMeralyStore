"use client";

import Image from "next/image";
import { Check, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { useFavoritesStore } from "@/store/favorites.store";
import { getSafeImageUrl } from "@/utils/image";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
  stock: number;
  isActive: boolean;
};

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const getItemQuantity = useCartStore((state) => state.getItemQuantity);

  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const favoritesHydrated = useFavoritesStore((state) => state.hasHydrated);

  const [added, setAdded] = useState(false);

  const quantityInCart = getItemQuantity(product.id);

  const availableStock = product.isActive
    ? product.stock - quantityInCart
    : 0;

  const isOutOfStock = !product.isActive || availableStock <= 0;

  function handleAdd() {
    if (isOutOfStock) return;

    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      stock: product.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  function handleFavorite() {
    toggleFavorite({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      stock: product.stock,
      isActive: product.isActive,
    });
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--public-border)] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[1.35/1] overflow-hidden bg-[var(--public-soft)]">
        <Image
          src={getSafeImageUrl(product.imageUrl)}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className={`object-cover transition duration-300 group-hover:scale-105 ${
            isOutOfStock ? "grayscale" : ""
          }`}
        />

        <button
          type="button"
          onClick={handleFavorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[var(--public-primary)] shadow-md transition hover:scale-105"
          aria-label="Agregar a favoritos"
        >
          <Heart
            size={20}
            className={
              favoritesHydrated && isFavorite
                ? "fill-[var(--public-primary)]"
                : ""
            }
          />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h2 className="line-clamp-1 text-[15px] font-black text-[var(--text-primary)]">
          {product.name}
        </h2>

        <p className="mt-1 line-clamp-2 min-h-[38px] text-[13px] leading-5 text-[var(--text-secondary)]">
          {product.description}
        </p>

        <p className="mt-2 text-lg font-black text-[var(--public-primary)]">
          MXN ${Number(product.price).toLocaleString()}
        </p>

        <p
          className={`mt-1 flex items-center gap-1.5 text-xs font-bold ${
            isOutOfStock ? "text-red-600" : "text-[var(--text-secondary)]"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOutOfStock ? "bg-red-500" : "bg-green-500"
            }`}
          />
          {isOutOfStock
            ? "Sin stock disponible"
            : `Stock: ${availableStock} disponibles`}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleFavorite}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--public-border)] text-[var(--text-secondary)] transition hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
            aria-label="Favorito"
          >
            <Heart
              size={20}
              className={
                favoritesHydrated && isFavorite
                  ? "fill-[var(--public-primary)] text-[var(--public-primary)]"
                  : ""
              }
            />
          </button>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 ${
              added
                ? "bg-green-600"
                : "bg-gradient-to-r from-[var(--public-primary)] to-[var(--public-primary-hover)] hover:opacity-95"
            }`}
          >
            {added ? (
              <>
                <Check size={17} />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart size={17} />
                {isOutOfStock ? "Agotado" : "Agregar"}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}