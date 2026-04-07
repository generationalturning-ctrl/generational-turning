import { defineField, defineType } from "sanity";

export const order = defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      readOnly: true,
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "itemType", title: "Type", type: "string" }),
            defineField({ name: "name", title: "Name", type: "string" }),
            defineField({ name: "details", title: "Details", type: "string" }),
            defineField({ name: "quantity", title: "Quantity", type: "number" }),
            defineField({ name: "unitPrice", title: "Unit Price", type: "number" }),
            defineField({ name: "lineTotal", title: "Line Total", type: "number" }),
          ],
          preview: {
            select: { title: "name", subtitle: "details" },
          },
        },
      ],
    }),
    defineField({
      name: "total",
      title: "Order Total (CAD)",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "object",
      readOnly: true,
      fields: [
        defineField({ name: "address1", title: "Address Line 1", type: "string" }),
        defineField({ name: "address2", title: "Address Line 2", type: "string" }),
        defineField({ name: "city", title: "City", type: "string" }),
        defineField({ name: "province", title: "Province", type: "string" }),
        defineField({ name: "postalCode", title: "Postal Code", type: "string" }),
        defineField({ name: "country", title: "Country", type: "string" }),
      ],
    }),
    defineField({
      name: "promotionalConsent",
      title: "Photo / Promotional Consent",
      type: "boolean",
      readOnly: true,
    }),
    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe Payment Intent ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Received", value: "received" },
          { title: "In Progress", value: "inProgress" },
          { title: "Shipped", value: "shipped" },
          { title: "Complete", value: "complete" },
        ],
        layout: "radio",
      },
      initialValue: "received",
    }),
    defineField({
      name: "shippedEmailSent",
      title: "Shipped Email Sent",
      type: "boolean",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "notes",
      title: "Internal Notes",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "customerName",
      subtitle: "orderDate",
      status: "status",
    },
    prepare({ title, subtitle, status }) {
      const labels: Record<string, string> = {
        received: "📬 Received",
        inProgress: "🔨 In Progress",
        shipped: "📦 Shipped",
        complete: "✅ Complete",
      };
      return {
        title: title ?? "Unknown Customer",
        subtitle: `${labels[status] ?? status}  ·  ${subtitle ? new Date(subtitle).toLocaleDateString() : ""}`,
      };
    },
  },
  orderings: [
    {
      title: "Most Recent",
      name: "orderDateDesc",
      by: [{ field: "orderDate", direction: "desc" }],
    },
  ],
});
