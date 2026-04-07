import { notFound } from "next/navigation";
import Image from "next/image";
import { getInspirationItems, getSiteSettings } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";

export const metadata = { title: "Inspiration" };

export default async function InspirationPage() {
  const [items, settings] = await Promise.all([getInspirationItems(), getSiteSettings()]);

  if (settings?.inspirationEnabled === false) notFound();

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-3">
            Made & Loved
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white">
            Inspiration
          </h1>
          <p className="text-white/50 mt-4 max-w-lg mx-auto">
            Every pen that has found a home. Browse past work for inspiration,
            then design your own.
          </p>
          <p className="text-white/25 text-xs mt-3 max-w-md mx-auto">
            Wood grain, colour, and pattern vary with each piece — your pen will
            be uniquely yours.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">Nothing here yet.</p>
            <p className="text-white/30 text-sm mt-2">
              Be the first —{" "}
              <a href="/design" className="text-gold hover:underline">
                design your pen
              </a>{" "}
              or{" "}
              <a href="/gallery" className="text-gold hover:underline">
                shop the gallery
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {items.map(
              (item: {
                _id: string;
                name: string;
                price: number;
                description?: string;
                images: Record<string, unknown>[];
              }) => (
                <div
                  key={item._id}
                  className="break-inside-avoid rounded-none overflow-hidden"
                  style={{ background: "#141414", border: "1px solid #2a2a2a" }}
                >
                  {item.images?.[0] && (
                    <div className="relative w-full">
                      <Image
                        src={urlFor(item.images[0]).width(1200).quality(90).auto("format").url()}
                        alt={item.name}
                        width={600}
                        height={600}
                        quality={90}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-white font-medium">{item.name}</h2>
                    {item.description && (
                      <p className="text-white/50 text-sm mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <p className="text-gold/60 text-xs mt-2">
                      Sold · ${item.price.toFixed(2)} CAD
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
