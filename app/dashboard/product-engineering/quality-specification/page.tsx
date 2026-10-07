"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, ExternalLink, ImagePlus, Info, Plus, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ---------- Masters (abhi sample data; apni API se replace karo) ---------- */
type Master = { label: string; href: string };
const M: Record<string, Master> = {
  customer: { label: "Customer Master", href: "/dashboard/masters/custumer" },
  color: { label: "Color Master", href: "/dashboard/masters/color" },
  size: { label: "Size Master", href: "/dashboard/masters/size" },
  material: { label: "Material Master", href: "/dashboard/masters/material" },
  season: { label: "Season Master", href: "/dashboard/masters/season-collection" },
};
const CUSTOMERS = ["ABC Footwear", "Star Shoes Pvt Ltd", "Urban Steps"];
const COLORS = [
  { name: "Black", hex: "#111827" },
  { name: "Brown", hex: "#7c4a21" },
  { name: "Tan", hex: "#c9a27a" },
  { name: "White", hex: "#f8fafc" },
  { name: "Navy", hex: "#1e3a8a" },
];
const SIZES = [
  { uk: 6, us: 7, eu: 40, cm: 25 },
  { uk: 7, us: 8, eu: 41, cm: 26 },
  { uk: 8, us: 9, eu: 42, cm: 27 },
  { uk: 9, us: 10, eu: 43, cm: 28 },
  { uk: 10, us: 11, eu: 44, cm: 29 },
];
const MATERIALS = ["Leather", "Synthetic Leather", "Mesh", "Canvas", "Textile Lining", "EVA", "PU", "TPR", "Rubber"];
const LISTS = {
  type: ["Finished Shoe", "Sandal", "Boot", "Slipper"],
  category: ["Casual", "Formal", "Sports", "Safety"],
  sub: ["Sneaker", "Loafer", "Derby", "Moccasin"],
  brand: ["In-house", "ABC Footwear", "Urban Steps"],
  season: ["SS-26", "AW-26", "SS-27"],
  gender: ["Men", "Women", "Unisex", "Kids"],
};
const TECH_SELECTS: { key: string; label: string; options: string[]; master?: Master }[] = [
  { key: "construction", label: "Construction", options: ["Cemented", "Stitched", "Injection Moulded", "Vulcanized"] },
  { key: "upper", label: "Upper Material", options: MATERIALS, master: M.material },
  { key: "lining", label: "Lining Material", options: MATERIALS, master: M.material },
  { key: "sole", label: "Sole Material", options: MATERIALS, master: M.material },
  { key: "soleType", label: "Sole Type", options: ["Flat", "Wedge", "Cupsole", "Platform"] },
  { key: "toe", label: "Toe Shape", options: ["Round", "Square", "Pointed", "Almond"] },
  { key: "heel", label: "Heel Type", options: ["Flat", "Block", "Wedge", "Stiletto"] },
  { key: "closure", label: "Closure", options: ["Lace-up", "Slip-on", "Velcro", "Buckle", "Zipper"] },
  { key: "safety", label: "Safety Standard", options: ["None", "ISO 20345 S1", "ISO 20345 S1P", "ISO 20345 S3"] },
];

/* ---------- Small UI helpers ---------- */
const inp =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition-colors " +
  "placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200";
const btnDark =
  "inline-flex h-10 items-center gap-2 rounded-lg bg-[#0b0b14] px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
const btnLight =
  "inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
const card = "rounded-xl border border-slate-200 bg-white";

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function Field({
  label, required, master, error, className = "", children,
}: { label: string; required?: boolean; master?: Master; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
        {master && (
          <Link href={master.href} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline">
            <ExternalLink size={11} />
            {master.label}
          </Link>
        )}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Select({ value, onChange, options, invalid }: { value: string; onChange: (v: string) => void; options: string[]; invalid?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inp} ${invalid ? "border-red-400" : ""}`}>
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

const Swatch = ({ hex }: { hex: string }) => (
  <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-slate-300" style={{ background: hex }} />
);

type MatRow = { id: number; component: string; material: string; applies: string; remarks: string };
const TABS = ["Basic Information", "Variant Definition", "Technical Specification", "Material Definition"];

export default function ProductSpecificationPage() {
  const [tab, setTab] = useState(0);
  const [basic, setBasic] = useState<Record<string, string>>({
    code: "MC-2401", customer: "", name: "", type: "", category: "", sub: "", brand: "", season: "", gender: "", description: "",
  });
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);
  const [off, setOff] = useState<string[]>([]); // inactive SKUs
  const [tech, setTech] = useState<Record<string, string>>({ water: "No" });
  const [mats, setMats] = useState<MatRow[]>([
    { id: 1, component: "Upper", material: "", applies: "All colors", remarks: "" },
    { id: 2, component: "Lining", material: "", applies: "All colors", remarks: "" },
    { id: 3, component: "Sole", material: "", applies: "All colors", remarks: "" },
  ]);
  const [toast, setToast] = useState("");

  const setB = (k: string) => (v: string) => setBasic((p) => ({ ...p, [k]: v }));
  const setT = (k: string) => (v: string) => setTech((p) => ({ ...p, [k]: v }));

  /* Variants auto-generate: selected colors x selected sizes */
  const pickedColors = COLORS.filter((c) => colors.includes(c.name));
  const pickedSizes = SIZES.filter((s) => sizes.includes(s.uk));
  const variants = useMemo(
    () => pickedColors.flatMap((c) => pickedSizes.map((s) => ({ sku: `${basic.code}/${c.name}/${s.uk}`, color: c, ...s }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors, sizes, basic.code]
  );
  const activeCount = variants.filter((v) => !off.includes(v.sku)).length;

  const validate = () => {
    const e: Record<string, string> = {};
    ["name", "type", "category", "gender"].forEach((k) => { if (!basic[k]) e[k] = "Required"; });
    if (!image) e.image = "Product image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goTo = (i: number) => {
    if (i > 0 && !validate()) return setTab(0); // Basic info complete hone ke baad hi aage
    setTab(i);
  };

  const save = (draft: boolean) => {
    if (!validate()) return setTab(0);
    // TODO: yahan apni API call lagao (basic, image, colors, sizes, variants, tech, mats)
    setToast(draft ? "Draft saved" : "Product saved");
    setTimeout(() => setToast(""), 2500);
  };

  const done = [
    !!(basic.name && basic.type && basic.category && basic.gender && image),
    variants.length > 0,
    TECH_SELECTS.some((f) => tech[f.key]),
    mats.some((m) => m.material),
  ];

  const updMat = (id: number, k: keyof MatRow, v: string) => setMats((r) => r.map((m) => (m.id === id ? { ...m, [k]: v } : m)));

  return (
    <div className="mx-auto w-full p-0">
      {/* Header */}
<Card className="p-4 mb-2">
  <header className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <p className="mb-1 text-sm font-semibold text-indigo-600">
        Product Engineering
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Product Specification
        </h1>

        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          Draft
        </span>
      </div>

      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Basic info save karke product banao. Variants, BOM aur Routing baad
        me bhi add ho sakte hain.
      </p>
    </div>

    <Button
    //   onClick={handleSave}
      className="group relative h-11 overflow-hidden rounded-xl bg-[#0b0b14] px-5 font-semibold text-white shadow-lg shadow-indigo-900/20 ring-1 ring-white/10 hover:bg-[#12121f]"
    >
      <span className="pointer-events-none absolute -left-6 -top-8 h-20 w-20 rounded-full bg-indigo-600/50 blur-2xl transition-opacity group-hover:opacity-80" />

      <span className="relative flex items-center">
        <Save className="mr-2 h-4 w-4 text-indigo-300" />
        Save Product
      </span>
    </Button>
  </header>
</Card>

      <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          {/* Tabs */}
          <div className={`${card} mb-4 flex overflow-x-auto p-1.5`} role="tablist">
            {TABS.map((t, i) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === i}
                onClick={() => setTab(i)}
                className={`flex min-w-fit flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  tab === i ? "bg-[#0b0b14] text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold ${
                    tab === i ? "bg-indigo-400 text-[#0b0b14]" : done[i] ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {done[i] && tab !== i ? <Check size={12} /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{t}</span>
              </button>
            ))}
          </div>

          {/* TAB 1 */}
          {tab === 0 && (
            <section className={`${card} p-5`}>
              <h2 className="mb-4 text-base font-semibold text-slate-900">Basic Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Product Code" required>
                  <div className="relative">
                    <input value={basic.code} readOnly className={`${inp} bg-slate-50 pr-16 font-medium`} />
                    <span className="absolute right-2 top-2 rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">Auto</span>
                  </div>
                </Field>
                <Field label="Customer" master={M.customer}>
                  <Select value={basic.customer} onChange={setB("customer")} options={CUSTOMERS} />
                </Field>
                <Field label="Product Name" required error={errors.name}>
                  <input value={basic.name} onChange={(e) => setB("name")(e.target.value)} placeholder="e.g. Men's Casual Shoe" className={`${inp} ${errors.name ? "border-red-400" : ""}`} />
                </Field>
                <Field label="Product Type" required error={errors.type}>
                  <Select value={basic.type} onChange={setB("type")} options={LISTS.type} invalid={!!errors.type} />
                </Field>
                <Field label="Product Category" required error={errors.category}>
                  <Select value={basic.category} onChange={setB("category")} options={LISTS.category} invalid={!!errors.category} />
                </Field>
                <Field label="Sub Category">
                  <Select value={basic.sub} onChange={setB("sub")} options={LISTS.sub} />
                </Field>
                <Field label="Brand">
                  <Select value={basic.brand} onChange={setB("brand")} options={LISTS.brand} />
                </Field>
                <Field label="Season" master={M.season}>
                  <Select value={basic.season} onChange={setB("season")} options={LISTS.season} />
                </Field>
                <Field label="Gender" required error={errors.gender}>
                  <Select value={basic.gender} onChange={setB("gender")} options={LISTS.gender} invalid={!!errors.gender} />
                </Field>
                <Field label="Status" required>
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> Draft
                    <span className="ml-auto text-xs text-slate-500">System</span>
                  </div>
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <textarea rows={3} value={basic.description} onChange={(e) => setB("description")(e.target.value)} placeholder="Short product description" className={`${inp} h-auto py-2`} />
                </Field>
                <Field label="Product Image" required error={errors.image} className="sm:col-span-2">
                  <label
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border border-dashed p-4 transition-colors hover:bg-slate-50 ${
                      errors.image ? "border-red-400" : "border-slate-300"
                    }`}
                  >
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="Product preview" className="h-20 w-20 rounded-lg object-cover ring-1 ring-slate-200" />
                    ) : (
                      <span className="grid h-20 w-20 place-items-center rounded-lg bg-slate-100 text-slate-500"><ImagePlus size={24} /></span>
                    )}
                    <span className="text-sm">
                      <span className="block font-medium text-slate-800">{image ? "Change image" : "Upload product image"}</span>
                      <span className="text-xs text-slate-500">PNG or JPG, up to 5 MB</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setImage(URL.createObjectURL(f)); setErrors((p) => ({ ...p, image: "" })); }
                      }}
                    />
                  </label>
                </Field>
              </div>
            </section>
          )}

          {/* TAB 2 */}
          {tab === 1 && (
            <div className="space-y-4">
              <section className={`${card} p-5`}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Color</h2>
                  <Link href={M.color.href} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline">
                    <ExternalLink size={11} /> {M.color.label}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => {
                    const on = colors.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setColors((p) => toggle(p, c.name))}
                        className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                          on ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-300 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <Swatch hex={c.hex} /> {c.name} {on && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={`${card} p-5`}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Size</h2>
                  <Link href={M.size.href} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline">
                    <ExternalLink size={11} /> {M.size.label}
                  </Link>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                      <tr>
                        <th className="w-12 px-3 py-2">
                          <input
                            type="checkbox"
                            aria-label="Select all sizes"
                            className="h-4 w-4 accent-indigo-600"
                            checked={sizes.length === SIZES.length}
                            onChange={(e) => setSizes(e.target.checked ? SIZES.map((s) => s.uk) : [])}
                          />
                        </th>
                        {["UK", "US", "EU", "CM"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {SIZES.map((s) => (
                        <tr key={s.uk} className={sizes.includes(s.uk) ? "bg-indigo-50/60" : "hover:bg-slate-50"}>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              aria-label={`UK ${s.uk}`}
                              className="h-4 w-4 accent-indigo-600"
                              checked={sizes.includes(s.uk)}
                              onChange={() => setSizes((p) => toggle(p, s.uk))}
                            />
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-900">{s.uk}</td>
                          <td className="px-3 py-2 text-slate-700">{s.us}</td>
                          <td className="px-3 py-2 text-slate-700">{s.eu}</td>
                          <td className="px-3 py-2 text-slate-700">{s.cm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={`${card} p-5`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-900">Generated Variants</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {pickedColors.length} colors × {pickedSizes.length} sizes = {variants.length} variants
                  </span>
                </div>
                {variants.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">
                    <Info size={16} className="shrink-0 text-slate-500" />
                    Upar se kam se kam ek color aur ek size select karo, variants apne aap ban jayenge.
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-50 text-left text-xs font-semibold text-slate-600">
                        <tr>
                          <th className="px-3 py-2">SKU</th>
                          <th className="px-3 py-2">Color</th>
                          {["UK", "US", "EU", "CM"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}
                          <th className="px-3 py-2 text-center">Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pickedColors.map((c) => (
                          <ColorGroup key={c.name} color={c} rows={variants.filter((v) => v.color.name === c.name)} off={off} setOff={setOff} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 3 */}
          {tab === 2 && (
            <section className={`${card} p-5`}>
              <h2 className="mb-4 text-base font-semibold text-slate-900">Technical Specification</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {TECH_SELECTS.map((f) => (
                  <Field key={f.key} label={f.label} master={f.master}>
                    <Select value={tech[f.key] ?? ""} onChange={setT(f.key)} options={f.options} />
                  </Field>
                ))}
                <Field label="Water Resistant">
                  <div className="inline-flex rounded-lg border border-slate-300 p-0.5">
                    {["Yes", "No"].map((o) => (
                      <button
                        key={o}
                        type="button"
                        aria-pressed={tech.water === o}
                        onClick={() => setT("water")(o)}
                        className={`h-8 w-20 rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                          tech.water === o ? "bg-[#0b0b14] text-white" : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </section>
          )}

          {/* TAB 4 */}
          {tab === 3 && (
            <section className={`${card} p-5`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">Material Definition</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`${btnLight} !h-9`}
                    onClick={() =>
                      setMats((r) => r.map((m) => {
                        const v = ({ Upper: tech.upper, Lining: tech.lining, Sole: tech.sole } as Record<string, string | undefined>)[m.component];
                        return v ? { ...m, material: v } : m;
                      }))
                    }
                  >
                    Copy from Technical Spec
                  </button>
                  <button
                    type="button"
                    className={`${btnLight} !h-9`}
                    onClick={() => setMats((r) => [...r, { id: Date.now(), component: "", material: "", applies: "All colors", remarks: "" }])}
                  >
                    <Plus size={16} /> Add component
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Component</th>
                      <th className="px-3 py-2">Material <Link href={M.material.href} className="ml-1 font-medium text-indigo-600 hover:underline">(Master)</Link></th>
                      <th className="px-3 py-2">Applies to</th>
                      <th className="px-3 py-2">Remarks</th>
                      <th className="w-10 px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mats.map((m) => (
                      <tr key={m.id}>
                        <td className="px-3 py-2"><input value={m.component} onChange={(e) => updMat(m.id, "component", e.target.value)} placeholder="e.g. Insole" className={inp} /></td>
                        <td className="px-3 py-2"><Select value={m.material} onChange={(v) => updMat(m.id, "material", v)} options={MATERIALS} /></td>
                        <td className="px-3 py-2"><Select value={m.applies} onChange={(v) => updMat(m.id, "applies", v)} options={["All colors", ...pickedColors.map((c) => c.name)]} /></td>
                        <td className="px-3 py-2"><input value={m.remarks} onChange={(e) => updMat(m.id, "remarks", e.target.value)} className={inp} /></td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            aria-label="Remove row"
                            onClick={() => setMats((r) => r.filter((x) => x.id !== m.id))}
                            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 outline-none hover:bg-slate-100 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Footer actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Link href="/dashboard" className={btnLight}>Cancel</Link>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => save(true)} className={btnLight}><Save size={16} /> Save draft</button>
              {tab > 0 && (
                <button type="button" onClick={() => setTab(tab - 1)} className={btnLight}><ChevronLeft size={16} /> Back</button>
              )}
              {tab < TABS.length - 1 ? (
                <button type="button" onClick={() => goTo(tab + 1)} className={btnDark}>Next <ChevronRight size={16} /></button>
              ) : (
                <button type="button" onClick={() => save(false)} className={btnDark}><Check size={16} /> Save product</button>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="hidden xl:block">
          <div className={`${card} sticky top-6 p-4`}>
            <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[
                ["Style code", basic.code],
                ["Product", basic.name || "—"],
                ["Customer", basic.customer || "—"],
                ["Colors", pickedColors.map((c) => c.name).join(", ") || "—"],
                ["Sizes (UK)", pickedSizes.map((s) => s.uk).join(", ") || "—"],
                ["Active variants", `${activeCount} / ${variants.length}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="truncate text-right font-medium text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="mb-2 text-xs font-semibold text-slate-600">Tabs completed</p>
              <ul className="space-y-1.5 text-sm">
                {TABS.map((t, i) => (
                  <li key={t} className="flex items-center gap-2 text-slate-700">
                    <span className={`grid h-4 w-4 place-items-center rounded-full ${done[i] ? "bg-indigo-600 text-white" : "bg-slate-200"}`}>
                      {done[i] && <Check size={10} />}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* Ek color ke variants: group header + SKU rows */
function ColorGroup({
  color, rows, off, setOff,
}: {
  color: { name: string; hex: string };
  rows: { sku: string; uk: number; us: number; eu: number; cm: number }[];
  off: string[];
  setOff: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <>
      <tr className="bg-slate-50">
        <td colSpan={7} className="border-t border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
          <span className="inline-flex items-center gap-2"><Swatch hex={color.hex} /> {color.name} · {rows.length} variants</span>
        </td>
      </tr>
      {rows.map((v) => {
        const inactive = off.includes(v.sku);
        return (
          <tr key={v.sku} className={`border-t border-slate-100 ${inactive ? "text-slate-400" : "text-slate-800"}`}>
            <td className={`px-3 py-2 font-medium ${inactive ? "line-through" : "text-slate-900"}`}>{v.sku}</td>
            <td className="px-3 py-2">{color.name}</td>
            <td className="px-3 py-2">{v.uk}</td>
            <td className="px-3 py-2">{v.us}</td>
            <td className="px-3 py-2">{v.eu}</td>
            <td className="px-3 py-2">{v.cm}</td>
            <td className="px-3 py-2 text-center">
              <input
                type="checkbox"
                aria-label={`Active ${v.sku}`}
                className="h-4 w-4 accent-indigo-600"
                checked={!inactive}
                onChange={() => setOff((p) => toggle(p, v.sku))}
              />
            </td>
          </tr>
        );
      })}
    </>
  );
}