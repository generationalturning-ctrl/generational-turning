/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useClient } from "sanity";
import { useState, useEffect } from "react";

// ── Cost data from CSV ────────────────────────────────────────────────────────
const PEN_COSTS: Record<string, number> = {
  "Leveche Fountain Pen": 40,
  "Magnetic Vertex Fountain Pen": 25,
  "Eros Calligraphy Pen Kit": 28,
  "Luxor Ballpoint Pen": 23,
  "Slimline Ballpoint Pen": 6,
  "Cigar Ballpoint Pen": 10,
};

const BLANK_COSTS: Record<string, number> = {
  "White Lightning": 5,
  "Green Pearlux": 15,
  "Blue Pearlux": 15,
  "Purple Pearlux": 15,
  "Black Pearlux": 15,
  "Bronze Pearlux": 15,
  "Blue Purple Buckeye": 16,
  "Red Wine Box Elder": 14,
  "Black Box Elder": 14,
  "Black Red Buckeye": 16,
  "Purple Haze Maple": 14,
  "Buckeye Burl": 16,
  "King Wood": 10,
  "Birdseye Maple": 9,
  "Purple Heart": 2,
  "Walnut": 2,
  "Cocobolo": 6,
  "Wenge": 2,
  "Redwood Lace Burl": 12,
  "Bloodwood": 3,
  "Ancient Bog Oak": 11,
  "Padauk": 2,
};

// Fallback costs for add-ons not yet in Sanity with supplierCost set
const ADD_ON_COSTS_FALLBACK: Record<string, number> = {
  "2 Pen Leather Box": 8,
  "Triangle Pen Box": 4,
  "Fliptop Box": 4,
  "Peacock Green": 14,
  "Blue-Black": 14,
  "Zodiac Blue": 14,
  "Obsidian Black": 14,
  "Magenta": 2,
  "Purple": 2,
  "Red": 2,
  "Black": 2,
  "Turquoise": 2,
};

// ── Types ─────────────────────────────────────────────────────────────────────
type SaleRecord = {
  _id: string;
  saleDate: string;
  penStyle: string;
  blank: string;
  addOn?: string;
  quantity: number;
  salePrice: number;
  notes?: string;
};

type Summary = {
  revenue: number;
  cost: number;
  profit: number;
  count: number;
};

// ── Component ─────────────────────────────────────────────────────────────────
export function ProfitToolComponent() {
  const client = useClient({ apiVersion: "2024-01-01" });

  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [addOnCosts, setAddOnCosts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
  const [period, setPeriod] = useState<"all" | "month" | "year">("all");

  useEffect(() => {
    Promise.all([
      client.fetch<SaleRecord[]>(
        `*[_type == "saleRecord"] | order(saleDate desc) {
          _id, saleDate, penStyle, blank, addOn, quantity, salePrice, notes
        }`
      ),
      client.fetch<{ name: string; supplierCost: number }[]>(
        `*[_type == "addOn" && defined(supplierCost)] { name, supplierCost }`
      ),
    ])
      .then(([salesData, addOnsData]) => {
        setRecords(salesData);
        // Build cost map from Sanity add-ons, merged with fallback
        const fromSanity: Record<string, number> = {};
        for (const a of addOnsData) {
          fromSanity[a.name] = a.supplierCost;
        }
        setAddOnCosts({ ...ADD_ON_COSTS_FALLBACK, ...fromSanity });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [client]);

  const filtered = records.filter((r) => {
    if (period === "all") return true;
    const d = new Date(r.saleDate);
    const now = new Date();
    if (period === "month") {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    if (period === "year") {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  function getCost(penStyle: string, blank: string, addOn?: string): number {
    return (
      (PEN_COSTS[penStyle] ?? 0) +
      (BLANK_COSTS[blank] ?? 0) +
      (addOn && addOn !== "none" ? (addOnCosts[addOn] ?? 0) : 0)
    );
  }

  const summary: Summary = filtered.reduce(
    (acc, r) => {
      const qty = r.quantity ?? 1;
      const cost = getCost(r.penStyle, r.blank, r.addOn) * qty;
      const revenue = r.salePrice;
      return {
        revenue: acc.revenue + revenue,
        cost: acc.cost + cost,
        profit: acc.profit + (revenue - cost),
        count: acc.count + qty,
      };
    },
    { revenue: 0, cost: 0, profit: 0, count: 0 }
  );

  const tabStyle = (active: boolean) => ({
    padding: "8px 20px",
    borderRadius: 0,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    background: active ? "#c9a84c" : "transparent",
    color: active ? "#0a0a0a" : "#ffffff99",
    border: "none",
  });

  const periodBtn = (p: typeof period, label: string) => (
    <button
      key={p}
      onClick={() => setPeriod(p)}
      style={{
        padding: "4px 14px",
        borderRadius: 0,
        cursor: "pointer",
        fontSize: 12,
        background: period === p ? "#2a2a2a" : "transparent",
        color: period === p ? "#c9a84c" : "#ffffff55",
        border: period === p ? "1px solid #3a3a3a" : "1px solid transparent",
      }}
    >
      {label}
    </button>
  );

  const card = (label: string, value: string, colour: string) => (
    <div
      key={label}
      style={{
        background: "#141414",
        border: "1px solid #2a2a2a",
        borderRadius: 0,
        padding: "20px 24px",
        flex: 1,
        minWidth: 150,
      }}
    >
      <p style={{ color: "#ffffff55", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ color: colour, fontSize: 26, fontWeight: 700 }}>{value}</p>
    </div>
  );

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: "#c9a84c" }}>
        Sales & Profit
      </h1>
      <p style={{ color: "#ffffff55", fontSize: 13, marginBottom: 28 }}>
        Log sales from the{" "}
        <em>Sale Records</em> section in the sidebar. Costs are calculated automatically from your pricing sheet.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button style={tabStyle(activeTab === "dashboard")} onClick={() => setActiveTab("dashboard")}>
          Dashboard
        </button>
        <button style={tabStyle(activeTab === "history")} onClick={() => setActiveTab("history")}>
          Sale History
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#ffffff55" }}>Loading…</p>
      ) : records.length === 0 ? (
        <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 0, padding: 32, textAlign: "center" }}>
          <p style={{ color: "#ffffff55", marginBottom: 8 }}>No sales recorded yet.</p>
          <p style={{ color: "#ffffff33", fontSize: 13 }}>
            Add entries via <strong style={{ color: "#c9a84c" }}>Sale Records</strong> in the sidebar.
          </p>
        </div>
      ) : activeTab === "dashboard" ? (
        <>
          {/* Period filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {periodBtn("all", "All Time")}
            {periodBtn("year", "This Year")}
            {periodBtn("month", "This Month")}
          </div>

          {/* Summary cards */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
            {card("Revenue", `$${summary.revenue.toFixed(2)}`, "#c9a84c")}
            {card("Material Cost", `$${summary.cost.toFixed(2)}`, "#ffffff99")}
            {card("Profit", `$${summary.profit.toFixed(2)}`, summary.profit >= 0 ? "#4ade80" : "#f87171")}
            {card("Pens Sold", String(summary.count), "#ffffff")}
          </div>

          {/* Margin */}
          {summary.revenue > 0 && (
            <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 0, padding: "16px 24px" }}>
              <p style={{ color: "#ffffff55", fontSize: 12, marginBottom: 6 }}>PROFIT MARGIN</p>
              <div style={{ background: "#2a2a2a", borderRadius: 0, height: 8, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, (summary.profit / summary.revenue) * 100))}%`,
                    height: "100%",
                    background: "#c9a84c",
                    borderRadius: 0,
                    transition: "width 0.4s",
                  }}
                />
              </div>
              <p style={{ color: "#c9a84c", fontSize: 20, fontWeight: 700, marginTop: 8 }}>
                {((summary.profit / summary.revenue) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </>
      ) : (
        /* Sale History */
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                {["Date", "Pen Style", "Blank", "Add-on", "Qty", "Sale Price", "Cost", "Profit"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#ffffff55", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const qty = r.quantity ?? 1;
                const cost = getCost(r.penStyle, r.blank, r.addOn) * qty;
                const profit = r.salePrice - cost;
                return (
                  <tr key={r._id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "10px 12px", color: "#ffffff99", whiteSpace: "nowrap" }}>{r.saleDate}</td>
                    <td style={{ padding: "10px 12px", color: "#fff" }}>{r.penStyle}</td>
                    <td style={{ padding: "10px 12px", color: "#ffffff99" }}>{r.blank}</td>
                    <td style={{ padding: "10px 12px", color: "#ffffff55" }}>{r.addOn && r.addOn !== "none" ? r.addOn : "—"}</td>
                    <td style={{ padding: "10px 12px", color: "#ffffff99", textAlign: "center" }}>{qty}</td>
                    <td style={{ padding: "10px 12px", color: "#c9a84c", textAlign: "right" }}>${r.salePrice.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", color: "#ffffff55", textAlign: "right" }}>${cost.toFixed(2)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right", color: profit >= 0 ? "#4ade80" : "#f87171" }}>
                      ${profit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
