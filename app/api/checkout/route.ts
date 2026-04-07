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

    // Validate item structure (not prices — those come from Sanity)
    for (const item of items) {
      if (!item || typeof item !== "object") {
        return Response.json({ error: "Invalid item" }, { status: 400 });
      }
      if (!["custom", "gallery"].includes(item.type)) {
        return Response.json({ error: "Invalid item type" }, { status: 400 });
      }
      if (item.type === "custom") {
        const qty = item.quantity ?? 1;
        if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
          return Response.json({ error: "Invalid quantity" }, { status: 400 });
        }
        if (!item.penStyleId || !item.blankId) {
          return Response.json({ error: "Missing item details" }, { status: 400 });
        }
      }
    }

    const customItems = items.filter((i) => i.type === "custom");
    const galleryItems = items.filter((i) => i.type === "gallery");

    // Collect all IDs needed
    const penStyleIds = [...new Set(customItems.map((i) => i.penStyleId).filter(Boolean))];
    const blankIds = [...new Set(customItems.map((i) => i.blankId).filter(Boolean))];
    const addOnIds = [...new Set(
      customItems.flatMap((i) => (i.addOns ?? []).map((a: { id: string }) => a.id)).filter(Boolean)
    )];
    const galleryIds = galleryItems.map((i) => i._id).filter(Boolean);

    // Fetch authoritative data from Sanity — server determines all prices
    const [penStyles, blanks, addOns, galleryDocs, settings] = await Promise.all([
      penStyleIds.length > 0
        ? sanityRead.fetch(`*[_type == "penStyle" && _id in $ids]{ _id, basePrice, inStock }`, { ids: penStyleIds })
        : [],
      blankIds.length > 0
        ? sanityRead.fetch(`*[_type == "blank" && _id in $ids]{ _id, price, inStock }`, { ids: blankIds })
        : [],
      addOnIds.length > 0
        ? sanityRead.fetch(`*[_type == "addOn" && _id in $ids]{ _id, price, inStock }`, { ids: addOnIds })
        : [],
      galleryIds.length > 0
        ? sanityRead.fetch(`*[_type == "galleryItem" && _id in $ids && sold != true]{ _id, price }`, { ids: galleryIds })
        : [],
      sanityRead.fetch(`*[_type == "siteSettings" && _id == "siteSettings"][0].shipping`),
    ]);

    // Build lookup maps
    const penStyleMap = new Map(penStyles.map((p: { _id: string; basePrice: number; inStock: boolean }) => [p._id, p]));
    const blankMap = new Map(blanks.map((b: { _id: string; price: number; inStock: boolean }) => [b._id, b]));
    const addOnMap = new Map(addOns.map((a: { _id: string; price: number; inStock: boolean }) => [a._id, a]));
    const galleryMap = new Map(galleryDocs.map((g: { _id: string; price: number }) => [g._id, g]));

    // Check stock and compute authoritative total — client-supplied prices are ignored
    const outOfStock: string[] = [];
    let amount = 0;

    for (const item of customItems) {
      const penStyle = penStyleMap.get(item.penStyleId) as { _id: string; basePrice: number; inStock: boolean } | undefined;
      const blank = blankMap.get(item.blankId) as { _id: string; price: number; inStock: boolean } | undefined;

      if (!penStyle) return Response.json({ error: "Unknown pen style" }, { status: 400 });
      if (!blank) return Response.json({ error: "Unknown blank" }, { status: 400 });
      if (!penStyle.inStock) outOfStock.push("pen style");
      if (!blank.inStock) outOfStock.push("blank");

      // Compute price server-side
      let itemPrice = (penStyle.basePrice ?? 0) + (blank.price ?? 0);

      for (const addOn of item.addOns ?? []) {
        const addOnData = addOnMap.get(addOn.id) as { _id: string; price: number; inStock: boolean } | undefined;
        if (addOnData) {
          if (!addOnData.inStock) outOfStock.push("add-on");
          const addOnQty = Math.max(1, Math.min(99, parseInt(addOn.quantity ?? 1)));
          itemPrice += (addOnData.price ?? 0) * addOnQty;
        }
      }

      amount += itemPrice * (item.quantity ?? 1);
    }

    for (const item of galleryItems) {
      const galleryItem = galleryMap.get(item._id) as { _id: string; price: number } | undefined;
      if (!galleryItem) {
        return Response.json({
          error: "One or more gallery items are no longer available.",
          outOfStock: true,
        }, { status: 400 });
      }
      amount += galleryItem.price ?? 0;
    }

    if (outOfStock.length > 0) {
      return Response.json({
        error: `Some items are no longer available: ${[...new Set(outOfStock)].join(", ")}. Please update your cart.`,
        outOfStock: true,
      }, { status: 400 });
    }

    // Shipping from Sanity
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

    if (amountInCents > 500_000) {
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
