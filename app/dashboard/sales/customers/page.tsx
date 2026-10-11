"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, Download, MoreVertical, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";

/* =====================  Types  ===================== */
type Status = "Draft" | "Review" | "Active" | "Superseded";
type Basis = "Fixed" | "Size Specific" | "Color Specific" | "Size + Color Specific" | "Variant Specific";
type Comp = {
  id: number; mat: string; ctype: string; basis: Basis; net: number; uom: string; scrap: number; op: string; notes: string;
  sizeQty: Record<number, number>; colorMap: Record<string, string>; matrix: Record<string, Record<number, number>>; alts: string[]; appl: string;
};
type Audit = { date: string; user: string; action: string; details: string };
type Bom = {
  code: string; rev: number; product: string; status: Status; type: string; plant: string; baseQty: number; uom: string;
  effective: string; desc: string; comps: Comp[]; mode: "all" | "selected"; off: string[]; reason: string; updated: string;
  createdBy: string; reviewer?: string; audit: Audit[];
};
type Product = { code: string; name: string; cat: string; gender: string; constr: string; colors: string[]; sizes: [number, number] };
type Mat = { code: string; name: string; type: string; uom: string; cost: number; stock: number; active: boolean; op: string };
type Issue = { lvl: "error" | "warn"; text: string; step: number };
type View = { name: "list" } | { name: "create"; edit?: Bom } | { name: "detail"; code: string; rev: number; tab?: string; revModal?: boolean };

/* =====================  Master / sample data (apni API se replace karo)  ===================== */
const PRODUCTS: Product[] = [
  { code: "MC-2401", name: "Men's Casual Leather Shoe", cat: "Casual Shoe", gender: "Men", constr: "Cemented", colors: ["Black", "Brown"], sizes: [6, 10] },
  { code: "WS-1102", name: "Women's Sandal", cat: "Sandal", gender: "Women", constr: "Stitched", colors: ["Tan", "Black"], sizes: [4, 8] },
  { code: "SS-4501", name: "Safety Shoe", cat: "Safety Shoe", gender: "Men", constr: "Injection Moulded", colors: ["Black"], sizes: [6, 11] },
  { code: "SP-3301", name: "Running Shoe", cat: "Sports Shoe", gender: "Unisex", constr: "Cemented", colors: ["White", "Blue"], sizes: [6, 10] },
];
const ABBR: Record<string, string> = { Black: "BLK", Brown: "BRN", Tan: "TAN", White: "WHT", Blue: "BLU" };
const MATS: Mat[] = [
  { code: "LEA-001", name: "Full Grain Leather", type: "Raw Material", uom: "m²", cost: 300, stock: 1250, active: true, op: "10 - Cutting" },
  { code: "LEA-002", name: "Corrected Grain Leather", type: "Raw Material", uom: "m²", cost: 265, stock: 800, active: true, op: "10 - Cutting" },
  { code: "LEA-BLK-001", name: "Leather Black", type: "Raw Material", uom: "m²", cost: 300, stock: 600, active: true, op: "10 - Cutting" },
  { code: "LEA-BRN-001", name: "Leather Brown", type: "Raw Material", uom: "m²", cost: 300, stock: 540, active: true, op: "10 - Cutting" },
  { code: "LEA-OLD-001", name: "Leather (Old Grade)", type: "Raw Material", uom: "m²", cost: 240, stock: 0, active: false, op: "10 - Cutting" },
  { code: "LIN-001", name: "Lining Fabric", type: "Raw Material", uom: "m²", cost: 100, stock: 900, active: true, op: "10 - Cutting" },
  { code: "SOL-EVA-001", name: "EVA Sole", type: "Component", uom: "pair", cost: 55, stock: 3200, active: true, op: "50 - Cementing" },
  { code: "INS-001", name: "Insole Board", type: "Component", uom: "pair", cost: 20, stock: 4100, active: true, op: "40 - Lasting" },
  { code: "THR-001", name: "Polyester Thread", type: "Consumable", uom: "m", cost: 0.4, stock: 52000, active: true, op: "30 - Stitching" },
  { code: "ADH-001", name: "PU Adhesive", type: "Consumable", uom: "g", cost: 0.8333, stock: 90000, active: true, op: "50 - Cementing" },
  { code: "SHL-001", name: "Shoelace", type: "Component", uom: "pair", cost: 8, stock: 6000, active: true, op: "60 - Finishing" },
  { code: "BOX-001", name: "Shoe Box", type: "Packaging", uom: "pcs", cost: 4, stock: 2500, active: true, op: "80 - Packing" },
  { code: "STR-001", name: "Strap Webbing", type: "Component", uom: "pcs", cost: 12, stock: 1800, active: true, op: "30 - Stitching" },
  { code: "SFT-001", name: "Steel Toe Cap", type: "Component", uom: "pair", cost: 90, stock: 700, active: true, op: "40 - Lasting" },
];
const OPS = ["10 - Cutting", "20 - Skiving", "30 - Stitching", "40 - Lasting", "50 - Cementing", "60 - Finishing", "70 - QC", "80 - Packing"];
const WORK_CENTER: Record<string, string> = { Cutting: "Cutting Dept", Skiving: "Preparation", Stitching: "Stitching Line 1", Lasting: "Lasting Line", Cementing: "Assembly", Finishing: "Finishing", QC: "Quality", Packing: "Packing" };
const ROUTING: Record<string, number> = { "MC-2401": 3, "SS-4501": 1, "SP-3301": 2 }; // WS-1102 ka routing nahi hai (warning dikhane ke liye)
const COSTING = { labor: 85, machine: 30, overhead: 45, packaging: 25 }; // costing engine se aayega
const BASES: Basis[] = ["Fixed", "Size Specific", "Color Specific", "Size + Color Specific", "Variant Specific"];
const UOMS = ["m²", "sq ft", "m", "g", "kg", "pcs", "pair", "litre"];
const CTYPES = ["Direct Material", "Indirect Material", "Consumable", "Packaging"];
const PLANTS = ["Delhi Factory", "Noida Factory", "Agra Factory"];
const REVIEWERS = ["Production Engineering Manager", "Manufacturing Manager"];
const REJECT_REASONS = ["Quantity incorrect", "Material incorrect", "Variant missing", "Cost issue", "Operation issue", "Other"];
const CHECKLIST = ["Product information verified", "Material quantities verified", "Size variations verified", "Scrap percentages verified", "Operation mapping verified", "Cost reviewed"];
const USER = "Amit Kumar";

/* =====================  Helpers  ===================== */
let _id = 1000;
const nid = () => ++_id;
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (iso: string) => (iso ? `${iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}` : "—");
const today = () => new Date().toISOString().slice(0, 10);
const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const n3 = (n: number) => n.toFixed(3);
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const prodOf = (code: string) => PRODUCTS.find((p) => p.code === code) ?? PRODUCTS[0];
const matOf = (code: string) => MATS.find((m) => m.code === code) ?? MATS[0];
const sizesOf = (p: Product) => range(p.sizes[0], p.sizes[1]);
const skuOf = (p: Product, c: string, s: number) => `${p.code.replace("-", "")}-${ABBR[c] ?? c.slice(0, 3).toUpperCase()}-${String(s).padStart(2, "0")}`;
const keyOf = (b: Bom) => `${b.code}/${b.rev}`;
const pad = (n: number) => String(n).padStart(2, "0");

const netOf = (c: Comp) =>
  c.basis === "Size Specific" ? avg(Object.values(c.sizeQty))
  : c.basis === "Size + Color Specific" || c.basis === "Variant Specific" ? avg(Object.values(c.matrix).flatMap((r) => Object.values(r)))
  : c.net;
const unitOf = (c: Comp) => (c.basis === "Color Specific" && Object.keys(c.colorMap).length ? avg(Object.values(c.colorMap).map((m) => matOf(m).cost)) : matOf(c.mat).cost);
const grossOf = (c: Comp) => netOf(c) * (1 + c.scrap / 100);
const costOf = (c: Comp) => grossOf(c) * unitOf(c);
const totalOf = (b: Bom) => b.comps.reduce((s, c) => s + costOf(c), 0);
const ctypeOf = (t: string) => (t === "Consumable" ? "Consumable" : t === "Packaging" ? "Packaging" : "Direct Material");
const newComp = (): Comp => ({ id: nid(), mat: "", ctype: "Direct Material", basis: "Fixed", net: 1, uom: "pcs", scrap: 0, op: "10 - Cutting", notes: "", sizeQty: {}, colorMap: {}, matrix: {}, alts: [], appl: "All Variants" });
const cp = (mat: string, net: number, scrap: number): Comp => { const m = matOf(mat); return { ...newComp(), mat, net, scrap, uom: m.uom, op: m.op, ctype: ctypeOf(m.type) }; };

const enabled = (b: Bom, p: Product) => p.colors.flatMap((c) => sizesOf(p).map((s) => [c, s] as [string, number])).filter(([c, s]) => !b.off.includes(`${c}|${s}`));

function validate(b: Bom, p: Product): Issue[] {
  const out: Issue[] = [];
  if (!b.comps.length) out.push({ lvl: "error", text: "Add at least one component.", step: 1 });
  const vs = enabled(b, p);
  b.comps.forEach((c) => {
    const m = matOf(c.mat);
    if (!m.active) out.push({ lvl: "error", text: `${m.name} is inactive.`, step: 1 });
    if (netOf(c) <= 0) out.push({ lvl: "error", text: `${m.name}: quantity must be greater than zero.`, step: 1 });
    if (unitOf(c) <= 0) out.push({ lvl: "warn", text: `${m.name} has no current cost.`, step: 1 });
    vs.forEach(([col, s]) => {
      if (c.basis === "Size Specific" && !(c.sizeQty[s] > 0)) out.push({ lvl: "error", text: `${col} / UK ${s}: ${m.name} quantity is missing.`, step: 1 });
      if ((c.basis === "Size + Color Specific" || c.basis === "Variant Specific") && !(c.matrix[col]?.[s] > 0)) out.push({ lvl: "error", text: `${col} / UK ${s}: ${m.name} quantity is missing.`, step: 1 });
      if (c.basis === "Color Specific" && !c.colorMap[col]) out.push({ lvl: "error", text: `${col}: ${m.name} color mapping is missing.`, step: 1 });
    });
  });
  const total = p.colors.length * sizesOf(p).length;
  if (!vs.length) out.push({ lvl: "error", text: "No variants selected.", step: 2 });
  else if (vs.length < total) out.push({ lvl: "warn", text: `Variant coverage is partial (${vs.length} / ${total}).`, step: 2 });
  if (!b.effective) out.push({ lvl: "error", text: "Effective date is required.", step: 0 });
  return out.filter((x, i, a) => a.findIndex((y) => y.text === x.text) === i);
}

function download(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
const exportBom = (b: Bom) =>
  download(`${b.code}-rev${b.rev}.csv`, [["Seq", "Material code", "Material", "Type", "Basis", "Net", "UOM", "Scrap %", "Gross", "Operation", "Cost"],
    ...b.comps.map((c, i) => [(i + 1) * 10, c.mat, matOf(c.mat).name, c.ctype, c.basis, n3(netOf(c)), c.uom, c.scrap, n3(grossOf(c)), c.op, costOf(c).toFixed(2)])]);

/* =====================  Seed BOMs (PDF ke MC-2401 example se)  ===================== */
const mc = (leather: number, adh: number) => [cp("LEA-001", leather, 8), cp("LIN-001", 0.4, 5), cp("SOL-EVA-001", 1, 2), cp("INS-001", 1, 0), cp("SHL-001", 1, 1), cp("THR-001", 15, 3), cp("ADH-001", adh, 5), cp("BOX-001", 1, 1)];
const mk = (code: string, rev: number, product: string, status: Status, effective: string, comps: Comp[], reason: string, audit: Audit[] = []): Bom => ({
  code, rev, product, status, type: "Manufacturing BOM", plant: "Delhi Factory", baseQty: 1, uom: "Pair", effective, desc: `Standard manufacturing BOM for ${product}`,
  comps, mode: "all", off: [], reason, updated: "2026-10-08", createdBy: rev === 2 ? "Rahul" : "Amit", audit,
});
const A = (date: string, user: string, action: string, details: string): Audit => ({ date, user, action, details });
const SEED: Bom[] = [
  mk("BOM-001", 3, "MC-2401", "Draft", "2026-11-01", mc(0.82, 10), "Reduced leather consumption after cutting optimization.", [A("2026-10-08", "Amit", "Created revision", "Rev 3 created")]),
  mk("BOM-001", 2, "MC-2401", "Active", "2026-10-01", mc(0.85, 12), "Cutting optimization.", [
    A("2026-10-05", "Rahul", "Approved", "Rev 2 approved"), A("2026-10-04", "Amit", "Updated component", "Leather 0.88 → 0.85"),
    A("2026-10-04", "Amit", "Updated component", "EVA supplier changed"), A("2026-10-03", "Amit", "Created revision", "Rev 2 created")]),
  mk("BOM-001", 1, "MC-2401", "Superseded", "2026-07-01", mc(0.88, 12), "Initial release.", [A("2026-10-01", "Rahul", "Approved", "Rev 1 approved"), A("2026-09-28", "Amit", "Created BOM", "Rev 1")]),
  mk("BOM-002", 1, "WS-1102", "Draft", "", [cp("STR-001", 2, 3), cp("SOL-EVA-001", 1, 2), cp("INS-001", 1, 0)], "New revision", [A("2026-10-08", "Amit", "Created BOM", "Rev 1")]),
  mk("BOM-003", 3, "SS-4501", "Active", "2026-09-15", [cp("LEA-001", 0.95, 8), cp("SFT-001", 1, 1), cp("SOL-EVA-001", 1, 2), cp("INS-001", 1, 0), cp("BOX-001", 1, 1)], "Safety toe cap upgrade.", [A("2026-09-14", "Rahul", "Approved", "Rev 3 approved")]),
  mk("BOM-003", 2, "SS-4501", "Superseded", "2026-06-01", [cp("LEA-001", 1, 8), cp("SFT-001", 1, 1), cp("SOL-EVA-001", 1, 2), cp("INS-001", 1, 0), cp("BOX-001", 1, 1)], "Leather update.", []),
  mk("BOM-003", 1, "SS-4501", "Superseded", "2026-03-01", [cp("LEA-002", 1, 8), cp("SFT-001", 1, 1), cp("SOL-EVA-001", 1, 2), cp("INS-001", 1, 0), cp("BOX-001", 1, 1)], "Initial release.", []),
  mk("BOM-004", 2, "SP-3301", "Review", "2026-10-15", [cp("LIN-001", 0.5, 5), cp("SOL-EVA-001", 1, 2), cp("INS-001", 1, 0), cp("THR-001", 18, 3), cp("ADH-001", 14, 5), cp("BOX-001", 1, 1)], "New collection.", [A("2026-10-07", "Amit", "Submitted for review", "Production Engineering Manager")]),
  mk("BOM-004", 1, "SP-3301", "Superseded", "2026-05-01", [cp("LIN-001", 0.55, 5), cp("SOL-EVA-001", 1, 2), cp("INS-001", 1, 0), cp("BOX-001", 1, 1)], "Initial release.", []),
];

/* =====================  UI primitives  ===================== */
const card = "rounded-xl border border-slate-200 bg-white";
const inp = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-500";
const cell = "h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200";
const btnDark = "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0b0b14] px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50";
const btnLight = "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50";
const btnGreen = "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50";
const th = "px-3 py-2.5 text-left text-xs font-semibold text-slate-600";
const STATUS_STYLE: Record<Status, string> = { Draft: "bg-slate-100 text-slate-700", Review: "bg-amber-100 text-amber-800", Active: "bg-emerald-100 text-emerald-700", Superseded: "bg-slate-800 text-white" };

const Badge = ({ s }: { s: Status }) => <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[s]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span>;
const Label = ({ t, children, className = "" }: { t: string; children: React.ReactNode; className?: string }) => <label className={`block ${className}`}><span className="mb-1.5 block text-[13px] font-medium text-slate-700">{t}</span>{children}</label>;
function Sel({ value, onChange, options, cls = inp }: { value: string; onChange: (v: string) => void; options: string[]; cls?: string }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>{options.map((o) => <option key={o}>{o}</option>)}</select>;
}
function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-slate-900/40" />
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
        <div className="space-y-4 p-5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>
      </div>
    </div>
  );
}
function Stepper({ step, max, go }: { step: number; max: number; go: (i: number) => void }) {
  return (
    <div className="mb-5 grid grid-cols-5 gap-2">
      {["Product", "Components", "Variants", "Review", "Save"].map((s, i) => (
        <button key={s} type="button" disabled={i > max || step === 4} onClick={() => go(i)} className="text-left outline-none disabled:cursor-default">
          <span className={`block pb-1.5 text-sm font-medium ${i === step ? "text-indigo-600" : i < step ? "text-emerald-700" : "text-slate-400"}`}>{i < step ? "✓ " : ""}{i + 1}. {s}</span>
          <span className={`block h-1 rounded-full ${i === step ? "bg-indigo-500" : i < step ? "bg-emerald-500" : "bg-slate-200"}`} />
        </button>
      ))}
    </div>
  );
}
const Progress = ({ pct }: { pct: number }) => <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} /></div>;

/* ---------- Components table (create + detail dono me) ---------- */
const COL_LABEL: Record<string, string> = { seq: "Seq", code: "Material Code", mat: "Material", type: "Type", basis: "Basis", net: "Net", uom: "UOM", scrap: "Scrap", gross: "Gross", op: "Operation", alt: "Substitute", notes: "Notes", cost: "Cost" };
const COL_ALL = ["seq", "code", "mat", "type", "basis", "net", "uom", "scrap", "gross", "op", "alt", "notes", "cost"];
const RIGHT = ["net", "scrap", "gross", "cost"];
function renderCell(k: string, c: Comp, i: number): React.ReactNode {
  const m = matOf(c.mat);
  switch (k) {
    case "seq": return (i + 1) * 10;
    case "code": return m.code;
    case "mat": return <div><p className="font-semibold text-slate-900">{m.name}</p><p className="text-xs text-slate-500">{m.code}</p></div>;
    case "type": return c.ctype;
    case "basis": return c.basis;
    case "net": return <span title={c.basis.includes("Fixed") || c.basis === "Color Specific" ? undefined : "Average across sizes / variants"}>{n3(netOf(c))}{c.basis !== "Fixed" && c.basis !== "Color Specific" && <sup className="ml-0.5 text-[9px] text-slate-400">avg</sup>}</span>;
    case "uom": return c.uom;
    case "scrap": return `${c.scrap}%`;
    case "gross": return n3(grossOf(c));
    case "op": return c.op || "—";
    case "alt": return c.alts.join(", ") || "—";
    case "notes": return c.notes || "—";
    default: return <span className="font-medium text-slate-900">{inr(costOf(c))}</span>;
  }
}
function CompTable({ comps, cols, onRow, onDelete, total }: { comps: Comp[]; cols: string[]; onRow?: (c: Comp) => void; onDelete?: (c: Comp) => void; total: number }) {
  const shown = COL_ALL.filter((k) => cols.includes(k));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-y border-slate-200 bg-slate-50"><tr>{shown.map((k) => <th key={k} className={`${th} ${RIGHT.includes(k) ? "text-right" : ""}`}>{COL_LABEL[k]}</th>)}{onDelete && <th className="w-10" />}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          {comps.map((c, i) => (
            <tr key={c.id} onClick={() => onRow?.(c)} className={onRow ? "cursor-pointer hover:bg-slate-50" : ""}>
              {shown.map((k) => <td key={k} className={`px-3 py-2.5 text-slate-700 ${RIGHT.includes(k) ? "text-right tabular-nums" : ""}`}>{renderCell(k, c, i)}</td>)}
              {onDelete && <td className="px-2"><button type="button" aria-label="Remove component" onClick={(e) => { e.stopPropagation(); onDelete(c); }} className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button></td>}
            </tr>
          ))}
          {!comps.length && <tr><td colSpan={shown.length + 1} className="px-3 py-10 text-center text-slate-500">No components yet. Click &quot;+ Add Material&quot;.</td></tr>}
        </tbody>
        <tfoot><tr className="border-t border-slate-200"><td colSpan={shown.length - 1} className="px-3 py-3 text-right font-semibold text-slate-700">Total Material Cost</td><td className="px-3 py-3 text-right font-bold tabular-nums text-slate-900">{inr(total)}</td>{onDelete && <td />}</tr></tfoot>
      </table>
    </div>
  );
}

/* ---------- Add / Edit component drawer ---------- */
function CompDrawer({ product, comp, onSave, onDelete, onClose }: { product: Product; comp: Comp | null; onSave: (c: Comp) => void; onDelete?: () => void; onClose: () => void }) {
  const [f, setF] = useState<Comp>(comp ?? newComp());
  const [q, setQ] = useState("");
  const sizes = sizesOf(product);
  const m = f.mat ? matOf(f.mat) : null;
  const list = MATS.filter((x) => `${x.code} ${x.name} ${x.type}`.toLowerCase().includes(q.toLowerCase()));
  const pick = (x: Mat) => setF((p) => ({ ...p, mat: x.code, uom: x.uom, op: x.op, ctype: ctypeOf(x.type), colorMap: {}, alts: p.alts.filter((a) => a !== x.code) }));
  const setBasis = (basis: Basis) => setF((p) => {
    const q0 = p.net || 0;
    return {
      ...p, basis,
      sizeQty: Object.keys(p.sizeQty).length ? p.sizeQty : Object.fromEntries(sizes.map((s) => [s, q0])),
      matrix: Object.keys(p.matrix).length ? p.matrix : Object.fromEntries(product.colors.map((c) => [c, Object.fromEntries(sizes.map((s) => [s, q0]))])),
      colorMap: Object.keys(p.colorMap).length ? p.colorMap : Object.fromEntries(product.colors.map((c) => [c, p.mat])),
    };
  });
  const sameUom = MATS.filter((x) => x.active && m && x.uom === m.uom);
  const ok = !!f.mat && netOf(f) > 0;
  const num = (v: string) => (v === "" ? 0 : +v);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={comp ? "Edit Component" : "Add Component"}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-slate-900/40" />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="text-base font-semibold text-slate-900">{comp ? "Edit Component" : "Add Component"}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {comp && m ? (
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold text-indigo-600">{m.code}</p><p className="font-semibold text-slate-900">{m.name}</p></div>
          ) : (
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-slate-700">Material <span className="text-red-500">*</span></p>
              <p className="mb-2 text-xs text-slate-500">{m ? `${m.code} · ${m.name}` : "No material selected"}</p>
              <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search material code or name..." className={`${inp} pl-9`} /></div>
              <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                {list.map((x) => (
                  <li key={x.code}><button type="button" disabled={!x.active} onClick={() => pick(x)} className={`w-full border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${f.mat === x.code ? "bg-indigo-50" : ""}`}>
                    <p className="text-sm"><span className="font-semibold text-indigo-600">{x.code}</span> <span className="text-slate-900">{x.name}</span>{!x.active && <span className="ml-2 rounded bg-slate-200 px-1.5 text-[10px] font-semibold text-slate-600">Inactive</span>}</p>
                    <p className="text-xs text-slate-500">{x.type} · {x.uom} · ₹{x.cost}/{x.uom} · Stock {x.stock.toLocaleString("en-IN")}</p></button></li>
                ))}
                {!list.length && <li className="px-3 py-4 text-center text-sm text-slate-500">No material found.</li>}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {f.basis === "Fixed" || f.basis === "Color Specific"
              ? <Label t="Quantity *"><input type="number" min={0} step="0.001" value={f.net} onChange={(e) => setF({ ...f, net: num(e.target.value) })} className={inp} /></Label>
              : <Label t="Quantity"><input disabled value={`${n3(netOf(f))} (avg)`} className={inp} /></Label>}
            <Label t="UOM *"><Sel value={f.uom} onChange={(v) => setF({ ...f, uom: v })} options={UOMS} /></Label>
            <Label t="Consumption Type"><Sel value={f.ctype} onChange={(v) => setF({ ...f, ctype: v })} options={CTYPES} /></Label>
            <Label t="Scrap / Waste %"><input type="number" min={0} step="0.5" value={f.scrap} onChange={(e) => setF({ ...f, scrap: num(e.target.value) })} className={inp} /></Label>
            <Label t="Operation"><select value={f.op} onChange={(e) => setF({ ...f, op: e.target.value })} className={inp}><option value="">No operation</option>{OPS.map((o) => <option key={o}>{o}</option>)}</select></Label>
            <Label t="Quantity Basis"><Sel value={f.basis} onChange={(v) => setBasis(v as Basis)} options={BASES} /></Label>
          </div>

          {f.basis === "Size Specific" && (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className={th}>Size</th><th className={th}>Net Qty</th><th className={`${th} text-right`}>Gross</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{sizes.map((s) => (
                  <tr key={s}><td className="px-3 py-1.5 font-medium">UK {s}</td>
                    <td className="px-3 py-1.5"><input type="number" min={0} step="0.001" value={f.sizeQty[s] ?? 0} onChange={(e) => setF({ ...f, sizeQty: { ...f.sizeQty, [s]: num(e.target.value) } })} className={cell} /></td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-slate-600">{n3((f.sizeQty[s] ?? 0) * (1 + f.scrap / 100))}</td></tr>))}</tbody></table>
            </div>
          )}
          {f.basis === "Color Specific" && (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className={th}>Product Color</th><th className={th}>Material</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{product.colors.map((c) => (
                  <tr key={c}><td className="px-3 py-1.5 font-medium">{c}</td>
                    <td className="px-3 py-1.5"><select value={f.colorMap[c] ?? ""} onChange={(e) => setF({ ...f, colorMap: { ...f.colorMap, [c]: e.target.value } })} className={cell}>
                      <option value="">Select material</option>{sameUom.map((x) => <option key={x.code} value={x.code}>{x.code} · {x.name}</option>)}</select></td></tr>))}</tbody></table>
            </div>
          )}
          {(f.basis === "Size + Color Specific" || f.basis === "Variant Specific") && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className={th}>Color</th>{sizes.map((s) => <th key={s} className={th}>UK {s}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">{product.colors.map((c) => (
                  <tr key={c}><td className="px-3 py-1.5 font-medium">{c}</td>
                    {sizes.map((s) => <td key={s} className="px-1.5 py-1.5"><input type="number" min={0} step="0.001" value={f.matrix[c]?.[s] ?? 0} onChange={(e) => setF({ ...f, matrix: { ...f.matrix, [c]: { ...f.matrix[c], [s]: num(e.target.value) } } })} className={`${cell} min-w-[64px]`} /></td>)}</tr>))}</tbody></table>
            </div>
          )}

          {comp && (
            <>
              <Label t="Variant Applicability"><Sel value={f.appl} onChange={(v) => setF({ ...f, appl: v })} options={["All Variants", "Selected Variants"]} /></Label>
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-slate-700">Approved Alternatives</p>
                <div className="mb-2 flex flex-wrap gap-1.5">{f.alts.map((a) => <span key={a} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-indigo-700">{a}<button type="button" aria-label={`Remove ${a}`} onClick={() => setF({ ...f, alts: f.alts.filter((x) => x !== a) })}><X size={12} /></button></span>)}</div>
                <select value="" onChange={(e) => e.target.value && setF({ ...f, alts: [...f.alts, e.target.value] })} className={inp}>
                  <option value="">+ Add Alternative</option>{sameUom.filter((x) => x.code !== f.mat && !f.alts.includes(x.code)).map((x) => <option key={x.code} value={x.code}>{x.code} · {x.name}</option>)}</select>
              </div>
            </>
          )}
          <Label t="Notes"><textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className={`${inp} h-auto py-2`} /></Label>

          <dl className="space-y-1.5 rounded-lg bg-slate-50 p-4 text-sm">
            {[["Net Quantity", `${n3(netOf(f))} ${f.uom}`], ["Scrap", `${f.scrap}%`], ["Gross Quantity", `${n3(grossOf(f))} ${f.uom}`], ["Unit Cost", `${inr(m ? unitOf(f) : 0)} / ${f.uom}`]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-slate-500">{k}</dt><dd className="font-medium tabular-nums text-slate-900">{v}</dd></div>))}
            <div className="flex justify-between border-t border-slate-200 pt-1.5"><dt className="font-semibold text-slate-700">Component Cost</dt><dd className="font-bold tabular-nums text-slate-900">{inr(m ? costOf(f) : 0)}</dd></div>
          </dl>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 p-4">
          {comp && onDelete ? <button type="button" onClick={onDelete} className="h-10 rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button> : <span />}
          <div className="flex gap-2"><button type="button" onClick={onClose} className={btnLight}>Cancel</button>
            <button type="button" disabled={!ok} onClick={() => onSave(f)} className={btnDark}>{comp ? "Save Changes" : "Add Component"}</button></div>
        </div>
      </aside>
    </div>
  );
}

/* =====================  1. BOM LIST  ===================== */
function ListView({ boms, onCreate, onOpen, onEdit, onDup, onDelete, onSupersede }: {
  boms: Bom[]; onCreate: () => void; onOpen: (b: Bom, o?: { tab?: string; revModal?: boolean }) => void; onEdit: (b: Bom) => void;
  onDup: (b: Bom) => void; onDelete: (b: Bom) => void; onSupersede: (b: Bom) => void;
}) {
  const [q, setQ] = useState(""); const [st, setSt] = useState("All"); const [pr, setPr] = useState("All"); const [pl, setPl] = useState("All");
  const [page, setPage] = useState(1); const [menu, setMenu] = useState("");
  const PAGE = 5;
  const rows = boms.filter((b) => {
    const p = prodOf(b.product);
    const hay = [b.code, b.product, p.name, ...b.comps.map((c) => matOf(c.mat).name)].join(" ").toLowerCase();
    return (st === "All" || b.status === st) && (pr === "All" || b.product === pr) && (pl === "All" || b.plant === pl) && hay.includes(q.toLowerCase());
  }).sort((a, b) => a.code.localeCompare(b.code) || b.rev - a.rev);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE)); const cur = Math.min(page, pages);
  const shown = rows.slice((cur - 1) * PAGE, cur * PAGE);
  const filtered = q || st !== "All" || pr !== "All" || pl !== "All";
  const reset = () => { setQ(""); setSt("All"); setPr("All"); setPl("All"); setPage(1); };
  const f = (fn: (v: string) => void) => (v: string) => { fn(v); setPage(1); };
  const items = (b: Bom): [string, () => void, boolean?][] => {
    const hist: [string, () => void] = ["View History", () => onOpen(b, { tab: "Audit" })];
    if (b.status === "Draft") return [["Edit Draft", () => onEdit(b)], ["Duplicate", () => onDup(b)], ["Delete", () => { if (window.confirm(`Delete ${b.code} Rev ${pad(b.rev)}?`)) onDelete(b); }, true], hist];
    if (b.status === "Active") return [["View BOM", () => onOpen(b)], ["Create Revision", () => onOpen(b, { revModal: true })], ["Duplicate", () => onDup(b)], ["Export", () => exportBom(b)], ["Supersede", () => { if (window.confirm(`Supersede ${b.code} Rev ${pad(b.rev)}?`)) onSupersede(b); }], hist];
    return [["View BOM", () => onOpen(b)], ["Duplicate", () => onDup(b)], ["Export", () => exportBom(b)], hist];
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm text-slate-500">Product Engineering</p><h1 className="text-2xl font-bold tracking-tight text-slate-900">BOM Management</h1>
          <p className="mt-1 text-sm text-slate-600">Manage bills of materials for manufactured products</p></div>
        <button type="button" onClick={onCreate} className={btnDark}><Plus size={16} /> Create BOM</button>
      </div>

      {boms.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-base font-semibold text-slate-900">No BOMs created yet</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-600">Create a BOM to define the materials required to manufacture your products.</p>
          <button type="button" onClick={onCreate} className={`${btnDark} mt-4`}><Plus size={16} /> Create BOM</button>
        </div>
      ) : (
        <>
          <div className={`${card} mb-4 flex flex-wrap items-center gap-2 p-4`}>
            <div className="relative min-w-[240px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => f(setQ)(e.target.value)} placeholder="Search BOM, product, material..." aria-label="Search BOM" className={`${inp} pl-9`} /></div>
            <select aria-label="Status" value={st} onChange={(e) => f(setSt)(e.target.value)} className={`${inp} !w-40`}>{["All", "Draft", "Review", "Active", "Superseded"].map((o) => <option key={o} value={o}>Status: {o}</option>)}</select>
            <select aria-label="Product" value={pr} onChange={(e) => f(setPr)(e.target.value)} className={`${inp} !w-44`}><option value="All">Product: All</option>{PRODUCTS.map((p) => <option key={p.code} value={p.code}>{p.code}</option>)}</select>
            <select aria-label="Plant" value={pl} onChange={(e) => f(setPl)(e.target.value)} className={`${inp} !w-44`}><option value="All">Plant: All</option>{PLANTS.map((o) => <option key={o}>{o}</option>)}</select>
            <button type="button" onClick={reset} className={btnLight}>Reset</button>
          </div>

          <div className={`${card} overflow-hidden`}>
            <p className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">{rows.length} BOMs</p>
            {rows.length === 0 ? (
              <div className="px-6 py-14 text-center"><p className="font-semibold text-slate-900">No BOMs match your filters.</p><p className="mt-1 text-sm text-slate-600">Try changing your search or filters.</p>
                <button type="button" onClick={reset} className={`${btnLight} mt-4`}>Clear Filters</button></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-slate-50"><tr>{["BOM Code", "Product", "Rev", "Status", "Effective", "Components", "Material Cost", "Updated", ""].map((h, i) => <th key={i} className={`${th} ${h === "Material Cost" ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {shown.map((b) => (
                      <tr key={keyOf(b)} onClick={() => onOpen(b)} className="cursor-pointer hover:bg-slate-50">
                        <td className="px-3 py-3 font-bold text-slate-900">{b.code}</td>
                        <td className="px-3 py-3"><p className="font-medium text-slate-900">{b.product}</p><p className="text-xs text-slate-500">{prodOf(b.product).name}</p></td>
                        <td className="px-3 py-3 tabular-nums">{pad(b.rev)}</td>
                        <td className="px-3 py-3"><Badge s={b.status} /></td>
                        <td className="px-3 py-3 text-slate-700">{fmt(b.effective)}</td>
                        <td className="px-3 py-3 tabular-nums">{b.comps.length}</td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{inr(totalOf(b))}</td>
                        <td className="px-3 py-3 text-slate-700">{fmt(b.updated)}</td>
                        <td className="relative px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <button type="button" aria-label="Row actions" aria-expanded={menu === keyOf(b)} onClick={() => setMenu(menu === keyOf(b) ? "" : keyOf(b))} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><MoreVertical size={16} /></button>
                          {menu === keyOf(b) && (
                            <>
                              <button type="button" aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu("")} />
                              <ul className="absolute right-3 top-10 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                {items(b).map(([label, fn, danger]) => <li key={label}><button type="button" onClick={() => { setMenu(""); fn(); }} className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${danger ? "text-red-600" : "text-slate-700"}`}>{label}</button></li>)}
                              </ul>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {rows.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
                <span>Showing {(cur - 1) * PAGE + 1}–{Math.min(cur * PAGE, rows.length)} of {rows.length}{filtered ? " (filtered)" : ""}</span>
                <div className="flex gap-2"><button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)} className={`${btnLight} !h-8`}>← Prev</button>
                  <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)} className={`${btnLight} !h-8`}>Next →</button></div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* =====================  2. CREATE / EDIT DRAFT (5 steps)  ===================== */
function CreateView({ initial, boms, onSave, onExit, onOpen }: { initial?: Bom; boms: Bom[]; onSave: (b: Bom) => void; onExit: () => void; onOpen: (b: Bom) => void }) {
  const [step, setStep] = useState(initial ? 1 : 0);
  const [max, setMax] = useState(initial ? 1 : 0);
  const [b, setB] = useState<Bom | null>(initial ?? null);
  const [pc, setPc] = useState(initial?.product ?? "");
  const [q, setQ] = useState("");
  const [choice, setChoice] = useState<"revision" | "separate">("revision");
  const [info, setInfo] = useState({ type: initial?.type ?? "Manufacturing BOM", plant: initial?.plant ?? "Delhi Factory", baseQty: initial?.baseQty ?? 1, uom: initial?.uom ?? "Pair", effective: initial?.effective ?? "", desc: initial?.desc ?? "" });
  const [drawer, setDrawer] = useState<{ comp: Comp | null } | null>(null);
  const [submit, setSubmit] = useState(false);
  const [reviewer, setReviewer] = useState(REVIEWERS[0]); const [comment, setComment] = useState("");
  const [result, setResult] = useState<Bom | null>(null);

  const prod = pc ? prodOf(pc) : null;
  const existing = prod ? boms.filter((x) => x.product === prod.code && (!initial || keyOf(x) !== keyOf(initial))).sort((a, c) => c.rev - a.rev) : [];
  const go = (i: number) => { setStep(i); setMax((m) => Math.max(m, i)); };
  const base = (): Bom => {
    if (b) return { ...b, ...info };
    const useRev = existing.length > 0 && choice === "revision";
    const codes = boms.map((x) => +x.code.slice(4));
    return { code: useRev ? existing[0].code : `BOM-${String(Math.max(0, ...codes) + 1).padStart(3, "0")}`, rev: useRev ? Math.max(...existing.map((x) => x.rev)) + 1 : 1,
      product: pc, status: "Draft", ...info, effective: info.effective || today(), comps: [], mode: "all", off: [], reason: useRev ? "New revision" : "New BOM", updated: today(), createdBy: USER, audit: [] };
  };
  const cont = () => { const nb = base(); setB(nb); go(1); };
  const saveDraft = () => {
    const nb = { ...base(), updated: today(), status: "Draft" as Status };
    const done = { ...nb, audit: nb.audit.some((a) => a.action === "Created BOM") ? nb.audit : [A(today(), USER, "Created BOM", `Rev ${nb.rev}`), ...nb.audit] };
    onSave(done); setB(done); setResult(done); setStep(4);
  };
  const doSubmit = () => {
    const nb = base();
    const done: Bom = { ...nb, status: "Review", reviewer, updated: today(), audit: [A(today(), USER, "Submitted for review", reviewer), ...(nb.audit.some((a) => a.action === "Created BOM") ? [] : [A(today(), USER, "Created BOM", `Rev ${nb.rev}`)]), ...nb.audit] };
    onSave(done); setB(done); setResult(done); setSubmit(false); setStep(4);
  };
  const updComps = (fn: (c: Comp[]) => Comp[]) => setB((p) => (p ? { ...p, comps: fn(p.comps) } : p));
  const issues = b && prod ? validate(b, prod) : [];
  const errors = issues.filter((i) => i.lvl === "error");
  const head = (right = true) => (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div><button type="button" onClick={onExit} className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"><ArrowLeft size={14} /> BOM Management</button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{prod ? `${prod.code} / ` : ""}{initial ? "Edit Draft BOM" : "Create BOM"}</h1></div>
      {right && <span className="text-sm text-slate-500">Step {step + 1} of 5</span>}
    </div>
  );
  const foot = (opts: { back?: boolean; next?: React.ReactNode; draft?: boolean }) => (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
      {opts.back ? <button type="button" onClick={() => setStep(step - 1)} className={btnLight}>← Back</button> : <button type="button" onClick={onExit} className={btnLight}>Cancel</button>}
      <div className="flex gap-2">{opts.draft !== false && <button type="button" disabled={!pc} onClick={saveDraft} className={btnLight}>Save Draft</button>}{opts.next}</div>
    </div>
  );

  /* Step 5: saved */
  if (step === 4 && result) {
    return (
      <div>{head()}<Stepper step={4} max={4} go={go} />
        <div className={`${card} px-6 py-14 text-center`}>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600"><Check size={30} /></span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">{result.status === "Review" ? "BOM submitted for review" : "BOM saved as draft"}</h2>
          <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-600">{result.code} • Revision {result.rev} • Status: <Badge s={result.status} /></p>
          <div className="mt-5 flex justify-center gap-2"><button type="button" onClick={() => onOpen(result)} className={btnDark}>View BOM</button>
            {result.status === "Draft" && <button type="button" onClick={() => setStep(1)} className={btnLight}>Continue Editing</button>}
            <button type="button" onClick={onExit} className={btnLight}>BOM List</button></div>
        </div></div>
    );
  }

  return (
    <div>
      {head()}<Stepper step={step} max={max} go={go} />

      {step === 0 && (
        <>
          {!prod ? (
            <section className={`${card} p-5`}>
              <h2 className="text-base font-semibold text-slate-900">Select Product</h2><p className="mb-4 text-sm text-slate-600">Choose the product/style this BOM will manufacture.</p>
              <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product code or name..." aria-label="Search product" className={`${inp} pl-9`} /></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {PRODUCTS.filter((p) => `${p.code} ${p.name}`.toLowerCase().includes(q.toLowerCase())).map((p) => (
                  <button key={p.code} type="button" onClick={() => setPc(p.code)} className="rounded-xl border border-slate-200 p-4 text-left outline-none transition hover:border-indigo-300 hover:bg-indigo-50/40 focus-visible:ring-2 focus-visible:ring-indigo-400">
                    <p className="font-bold text-slate-900">{p.code}</p><p className="text-sm text-slate-800">{p.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{p.cat} • {p.gender} • {p.colors.length * sizesOf(p).length} SKUs</p></button>))}
              </div>
              {foot({ draft: false })}
            </section>
          ) : (
            <div className="space-y-4">
              <section className={`${card} flex flex-wrap items-start justify-between gap-3 p-5`}>
                <div><p className="text-xl font-bold text-slate-900">{prod.code}</p><p className="text-sm text-slate-800">{prod.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{prod.cat} • {prod.gender} • {prod.constr} • {prod.colors.length * sizesOf(prod).length} SKUs</p></div>
                {!initial && <button type="button" onClick={() => { setPc(""); setB(null); }} className={`${btnLight} !h-9`}>Change Product</button>}
              </section>
              {existing.length > 0 && !b && (
                <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} /> Existing BOM found</p>
                  <p className="mt-1">{prod.code} already has {existing.map((x) => `${x.code} Rev ${x.rev} (${x.status})`).join(", ")}.</p>
                  {(["revision", "separate"] as const).map((v) => (
                    <label key={v} className="mt-2 flex items-start gap-2"><input type="radio" name="choice" checked={choice === v} onChange={() => setChoice(v)} className="mt-1 accent-indigo-600" />
                      <span><b>{v === "revision" ? "Create new revision" : "Create separate BOM"}</b> — {v === "revision" ? "recommended when modifying the current manufacturing definition." : "for a genuinely different manufacturing definition."}</span></label>))}
                </section>
              )}
              <section className={`${card} p-5`}>
                <h2 className="mb-4 text-base font-semibold text-slate-900">BOM Information</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Label t="BOM Type"><Sel value={info.type} onChange={(v) => setInfo({ ...info, type: v })} options={["Manufacturing BOM"]} /></Label>
                  <Label t="Plant"><Sel value={info.plant} onChange={(v) => setInfo({ ...info, plant: v })} options={PLANTS} /></Label>
                  <Label t="Base Quantity"><input type="number" min={1} value={info.baseQty} onChange={(e) => setInfo({ ...info, baseQty: +e.target.value })} className={inp} /></Label>
                  <Label t="Base UOM"><Sel value={info.uom} onChange={(v) => setInfo({ ...info, uom: v })} options={["Pair", "Set", "Pcs"]} /></Label>
                  <Label t="Effective From *"><input type="date" value={info.effective} onChange={(e) => setInfo({ ...info, effective: e.target.value })} className={inp} /></Label>
                  <Label t="Description" className="sm:col-span-3"><textarea rows={2} value={info.desc} onChange={(e) => setInfo({ ...info, desc: e.target.value })} placeholder={`Standard manufacturing BOM for ${prod.code}`} className={`${inp} h-auto py-2`} /></Label>
                </div>
              </section>
              {foot({ next: <button type="button" onClick={() => { if (!info.effective) setInfo((i) => ({ ...i, effective: today() })); cont(); }} className={btnDark}>Continue →</button> })}
            </div>
          )}
        </>
      )}

      {step === 1 && b && prod && (
        <>
          <section className={`${card} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><p className="text-sm"><b className="text-slate-900">{b.code} / Revision {b.rev}</b> <span className="ml-2 text-slate-500">Base Quantity: {b.baseQty} {b.uom}</span></p>
              <button type="button" onClick={() => setDrawer({ comp: null })} className={`${btnDark} !h-9`}><Plus size={15} /> Add Material</button></div>
            <CompTable comps={b.comps} cols={["seq", "mat", "type", "basis", "net", "uom", "scrap", "gross", "op", "cost"]} total={totalOf(b)} onRow={(c) => setDrawer({ comp: c })} onDelete={(c) => updComps((x) => x.filter((y) => y.id !== c.id))} />
          </section>
          {foot({ back: true, next: <button type="button" onClick={() => go(2)} className={btnDark}>Continue →</button> })}
        </>
      )}

      {step === 2 && b && prod && (() => {
        const sizes = sizesOf(prod); const total = prod.colors.length * sizes.length; const on = enabled(b, prod).length; const pct = Math.round((on / total) * 100);
        const toggleV = (c: string, s: number) => setB({ ...b, off: b.off.includes(`${c}|${s}`) ? b.off.filter((x) => x !== `${c}|${s}`) : [...b.off, `${c}|${s}`] });
        return (
          <>
            <section className={`${card} p-5`}>
              <h2 className="text-base font-semibold text-slate-900">Variant Applicability</h2>
              <p className="mb-3 text-sm text-slate-600">Define which product variants this BOM applies to. Component-specific rules are configured from Components.</p>
              {([["all", "All Variants"], ["selected", "Selected Variants"]] as const).map(([v, l]) => (
                <label key={v} className="mb-1 flex items-center gap-2 text-sm"><input type="radio" name="mode" checked={b.mode === v} onChange={() => setB({ ...b, mode: v, off: v === "all" ? [] : b.off })} className="accent-indigo-600" />{l}</label>))}
              <div className="mt-4 overflow-x-auto"><table className="border border-slate-200 text-sm">
                <thead className="bg-slate-50"><tr><th className={th}>Color \ Size</th>{sizes.map((s) => <th key={s} className={`${th} text-center`}>UK {s}</th>)}</tr></thead>
                <tbody>{prod.colors.map((c) => (<tr key={c} className="border-t border-slate-200"><td className="px-3 py-2 font-semibold">{c}</td>
                  {sizes.map((s) => <td key={s} className="px-3 py-2 text-center"><input type="checkbox" aria-label={`${c} UK ${s}`} disabled={b.mode === "all"} checked={!b.off.includes(`${c}|${s}`)} onChange={() => toggleV(c, s)} className="h-4 w-4 accent-indigo-600" /></td>)}</tr>))}</tbody></table></div>
              {b.mode === "selected" && <div className="mt-2 flex gap-2"><button type="button" onClick={() => setB({ ...b, off: [] })} className={`${btnLight} !h-8`}>Select All</button>
                <button type="button" onClick={() => setB({ ...b, off: prod.colors.flatMap((c) => sizes.map((s) => `${c}|${s}`)) })} className={`${btnLight} !h-8`}>Clear All</button></div>}
              <p className="mb-1.5 mt-4 text-sm"><b>{on} / {total} variants covered</b> <span className="text-slate-500">({pct}%)</span></p><Progress pct={pct} />
            </section>
            {foot({ back: true, next: <button type="button" onClick={() => go(3)} className={btnDark}>Continue →</button> })}
          </>
        );
      })()}

      {step === 3 && b && prod && (() => {
        const total = prod.colors.length * sizesOf(prod).length; const on = enabled(b, prod).length;
        const ops = new Set(b.comps.map((c) => c.op).filter(Boolean)).size;
        const rows: [string, string][] = [["BOM Information", `${b.baseQty} ${b.uom} • ${b.plant} • ${fmt(b.effective)}`], ["Components", `${b.comps.length} components`], ["Variants", `${on} / ${total} variants`], ["Operations", `${ops} operations`], ["Cost", `Material Cost: ${inr(totalOf(b))}`]];
        const bad = (t: string) => issues.some((i) => i.lvl === "error" && i.step === ({ "BOM Information": 0, Components: 1, Variants: 2 } as Record<string, number>)[t]);
        return (
          <>
            <section className={`${card} p-5`}>
              <h2 className="text-base font-semibold text-slate-900">Review BOM</h2><p className="mb-3 text-sm text-slate-600">{prod.code} — {prod.name} • {b.code} • Revision {b.rev}</p>
              {rows.map(([k, v]) => (<div key={k} className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm"><b className="text-slate-900">{k}</b>
                <span className={bad(k) ? "text-red-600" : "text-slate-700"}>{v} <span className={`ml-1 font-medium ${bad(k) ? "text-red-600" : "text-emerald-600"}`}>{bad(k) ? "✕ Incomplete" : "✓ Complete"}</span></span></div>))}
              {errors.length > 0 ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="flex items-center gap-2 font-semibold text-red-700"><AlertTriangle size={16} /> BOM cannot be submitted</p>
                  <p className="mb-2 text-sm text-red-700">{errors.length} {errors.length === 1 ? "issue requires" : "issues require"} attention.</p>
                  <ul className="space-y-1 text-sm">{issues.map((i) => <li key={i.text}><button type="button" onClick={() => setStep(i.step)} className={`text-left hover:underline ${i.lvl === "error" ? "text-red-700" : "text-amber-700"}`}>{i.lvl === "error" ? "❌" : "⚠"} {i.text}</button></li>)}</ul>
                  <button type="button" onClick={() => setStep(errors[0].step)} className={`${btnLight} mt-3 !h-9`}>Fix Issues</button>
                </div>
              ) : (
                <div className="mt-4 text-sm"><p className="font-semibold text-slate-900">Validation</p>
                  <p className="mt-1 text-emerald-700">✓ All materials are active · ✓ Quantities &gt; 0 · ✓ Size/color rules complete · ✓ Effective date valid</p>
                  {issues.map((i) => <p key={i.text} className="mt-1 text-amber-700">⚠ {i.text}</p>)}
                  <p className="mt-2 font-bold text-emerald-700">BOM is ready for submission</p></div>
              )}
            </section>
            {foot({ back: true, next: <button type="button" disabled={errors.length > 0} onClick={() => setSubmit(true)} className={btnGreen}>Submit for Review</button> })}
          </>
        );
      })()}

      {drawer && b && prod && (
        <CompDrawer key={drawer.comp?.id ?? "new"} product={prod} comp={drawer.comp} onClose={() => setDrawer(null)}
          onDelete={drawer.comp ? () => { updComps((x) => x.filter((y) => y.id !== drawer.comp!.id)); setDrawer(null); } : undefined}
          onSave={(c) => { updComps((x) => (x.some((y) => y.id === c.id) ? x.map((y) => (y.id === c.id ? c : y)) : [...x, c])); setDrawer(null); }} />
      )}
      {submit && b && (
        <Modal title="Submit BOM for Review" onClose={() => setSubmit(false)} footer={<><button type="button" onClick={() => setSubmit(false)} className={btnLight}>Cancel</button><button type="button" onClick={doSubmit} className={btnGreen}>Submit for Review</button></>}>
          <div><p className="font-bold text-slate-900">{b.code} / Revision {b.rev}</p><p className="text-sm text-slate-600">{b.product} — {prodOf(b.product).name}</p>
            <p className="mt-1 text-xs text-slate-500">Once submitted, this BOM becomes read-only until approved or returned for changes.</p></div>
          <Label t="Reviewer"><Sel value={reviewer} onChange={setReviewer} options={REVIEWERS} /></Label>
          <Label t="Comment"><textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Standard BOM for FW 2026 collection" className={`${inp} h-auto py-2`} /></Label>
        </Modal>
      )}
    </div>
  );
}

/* =====================  3. DETAIL WORKSPACE  ===================== */
const TABS = ["Overview", "Components", "Variants", "Operations", "Cost", "Revisions", "Audit"];
function DetailView({ b, all, onBack, upsert, onOpen, notify, startTab, startRevModal }: {
  b: Bom; all: Bom[]; onBack: () => void; upsert: (b: Bom) => void; onOpen: (b: Bom) => void; notify: (m: string) => void; startTab?: string; startRevModal?: boolean;
}) {
  const p = prodOf(b.product);
  const [tab, setTab] = useState(startTab ?? "Overview");
  const [checks, setChecks] = useState<boolean[]>(CHECKLIST.map(() => false)); const [rcomment, setRcomment] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false); const [reason, setReason] = useState(""); const [rejNote, setRejNote] = useState("");
  const [revOpen, setRevOpen] = useState(!!startRevModal); const [rev, setRev] = useState({ eff: "", copy: true, reason: "" });
  const [drawer, setDrawer] = useState<{ comp: Comp | null } | null>(null);
  const [cols, setCols] = useState(["mat", "type", "net", "uom", "scrap", "op", "cost"]); const [colsOpen, setColsOpen] = useState(false);
  const [cq, setCq] = useState(""); const [vq, setVq] = useState(""); const [breakdown, setBreakdown] = useState(false);
  const revs = all.filter((x) => x.code === b.code).sort((x, y) => y.rev - x.rev);
  const [cmp, setCmp] = useState<[number, number] | null>(revs.length > 1 ? [revs[1].rev, revs[0].rev] : null);
  const issues = validate(b, p); const errs = issues.filter((i) => i.lvl === "error").length;
  const vTotal = p.colors.length * sizesOf(p).length; const vOn = enabled(b, p).length;
  const ops = new Set(b.comps.map((c) => c.op).filter(Boolean)).size; const total = totalOf(b);
  const routing = ROUTING[b.product];
  const ready = [["Product", true], ["Components", b.comps.length > 0], ["Variants", vOn === vTotal], ["Operations", ops > 0], ["Cost", total > 0], ["Validation", errs === 0]] as [string, boolean][];
  const pct = Math.round((ready.filter((r) => r[1]).length / ready.length) * 100);
  const editable = b.status === "Draft";
  const log = (a: Audit) => ({ ...b, updated: today(), audit: [a, ...b.audit] });

  const approve = () => {
    all.filter((x) => x.code === b.code && x.status === "Active" && x.rev !== b.rev).forEach((x) => upsert({ ...x, status: "Superseded", updated: today(), audit: [A(today(), USER, "Superseded", `Replaced by Rev ${b.rev}`), ...x.audit] }));
    upsert({ ...log(A(today(), USER, "Approved", `Rev ${b.rev} approved`)), status: "Active" }); notify("BOM approved and active");
  };
  const reject = () => { upsert({ ...log(A(today(), USER, "Rejected", `${reason}: ${rejNote}`)), status: "Draft" }); setRejectOpen(false); notify("BOM returned for changes"); };
  const createRev = () => {
    const nr = Math.max(...revs.map((x) => x.rev)) + 1;
    const nb: Bom = { ...b, rev: nr, status: "Draft", effective: rev.eff, reason: rev.reason, updated: today(), createdBy: USER, reviewer: undefined, audit: [A(today(), USER, "Created revision", `Rev ${nr} created`)],
      comps: rev.copy ? b.comps.map((c) => ({ ...JSON.parse(JSON.stringify(c)), id: nid() })) : [] };
    upsert(nb); setRevOpen(false); notify(`Revision ${nr} created as Draft`); onOpen(nb);
  };
  const saveComp = (c: Comp) => {
    const exists = b.comps.some((x) => x.id === c.id);
    upsert({ ...log(A(today(), USER, exists ? "Updated component" : "Added component", matOf(c.mat).name)), comps: exists ? b.comps.map((x) => (x.id === c.id ? c : x)) : [...b.comps, c] }); setDrawer(null);
  };
  const delComp = (c: Comp) => { upsert({ ...log(A(today(), USER, "Removed component", matOf(c.mat).name)), comps: b.comps.filter((x) => x.id !== c.id) }); setDrawer(null); };

  const shownComps = b.comps.filter((c) => `${matOf(c.mat).name} ${c.mat}`.toLowerCase().includes(cq.toLowerCase()));
  const skus = p.colors.flatMap((c) => sizesOf(p).map((s) => ({ sku: skuOf(p, c, s), c, s, ok: !b.off.includes(`${c}|${s}`) }))).filter((v) => v.sku.toLowerCase().includes(vq.toLowerCase()));
  const sorted = [...b.comps].sort((x, y) => costOf(y) - costOf(x)); const top = sorted.slice(0, 4); const others = sorted.slice(4).reduce((s, c) => s + costOf(c), 0);
  const mfg = total + COSTING.labor + COSTING.machine + COSTING.overhead + COSTING.packaging;
  const cA = cmp ? revs.find((r) => r.rev === cmp[0]) : undefined; const cB = cmp ? revs.find((r) => r.rev === cmp[1]) : undefined;

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"><ArrowLeft size={14} /> BOM Management</button>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">{b.code} / Revision {b.rev} <Badge s={b.status} /></h1>
          <p className="mt-1 text-sm text-slate-800">{b.product} — {p.name}</p>
          <p className="text-xs text-slate-500">Effective: {fmt(b.effective)} · Plant: {b.plant} · Output: {b.baseQty} {b.uom}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {b.status === "Active" && <button type="button" onClick={() => setRevOpen(true)} className={btnDark}>Create Revision</button>}
          <button type="button" onClick={() => { const nc = `BOM-${String(Math.max(...all.map((x) => +x.code.slice(4))) + 1).padStart(3, "0")}`; const nb = { ...b, code: nc, rev: 1, status: "Draft" as Status, updated: today(), audit: [A(today(), USER, "Created BOM", `Duplicated from ${b.code} Rev ${b.rev}`)], comps: b.comps.map((c) => ({ ...c, id: nid() })) }; upsert(nb); notify(`Duplicated as ${nc}`); onOpen(nb); }} className={btnLight}>Duplicate</button>
          <button type="button" onClick={() => exportBom(b)} className={btnLight}><Download size={15} /> Export</button>
        </div>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${tab === t ? "border-indigo-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{t}</button>)}
      </div>

      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["COMPONENTS", b.comps.length, ""], ["VARIANTS", `${vOn} / ${vTotal}`, `${Math.round((vOn / vTotal) * 100)}%`], ["MATERIAL COST", inr(total), "/ pair"]].map(([k, v, s]) => (
              <div key={k as string} className={`${card} p-5 text-center`}><p className="text-xs font-medium tracking-wide text-slate-500">{k}</p><p className="mt-1 text-2xl font-bold text-slate-900">{v}</p><p className="text-xs text-indigo-600">{s}</p></div>))}
          </div>
          <section className={`${card} p-5`}><p className="mb-2 text-sm font-semibold text-slate-900">Manufacturing Readiness — {pct}%</p><Progress pct={pct} />
            <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-3">{ready.map(([k, ok]) => <li key={k} className={ok ? "text-emerald-700" : "text-amber-700"}>{ok ? "✓" : "⚠"} {k}</li>)}</ul></section>
          {b.status === "Review" && (
            <section className="rounded-xl border border-amber-300 bg-amber-50/50 p-5">
              <p className="mb-2 text-sm font-semibold text-slate-900">Reviewer Checklist</p>
              {CHECKLIST.map((c, i) => <label key={c} className="flex items-center gap-2 py-0.5 text-sm text-slate-700"><input type="checkbox" checked={checks[i]} onChange={() => setChecks(checks.map((x, j) => (j === i ? !x : x)))} className="h-4 w-4 accent-indigo-600" />{c}</label>)}
              <textarea rows={2} value={rcomment} onChange={(e) => setRcomment(e.target.value)} placeholder="Reviewer comments" aria-label="Reviewer comments" className={`${inp} mt-3 h-auto py-2`} />
              <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setRejectOpen(true)} className="inline-flex h-10 items-center rounded-lg border border-red-300 px-4 text-sm font-medium text-red-600 hover:bg-red-50">Reject</button>
                <button type="button" disabled={!checks.every(Boolean)} onClick={approve} className={btnGreen}>Approve BOM</button></div>
            </section>
          )}
          {b.reason && <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">Change reason: {b.reason}</div>}
          <section className={`${card} p-5`}><p className="mb-2 text-sm font-semibold text-slate-900">Recent Changes</p>
            <ul className="space-y-1 text-sm text-slate-700">{b.audit.slice(0, 3).map((a, i) => <li key={i}>{fmt(a.date)} — <b>{a.action}</b> {a.details} <span className="text-slate-500">by {a.user}</span></li>)}{!b.audit.length && <li className="text-slate-500">No changes recorded yet.</li>}</ul></section>
        </div>
      )}

      {tab === "Components" && (
        <section className={`${card} overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-2 p-4">
            <div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={cq} onChange={(e) => setCq(e.target.value)} placeholder="Search components..." aria-label="Search components" className={`${inp} pl-9`} /></div>
            <div className="relative"><button type="button" onClick={() => setColsOpen(!colsOpen)} aria-expanded={colsOpen} className={btnLight}><SlidersHorizontal size={15} /> Columns</button>
              {colsOpen && (<><button type="button" aria-label="Close columns" className="fixed inset-0 z-10 cursor-default" onClick={() => setColsOpen(false)} />
                <div className="absolute right-0 top-11 z-20 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">{COL_ALL.filter((k) => k !== "seq").map((k) => (
                  <label key={k} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50"><input type="checkbox" checked={cols.includes(k)} onChange={() => setCols(cols.includes(k) ? cols.filter((x) => x !== k) : [...cols, k])} className="accent-indigo-600" />{COL_LABEL[k]}</label>))}</div></>)}</div>
            <button type="button" onClick={() => exportBom(b)} className={btnLight}><Download size={15} /> Export</button>
            {editable && <button type="button" onClick={() => setDrawer({ comp: null })} className={btnDark}><Plus size={15} /> Add Material</button>}
          </div>
          <CompTable comps={shownComps} cols={cols} total={total} onRow={editable ? (c) => setDrawer({ comp: c }) : undefined} />
          {!editable && <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">This BOM is {b.status === "Active" ? "active" : "read-only"}. Use Create Revision to change the manufacturing definition.</p>}
        </section>
      )}

      {tab === "Variants" && (
        <section className={`${card} p-5`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold text-slate-900">Variants</h2><span className="text-sm text-slate-600">Coverage <b>{vOn} / {vTotal} • {Math.round((vOn / vTotal) * 100)}%</b></span></div>
          <input value={vq} onChange={(e) => setVq(e.target.value)} placeholder="Search SKU..." aria-label="Search SKU" className={`${inp} mb-3 max-w-xs`} />
          <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[520px] text-sm"><thead className="bg-slate-50"><tr>{["SKU", "Color", "Size", "BOM Coverage", "Status"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{skus.map((v) => (<tr key={v.sku}><td className="px-3 py-2 font-medium text-slate-900">{v.sku}</td><td className="px-3 py-2">{v.c}</td><td className="px-3 py-2">UK {v.s}</td>
              <td className={`px-3 py-2 ${v.ok ? "text-emerald-700" : "text-slate-400"}`}>{v.ok ? "✓ Complete" : "— Not covered"}</td><td className="px-3 py-2">{v.ok ? "Active" : "Excluded"}</td></tr>))}</tbody></table></div>
        </section>
      )}

      {tab === "Operations" && (
        <section className={`${card} p-5`}>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Material Consumption by Operation</h2>
          {routing ? (
            <>
              <div className="mb-3 flex items-center justify-between text-sm"><p>Routing: <b>{b.product} / Routing Rev {routing}</b></p><Link href="/dashboard/product-engineering/routing" className="font-medium text-indigo-600 hover:underline">View Route</Link></div>
              <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[520px] text-sm"><thead className="bg-slate-50"><tr>{["Operation", "Work Center", "Components"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">{OPS.map((o) => { const names = b.comps.filter((c) => c.op === o).map((c) => matOf(c.mat).name); const nm = o.split(" - ")[1];
                  return <tr key={o}><td className="px-3 py-2 font-medium text-slate-900">{o.replace(" - ", " ")}</td><td className="px-3 py-2 text-slate-600">{WORK_CENTER[nm]}</td><td className="px-3 py-2 text-slate-700">{names.join(", ") || "—"}</td></tr>; })}</tbody></table></div>
              {editable && b.comps.length > 0 && <p className="mt-3 text-xs text-slate-500">Operation badalne ke liye Components tab me row par click karo.</p>}
            </>
          ) : (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} /> Routing not configured</p>
              <p className="mt-1">This product does not have an active routing. You can continue creating the BOM and assign operations after the routing is created.</p>
              <div className="mt-3 flex gap-2"><button type="button" onClick={() => setTab("Overview")} className={`${btnLight} !h-9`}>Continue Without Routing</button><Link href="/dashboard/product-engineering/routing" className={`${btnDark} !h-9`}>Create Routing</Link></div>
            </div>
          )}
        </section>
      )}

      {tab === "Cost" && (
        <div className="space-y-4">
          <section className={`${card} p-5`}>
            <h2 className="text-base font-semibold text-slate-900">BOM Cost Summary</h2><p className="mb-3 text-sm text-slate-600">Cost Basis: {b.baseQty} {b.uom}</p>
            <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500">MATERIAL COST</p>
            {b.comps.map((c) => <div key={c.id} className="flex justify-between py-1 text-sm"><span className="text-slate-700">{matOf(c.mat).name}</span><span className="tabular-nums">{inr(costOf(c))}</span></div>)}
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold"><span>Material Cost</span><span className="tabular-nums">{inr(total)}</span></div>
            <div className="flex justify-between font-semibold"><span>Cost per {b.uom}</span><span className="tabular-nums">{inr(total / (b.baseQty || 1))}</span></div>
            <button type="button" onClick={() => setBreakdown(!breakdown)} className={`${btnLight} mt-3 !h-9`}>{breakdown ? "Hide" : "View"} Cost Breakdown</button>
          </section>
          {breakdown && (
            <section className={`${card} p-5`}>
              <h2 className="text-base font-semibold text-slate-900">Cost Breakdown</h2><p className="mb-3 text-2xl font-bold">{inr(total)} <span className="text-sm font-medium text-slate-500">Material Cost</span></p>
              {[...top.map((c) => [matOf(c.mat).name, costOf(c)] as [string, number]), ...(others > 0 ? [["Others", others] as [string, number]] : [])].map(([k, v]) => (
                <div key={k} className="mb-2 grid grid-cols-[110px_1fr_90px] items-center gap-3 text-sm"><span className="truncate text-slate-700">{k}</span><div className="h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${total ? (v / total) * 100 : 0}%` }} /></div><span className="text-right tabular-nums">{inr(v)}</span></div>))}
              <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm">
                {[["Material Cost", total], ["Labor Cost", COSTING.labor], ["Machine Cost", COSTING.machine], ["Factory Overhead", COSTING.overhead], ["Packaging", COSTING.packaging]].map(([k, v]) => <div key={k as string} className="flex justify-between"><span className="text-slate-600">{k}</span><span className="tabular-nums">{inr(v as number)}</span></div>)}
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold"><span>Manufacturing Cost</span><span className="tabular-nums">{inr(mfg)}</span></div></div>
              <p className="mt-2 text-xs text-slate-500">BOM sirf material cost deta hai. Baaki values costing engine se aati hain.</p>
            </section>
          )}
        </div>
      )}

      {tab === "Revisions" && (
        <div className="space-y-4">
          <section className={`${card} p-5`}>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold text-slate-900">BOM Revisions</h2>{b.status === "Active" && <button type="button" onClick={() => setRevOpen(true)} className={`${btnDark} !h-9`}><Plus size={15} /> Create Revision</button>}</div>
            <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[520px] text-sm"><thead className="bg-slate-50"><tr>{["Revision", "Status", "Effective From", "Created By", ""].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">{revs.map((r) => (<tr key={r.rev} className={r.rev === b.rev ? "bg-indigo-50/50" : ""}><td className="px-3 py-2 font-semibold">Rev {r.rev}</td><td className="px-3 py-2"><Badge s={r.status} /></td><td className="px-3 py-2">{fmt(r.effective)}</td><td className="px-3 py-2">{r.createdBy}</td>
                <td className="px-3 py-2 text-right">{r.rev !== b.rev && <button type="button" onClick={() => onOpen(r)} className="text-sm font-medium text-indigo-600 hover:underline">View Revision</button>}</td></tr>))}</tbody></table></div>
          </section>
          {revs.length > 1 && cmp && cA && cB && (
            <section className={`${card} p-5`}>
              <div className="mb-3 flex flex-wrap items-center gap-2"><h2 className="mr-2 text-base font-semibold text-slate-900">Compare Revisions</h2>
                <select aria-label="Revision A" value={cmp[0]} onChange={(e) => setCmp([+e.target.value, cmp[1]])} className={`${inp} !w-28`}>{revs.map((r) => <option key={r.rev} value={r.rev}>Rev {r.rev}</option>)}</select><span className="text-slate-500">vs</span>
                <select aria-label="Revision B" value={cmp[1]} onChange={(e) => setCmp([cmp[0], +e.target.value])} className={`${inp} !w-28`}>{revs.map((r) => <option key={r.rev} value={r.rev}>Rev {r.rev}</option>)}</select></div>
              <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[520px] text-sm"><thead className="bg-slate-50"><tr><th className={th}>Material</th><th className={th}>Rev {cA.rev}<span className="block font-normal text-slate-500">Effective {fmt(cA.effective)}</span></th><th className={th}>Rev {cB.rev}<span className="block font-normal text-slate-500">Effective {fmt(cB.effective)}</span></th><th className={th}>Change</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{Array.from(new Set([...cA.comps, ...cB.comps].map((c) => c.mat))).map((code) => {
                  const x = cA.comps.find((c) => c.mat === code); const y = cB.comps.find((c) => c.mat === code); const q = (c?: Comp) => (c ? `${n3(netOf(c))} ${c.uom}` : "—");
                  const ch = !x ? "Added" : !y ? "Removed" : Math.abs(netOf(x) - netOf(y)) < 1e-9 && x.scrap === y.scrap ? "—" : netOf(y) < netOf(x) ? "↓ Changed" : "↑ Changed";
                  return <tr key={code}><td className="px-3 py-2 font-medium">{matOf(code).name}</td><td className="px-3 py-2">{q(x)}</td><td className="px-3 py-2">{q(y)}</td><td className={`px-3 py-2 ${ch === "—" ? "text-slate-400" : "font-medium text-indigo-700"}`}>{ch}</td></tr>; })}
                  <tr className="bg-slate-50 font-semibold"><td className="px-3 py-2">Material Cost</td><td className="px-3 py-2">{inr(totalOf(cA))}</td><td className="px-3 py-2">{inr(totalOf(cB))}</td><td className="px-3 py-2">{totalOf(cB) === totalOf(cA) ? "—" : `${totalOf(cB) < totalOf(cA) ? "↓" : "↑"} ${inr(Math.abs(totalOf(cB) - totalOf(cA)))}`}</td></tr></tbody></table></div>
              <p className="mt-3 text-sm text-slate-700"><b>Change Reason:</b> {(cA.rev > cB.rev ? cA : cB).reason || "—"}</p>
            </section>
          )}
        </div>
      )}

      {tab === "Audit" && (
        <section className={`${card} p-5`}><h2 className="mb-3 text-base font-semibold text-slate-900">BOM History</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[520px] text-sm"><thead className="bg-slate-50"><tr>{["Date", "User", "Action", "Details"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{b.audit.map((a, i) => <tr key={i}><td className="px-3 py-2">{fmt(a.date)}</td><td className="px-3 py-2">{a.user}</td><td className="px-3 py-2 font-medium">{a.action}</td><td className="px-3 py-2 text-slate-600">{a.details}</td></tr>)}
              {!b.audit.length && <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">No history yet.</td></tr>}</tbody></table></div></section>
      )}

      {drawer && <CompDrawer key={drawer.comp?.id ?? "new"} product={p} comp={drawer.comp} onClose={() => setDrawer(null)} onSave={saveComp} onDelete={drawer.comp ? () => delComp(drawer.comp!) : undefined} />}
      {rejectOpen && (
        <Modal title="Reject BOM" onClose={() => setRejectOpen(false)} footer={<><button type="button" onClick={() => setRejectOpen(false)} className={btnLight}>Cancel</button><button type="button" disabled={!reason || !rejNote.trim()} onClick={reject} className="inline-flex h-10 items-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">Reject BOM</button></>}>
          <fieldset><legend className="mb-1.5 text-[13px] font-medium text-slate-700">Reason *</legend>{REJECT_REASONS.map((r) => <label key={r} className="flex items-center gap-2 py-0.5 text-sm"><input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-indigo-600" />{r}</label>)}</fieldset>
          <Label t="Comments *"><textarea rows={3} value={rejNote} onChange={(e) => setRejNote(e.target.value)} placeholder="Please revise leather quantity for UK 10." className={`${inp} h-auto py-2`} /></Label>
        </Modal>
      )}
      {revOpen && (
        <Modal title="Create New BOM Revision" onClose={() => setRevOpen(false)} footer={<><button type="button" onClick={() => setRevOpen(false)} className={btnLight}>Cancel</button><button type="button" disabled={!rev.eff || !rev.reason.trim()} onClick={createRev} className={btnDark}>Create Revision</button></>}>
          <div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-500">Current Revision</p><p className="font-semibold">Rev {b.rev}</p></div><div><p className="text-xs text-slate-500">New Revision</p><p className="font-semibold">Rev {Math.max(...revs.map((x) => x.rev)) + 1}</p></div></div>
          <Label t="Effective From *"><input type="date" value={rev.eff} onChange={(e) => setRev({ ...rev, eff: e.target.value })} className={inp} /></Label>
          <fieldset><legend className="mb-1.5 text-[13px] font-medium text-slate-700">Copy existing BOM</legend>
            {[true, false].map((v) => <label key={String(v)} className="mr-5 inline-flex items-center gap-2 text-sm"><input type="radio" name="copy" checked={rev.copy === v} onChange={() => setRev({ ...rev, copy: v })} className="accent-indigo-600" />{v ? "Yes" : "No"}</label>)}</fieldset>
          <Label t="Reason for Change *"><input value={rev.reason} onChange={(e) => setRev({ ...rev, reason: e.target.value })} placeholder="Reduced leather consumption" className={inp} /></Label>
        </Modal>
      )}
    </div>
  );
}

/* =====================  Page shell  ===================== */
export default function BomPage() {
  const [boms, setBoms] = useState<Bom[]>(SEED);
  const [view, setView] = useState<View>({ name: "list" });
  const [toast, setToast] = useState("");
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const upsert = (b: Bom) => setBoms((p) => (p.some((x) => keyOf(x) === keyOf(b)) ? p.map((x) => (keyOf(x) === keyOf(b) ? b : x)) : [...p, b]));
  const open = (b: Bom, o?: { tab?: string; revModal?: boolean }) => setView({ name: "detail", code: b.code, rev: b.rev, ...o });
  const dup = (b: Bom) => {
    const nc = `BOM-${String(Math.max(0, ...boms.map((x) => +x.code.slice(4))) + 1).padStart(3, "0")}`;
    upsert({ ...b, code: nc, rev: 1, status: "Draft", updated: today(), audit: [A(today(), USER, "Created BOM", `Duplicated from ${b.code} Rev ${b.rev}`)], comps: b.comps.map((c) => ({ ...c, id: nid() })) }); notify(`Duplicated as ${nc}`);
  };

  const cur = view.name === "detail" ? boms.find((x) => x.code === view.code && x.rev === view.rev) : undefined;
  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      {view.name === "list" && (
        <ListView boms={boms} onCreate={() => setView({ name: "create" })} onOpen={open} onEdit={(b) => setView({ name: "create", edit: b })} onDup={dup}
          onDelete={(b) => { setBoms((p) => p.filter((x) => keyOf(x) !== keyOf(b))); notify("Draft deleted"); }}
          onSupersede={(b) => { upsert({ ...b, status: "Superseded", updated: today(), audit: [A(today(), USER, "Superseded", `Rev ${b.rev} superseded`), ...b.audit] }); notify("BOM superseded"); }} />
      )}
      {view.name === "create" && <CreateView key={view.edit ? keyOf(view.edit) : "new"} initial={view.edit} boms={boms} onSave={upsert} onExit={() => setView({ name: "list" })} onOpen={open} />}
      {view.name === "detail" && cur && <DetailView key={`${keyOf(cur)}-${view.tab ?? ""}-${view.revModal ? 1 : 0}`} b={cur} all={boms} startTab={view.tab} startRevModal={view.revModal} onBack={() => setView({ name: "list" })} upsert={upsert} onOpen={open} notify={notify} />}
      {toast && <div role="status" className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"><CheckCircle2 size={16} className="text-emerald-400" />{toast}</div>}
    </div>
  );
}