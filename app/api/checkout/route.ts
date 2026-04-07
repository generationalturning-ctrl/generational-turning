import Stripe from "stripe";
import { createClient } from "@sanity/client";
import { NextRequest } from "next/server";
import { rateLimit, getIp } from "@/lib/rateLimit";

const sanityRead = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: true,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MAX_ITEMS = 20;
const MAX_UNIT_PRICE = 2000; // CAD — no single item should cost more than this
const MAX_QUANTITY = 50;

export async function POST(req: NextRequest) {
  // Rate limit: 15 requests per minute per IP
  if (!rateLimit(getIp(req) + ":checkout", 15, 60_000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "No items provided" }, { status: 400 });
    }

    if (items.length > MAX_ITEMS) {
      return Response.json({ error: "Too many items" }, { status: 400 });
    }

    // Validate each item
    for (const item of items) {
      if (!item || typeof item !== "object") {
        return Response.json({ error: "Invalid item" }, { status: 400 });
      }
      if (!["custom", "gallery"].includes(item.type)) {
        return Response.json({ error: "Invalid item type" }, { status: 400 });
      }
      const price = item.type === "custom" ? item.totalPrice : item.price;
      if (typeof price !== "number" || price < 0 || price > MAX_UNIT_PRICE) {
        return Response.json({ error: "Invalid price" }, { status: 400 });
      }
      if (item.type === "custom") {
        const qty = item.quantity ?? 1;
        if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
          return Response.json({ error: "Invalid quantity" }, { status: 400 });
        }
      }
    }

    // Server-side stock check
    const customItems = items.filter((i) => i.type === "custom");
    const galleryItems = items.filter((i) => i.type === "gallery");

    if (customItems.length > 0) {
      const penStyleIds = [...new Set(customItems.map((i) => i.penStyleId).filter(Boolean))];
      const blankIds = [...new Set(customItems.map((i) => i.blankId).filter(Boolean))];
      const addOnIds = [...new Set(customItems.flatMap((i) => (i.addOns ?? []).map((a: { id: string }) => a.id)).filter(Boolean))];

      const [penStyles, blanks, addOns] = await Promise.all([
        penStyleIds.length > 0 ? sanityRead.fetch(`*[_type == "penStyle" && _id in $ids]{ _id, inStock }`, { ids: penStyleIds }) : [],
        blankIds.length > 0 ? sanityRead.fetch(`*[_type == "blank" && _id in $ids]{ _id, inStock }`, { ids: blankIds }) : [],
        addOnIds.length > 0 ? sanityRead.fetch(`*[_type == "addOn" && _id in $ids]{ _id, inStock }`, { ids: addOnIds }) : [],
      ]);

      const outOfStock: string[] = [];
      for (const ps of penStyles) { if (!ps.inStock) outOfStock.push("pen style"); }
      for (const b of blanks) { if (!b.inStock) outOfStock.push("blank"); }
      for (const a of addOns) { if (!a.inStock) outOfStock.push("add-on"); }

      if (outOfStock.length > 0) {
        return Response.json({ error: `Some items are no longer available: ${[...new Set(outOfStock)].join(", ")}. Please update your cart.`, outOfStock: true }, { status: 400 });
      }
    }

    if (galleryItems.length > 0) {
      const galleryIds = galleryItems.map((i) => i._id).filter(Boolean);
      const available = await sanityRead.fetch(`*[_type == "galleryItem" && _id in $ids && sold != true]{ _id }`, { ids: galleryIds });
      if (available.length !== galleryItems.length) {
        return Response.json({ error: "One or more gallery items have already been sold. Please remove them from your cart.", outOfStock: true }, { status: 400 });
      }
    }

    const amount = items.reduce((sum: number, item: { type: string; totalPrice?: number; price?: number; quantity?: number }) => {
      const qty = item.type === "custom" ? (item.quantity ?? 1) : 1;
      const price = item.type === "custom" ? (item.totalPrice ?? 0) : (item.price ?? 0);
      return sum + price * qty;
    }, 0);

    // Fetch shipping settings from Sanity (fall back to hardcoded defaults)
    const settings = await sanityRead.fetch(
      `*[_type == "siteSettings" && _id == "siteSettings"][0].shipping`
    );
    const tier1Fee = settings?.tier1Fee ?? 12;
    const tier2Threshold = settings?.tier2Threshold ?? 100;
    const tier2Fee = settings?.tier2Fee ?? 15;
    const freeThreshold = settings?.freeThreshold ?? 200;

    const shipping =
      amount >= freeThreshold ? 0
      : amount >= tier2Threshold ? tier2Fee
      : tier1Fee;
    const total = amount + shipping;
    const amountInCents = Math.round(total * 100);

    if (amountInCents < 50) {
      return Response.json({ error: "Order total too low" }, { status: 400 });
    }

    if (amountInCents > 500_000) { // $5,000 CAD hard cap
      return Response.json({ error: "Order total too high", largeOrder: true }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "cad",
      automatic_payment_methods: { enabled: true },
      metadata: {
        itemCount: items.length,
        subtotal: amount.toFixed(2),
        shipping: shipping.toFixed(2),
        source: "generationalturning.ca",
      },
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      shipping,
      total,
      freeThreshold,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return Response.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
