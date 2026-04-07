"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";

type StripImage = {
  id: string;
  label: string;
  img: Record<string, unknown>;
};

const CARD_WIDTH = 192; // px (w-48)
const GAP = 12; // px (gap-3)
const SCROLL_BY = 3; // cards per arrow click

export function PhotoStrip({ images }: { images: StripImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateArrows, { passive: true });
    return () => el?.removeEventListener("scroll", updateArrows);
  }, []);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "right"
        ? (CARD_WIDTH + GAP) * SCROLL_BY
        : -(CARD_WIDTH + GAP) * SCROLL_BY,
      behavior: "smooth",
    });
  }

  if (!images.length) return null;

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-none transition-all";
  const arrowStyle = (enabled: boolean) => ({
    background: "rgba(10,10,10,0.85)",
    border: "1px solid #2a2a2a",
    cursor: enabled ? "pointer" : "default",
    opacity: enabled ? 1 : 0.25,
    backdropFilter: "blur(4px)",
  });

  return (
    <section className="py-12 relative">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        disabled={!canLeft}
        className={`${arrowClass} left-3`}
        style={arrowStyle(canLeft)}
        aria-label="Scroll left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 px-14 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((item) => (
          <div
            key={item.id}
            className="relative flex-none w-48 h-48 rounded-none overflow-hidden"
            style={{ border: "1px solid #2a2a2a" }}
          >
            <Image
              src={urlFor(item.img).width(384).quality(90).auto("format").url()}
              alt={item.label}
              fill
              quality={90}
              sizes="192px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        disabled={!canRight}
        className={`${arrowClass} right-3`}
        style={arrowStyle(canRight)}
        aria-label="Scroll right"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
