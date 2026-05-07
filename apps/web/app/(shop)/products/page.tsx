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
};

type ProductsPageProps = {
  searchParams?: Promise<{
    categoryId?: string;
    search?: string;
    pedido?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const showOrderSuccessModal = params?.pedido === "ok";
  const query = new URLSearchParams();

  if (params?.categoryId) {
    query.set("categoryId", params.categoryId);
  }

  if (params?.search) {
    query.set("search", params.search);
  }

  const productsPath = query.toString()
    ? `/products?${query.toString()}`
    : "/products";

  const [products, categories] = await Promise.all([
    api<Product[]>(productsPath),
    api<Category[]>("/categories"),
  ]);

  return (
    <main className="ms-public-page min-h-screen px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <HeroCarousel />

        <section id="categorias" className="mt-6">
          <h2 className="mb-3 text-lg font-black text-[#272142]">
            Compra por categoría
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-2">
            <Link
              href="/products"
              className={`ms-chip flex shrink-0 items-center gap-2 px-5 py-3 ${
                !params?.categoryId ? "ms-chip-active" : ""
              }`}
            >
              <Sparkles size={18} />
              Todo
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className={`ms-chip flex shrink-0 items-center gap-2 px-5 py-3 ${
                  params?.categoryId === category.id ? "ms-chip-active" : ""
                }`}
              >
                <CategoryIcon name={category.name} />
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section id="productos" className="mt-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[#272142]">
                {params?.search
                  ? `Resultados para "${params.search}"`
                  : "Nuestros productos"}
              </h2>

              <p className="mt-1 text-[var(--text-secondary)]">
                Productos seleccionados para complementar tu estilo.
              </p>
            </div>

            <Link
              href="/favoritos"
              className="hidden font-black text-[var(--public-primary)] hover:text-[var(--public-primary-hover)] sm:block"
            >
              Ver favoritos
            </Link>
          </div>

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
        </section>

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
