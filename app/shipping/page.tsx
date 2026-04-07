export const metadata = { title: "Shipping Policy" };

export default function ShippingPage() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-3">Legal</p>
          <h1 className="font-serif text-4xl text-white">Shipping Policy</h1>
          <p className="text-white/40 text-sm mt-3">Last updated: April 2025</p>
        </div>

        <div className="space-y-8 text-white/60 leading-relaxed">
          <section>
            <h2 className="font-serif text-white text-xl mb-3">Production Time</h2>
            <p>All custom pens are made to order. Please allow <strong className="text-white/80">2–4 weeks</strong> from the date of payment for your pen to be completed. Gallery items that are already finished ship within <strong className="text-white/80">3–5 business days</strong>.</p>
            <p className="mt-2">You will receive an email notification when your order ships.</p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Shipping Rates & Carriers</h2>
            <p>We ship via Canada Post. Shipping costs are calculated based on your location and will be confirmed via email before your order is sent. We will not ship without your approval of the shipping cost.</p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Where We Ship</h2>
            <p>We currently ship within <strong className="text-white/80">Canada</strong>. For international inquiries, please contact us directly at{" "}
              <a href="mailto:generationalturning@gmail.com" className="text-gold hover:underline">
                generationalturning@gmail.com
              </a>{" "}before placing an order.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Tracking</h2>
            <p>All shipments include tracking. Your tracking number will be sent to the email address provided at checkout once your order has been picked up by Canada Post.</p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Damaged or Lost Packages</h2>
            <p>If your order arrives damaged or goes missing in transit, please contact us immediately at{" "}
              <a href="mailto:generationalturning@gmail.com" className="text-gold hover:underline">
                generationalturning@gmail.com
              </a>. We will work with you to resolve the issue.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
