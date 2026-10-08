"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft, Box, Package, PackageCheck, PackageX, Search, X, Plus, Download, Printer, Save, Check,
  AlertCircle, AlertTriangle, FileText, Layers, Ruler, Barcode, Truck, ClipboardCheck, ChevronRight,
  Edit3, Copy, History, Info, Send, Tag, ListChecks, Boxes, RotateCcw, CheckCircle2, XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

/* =====================================================================
   Types
   ===================================================================== */
type PackingStatus = "Approved" | "Pending" | "Rejected" | "Draft";
type PackingType = "Inner Box" | "Master Carton" | "Polybag" | "Hang Tag" | "Tissue Wrap";
type SizeQty = { size: string; qty: number };
type Revision = { v: string; by: string; at: string; note: string };

type PackingSpec = {
  id: string;
  styleCode: string;
  styleName: string;
  customer: string;
  season: string;
  status: PackingStatus;
  version: string;
  updatedBy: string;
  updatedAt: string;
  packingType: PackingType;
  innerPackQty: number; // pairs per inner pack
  totalCartons: number;
  grossWeight: number; // kg / carton
  netWeight: number; // kg / carton
  cartonLength: number; // cm
  cartonWidth: number;
  cartonHeight: number;
  innerBoxMaterial: string;
  masterCartonMaterial: string;
  polybagMaterial: string;
  barcodeType: string;
  skuFormat: string;
  notes: string;
  sizeSystem: string;
  sizeRun: SizeQty[]; // pairs per size in ONE carton
  handling: string[];
  history: Revision[];
};

/* =====================================================================
   Constants & seed data  (replace SEED with your API response)
   ===================================================================== */
const CURRENT_USER = "Alex Morgan";
const TODAY = "2026-10-08";
const PAGE_SIZE = 6;
const MAX_CARTON_KG = 17.5; // customer standard single-person lift limit
const CONTAINER_CBM = { "20' GP": 28, "40' HC": 66 }; // practical load (~85% of internal)
const PACKING_TYPES: PackingType[] = ["Master Carton", "Inner Box", "Polybag", "Hang Tag", "Tissue Wrap"];

const sr = (start: number, qty: number[]): SizeQty[] => qty.map((q, i) => ({ size: String(start + i), qty: q }));

const SEED: PackingSpec[] = [
  {
    id: "PS-001", styleCode: "XBED-001", styleName: "XBED Air Runner", customer: "Star Shoes Pvt Ltd", season: "SS-26",
    status: "Approved", version: "v2.1", updatedBy: "Rahul Sharma", updatedAt: "2026-09-28",
    packingType: "Master Carton", innerPackQty: 1, totalCartons: 250, grossWeight: 14.5, netWeight: 12.8,
    cartonLength: 60, cartonWidth: 40, cartonHeight: 35,
    innerBoxMaterial: "Kraft Paper 300 GSM", masterCartonMaterial: "5-Ply Corrugated", polybagMaterial: "LDPE 40 Micron",
    barcodeType: "EAN-13", skuFormat: "XBED-001-{COLOR}-{SIZE}", notes: "Fragile, handle with care. Store in a dry place.",
    sizeSystem: "UK", sizeRun: sr(6, [1, 2, 3, 3, 2, 1]), handling: ["Fragile", "This Side Up", "Keep Dry"],
    history: [
      { v: "v2.1", by: "Rahul Sharma", at: "2026-09-28", note: "Approved after drop test" },
      { v: "v2.0", by: "Rahul Sharma", at: "2026-09-10", note: "Carton height reduced 38 → 35 cm" },
      { v: "v1.0", by: "Sneha Patel", at: "2026-08-02", note: "First release" },
    ],
  },
  {
    id: "PS-002", styleCode: "ZFLEX-002", styleName: "ZFLEX Trail", customer: "Urban Steps", season: "AW-26",
    status: "Pending", version: "v1.0", updatedBy: "Priya Verma", updatedAt: "2026-09-27",
    packingType: "Master Carton", innerPackQty: 1, totalCartons: 180, grossWeight: 16.2, netWeight: 14.0,
    cartonLength: 62, cartonWidth: 42, cartonHeight: 38,
    innerBoxMaterial: "Kraft Paper 350 GSM", masterCartonMaterial: "5-Ply Corrugated", polybagMaterial: "LDPE 50 Micron",
    barcodeType: "EAN-13", skuFormat: "ZFLEX-002-{COLOR}-{SIZE}", notes: "Premium packaging with tissue wrap inside.",
    sizeSystem: "UK", sizeRun: sr(6, [1, 2, 2, 2, 2, 1]), handling: ["This Side Up", "Keep Dry"],
    history: [{ v: "v1.0", by: "Priya Verma", at: "2026-09-27", note: "Submitted for approval" }],
  },
  {
    id: "PS-003", styleCode: "FD-1102", styleName: "Classic Oxford", customer: "ABC Footwear", season: "AW-26",
    status: "Approved", version: "v3.0", updatedBy: "Amit Kumar", updatedAt: "2026-09-25",
    packingType: "Inner Box", innerPackQty: 1, totalCartons: 320, grossWeight: 11.8, netWeight: 10.5,
    cartonLength: 55, cartonWidth: 38, cartonHeight: 30,
    innerBoxMaterial: "Rigid Box 2mm", masterCartonMaterial: "3-Ply Corrugated", polybagMaterial: "LDPE 40 Micron",
    barcodeType: "Code-128", skuFormat: "FD-1102-{COLOR}-{SIZE}", notes: "Shoe tree included. Dust bag in each box.",
    sizeSystem: "UK", sizeRun: sr(7, [1, 2, 2, 1]), handling: ["Fragile", "Keep Dry"],
    history: [
      { v: "v3.0", by: "Amit Kumar", at: "2026-09-25", note: "Dust bag added to pack-out" },
      { v: "v2.0", by: "Amit Kumar", at: "2026-08-14", note: "Rigid box replaces folding box" },
    ],
  },
  {
    id: "PS-004", styleCode: "SP-5004", styleName: "Sprint Pro", customer: "Star Shoes Pvt Ltd", season: "SS-26",
    status: "Draft", version: "v0.5", updatedBy: "Rahul Sharma", updatedAt: "2026-09-22",
    packingType: "Polybag", innerPackQty: 1, totalCartons: 400, grossWeight: 9.2, netWeight: 8.1,
    cartonLength: 58, cartonWidth: 40, cartonHeight: 28,
    innerBoxMaterial: "N/A", masterCartonMaterial: "5-Ply Corrugated", polybagMaterial: "LDPE 45 Micron",
    barcodeType: "EAN-13", skuFormat: "SP-5004-{COLOR}-{SIZE}", notes: "Bulk packing for export. No inner box.",
    sizeSystem: "UK", sizeRun: sr(6, [2, 3, 5, 5, 3, 2]), handling: ["Keep Dry"],
    history: [{ v: "v0.5", by: "Rahul Sharma", at: "2026-09-22", note: "Draft created from Sprint v1" }],
  },
  {
    id: "PS-005", styleCode: "SF-7010", styleName: "SteelGuard S3", customer: "Star Shoes Pvt Ltd", season: "AW-26",
    status: "Approved", version: "v2.0", updatedBy: "Sneha Patel", updatedAt: "2026-09-20",
    packingType: "Master Carton", innerPackQty: 1, totalCartons: 150, grossWeight: 19.5, netWeight: 17.2,
    cartonLength: 65, cartonWidth: 45, cartonHeight: 40,
    innerBoxMaterial: "Kraft Paper 400 GSM", masterCartonMaterial: "7-Ply Corrugated", polybagMaterial: "LDPE 60 Micron",
    barcodeType: "EAN-13", skuFormat: "SF-7010-{COLOR}-{SIZE}", notes: "Heavy duty. Steel toe protection warning label required.",
    sizeSystem: "UK", sizeRun: sr(7, [1, 2, 2, 2, 1]), handling: ["Heavy: team lift", "This Side Up", "Steel toe warning"],
    history: [
      { v: "v2.0", by: "Sneha Patel", at: "2026-09-20", note: "7-ply carton approved by customer" },
      { v: "v1.0", by: "Sneha Patel", at: "2026-08-05", note: "First release" },
    ],
  },
  {
    id: "PS-006", styleCode: "KD-2201", styleName: "Junior Runner", customer: "Urban Steps", season: "SS-26",
    status: "Approved", version: "v1.2", updatedBy: "Priya Verma", updatedAt: "2026-09-18",
    packingType: "Inner Box", innerPackQty: 1, totalCartons: 200, grossWeight: 8.5, netWeight: 7.2,
    cartonLength: 50, cartonWidth: 35, cartonHeight: 30,
    innerBoxMaterial: "Kraft Paper 250 GSM", masterCartonMaterial: "3-Ply Corrugated", polybagMaterial: "LDPE 35 Micron",
    barcodeType: "EAN-13", skuFormat: "KD-2201-{COLOR}-{SIZE}", notes: "Kids packaging with printed graphics.",
    sizeSystem: "UK Kids", sizeRun: sr(1, [3, 4, 5, 5, 4, 3]), handling: ["This Side Up", "Keep Dry"],
    history: [{ v: "v1.2", by: "Priya Verma", at: "2026-09-18", note: "Size run rebalanced" }],
  },
  {
    id: "PS-007", styleCode: "OT-6003", styleName: "Ridge Hiker", customer: "Urban Steps", season: "AW-26",
    status: "Rejected", version: "v1.1", updatedBy: "Amit Kumar", updatedAt: "2026-09-15",
    packingType: "Master Carton", innerPackQty: 1, totalCartons: 220, grossWeight: 17.8, netWeight: 15.5,
    cartonLength: 64, cartonWidth: 44, cartonHeight: 38,
    innerBoxMaterial: "Kraft Paper 350 GSM", masterCartonMaterial: "5-Ply Corrugated", polybagMaterial: "LDPE 50 Micron",
    barcodeType: "Code-128", skuFormat: "OT-6003-{COLOR}-{SIZE}", notes: "Rejected: gross weight exceeds customer limit. Revise spec.",
    sizeSystem: "UK", sizeRun: sr(6, [1, 2, 2, 2, 2, 1]), handling: ["This Side Up"],
    history: [
      { v: "v1.1", by: "Amit Kumar", at: "2026-09-15", note: "Rejected: carton over 17.5 kg" },
      { v: "v1.0", by: "Amit Kumar", at: "2026-09-09", note: "Submitted for approval" },
    ],
  },
  {
    id: "PS-008", styleCode: "MC-2412", styleName: "Canvas Low", customer: "Urban Steps", season: "SS-27",
    status: "Approved", version: "v2.3", updatedBy: "Sneha Patel", updatedAt: "2026-09-12",
    packingType: "Polybag", innerPackQty: 2, totalCartons: 180, grossWeight: 10.2, netWeight: 9.0,
    cartonLength: 60, cartonWidth: 42, cartonHeight: 32,
    innerBoxMaterial: "N/A", masterCartonMaterial: "5-Ply Corrugated", polybagMaterial: "LDPE 40 Micron",
    barcodeType: "EAN-13", skuFormat: "MC-2412-{COLOR}-{SIZE}", notes: "2 pairs per polybag. Eco-friendly packaging.",
    sizeSystem: "UK", sizeRun: sr(6, [3, 5, 7, 7, 5, 3]), handling: ["Keep Dry", "Recyclable"],
    history: [{ v: "v2.3", by: "Sneha Patel", at: "2026-09-12", note: "Switched to recycled LDPE" }],
  },
];

const blankSpec = (id: string): PackingSpec => ({
  id, styleCode: "NEW-STYLE", styleName: "Untitled style", customer: "", season: "SS-27", status: "Draft", version: "v0.1",
  updatedBy: CURRENT_USER, updatedAt: TODAY, packingType: "Master Carton", innerPackQty: 1, totalCartons: 100,
  grossWeight: 12, netWeight: 10.5, cartonLength: 60, cartonWidth: 40, cartonHeight: 35,
  innerBoxMaterial: "Kraft Paper 300 GSM", masterCartonMaterial: "5-Ply Corrugated", polybagMaterial: "LDPE 40 Micron",
  barcodeType: "EAN-13", skuFormat: "STYLE-{COLOR}-{SIZE}", notes: "", sizeSystem: "UK", sizeRun: sr(6, [1, 2, 3, 3, 2, 1]),
  handling: ["This Side Up", "Keep Dry"], history: [{ v: "v0.1", by: CURRENT_USER, at: TODAY, note: "Spec created" }],
});

/* =====================================================================
   Calculations & validation
   ===================================================================== */
const pairsPerCarton = (s: PackingSpec) => s.sizeRun.reduce((n, x) => n + x.qty, 0);
const totalPairs = (s: PackingSpec) => pairsPerCarton(s) * s.totalCartons;
const cbmOf = (s: PackingSpec) => (s.cartonLength * s.cartonWidth * s.cartonHeight) / 1_000_000;
const volWeightOf = (s: PackingSpec) => (s.cartonLength * s.cartonWidth * s.cartonHeight) / 5000;
const bump = (v: string) => {
  const m = /^v(\d+)\.(\d+)$/.exec(v);
  return m ? `v${m[1]}.${Number(m[2]) + 1}` : v;
};

type Check = { level: "ok" | "warn" | "error"; text: string };

function validate(s: PackingSpec): Check[] {
  const out: Check[] = [];
  const ppc = pairsPerCarton(s);
  out.push(ppc > 0 ? { level: "ok", text: `Size run adds up to ${ppc} pairs per carton` } : { level: "error", text: "Size run is empty. Add pairs for at least one size." });
  out.push(s.netWeight > 0 && s.netWeight < s.grossWeight ? { level: "ok", text: "Net weight is below gross weight" } : { level: "error", text: "Net weight must be greater than 0 and less than gross weight." });
  out.push(s.cartonLength > 0 && s.cartonWidth > 0 && s.cartonHeight > 0 ? { level: "ok", text: "Carton dimensions are set" } : { level: "error", text: "Enter carton length, width and height." });
  out.push(s.grossWeight <= MAX_CARTON_KG ? { level: "ok", text: `Gross weight is within the ${MAX_CARTON_KG} kg lift limit` } : { level: "warn", text: `Gross weight ${s.grossWeight} kg is above the ${MAX_CARTON_KG} kg lift limit.` });
  if (ppc > 0 && s.innerPackQty > 0 && ppc % s.innerPackQty !== 0) out.push({ level: "warn", text: `${ppc} pairs do not divide evenly into inner packs of ${s.innerPackQty}.` });
  if (!s.customer.trim()) out.push({ level: "warn", text: "Customer is missing." });
  return out;
}

type BomRow = { item: string; spec: string; perCarton: number; unit: string; waste: number };
function buildBom(s: PackingSpec): BomRow[] {
  const ppc = pairsPerCarton(s);
  const packs = s.innerPackQty > 0 ? ppc / s.innerPackQty : 0;
  const rows: BomRow[] = [];
  if (s.innerBoxMaterial !== "N/A") rows.push({ item: "Inner box", spec: s.innerBoxMaterial, perCarton: packs, unit: "pcs", waste: 0.02 });
  rows.push({ item: "Polybag", spec: s.polybagMaterial, perCarton: packs, unit: "pcs", waste: 0.03 });
  rows.push({ item: "Tissue paper", spec: "17 GSM, 50 × 70 cm", perCarton: ppc * 2, unit: "sheets", waste: 0.03 });
  rows.push({ item: "Silica gel", spec: "1 g sachet, non-toxic", perCarton: ppc, unit: "pcs", waste: 0.02 });
  rows.push({ item: "Hang tag + barcode sticker", spec: s.barcodeType, perCarton: ppc, unit: "sets", waste: 0.02 });
  rows.push({ item: "Master carton", spec: s.masterCartonMaterial, perCarton: 1, unit: "pcs", waste: 0.01 });
  rows.push({ item: "Carton tape", spec: "48 mm BOPP, clear", perCarton: 2.4, unit: "m", waste: 0.05 });
  rows.push({ item: "Carton label", spec: "4 × 6 inch thermal", perCarton: 2, unit: "pcs", waste: 0.02 });
  return rows;
}

const QC_IDS = ["drop", "dims", "weight", "barcode", "label", "assort", "moist"] as const;
const qcItems = (s: PackingSpec) => [
  { id: "drop", label: "Carton drop test", hint: "1.2 m, 6 drops, no inner damage" },
  { id: "dims", label: "Carton dimensions", hint: `${s.cartonLength} × ${s.cartonWidth} × ${s.cartonHeight} cm, tolerance ± 3 mm` },
  { id: "weight", label: "Gross weight tolerance", hint: `${(s.grossWeight * 0.98).toFixed(1)} to ${(s.grossWeight * 1.02).toFixed(1)} kg (± 2%)` },
  { id: "barcode", label: "Barcode scan verification", hint: `${s.barcodeType}, grade A or better` },
  { id: "label", label: "Label placement and legibility", hint: "Both short-side panels, top-right" },
  { id: "assort", label: "Size assortment matches ratio", hint: `${pairsPerCarton(s)} pairs, as per size run` },
  { id: "moist", label: "Moisture content", hint: "Below 8% at packing" },
];
const initialQc = (s: PackingSpec): string[] =>
  s.status === "Approved" ? [...QC_IDS] : s.status === "Pending" ? QC_IDS.slice(0, 4) : s.status === "Rejected" ? QC_IDS.slice(0, 2) : [];

/* =====================================================================
   Style maps
   ===================================================================== */
type Tone = "indigo" | "emerald" | "amber" | "blue" | "rose" | "slate";
const TONE: Record<Tone, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  rose: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
};
const STATUS_STYLE: Record<PackingStatus, { pill: string; icon: LucideIcon }> = {
  Approved: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: PackageCheck },
  Pending: { pill: "bg-amber-50 text-amber-700 ring-amber-200", icon: AlertCircle },
  Rejected: { pill: "bg-rose-50 text-rose-700 ring-rose-200", icon: PackageX },
  Draft: { pill: "bg-slate-100 text-slate-600 ring-slate-200", icon: FileText },
};
const PACK_ICON: Record<PackingType, { icon: LucideIcon; tone: Tone }> = {
  "Master Carton": { icon: Package, tone: "blue" },
  "Inner Box": { icon: Box, tone: "indigo" },
  Polybag: { icon: Layers, tone: "emerald" },
  "Hang Tag": { icon: Tag, tone: "amber" },
  "Tissue Wrap": { icon: FileText, tone: "slate" },
};

const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const fmtN = (n: number) => n.toLocaleString("en-IN");

const sel =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200";
const inputCls =
  "h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200";

/* =====================================================================
   Small building blocks
   ===================================================================== */
function StatusBadge({ s }: { s: PackingStatus }) {
  const Icon = STATUS_STYLE[s].icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${STATUS_STYLE[s].pill}`}>
      <Icon size={12} />
      {s}
    </span>
  );
}

function StatTile({ label, value, unit, hint, icon: Icon, tone }: { label: string; value: string | number; unit?: string; hint?: string; icon: LucideIcon; tone: Tone }) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`grid h-7 w-7 place-items-center rounded-lg transition-transform group-hover:scale-110 ${TONE[tone]}`}>
          <Icon size={14} />
        </span>
      </div>
      <p className="mt-1.5 text-lg font-bold tabular-nums text-slate-900">
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-slate-500">{unit}</span>}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function SectionCard({ title, icon: Icon, tone, children, aside }: { title: string; icon: LucideIcon; tone: Tone; children: ReactNode; aside?: ReactNode }) {
  return (
    <Card className="gap-0 border-slate-200 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`grid h-8 w-8 place-items-center rounded-lg ${TONE[tone]}`}>
            <Icon size={16} />
          </span>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        {aside}
      </div>
      {children}
    </Card>
  );
}

function Row({ label, value, mono, editing, edit }: { label: string; value: ReactNode; mono?: boolean; editing?: boolean; edit?: ReactNode }) {
  if (editing && edit) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
        <dt className="shrink-0 text-xs font-medium text-slate-500">{label}</dt>
        <dd className="w-44">{edit}</dd>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className={`text-right text-sm font-semibold text-slate-900 ${mono ? "font-mono tabular-nums" : ""}`}>{value}</dd>
    </div>
  );
}

function TextIn({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />;
}
function NumIn({ value, onChange, step = 1, min = 0 }: { value: number; onChange: (v: number) => void; step?: number; min?: number }) {
  return (
    <input
      type="number" inputMode="decimal" min={min} step={step} className={`${inputCls} tabular-nums`} value={value}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
    />
  );
}

function Btn({ variant = "outline", icon: Icon, children, className = "", ...rest }: { variant?: "outline" | "dark" | "danger" | "success"; icon?: LucideIcon; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    dark: "bg-[#0b0b14] text-white hover:bg-slate-800",
    danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
  }[variant];
  return (
    <button type="button" {...rest} className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}>
      {Icon && <Icon size={13} />}
      {children}
    </button>
  );
}

/* Isometric carton drawing: proportions follow the real L × W × H */
function CartonVisual({ l, w, h }: { l: number; w: number; h: number }) {
  const L = Math.max(l, 1), W = Math.max(w, 1), H = Math.max(h, 1);
  const c = 0.866, sn = 0.5;
  const s = Math.min(210 / ((L + W) * c), 105 / ((L + W) * sn + H));
  const a = L * s, b = W * s, hh = H * s;
  const totalW = (a + b) * c, totalH = (a + b) * sn + hh;
  const fx = (300 - totalW) / 2 + b * c;
  const fy = (170 - totalH) / 2 + totalH + 6;
  type P = [number, number];
  const F: P = [fx, fy];
  const R: P = [fx + a * c, fy - a * sn];
  const Lf: P = [fx - b * c, fy - b * sn];
  const B: P = [R[0] - b * c, R[1] - b * sn];
  const up = (p: P): P => [p[0], p[1] - hh];
  const [Fp, Rp, Lp, Bp] = [up(F), up(R), up(Lf), up(B)];
  const pts = (...p: P[]) => p.map((x) => x.join(",")).join(" ");
  const lerp = (p: P, q: P, t: number): P => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const m1 = lerp(Fp, Lp, 0.42), m2 = lerp(Fp, Lp, 0.58);
  const dx = Rp[0] - Fp[0], dy = Rp[1] - Fp[1];
  const tape: P[] = [m1, m2, [m2[0] + dx, m2[1] + dy], [m1[0] + dx, m1[1] + dy]];
  const onRight = (u: number, v: number): P => [F[0] + u * (R[0] - F[0]) + v * (Fp[0] - F[0]), F[1] + u * (R[1] - F[1]) + v * (Fp[1] - F[1])];
  const mid = (p: P, q: P): P => lerp(p, q, 0.5);
  const lMid = mid(F, R), wMid = mid(F, Lf), hMid = mid(Lf, Lp);
  return (
    <svg viewBox="0 0 300 190" className="h-44 w-full" role="img" aria-label={`Carton ${l} by ${w} by ${h} centimetres`}>
      <polygon points={pts(F, Lf, Lp, Fp)} fill="#b98f55" stroke="#7d5f30" strokeWidth="0.8" />
      <polygon points={pts(F, R, Rp, Fp)} fill="#d3ae72" stroke="#7d5f30" strokeWidth="0.8" />
      <polygon points={pts(Fp, Rp, Bp, Lp)} fill="#ecd6a8" stroke="#7d5f30" strokeWidth="0.8" />
      <polygon points={pts(...tape)} fill="#a07a3f" opacity="0.5" />
      <polygon points={pts(onRight(0.55, 0.2), onRight(0.9, 0.2), onRight(0.9, 0.62), onRight(0.55, 0.62))} fill="#fff" stroke="#7d5f30" strokeWidth="0.6" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const u = 0.6 + i * 0.05;
        const p1 = onRight(u, 0.27), p2 = onRight(u, 0.4);
        return <line key={i} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="#111" strokeWidth={i % 2 ? 1 : 2} />;
      })}
      <g fill="#e2e8f0" fontSize="11" fontWeight="600" fontFamily="ui-monospace, monospace">
        <text x={lMid[0] + 8} y={lMid[1] + 14}>{l} cm</text>
        <text x={wMid[0] - 8} y={wMid[1] + 14} textAnchor="end">{w} cm</text>
        <text x={hMid[0] - 8} y={hMid[1] + 4} textAnchor="end">{h} cm</text>
      </g>
    </svg>
  );
}

function BarcodeMock({ value }: { value: string }) {
  let x = 0;
  const bars: { x: number; w: number }[] = [];
  for (const ch of (value + value).split("")) {
    const code = ch.charCodeAt(0);
    for (const w of [(code % 3) + 1, ((code >> 2) % 3) + 1, ((code >> 4) % 3) + 1]) {
      bars.push({ x, w });
      x += w + 1 + (code % 2);
    }
  }
  return (
    <svg viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" className="h-10 w-full" aria-hidden>
      {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={40} fill="#0f172a" />)}
    </svg>
  );
}

/* =====================================================================
   Tabs
   ===================================================================== */
type PatchFn = (p: Partial<PackingSpec>) => void;

function OverviewTab({ s, editing, patch, checks }: { s: PackingSpec; editing: boolean; patch: PatchFn; checks: Check[] }) {
  const cbm = cbmOf(s);
  const totalCbm = cbm * s.totalCartons;
  const vol = volWeightOf(s);
  const per = (cap: number) => (cbm > 0 ? Math.floor(cap / cbm) : 0);
  const hc = CONTAINER_CBM["40' HC"];
  const containers = totalCbm > 0 ? Math.ceil(totalCbm / hc) : 0;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard title="Style details" icon={FileText} tone="slate">
        <dl>
          <Row label="Style code" value={s.styleCode} mono editing={editing} edit={<TextIn value={s.styleCode} onChange={(v) => patch({ styleCode: v })} />} />
          <Row label="Style name" value={s.styleName} editing={editing} edit={<TextIn value={s.styleName} onChange={(v) => patch({ styleName: v })} />} />
          <Row label="Customer" value={s.customer || "Not set"} editing={editing} edit={<TextIn value={s.customer} onChange={(v) => patch({ customer: v })} />} />
          <Row label="Season" value={s.season} editing={editing} edit={<TextIn value={s.season} onChange={(v) => patch({ season: v })} />} />
        </dl>
      </SectionCard>

      <SectionCard title="Packing configuration" icon={Layers} tone="indigo">
        <dl>
          <Row label="Packing type" value={s.packingType} editing={editing} edit={
            <select className={inputCls} value={s.packingType} onChange={(e) => patch({ packingType: e.target.value as PackingType })}>
              {PACKING_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          } />
          <Row label="Pairs per inner pack" value={s.innerPackQty} mono editing={editing} edit={<NumIn value={s.innerPackQty} min={1} onChange={(v) => patch({ innerPackQty: v })} />} />
          <Row label="Total cartons" value={fmtN(s.totalCartons)} mono editing={editing} edit={<NumIn value={s.totalCartons} onChange={(v) => patch({ totalCartons: v })} />} />
          <Row label="Inner box" value={s.innerBoxMaterial} editing={editing} edit={<TextIn value={s.innerBoxMaterial} onChange={(v) => patch({ innerBoxMaterial: v })} />} />
          <Row label="Master carton" value={s.masterCartonMaterial} editing={editing} edit={<TextIn value={s.masterCartonMaterial} onChange={(v) => patch({ masterCartonMaterial: v })} />} />
          <Row label="Polybag" value={s.polybagMaterial} editing={editing} edit={<TextIn value={s.polybagMaterial} onChange={(v) => patch({ polybagMaterial: v })} />} />
        </dl>
      </SectionCard>

      <SectionCard title="Dimensions & weight" icon={Ruler} tone="blue">
        <dl>
          <Row label="Length (cm)" value={s.cartonLength} mono editing={editing} edit={<NumIn value={s.cartonLength} onChange={(v) => patch({ cartonLength: v })} />} />
          <Row label="Width (cm)" value={s.cartonWidth} mono editing={editing} edit={<NumIn value={s.cartonWidth} onChange={(v) => patch({ cartonWidth: v })} />} />
          <Row label="Height (cm)" value={s.cartonHeight} mono editing={editing} edit={<NumIn value={s.cartonHeight} onChange={(v) => patch({ cartonHeight: v })} />} />
          <Row label="Gross weight (kg)" value={s.grossWeight} mono editing={editing} edit={<NumIn value={s.grossWeight} step={0.1} onChange={(v) => patch({ grossWeight: v })} />} />
          <Row label="Net weight (kg)" value={s.netWeight} mono editing={editing} edit={<NumIn value={s.netWeight} step={0.1} onChange={(v) => patch({ netWeight: v })} />} />
          <Row label="Volume per carton" value={`${cbm.toFixed(3)} m³`} mono />
          <Row label="Volumetric weight (÷ 5000)" value={`${vol.toFixed(2)} kg`} mono />
          <Row label="Chargeable weight" value={`${Math.max(vol, s.grossWeight).toFixed(2)} kg`} mono />
        </dl>
      </SectionCard>

      <SectionCard title="Load planning" icon={Truck} tone="emerald">
        <dl>
          <Row label="Total volume" value={`${totalCbm.toFixed(2)} m³`} mono />
          <Row label="Total gross weight" value={`${((s.grossWeight * s.totalCartons) / 1000).toFixed(2)} t`} mono />
          <Row label="Cartons per 20' GP" value={fmtN(per(CONTAINER_CBM["20' GP"]))} mono />
          <Row label="Cartons per 40' HC" value={fmtN(per(hc))} mono />
          <Row label="Containers needed (40' HC)" value={containers} mono />
        </dl>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] text-slate-500">
            <span>Last 40' HC fill</span>
            <span className="font-semibold tabular-nums text-slate-700">{totalCbm > 0 ? Math.round(((totalCbm % hc || hc) / hc) * 100) : 0}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${totalCbm > 0 ? ((totalCbm % hc || hc) / hc) * 100 : 0}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Practical load is about 85% of internal volume.</p>
        </div>
      </SectionCard>

      <SectionCard title="Checks" icon={ClipboardCheck} tone="amber">
        <ul className="space-y-2 text-sm">
          {checks.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-700">
              {c.level === "ok" && <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />}
              {c.level === "warn" && <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />}
              {c.level === "error" && <XCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />}
              <span className={c.level === "error" ? "font-medium text-rose-700" : ""}>{c.text}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Packing notes" icon={Info} tone="slate">
        {editing ? (
          <textarea
            value={s.notes} onChange={(e) => patch({ notes: e.target.value })} rows={5}
            placeholder="Special handling, customer instructions, warnings…"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        ) : (
          <p className="rounded-lg bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-700">{s.notes || "No notes added."}</p>
        )}
      </SectionCard>
    </div>
  );
}

function SizesTab({ s, editing, patch }: { s: PackingSpec; editing: boolean; patch: PatchFn }) {
  const ppc = pairsPerCarton(s);
  const max = Math.max(1, ...s.sizeRun.map((x) => x.qty));
  return (
    <SectionCard title={`Size run per carton (${s.sizeSystem})`} icon={Boxes} tone="indigo" aside={<span className="text-xs text-slate-500">{ppc} pairs per carton</span>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Size</th>
              <th className="py-2 pr-3">Pairs / carton</th>
              <th className="w-1/3 py-2 pr-3">Share</th>
              <th className="py-2 text-right">Total pairs</th>
            </tr>
          </thead>
          <tbody>
            {s.sizeRun.map((x, i) => (
              <tr key={x.size} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-3 font-semibold text-slate-900">{x.size}</td>
                <td className="py-2 pr-3">
                  {editing ? (
                    <div className="w-24"><NumIn value={x.qty} onChange={(v) => patch({ sizeRun: s.sizeRun.map((r, j) => (j === i ? { ...r, qty: v } : r)) })} /></div>
                  ) : <span className="tabular-nums">{x.qty}</span>}
                </td>
                <td className="py-2 pr-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(x.qty / max) * 100}%` }} />
                  </div>
                </td>
                <td className="py-2 text-right font-mono tabular-nums text-slate-700">{fmtN(x.qty * s.totalCartons)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 font-bold text-slate-900">
              <td className="py-2.5 pr-3">Total</td>
              <td className="py-2.5 pr-3 tabular-nums">{ppc}</td>
              <td />
              <td className="py-2.5 text-right font-mono tabular-nums">{fmtN(totalPairs(s))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">Pairs per carton is the sum of this size run. Total pairs = pairs per carton × {fmtN(s.totalCartons)} cartons.</p>
    </SectionCard>
  );
}

function BomTab({ s }: { s: PackingSpec }) {
  const rows = buildBom(s);
  return (
    <SectionCard title="Pack-out materials" icon={ListChecks} tone="blue" aside={<span className="text-xs text-slate-500">For {fmtN(s.totalCartons)} cartons · {fmtN(totalPairs(s))} pairs</span>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Component</th>
              <th className="py-2 pr-3">Specification</th>
              <th className="py-2 pr-3 text-right">Per carton</th>
              <th className="py-2 pr-3 text-right">Wastage</th>
              <th className="py-2 text-right">Required</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.item} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 pr-3 font-semibold text-slate-900">{r.item}</td>
                <td className="py-2.5 pr-3 text-slate-600">{r.spec}</td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums">{Number.isInteger(r.perCarton) ? r.perCarton : r.perCarton.toFixed(1)} {r.unit}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums text-slate-500">{(r.waste * 100).toFixed(0)}%</td>
                <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-slate-900">{fmtN(Math.ceil(r.perCarton * s.totalCartons * (1 + r.waste)))} {r.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">Calculated from size run × cartons plus wastage. Use this as the purchase requirement for packing material.</p>
    </SectionCard>
  );
}

function LabelsTab({ s }: { s: PackingSpec }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard title="Carton label preview" icon={Tag} tone="amber" aside={<span className="text-xs text-slate-500">4 × 6 inch</span>}>
        <div className="rounded-lg border-2 border-slate-800 bg-white p-3 text-slate-900">
          <div className="flex items-start justify-between gap-3 border-b-2 border-slate-800 pb-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{s.customer || "CUSTOMER"}</p>
              <p className="truncate text-xs font-semibold">{s.styleCode} · {s.styleName}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-semibold">CARTON NO.</p>
              <p className="font-mono text-sm font-bold">___ / {s.totalCartons}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[10px] font-semibold">SIZE ASSORTMENT ({s.sizeSystem})</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {s.sizeRun.map((x) => (
                <span key={x.size} className="rounded border border-slate-800 px-1.5 py-0.5 font-mono text-[11px] font-bold">{x.size}×{x.qty}</span>
              ))}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
            <div><p className="font-semibold">G.W.</p><p className="font-mono font-bold">{s.grossWeight} kg</p></div>
            <div><p className="font-semibold">N.W.</p><p className="font-mono font-bold">{s.netWeight} kg</p></div>
            <div><p className="font-semibold">PAIRS</p><p className="font-mono font-bold">{pairsPerCarton(s)}</p></div>
          </div>
          <div className="mt-3"><BarcodeMock value={s.styleCode} /></div>
          <p className="mt-1 text-center font-mono text-[10px] tracking-widest">{s.styleCode}</p>
          <p className="mt-1 border-t border-slate-300 pt-1 text-center text-[10px] font-bold">MADE IN INDIA</p>
        </div>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard title="Barcode & labeling" icon={Barcode} tone="emerald">
          <dl>
            <Row label="Barcode type" value={s.barcodeType} />
            <Row label="SKU format" value={s.skuFormat} mono />
            <Row label="Carton label" value="4 × 6 inch thermal" />
            <Row label="Label position" value="Both short-side panels, top-right" />
            <Row label="Country of origin" value="Made in India" />
          </dl>
        </SectionCard>
        <SectionCard title="Handling marks" icon={AlertTriangle} tone="rose">
          <div className="flex flex-wrap gap-2">
            {s.handling.map((h) => (
              <span key={h} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{h}</span>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function QcTab({ s, done, toggle }: { s: PackingSpec; done: string[]; toggle: (id: string) => void }) {
  const items = qcItems(s);
  const pct = Math.round((done.length / items.length) * 100);
  return (
    <SectionCard title="QC checkpoints" icon={ClipboardCheck} tone="amber" aside={<span className="text-xs font-semibold tabular-nums text-slate-600">{done.length}/{items.length} done</span>}>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((it) => {
          const on = done.includes(it.id);
          return (
            <li key={it.id}>
              <button type="button" onClick={() => toggle(it.id)} aria-pressed={on} className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-slate-50">
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${on ? "bg-emerald-100 text-emerald-600" : "border border-slate-300 text-transparent"}`}>
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-medium ${on ? "text-slate-900" : "text-slate-700"}`}>{it.label}</span>
                  <span className="block text-xs text-slate-500">{it.hint}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}

function HistoryTab({ s }: { s: PackingSpec }) {
  return (
    <SectionCard title="Revision history" icon={History} tone="indigo">
      <ol className="relative ml-2 space-y-4 border-l border-slate-200 pl-5">
        {s.history.map((h, i) => (
          <li key={`${h.v}-${i}`} className="relative">
            <span className={`absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${i === 0 ? "bg-indigo-500" : "bg-slate-300"}`} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700">{h.v}</span>
              <p className="text-sm font-semibold text-slate-900">{h.note}</p>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{h.by} · {fmtDate(h.at)}</p>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

const TABS = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "sizes", label: "Size run", icon: Boxes },
  { id: "bom", label: "Pack-out BOM", icon: ListChecks },
  { id: "labels", label: "Labels & marking", icon: Tag },
  { id: "qc", label: "QC", icon: ClipboardCheck },
  { id: "history", label: "History", icon: History },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* =====================================================================
   Page
   ===================================================================== */
export default function PackingSpecificationPage() {
  const [specs, setSpecs] = useState<PackingSpec[]>(SEED);
  const [selectedId, setSelectedId] = useState(SEED[0].id);
  const [tab, setTab] = useState<TabId>("overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<PackingSpec | null>(null);
  const [qc, setQc] = useState<Record<string, string[]>>(() => Object.fromEntries(SEED.map((s) => [s.id, initialQc(s)])));

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | PackingStatus>("All");
  const [season, setSeason] = useState("");
  const [customer, setCustomer] = useState("");
  const [sort, setSort] = useState<"recent" | "style" | "cartons">("recent");
  const [page, setPage] = useState(1);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const notify = (m: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(m);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName)) { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!editing) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editing]);

  const selected = specs.find((x) => x.id === selectedId) ?? specs[0];
  const view = editing && form ? form : selected;
  const baseChecks = validate(view);
  const hasError = baseChecks.some((c) => c.level === "error");
  const doneQc = qc[selected.id] ?? [];
  const checks: Check[] = [
    ...baseChecks,
    doneQc.length === QC_IDS.length
      ? { level: "ok", text: "All QC checkpoints are complete" }
      : { level: "warn", text: `${QC_IDS.length - doneQc.length} QC checkpoint(s) still open.` },
  ];

  /* ----- list ----- */
  const customers = useMemo(() => Array.from(new Set(specs.map((x) => x.customer).filter(Boolean))).sort(), [specs]);
  const seasons = useMemo(() => Array.from(new Set(specs.map((x) => x.season))).sort(), [specs]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: specs.length, Approved: 0, Pending: 0, Rejected: 0, Draft: 0 };
    specs.forEach((x) => { c[x.status] += 1; });
    return c;
  }, [specs]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const out = specs.filter((x) => {
      if (status !== "All" && x.status !== status) return false;
      if (season && x.season !== season) return false;
      if (customer && x.customer !== customer) return false;
      if (!s) return true;
      const hay = [x.styleCode, x.styleName, x.customer, x.season, x.version].join(" ").toLowerCase();
      return s.split(/\s+/).every((t) => hay.includes(t));
    });
    out.sort((a, b) =>
      sort === "style" ? a.styleCode.localeCompare(b.styleCode)
      : sort === "cartons" ? b.totalCartons - a.totalCartons
      : b.updatedAt.localeCompare(a.updatedAt));
    return out;
  }, [specs, q, status, season, customer, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const filtersOn = q || status !== "All" || season || customer;

  const stats = [
    { label: "Total specs", value: specs.length, hint: `${new Set(specs.map((x) => x.customer)).size} customers`, icon: FileText, tone: "indigo" as Tone },
    { label: "Approved", value: counts.Approved, hint: `${Math.round((counts.Approved / Math.max(1, specs.length)) * 100)}% of all specs`, icon: PackageCheck, tone: "emerald" as Tone },
    { label: "Pending approval", value: counts.Pending, hint: `${counts.Draft} in draft, ${counts.Rejected} rejected`, icon: AlertCircle, tone: "amber" as Tone },
    { label: "Total cartons", value: fmtN(specs.reduce((n, x) => n + x.totalCartons, 0)), hint: `${fmtN(specs.reduce((n, x) => n + totalPairs(x), 0))} pairs`, icon: Package, tone: "blue" as Tone },
  ];

  /* ----- actions ----- */
  const patch: PatchFn = (p) => setForm((f) => (f ? { ...f, ...p } : f));
  const clone = (s: PackingSpec): PackingSpec => ({ ...s, sizeRun: s.sizeRun.map((x) => ({ ...x })), handling: [...s.handling], history: s.history.map((h) => ({ ...h })) });
  const nextId = () => `PS-${String(specs.length + 1).padStart(3, "0")}`;

  const pick = (id: string) => {
    if (id === selectedId) return;
    if (editing && !window.confirm("Discard unsaved changes?")) return;
    setEditing(false); setForm(null); setSelectedId(id);
  };
  const startEdit = () => { setForm(clone(selected)); setEditing(true); setTab("overview"); };
  const cancelEdit = () => { setEditing(false); setForm(null); };

  const saveEdit = () => {
    if (!form) return;
    if (hasError) { notify("Fix the errors before saving"); return; }
    if (JSON.stringify(form) === JSON.stringify(selected)) { cancelEdit(); notify("No changes to save"); return; }
    const reopen = selected.status === "Approved" || selected.status === "Rejected";
    const v = bump(selected.version);
    const next: PackingSpec = {
      ...form, version: v, status: reopen ? "Draft" : selected.status, updatedBy: CURRENT_USER, updatedAt: TODAY,
      history: [{ v, by: CURRENT_USER, at: TODAY, note: reopen ? "Edited after approval, back to draft" : "Spec updated" }, ...form.history],
    };
    setSpecs((all) => all.map((x) => (x.id === next.id ? next : x)));
    cancelEdit();
    notify(`Saved as ${v}${reopen ? ". Needs approval again." : ""}`);
  };

  const transition = (to: PackingStatus, note: string) => {
    const next: PackingSpec = { ...selected, status: to, updatedBy: CURRENT_USER, updatedAt: TODAY, history: [{ v: selected.version, by: CURRENT_USER, at: TODAY, note }, ...selected.history] };
    setSpecs((all) => all.map((x) => (x.id === next.id ? next : x)));
    notify(note);
  };

  const duplicate = () => {
    const id = nextId();
    const copy: PackingSpec = {
      ...clone(selected), id, styleName: `${selected.styleName} (Copy)`, status: "Draft", version: "v0.1", updatedBy: CURRENT_USER, updatedAt: TODAY,
      history: [{ v: "v0.1", by: CURRENT_USER, at: TODAY, note: `Duplicated from ${selected.styleCode} ${selected.version}` }],
    };
    setQc((m) => ({ ...m, [id]: [] }));
    setSpecs((all) => [copy, ...all]);
    setSelectedId(id);
    notify("Duplicated as a new draft");
  };

  const createNew = () => {
    if (editing && !window.confirm("Discard unsaved changes?")) return;
    const s = blankSpec(nextId());
    setQc((m) => ({ ...m, [s.id]: [] }));
    setSpecs((all) => [s, ...all]);
    setSelectedId(s.id);
    setForm(clone(s)); setEditing(true); setTab("overview");
    setQ(""); setStatus("All"); setSeason(""); setCustomer(""); setPage(1);
  };

  const toggleQc = (id: string) =>
    setQc((m) => {
      const cur = m[selected.id] ?? [];
      return { ...m, [selected.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });

  const exportCsv = () => {
    const head = ["ID", "Style Code", "Style Name", "Customer", "Season", "Status", "Version", "Pairs/Carton", "Cartons", "Total Pairs", "Gross kg", "Net kg", "L cm", "W cm", "H cm", "CBM"];
    const rows = list.map((x) =>
      [x.id, x.styleCode, x.styleName, x.customer, x.season, x.status, x.version, pairsPerCarton(x), x.totalCartons, totalPairs(x), x.grossWeight, x.netWeight, x.cartonLength, x.cartonWidth, x.cartonHeight, cbmOf(x).toFixed(3)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[head.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `packing-specs-${TODAY}.csv`; a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${list.length} spec(s)`);
  };

  const ppc = pairsPerCarton(view);
  const cbm = cbmOf(view);
  const reopenNote = selected.status === "Approved" || selected.status === "Rejected";

  return (
    <div className="mx-auto w-full">
      {/* Header */}
      <Card className="mb-2 px-3 py-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium text-indigo-600">
              <Link href="/dashboard/product-engineering/catalog" className="inline-flex items-center gap-1 transition-colors hover:text-indigo-800">
                <ArrowLeft size={14} /> Catalog
              </Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span>Packing Specification</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Packing Specification</h1>
              {editing ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Unsaved changes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {specs.length} specs
                </span>
              )}
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Define how each style is packed: carton setup, size run, pack-out materials, labels and QC.
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Printer size={16} /> Print
            </button>
            <button type="button" onClick={exportCsv} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Download size={16} /> Export CSV
            </button>
            <button type="button" onClick={createNew} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0b0b14] px-5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg">
              <Plus size={16} /> New Spec
            </button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mb-2 grid grid-cols-2 gap-3 lg:grid-cols-4 print:hidden">
        {stats.map((s) => <StatTile key={s.label} {...s} />)}
      </div>

      {/* Search + Filters */}
      <div className="mb-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search by style code, name, customer or season..."
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-16 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
            {q ? (
              <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
                <X size={16} />
              </button>
            ) : (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">/</kbd>
            )}
          </div>

          <select value={customer} onChange={(e) => { setCustomer(e.target.value); setPage(1); }} className={sel} aria-label="Customer">
            <option value="">Customer: All</option>
            {customers.map((o) => <option key={o}>{o}</option>)}
          </select>
          <select value={season} onChange={(e) => { setSeason(e.target.value); setPage(1); }} className={sel} aria-label="Season">
            <option value="">Season: All</option>
            {seasons.map((o) => <option key={o}>{o}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={sel} aria-label="Sort">
            <option value="recent">Sort: Recently updated</option>
            <option value="style">Sort: Style code</option>
            <option value="cartons">Sort: Most cartons</option>
          </select>

          <div className="inline-flex rounded-lg border border-slate-300 p-0.5" role="group" aria-label="Status filter">
            {(["All", "Approved", "Pending", "Rejected", "Draft"] as const).map((s) => (
              <button
                key={s} type="button" onClick={() => { setStatus(s); setPage(1); }}
                className={`h-9 rounded-md px-3 text-xs font-semibold transition-colors ${status === s ? "bg-[#0b0b14] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {s} <span className={`ml-0.5 tabular-nums ${status === s ? "text-slate-300" : "text-slate-400"}`}>{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* Left: list */}
        <div className="space-y-3 print:hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">{list.length}</span> specifications</p>
            {filtersOn && (
              <button type="button" onClick={() => { setQ(""); setStatus("All"); setSeason(""); setCustomer(""); setPage(1); }} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                <RotateCcw size={12} /> Clear filters
              </button>
            )}
          </div>

          <div className="space-y-2">
            {shown.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-sm font-semibold text-slate-900">No specifications match</p>
                <p className="mt-1 text-xs text-slate-500">Try a different search or clear the filters.</p>
              </div>
            )}
            {shown.map((s) => {
              const active = selected.id === s.id;
              const issues = validate(s).filter((c) => c.level !== "ok").length;
              const P = PACK_ICON[s.packingType];
              return (
                <button
                  key={s.id} type="button" onClick={() => pick(s.id)} aria-current={active}
                  className={`group w-full overflow-hidden rounded-xl border bg-white p-3 text-left transition-all ${active ? "border-indigo-400 shadow-md ring-2 ring-indigo-100" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}
                >
                  <div className="flex gap-3">
                    <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${TONE[P.tone]}`}>
                      <P.icon size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">{s.styleCode}</p>
                          <p className="truncate text-sm font-semibold text-slate-900">{s.styleName}</p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-slate-400">
                          {issues > 0 && <AlertTriangle size={11} className="text-amber-500" aria-label={`${issues} issues`} />}
                          {s.version}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{s.customer || "No customer"} · {pairsPerCarton(s)} pairs/ctn · {fmtN(s.totalCartons)} ctns</p>
                      <div className="mt-2 flex items-center justify-between">
                        <StatusBadge s={s.status} />
                        <span className="text-[10px] font-medium text-slate-400">{fmtDate(s.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {list.length > PAGE_SIZE && (
            <nav className="flex items-center justify-between pt-2" aria-label="Pagination">
              <p className="text-xs text-slate-500">{(cur - 1) * PAGE_SIZE + 1}–{Math.min(cur * PAGE_SIZE, list.length)} of {list.length}</p>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Previous page" disabled={cur === 1} onClick={() => setPage(cur - 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40">
                  <ChevronRight size={14} className="rotate-180" />
                </button>
                <span className="px-2 text-xs font-semibold text-slate-700">{cur}/{pages}</span>
                <button type="button" aria-label="Next page" disabled={cur === pages} onClick={() => setPage(cur + 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40">
                  <ChevronRight size={14} />
                </button>
              </div>
            </nav>
          )}
        </div>

        {/* Right: detail */}
        <div className="min-w-0 space-y-4">
          <Card className="gap-0 overflow-hidden border-slate-200 p-0 shadow-sm">
            <div className="grid items-center gap-2 bg-gradient-to-br from-[#0b0b14] via-slate-900 to-indigo-950 p-5 sm:grid-cols-[1fr_300px]">
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="flex items-center gap-2">
                  <StatusBadge s={view.status} />
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{view.version}</span>
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold tracking-wider text-indigo-300">{view.styleCode}</p>
                  <h2 className="mt-0.5 text-2xl font-bold text-white">{view.styleName}</h2>
                  <p className="mt-0.5 text-sm text-slate-300">{view.customer || "No customer"} · {view.season}</p>
                </div>
                <p className="text-xs text-slate-400">{ppc} pairs/carton · {fmtN(ppc * view.totalCartons)} pairs · {fmtN(view.totalCartons)} cartons</p>
              </div>
              <CartonVisual l={view.cartonLength} w={view.cartonWidth} h={view.cartonHeight} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <History size={13} />
                <span>Last updated by <span className="font-semibold text-slate-700">{selected.updatedBy}</span> on {fmtDate(selected.updatedAt)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                {editing ? (
                  <>
                    <Btn onClick={cancelEdit}>Cancel</Btn>
                    <Btn variant="dark" icon={Save} onClick={saveEdit}>Save changes</Btn>
                  </>
                ) : (
                  <>
                    <Btn icon={Copy} onClick={duplicate}>Duplicate</Btn>
                    <Btn icon={Edit3} onClick={startEdit}>{selected.status === "Rejected" ? "Revise" : "Edit"}</Btn>
                    {selected.status === "Draft" && (
                      <Btn variant="dark" icon={Send} disabled={hasError} title={hasError ? "Fix the errors in Checks first" : undefined} onClick={() => transition("Pending", "Submitted for approval")}>
                        Submit for approval
                      </Btn>
                    )}
                    {selected.status === "Pending" && (
                      <>
                        <Btn variant="danger" icon={XCircle} onClick={() => transition("Rejected", "Rejected by approver")}>Reject</Btn>
                        <Btn variant="success" icon={Check} onClick={() => transition("Approved", "Approved")}>Approve</Btn>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>

          {editing && (
            <div className="flex items-start gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
              <Info size={16} className="mt-0.5 shrink-0" />
              <p>
                {reopenNote
                  ? `Saving will create ${bump(selected.version)} as a draft. It needs approval again before production.`
                  : "You are editing this spec. Totals, volume and checks update as you type."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Pairs / carton" value={ppc} unit="pairs" icon={Box} tone="indigo" />
            <StatTile label="Total pairs" value={fmtN(ppc * view.totalCartons)} unit="pairs" icon={Boxes} tone="blue" />
            <StatTile label="Cartons" value={fmtN(view.totalCartons)} unit="ctns" icon={Truck} tone="emerald" />
            <StatTile label="CBM / carton" value={cbm.toFixed(3)} unit="m³" icon={Ruler} tone="amber" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 print:hidden" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={`-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${tab === t.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && <OverviewTab s={view} editing={editing} patch={patch} checks={checks} />}
          {tab === "sizes" && <SizesTab s={view} editing={editing} patch={patch} />}
          {tab === "bom" && <BomTab s={view} />}
          {tab === "labels" && <LabelsTab s={view} />}
          {tab === "qc" && <QcTab s={view} done={doneQc} toggle={toggleQc} />}
          {tab === "history" && <HistoryTab s={selected} />}
        </div>
      </div>

      {/* Toast */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-50 print:hidden">
        {toast && (
          <div className="flex items-center gap-2 rounded-xl bg-[#0b0b14] px-4 py-3 text-sm font-medium text-white shadow-lg">
            <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
          </div>
        )}
      </div>
    </div>
  );
}