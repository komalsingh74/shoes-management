"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  BUSINESS_DATE, Badge, Button, Card, Drawer, Field, Kpi, Notice, PageHeader, TableWrap, Tone,
  fmtDate, inputCls, inr, num, td, tdR, th, thR,
} from "@/components/procurement/ui";
import { BUYER_STATE, SUPPLIER_OPTIONS, materialByCode, supplierByCode } from "@/components/procurement/mock";

type InvStatus = "Matched" | "Variance" | "Blocked" | "Approved" | "Paid";

interface InvLine { code: string; qty: number; price: number; poPrice: number; grnAccepted: number }
interface Invoice {
  id: string; supplier: string; no: string; date: string; due: string; po: string; lines: InvLine[]; status: InvStatus;
}

const TONE: Record<InvStatus, Tone> = { Matched: "green", Variance: "amber", Blocked: "red", Approved: "blue", Paid: "gray" };

const PRICE_TOL = 1; // % price tolerance
const QTY_TOL = 0; // units of quantity tolerance

const SEED: Invoice[] = [
  { id: "INV-0031", supplier: "SUP-0002", no: "ALW/26/0412", date: "2026-10-09", due: "2026-11-08", po: "PO-2026-00076", status: "Variance",
    lines: [{ code: "RM-LTH-BLK", qty: 2000, price: 95, poPrice: 95, grnAccepted: 1950 }] },
  { id: "INV-0030", supplier: "SUP-0005", no: "MPP-8841", date: "2026-10-02", due: "2026-11-01", po: "PO-2026-00069", status: "Approved",
    lines: [{ code: "RM-PKG-INS", qty: 5000, price: 3, poPrice: 3, grnAccepted: 5000 }] },
  { id: "INV-0029", supplier: "SUP-0001", no: "BSL-2209", date: "2026-09-25", due: "2026-10-10", po: "PO-2026-00060", status: "Approved",
    lines: [{ code: "RM-SOL-BLK", qty: 2000, price: 120, poPrice: 120, grnAccepted: 2000 }] },
];

interface Variance { code: string; kind: "Price" | "Quantity"; text: string }

/** Three-way match: invoice vs PO price vs accepted GRN quantity. Backend must repeat this check. */
function matchLines(lines: InvLine[]): Variance[] {
  const out: Variance[] = [];
  for (const l of lines) {
    const name = materialByCode(l.code)?.name ?? l.code;
    const priceDiff = ((l.price - l.poPrice) / l.poPrice) * 100;
    if (Math.abs(priceDiff) > PRICE_TOL) out.push({ code: l.code, kind: "Price", text: `${name}: invoice price ${inr(l.price)} vs PO ${inr(l.poPrice)} (${priceDiff > 0 ? "+" : ""}${priceDiff.toFixed(1)}%)` });
    if (l.qty - l.grnAccepted > QTY_TOL) out.push({ code: l.code, kind: "Quantity", text: `${name}: invoiced ${num(l.qty)} but only ${num(l.grnAccepted)} accepted on GRN` });
  }
  return out;
}

function gst(inv: Invoice) {
  const base = inv.lines.reduce((s, l) => s + l.qty * l.price, 0);
  const tax = inv.lines.reduce((s, l) => s + l.qty * l.price * ((materialByCode(l.code)?.gst ?? 0) / 100), 0);
  const inter = supplierByCode(inv.supplier)?.state !== BUYER_STATE;
  return { base, tax, total: base + tax, inter };
}

// Quick lookup of what is invoiceable per supplier for the entry form (illustrative).
const OPEN_GRN: Record<string, InvLine[]> = {
  "SUP-0001": [
    { code: "RM-SOL-BLK", qty: 0, price: 0, poPrice: 120, grnAccepted: 1950 },
    { code: "RM-INS-EVA", qty: 0, price: 0, poPrice: 18, grnAccepted: 1000 },
  ],
  "SUP-0002": [{ code: "RM-LTH-BLK", qty: 0, price: 0, poPrice: 95, grnAccepted: 1950 }],
};

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(SEED);
  const [view, setView] = useState<Invoice | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");

  const [sup, setSup] = useState("");
  const [invNo, setInvNo] = useState("");
  const [invDate, setInvDate] = useState(BUSINESS_DATE);
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  const available = OPEN_GRN[sup] ?? [];

  const draftLines: InvLine[] = available.filter((l) => Number(qtys[l.code]) > 0).map((l) => ({
    ...l, qty: Number(qtys[l.code]), price: Number(prices[l.code]) || l.poPrice,
  }));
  const draftVariances = matchLines(draftLines);

  const duplicate = useMemo(
    () => invoices.find((i) => i.supplier === sup && i.no.trim().toLowerCase() === invNo.trim().toLowerCase() && invNo.trim() !== ""),
    [invoices, sup, invNo],
  );

  const errors: string[] = [];
  if (!sup) errors.push("Select the supplier.");
  if (!invNo.trim()) errors.push("Enter the supplier's invoice number.");
  if (duplicate) errors.push(`Invoice ${invNo} from this supplier already exists (${duplicate.id}). Duplicates are blocked.`);
  if (draftLines.length === 0) errors.push("Enter the invoiced quantity for at least one line.");

  function save() {
    setTouched(true);
    if (errors.length) return;
    const id = `INV-${String(32 + invoices.filter((i) => i.id > "INV-0031").length).padStart(4, "0")}`;
    setInvoices([{ id, supplier: sup, no: invNo.trim(), date: invDate, due: invDate, po: "Linked via GRN", lines: draftLines, status: draftVariances.length ? "Variance" : "Matched" }, ...invoices]);
    setToast(draftVariances.length ? `${id} saved with ${draftVariances.length} variance(s). It cannot be approved until they are resolved.` : `${id} matched to PO and GRN.`);
    setAdding(false); setSup(""); setInvNo(""); setQtys({}); setPrices({}); setTouched(false);
  }

  const pending = invoices.filter((i) => ["Matched", "Variance", "Blocked"].includes(i.status));

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader title="Supplier Invoices" subtitle="Record supplier bills and match each one to the PO price and the quantity accepted at receiving before it can be approved for payment."
        actions={<Button variant="primary" onClick={() => setAdding(true)}><Plus size={16} /> Record invoice</Button>} />
      {toast && <div className="mb-4"><Notice tone="green">{toast}</Notice></div>}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Invoices" value={invoices.length} />
        <Kpi label="Awaiting approval" value={pending.length} />
        <Kpi label="With variances" value={invoices.filter((i) => i.status === "Variance").length} tone="alert" />
        <Kpi label="Approved, unpaid" value={inr(invoices.filter((i) => i.status === "Approved").reduce((s, i) => s + gst(i).total, 0))} />
        <Kpi label="Overdue" value={invoices.filter((i) => i.status === "Approved" && i.due < BUSINESS_DATE).length} tone="alert" />
      </div>

      <Card flush>
        <TableWrap>
          <thead className="bg-slate-50"><tr>
            <th className={th}>Record</th><th className={th}>Supplier invoice</th><th className={th}>Supplier</th><th className={th}>Invoice date</th><th className={th}>Due</th>
            <th className={thR}>Total (incl. GST)</th><th className={th}>Status</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((i) => (
              <tr key={i.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setView(i)}>
                <td className={td + " font-medium text-slate-900"}>{i.id}</td>
                <td className={td}>{i.no}</td>
                <td className={td}>{supplierByCode(i.supplier)?.name}</td>
                <td className={td}>{fmtDate(i.date)}</td>
                <td className={td}>{fmtDate(i.due)}{i.status === "Approved" && i.due < BUSINESS_DATE && <div className="text-xs font-medium text-red-600">Overdue</div>}</td>
                <td className={tdR}>{inr(Math.round(gst(i).total))}</td>
                <td className={td}><Badge tone={TONE[i.status]}>{i.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      {/* Detail with three-way match */}
      <Drawer open={!!view} onClose={() => setView(null)} title={view?.id ?? ""} subtitle={view ? `${supplierByCode(view.supplier)?.name} · ${view.no}` : ""} wide>
        {view && (() => {
          const v = matchLines(view.lines);
          const g = gst(view);
          return (
            <div className="space-y-5">
              <Badge tone={TONE[view.status]}>{view.status}</Badge>
              <TableWrap>
                <thead className="bg-slate-50"><tr>
                  <th className={th}>Material</th><th className={thR}>Invoiced qty</th><th className={thR}>GRN accepted</th><th className={thR}>Invoice price</th><th className={thR}>PO price</th><th className={th}>Match</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {view.lines.map((l) => {
                    const bad = v.filter((x) => x.code === l.code);
                    return (
                      <tr key={l.code}>
                        <td className={td}>{materialByCode(l.code)?.name}</td>
                        <td className={tdR}>{num(l.qty)}</td><td className={tdR}>{num(l.grnAccepted)}</td>
                        <td className={tdR}>{inr(l.price)}</td><td className={tdR}>{inr(l.poPrice)}</td>
                        <td className={td}>{bad.length ? <Badge tone="amber">{bad.map((b) => b.kind).join(" + ")} variance</Badge> : <Badge tone="green">Matched</Badge>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
              {v.length > 0 && <Notice tone="amber" title="Resolve before approval"><ul className="list-disc pl-5">{v.map((x) => <li key={x.text}>{x.text}</li>)}</ul></Notice>}
              <Card title="GST">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500">Taxable value</dt><dd>{inr(g.base)}</dd></div>
                  {g.inter ? (
                    <div className="flex justify-between"><dt className="text-slate-500">IGST</dt><dd>{inr(g.tax)}</dd></div>
                  ) : (
                    <>
                      <div className="flex justify-between"><dt className="text-slate-500">CGST</dt><dd>{inr(g.tax / 2)}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">SGST</dt><dd>{inr(g.tax / 2)}</dd></div>
                    </>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 font-semibold"><dt>Invoice total</dt><dd>{inr(Math.round(g.total))}</dd></div>
                </dl>
              </Card>
              <div className="flex justify-end gap-2">
                {v.length > 0 && view.status !== "Approved" && <Button>Request credit note</Button>}
                <Button variant="primary" disabled={v.length > 0 || view.status === "Approved" || view.status === "Paid"}
                  onClick={() => { setInvoices(invoices.map((i) => (i.id === view.id ? { ...i, status: "Approved" } : i))); setView({ ...view, status: "Approved" }); }}>
                  Approve for payment
                </Button>
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* Entry */}
      <Drawer open={adding} onClose={() => setAdding(false)} title="Record supplier invoice" wide>
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Supplier" required>
              <select className={inputCls} value={sup} onChange={(e) => { setSup(e.target.value); setQtys({}); setPrices({}); }}>
                <option value="">Select supplier</option>
                {SUPPLIER_OPTIONS.filter((s) => OPEN_GRN[s.code]).map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Supplier invoice no." required><input className={inputCls} value={invNo} onChange={(e) => setInvNo(e.target.value)} /></Field>
            <Field label="Invoice date"><input type="date" className={inputCls} value={invDate} onChange={(e) => setInvDate(e.target.value)} /></Field>
          </div>
          {duplicate && <Notice tone="red" title="Possible duplicate">This supplier already has invoice {duplicate.no} recorded as {duplicate.id}.</Notice>}

          {sup && (
            <Card title="Invoiced lines (from received goods)" flush>
              <TableWrap>
                <thead className="bg-slate-50"><tr>
                  <th className={th}>Material</th><th className={thR}>GRN accepted</th><th className={thR}>PO price</th><th className={th + " w-32"}>Invoiced qty</th><th className={th + " w-32"}>Invoice price</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {available.map((l) => (
                    <tr key={l.code}>
                      <td className={td}>{materialByCode(l.code)?.name}</td>
                      <td className={tdR}>{num(l.grnAccepted)}</td><td className={tdR}>{inr(l.poPrice)}</td>
                      <td className={td}><input type="number" min={0} className={inputCls} value={qtys[l.code] ?? ""} aria-label="Invoiced quantity" onChange={(e) => setQtys({ ...qtys, [l.code]: e.target.value })} /></td>
                      <td className={td}><input type="number" min={0} className={inputCls} placeholder={String(l.poPrice)} value={prices[l.code] ?? ""} aria-label="Invoice price" onChange={(e) => setPrices({ ...prices, [l.code]: e.target.value })} /></td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </Card>
          )}

          {draftVariances.length > 0 && <Notice tone="amber" title="Match preview"><ul className="list-disc pl-5">{draftVariances.map((x) => <li key={x.text}>{x.text}</li>)}</ul></Notice>}
          {touched && errors.length > 0 && <Notice tone="red"><ul className="list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul></Notice>}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button onClick={() => setAdding(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>Save invoice</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}