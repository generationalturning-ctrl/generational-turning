import { client } from "./sanity";
import { createClient } from "next-sanity";

const REVALIDATE = { next: { revalidate: 300 } }; // 5-minute cache

// Server-only client with token — bypasses CDN, reads drafts too
const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function getPenStyles() {
  return client.fetch(
    `*[_type == "penStyle"] | order(order asc) {
      _id, name, penType, basePrice, description, previewImage, inStock,
      metalColours[] { colour, images, image, imageZoom, imageOffsetX, imageOffsetY }
    }`,
    {},
    REVALIDATE
  );
}

export async function getBlanks() {
  return client.fetch(
    `*[_type == "blank"] | order(category asc, order asc) {
      _id, name, category, price, inStock, image, supplierUrl
    }`,
    {},
    REVALIDATE
  );
}

export async function getAddOns() {
  return client.fetch(
    `*[_type == "addOn"] | order(order asc) {
      _id, name, addOnType, price, inStock, image,
      "compatiblePenStyleIds": compatiblePenStyles[]._ref
    }`,
    {},
    REVALIDATE
  );
}

export async function getGalleryItems() {
  return client.fetch(
    `*[_type == "galleryItem" && sold != true] | order(publishedAt desc) {
      _id, name, price, description, images, sold, featured
    }`,
    {},
    REVALIDATE
  );
}

export async function getFeaturedGalleryItems() {
  return client.fetch(
    `*[_type == "galleryItem" && sold != true && featured == true] | order(publishedAt desc)[0...3] {
      _id, name, price, description, images
    }`,
    {},
    REVALIDATE
  );
}

export async function getPhotoStripImages() {
  // Check for manually curated strip images first (reads draft too)
  const settings = await serverClient.fetch(
    `*[_type == "siteSettings" && (_id == "siteSettings" || _id == "drafts.siteSettings")] | order(_updatedAt desc)[0] { photoStrip }`,
    {},
    { next: { revalidate: 60 } }
  );

  if (settings?.photoStrip && settings.photoStrip.length > 0) {
    return settings.photoStrip.map(
      (img: Record<string, unknown>, i: number) => ({
        id: `strip-${i}`,
        label: "",
        img,
      })
    );
  }

  // No manual images set — return empty (strip hidden on home page)
  return [];
}

export async function getSiteSettings() {
  // Use authenticated server client so it can read the draft if not yet published.
  // Prefer published (_id == "siteSettings") over draft, latest updated first.
  return serverClient.fetch(
    `*[_type == "siteSettings" && (_id == "siteSettings" || _id == "drafts.siteSettings")] | order(_updatedAt desc)[0] {
      galleryEnabled, inspirationEnabled,
      vacationMode, vacationReturnDate,
      penTypeImages { fountain, ballpoint },
      aboutPage { para1, para2, para3, para4 },
      contactPage { subtitle, instagramHandle },
      shipping { tier1Fee, tier2Threshold, tier2Fee, freeThreshold }
    }`,
    {},
    { next: { revalidate: 60 } }
  );
}

export async function getInspirationItems() {
  return client.fetch(
    `*[_type == "galleryItem" && sold == true] | order(publishedAt desc) {
      _id, name, price, description, images
    }`,
    {},
    REVALIDATE
  );
}
