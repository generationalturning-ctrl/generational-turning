import Stripe from "stripe";
import { createClient } from "@sanity/client";
import { Resend } from "resend";
import { NextRequest } from "next/server";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { customerConfirmationEmail } from "@/lib/emails";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type OrderItem = {
  itemType: string;
  name: string;
  details: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type CartItem = {
  type: "custom" | "gallery";
  penStyleName?: string;
  metalColour?: string;
  blankName?: string;
  addOns?: { name: string; price: number }[];
  quantity?: number;
  totalPrice?: number;
  name?: string;
  price?: number;
};

function buildOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map((item) => {
    if (item.type === "custom") {
      const qty = item.quantity ?? 1;
      const colour =
        (item.metalColour?.charAt(0).toUpperCase() ?? "") +
        (item.metalColour?.slice(1) ?? "");
      const addOnNames =
        item.addOns && item.addOns.length > 0
          ? ` + ${item.addOns.map((a) => a.name).join(", ")}`
          : "";
      return {
        itemType: "custom",
        name: item.penStyleName ?? "Custom Pen",
        details: `${colour} · ${item.blankName ?? ""}${addOnNames}`,
        quantity: qty,
        unitPrice: item.totalPrice ?? 0,
        lineTotal: (item.totalPrice ?? 0) * qty,
      };
    } else {
      return {
        itemType: "gallery",
        name: item.name ?? "Gallery Pen",
        details: "One-of-a-kind pen",
        quantity: 1,
        unitPrice: item.price ?? 0,
        lineTotal: item.price ?? 0,
      };
    }
  });
}

type ShippingAddress = {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

function orderEmailHtml(
  customerName: string,
  customerEmail: string,
  items: OrderItem[],
  total: number,
  paymentIntentId: string,
  shippingAddress?: ShippingAddress,
  promotionalConsent?: boolean
): string {
  const safeName = escapeHtml(customerName);
  const safeEmail = escapeHtml(customerEmail);

  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#fff">
          <strong>${escapeHtml(i.name)}</strong>${i.quantity > 1 ? ` × ${i.quantity}` : ""}<br>
          <span style="color:#ffffff80;font-size:13px">${escapeHtml(i.details)}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#c9a84c;text-align:right;white-space:nowrap">
          $${i.lineTotal.toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const addressBlock = shippingAddress
    ? `<div style="margin-top:24px;padding:16px;background:#1a1a1a;border-radius:8px">
        <p style="margin:0 0 6px;color:#ffffff60;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">Ship To</p>
        <p style="margin:0;color:#fff;font-size:14px;line-height:1.6">
          ${escapeHtml(shippingAddress.address1)}${shippingAddress.address2 ? `<br>${escapeHtml(shippingAddress.address2)}` : ""}<br>
          ${escapeHtml(shippingAddress.city)}, ${escapeHtml(shippingAddress.province)} ${escapeHtml(shippingAddress.postalCode)}<br>
          ${escapeHtml(shippingAddress.country)}
        </p>
      </div>`
    : "";

  const consentLine = promotionalConsent !== undefined
    ? `<p style="margin:16px 0 0;color:#ffffff40;font-size:12px">
        Photo consent: <strong style="color:${promotionalConsent ? "#4ade80" : "#ffffff60"}">${promotionalConsent ? "Yes — photos may be used" : "No"}</strong>
      </p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;font-family:Inter,sans-serif;margin:0;padding:0">
  <div style="max-width:560px;margin:40px auto;background:#141414;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden">
    <div style="background:#1a1208;padding:28px 32px;border-bottom:1px solid #2a2a2a">
      <h1 style="margin:0;font-size:22px;color:#c9a84c;font-family:Georgia,serif">New Order — Generational Turning</h1>
      <p style="margin:6px 0 0;color:#ffffff60;font-size:13px">${new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" })}</p>
    </div>
    <div style="padding:28px 32px">
      <h2 style="margin:0 0 4px;color:#fff;font-size:16px">${safeName}</h2>
      <a href="mailto:${safeEmail}" style="color:#c9a84c;font-size:14px">${safeEmail}</a>

      <table style="width:100%;margin-top:24px;border-collapse:collapse">
        ${rows}
        <tr>
          <td style="padding-top:14px;color:#ffffff80;font-weight:600">Total</td>
          <td style="padding-top:14px;color:#c9a84c;font-size:18px;font-weight:700;text-align:right">$${total.toFixed(2)} CAD</td>
        </tr>
      </table>

      ${addressBlock}
      ${consentLine}

      <p style="margin:24px 0 0;color:#ffffff40;font-size:12px">
        Stripe Payment Intent: <code style="color:#ffffff60">${escapeHtml(paymentIntentId)}</code>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 requests per minute per IP
  if (!rateLimit(getIp(req) + ":order-complete", 5, 60_000)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

    const { paymentIntentId, customerName, customerEmail, cartItems, shippingAddress, promotionalConsent } = body;

    if (!paymentIntentId || !customerName || !customerEmail || !cartItems) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate types
    if (
      typeof paymentIntentId !== "string" ||
      typeof customerName !== "string" ||
      typeof customerEmail !== "string" ||
      !Array.isArray(cartItems)
    ) {
      return Response.json({ error: "Invalid field types" }, { status: 400 });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    // Clamp field lengths
    const name = customerName.slice(0, 200);
    const email = customerEmail.slice(0, 200);

    // Sanitise shipping address if present
    const address: ShippingAddress | undefined = shippingAddress && typeof shippingAddress === "object"
      ? {
          address1: String(shippingAddress.address1 ?? "").slice(0, 300),
          address2: shippingAddress.address2 ? String(shippingAddress.address2).slice(0, 300) : undefined,
          city: String(shippingAddress.city ?? "").slice(0, 100),
          province: String(shippingAddress.province ?? "").slice(0, 100),
          postalCode: String(shippingAddress.postalCode ?? "").slice(0, 20),
          country: String(shippingAddress.country ?? "Canada").slice(0, 100),
        }
      : undefined;

    const consent = typeof promotionalConsent === "boolean" ? promotionalConsent : false;

    // Verify the payment actually succeeded with Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return Response.json({ error: "Payment not confirmed" }, { status: 400 });
    }

    const items = buildOrderItems(cartItems);
    const total = items.reduce((s, i) => s + i.lineTotal, 0);

    // Save order to Sanity
    await sanity.create({
      _type: "order",
      orderDate: new Date().toISOString(),
      customerName: name,
      customerEmail: email,
      items: items.map((i) => ({ _type: "object", _key: crypto.randomUUID(), ...i })),
      total,
      shippingAddress: address,
      promotionalConsent: consent,
      stripePaymentIntentId: paymentIntentId,
      status: "received",
    });

    // Send emails via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);

      // Notification to you
      await resend.emails.send({
        from: "orders@generationalturning.ca",
        to: "generationalturning@gmail.com",
        replyTo: email,
        subject: `New Order from ${name} — $${total.toFixed(2)} CAD`,
        html: orderEmailHtml(name, email, items, total, paymentIntentId, address, consent),
      });

      // Confirmation to customer
      await resend.emails.send({
        from: "orders@generationalturning.ca",
        to: email,
        replyTo: "generationalturning@gmail.com",
        subject: "Your Generational Turning order is confirmed",
        html: customerConfirmationEmail(name, items, total, address),
      });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("order-complete error:", err);
    return Response.json({ error: "Failed to record order" }, { status: 500 });
  }
}
