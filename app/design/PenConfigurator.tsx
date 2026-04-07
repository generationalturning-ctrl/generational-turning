"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity";
import { useCart } from "@/context/CartContext";

type MetalColour = {
  _key?: string;
  colour: string;
  images?: unknown[];
  image?: unknown;
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
};

type PenStyle = {
  _id: string;
  name: string;
  penType: "fountain" | "ballpoint";
  basePrice: number;
  description?: string;
  previewImage?: unknown;
  metalColours: MetalColour[];
  inStock: boolean;
};

type Blank = {
  _id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  image?: unknown;
};

type AddOn = {
  _id: string;
  name: string;
  addOnType: "fountainInk" | "ballpointInk" | "box";
  price: number;
  inStock: boolean;
  image?: unknown;
  compatiblePenStyleIds?: string[];
};

type SelectedAddOn = { addOn: AddOn; quantity: number };

const CATEGORY_LABELS: Record<string, string> = {
  acrylic: "Acrylic",
  stabilizedBurl: "Stabilized Burl",
  wood: "Wood",
};

const COLOUR_LABELS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  gunmetal: "Gun Metal",
  satin: "Satin",
};

export function PenConfigurator({
  penStyles,
  blanks,
  addOns,
  penTypeImages,
}: {
  penStyles: PenStyle[];
  blanks: Blank[];
  addOns: AddOn[];
  penTypeImages?: { fountain?: unknown; ballpoint?: unknown };
}) {
  const { addItem } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [penType, setPenType] = useState<"fountain" | "ballpoint" | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<PenStyle | null>(null);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);
  const [selectedBlank, setSelectedBlank] = useState<Blank | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
  const [added, setAdded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lightboxImage, setLightboxImage] = useState<any | null>(null);

  useEffect(() => {
    if (!lightboxImage) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxImage(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxImage]);


  const filteredStyles = penStyles.filter(
    (s) => s.penType === penType && s.inStock
  );

  const filteredAddOns = addOns.filter((a) => {
    if (!a.inStock) return false;
    // Type filter
    if (a.addOnType === "box") return true;
    if (penType === "fountain" && a.addOnType !== "fountainInk") return false;
    if (penType === "ballpoint" && a.addOnType !== "ballpointInk") return false;
    // Pen style compatibility: if no restrictions set, show for all; otherwise check
    if (
      a.compatiblePenStyleIds &&
      a.compatiblePenStyleIds.length > 0 &&
      selectedStyle &&
      !a.compatiblePenStyleIds.includes(selectedStyle._id)
    ) return false;
    return true;
  });

  const blanksByCategory = blanks
    .filter((b) => b.inStock)
    .reduce<Record<string, Blank[]>>((acc, b) => {
      const cat = b.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(b);
      return acc;
    }, {});

  const totalPrice =
    (selectedStyle?.basePrice ?? 0) +
    (selectedBlank?.price ?? 0) +
    selectedAddOns.reduce((s, { addOn, quantity }) => s + addOn.price * quantity, 0);

  function setAddOnQty(addOn: AddOn, qty: number) {
    setSelectedAddOns((prev) => {
      if (qty <= 0) return prev.filter((a) => a.addOn._id !== addOn._id);
      const existing = prev.find((a) => a.addOn._id === addOn._id);
      if (existing) return prev.map((a) => a.addOn._id === addOn._id ? { ...a, quantity: qty } : a);
      // Box is exclusive — swap out any existing box
      if (addOn.addOnType === "box") {
        const withoutBox = prev.filter((a) => a.addOn.addOnType !== "box");
        return [...withoutBox, { addOn, quantity: qty }];
      }
      return [...prev, { addOn, quantity: qty }];
    });
  }

  function getAddOnQty(id: string) {
    return selectedAddOns.find((a) => a.addOn._id === id)?.quantity ?? 0;
  }

  function handleAddToCart() {
    if (!selectedStyle || !selectedColour || !selectedBlank) return;
    addItem({
      cartId: crypto.randomUUID(),
      type: "custom",
      quantity: 1,
      penStyleId: selectedStyle._id,
      penStyleName: selectedStyle.name,
      metalColour: selectedColour,
      blankId: selectedBlank._id,
      blankName: selectedBlank.name,
      blankPrice: selectedBlank.price,
      addOns: selectedAddOns.map(({ addOn, quantity }) => ({
        id: addOn._id,
        name: addOn.name,
        price: addOn.price,
        quantity,
      })),
      basePrice: selectedStyle.basePrice,
      totalPrice,
    });
    setAdded(true);
  }

  // Progress bar
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div>
      {/* Progress */}
      <div className="mb-10">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span className={step >= 1 ? "text-gold" : ""}>1. Pen Type</span>
          <span className={step >= 2 ? "text-gold" : ""}>2. Style</span>
          <span className={step >= 3 ? "text-gold" : ""}>3. Configure</span>
        </div>
        <div
          className="h-px w-full"
          style={{ background: "#2a2a2a" }}
        >
          <div
            className="h-px bg-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1: Pen Type */}
      {step === 1 && (
        <div>
          <h2 className="font-serif text-gold text-2xl mb-8 text-center">
            1. Choose Pen Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {(["ballpoint", "fountain"] as const).map((type) => {
              const img = penTypeImages?.[type];
              return (
                <button
                  key={type}
                  onClick={() => {
                    setPenType(type);
                    setSelectedStyle(null);
                    setSelectedColour(null);
                    setSelectedBlank(null);
                    setSelectedAddOns([]);
                    setStep(2);
                  }}
                  className="group rounded-none overflow-hidden text-center transition-all hover:scale-[1.02]"
                  style={{ border: "1px solid #2a2a2a", background: "#141414" }}
                >
                  <div className="aspect-[4/3] relative bg-dark flex items-center justify-center">
                    {img ? (
                      <Image
                        src={urlFor(img).width(480).height(360).url()}
                        alt={type === "fountain" ? "Fountain Pen" : "Ballpoint Pen"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 240px"
                      />
                    ) : (
                      <span className="text-white/20 text-6xl">✒</span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-white font-medium capitalize">{type}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Pen Style */}
      {step === 2 && (
        <div>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setStep(1)}
              className="text-white/40 hover:text-gold text-sm transition-colors"
            >
              ← Back
            </button>
            <h2 className="font-serif text-gold text-2xl">
              2. Choose{" "}
              {penType === "fountain" ? "Fountain" : "Ballpoint"} Pen Style
            </h2>
          </div>
          {filteredStyles.length === 0 ? (
            <p className="text-white/40 text-center py-12">
              No styles available at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredStyles.map((style) => (
                <button
                  key={style._id}
                  onClick={() => {
                    setSelectedStyle(style);
                    setSelectedColour(null);
                    setSelectedBlank(null);
                    setSelectedAddOns([]);
                    setStep(3);
                  }}
                  className="group rounded-none overflow-hidden text-left transition-all hover:scale-[1.02]"
                  style={{ border: "1px solid #2a2a2a", background: "#141414" }}
                >
                  <div className="aspect-[4/3] relative bg-dark overflow-hidden">
                    {style.previewImage ? (
                      <Image
                        src={urlFor(style.previewImage).width(800).quality(90).auto("format").url()}
                        alt={style.name}
                        fill
                        quality={90}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-white/10 text-5xl">✒</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-white font-medium">{style.name}</p>
                    <p className="text-gold text-sm mt-1">
                      from ${style.basePrice.toFixed(2)} CAD
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Configure */}
      {step === 3 && selectedStyle && (
        <div>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setStep(2)}
              className="text-white/40 hover:text-gold text-sm transition-colors"
            >
              ← Back
            </button>
            <h2 className="font-serif text-gold text-2xl">
              3. Configure Your {selectedStyle.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {/* Metal Colour */}
              <div>
                <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4">
                  Hardware Colour
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedStyle.metalColours.map((mc) => (
                    <button
                      key={mc.colour}
                      onClick={() => setSelectedColour(mc.colour)}
                      className={`rounded-none overflow-hidden text-center transition-all ${
                        selectedColour === mc.colour
                          ? "ring-2 ring-gold scale-[1.02]"
                          : "hover:scale-[1.01]"
                      }`}
                      style={{
                        border:
                          selectedColour === mc.colour
                            ? "1px solid #c9a84c"
                            : "1px solid #2a2a2a",
                        background: "#141414",
                      }}
                    >
                      <div className="aspect-[4/3] relative bg-dark overflow-hidden">
                        {(mc.images?.[0] ?? mc.image) ? (
                          <div
                            className="absolute"
                            style={{
                              inset: (mc.imageZoom ?? 0) < 0
                                ? `${Math.abs(mc.imageZoom ?? 0) * 3}%`
                                : "0",
                              transform: (mc.imageZoom ?? 0) > 0
                                ? `scale(${1 + (mc.imageZoom ?? 0) * 0.03})`
                                : "none",
                              transformOrigin: "center",
                            }}
                          >
                          <Image
                            src={urlFor(mc.images?.[0] ?? mc.image).width(600).quality(90).auto("format").url()}
                            alt={COLOUR_LABELS[mc.colour] ?? mc.colour}
                            fill
                            quality={90}
                            sizes="(max-width: 640px) 50vw, 33vw"
                            className="object-cover"
                            style={{
                              objectPosition: `calc(50% + ${mc.imageOffsetX ?? 0}%) calc(50% + ${mc.imageOffsetY ?? 0}%)`,
                            }}
                          />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div
                              className="w-8 h-8 rounded-none"
                              style={{
                                background:
                                  mc.colour === "gold"
                                    ? "#c9a84c"
                                    : mc.colour === "silver"
                                    ? "#c0c0c0"
                                    : "#4a4a4a",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <p className="py-2 text-sm text-white">
                        {COLOUR_LABELS[mc.colour] ?? mc.colour}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Extra images for selected colour (e.g. calligraphy nibs) */}
                {selectedColour && (() => {
                  const mc = selectedStyle.metalColours.find(c => c.colour === selectedColour);
                  if (!mc?.images || mc.images.length <= 1) return null;
                  return (
                    <div className="mt-4">
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                        More views — click to enlarge
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        {mc.images.slice(1).map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setLightboxImage(img)}
                            className="relative w-24 h-24 rounded-none overflow-hidden hover:ring-2 hover:ring-gold transition-all"
                            style={{ border: "1px solid #2a2a2a" }}
                          >
                            <Image
                              src={urlFor(img).width(200).quality(90).auto("format").url()}
                              alt={`${COLOUR_LABELS[mc.colour]} view ${i + 2}`}
                              fill
                              quality={90}
                              sizes="96px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Blank Selection */}
              <div>
                <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-4">
                  Blank Material
                </h3>
                {Object.entries(blanksByCategory).map(([cat, items]) => (
                  <div key={cat} className="mb-6">
                    <p className="text-gold/60 text-xs uppercase tracking-wider mb-3">
                      {CATEGORY_LABELS[cat] ?? cat}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {items.map((blank) => (
                        <button
                          key={blank._id}
                          onClick={() => setSelectedBlank(blank)}
                          className={`rounded-none overflow-hidden text-left transition-all ${
                            selectedBlank?._id === blank._id
                              ? "ring-2 ring-gold scale-[1.02]"
                              : "hover:scale-[1.01]"
                          }`}
                          style={{
                            border:
                              selectedBlank?._id === blank._id
                                ? "1px solid #c9a84c"
                                : "1px solid #2a2a2a",
                            background: "#141414",
                          }}
                        >
                          <div className="aspect-square relative bg-dark overflow-hidden">
                            {blank.image ? (
                              <Image
                                src={urlFor(blank.image).width(400).quality(90).auto("format").url()}
                                alt={blank.name}
                                fill
                                quality={90}
                                sizes="(max-width: 640px) 50vw, 25vw"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <span className="text-white/10 text-3xl">
                                  ▭
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-white text-xs font-medium leading-tight">
                              {blank.name}
                            </p>
                            <p className="text-gold text-xs mt-0.5">
                              ${blank.price.toFixed(2)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add-ons */}
              {filteredAddOns.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                    Add-ons (Optional)
                  </h3>

                  {/* Ink section */}
                  {filteredAddOns.some((a) => a.addOnType !== "box") && (
                    <div>
                      <p className="text-gold/60 text-xs uppercase tracking-wider mb-1">
                        {penType === "fountain" ? "Fountain Pen Ink" : "Ballpoint Ink"}
                      </p>
                      <p className="text-white/30 text-xs mb-3">
                        Add ink refills — $2.00 each. Select as many colours as you’d like.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredAddOns
                          .filter((a) => a.addOnType !== "box")
                          .map((addOn) => {
                            const selected = getAddOnQty(addOn._id) > 0;
                            return (
                              <button
                                key={addOn._id}
                                onClick={() => setAddOnQty(addOn, selected ? 0 : 1)}
                                className={`rounded-none overflow-hidden text-left transition-all ${
                                  selected ? "ring-2 ring-gold scale-[1.02]" : "hover:scale-[1.01]"
                                }`}
                                style={{
                                  border: selected ? "1px solid #c9a84c" : "1px solid #2a2a2a",
                                  background: "#141414",
                                }}
                              >
                                <div className="aspect-square relative bg-dark overflow-hidden">
                                  {addOn.image ? (
                                    <Image
                                      src={urlFor(addOn.image).width(400).quality(90).auto("format").url()}
                                      alt={addOn.name}
                                      fill
                                      quality={90}
                                      sizes="(max-width: 640px) 50vw, 25vw"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <span className="text-white/10 text-3xl">◈</span>
                                    </div>
                                  )}
                                </div>
                                <div className="p-2">
                                  <p className="text-white text-xs font-medium leading-tight">{addOn.name}</p>
                                  <p className="text-gold text-xs mt-0.5">${addOn.price.toFixed(2)}</p>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Boxes section */}
                  {filteredAddOns.some((a) => a.addOnType === "box") && (
                    <div>
                      <p className="text-gold/60 text-xs uppercase tracking-wider mb-3">
                        Presentation Box
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredAddOns
                          .filter((a) => a.addOnType === "box")
                          .map((addOn) => {
                            const selected = getAddOnQty(addOn._id) > 0;
                            return (
                              <button
                                key={addOn._id}
                                onClick={() => setAddOnQty(addOn, selected ? 0 : 1)}
                                className={`rounded-none overflow-hidden text-left transition-all ${selected ? "ring-2 ring-gold scale-[1.02]" : "hover:scale-[1.01]"}`}
                                style={{
                                  border: selected ? "1px solid #c9a84c" : "1px solid #2a2a2a",
                                  background: "#141414",
                                }}
                              >
                                <div className="aspect-square relative bg-dark overflow-hidden">
                                  {addOn.image ? (
                                    <Image
                                      src={urlFor(addOn.image).width(400).quality(90).auto("format").url()}
                                      alt={addOn.name}
                                      fill
                                      quality={90}
                                      sizes="(max-width: 640px) 50vw, 25vw"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <span className="text-white/10 text-3xl">◈</span>
                                    </div>
                                  )}
                                </div>
                                <div className="p-2">
                                  <p className="text-white text-xs font-medium leading-tight">{addOn.name}</p>
                                  <p className="text-gold text-xs mt-0.5">${addOn.price.toFixed(2)}</p>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 self-start">
              <div
                className="rounded-none p-6 space-y-4"
                style={{ background: "#141414", border: "1px solid #2a2a2a" }}
              >
                <h3 className="font-serif text-gold text-lg">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">{selectedStyle.name}</span>
                    <span className="text-white">
                      ${selectedStyle.basePrice.toFixed(2)}
                    </span>
                  </div>
                  {selectedBlank && (
                    <div className="flex justify-between">
                      <span className="text-white/60">
                        {selectedBlank.name}
                      </span>
                      <span className="text-white">
                        +${selectedBlank.price.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedAddOns.map(({ addOn, quantity }) => (
                    <div key={addOn._id} className="flex justify-between">
                      <span className="text-white/60">
                        {addOn.name}{quantity > 1 ? ` × ${quantity}` : ""}
                      </span>
                      <span className="text-white">+${(addOn.price * quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div
                    className="pt-3 border-t flex justify-between font-semibold"
                    style={{ borderColor: "#2a2a2a" }}
                  >
                    <span className="text-white">Total</span>
                    <span className="text-gold">
                      ${totalPrice.toFixed(2)} CAD
                    </span>
                  </div>
                </div>

                {(!selectedColour || !selectedBlank) && (
                  <p className="text-white/40 text-xs">
                    {!selectedColour && !selectedBlank
                      ? "Select a hardware colour and blank to continue."
                      : !selectedColour
                      ? "Select a hardware colour to continue."
                      : "Select a blank to continue."}
                  </p>
                )}

                {added ? (
                  <Link
                    href="/checkout"
                    className="w-full py-3 rounded-none font-semibold text-sm uppercase tracking-wider transition-all bg-gold text-dark hover:bg-gold-light block text-center"
                  >
                    Go to Checkout →
                  </Link>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedColour || !selectedBlank}
                    className={`w-full py-3 rounded-none font-semibold text-sm uppercase tracking-wider transition-all ${
                      selectedColour && selectedBlank
                        ? "bg-gold text-dark hover:bg-gold-light"
                        : "bg-white/10 text-white/30 cursor-not-allowed"
                    }`}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-6 text-white/60 hover:text-white text-4xl leading-none"
          >
            ×
          </button>
          <div
            className="relative max-w-2xl w-full max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urlFor(lightboxImage).width(1400).quality(95).auto("format").url()}
              alt="Enlarged view"
              width={1400}
              height={1400}
              quality={95}
              className="w-full h-auto max-h-[85vh] object-contain rounded-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
