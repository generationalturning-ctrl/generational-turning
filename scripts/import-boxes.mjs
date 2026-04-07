import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "5waq1udk",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "sk4yjTci1TZvRtdLSFvjsK2245tMUORnkZ20Lzuu0HvQRNgl9816dRCJ5Hjz1oFnjIisCYxX8EEtks5Cm",
  useCdn: false,
});

const boxes = [
  {
    name: "Deep Pocket Pen Box",
    imageUrl: "https://www.penblanks.ca/media/catalog/product/cache/2af32ad2f14bc45eddbecc81fefb8d19/8/b/8b2d5dc0b6ce88dee7fdadf816ca93d0f99550b981820b05983c3cc4b62370e5_2.jpg",
    order: 1,
  },
  {
    name: "Cardboard Window Box",
    imageUrl: "https://www.penblanks.ca/media/catalog/product/cache/2af32ad2f14bc45eddbecc81fefb8d19/c/a/cardboard_window_pen_boxes_2000.jpg",
    order: 2,
  },
  {
    name: "Black Leatherette Clamshell Box",
    imageUrl: "https://www.penblanks.ca/media/catalog/product/cache/2af32ad2f14bc45eddbecc81fefb8d19/6/b/6bdc5434d790dc44d02deed1611083a467def41f09a25201a5fc2516f9223bc5_2.jpg",
    order: 3,
  },
];

async function uploadFromUrl(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const asset = await client.assets.upload("image", Buffer.from(buffer), { filename });
  return asset._id;
}

async function main() {
  for (const box of boxes) {
    process.stdout.write(`Importing ${box.name}...`);
    try {
      const assetId = await uploadFromUrl(box.imageUrl, `${box.name.toLowerCase().replace(/\s+/g, "-")}.jpg`);
      await client.create({
        _type: "addOn",
        name: box.name,
        addOnType: "box",
        price: 15,
        inStock: true,
        order: box.order,
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        },
      });
      console.log(" done");
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
    }
  }
  console.log("\nAll done!");
}

main();
