import { CheckoutClient } from "./CheckoutClient";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-3">
            Almost There
          </p>
          <h1 className="font-serif text-4xl text-white">Checkout</h1>
        </div>
        <CheckoutClient />
      </div>
    </div>
  );
}
