export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-3">Legal</p>
          <h1 className="font-serif text-4xl text-white">Privacy Policy</h1>
          <p className="text-white/40 text-sm mt-3">Last updated: April 2025</p>
        </div>

        <div className="space-y-8 text-white/60 leading-relaxed">
          <section>
            <h2 className="font-serif text-white text-xl mb-3">Information We Collect</h2>
            <p>When you place an order, we collect your name and email address. Payment information is handled entirely by Stripe and is never stored on our servers. We do not collect your mailing address unless you provide it directly via email for shipping purposes.</p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">How We Use Your Information</h2>
            <p>Your name and email are used solely to fulfil your order and communicate with you about it. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Third-Party Services</h2>
            <p>We use the following third-party services to operate this site:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-white/80">Stripe</strong> — payment processing. Your card details go directly to Stripe and are subject to their privacy policy.</li>
              <li><strong className="text-white/80">Resend</strong> — transactional email delivery.</li>
              <li><strong className="text-white/80">Sanity</strong> — content management and order storage.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Data Retention</h2>
            <p>Order records are retained for a minimum of 7 years as required by Canadian tax law. You may request deletion of your personal information at any time by emailing us, subject to legal retention requirements.</p>
          </section>

          <section>
            <h2 className="font-serif text-white text-xl mb-3">Contact</h2>
            <p>If you have any questions about this policy, contact us at{" "}
              <a href="mailto:generationalturning@gmail.com" className="text-gold hover:underline">
                generationalturning@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
