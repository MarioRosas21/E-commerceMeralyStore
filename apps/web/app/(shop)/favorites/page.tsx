"use client";

import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useFavoritesStore } from "@/store/favorites.store";
import { ProductCard } from "@/components/ProductCard";

export default function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.items);
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const addItem = useCartStore((state) => state.addItem);

  if (!hasHydrated) {
    return (
      <main className="ms-public-page min-h-screen px-4 py-10">
        <section className="mx-auto max-w-7xl">
          <p className="font-black text-[var(--text-secondary)]">
            Cargando favoritos...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="ms-public-page min-h-screen px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <section
          className="relative overflow-hidden rounded-[2rem] border border-[var(--public-border)] bg-[var(--public-soft)] px-8 py-12 shadow-xl md:px-16"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(249,244,255,0.94) 0%, rgba(249,244,255,0.65) 55%, rgba(249,244,255,0.15) 100%), url("/hero-meraly-1.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="max-w-xl">
            <h1 className="text-5xl font-black tracking-tight text-[#272142] md:text-6xl">
              Tus favoritos ♡
            </h1>

            <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
              Guarda aquí tus productos preferidos para comprarlos después.
            </p>
          </div>

          <div className="mt-8 inline-flex items-center gap-4 rounded-3xl bg-white/90 p-5 shadow-lg backdrop-blur">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--public-soft)] text-[var(--public-primary)]">
              <Heart size={32} />
            </div>

            <div>
              <p className="text-xl font-black">Tus productos guardados</p>
              <p className="font-bold text-[var(--public-primary)]">
                {favorites.length} productos en tu lista
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button className="ms-chip ms-chip-active flex items-center gap-2 px-5 py-3">
              <Sparkles size={18} />
              Todos
            </button>

            <button className="ms-chip flex items-center gap-2 px-5 py-3">
              Accesorios
            </button>

            <button className="ms-chip flex items-center gap-2 px-5 py-3">
              Bolsas
            </button>

            <button className="ms-chip flex items-center gap-2 px-5 py-3">
              Belleza
            </button>
          </div>

          <select className="ms-input px-5 py-3 font-bold text-[var(--text-secondary)]">
            <option>Más recientes</option>
            <option>Precio menor</option>
            <option>Precio mayor</option>
          </select>
        </section>

        {favorites.length === 0 ? (
          <section className="mt-8 rounded-[2rem] border border-[var(--public-border)] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--public-soft)] text-[var(--public-primary)]">
              <Heart size={38} />
            </div>

            <h2 className="mt-6 text-3xl font-black">
              Aún no tienes favoritos
            </h2>

            <p className="mx-auto mt-3 max-w-md text-[var(--text-secondary)]">
              Agrega productos a favoritos para encontrarlos fácilmente después.
            </p>

            <Link
              href="/products"
              className="ms-btn-primary mt-7 inline-flex px-7 py-4"
            >
              Ver productos
            </Link>
          </section>
        ) : (
          <section className="mt-5 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {favorites.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />

                <button
                  onClick={() => removeFavorite(product.id)}
                  className="absolute bottom-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--public-border)] bg-white text-[var(--text-secondary)] shadow-sm transition hover:text-red-600"
                  aria-label="Eliminar de favoritos"
                >
                  <Trash2 size={19} />
                </button>
              </div>
            ))}
          </section>
        )}

        <section className="mt-8 grid gap-4 rounded-3xl border border-[var(--public-border)] bg-[var(--public-soft-2)] p-6 md:grid-cols-4">
          <InfoBlock
            icon={<Heart size={30} />}
            title="Siempre a mano"
            description="Tus favoritos guardados para cuando los necesites."
          />

          <InfoBlock
            icon={<ShoppingBag size={30} />}
            title="Compra más fácil"
            description="Agrega favoritos al carrito con un clic."
          />

          <InfoBlock
            icon={<Sparkles size={30} />}
            title="No te lo pierdas"
            description="Vuelve cuando quieras y encuentra lo que amas."
          />

          <InfoBlock
            icon={<Heart size={30} />}
            title="Hechos para ti"
            description="Selecciona lo que refleja tu estilo."
          />
        </section>
      </section>
    </main>
  );
}

function InfoBlock({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[var(--public-primary)] shadow-sm">
        {icon}
      </div>

      <div>
        <p className="font-black text-[#272142]">{title}</p>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  );
}