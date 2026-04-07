import { defineField, defineType } from "sanity";

const PEN_STYLES = [
  { title: "Leveche Fountain Pen", value: "Leveche Fountain Pen" },
  { title: "Magnetic Vertex Fountain Pen", value: "Magnetic Vertex Fountain Pen" },
  { title: "Eros Calligraphy Pen Kit", value: "Eros Calligraphy Pen Kit" },
  { title: "Luxor Ballpoint Pen", value: "Luxor Ballpoint Pen" },
  { title: "Slimline Ballpoint Pen", value: "Slimline Ballpoint Pen" },
  { title: "Cigar Ballpoint Pen", value: "Cigar Ballpoint Pen" },
];

const BLANKS = [
  { title: "Ancient Bog Oak", value: "Ancient Bog Oak" },
  { title: "Birdseye Maple", value: "Birdseye Maple" },
  { title: "Black Box Elder", value: "Black Box Elder" },
  { title: "Black Pearlux", value: "Black Pearlux" },
  { title: "Black Red Buckeye", value: "Black Red Buckeye" },
  { title: "Bloodwood", value: "Bloodwood" },
  { title: "Blue Pearlux", value: "Blue Pearlux" },
  { title: "Blue Purple Buckeye", value: "Blue Purple Buckeye" },
  { title: "Bronze Pearlux", value: "Bronze Pearlux" },
  { title: "Buckeye Burl", value: "Buckeye Burl" },
  { title: "Cocobolo", value: "Cocobolo" },
  { title: "Green Pearlux", value: "Green Pearlux" },
  { title: "King Wood", value: "King Wood" },
  { title: "Padauk", value: "Padauk" },
  { title: "Purple Haze Maple", value: "Purple Haze Maple" },
  { title: "Purple Heart", value: "Purple Heart" },
  { title: "Purple Pearlux", value: "Purple Pearlux" },
  { title: "Red Wine Box Elder", value: "Red Wine Box Elder" },
  { title: "Redwood Lace Burl", value: "Redwood Lace Burl" },
  { title: "Walnut", value: "Walnut" },
  { title: "Wenge", value: "Wenge" },
  { title: "White Lightning", value: "White Lightning" },
];

const ADD_ONS = [
  { title: "No add-ons", value: "none" },
  { title: "Box — 2 Pen Leather Box", value: "2 Pen Leather Box" },
  { title: "Box — Triangle Pen Box", value: "Triangle Pen Box" },
  { title: "Box — Fliptop Box", value: "Fliptop Box" },
  { title: "Ink — Peacock Green (Fountain)", value: "Peacock Green" },
  { title: "Ink — Blue-Black (Fountain)", value: "Blue-Black" },
  { title: "Ink — Zodiac Blue (Fountain)", value: "Zodiac Blue" },
  { title: "Ink — Obsidian Black (Fountain)", value: "Obsidian Black" },
  { title: "Ink — Magenta (Ballpoint)", value: "Magenta" },
  { title: "Ink — Purple (Ballpoint)", value: "Purple" },
  { title: "Ink — Red (Ballpoint)", value: "Red" },
  { title: "Ink — Black (Ballpoint)", value: "Black" },
  { title: "Ink — Turquoise (Ballpoint)", value: "Turquoise" },
];

export const saleRecord = defineType({
  name: "saleRecord",
  title: "Sale Record",
  type: "document",
  fields: [
    defineField({
      name: "saleDate",
      title: "Sale Date",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "penStyle",
      title: "Pen Style",
      type: "string",
      options: { list: PEN_STYLES },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "blank",
      title: "Blank",
      type: "string",
      options: { list: BLANKS },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "addOn",
      title: "Add-on (if any)",
      type: "string",
      options: { list: ADD_ONS },
    }),
    defineField({
      name: "quantity",
      title: "Quantity",
      type: "number",
      initialValue: 1,
      validation: (r) => r.required().positive().integer(),
    }),
    defineField({
      name: "salePrice",
      title: "Total Charged (CAD)",
      type: "number",
      description: "The actual amount the customer paid.",
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: "penStyle",
      subtitle: "blank",
      date: "saleDate",
    },
    prepare({ title, subtitle, date }) {
      return {
        title: title ?? "Sale",
        subtitle: `${subtitle ?? ""}  ·  ${date ?? ""}`,
      };
    },
  },
  orderings: [
    {
      title: "Most Recent",
      name: "saleDateDesc",
      by: [{ field: "saleDate", direction: "desc" }],
    },
  ],
});
