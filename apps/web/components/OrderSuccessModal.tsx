"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, MessageCircle, ShoppingBag, X } from "lucide-react";

type Props = {
  show: boolean;
};

export function OrderSuccessModal({ show }: Props) {
  const router = useRouter();

  if (!show) return null;

  function closeModal() {
    router.replace("/products");
  }

  function openWhatsAppAgain() {
    const link = sessionStorage.getItem("last-whatsapp-link");

    if (!link) {
      alert("No encontramos el enlace de WhatsApp de este pedido.");
      return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[var(--public-border)] bg-white p-7 text-center shadow-2xl"
      >
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-secondary)] transition hover:bg-[var(--public-soft)]"
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--public-soft)] text-[var(--public-primary)]">
          <CheckCircle2 size={44} />
        </div>

        <h2 className="mt-6 text-3xl font-black text-[#272142]">
          ¡Gracias por tu pedido!
        </h2>

        <p className="mt-3 leading-7 text-[var(--text-secondary)]">
          Tu pedido fue registrado correctamente. Abrimos WhatsApp en una nueva
          pestaña para que puedas enviarlo a Meraly Store.
        </p>

        <div className="mt-7 grid gap-3">
          <button
            onClick={closeModal}
            className="ms-btn-primary flex items-center justify-center gap-2 px-5 py-4"
          >
            <ShoppingBag size={20} />
            Seguir comprando
          </button>

          <button
            onClick={openWhatsAppAgain}
            className="rounded-xl border border-[var(--public-border)] bg-white px-5 py-4 font-black text-[var(--public-primary)] transition hover:bg-[var(--public-soft)]"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <MessageCircle size={20} />
              Abrir WhatsApp nuevamente
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}