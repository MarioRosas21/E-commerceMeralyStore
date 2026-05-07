"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { useFavoritesStore } from "@/store/favorites.store";

export function Navbar() {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const totalItems = useCartStore((state) => state.totalItems());
  const openCart = useCartStore((state) => state.openCart);
  const cartHydrated = useCartStore((state) => state.hasHydrated);

  const totalFavorites = useFavoritesStore((state) => state.totalFavorites());
  const favoritesHydrated = useFavoritesStore((state) => state.hasHydrated);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const query = search.trim();

    if (!query) {
      router.push("/products");
      return;
    }

    router.push(`/products?search=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--public-border)] bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center gap-6 px-4">
        <Link href="/products" className="relative h-16 w-44 shrink-0">
          <Image
            src="/logo-meraly-horizontal.png"
            alt="Meraly Store"
            fill
            priority
            className="object-contain"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-black text-[var(--text-primary)] lg:flex">
          <Link className="text-[var(--public-primary)]" href="/products">
            Inicio
          </Link>

          <Link className="hover:text-[var(--public-primary)]" href="/products">
            Productos
          </Link>

          <a className="hover:text-[var(--public-primary)]" href="#categorias">
            Categorías
          </a>

          <Link className="hover:text-[var(--public-primary)]" href="/favorites">
            Favoritos
          </Link>
        </nav>

        <form
          onSubmit={handleSearch}
          className="hidden w-[320px] items-center gap-2 rounded-2xl border border-[var(--public-border)] bg-white px-4 lg:flex"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full py-3 outline-none"
          />

          <button type="submit" aria-label="Buscar">
            <Search size={22} />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/favorites"
            className="relative rounded-full p-3 transition hover:bg-[var(--public-soft)]"
            aria-label="Favoritos"
          >
            <Heart size={29} />

            {favoritesHydrated && totalFavorites > 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--public-primary)] text-xs font-black text-white">
                {totalFavorites}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-3 transition hover:bg-[var(--public-soft)]"
            aria-label="Abrir carrito"
          >
            <ShoppingBag size={30} />

            {cartHydrated && totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--public-pink-strong)] text-xs font-black text-white">
                {totalItems}
              </span>
            )}
          </button>

          <Link
            href="/login"
            className="hidden rounded-full p-3 transition hover:bg-[var(--public-soft)] md:block"
            aria-label="Mi cuenta"
          >
            <UserRound size={28} />
          </Link>
        </div>
      </div>
    </header>
  );
}