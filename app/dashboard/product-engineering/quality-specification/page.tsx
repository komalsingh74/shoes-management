"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, ExternalLink, Info, Plus, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

/* ---------- Sample data (apni API se replace karo) ---------- */
const SPEC_HREF = "/dashboard/product-engineering/product-specification";
const PRODUCTS = [
  { code: "MC-2401", name: "Men's Casual Shoe", customer: "ABC Footwear", colors: ["Black", "Brown"], sizes: [6, 10] },
  { code: "XBED-001", name: "XBED Air Runner", customer: "Star Shoes Pvt Ltd", colors: ["Black", "Grey", "Blue"], sizes: [6, 11] },
  { code: "FD-1102", name: "Classic Oxford", customer: "ABC Footwear", colors: ["Black", "Brown"], sizes: [6, 10] },
  { code: "SF-7010", name: "SteelGuard S3", customer: "Star Shoes Pvt Ltd", colors: ["Black"], sizes: [6, 11] },
];
const HEX: Record<string, string> = { Black: "#111827", Brown: "#7c4a21", Grey: "#6b7280", Blue: "#2563eb" };

type Cls = "Critical" | "Major" | "Minor";
type Point = { id: number; stage: string; check: string; method: string; spec: string; tol: string; cls: Cls; sample: string };
type Test = { id: number; test: string; std: string; req: string; qty: string; freq: string; must: boolean };
type Defect = { id: number; name: string; cls: Cls; desc: string };

let _id = 100;
const nid = () => ++_id;
const pt = (stage: string, check: string, method: string, spec: string, tol: string, cls: Cls, sample: string): Point => ({ id: nid(), stage, check, method, spec, tol, cls, sample });

const STAGES = ["IQC", "IPQC", "FQC"];
const STAGE_NAME: Record<string, string> = { IQC: "Incoming material", IPQC: "In-process", FQC: "Final inspection" };
const METHODS = ["Visual", "Measure", "Gauge", "Manual pull", "Lab test"];
const CLASSES: Cls[] = ["Critical", "Major", "Minor"];
const CLS_STYLE: Record<Cls, string> = { Critical: "bg-red-50 text-red-600", Major: "bg-amber-50 text-amber-700", Minor: "bg-slate-100 text-slate-600" };

const POINTS: Point[] = [
  pt("IQC", "Upper leather thickness", "Gauge", "1.4 mm", "±0.2 mm", "Major", "5 pcs / lot"),
  pt("IQC", "Sole hardness", "Gauge", "60 Shore A", "±5", "Major", "5 pcs / lot"),
  pt("IQC", "Color match with approved swatch", "Visual", "Matches swatch", "ΔE ≤ 1.5", "Major", "Every lot"),
  pt("IPQC", "Stitch density", "Measure", "8 SPI", "±1", "Major", "3 pairs / hour"),
  pt("IPQC", "Glue / cementing coverage", "Visual", "Full coverage, no gaps", "—", "Major", "3 pairs / hour"),
  pt("IPQC", "Last symmetry and toe shape", "Visual", "As per master sample", "—", "Minor", "3 pairs / hour"),
  pt("FQC", "Upper–sole bonding (hand pull)", "Manual pull", "No separation", "None", "Critical", "As per AQL"),
  pt("FQC", "Pair match (size, color, shape)", "Visual", "Left and right identical", "—", "Major", "As per AQL"),
  pt("FQC", "Overall finish (scuffs, glue marks)", "Visual", "Clean", "—", "Minor", "As per AQL"),
];
const tst = (test: string, std: string, req: string, qty: string, freq: string, must: boolean): Test => ({ id: nid(), test, std, req, qty, freq, must });
const TESTS: Test[] = [
  tst("Upper–sole bond strength", "ISO 17708", "≥ 4.0 N/mm", "3 pairs", "Per lot", true),
  tst("Outsole flex resistance", "ISO 17707", "No cut growth > 4 mm after 30,000 flexes", "3 pairs", "Per season", true),
  tst("Outsole abrasion resistance", "ISO 20871", "Volume loss ≤ 250 mm³", "2 pcs", "Per season", false),
  tst("Upper tear strength", "ISO 17696", "Per customer standard", "3 pcs", "Per lot", false),
  tst("Color fastness to rubbing", "ISO 11640", "Grade ≥ 4 (dry)", "2 pcs", "Per lot", true),
  tst("Slip resistance", "ISO 13287", "Per customer standard", "2 pairs", "Per season", false),
];
const dft = (name: string, cls: Cls, desc: string): Defect => ({ id: nid(), name, cls, desc });
const DEFECTS: Defect[] = [
  dft("Needle / sharp object in shoe", "Critical", "Any metal or sharp object inside the shoe"),
  dft("Sole separation", "Critical", "Sole lifts from upper at any point"),
  dft("Skipped or loose stitch", "Major", "Visible gap or loose thread on stitch line"),
  dft("Color shading", "Major", "Visible difference between left and right or panels"),
  dft("Pair mismatch", "Major", "Size, shape or color differs within the pair"),
  dft("Wrong size marking", "Major", "Label or insole size does not match actual size"),
  dft("Glue marks", "Minor", "Visible adhesive on upper or sole wall"),
  dft("Wrinkle / crease", "Minor", "Surface wrinkle beyond the approved sample"),
  dft("Scuff / dirt mark", "Minor", "Surface mark that does not clean off easily"),
];

/* AQL (ISO 2859-1, General II) sample size by lot size. Ac/Re sirf 2.5 aur 4.0 ke liye; baki ke liye standard table dekho. */
const LOT_SIZE: [number, number][] = [[8, 2], [15, 3], [25, 5], [50, 8], [90, 13], [150, 20], [280, 32], [500, 50], [1200, 80], [3200, 125], [10000, 200], [35000, 315], [150000, 500], [500000, 800], [Infinity, 1250]];
const ACRE: Record<string, Record<number, [number, number]>> = {
  "2.5": { 20: [1, 2], 32: [2, 3], 50: [3, 4], 80: [5, 6], 125: [7, 8], 200: [10, 11], 315: [14, 15], 500: [21, 22] },
  "4.0": { 20: [2, 3], 32: [3, 4], 50: [5, 6], 80: [7, 8], 125: [10, 11], 200: [14, 15], 315: [21, 22] },
};
const ACRE_CAP: Record<string, number> = { "2.5": 500, "4.0": 315 };
const aql = (lot: number, level: string) => {
  const n = LOT_SIZE.find(([max]) => lot <= max)![1];
  const size = Math.min(lot, ACRE_CAP[level] && n > ACRE_CAP[level] ? ACRE_CAP[level] : n);
  return { size, acre: ACRE[level]?.[size] };
};

/* ---------- UI helpers ---------- */
const inp = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200";
const cell = "h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200";
const btnDark = "inline-flex h-10 items-center gap-2 rounded-lg bg-[#0b0b14] px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
const btnLight = "inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
const card = "rounded-xl border border-slate-200 bg-white";
const TABS = ["Basic Information", "Inspection Plan", "Lab Tests", "Defects & AQL"];

function Field({ label, required, link, error, className = "", children }: { label: string; required?: boolean; link?: { label: string; href: string }; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-slate-700">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</span>
        {link && (
          <Link href={link.href} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline">
            <ExternalLink size={11} /> {link.label}
          </Link>
        )}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Sel({ value, onChange, options, cls = inp }: { value: string; onChange: (v: string) => void; options: string[]; cls?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

const DelBtn = ({ onClick }: { onClick: () => void }) => (
  <button type="button" aria-label="Remove row" onClick={onClick} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 outline-none hover:bg-slate-100 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-indigo-400">
    <Trash2 size={16} />
  </button>
);

function upd<T extends { id: number }>(set: React.Dispatch<React.SetStateAction<T[]>>, id: number, patch: Partial<T>) {
  set((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
}

/* ---------- Page ---------- */
export default function QualitySpecificationPage() {
  const [tab, setTab] = useState(0);
  const [b, setB] = useState({ product: "", name: "", level: "General II", effective: "", remarks: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [points, setPoints] = useState<Point[]>(POINTS);
  const [stage, setStage] = useState("All");
  const [tests, setTests] = useState<Test[]>(TESTS);
  const [defects, setDefects] = useState<Defect[]>(DEFECTS);
  const [aqlMajor, setAqlMajor] = useState("2.5");
  const [aqlMinor, setAqlMinor] = useState("4.0");
  const [lot, setLot] = useState("1000");
  const [toast, setToast] = useState("");

  const prod = PRODUCTS.find((p) => p.code === b.product);
  const set = (k: string) => (v: string) => setB((p) => ({ ...p, [k]: v }));
  const code = prod ? `QS-${prod.code}` : "QS-—";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!b.product) e.product = "Product select karo";
    if (!b.name.trim()) e.name = "Required";
    if (!b.effective) e.effective = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const goTo = (i: number) => { if (i > 0 && !validate()) return setTab(0); setTab(i); };
  const save = (draft: boolean) => {
    if (!validate()) return setTab(0);
    // TODO: yahan apni API call lagao (b, points, tests, defects, aql)
    setToast(draft ? "Draft saved" : "Specification saved");
    setTimeout(() => setToast(""), 2500);
  };

  const done = [!!(b.product && b.name && b.effective), points.length > 0, tests.length > 0, defects.length > 0];
  const count = (c: Cls) => points.filter((x) => x.cls === c).length;
  const lotN = Math.max(0, parseInt(lot) || 0);
  const major = lotN ? aql(lotN, aqlMajor) : null;
  const minor = lotN ? aql(lotN, aqlMinor) : null;
  const shownPoints = points.filter((x) => stage === "All" || x.stage === stage);

  const AqlRow = ({ label, level, res }: { label: string; level: string; res: ReturnType<typeof aql> | null }) => (
    <tr className="border-t border-slate-100">
      <td className="px-3 py-2 font-medium text-slate-900">{label}</td>
      <td className="px-3 py-2">{level}</td>
      <td className="px-3 py-2 tabular-nums">{res ? res.size : "—"}</td>
      <td className="px-3 py-2 tabular-nums">{res?.acre ? res.acre[0] : "—"}</td>
      <td className="px-3 py-2 tabular-nums">{res?.acre ? res.acre[1] : "—"}</td>
    </tr>
  );

  return (
    <div className="mx-auto w-full ">
      <Card className="py-2 px-3 mb-2">
      <div className="mb-0">
        <p className="text-sm text-slate-500">Product Engineering</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quality Specification</h1>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Draft</span>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">Rev 01</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">Product ke liye inspection plan, lab tests aur AQL define karo. Basic info save karke baaki baad me bhi bhar sakte ho.</p>
      </div>
</Card>
      <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          {/* Tabs */}
          <div className={`${card} mb-2 flex overflow-x-auto p-1.5`} role="tablist">
            {TABS.map((t, i) => (
              <button key={t} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
                className={`flex min-w-fit flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${tab === i ? "bg-[#0b0b14] text-white font-semibold" : "text-slate-700 hover:bg-slate-100"}`}>
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold ${tab === i ? "bg-indigo-400 text-[#0b0b14]" : done[i] ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                  {done[i] && tab !== i ? <Check size={12} /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{t}</span>
              </button>
            ))}
          </div>

          {/* TAB 1 */}
          {tab === 0 && (
            <section className={`${card} p-5`}>
              <h2 className="mb-2 text-base font-semibold text-slate-900">Basic Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Specification Code" required>
                  <div className="relative">
                    <input value={code} readOnly className={`${inp} bg-slate-50 pr-16 font-medium`} />
                    <span className="absolute right-2 top-2 rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">Auto</span>
                  </div>
                </Field>
                <Field label="Product / Style" required link={{ label: "Product Specification", href: SPEC_HREF }} error={errors.product}>
                  <select value={b.product} onChange={(e) => set("product")(e.target.value)} className={`${inp} ${errors.product ? "border-red-400" : ""}`}>
                    <option value="">Select product</option>
                    {PRODUCTS.map((p) => <option key={p.code} value={p.code}>{p.code} · {p.name}</option>)}
                  </select>
                </Field>
                <Field label="Specification Name" required error={errors.name}>
                  <input value={b.name} onChange={(e) => set("name")(e.target.value)} placeholder="e.g. Final inspection standard" className={`${inp} ${errors.name ? "border-red-400" : ""}`} />
                </Field>
                <Field label="Inspection Level">
                  <Sel value={b.level} onChange={set("level")} options={["General I", "General II", "General III", "Special S-3", "Special S-4"]} />
                </Field>
                <Field label="Effective From" required error={errors.effective}>
                  <input type="date" value={b.effective} onChange={(e) => set("effective")(e.target.value)} className={`${inp} ${errors.effective ? "border-red-400" : ""}`} />
                </Field>
                <Field label="Status" required>
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> Draft <span className="ml-auto text-xs text-slate-500">System</span>
                  </div>
                </Field>
                <Field label="Remarks" className="sm:col-span-2">
                  <textarea rows={3} value={b.remarks} onChange={(e) => set("remarks")(e.target.value)} placeholder="Customer requirement ya special instruction" className={`${inp} h-auto py-2`} />
                </Field>
              </div>

              {prod && (
                <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg bg-slate-50 p-4 text-sm">
                  <div><p className="text-xs text-slate-500">Style</p><p className="font-semibold text-slate-900">{prod.name}</p></div>
                  <div><p className="text-xs text-slate-500">Customer</p><p className="font-medium text-slate-900">{prod.customer}</p></div>
                  <div>
                    <p className="text-xs text-slate-500">Colors</p>
                    <p className="flex items-center gap-2 font-medium text-slate-900">
                      {prod.colors.map((c) => <span key={c} className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full" style={{ background: HEX[c] }} />{c}</span>)}
                    </p>
                  </div>
                  <div><p className="text-xs text-slate-500">Sizes</p><p className="font-medium text-slate-900">UK {prod.sizes[0]}–{prod.sizes[1]}</p></div>
                </div>
              )}
            </section>
          )}

          {/* TAB 2 */}
          {tab === 1 && (
            <section className={`${card} p-5`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Inspection Plan</h2>
                <button type="button" className={`${btnLight} !h-9`} onClick={() => setPoints((r) => [...r, pt(stage === "All" ? "IQC" : stage, "", "Visual", "", "—", "Minor", "")])}>
                  <Plus size={16} /> Add check point
                </button>
              </div>
              <div className="mb-3 inline-flex flex-wrap rounded-lg border border-slate-300 p-0.5" role="group" aria-label="Stage">
                {["All", ...STAGES].map((s) => (
                  <button key={s} type="button" aria-pressed={stage === s} onClick={() => setStage(s)}
                    className={`h-8 rounded-md px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${stage === s ? "bg-[#0b0b14] text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                    {s === "All" ? "All stages" : `${s} · ${STAGE_NAME[s]}`}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                    <tr>{["Stage", "Check point", "Method", "Specification", "Tolerance", "Class", "Sample", ""].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shownPoints.map((x) => (
                      <tr key={x.id}>
                        <td className="w-20 px-2 py-1.5"><Sel cls={cell} value={x.stage} onChange={(v) => upd(setPoints, x.id, { stage: v })} options={STAGES} /></td>
                        <td className="min-w-[220px] px-2 py-1.5"><input className={cell} value={x.check} onChange={(e) => upd(setPoints, x.id, { check: e.target.value })} placeholder="Check point" /></td>
                        <td className="w-32 px-2 py-1.5"><Sel cls={cell} value={x.method} onChange={(v) => upd(setPoints, x.id, { method: v })} options={METHODS} /></td>
                        <td className="min-w-[160px] px-2 py-1.5"><input className={cell} value={x.spec} onChange={(e) => upd(setPoints, x.id, { spec: e.target.value })} /></td>
                        <td className="w-28 px-2 py-1.5"><input className={cell} value={x.tol} onChange={(e) => upd(setPoints, x.id, { tol: e.target.value })} /></td>
                        <td className="w-28 px-2 py-1.5">
                          <select value={x.cls} onChange={(e) => upd(setPoints, x.id, { cls: e.target.value as Cls })} className={`${cell} font-semibold ${CLS_STYLE[x.cls]}`}>
                            {CLASSES.map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="w-32 px-2 py-1.5"><input className={cell} value={x.sample} onChange={(e) => upd(setPoints, x.id, { sample: e.target.value })} /></td>
                        <td className="w-10 px-2 py-1.5"><DelBtn onClick={() => setPoints((r) => r.filter((y) => y.id !== x.id))} /></td>
                      </tr>
                    ))}
                    {shownPoints.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-500">Is stage me abhi koi check point nahi hai.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 3 */}
          {tab === 2 && (
            <section className={`${card} p-5`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Lab Tests</h2>
                <button type="button" className={`${btnLight} !h-9`} onClick={() => setTests((r) => [...r, tst("", "", "", "", "Per lot", false)])}>
                  <Plus size={16} /> Add test
                </button>
              </div>
              <p className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                <Info size={14} className="mt-0.5 shrink-0" /> Standards aur requirement values sample hain. Apne customer ya lab ke standard ke hisaab se edit karo.
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                    <tr>{["Test", "Standard", "Requirement", "Sample", "Frequency", "Mandatory", ""].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tests.map((x) => (
                      <tr key={x.id}>
                        <td className="min-w-[200px] px-2 py-1.5"><input className={cell} value={x.test} onChange={(e) => upd(setTests, x.id, { test: e.target.value })} placeholder="Test name" /></td>
                        <td className="w-32 px-2 py-1.5"><input className={cell} value={x.std} onChange={(e) => upd(setTests, x.id, { std: e.target.value })} /></td>
                        <td className="min-w-[220px] px-2 py-1.5"><input className={cell} value={x.req} onChange={(e) => upd(setTests, x.id, { req: e.target.value })} /></td>
                        <td className="w-24 px-2 py-1.5"><input className={cell} value={x.qty} onChange={(e) => upd(setTests, x.id, { qty: e.target.value })} /></td>
                        <td className="w-32 px-2 py-1.5"><Sel cls={cell} value={x.freq} onChange={(v) => upd(setTests, x.id, { freq: v })} options={["Per lot", "Per order", "Per season", "Per article"]} /></td>
                        <td className="w-24 px-2 py-1.5 text-center">
                          <input type="checkbox" aria-label="Mandatory" className="h-4 w-4 accent-indigo-600" checked={x.must} onChange={(e) => upd(setTests, x.id, { must: e.target.checked })} />
                        </td>
                        <td className="w-10 px-2 py-1.5"><DelBtn onClick={() => setTests((r) => r.filter((y) => y.id !== x.id))} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4 */}
          {tab === 3 && (
            <div className="space-y-3">
              <section className={`${card} p-5`}>
                <h2 className="mb-4 text-base font-semibold text-slate-900">AQL & Sampling</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Critical AQL"><input value="0 (zero tolerance)" readOnly className={`${inp} bg-slate-50`} /></Field>
                  <Field label="Major AQL"><Sel value={aqlMajor} onChange={setAqlMajor} options={["1.5", "2.5", "4.0", "6.5"]} /></Field>
                  <Field label="Minor AQL"><Sel value={aqlMinor} onChange={setAqlMinor} options={["1.5", "2.5", "4.0", "6.5"]} /></Field>
                  <Field label="Lot size (pairs)" className="sm:col-span-1">
                    <input inputMode="numeric" value={lot} onChange={(e) => setLot(e.target.value.replace(/\D/g, ""))} className={inp} />
                  </Field>
                </div>
                <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                      <tr>{["Defect class", "AQL", "Sample size", "Accept (Ac)", "Reject (Re)"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      <tr><td className="px-3 py-2 font-medium text-slate-900">Critical</td><td className="px-3 py-2">0</td><td className="px-3 py-2 tabular-nums">{major ? major.size : "—"}</td><td className="px-3 py-2">0</td><td className="px-3 py-2">1</td></tr>
                      <AqlRow label="Major" level={aqlMajor} res={major} />
                      <AqlRow label="Minor" level={aqlMinor} res={minor} />
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 flex items-start gap-2 text-xs text-slate-500">
                  <Info size={14} className="mt-0.5 shrink-0" /> Sample size ISO 2859-1 (General II) ke hisaab se hai. Ac/Re sirf AQL 2.5 aur 4.0 (20+ sample) ke liye dikhte hain. Baaki ke liye standard table dekho.
                </p>
              </section>

              <section className={`${card} p-5`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-slate-900">Defect Library</h2>
                  <button type="button" className={`${btnLight} !h-9`} onClick={() => setDefects((r) => [...r, dft("", "Minor", "")])}>
                    <Plus size={16} /> Add defect
                  </button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                      <tr>{["Defect", "Class", "Description", ""].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {defects.map((x) => (
                        <tr key={x.id}>
                          <td className="min-w-[200px] px-2 py-1.5"><input className={cell} value={x.name} onChange={(e) => upd(setDefects, x.id, { name: e.target.value })} placeholder="Defect name" /></td>
                          <td className="w-28 px-2 py-1.5">
                            <select value={x.cls} onChange={(e) => upd(setDefects, x.id, { cls: e.target.value as Cls })} className={`${cell} font-semibold ${CLS_STYLE[x.cls]}`}>
                              {CLASSES.map((c) => <option key={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="min-w-[280px] px-2 py-1.5"><input className={cell} value={x.desc} onChange={(e) => upd(setDefects, x.id, { desc: e.target.value })} /></td>
                          <td className="w-10 px-2 py-1.5"><DelBtn onClick={() => setDefects((r) => r.filter((y) => y.id !== x.id))} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <Link href="/dashboard" className={btnLight}>Cancel</Link>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => save(true)} className={btnLight}><Save size={16} /> Save draft</button>
              {tab > 0 && <button type="button" onClick={() => setTab(tab - 1)} className={btnLight}><ChevronLeft size={16} /> Back</button>}
              {tab < TABS.length - 1
                ? <button type="button" onClick={() => goTo(tab + 1)} className={btnDark}>Next <ChevronRight size={16} /></button>
                : <button type="button" onClick={() => save(false)} className={btnDark}><Check size={16} /> Save specification</button>}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="hidden xl:block">
          <div className={`${card} sticky top-6 p-4`}>
            <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
            <dl className="mt-2 space-y-2.5 text-sm">
              {[["Spec code", code], ["Product", prod?.name ?? "—"], ["Customer", prod?.customer ?? "—"], ["Check points", points.length], ["Lab tests", tests.length], ["Defects", defects.length]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="truncate text-right font-medium text-slate-900">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-3 flex gap-1.5 border-t border-slate-200 pt-3">
              {CLASSES.map((c) => <span key={c} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${CLS_STYLE[c]}`}>{c} {count(c)}</span>)}
            </div>
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="mb-2 text-xs font-semibold text-slate-600">Tabs completed</p>
              <ul className="space-y-1.5 text-sm">
                {TABS.map((t, i) => (
                  <li key={t} className="flex items-center gap-2 text-slate-700">
                    <span className={`grid h-4 w-4 place-items-center rounded-full ${done[i] ? "bg-indigo-600 text-white" : "bg-slate-200"}`}>{done[i] && <Check size={10} />}</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {toast && <div role="status" className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">{toast}</div>}
    </div>
  );
}