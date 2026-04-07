"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

export type CartAddOn = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type CartItem =
  | {
      cartId: string;
      type: "custom";
      quantity: number;
      penStyleId: string;
      penStyleName: string;
      metalColour: string;
      blankId: string;
      blankName: string;
      blankPrice: number;
      addOns: CartAddOn[];
      basePrice: number;
      totalPrice: number; // price for ONE pen
    }
  | {
      cartId: string;
      type: "gallery";
      galleryItemId: string;
      name: string;
      price: number;
      imageUrl?: string;
    };

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; cartId: string }
  | { type: "UPDATE_QUANTITY"; cartId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM":
      return { items: [...state.items, action.item] };
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.cartId !== action.cartId) };
    case "UPDATE_QUANTITY":
      return {
        items: state.items.map((i) =>
          i.cartId === action.cartId && i.type === "custom"
            ? { ...i, quantity: Math.max(1, action.quantity) }
            : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      return { items: action.items };
    default:
      return state;
  }
}

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gt-cart");
      if (saved) dispatch({ type: "HYDRATE", items: JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("gt-cart", JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce((sum, item) => {
    if (item.type === "custom") return sum + item.totalPrice * item.quantity;
    return sum + item.price;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem: (item) => dispatch({ type: "ADD_ITEM", item }),
        removeItem: (cartId) => dispatch({ type: "REMOVE_ITEM", cartId }),
        updateQuantity: (cartId, quantity) =>
          dispatch({ type: "UPDATE_QUANTITY", cartId, quantity }),
        clearCart: () => dispatch({ type: "CLEAR" }),
        total,
        count: state.items.reduce(
          (n, i) => n + (i.type === "custom" ? i.quantity : 1),
          0
        ),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
