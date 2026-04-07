import { getSiteSettings } from "@/lib/queries";

export const metadata = { title: "About" };

const DEFAULTS = {
  para1: "There is something deeply satisfying about holding a pen that was made by hand — shaped on a lathe, finished by touch, and built to last longer than the person who made it. That is the idea behind Generational Turning.",
  para2: "Every pen begins as a raw blank — a piece of exotic wood, a stabilized burl, or a cast acrylic — and is slowly turned into something functional and beautiful. The process takes time, patience, and a deep respect for the material. No two blanks are the same, which means no two pens are ever the same.",
  para3: "The name Generational Turning reflects the belief that a well-made pen is not a throwaway item. It is something you write with for years, hand to a child, or pass down as a keepsake. Good tools outlast the people who use them — and that is something worth making.",
  para4: "Whether you are looking for a one-of-a-kind piece from the gallery or want to design something entirely your own, every pen leaves this workshop with the same care and attention. If you have questions or want to talk about a custom order, do not hesitate to get in touch.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const about = settings?.aboutPage;

  const para1 = about?.para1 || DEFAULTS.para1;
  const para2 = about?.para2 || DEFAULTS.para2;
  const para3 = about?.para3 || DEFAULTS.para3;
  const para4 = about?.para4 || DEFAULTS.para4;

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-14">
          <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-3">
            The Story
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white">
            About
          </h1>
        </div>

        <div
          className="rounded-none p-8 md:p-12 mb-10"
          style={{ background: "#141414", border: "1px solid #2a2a2a" }}
        >
          <p className="text-white/70 leading-relaxed text-lg mb-6">{para1}</p>
          <p className="text-white/60 leading-relaxed mb-6">{para2}</p>
          <p className="text-white/60 leading-relaxed mb-6">{para3}</p>
          <p className="text-white/60 leading-relaxed">{para4}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Handmade", value: "Every pen" },
            { label: "Unique blanks", value: "No two alike" },
            { label: "Made in", value: "Canada" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-none p-6 text-center"
              style={{ background: "#141414", border: "1px solid #2a2a2a" }}
            >
              <p className="font-serif text-gold text-2xl mb-1">{s.value}</p>
              <p className="text-white/40 text-sm uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
