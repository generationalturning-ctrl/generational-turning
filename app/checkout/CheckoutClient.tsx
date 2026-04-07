"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function CheckoutClient() {
  const { items, total } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [shipping, setShipping] = useState<number | null>(null);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [freeThreshold, setFreeThreshold] = useState<number>(200);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [largeOrder, setLargeOrder] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      return;
    }
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setShipping(data.shipping);
          setOrderTotal(data.total);
          if (data.freeThreshold) setFreeThreshold(data.freeThreshold);
        } else if (data.largeOrder) {
          setLargeOrder(true);
        } else {
          setError("Could not initialise payment. Please try again.");
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40 text-lg mb-4">Your cart is empty.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/design"
            className="px-6 py-3 bg-gold text-dark rounded-none font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            Design a Pen
          </Link>
          <Link
            href="/gallery"
            className="px-6 py-3 rounded-none text-white/60 text-sm hover:text-gold transition-colors"
            style={{ border: "1px solid #2a2a2a" }}
          >
            Browse Gallery
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40">Preparing your order...</p>
      </div>
    );
  }

  if (largeOrder) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div
          className="rounded-none p-10"
          style={{ background: "#1a1208", border: "1px solid #c9a84c40" }}
        >
          <p className="text-gold text-4xl mb-6">✦</p>
          <h2 className="font-serif text-white text-2xl mb-3">
            Let&apos;s Talk First
          </h2>
          <p className="text-white/60 leading-relaxed mb-6">
            For orders over $5,000 I handle things personally to make sure
            every detail is right. Reach out and I&apos;ll get back to you
            promptly.
          </p>
          <a
            href="mailto:generationalturning@gmail.com"
            className="inline-block px-8 py-3 bg-gold text-dark font-semibold rounded-none text-sm hover:bg-gold-light transition-colors"
          >
            generationalturning@gmail.com
          </a>
          <div className="mt-6">
            <Link href="/design" className="text-white/30 text-sm hover:text-gold transition-colors">
              ← Back to designing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/" className="text-gold hover:underline text-sm">
          Return home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Order Summary */}
      <div>
        <h2 className="font-serif text-gold text-xl mb-6">Order Summary</h2>
        <div
          className="rounded-none p-6 space-y-4"
          style={{ background: "#141414", border: "1px solid #2a2a2a" }}
        >
          {items.map((item) => (
            <div
              key={item.cartId}
              className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0"
              style={{ borderColor: "#2a2a2a" }}
            >
              <div className="flex-1 pr-4">
                {item.type === "custom" ? (
                  <>
                    <p className="text-white font-medium">
                      {item.penStyleName}
                      {item.quantity > 1 && (
                        <span className="text-white/40 text-sm font-normal ml-2">
                          × {item.quantity}
                        </span>
                      )}
                    </p>
                    <p className="text-white/50 text-sm">
                      {item.metalColour.charAt(0).toUpperCase() +
                        item.metalColour.slice(1)}{" "}
                      · {item.blankName}
                    </p>
                    {item.addOns.length > 0 && (
                      <p className="text-white/40 text-xs mt-0.5">
                        + {item.addOns.map((a) => a.name).join(", ")}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-white font-medium">{item.name}</p>
                )}
              </div>
              <p className="text-gold font-semibold whitespace-nowrap">
                $
                {(item.type === "custom"
                  ? item.totalPrice * item.quantity
                  : item.price
                ).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="flex justify-between text-sm pt-3 border-t" style={{ borderColor: "#2a2a2a" }}>
            <span className="text-white/50">Subtotal</span>
            <span className="text-white/70">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Shipping</span>
            <span className={shipping === 0 ? "text-green-400" : "text-white/70"}>
              {shipping === null ? "—" : shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between pt-2 font-semibold border-t" style={{ borderColor: "#2a2a2a" }}>
            <span className="text-white">Total</span>
            <span className="text-gold text-lg">
              ${(orderTotal ?? total).toFixed(2)} CAD
            </span>
          </div>
          {shipping !== null && shipping > 0 && (
            <p className="text-white/30 text-xs">
              Add ${(freeThreshold - total).toFixed(2)} more for free shipping
            </p>
          )}
        </div>
        <p className="text-white/30 text-xs mt-4">
          All prices in Canadian dollars. Custom pens are made to order after
          payment is received.
        </p>

        {total >= 5000 && (
          <div
            className="mt-4 rounded-none p-5"
            style={{ background: "#1a1208", border: "1px solid #c9a84c40" }}
          >
            <p className="text-gold text-sm font-semibold mb-1">Large Order</p>
            <p className="text-white/60 text-sm leading-relaxed">
              For orders of this size, please reach out directly so I can make
              sure everything is handled personally.{" "}
              <a
                href="mailto:generationalturning@gmail.com"
                className="text-gold hover:underline"
              >
                generationalturning@gmail.com
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Payment */}
      <div>
        <h2 className="font-serif text-gold text-xl mb-6">Payment</h2>
        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#c9a84c",
                  colorBackground: "#141414",
                  colorText: "#ffffff",
                  colorTextPlaceholder: "#ffffff40",
                  borderRadius: "0px",
                  fontFamily: "Inter, sans-serif",
                },
              },
            }}
          >
            <PaymentForm total={orderTotal ?? total} cartItems={items} />
          </Elements>
        )}
      </div>
    </div>
  );
}

function PaymentForm({
  total,
  cartItems,
}: {
  total: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cartItems: any[];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [promoConsent, setPromoConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (!address1.trim() || !city.trim() || !province.trim() || !postalCode.trim()) {
      setError("Please complete your shipping address.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        payment_method_data: {
          billing_details: { name: name.trim(), email: email.trim() },
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    // Payment succeeded — record the order
    try {
      await fetch("/api/order-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent?.id,
          customerName: name.trim(),
          customerEmail: email.trim(),
          cartItems,
          shippingAddress: {
            address1: address1.trim(),
            address2: address2.trim(),
            city: city.trim(),
            province: province.trim(),
            postalCode: postalCode.trim(),
            country: "Canada",
          },
          promotionalConsent: promoConsent,
        }),
      });
    } catch {
      // Non-fatal — order went through, recording failed
      console.error("Failed to record order");
    }

    clearCart();
    setSucceeded(true);
  }

  if (succeeded) {
    return (
      <div
        className="rounded-none p-8 text-center"
        style={{ background: "#141414", border: "1px solid #2a2a2a" }}
      >
        <div className="text-gold text-4xl mb-4">✓</div>
        <h3 className="font-serif text-white text-2xl mb-2">Order Confirmed</h3>
        <p className="text-white/60 mb-6">
          Thank you for your order. I&apos;ll be in touch soon with an update.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gold text-dark rounded-none font-semibold text-sm hover:bg-gold-light transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-none bg-dark text-white text-sm placeholder-white/30 outline-none focus:ring-1 focus:ring-gold transition-all";
  const inputStyle = { border: "1px solid #2a2a2a" };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Contact details */}
      <div
        className="rounded-none p-6 space-y-4"
        style={{ background: "#141414", border: "1px solid #2a2a2a" }}
      >
        <p className="text-white/60 text-xs uppercase tracking-wider">
          Contact Details
        </p>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Shipping address */}
      <div
        className="rounded-none p-6 space-y-4"
        style={{ background: "#141414", border: "1px solid #2a2a2a" }}
      >
        <p className="text-white/60 text-xs uppercase tracking-wider">
          Shipping Address
        </p>
        <input
          type="text"
          placeholder="Street address"
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          required
          className={inputClass}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Apt, suite, unit (optional)"
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <input
          type="text"
          placeholder="Postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Promotional consent */}
      <label
        className="flex items-start gap-3 cursor-pointer rounded-none p-5"
        style={{ background: "#141414", border: "1px solid #2a2a2a" }}
      >
        <input
          type="checkbox"
          checked={promoConsent}
          onChange={(e) => setPromoConsent(e.target.checked)}
          className="mt-0.5 accent-gold flex-shrink-0"
        />
        <span className="text-white/60 text-sm leading-relaxed">
          I&apos;m happy for photos of my finished pen to be used on the
          Generational Turning website or social media. Your name will never
          be shared without your permission.
        </span>
      </label>

      {/* Stripe payment */}
      <div
        className="rounded-none p-6"
        style={{ background: "#141414", border: "1px solid #2a2a2a" }}
      >
        <PaymentElement />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full py-4 rounded-none bg-gold text-dark font-semibold text-sm uppercase tracking-wider hover:bg-gold-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Processing..." : `Pay $${total.toFixed(2)} CAD`}
      </button>

      <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Secured by Stripe
      </div>
    </form>
  );
}
