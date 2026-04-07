import { createClient } from "@sanity/client";
import { createReadStream } from "fs";
import path from "path";

const client = createClient({
  projectId: "5waq1udk",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "sk4yjTci1TZvRtdLSFvjsK2245tMUORnkZ20Lzuu0HvQRNgl9816dRCJ5Hjz1oFnjIisCYxX8EEtks5Cm",
  useCdn: false,
});

const IMAGE_DIR = "C:/Users/simon/OneDrive/Pens";

const blanks = [
  { name: "Ancient Bog Oak",     file: "ancientbogoak.jpg",      price: 18, category: "wood",          order: 1  },
  { name: "Birdseye Maple",      file: "birdseyemaple.jpg",      price: 15, category: "wood",          order: 2  },
  { name: "Bloodwood",           file: "bloodwood.jpg",          price: 10, category: "wood",          order: 3  },
  { name: "Cocobolo",            file: "cocobolo.jpg",           price: 10, category: "wood",          order: 4  },
  { name: "King Wood",           file: "kingwood.jpg",           price: 15, category: "wood",          order: 5  },
  { name: "Padauk",              file: "paduk.jpg",              price: 10, category: "wood",          order: 6  },
  { name: "Purple Heart",        file: "purpleheart.jpg",        price: 10, category: "wood",          order: 7  },
  { name: "Redwood Lace Burl",   file: "redwoodlaceburl.jpg",    price: 18, category: "wood",          order: 8  },
  { name: "Walnut",              file: "walnut.jpg",             price: 10, category: "wood",          order: 9  },
  { name: "Wenge",               file: "wenge.jpg",              price: 10, category: "wood",          order: 10 },
  { name: "Black Box Elder",     file: "blackboxelder.jpg",      price: 18, category: "stabilizedBurl", order: 11 },
  { name: "Black Red Buckeye",   file: "blackredbuckeye.jpg",    price: 22, category: "stabilizedBurl", order: 12 },
  { name: "Blue Purple Buckeye", file: "bluepruplebuckeye.jpg",  price: 22, category: "stabilizedBurl", order: 13 },
  { name: "Buckeye Burl",        file: "buckeyeburl.jpg",        price: 22, category: "stabilizedBurl", order: 14 },
  { name: "Purple Haze Maple",   file: "purplehazemaple.jpg",    price: 18, category: "stabilizedBurl", order: 15 },
  { name: "Red Wine Box Elder",  file: "redwineboxelder.jpg",    price: 18, category: "stabilizedBurl", order: 16 },
  { name: "Black Pearlux",       file: "blackpearlux.jpg",       price: 20, category: "acrylic",       order: 17 },
  { name: "Blue Pearlux",        file: "bluepearlux.jpg",        price: 20, category: "acrylic",       order: 18 },
  { name: "Bronze Pearlux",      file: "bronzepearlux.jpg",      price: 20, category: "acrylic",       order: 19 },
  { name: "Green Pearlux",       file: "greenpearlux.jpg",       price: 20, category: "acrylic",       order: 20 },
  { name: "Purple Pearlux",      file: "purplepearlux.jpg",      price: 20, category: "acrylic",       order: 21 },
  { name: "White Lightning",     file: "whitelighting.JPG",      price: 12, category: "acrylic",       order: 22 },
];

async function uploadImage(filename) {
  const filepath = path.join(IMAGE_DIR, filename);
  const asset = await client.assets.upload("image", createReadStream(filepath), {
    filename,
  });
  return asset._id;
}

async function main() {
  for (const blank of blanks) {
    process.stdout.write(`Importing ${blank.name}...`);
    try {
      const assetId = await uploadImage(blank.file);
      await client.create({
        _type: "blank",
        name: blank.name,
        category: blank.category,
        price: blank.price,
        inStock: true,
        order: blank.order,
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
