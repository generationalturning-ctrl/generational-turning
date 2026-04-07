import { getPenStyles, getBlanks, getAddOns, getSiteSettings } from "@/lib/queries";
import { PenConfigurator } from "./PenConfigurator";

export const dynamic = "force-dynamic";
export const metadata = { title: "Design Your Pen" };

export default async function DesignPage() {
  const [penStyles, blanks, addOns, settings] = await Promise.all([
    getPenStyles(),
    getBlanks(),
    getAddOns(),
    getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-3">
            Made to Order
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white">
            Design Your Pen
          </h1>
          <p className="text-white/50 mt-4 max-w-lg mx-auto">
            Choose your pen type, style, hardware colour, and blank. Every pen
            is made to order.
          </p>
        </div>
        <p className="text-white/30 text-xs text-center mb-8 max-w-xl mx-auto leading-relaxed">
          Each pen is handcrafted individually — wood grain, colour depth, and
          pattern will vary from the images shown. No two pieces are ever
          identical.
        </p>
        <PenConfigurator penStyles={penStyles} blanks={blanks} addOns={addOns} penTypeImages={settings?.penTypeImages} />
      </div>
    </div>
  );
}
