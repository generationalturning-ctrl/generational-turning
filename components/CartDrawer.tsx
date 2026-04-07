"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, removeItem, updateQuantity, total } = useCart();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-card z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ borderLeft: "1px solid #2a2a2a" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="text-xl font-serif text-gold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 && (
            <p className="text-white/50 text-sm text-center mt-12">
              Your cart is empty.
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.cartId}
              className="bg-dark rounded-none p-4 space-y-2"
              style={{ border: "1px solid #2a2a2a" }}
            >
              {item.type === "custom" ? (
                <>
                  <p className="font-medium text-white">{item.penStyleName}</p>
                  <p className="text-sm text-white/60">
                    {item.metalColour.charAt(0).toUpperCase() +
                      item.metalColour.slice(1)}{" "}
                    • {item.blankName}
                  </p>
                  {item.addOns.length > 0 && (
                    <p className="text-sm text-white/60">
                      + {item.addOns.map((a) => a.name).join(", ")}
                    </p>
                  )}
                  <p className="text-gold/60 text-xs">
                    ${item.totalPrice.toFixed(2)} each
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.cartId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none"
                        style={{ border: "1px solid #3a3a3a" }}
                      >
                        −
                      </button>
                      <span className="text-white text-sm w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.cartId, item.quantity + 1)
                        }
                        className="w-7 h-7 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none"
                        style={{ border: "1px solid #3a3a3a" }}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-gold font-semibold">
                      ${(item.totalPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-sm text-white/60">One-of-a-Kind Pen</p>
                  <p className="text-gold font-semibold">
                    ${item.price.toFixed(2)}
                  </p>
                </>
              )}
              <button
                onClick={() => removeItem(item.cartId)}
                className="text-xs text-white/40 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-card-border space-y-4">
            <div className="flex justify-between text-lg">
              <span className="text-white/70">Total</span>
              <span className="text-gold font-semibold">
                ${total.toFixed(2)} CAD
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full text-center bg-gold text-dark font-semibold py-3 rounded-none hover:bg-gold-light transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
