import { notFound } from "next/navigation";
import Image from "next/image";
import { getGalleryItems, getSiteSettings } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import { AddToCartButton } from "./AddToCartButton";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const [items, settings] = await Promise.all([getGalleryItems(), getSiteSettings()]);

  if (settings?.galleryEnabled === false) notFound();

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-3">
            One of a Kind
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white">
            Gallery
          </h1>
          <p className="text-white/50 mt-4 max-w-lg mx-auto">
            These pens are unique, one-off pieces. Once sold, they move to the
            Inspiration page.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">
              No items available right now.
            </p>
            <p className="text-white/30 text-sm mt-2">
              Check back soon or{" "}
              <a href="/contact" className="text-gold hover:underline">
                get in touch
              </a>{" "}
              about a custom pen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
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
                  className="rounded-none overflow-hidden"
                  style={{ background: "#141414", border: "1px solid #2a2a2a" }}
                >
                  <div className="aspect-square relative overflow-hidden bg-dark">
                    {item.images?.[0] ? (
                      <Image
                        src={urlFor(item.images[0]).width(1200).quality(90).auto("format").url()}
                        alt={item.name}
                        fill
                        quality={90}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-white/10 text-6xl">✒</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h2 className="text-white font-medium text-lg">
                        {item.name}
                      </h2>
                      {item.description && (
                        <p className="text-white/50 text-sm mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-semibold">
                        ${item.price.toFixed(2)} CAD
                      </span>
                      <AddToCartButton item={item} />
                    </div>
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
