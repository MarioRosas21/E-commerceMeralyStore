"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { api } from "@/services/api";
import { generateWhatsAppLink } from "@/utils/whatsapp";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  const { items, total, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
  });

async function handleSubmit(e: FormEvent) {
  e.preventDefault();

  if (items.length === 0) return;


  const whatsappTab = window.open("", "_blank");

  setLoading(true);

  try {
    await api("/orders", {
      method: "POST",
      body: JSON.stringify({
        customerName: form.customerName,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    const link = generateWhatsAppLink({
      items,
      total: total(),
      customerName: form.customerName,
    });

    sessionStorage.setItem("last-whatsapp-link", link);

    if (whatsappTab) {
      whatsappTab.location.href = link;
    } else {
      window.open(link, "_blank", "noopener,noreferrer");
    }

    clearCart();

    router.push("/products?pedido=ok");
  } catch (error) {
    whatsappTab?.close();

    alert(error instanceof Error ? error.message : "Error al generar pedido");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Finalizar pedido</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_430px]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">Datos del cliente</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block font-semibold">
                Nombre completo
              </label>
              <input
                required
                placeholder="Ej. Juan Pérez"
                className="w-full rounded-xl border p-4 outline-none transition focus:border-black"
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
              />
            </div>

            <button
              disabled={loading || items.length === 0}
              className="w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Generando pedido..." : "Enviar pedido por WhatsApp"}
            </button>
          </form>
        </section>

        <aside className="h-fit rounded-2xl border bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">Resumen del pedido</h2>

          <div className="space-y-5">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border bg-white">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    MXN ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 border-t pt-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                MXN ${total().toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span className="font-semibold">Por confirmar</span>
            </div>

            <div className="flex justify-between border-t pt-4 text-xl font-bold">
              <span>Total</span>
              <span>MXN ${total().toLocaleString()}</span>
            </div>
          </div>

          <p className="mt-6 rounded-xl bg-white p-4 text-sm text-gray-600">
            Al enviar tu pedido, se abrirá WhatsApp con el resumen listo para
            enviarse al vendedor.
          </p>
        </aside>
      </div>
    </main>
  );
}
