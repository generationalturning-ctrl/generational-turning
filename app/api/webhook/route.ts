import Stripe from "stripe";
import { createClient } from "@sanity/client";
import { Resend } from "resend";
import { NextRequest } from "next/server";

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

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET not set — skipping webhook");
    return Response.json({ ok: true });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "payment_intent.succeeded") {
    return Response.json({ ok: true });
  }

  const intent = event.data.object as Stripe.PaymentIntent;

  // Check if we already saved this order (client-side call may have already done it)
  const existing = await sanity.fetch(
    `*[_type == "order" && stripePaymentIntentId == $id][0]._id`,
    { id: intent.id }
  );
  if (existing) {
    return Response.json({ ok: true }); // already recorded
  }

  // Extract details from PaymentIntent metadata/billing
  const customerName = intent.shipping?.name ??
    (intent as any).metadata?.customerName ??
    "Unknown";
  const customerEmail = (intent as any).metadata?.customerEmail ?? "";

  // Save minimal order record (full details come from client-side order-complete)
  await sanity.create({
    _type: "order",
    orderDate: new Date(intent.created * 1000).toISOString(),
    customerName,
    customerEmail,
    items: [],
    total: intent.amount / 100,
    stripePaymentIntentId: intent.id,
    status: "received",
    notes: "Recorded via Stripe webhook — full item details may be in a separate record.",
  });

  // Send notification email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && customerEmail) {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "orders@generationalturning.ca",
      to: "generationalturning@gmail.com",
      subject: `Payment Received — $${(intent.amount / 100).toFixed(2)} CAD`,
      html: `
        <div style="font-family:Inter,sans-serif;background:#0a0a0a;padding:32px">
          <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden">
            <div style="background:#1a1208;padding:24px 28px;border-bottom:1px solid #2a2a2a">
              <h1 style="margin:0;color:#c9a84c;font-family:Georgia,serif;font-size:20px">Payment Received</h1>
            </div>
            <div style="padding:24px 28px">
              <p style="color:#fff;margin:0 0 4px"><strong>${escapeHtml(customerName)}</strong></p>
              ${customerEmail ? `<a href="mailto:${escapeHtml(customerEmail)}" style="color:#c9a84c;font-size:14px">${escapeHtml(customerEmail)}</a>` : ""}
              <p style="color:#c9a84c;font-size:24px;font-weight:700;margin:16px 0 0">$${(intent.amount / 100).toFixed(2)} CAD</p>
              <p style="color:#ffffff40;font-size:12px;margin:8px 0 0">${intent.id}</p>
            </div>
          </div>
        </div>
      `,
    });
  }

  return Response.json({ ok: true });
}
