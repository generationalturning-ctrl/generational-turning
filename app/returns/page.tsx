export const metadata = { title: "Returns & Refunds" };

export default function ReturnsPage() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-3">Legal</p>
          <h1 className="font-serif text-4xl text-white">Returns &amp; Refunds</h1>
          <p className="text-white/40 text-sm mt-3">Last updated: April 2025</p>
        </div>

        <div className="space-y-8 text-white/60 leading-relaxed">
          <section>
            <h2 className="font-serif text-white text-xl mb-3">Custom Pens</h2>
            <p>Because every custom pen is made to order specifically for you, <strong className="text-white/80">custom pens are non-refundable</strong> once production has begun. If you have concerns about your order before production starts, please contact us as soon as possible.</p>
            <p className="mt-2">If your pen arrives with a manufacturing defect, we will repair or replace it at no cost to you.</p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Gallery Pens</h2>
            <p>Gallery pens may be returned within <strong className="text-white/80">14 days</strong> of delivery, provided they are unused and in the original condition. Return shipping costs are the responsibility of the buyer.</p>
            <p className="mt-2">To initiate a return, email us at{" "}
              <a href="mailto:generationalturning@gmail.com" className="text-gold hover:underline">
                generationalturning@gmail.com
              </a>{" "}with your order details.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Refund Processing</h2>
            <p>Approved refunds are processed back to the original payment method within <strong className="text-white/80">5–10 business days</strong>. You will receive an email confirmation once the refund has been issued.</p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Ink &amp; Accessories</h2>
            <p>Ink and presentation boxes are non-returnable for hygiene and safety reasons unless they arrive damaged or defective.</p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Questions</h2>
            <p>For any concerns, reach out at{" "}
              <a href="mailto:generationalturning@gmail.com" className="text-gold hover:underline">
                generationalturning@gmail.com
              </a>. We are a small operation and will always do our best to make things right.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
