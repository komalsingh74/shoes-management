"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Search, Trash2 } from "lucide-react";
import {
  BUSINESS_DATE, Badge, Button, Card, DL, Drawer, Field, Kpi, Notice, PageHeader, TableWrap, Tabs, Timeline, Tone,
  addDays, fmtDate, inputCls, inr, num, td, tdR, th, thR,
} from "@/components/procurement/ui";
import {
  MATERIALS, PURCHASE_ORDERS, SUPPLIER_OPTIONS, BUYER_STATE, lineNet, materialByCode, poValue, supplierByCode,
  type POLine, type POStatus, type PurchaseOrder,
} from "@/components/procurement/mock";

const STATUS_TONE: Record<POStatus, Tone> = {
  Draft: "gray", "Pending approval": "amber", Approved: "blue", Sent: "blue",
  "Partially received": "violet", Completed: "green", Cancelled: "red",
};

interface Schedule { id: number; qty: string; date: string; note: string }
interface DraftLine { id: number; code: string; qty: string; price: string; disc: string; schedules: Schedule[]; open: boolean }

let uid = 100;
const nextId = () => ++uid;

const newLine = (code: string, qty = "", price?: string): DraftLine => {
  const m = materialByCode(code)!;
  return {
    id: nextId(), code, qty, price: price ?? String(m.rate), disc: "0", open: false,
    schedules: [{ id: nextId(), qty, date: addDays(BUSINESS_DATE, 7), note: "" }],
  };
};

const WAREHOUSES = ["Main Warehouse", "Components Store", "Packing Store"];
const FREIGHT_GST = 18;

interface Revision { rev: number; summary: string; reason: string; status: string }

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [revisions, setRevisions] = useState<Record<string, Revision[]>>({});
  const [mode, setMode] = useState<"list" | "create">("list");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | POStatus>("All");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [detail, setDetail] = useState<PurchaseOrder | null>(null);
  const [toast, setToast] = useState("");

  /* ----- create form state ----- */
  const [supplier, setSupplier] = useState("");
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0]);
  const [terms, setTerms] = useState("");
  const [source, setSource] = useState("Manual");
  const [lines, setLines] = useState<DraftLine[]>([newLine(MATERIALS[0].code)]);
  const [freight, setFreight] = useState("0");
  const [headerDisc, setHeaderDisc] = useState("0");
  const [supplierNote, setSupplierNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [touched, setTouched] = useState(false);

  const sup = supplierByCode(supplier);
  const isOverdue = (p: PurchaseOrder) =>
    ["Approved", "Sent", "Partially received"].includes(p.status) && p.nextDelivery < BUSINESS_DATE;

  const rows = orders.filter(
    (p) =>
      (statusFilter === "All" || p.status === statusFilter) &&
      (!overdueOnly || isOverdue(p)) &&
      (q === "" || `${p.no} ${supplierByCode(p.supplier)?.name} ${p.lines.map((l) => materialByCode(l.code)?.name).join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );

  /* ----- totals (UI preview only; the backend must recalculate) ----- */
  const totals = useMemo(() => {
    const calc = lines.map((l) => {
      const gross = (Number(l.qty) || 0) * (Number(l.price) || 0);
      const disc = gross * ((Number(l.disc) || 0) / 100);
      return { id: l.id, net: gross - disc, gross, disc, gst: materialByCode(l.code)?.gst ?? 0 };
    });
    const gross = calc.reduce((s, c) => s + c.gross, 0);
    const lineDisc = calc.reduce((s, c) => s + c.disc, 0);
    const afterLine = gross - lineDisc;
    const hd = Math.min(Number(headerDisc) || 0, afterLine);
    // Allocate header discount in proportion to each line's net value.
    let tax = 0;
    for (const c of calc) {
      const share = afterLine > 0 ? (c.net / afterLine) * hd : 0;
      tax += (c.net - share) * (c.gst / 100);
    }
    const fr = Number(freight) || 0;
    tax += fr * (FREIGHT_GST / 100);
    const taxable = afterLine - hd + fr;
    const exact = taxable + tax;
    const total = Math.round(exact);
    return { gross, lineDisc, hd, fr, taxable, tax, rounding: total - exact, total };
  }, [lines, headerDisc, freight]);

  /* ----- validation ----- */
  const { errors, warnings } = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!supplier) errors.push("Select a supplier. One PO belongs to one supplier.");
    if (sup && !sup.active) errors.push(`${sup.name} is inactive and cannot receive new POs.`);
    if (lines.length === 0) errors.push("Add at least one material line.");
    lines.forEach((l, i) => {
      const n = `Line ${i + 1}`;
      const qty = Number(l.qty);
      const sched = l.schedules.reduce((s, x) => s + (Number(x.qty) || 0), 0);
      if (!(qty > 0)) errors.push(`${n}: enter an order quantity above zero.`);
      if (!(Number(l.price) > 0)) errors.push(`${n}: enter a unit price above zero.`);
      if (qty > 0 && sched !== qty) errors.push(`${n}: scheduled quantity is ${num(sched)} but the order quantity is ${num(qty)}.`);
      if (l.schedules.some((s) => !s.date)) errors.push(`${n}: every delivery needs an expected date.`);
      const m = materialByCode(l.code);
      if (m && Number(l.price) > m.rate * 1.1) warnings.push(`${n}: price is more than 10% above the last rate (${inr(m.rate)}).`);
    });
    const codes = lines.map((l) => l.code);
    if (new Set(codes).size !== codes.length) warnings.push("The same material appears more than once. Keep separate lines only if price or delivery genuinely differs.");
    return { errors, warnings };
  }, [supplier, sup, lines]);

  function pickSupplier(code: string) {
    setSupplier(code);
    setTerms(supplierByCode(code)?.terms ?? "");
  }
  function patchLine(id: number, patch: Partial<DraftLine>) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function setLineQty(l: DraftLine, qty: string) {
    // Keep a single-schedule line in sync with its order quantity.
    const schedules = l.schedules.length === 1 ? [{ ...l.schedules[0], qty }] : l.schedules;
    patchLine(l.id, { qty, schedules });
  }
  function patchSchedule(l: DraftLine, sid: number, patch: Partial<Schedule>) {
    patchLine(l.id, { schedules: l.schedules.map((s) => (s.id === sid ? { ...s, ...patch } : s)) });
  }
  function addMaterial() {
    const free = MATERIALS.find((m) => !lines.some((l) => l.code === m.code)) ?? MATERIALS[0];
    setLines([...lines, newLine(free.code)]);
  }
  function importAward() {
    pickSupplier("SUP-0001");
    setSource("Award — RFQ-2026-00024");
    setLines([newLine("RM-SOL-BLK", "3700", "120")]);
  }
  function resetForm() {
    setSupplier(""); setTerms(""); setSource("Manual"); setLines([newLine(MATERIALS[0].code)]);
    setFreight("0"); setHeaderDisc("0"); setSupplierNote(""); setInternalNote(""); setTouched(false);
  }

  function save(submit: boolean) {
    setTouched(true);
    if (submit && errors.length) return;
    if (!supplier) return;
    const no = `PO-2026-${String(82 + orders.filter((o) => o.no > "PO-2026-00081").length).padStart(5, "0")}`;
    const poLines: POLine[] = lines.map((l) => ({
      code: l.code, qty: Number(l.qty) || 0, price: Number(l.price) || 0, discPct: Number(l.disc) || 0,
      received: 0, accepted: 0, rejected: 0, quarantined: 0,
      needDate: l.schedules.map((s) => s.date).sort()[0] ?? BUSINESS_DATE,
    }));
    setOrders([
      {
        no, date: BUSINESS_DATE, supplier, status: submit ? "Pending approval" : "Draft", terms, warehouse,
        buyer: "You", freight: totals.fr, lines: poLines,
        nextDelivery: lines.flatMap((l) => l.schedules.map((s) => s.date)).sort()[0] ?? BUSINESS_DATE,
      },
      ...orders,
    ]);
    setToast(submit ? `${no} submitted for approval.` : `${no} saved as draft.`);
    setMode("list");
    resetForm();
  }

  /* ================= LIST ================= */
  if (mode === "list")
    return (
      <div className="mx-auto max-w-7xl p-6">
        <PageHeader
          title="Purchase Orders"
          subtitle="Supplier commitments. One PO covers one supplier and can hold one or many materials, each with its own delivery schedule."
          actions={<Button variant="primary" onClick={() => setMode("create")}><Plus size={16} /> Create purchase order</Button>}
        />
        {toast && <div className="mb-4"><Notice tone="green">{toast}</Notice></div>}

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-6">
          <Kpi label="Total POs" value={orders.filter((o) => o.status !== "Cancelled").length} />
          <Kpi label="Pending approval" value={orders.filter((o) => o.status === "Pending approval").length} />
          <Kpi label="Open POs" value={orders.filter((o) => ["Approved", "Sent", "Partially received"].includes(o.status)).length} />
          <Kpi label="Partially received" value={orders.filter((o) => o.status === "Partially received").length} />
          <Kpi label="Overdue deliveries" value={orders.filter(isOverdue).length} tone="alert" />
          <Kpi label="Total PO value" value={inr(orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + poValue(o), 0))} hint="Excludes cancelled" />
        </div>

        <Card flush>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input className={inputCls + " pl-9"} placeholder="Search PO, supplier or material" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search purchase orders" />
            </div>
            <select className={inputCls + " w-48"} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "All" | POStatus)} aria-label="Filter by status">
              <option value="All">All statuses</option>
              {Object.keys(STATUS_TONE).map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} /> Overdue only</label>
          </div>
          <TableWrap>
            <thead className="bg-slate-50"><tr>
              <th className={th}>PO number</th><th className={th}>Date</th><th className={th}>Supplier</th><th className={th}>Materials</th>
              <th className={thR}>Value</th><th className={th}>Next delivery</th><th className={th}>Received</th><th className={th}>Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => {
                const ordered = p.lines.reduce((s, l) => s + l.qty, 0);
                const recv = p.lines.reduce((s, l) => s + l.received, 0);
                const pct = ordered ? Math.round((recv / ordered) * 100) : 0;
                return (
                  <tr key={p.no} className="cursor-pointer hover:bg-slate-50" onClick={() => setDetail(p)}>
                    <td className={td + " font-medium text-slate-900"}>{p.no}</td>
                    <td className={td}>{fmtDate(p.date)}</td>
                    <td className={td}>{supplierByCode(p.supplier)?.name}</td>
                    <td className={td}>{p.lines.length === 1 ? materialByCode(p.lines[0].code)?.name : `${p.lines.length} materials`}</td>
                    <td className={tdR}>{inr(poValue(p))}</td>
                    <td className={td}>
                      {fmtDate(p.nextDelivery)}
                      {isOverdue(p) && <div className="text-xs font-medium text-red-600">Overdue</div>}
                    </td>
                    <td className={td}>
                      <div className="h-1.5 w-20 rounded bg-slate-100"><div className="h-1.5 rounded bg-indigo-500" style={{ width: `${pct}%` }} /></div>
                      <div className="mt-1 text-xs text-slate-500">{pct}%</div>
                    </td>
                    <td className={td}><Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge></td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={8} className="px-3 py-10 text-center text-sm text-slate-500">No purchase orders match these filters.</td></tr>}
            </tbody>
          </TableWrap>
        </Card>

        <PODetail po={detail} onClose={() => setDetail(null)} revisions={detail ? revisions[detail.no] ?? [] : []}
          onRevise={(r) => detail && setRevisions({ ...revisions, [detail.no]: [...(revisions[detail.no] ?? []), r] })} />
      </div>
    );

  /* ================= CREATE ================= */
  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Create purchase order"
        subtitle="Choose one supplier, then add one or many materials. Each material can be delivered in one or more scheduled shipments."
        actions={<Button onClick={() => { setMode("list"); resetForm(); }}>Back to list</Button>}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card title="Order details">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Supplier" required>
                <select className={inputCls} value={supplier} onChange={(e) => pickSupplier(e.target.value)}>
                  <option value="">Select supplier</option>
                  {SUPPLIER_OPTIONS.map((s) => <option key={s.code} value={s.code}>{s.name}{s.active ? "" : " (inactive)"}</option>)}
                </select>
              </Field>
              <Field label="Payment terms" hint="Defaults from the supplier. Changes may need approval.">
                <input className={inputCls} value={terms} onChange={(e) => setTerms(e.target.value)} />
              </Field>
              <Field label="Ship-to warehouse" required>
                <select className={inputCls} value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>{WAREHOUSES.map((w) => <option key={w}>{w}</option>)}</select>
              </Field>
              <Field label="Source"><input className={inputCls} value={source} readOnly /></Field>
            </div>
            {sup && sup.state !== BUYER_STATE && <div className="mt-3"><Notice tone="blue">Supplier is in {sup.state}, so IGST will apply on the invoice instead of CGST + SGST.</Notice></div>}
          </Card>

          <Card title="Materials" flush action={
            <div className="flex gap-2">
              <Button onClick={importAward}>Import approved award</Button>
              <Button onClick={addMaterial}><Plus size={14} /> Add material</Button>
            </div>
          }>
            <TableWrap>
              <thead className="bg-slate-50"><tr>
                <th className={th} /><th className={th}>#</th><th className={th + " min-w-[200px]"}>Material</th><th className={th + " w-32"}>Quantity</th>
                <th className={th + " w-28"}>Unit price</th><th className={th + " w-20"}>Disc %</th><th className={thR}>GST</th><th className={thR}>Line total</th><th className={th} />
              </tr></thead>
              <tbody>
                {lines.map((l, i) => {
                  const m = materialByCode(l.code);
                  const net = (Number(l.qty) || 0) * (Number(l.price) || 0) * (1 - (Number(l.disc) || 0) / 100);
                  const sched = l.schedules.reduce((s, x) => s + (Number(x.qty) || 0), 0);
                  const unscheduled = (Number(l.qty) || 0) - sched;
                  return (
                    <FragmentRow key={l.id}>
                      <tr className="border-t border-slate-100">
                        <td className={td}>
                          <button aria-label={l.open ? "Hide schedule" : "Show schedule"} onClick={() => patchLine(l.id, { open: !l.open })} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                            {l.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td className={td}>{i + 1}</td>
                        <td className={td}>
                          <select className={inputCls} value={l.code} aria-label={`Material for line ${i + 1}`}
                            onChange={(e) => patchLine(l.id, { code: e.target.value, price: String(materialByCode(e.target.value)?.rate ?? "") })}>
                            {MATERIALS.map((mm) => <option key={mm.code} value={mm.code}>{mm.name}</option>)}
                          </select>
                        </td>
                        <td className={td}>
                          <div className="flex items-center gap-1.5">
                            <input type="number" min={0} className={inputCls} value={l.qty} aria-label={`Quantity line ${i + 1}`} onChange={(e) => setLineQty(l, e.target.value)} />
                            <span className="text-xs text-slate-500">{m?.uom}</span>
                          </div>
                        </td>
                        <td className={td}><input type="number" min={0} className={inputCls} value={l.price} aria-label={`Unit price line ${i + 1}`} onChange={(e) => patchLine(l.id, { price: e.target.value })} /></td>
                        <td className={td}><input type="number" min={0} max={100} className={inputCls} value={l.disc} aria-label={`Discount line ${i + 1}`} onChange={(e) => patchLine(l.id, { disc: e.target.value })} /></td>
                        <td className={tdR}>{m?.gst}%</td>
                        <td className={tdR}>{inr(net)}</td>
                        <td className={td}>
                          <Button variant="ghost" aria-label="Remove line" disabled={lines.length === 1} onClick={() => setLines(lines.filter((x) => x.id !== l.id))}><Trash2 size={16} /></Button>
                        </td>
                      </tr>
                      {l.open && (
                        <tr className="bg-slate-50">
                          <td />
                          <td colSpan={8} className="px-3 py-4">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-sm font-medium text-slate-800">Delivery schedule — {m?.name}</div>
                              {unscheduled !== 0 && <Badge tone="red">{unscheduled > 0 ? `${num(unscheduled)} unscheduled` : `${num(-unscheduled)} over-scheduled`}</Badge>}
                            </div>
                            <div className="space-y-2">
                              {l.schedules.map((s, si) => (
                                <div key={s.id} className="grid grid-cols-[80px_130px_160px_1fr_40px] items-center gap-2">
                                  <span className="text-sm text-slate-600">Delivery {si + 1}</span>
                                  <input type="number" min={0} className={inputCls} value={s.qty} aria-label={`Delivery ${si + 1} quantity`} onChange={(e) => patchSchedule(l, s.id, { qty: e.target.value })} />
                                  <input type="date" className={inputCls} value={s.date} min={BUSINESS_DATE} aria-label={`Delivery ${si + 1} date`} onChange={(e) => patchSchedule(l, s.id, { date: e.target.value })} />
                                  <input className={inputCls} placeholder="Delivery instructions" value={s.note} onChange={(e) => patchSchedule(l, s.id, { note: e.target.value })} />
                                  <Button variant="ghost" aria-label="Remove delivery" disabled={l.schedules.length === 1} onClick={() => patchLine(l.id, { schedules: l.schedules.filter((x) => x.id !== s.id) })}><Trash2 size={14} /></Button>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <Button onClick={() => patchLine(l.id, { schedules: [...l.schedules, { id: nextId(), qty: unscheduled > 0 ? String(unscheduled) : "", date: addDays(BUSINESS_DATE, 14), note: "" }] })}>
                                <Plus size={14} /> Add delivery
                              </Button>
                              <span className="text-xs text-slate-500">Scheduled {num(sched)} of {num(Number(l.qty) || 0)} {m?.uom}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </FragmentRow>
                  );
                })}
              </tbody>
            </TableWrap>
          </Card>

          <Card title="Notes">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Note to supplier" hint="Printed on the PO."><textarea className={inputCls} rows={3} value={supplierNote} onChange={(e) => setSupplierNote(e.target.value)} /></Field>
              <Field label="Internal note" hint="Never shared with the supplier."><textarea className={inputCls} rows={3} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} /></Field>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card title="Order summary">
            <dl className="space-y-2 text-sm">
              <Sum label="Gross line amount" value={inr(totals.gross)} />
              <Sum label="Line discounts" value={`− ${inr(totals.lineDisc)}`} />
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Header discount</dt>
                <dd><input type="number" min={0} className={inputCls + " w-28 text-right"} value={headerDisc} aria-label="Header discount" onChange={(e) => setHeaderDisc(e.target.value)} /></dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Freight (GST {FREIGHT_GST}%)</dt>
                <dd><input type="number" min={0} className={inputCls + " w-28 text-right"} value={freight} aria-label="Freight" onChange={(e) => setFreight(e.target.value)} /></dd>
              </div>
              <Sum label="Taxable amount" value={inr(totals.taxable)} />
              <Sum label="GST" value={inr(Math.round(totals.tax * 100) / 100)} />
              <Sum label="Rounding" value={inr(Math.round(totals.rounding * 100) / 100)} />
              <div className="border-t border-slate-200 pt-2"><Sum label="PO total" value={inr(totals.total)} strong /></div>
            </dl>
            <p className="mt-3 text-xs text-slate-400">Preview only. The server recalculates tax and totals from configured rules before saving.</p>
          </Card>

          {touched && errors.length > 0 && (
            <Notice tone="red" title="Fix before submitting">
              <ul className="list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
            </Notice>
          )}
          {warnings.length > 0 && (
            <Notice tone="amber" title="Review">
              <ul className="list-disc pl-5">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
            </Notice>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={() => save(false)} disabled={!supplier}>Save draft</Button>
            <Button variant="primary" onClick={() => save(true)}>Submit for approval</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
function Sum({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={strong ? "font-semibold text-slate-900" : "text-slate-500"}>{label}</dt>
      <dd className={`tabular-nums ${strong ? "text-lg font-semibold text-slate-900" : "text-slate-800"}`}>{value}</dd>
    </div>
  );
}

/* ================= DETAIL + REVISION ================= */

const DETAIL_TABS = ["Overview", "Material lines", "Approvals", "Revisions"] as const;

function PODetail({
  po, onClose, revisions, onRevise,
}: { po: PurchaseOrder | null; onClose: () => void; revisions: Revision[]; onRevise: (r: Revision) => void }) {
  const [tab, setTab] = useState<(typeof DETAIL_TABS)[number]>("Overview");
  const [lineCode, setLineCode] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  if (!po) return <Drawer open={false} onClose={onClose} title="" children={null} />;

  const sup = supplierByCode(po.supplier);
  const canRevise = ["Approved", "Sent", "Partially received"].includes(po.status);
  const line = po.lines.find((l) => l.code === (lineCode || po.lines[0].code)) ?? po.lines[0];
  const m = materialByCode(line.code);

  const revErrors: string[] = [];
  if (newQty && Number(newQty) < line.received) revErrors.push(`New quantity cannot be below the ${num(line.received)} already received.`);
  if (!newQty && !newPrice && !newDate) revErrors.push("Change at least one of quantity, price or delivery date.");
  if (reason.trim().length < 5) revErrors.push("A revision reason is required.");

  function submitRevision() {
    if (revErrors.length) { setMsg(""); return; }
    const parts: string[] = [];
    if (newQty) parts.push(`Qty ${num(line.qty)} → ${num(Number(newQty))}`);
    if (newPrice) parts.push(`Price ${inr(line.price)} → ${inr(Number(newPrice))}`);
    if (newDate) parts.push(`Delivery → ${fmtDate(newDate)}`);
    onRevise({ rev: revisions.length + 1, summary: `${m?.name}: ${parts.join(", ")}`, reason, status: "Pending approval" });
    setNewQty(""); setNewPrice(""); setNewDate(""); setReason("");
    setMsg("Revision submitted. The approved PO stays unchanged until it is approved.");
  }

  return (
    <Drawer open onClose={onClose} title={po.no} subtitle={`${sup?.name} · ${po.status}`} wide>
      <div className="space-y-5">
        <Tabs tabs={DETAIL_TABS} value={tab} onChange={setTab} />

        {tab === "Overview" && (
          <DL rows={[
            ["Supplier", sup?.name], ["PO date", fmtDate(po.date)], ["Payment terms", po.terms], ["Ship-to", po.warehouse],
            ["Buyer", po.buyer], ["PO value (incl. tax)", inr(poValue(po))], ["Next delivery", fmtDate(po.nextDelivery)], ["Status", <Badge key="s" tone={STATUS_TONE[po.status]}>{po.status}</Badge>],
          ]} />
        )}

        {tab === "Material lines" && (
          <TableWrap>
            <thead className="bg-slate-50"><tr>
              <th className={th}>Material</th><th className={thR}>Ordered</th><th className={thR}>Received</th><th className={thR}>Accepted</th>
              <th className={thR}>Rejected</th><th className={thR}>Quarantined</th><th className={thR}>Outstanding</th><th className={thR}>Amount</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {po.lines.map((l) => (
                <tr key={l.code}>
                  <td className={td}>{materialByCode(l.code)?.name}<div className="text-xs text-slate-500">{inr(l.price)} / {materialByCode(l.code)?.uom}</div></td>
                  <td className={tdR}>{num(l.qty)}</td><td className={tdR}>{num(l.received)}</td><td className={tdR}>{num(l.accepted)}</td>
                  <td className={tdR}>{num(l.rejected)}</td><td className={tdR}>{num(l.quarantined)}</td>
                  <td className={tdR + " font-medium"}>{num(Math.max(l.qty - l.received, 0))}</td>
                  <td className={tdR}>{inr(lineNet(l))}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}

        {tab === "Approvals" && (
          <Timeline items={[
            { title: "Draft prepared", meta: `${po.buyer} · ${fmtDate(po.date)}` },
            { title: po.status === "Draft" ? "Not yet submitted" : "Submitted for approval", meta: po.status === "Draft" ? "Waiting for buyer" : `${fmtDate(po.date)}`, done: po.status !== "Draft" },
            { title: po.status === "Pending approval" ? "Awaiting approver" : "Approved", meta: po.status === "Pending approval" ? "Purchase manager" : po.status === "Draft" ? "—" : "Purchase manager", done: !["Draft", "Pending approval"].includes(po.status) },
          ]} />
        )}

        {tab === "Revisions" && (
          <div className="space-y-5">
            {!canRevise && <Notice tone="blue">Revisions apply to approved POs. Draft and pending POs can be edited directly.</Notice>}
            {revisions.map((r) => (
              <Card key={r.rev}>
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Revision {r.rev}</span><Badge tone="amber">{r.status}</Badge></div>
                <p className="mt-1 text-sm text-slate-700">{r.summary}</p>
                <p className="text-xs text-slate-500">Reason: {r.reason}</p>
              </Card>
            ))}
            {canRevise && (
              <Card title="Propose a revision">
                <div className="space-y-3">
                  <Field label="Line">
                    <select className={inputCls} value={line.code} onChange={(e) => setLineCode(e.target.value)}>
                      {po.lines.map((l) => <option key={l.code} value={l.code}>{materialByCode(l.code)?.name}</option>)}
                    </select>
                  </Field>
                  <TableWrap>
                    <thead className="bg-slate-50"><tr><th className={th}>Field</th><th className={th}>Current (approved)</th><th className={th}>Proposed</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr><td className={td}>Quantity</td><td className={td}>{num(line.qty)} {m?.uom}</td><td className={td}><input type="number" className={inputCls} value={newQty} onChange={(e) => setNewQty(e.target.value)} aria-label="Proposed quantity" /></td></tr>
                      <tr><td className={td}>Unit price</td><td className={td}>{inr(line.price)}</td><td className={td}><input type="number" className={inputCls} value={newPrice} onChange={(e) => setNewPrice(e.target.value)} aria-label="Proposed price" /></td></tr>
                      <tr><td className={td}>Delivery date</td><td className={td}>{fmtDate(line.needDate)}</td><td className={td}><input type="date" className={inputCls} value={newDate} onChange={(e) => setNewDate(e.target.value)} aria-label="Proposed delivery date" /></td></tr>
                    </tbody>
                  </TableWrap>
                  <Field label="Reason for revision" required><input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Production plan revised" /></Field>
                  {revErrors.length > 0 && (newQty || newPrice || newDate || reason) && (
                    <Notice tone="amber"><ul className="list-disc pl-5">{revErrors.map((e) => <li key={e}>{e}</li>)}</ul></Notice>
                  )}
                  {msg && <Notice tone="green">{msg}</Notice>}
                  <div className="flex justify-end"><Button variant="primary" onClick={submitRevision} disabled={revErrors.length > 0}>Submit revision</Button></div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}