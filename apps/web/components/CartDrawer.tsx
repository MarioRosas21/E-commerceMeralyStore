"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    total,
    totalItems
  } = useCartStore();

  return (
    <>
      {isCartOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <h2 className="text-xl font-bold">
              Tu carrito ({totalItems()})
            </h2>

            <button
              onClick={closeCart}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-lg font-semibold">Tu carrito está vacío</p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-4 rounded-xl bg-black px-5 py-3 text-white"
                >
                  Ver productos
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-gray-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />

                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex flex-1 justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-tight">
                          {item.name}
                        </h3>

                        <div className="mt-3 inline-flex overflow-hidden rounded-lg border">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="border-x px-4 py-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <p className="whitespace-nowrap font-semibold">
                        MXN ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t px-6 py-5">
              <div className="mb-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>MXN ${total().toLocaleString()}</span>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="block rounded-xl bg-black py-4 text-center text-lg font-bold text-white transition hover:bg-gray-800"
              >
                Ingresar datos de envío
              </Link>

              <Link
                href="/products"
                onClick={closeCart}
                className="mt-4 block text-center font-semibold text-gray-600 hover:text-black"
              >
                Continuar comprando
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}