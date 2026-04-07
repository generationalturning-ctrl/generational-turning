"use client";

import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-8">
        <p className="text-gold font-serif text-2xl mb-2">Message Sent</p>
        <p className="text-white/60">
          Thanks for reaching out. I will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white/60 text-sm mb-2" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-none text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-gold transition-all"
          style={{ background: "#0a0a0a", border: "1px solid #2a2a2a" }}
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-white/60 text-sm mb-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 rounded-none text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-gold transition-all"
          style={{ background: "#0a0a0a", border: "1px solid #2a2a2a" }}
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label className="block text-white/60 text-sm mb-2" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 rounded-none text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-gold transition-all resize-none"
          style={{ background: "#0a0a0a", border: "1px solid #2a2a2a" }}
          placeholder="Tell me what you're looking for..."
        />
      </div>

      {status === "error" && (
        <p className="text-red-400 text-sm">
          Something went wrong. Please try again or use the email on the contact page.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-3 rounded-none bg-gold text-dark font-semibold text-sm uppercase tracking-wider hover:bg-gold-light transition-colors disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
