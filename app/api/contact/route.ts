import { NextRequest } from "next/server";
import { Resend } from "resend";
import { rateLimit, getIp } from "@/lib/rateLimit";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  // Rate limit: 3 messages per 5 minutes per IP
  if (!rateLimit(getIp(req) + ":contact", 3, 5 * 60_000)) {
    return Response.json({ error: "Too many requests — please wait a few minutes." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

    const { name, email, message } = body;

    if (!name || !email || !message) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return Response.json({ error: "Invalid fields" }, { status: 400 });
    }

    // Length limits
    if (name.length > 200 || email.length > 200 || message.length > 5000) {
      return Response.json({ error: "Input too long" }, { status: 400 });
    }

    // Email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.log("Contact form submission:", { name, email, message });
      return Response.json({ ok: true });
    }

    const resend = new Resend(resendKey);
    const { error: resendError } = await resend.emails.send({
      from: "Contact Form <noreply@generationalturning.ca>",
      to: "generationalturning@gmail.com",
      replyTo: email,
      subject: `New message from ${escapeHtml(name)}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <hr style="border-color:#2a2a2a"/>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return Response.json({ error: "Failed to send" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
