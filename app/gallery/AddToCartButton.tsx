"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type GalleryItem = {
  _id: string;
  name: string;
  price: number;
  images?: unknown[];
};

export function AddToCartButton({ item }: { item: GalleryItem }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      cartId: crypto.randomUUID(),
      type: "gallery",
      galleryItemId: item._id,
      name: item.name,
      price: item.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <button
      onClick={handleAdd}
      className="px-4 py-2 rounded-none text-sm font-semibold transition-colors bg-gold text-dark hover:bg-gold-light"
    >
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
