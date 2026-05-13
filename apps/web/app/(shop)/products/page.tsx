import Link from "next/link";
import {
  BadgePlus,
  BowArrow,
  Brush,
  CircleDot,
  Gem,
  PenLine,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { api } from "@/services/api";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { OrderSuccessModal } from "@/components/OrderSuccessModal";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Productos | Meraly Store",
  description: "Catálogo de productos disponibles en Meraly Store",
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductsResponse = {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ✅ searchParams en Next.js 15 puede ser undefined — tipar correctamente
type SearchParams = {
  categoria?: string;
  search?: string;
  pedido?: string;
  page?: string;
  limit?: string;
};

type ProductsPageProps = {
  searchParams?: Promise<SearchParams>;
};

const LIMIT_OPTIONS = [15, 25];
const DEFAULT_LIMIT = 15;

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params: SearchParams = (await searchParams) ?? {};

  const showOrderSuccessModal = params.pedido === "ok";

  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = LIMIT_OPTIONS.includes(parseInt(params.limit ?? "", 10))
    ? parseInt(params.limit!, 10)
    : DEFAULT_LIMIT;

  const query = new URLSearchParams();
  if (params.categoria) query.set("categoria", params.categoria);
  if (params.search) query.set("search", params.search);
  query.set("page", String(currentPage));
  query.set("limit", String(limit));

  const [raw, categories] = await Promise.all([
    api<ProductsResponse | Product[]>(`/products?${query.toString()}`),
    api<Category[]>("/categories"),
  ]);

  const products: Product[] = Array.isArray(raw) ? raw : (raw.data ?? []);
  const total: number = Array.isArray(raw) ? raw.length : (raw.total ?? 0);
  const totalPages: number = Array.isArray(raw) ? 1 : (raw.totalPages ?? 1);

  // Helper para construir URLs conservando filtros
  function buildUrl(overrides: { page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params.categoria) q.set("categoria", params.categoria);
    if (params.search) q.set("search", params.search);
    q.set("page", String(overrides.page ?? currentPage));
    q.set("limit", String(overrides.limit ?? limit));
    return `/products?${q.toString()}`;
  }

  return (
    <main className="ms-public-page min-h-screen px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <HeroCarousel />

        {/* Categorías */}
        <section id="categorias" className="mt-6">
          <h2 className="mb-3 text-lg font-black text-[#272142]">
            Compra por categoría
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Link
              href={`/products?limit=${limit}`}
              className={`ms-chip flex shrink-0 items-center gap-2 px-5 py-3 ${
                !params.categoria ? "ms-chip-active" : ""
              }`}
            >
              <Sparkles size={18} />
              Todo
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?categoria=${category.slug}&limit=${limit}`}
                className={`ms-chip flex shrink-0 items-center gap-2 px-5 py-3 ${
                  params.categoria === category.id ? "ms-chip-active" : ""
                }`}
              >
                <CategoryIcon name={category.name} />
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Productos */}
        <section id="productos" className="mt-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[#272142]">
                {params.search
                  ? `Resultados para "${params.search}"`
                  : "Nuestros productos"}
              </h2>
              <p className="mt-1 text-[var(--text-secondary)]">
                Productos seleccionados para complementar tu estilo.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Selector artículos por página */}
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-sm text-[var(--text-secondary)]">
                  Mostrar:
                </span>
                {LIMIT_OPTIONS.map((opt) => (
                  <Link
                    key={opt}
                    href={buildUrl({ limit: opt, page: 1 })}
                    className={`rounded-full px-3 py-1 text-sm font-bold transition-colors ${
                      limit === opt
                        ? "bg-[var(--public-primary)] text-white"
                        : "border border-[var(--public-border)] text-[var(--text-secondary)] hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
                    }`}
                  >
                    {opt}
                  </Link>
                ))}
              </div>

              <Link
                href="/favoritos"
                className="hidden font-black text-[var(--public-primary)] hover:text-[var(--public-primary-hover)] sm:block"
              >
                Ver favoritos
              </Link>
            </div>
          </div>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="rounded-3xl border border-[var(--public-border)] bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-black">No encontramos productos.</p>
              <p className="mt-2 text-[var(--text-secondary)]">
                Intenta con otra categoría o búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Paginación — solo aparece si hay más de una página */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Anterior */}
                {currentPage > 1 ? (
                  <Link
                    href={buildUrl({ page: currentPage - 1 })}
                    className="rounded-full border border-[var(--public-border)] px-4 py-2 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
                  >
                    ← Anterior
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-full border border-[var(--public-border)] px-4 py-2 text-sm font-bold opacity-40">
                    ← Anterior
                  </span>
                )}

                {/* Números */}
                <div className="flex gap-1">
                  {buildPageNumbers(currentPage, totalPages).map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="flex h-9 w-6 items-center justify-center text-sm text-[var(--text-secondary)]"
                      >
                        …
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={buildUrl({ page: p as number })}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                          currentPage === p
                            ? "bg-[var(--public-primary)] text-white"
                            : "border border-[var(--public-border)] text-[var(--text-secondary)] hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
                        }`}
                      >
                        {p}
                      </Link>
                    ),
                  )}
                </div>

                {/* Siguiente */}
                {currentPage < totalPages ? (
                  <Link
                    href={buildUrl({ page: currentPage + 1 })}
                    className="rounded-full border border-[var(--public-border)] px-4 py-2 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
                  >
                    Siguiente →
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-full border border-[var(--public-border)] px-4 py-2 text-sm font-bold opacity-40">
                    Siguiente →
                  </span>
                )}
              </div>

              {/* Info resultados */}
              <p className="text-sm text-[var(--text-secondary)]">
                Mostrando {(currentPage - 1) * limit + 1}–
                {Math.min(currentPage * limit, total)} de {total} productos
              </p>
            </div>
          )}
        </section>

        {/* Beneficios */}
        <section className="mt-8 grid gap-4 rounded-3xl border border-[var(--public-border)] bg-[var(--public-soft-2)] p-6 md:grid-cols-4">
          <Benefit
            icon={<ShoppingBag size={30} />}
            title="Envíos rápidos"
            description="Pedidos directos por WhatsApp"
          />
          <Benefit
            icon={<Sparkles size={30} />}
            title="Compra segura"
            description="Atención personalizada"
          />
          <Benefit
            icon={<BadgePlus size={30} />}
            title="Calidad garantizada"
            description="Productos seleccionados"
          />
          <Benefit
            icon={<Gem size={30} />}
            title="Hechos para ti"
            description="Detalles que inspiran"
          />
        </section>
      </section>

      <OrderSuccessModal show={showOrderSuccessModal} />
    </main>
  );
}

// Función separada para generar los números de página con ellipsis
function buildPageNumbers(current: number, total: number): (number | "...")[] {
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === total || Math.abs(p - current) <= 1,
  );

  return pages.reduce<(number | "...")[]>((acc, p, idx, arr) => {
    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
    acc.push(p);
    return acc;
  }, []);
}

function CategoryIcon({ name }: { name: string }) {
  const normalized = name.toLowerCase();
  if (normalized.includes("moño")) return <BowArrow size={18} />;
  if (normalized.includes("pinza")) return <PenLine size={18} />;
  if (normalized.includes("accesorio")) return <Gem size={18} />;
  if (normalized.includes("base")) return <CircleDot size={18} />;
  if (normalized.includes("blush")) return <CircleDot size={18} />;
  if (normalized.includes("iluminador")) return <Sparkles size={18} />;
  if (normalized.includes("delineador")) return <PenLine size={18} />;
  if (normalized.includes("bolsa")) return <ShoppingBag size={18} />;
  if (normalized.includes("novedad")) return <BadgePlus size={18} />;
  return <Brush size={18} />;
}

function Benefit({
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
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[var(--public-primary)] shadow-sm">
        {icon}
      </div>
      <div>
        <p className="font-black text-[#272142]">{title}</p>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );
}
