import { defineField, defineType } from "sanity";

export const penStyle = defineType({
  name: "penStyle",
  title: "Pen Style",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "penType",
      title: "Pen Type",
      type: "string",
      options: {
        list: [
          { title: "Fountain", value: "fountain" },
          { title: "Ballpoint", value: "ballpoint" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "basePrice",
      title: "Base Price (CAD)",
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
      name: "previewImage",
      title: "Preview Image (shown on style selector)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "metalColours",
      title: "Metal Colour Options",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "colour",
              title: "Colour",
              type: "string",
              options: {
                list: [
                  { title: "Gold", value: "gold" },
                  { title: "Silver", value: "silver" },
                  { title: "Gun Metal", value: "gunmetal" },
                  { title: "Satin", value: "satin" },
                ],
              },
            }),
            defineField({
              name: "image",
              title: "Image (legacy — use Images below)",
              type: "image",
              options: { hotspot: true },
              hidden: true,
            }),
            defineField({
              name: "images",
              title: "Images (add multiple to show different angles/nibs)",
              type: "array",
              of: [{ type: "image", options: { hotspot: true } }],
            }),
            defineField({
              name: "cardImagePosition",
              title: "Card Image Position (legacy)",
              type: "string",
              hidden: true,
            }),
            defineField({
              name: "imageZoom",
              title: "Zoom",
              description: "Zoom in (positive) or out (negative). 0 = default. Try -5 to show more of the pen.",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "imageOffsetX",
              title: "Horizontal Offset",
              description: "Shift image left (negative) or right (positive). 0 = centred. Try values like -10 or 15.",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "imageOffsetY",
              title: "Vertical Offset",
              description: "Shift image up (negative) or down (positive). 0 = centred. Try -15 to raise the pen.",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "supplierUrl",
              title: "Supplier URL (for stock checking)",
              type: "url",
            }),
          ],
          preview: {
            select: { title: "colour", media: "images.0" },
          },
        },
      ],
    }),
    defineField({
      name: "inStock",
      title: "In Stock",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "penType", media: "previewImage" },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle === "fountain" ? "Fountain Pen" : "Ballpoint Pen",
        media,
      };
    },
  },
  orderings: [
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
});
