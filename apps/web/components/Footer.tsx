import Image from "next/image";
import Link from "next/link";
import { Camera, Music2 } from "lucide-react";
import { MessageCircle } from "lucide-react";


export function Footer() {
  //const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#";
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "#";
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL || "#";
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;

  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}`
    : "#";

  return (
    <footer className="mt-5 border-t border-[var(--public-border)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <section>
          <div className="relative h-24 w-64">
            <Image
              src="/logo-meraly-horizontal.png"
              alt="Meraly Store"
              fill
              className="object-contain object-left"
            />
          </div>

          <p className="mt-4 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
            Accesorios, belleza y detalles seleccionados con amor para resaltar
            tu estilo y hacerte brillar.
          </p>
        </section>

        <section>
          <h3 className="font-black text-[var(--text-primary)]">Tienda</h3>

          <div className="mt-4 space-y-3 text-sm font-semibold text-[var(--text-secondary)]">
            <Link className="block hover:text-[var(--public-primary)]" href="/products">
              Productos
            </Link>
            <Link className="block hover:text-[var(--public-primary)]" href="/favorites">
              Favoritos
            </Link>
            <Link className="block hover:text-[var(--public-primary)]" href="/cart">
              Carrito
            </Link>
          </div>
        </section>

        <section>
          <h3 className="font-black text-[var(--text-primary)]">Síguenos</h3>

          <div className="mt-4 flex flex-wrap gap-3">
            {/* <SocialLink href={instagramUrl} label="Instagram">
              <Camera size={20} />
            </SocialLink> */}

            <SocialLink href={facebookUrl} label="Facebook">
              <span className="text-lg font-black">f</span>
            </SocialLink>

            <SocialLink href={tiktokUrl} label="TikTok">
              <Music2 size={20} />
            </SocialLink>

            <SocialLink href={whatsappUrl} label="WhatsApp">
              <MessageCircle size={20} />
            </SocialLink>
          </div>
        </section>
      </div>

      <div className="border-t border-[var(--public-border)] py-5 text-center text-sm font-semibold text-[var(--text-secondary)]">
        © {new Date().getFullYear()} Meraly Store. Todos los derechos reservados.
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href === "#" ? undefined : "_blank"}
      rel={href === "#" ? undefined : "noreferrer"}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--public-border)] bg-white text-[var(--public-primary)] shadow-sm transition hover:-translate-y-1 hover:bg-[var(--public-primary)] hover:text-white"
    >
      {children}
    </a>
  );
}