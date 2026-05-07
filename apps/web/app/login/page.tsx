"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, Lock, Mail, ShoppingBag, Sparkles } from "lucide-react";
import { loginRequest } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest({
        email: form.email,
        password: form.password,
      });

      setAuth(
        data.token,
        data.user || {
          email: form.email,
          role: "admin",
        }
      );

      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8efff] p-4 md:p-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-[2.5rem] border border-[var(--public-border)] bg-white shadow-2xl lg:grid-cols-[1fr_0.95fr]">
        <div className="relative hidden overflow-hidden bg-[var(--public-soft)] px-10 py-12 lg:flex lg:flex-col lg:items-center lg:justify-center">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(248,239,255,0.5), rgba(248,239,255,0.95)), url("/login-decor.png")',
              backgroundSize: "cover",
              backgroundPosition: "left bottom",
            }}
          />

          <span className="absolute left-[38%] top-[17%] text-[var(--public-primary)] opacity-70">
            <Sparkles size={32} />
          </span>

          <span className="absolute bottom-[20%] right-[18%] text-[var(--public-primary)] opacity-60">
            <Sparkles size={30} />
          </span>

          <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
            <div className="relative h-40 w-[420px]">
              <Image
                src="/logo-meraly-horizontal.png"
                alt="Meraly Store"
                fill
                priority
                className="object-contain"
              />
            </div>

            <h1 className="mt-8 text-4xl font-black tracking-tight text-[#272142]">
              Bienvenida, administradora
            </h1>

            <p className="mt-5 max-w-md text-xl leading-8 text-[var(--text-secondary)]">
              Acceso exclusivo para gestionar tu tienda Meraly Store.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white px-5 py-10 md:px-10">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-[2rem] bg-white p-4 md:p-10"
          >
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="relative h-24 w-64">
                <Image
                  src="/logo-meraly-horizontal.png"
                  alt="Meraly Store"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-[var(--public-primary)]" />

              <h2 className="text-5xl font-black tracking-tight text-[#272142]">
                Iniciar sesión
              </h2>
            </div>

            <p className="mt-4 text-xl text-[var(--text-secondary)]">
              Acceso exclusivo para administradora.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
                {error}
              </div>
            )}

            <div className="mt-9 space-y-6">
              <div>
                <label className="mb-3 block font-black">Correo</label>

                <div className="flex items-center gap-4 rounded-2xl border border-[var(--public-border)] px-5 transition focus-within:border-[var(--public-primary)] focus-within:ring-4 focus-within:ring-purple-100">
                  <Mail size={23} className="text-[var(--public-primary)]" />

                  <input
                    required
                    type="email"
                    placeholder="admin@test.com"
                    className="w-full py-5 text-lg outline-none"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block font-black">Contraseña</label>

                <div className="flex items-center gap-4 rounded-2xl border border-[var(--public-border)] px-5 transition focus-within:border-[var(--public-primary)] focus-within:ring-4 focus-within:ring-purple-100">
                  <Lock size={23} className="text-[var(--public-primary)]" />

                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full py-5 text-lg outline-none"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />

                  <Eye size={23} className="text-[var(--text-muted)]" />
                </div>
              </div>



              <button
                disabled={loading}
                className="ms-btn-primary flex w-full items-center justify-center gap-4 py-5 text-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar al panel"}
                <ArrowRight size={24} />
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-[var(--public-border)]" />
                <Sparkles size={22} className="text-[var(--public-secondary)]" />
                <div className="h-px flex-1 bg-[var(--public-border)]" />
              </div>

              <Link
                href="/products"
                className="flex items-center justify-center gap-2 text-lg font-black text-[var(--public-primary)]"
              >
                <ShoppingBag size={22} />
                Ir a la tienda pública
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}