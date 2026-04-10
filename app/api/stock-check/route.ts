import { createClient } from "@sanity/client";
import { NextRequest } from "next/server";

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

// Returns true = in stock, false = out of stock, null = fetch failed (don't update)
async function checkInStock(url: string): Promise<boolean | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; stock-checker/1.0)",
        Accept: "text/html",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    return /availability:\s*in\s+stock/i.test(html);
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [blanks, penStyles] = await Promise.all([
    sanity.fetch(
      `*[_type == "blank" && defined(supplierUrl)] { _id, name, inStock, supplierUrl }`
    ),
    sanity.fetch(
      `*[_type == "penStyle"] {
        _id, name, inStock,
        metalColours[]{ _key, colour, supplierUrl, inStock }
      }`
    ),
  ]);

  type Change = { name: string; from: boolean; to: boolean };
  const changes: { blanks: Change[]; colours: Change[]; errors: string[] } = {
    blanks: [],
    colours: [],
    errors: [],
  };

  // Check blanks
  for (const blank of blanks) {
    const current = await checkInStock(blank.supplierUrl);
    await sleep(300);
    if (current === null) {
      changes.errors.push(`blank: ${blank.name}`);
      continue;
    }
    if (current !== blank.inStock) {
      await sanity.patch(blank._id).set({ inStock: current }).commit();
      changes.blanks.push({ name: blank.name, from: blank.inStock, to: current });
    }
  }

  // Check pen style colour options
  for (const penStyle of penStyles) {
    const colours: { _key: string; colour: string; supplierUrl?: string; inStock: boolean }[] =
      penStyle.metalColours ?? [];

    for (const colour of colours) {
      if (!colour.supplierUrl) continue;

      const current = await checkInStock(colour.supplierUrl);
      await sleep(300);

      if (current === null) {
        changes.errors.push(`pen: ${penStyle.name} — ${colour.colour}`);
        continue;
      }

      if (current !== colour.inStock) {
        await sanity
          .patch(penStyle._id)
          .set({ [`metalColours[_key == "${colour._key}"].inStock`]: current })
          .commit();
        changes.colours.push({
          name: `${penStyle.name} — ${colour.colour}`,
          from: colour.inStock,
          to: current,
        });
      }
    }
  }

  console.log("[stock-check]", JSON.stringify(changes));
  return Response.json({ ok: true, ...changes });
}
