import { defineField, defineType } from "sanity";

export const galleryItem = defineType({
  name: "galleryItem",
  title: "Gallery Item",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "price",
      title: "Price (CAD)",
      type: "number",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "sold",
      title: "Sold",
      description: "Tick this when the item sells — it will move to the Inspiration page automatically.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "featured",
      title: "Featured on Home Page",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "sold", media: "images.0" },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? "SOLD" : "Available", media };
    },
  },
  orderings: [
    { title: "Newest First", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
});
