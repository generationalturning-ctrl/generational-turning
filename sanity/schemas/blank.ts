import { defineField, defineType } from "sanity";

export const blank = defineType({
  name: "blank",
  title: "Blank",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Acrylic", value: "acrylic" },
          { title: "Stabilized Burl", value: "stabilizedBurl" },
          { title: "Wood", value: "wood" },
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
      name: "supplierUrl",
      title: "Supplier URL (for stock checking)",
      type: "url",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "category", media: "image" },
    prepare({ title, subtitle, media }) {
      const labels: Record<string, string> = {
        acrylic: "Acrylic",
        stabilizedBurl: "Stabilized Burl",
        wood: "Wood",
      };
      return { title, subtitle: labels[subtitle] ?? subtitle, media };
    },
  },
});
