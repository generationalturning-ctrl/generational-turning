"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "./CartDrawer";

export function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();

  const links = [
    { href: "/", label: "Home" },
    { href: "/design", label: "Design Your Pen" },
    { href: "/gallery", label: "Gallery" },
    { href: "/inspiration", label: "Inspiration" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(10,10,10,0.95)",
          borderBottom: "1px solid #2a2a2a",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link
          href="/"
          className="font-serif text-xl text-white tracking-wide hover:text-gold transition-colors"
        >
          Generational Turning
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/70 hover:text-gold transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCartOpen(true)}
            className="relative text-white/70 hover:text-gold transition-colors"
            aria-label="Open cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-dark text-xs font-bold rounded-none w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white/70 hover:text-gold"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="fixed top-[65px] left-0 right-0 z-20 md:hidden"
          style={{
            background: "rgba(10,10,10,0.98)",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block px-6 py-4 text-white/70 hover:text-gold hover:bg-card transition-colors border-b border-card-border"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
