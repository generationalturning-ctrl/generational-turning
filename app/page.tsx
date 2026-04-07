import Link from "next/link";
import Image from "next/image";
import { getFeaturedGalleryItems, getPhotoStripImages } from "@/lib/queries";
import { urlFor } from "@/lib/sanity";
import { PhotoStrip } from "@/components/PhotoStrip";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, stripImages] = await Promise.all([
    getFeaturedGalleryItems(),
    getPhotoStripImages(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, #1a1208 0%, #0a0a0a 70%)",
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-gold/70 text-sm uppercase tracking-[0.3em] mb-6 font-sans">
            Handcrafted in Canada
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
            Generational
            <br />
            <span className="text-gold">Turning</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Wood turned pens crafted one at a time — each unique, each made to
            last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/design"
              className="px-8 py-4 bg-gold text-dark font-semibold rounded-none hover:bg-gold-light transition-colors text-sm uppercase tracking-wider"
            >
              Design Your Pen
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-4 border text-white/80 rounded-none hover:text-gold hover:border-gold transition-colors text-sm uppercase tracking-wider"
              style={{ borderColor: "#2a2a2a" }}
            >
              Shop Gallery
            </Link>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, #c9a84c40, transparent)",
          }}
        />
      </section>

      {/* Photo Strip */}
      {stripImages.length > 0 && <PhotoStrip images={stripImages} />}

      {/* Featured Gallery */}
      {featured.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-gold/70 text-xs uppercase tracking-[0.3em] mb-2">
                  One of a Kind
                </p>
                <h2 className="font-serif text-3xl text-white">
                  From the Gallery
                </h2>
              </div>
              <Link
                href="/gallery"
                className="text-sm text-gold/70 hover:text-gold transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featured.map(
                (item: {
                  _id: string;
                  name: string;
                  price: number;
                  images: Record<string, unknown>[];
                }) => (
                  <Link
                    key={item._id}
                    href="/gallery"
                    className="group rounded-none overflow-hidden"
                    style={{
                      background: "#141414",
                      border: "1px solid #2a2a2a",
                    }}
                  >
                    <div className="aspect-square relative overflow-hidden bg-card">
                      {item.images?.[0] && (
                        <Image
                          src={urlFor(item.images[0]).width(1200).quality(90).auto("format").url()}
                          alt={item.name}
                          fill
                          quality={90}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-gold text-sm mt-1">
                        ${item.price.toFixed(2)} CAD
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* Design CTA */}
      <section className="py-20 px-6">
        <div
          className="max-w-4xl mx-auto rounded-none p-12 text-center"
          style={{
            background:
              "linear-gradient(135deg, #1a1208 0%, #141414 50%, #0a1208 100%)",
            border: "1px solid #2a2a2a",
          }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            Create Something <span className="text-gold">Yours</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto leading-relaxed">
            Pick your pen style, choose your blank, and configure your perfect
            writing instrument. Every combination is unique.
          </p>
          <Link
            href="/design"
            className="inline-block px-8 py-4 bg-gold text-dark font-semibold rounded-none hover:bg-gold-light transition-colors text-sm uppercase tracking-wider"
          >
            Start Designing
          </Link>
        </div>
      </section>
    </>
  );
}
