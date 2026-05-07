import Link from "next/link";
import { Package, ShoppingBag, Tags } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--admin-primary)]">
          Panel administrativo
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Dashboard
        </h1>

        <p className="mt-3 text-lg text-[var(--text-secondary)]">
          Bienvenida al panel administrativo de Meraly Store.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <DashboardCard
          href="/admin/products"
          title="Productos"
          description="Gestionar inventario y catálogo"
          icon={<Package size={30} />}
        />

        <DashboardCard
          href="/admin/categories"
          title="Categorías"
          description="Organizar productos por tipo"
          icon={<Tags size={30} />}
        />

        <DashboardCard
          href="/admin/orders"
          title="Pedidos"
          description="Ver y gestionar pedidos realizados"
          icon={<ShoppingBag size={30} />}
        />
      </section>

      <section className="ms-admin-card mt-8 p-6">
        <h2 className="text-2xl font-black">Resumen general</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric label="Productos" value="Inventario" helper="Administra catálogo" />
          <Metric label="Categorías" value="Organización" helper="Ordena productos" />
          <Metric label="Pedidos" value="Ventas" helper="Controla estados" />
          <Metric label="WhatsApp" value="Contacto" helper="Pedidos directos" />
        </div>
      </section>
    </div>
  );
}

function DashboardCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="ms-admin-card group p-6 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)] transition group-hover:bg-[var(--admin-primary)] group-hover:text-white">
        {icon}
      </div>

      <h2 className="text-2xl font-black">{title}</h2>

      <p className="mt-3 leading-7 text-[var(--text-secondary)]">
        {description}
      </p>

      <p className="mt-6 font-black text-[var(--admin-primary)]">
        Ir a {title.toLowerCase()} →
      </p>
    </Link>
  );
}

function Metric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-soft)] p-5">
      <p className="text-sm font-bold text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">
        {helper}
      </p>
    </div>
  );
}