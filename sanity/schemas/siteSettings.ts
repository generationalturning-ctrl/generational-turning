import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "vacationMode",
      title: "Vacation Mode",
      description: "Turn on to show a prominent vacation notice on the checkout page.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "vacationReturnDate",
      title: "Vacation Return Date",
      description: "The date you will be back (e.g. May 15, 2025). Shown in the checkout notice when Vacation Mode is on.",
      type: "string",
    }),
    defineField({
      name: "galleryEnabled",
      title: "Gallery Page Enabled",
      description: "Turn off to show a 'coming soon' message instead of the gallery.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "inspirationEnabled",
      title: "Inspiration Page Enabled",
      description: "Turn off to show a 'coming soon' message instead of the inspiration page.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "penTypeImages",
      title: "Pen Type Selection Images",
      description: "Images shown on the Fountain and Ballpoint selection cards in the configurator.",
      type: "object",
      fields: [
        defineField({
          name: "fountain",
          title: "Fountain Pen Image",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "ballpoint",
          title: "Ballpoint Pen Image",
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),
    defineField({
      name: "photoStrip",
      title: "Home Page Photo Strip",
      description: "Add images here to manually control the photo strip. If left empty, pen photos from your catalogue are used automatically.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "aboutPage",
      title: "About Page",
      type: "object",
      fields: [
        defineField({
          name: "para1",
          title: "Paragraph 1",
          type: "text",
          rows: 4,
        }),
        defineField({
          name: "para2",
          title: "Paragraph 2",
          type: "text",
          rows: 4,
        }),
        defineField({
          name: "para3",
          title: "Paragraph 3",
          type: "text",
          rows: 4,
        }),
        defineField({
          name: "para4",
          title: "Paragraph 4",
          type: "text",
          rows: 4,
        }),
      ],
    }),
    defineField({
      name: "contactPage",
      title: "Contact Page",
      type: "object",
      fields: [
        defineField({
          name: "subtitle",
          title: "Subtitle",
          description: "Text shown below the Contact heading.",
          type: "string",
        }),
        defineField({
          name: "instagramHandle",
          title: "Instagram Handle",
          description: "Without the @ symbol.",
          type: "string",
          initialValue: "generational_turning",
        }),
      ],
    }),
    defineField({
      name: "shipping",
      title: "Shipping Rates",
      type: "object",
      fields: [
        defineField({
          name: "tier1Fee",
          title: "Small Order Fee (CAD)",
          description: "Shipping cost for orders below the medium threshold.",
          type: "number",
          initialValue: 12,
          validation: (r) => r.required().positive(),
        }),
        defineField({
          name: "tier2Threshold",
          title: "Medium Order Threshold (CAD)",
          description: "Orders at or above this amount get the medium shipping rate.",
          type: "number",
          initialValue: 100,
          validation: (r) => r.required().positive(),
        }),
        defineField({
          name: "tier2Fee",
          title: "Medium Order Fee (CAD)",
          description: "Shipping cost for orders between the two thresholds.",
          type: "number",
          initialValue: 15,
          validation: (r) => r.required().positive(),
        }),
        defineField({
          name: "freeThreshold",
          title: "Free Shipping Threshold (CAD)",
          description: "Orders at or above this amount get free shipping. Set very high to disable.",
          type: "number",
          initialValue: 200,
          validation: (r) => r.required().positive(),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
