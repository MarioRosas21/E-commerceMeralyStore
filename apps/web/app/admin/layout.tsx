"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  Tags,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, token, router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (!hasHydrated) {
    return (
      <main className="ms-admin-page flex min-h-screen items-center justify-center">
        <p className="font-black text-[var(--text-secondary)]">
          Cargando panel...
        </p>
      </main>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="ms-admin-page min-h-screen">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-[var(--admin-border)] bg-white/90 p-6 backdrop-blur-xl lg:block">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--admin-border)] bg-[var(--admin-primary-soft)]">
            <Image
              src="/logo-meraly-V.jpeg"
              alt="Meraly Store"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div>
            <h1 className="text-xl font-black leading-tight">Meraly Store</h1>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--admin-primary)]">
              Admin
            </p>
          </div>
        </Link>

        <nav className="mt-10 space-y-2">
          <AdminLink href="/admin" icon={<LayoutDashboard size={20} />}>
            Dashboard
          </AdminLink>

          <AdminLink href="/admin/products" icon={<Package size={20} />}>
            Productos
          </AdminLink>

          <AdminLink href="/admin/categories" icon={<Tags size={20} />}>
            Categorías
          </AdminLink>

          <AdminLink href="/admin/orders" icon={<ShoppingBag size={20} />}>
            Pedidos
          </AdminLink>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 rounded-2xl bg-[var(--text-primary)] py-4 font-black text-white transition hover:bg-[var(--admin-primary)]"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-24 items-center justify-between border-b border-[var(--admin-border)] bg-white/85 px-4 backdrop-blur-xl lg:px-8">
          <div>
            <p className="text-sm font-bold text-[var(--text-secondary)]">
              Administración
            </p>
            <h2 className="text-2xl font-black">Meraly Store</h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-white px-5 py-3 font-black text-[var(--text-primary)] transition hover:bg-[var(--admin-soft)] md:flex"
            >
              <Store size={18} />
              Ver tienda
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-[var(--text-primary)] px-5 py-3 font-black text-white lg:hidden"
            >
              Salir
            </button>
          </div>
        </header>

        <section className="p-4 lg:p-8">{children}</section>
      </main>
    </div>
  );
}

function AdminLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isActive =
    pathname === href ||
    (href !== "/admin" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-black ${
        isActive ? "ms-admin-link-active" : "ms-admin-link"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}