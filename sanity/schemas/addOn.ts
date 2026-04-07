import { defineField, defineType } from "sanity";

export const addOn = defineType({
  name: "addOn",
  title: "Add-on",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "addOnType",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Fountain Pen Ink", value: "fountainInk" },
          { title: "Ballpoint Refill", value: "ballpointInk" },
          { title: "Box", value: "box" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "price",
      title: "Price (CAD)",
      type: "number",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "inStock",
      title: "In Stock",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "supplierCost",
      title: "Your Cost Per Unit (CAD)",
      description: "Amortize multi-packs here (e.g. 5-pack for $5 = $1 per unit). Used for profit calculations.",
      type: "number",
    }),
    defineField({
      name: "compatiblePenStyles",
      title: "Compatible Pen Styles",
      description: "Leave empty to show for all pens of this type. Select specific styles to restrict this add-on to only those pens.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "penStyle" }] }],
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "addOnType", media: "image" },
    prepare({ title, subtitle, media }) {
      const labels: Record<string, string> = {
        fountainInk: "Fountain Ink",
        ballpointInk: "Ballpoint Refill",
        box: "Box",
      };
      return { title, subtitle: labels[subtitle] ?? subtitle, media };
    },
  },
});
