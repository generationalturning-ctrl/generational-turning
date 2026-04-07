"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { ProfitToolComponent } from "./plugins/ProfitTool";

export default defineConfig({
  basePath: "/studio",
  projectId: "5waq1udk",
  dataset: "production",
  title: "Generational Turning",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
            S.divider(),
            S.listItem()
              .title("Pen Styles")
              .child(S.documentTypeList("penStyle").title("Pen Styles")),
            S.listItem()
              .title("Blanks")
              .child(S.documentTypeList("blank").title("Blanks")),
            S.listItem()
              .title("Add-ons (Ink & Boxes)")
              .child(S.documentTypeList("addOn").title("Add-ons")),
            S.divider(),
            S.listItem()
              .title("Gallery (Available)")
              .child(
                S.documentTypeList("galleryItem")
                  .title("Gallery — Available")
                  .filter("_type == 'galleryItem' && sold != true")
              ),
            S.listItem()
              .title("Inspiration (Sold)")
              .child(
                S.documentTypeList("galleryItem")
                  .title("Inspiration — Sold")
                  .filter("_type == 'galleryItem' && sold == true")
              ),
            S.divider(),
            S.listItem()
              .title("Orders")
              .child(
                S.documentTypeList("order")
                  .title("Orders")
                  .defaultOrdering([{ field: "orderDate", direction: "desc" }])
              ),
            S.listItem()
              .title("Sale Records (Profit)")
              .child(
                S.documentTypeList("saleRecord")
                  .title("Sale Records")
                  .defaultOrdering([{ field: "saleDate", direction: "desc" }])
              ),
          ]),
    }),
    visionTool(),
  ],
  tools: [
    {
      name: "profit",
      title: "Sales & Profit",
      component: ProfitToolComponent,
    },
  ],
  schema: {
    types: schemaTypes,
  },
});
