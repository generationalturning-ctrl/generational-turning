import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "5waq1udk",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "sk4yjTci1TZvRtdLSFvjsK2245tMUORnkZ20Lzuu0HvQRNgl9816dRCJ5Hjz1oFnjIisCYxX8EEtks5Cm",
  useCdn: false,
});

// Cigar and Luxor pen style IDs
const COMPATIBLE_IDS = [
  "c65bda9d-b39a-458c-83a1-b0fd710f6837", // Cigar Pen
  "27818451-a390-4fbd-9f88-70a4b9aed13d", // Luxor Click Pen
];

const inks = [
  {
    name: "Turquoise",
    imageUrl: "https://www.penblanks.ca/media/catalog/product/cache/2af32ad2f14bc45eddbecc81fefb8d19/9/8/98a4e352f688eb8e7cdb217338022f3d740fc4ee75dd24548594c7feb54f3bb4_2.jpg",
    order: 1,
  },
  {
    name: "Red",
    imageUrl: "https://www.penblanks.ca/media/catalog/product/cache/2af32ad2f14bc45eddbecc81fefb8d19/p/9/p900_red_m3__17419.jpg",
    order: 2,
  },
  {
    name: "Magenta",
    imageUrl: "https://www.penblanks.ca/media/catalog/product/cache/2af32ad2f14bc45eddbecc81fefb8d19/4/2/42f9dec4c0239b79d65c81de90aefee96b0d6e26cd5c305972d62640c833a067_2.jpg",
    order: 3,
  },
  {
    name: "Purple",
    imageUrl: "https://www.penblanks.ca/media/catalog/product/cache/2af32ad2f14bc45eddbecc81fefb8d19/f/4/f4e86f25926f049c23f340e95864226b911623baf900f7260b41a1beeb2f2788_2.jpg",
    order: 4,
  },
  {
    name: "Green",
    imageUrl: "https://www.penblanks.ca/media/catalog/product/cache/2af32ad2f14bc45eddbecc81fefb8d19/e/4/e407590763e3dfea9e2a13d7e3ac8959c44401c4db01e854a1b3676f5cd0d4a1_2.jpg",
    order: 5,
  },
  {
    name: "Black",
    imageUrl: "https://www.penblanks.ca/media/catalog/product/cache/2af32ad2f14bc45eddbecc81fefb8d19/s/c/schmidt_p900_black_2000.jpg",
    order: 6,
  },
];

async function uploadFromUrl(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const asset = await client.assets.upload("image", Buffer.from(buffer), { filename });
  return asset._id;
}

async function main() {
  for (const ink of inks) {
    process.stdout.write(`Importing ${ink.name}...`);
    try {
      const assetId = await uploadFromUrl(ink.imageUrl, `parker-${ink.name.toLowerCase()}.jpg`);
      await client.create({
        _type: "addOn",
        name: `${ink.name} (Parker Refill)`,
        addOnType: "ballpointInk",
        price: 5,
        inStock: true,
        order: ink.order,
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        },
        compatiblePenStyles: COMPATIBLE_IDS.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: id,
        })),
      });
      console.log(" done");
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
    }
  }
  console.log("\nAll done!");
}

main();
