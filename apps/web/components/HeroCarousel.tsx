"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const slides = [
  {
    title: "Estilo que",
    script: "te representa",
    description: "Descubre piezas únicas que realzan tu esencia cada día.",
    cta: "Comprar ahora",
    image: "/hero-meraly-1.png",
  },
  {
    title: "Detalles que",
    script: "te hacen brillar",
    description: "Accesorios y belleza seleccionados con amor para ti.",
    cta: "Ver novedades",
    image: "/hero-meraly-2.png",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const slide = slides[current];

  function previousSlide() {
    setCurrent((value) => (value === 0 ? slides.length - 1 : value - 1));
  }

  function nextSlide() {
    setCurrent((value) => (value === slides.length - 1 ? 0 : value + 1));
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[var(--public-border)] bg-[var(--public-soft)] shadow-xl">
      <div
        className="min-h-[340px] bg-cover bg-center px-8 py-12 md:min-h-[390px] md:px-16"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(249,244,255,0.94) 0%, rgba(249,244,255,0.72) 42%, rgba(249,244,255,0.08) 100%), url("${slide.image}")`,
        }}
      >
        <button
          type="button"
          onClick={previousSlide}
          className="absolute left-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--public-primary)] shadow-lg transition hover:scale-105 md:flex"
          aria-label="Slide anterior"
        >
          <ChevronLeft size={28} />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--public-primary)] shadow-lg transition hover:scale-105 md:flex"
          aria-label="Siguiente slide"
        >
          <ChevronRight size={28} />
        </button>

        <div className="max-w-xl">
          <h1 className="text-5xl font-black leading-tight tracking-tight text-[#272142] md:text-6xl">
            {slide.title}
          </h1>

          <p className="mt-1 text-5xl font-light italic leading-tight text-[var(--public-primary)] md:text-6xl">
            {slide.script} ♡
          </p>

          <p className="mt-6 max-w-md text-lg leading-8 text-[var(--text-secondary)]">
            {slide.description}
          </p>

          <a
            href="#productos"
            className="ms-btn-primary mt-7 inline-flex items-center gap-3 px-7 py-4"
          >
            {slide.cta}
            <ChevronRight size={19} />
          </a>
        </div>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              className={`h-3 w-3 rounded-full border border-white ${
                index === current
                  ? "bg-[var(--public-primary)]"
                  : "bg-white/70"
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}