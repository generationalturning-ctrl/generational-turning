import { createClient } from "@sanity/client";
import { createReadStream } from "fs";

const client = createClient({
  projectId: "5waq1udk",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "sk4yjTci1TZvRtdLSFvjsK2245tMUORnkZ20Lzuu0HvQRNgl9816dRCJ5Hjz1oFnjIisCYxX8EEtks5Cm",
  useCdn: false,
});

const SLIMLINE_ID = "5be9e87c-d89f-49a7-9723-785757bce686";

const inks = [
  {
    name: "Blue (Cross Refill)",
    file: "C:/Users/simon/Downloads/Sleek pen refill on white background.png",
    supplierCost: 1, // $5 for 5-pack = $1 each
    order: 1,
  },
  {
    name: "Black (Cross Refill)",
    file: "C:/Users/simon/Downloads/Pen refill on white backdrop.png",
    supplierCost: 1,
    order: 2,
  },
];

async function main() {
  for (const ink of inks) {
    process.stdout.write(`Importing ${ink.name}...`);
    try {
      const asset = await client.assets.upload("image", createReadStream(ink.file), {
        filename: ink.file.split("/").pop(),
      });
      await client.create({
        _type: "addOn",
        name: ink.name,
        addOnType: "ballpointInk",
        price: 5,
        supplierCost: ink.supplierCost,
        inStock: true,
        order: ink.order,
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        },
        compatiblePenStyles: [
          { _type: "reference", _ref: SLIMLINE_ID, _key: SLIMLINE_ID },
        ],
      });
      console.log(" done");
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
    }
  }
  console.log("\nAll done!");
}

main();
