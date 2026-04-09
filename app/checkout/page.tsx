import { CheckoutClient } from "./CheckoutClient";
import { getSiteSettings } from "@/lib/queries";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await getSiteSettings();
  const vacationMode = settings?.vacationMode ?? false;
  const vacationReturnDate = settings?.vacationReturnDate ?? "";

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-3">
            Almost There
          </p>
          <h1 className="font-serif text-4xl text-white">Checkout</h1>
        </div>
        <CheckoutClient vacationMode={vacationMode} vacationReturnDate={vacationReturnDate} />
      </div>
    </div>
  );
}
