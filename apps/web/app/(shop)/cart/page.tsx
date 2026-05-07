"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    total
  } = useCartStore();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Carrito</h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center">
          <p className="text-xl font-semibold">Tu carrito está vacío</p>
          <Link
            href="/products"
            className="mt-5 inline-block rounded-xl bg-black px-6 py-3 text-white"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="rounded-2xl border bg-white p-6">
            <div className="hidden grid-cols-[1fr_160px_120px_160px] border-b pb-4 font-bold md:grid">
              <span>Producto</span>
              <span>Precio</span>
              <span>Cantidad</span>
              <span>Subtotal</span>
            </div>

            <div className="divide-y">
              {items.map(item => (
                <div
                  key={item.id}
                  className="grid gap-4 py-6 md:grid-cols-[1fr_160px_120px_160px] md:items-center"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-full p-1 hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>

                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-gray-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <h2 className="font-semibold text-sky-500">
                      {item.name}
                    </h2>
                  </div>

                  <p>MXN ${item.price.toLocaleString()}</p>

                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e =>
                      updateQuantity(item.id, Number(e.target.value))
                    }
                    className="w-20 rounded-lg border p-2"
                  />

                  <p className="font-semibold">
                    MXN ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border bg-white p-8">
            <h2 className="mb-8 text-2xl font-bold">Total</h2>

            <div className="space-y-6 text-lg">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Subtotal</span>
                <span className="font-bold">
                  MXN ${total().toLocaleString()}
                </span>
              </div>

              <div>
                <p className="font-semibold text-gray-600">Envío</p>
                <p className="mt-2 text-gray-600">
                  Los costes de envío se calculan al finalizar la compra.
                </p>
              </div>

              <div className="flex justify-between border-t pt-6">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  MXN ${total().toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-8 block rounded-xl bg-black py-4 text-center text-lg font-bold text-white transition hover:bg-gray-800"
            >
              Ingresar datos de envío
            </Link>

            <Link
              href="/products"
              className="mt-4 block text-center font-semibold text-gray-600 hover:text-black"
            >
              Continuar comprando
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}