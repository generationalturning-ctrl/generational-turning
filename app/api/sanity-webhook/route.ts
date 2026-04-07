import { createClient } from "@sanity/client";
import { Resend } from "resend";
import { NextRequest } from "next/server";
import { shippedEmail } from "@/lib/emails";

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

export async function POST(req: NextRequest) {
  // Verify shared secret
  const secret = req.headers.get("x-webhook-secret");
  if (!process.env.SANITY_WEBHOOK_SECRET || secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { _id, _type, status, customerName, customerEmail, shippedEmailSent, shippingAddress } = body as {
    _id: string;
    _type: string;
    status: string;
    customerName: string;
    customerEmail: string;
    shippedEmailSent?: boolean;
    shippingAddress?: {
      address1: string;
      address2?: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
  };

  if (_type !== "order" || status !== "shipped" || shippedEmailSent) {
    return Response.json({ ok: true });
  }

  if (!customerEmail) {
    return Response.json({ error: "No customer email" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "orders@generationalturning.ca",
      to: customerEmail,
      replyTo: "generationalturning@gmail.com",
      subject: "Your Generational Turning pen has shipped!",
      html: shippedEmail(customerName ?? "there", shippingAddress),
    });
  }

  // Mark email as sent so it doesn't fire again
  await sanity.patch(_id).set({ shippedEmailSent: true }).commit();

  return Response.json({ ok: true });
}
