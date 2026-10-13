"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  Badge, Button, Card, DL, Drawer, Field, Kpi, Notice, PageHeader, TableWrap, Tone, inputCls, td, th,
} from "@/components/procurement/ui";

type Status = "Approved" | "Under review" | "Inactive" | "Blocked";

interface Supplier {
  code: string;
  name: string;
  city: string;
  state: string;
  gstin: string;
  categories: string[];
  status: Status;
  terms: string;
  contact: string;
  phone: string;
  leadDays: number | null; // null = no recorded history
  onTime: number | null; // %
  accepted: number | null; // %
}

const STATUS_TONE: Record<Status, Tone> = {
  Approved: "green",
  "Under review": "amber",
  Inactive: "gray",
  Blocked: "red",
};

const CATEGORIES = ["Soles", "Insoles", "Leather", "Textile", "Adhesive", "Packaging", "Accessories"];
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;

const SEED: Supplier[] = [
  { code: "SUP-0001", name: "Best Soles Ltd.", city: "Agra", state: "Uttar Pradesh", gstin: "09ABCDE1234F1Z5", categories: ["Soles", "Insoles"], status: "Approved", terms: "15 days", contact: "Mohit Garg", phone: "+91 98100 00001", leadDays: 5, onTime: 94, accepted: 98.2 },
  { code: "SUP-0002", name: "Agra Leather Works", city: "Agra", state: "Uttar Pradesh", gstin: "09FGHIJ5678K1Z2", categories: ["Leather"], status: "Approved", terms: "30 days", contact: "Imran Qureshi", phone: "+91 98100 00002", leadDays: 9, onTime: 81, accepted: 96.5 },
  { code: "SUP-0003", name: "Kanpur Rubber Co.", city: "Kanpur", state: "Uttar Pradesh", gstin: "09KLMNO9012P1Z8", categories: ["Soles"], status: "Approved", terms: "30 days", contact: "Sunil Tiwari", phone: "+91 98100 00003", leadDays: 8, onTime: 88, accepted: 97.1 },
  { code: "SUP-0004", name: "Chennai Foam Industries", city: "Chennai", state: "Tamil Nadu", gstin: "33QRSTU3456V1Z1", categories: ["Insoles", "Textile"], status: "Under review", terms: "45 days", contact: "K. Raman", phone: "+91 98100 00004", leadDays: null, onTime: null, accepted: null },
  { code: "SUP-0005", name: "Mumbai Pack & Print", city: "Mumbai", state: "Maharashtra", gstin: "27WXYZA7890B1Z4", categories: ["Packaging"], status: "Approved", terms: "30 days", contact: "Neha Shah", phone: "+91 98100 00005", leadDays: 6, onTime: 97, accepted: 99.4 },
  { code: "SUP-0006", name: "Old Town Adhesives", city: "Meerut", state: "Uttar Pradesh", gstin: "09CDEFG2345H1Z6", categories: ["Adhesive"], status: "Blocked", terms: "Advance", contact: "Rakesh Jain", phone: "+91 98100 00006", leadDays: 11, onTime: 62, accepted: 89.3 },
];

const EMPTY_FORM = { name: "", city: "", state: "Uttar Pradesh", gstin: "", terms: "30 days", contact: "", phone: "", categories: [] as string[] };

const pct = (v: number | null) => (v === null ? "Insufficient history" : `${v}%`);

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(SEED);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState(false);
  const [toast, setToast] = useState("");

  const rows = useMemo(
    () =>
      suppliers.filter(
        (s) =>
          (status === "All" || s.status === status) &&
          (category === "All" || s.categories.includes(category)) &&
          (q === "" || `${s.name} ${s.code} ${s.gstin} ${s.city}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [suppliers, q, status, category],
  );

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Enter the supplier's legal name.";
    if (!GSTIN_RE.test(form.gstin.toUpperCase())) e.gstin = "Enter a valid 15-character GSTIN.";
    else if (suppliers.some((s) => s.gstin === form.gstin.toUpperCase())) e.gstin = "A supplier with this GSTIN already exists.";
    if (form.categories.length === 0) e.categories = "Select at least one material category.";
    if (!form.contact.trim()) e.contact = "Add a contact person for order communication.";
    return e;
  }, [form, suppliers]);

  const kpis = {
    total: suppliers.length,
    approved: suppliers.filter((s) => s.status === "Approved").length,
    review: suppliers.filter((s) => s.status === "Under review").length,
    blocked: suppliers.filter((s) => s.status === "Blocked" || s.status === "Inactive").length,
    noHistory: suppliers.filter((s) => s.onTime === null).length,
  };

  function save() {
    setTouched(true);
    if (Object.keys(errors).length) return;
    const code = `SUP-${String(suppliers.length + 1).padStart(4, "0")}`;
    setSuppliers([
      ...suppliers,
      { ...form, code, gstin: form.gstin.toUpperCase(), status: "Under review", leadDays: null, onTime: null, accepted: null },
    ]);
    setToast(`${form.name} added as ${code}. It stays "Under review" until compliance checks are complete.`);
    setForm(EMPTY_FORM);
    setTouched(false);
    setAdding(false);
  }

  function toggleCategory(c: string) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c],
    }));
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Supplier Management"
        subtitle="Maintain approved vendors, their material categories, commercial terms and delivery or quality history. Only approved, active suppliers can be invited to RFQs or receive POs."
        actions={
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus size={16} /> Add supplier
          </Button>
        }
      />

      {toast && (
        <div className="mb-4">
          <Notice tone="green">{toast}</Notice>
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Total suppliers" value={kpis.total} />
        <Kpi label="Approved" value={kpis.approved} />
        <Kpi label="Under review" value={kpis.review} hint="Compliance checks pending" />
        <Kpi label="Inactive or blocked" value={kpis.blocked} />
        <Kpi label="No performance history" value={kpis.noHistory} hint="Scores shown only from recorded GRNs" />
      </div>

      <Card flush>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              className={inputCls + " pl-9"}
              placeholder="Search by name, code, GSTIN or city"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search suppliers"
            />
          </div>
          <select className={inputCls + " w-44"} value={status} onChange={(e) => setStatus(e.target.value as "All" | Status)} aria-label="Filter by status">
            {["All", "Approved", "Under review", "Inactive", "Blocked"].map((s) => (
              <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
            ))}
          </select>
          <select className={inputCls + " w-44"} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <TableWrap>
          <thead className="bg-slate-50">
            <tr>
              {["Supplier", "Location", "Categories", "Payment terms", "On-time delivery", "Accepted quality", "Status"].map((h) => (
                <th key={h} className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((s) => (
              <tr key={s.code} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(s)}>
                <td className={td}>
                  <div className="font-medium text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.code} · {s.gstin}</div>
                </td>
                <td className={td}>{s.city}, {s.state}</td>
                <td className={td}>
                  <div className="flex flex-wrap gap-1">{s.categories.map((c) => <Badge key={c}>{c}</Badge>)}</div>
                </td>
                <td className={td}>{s.terms}</td>
                <td className={td}>{s.onTime === null ? <span className="text-xs text-slate-400">Insufficient history</span> : `${s.onTime}%`}</td>
                <td className={td}>{s.accepted === null ? <span className="text-xs text-slate-400">Insufficient history</span> : `${s.accepted}%`}</td>
                <td className={td}><Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">
                  No suppliers match these filters. Clear a filter or add a new supplier.
                </td>
              </tr>
            )}
          </tbody>
        </TableWrap>
      </Card>

      {/* Supplier detail */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""} subtitle={selected ? `${selected.code} · ${selected.city}` : ""}>
        {selected && (
          <div className="space-y-6">
            <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
            {selected.status !== "Approved" && (
              <Notice tone="amber" title="Not eligible for new purchasing">
                RFQ invitations and PO creation warn or block for suppliers that are not approved and active.
              </Notice>
            )}
            <DL
              rows={[
                ["GSTIN", selected.gstin],
                ["State", selected.state],
                ["Payment terms", selected.terms],
                ["Contact", `${selected.contact} · ${selected.phone}`],
                ["Material categories", selected.categories.join(", ")],
              ]}
            />
            <Card title="Performance (from recorded transactions)">
              <DL
                rows={[
                  ["Typical lead time", selected.leadDays === null ? "Insufficient history" : `${selected.leadDays} days`],
                  ["On-time delivery", pct(selected.onTime)],
                  ["Accepted quality rate", pct(selected.accepted)],
                ]}
              />
              <p className="mt-3 text-xs text-slate-400">Metrics are calculated from GRNs and inspection records in a defined time window — never entered by hand.</p>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Add supplier */}
      <Drawer open={adding} onClose={() => setAdding(false)} title="Add supplier" subtitle="New suppliers start as Under review.">
        <div className="space-y-4">
          <Field label="Legal name" required error={touched ? errors.name : undefined}>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="State"><input className={inputCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
          </div>
          <Field label="GSTIN" required hint="Used to decide CGST/SGST or IGST on invoices." error={touched ? errors.gstin : undefined}>
            <input className={inputCls + " uppercase"} maxLength={15} value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
          </Field>
          <Field label="Material categories supplied" required error={touched ? errors.categories : undefined}>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  aria-pressed={form.categories.includes(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${form.categories.includes(c) ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact person" required error={touched ? errors.contact : undefined}>
              <input className={inputCls} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </Field>
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          </div>
          <Field label="Payment terms">
            <select className={inputCls} value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })}>
              {["Advance", "15 days", "30 days", "45 days", "60 days"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button onClick={() => setAdding(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>Save supplier</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}