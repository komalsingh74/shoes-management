"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  BUSINESS_DATE, Badge, Button, Card, Drawer, Field, Kpi, Notice, PageHeader, TableWrap, Tone,
  diffDays, fmtDate, inputCls, inr, td, tdR, th, thR,
} from "@/components/procurement/ui";
import { supplierByCode } from "@/components/procurement/mock";

interface Payable { id: string; supplier: string; invoiceNo: string; due: string; amount: number; paid: number }
type PayStatus = "Scheduled" | "Processed" | "Failed";
interface Payment { no: string; date: string; supplier: string; method: string; amount: number; tds: number; invoices: string[]; status: PayStatus }

const PAYABLES: Payable[] = [
  { id: "INV-0030", supplier: "SUP-0005", invoiceNo: "MPP-8841", due: "2026-11-01", amount: 16800, paid: 0 },
  { id: "INV-0029", supplier: "SUP-0001", invoiceNo: "BSL-2209", due: "2026-10-10", amount: 283200, paid: 100000 },
  { id: "INV-0027", supplier: "SUP-0003", invoiceNo: "KRC-1180", due: "2026-10-16", amount: 142500, paid: 0 },
  { id: "INV-0025", supplier: "SUP-0002", invoiceNo: "ALW/26/0388", due: "2026-10-25", amount: 224200, paid: 0 },
];
const PAYMENTS_SEED: Payment[] = [
  { no: "PAY-2026-0056", date: "2026-10-05", supplier: "SUP-0001", method: "NEFT", amount: 100000, tds: 0, invoices: ["INV-0029"], status: "Processed" },
  { no: "PAY-2026-0055", date: "2026-09-30", supplier: "SUP-0004", method: "RTGS", amount: 96400, tds: 0, invoices: ["INV-0020"], status: "Processed" },
];

const STATUS_TONE: Record<PayStatus, Tone> = { Scheduled: "amber", Processed: "green", Failed: "red" };
const METHODS = ["NEFT", "RTGS", "UPI", "Cheque"];

const outstanding = (p: Payable) => p.amount - p.paid;

export default function SupplierPaymentsPage() {
  const [payables, setPayables] = useState<Payable[]>(PAYABLES);
  const [payments, setPayments] = useState<Payment[]>(PAYMENTS_SEED);
  const [selected, setSelected] = useState<Record<string, string>>({}); // invoice id -> amount to pay
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("NEFT");
  const [date, setDate] = useState(BUSINESS_DATE);
  const [tdsPct, setTdsPct] = useState("0");
  const [toast, setToast] = useState("");

  const overdue = payables.filter((p) => p.due < BUSINESS_DATE && outstanding(p) > 0);
  const dueWeek = payables.filter((p) => p.due >= BUSINESS_DATE && diffDays(BUSINESS_DATE, p.due) <= 7 && outstanding(p) > 0);
  const totalOut = payables.reduce((s, p) => s + outstanding(p), 0);

  const aging = useMemo(() => {
    const b = { "Not due": 0, "1–30 days late": 0, "31–60 days late": 0, "60+ days late": 0 };
    payables.forEach((p) => {
      const late = diffDays(p.due, BUSINESS_DATE);
      const o = outstanding(p);
      if (late <= 0) b["Not due"] += o;
      else if (late <= 30) b["1–30 days late"] += o;
      else if (late <= 60) b["31–60 days late"] += o;
      else b["60+ days late"] += o;
    });
    return b;
  }, [payables]);

  const chosen = payables.filter((p) => selected[p.id] !== undefined);
  const suppliers = new Set(chosen.map((p) => p.supplier));
  const gross = chosen.reduce((s, p) => s + (Number(selected[p.id]) || 0), 0);
  const tds = Math.round(gross * ((Number(tdsPct) || 0) / 100));

  const errors: string[] = [];
  if (chosen.length === 0) errors.push("Select at least one approved invoice.");
  if (suppliers.size > 1) errors.push("A payment goes to one supplier. Select invoices from a single supplier.");
  chosen.forEach((p) => {
    const a = Number(selected[p.id]) || 0;
    if (a <= 0) errors.push(`${p.invoiceNo}: enter an amount above zero.`);
    if (a > outstanding(p)) errors.push(`${p.invoiceNo}: amount exceeds the outstanding ${inr(outstanding(p))}.`);
  });
  if (date < BUSINESS_DATE) errors.push("Payment date cannot be in the past.");

  function toggle(p: Payable) {
    const next = { ...selected };
    if (next[p.id] !== undefined) delete next[p.id];
    else next[p.id] = String(outstanding(p));
    setSelected(next);
  }

  function schedule() {
    if (errors.length) return;
    const no = `PAY-2026-${String(57 + payments.filter((x) => x.no > "PAY-2026-0056").length).padStart(4, "0")}`;
    const supplier = chosen[0].supplier;
    setPayments([{ no, date, supplier, method, amount: gross - tds, tds, invoices: chosen.map((c) => c.id), status: "Scheduled" }, ...payments]);
    setPayables(payables.map((p) => (selected[p.id] !== undefined ? { ...p, paid: p.paid + Number(selected[p.id]) } : p)));
    setToast(`${no} scheduled for ${supplierByCode(supplier)?.name}: ${inr(gross - tds)} net.`);
    setSelected({}); setOpen(false); setTdsPct("0");
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader title="Supplier Payments" subtitle="Pay approved invoices on or before their due dates. Only invoices that passed matching appear here."
        actions={<Button variant="primary" disabled={chosen.length === 0} onClick={() => setOpen(true)}><Plus size={16} /> Create payment ({chosen.length})</Button>} />
      {toast && <div className="mb-4"><Notice tone="green">{toast}</Notice></div>}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Total outstanding" value={inr(totalOut)} />
        <Kpi label="Overdue" value={inr(overdue.reduce((s, p) => s + outstanding(p), 0))} hint={`${overdue.length} invoice(s)`} tone="alert" />
        <Kpi label="Due in 7 days" value={inr(dueWeek.reduce((s, p) => s + outstanding(p), 0))} hint={`${dueWeek.length} invoice(s)`} />
        <Kpi label="Paid this month" value={inr(payments.filter((p) => p.status === "Processed").reduce((s, p) => s + p.amount, 0))} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card title="Payables" flush>
          <TableWrap>
            <thead className="bg-slate-50"><tr>
              <th className={th} /><th className={th}>Invoice</th><th className={th}>Supplier</th><th className={th}>Due</th><th className={thR}>Amount</th><th className={thR}>Paid</th><th className={thR}>Outstanding</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {payables.map((p) => {
                const o = outstanding(p);
                const late = diffDays(p.due, BUSINESS_DATE);
                return (
                  <tr key={p.id} className={o === 0 ? "opacity-50" : ""}>
                    <td className={td}><input type="checkbox" disabled={o === 0} checked={selected[p.id] !== undefined} onChange={() => toggle(p)} aria-label={`Select ${p.invoiceNo}`} /></td>
                    <td className={td}>{p.invoiceNo}<div className="text-xs text-slate-500">{p.id}</div></td>
                    <td className={td}>{supplierByCode(p.supplier)?.name}</td>
                    <td className={td}>{fmtDate(p.due)}{late > 0 && o > 0 && <div className="text-xs font-medium text-red-600">{late} days late</div>}</td>
                    <td className={tdR}>{inr(p.amount)}</td><td className={tdR}>{inr(p.paid)}</td><td className={tdR + " font-medium"}>{inr(o)}</td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        </Card>

        <Card title="Ageing of outstanding">
          <ul className="space-y-3 text-sm">
            {Object.entries(aging).map(([k, v]) => (
              <li key={k}>
                <div className="flex justify-between"><span className="text-slate-600">{k}</span><span className="tabular-nums">{inr(v)}</span></div>
                <div className="mt-1 h-1.5 rounded bg-slate-100"><div className={`h-1.5 rounded ${k === "Not due" ? "bg-indigo-500" : "bg-red-400"}`} style={{ width: `${totalOut ? (v / totalOut) * 100 : 0}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Payment history" className="mt-5" flush>
        <TableWrap>
          <thead className="bg-slate-50"><tr>
            <th className={th}>Payment</th><th className={th}>Date</th><th className={th}>Supplier</th><th className={th}>Method</th><th className={th}>Invoices</th><th className={thR}>TDS</th><th className={thR}>Net paid</th><th className={th}>Status</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.no}>
                <td className={td + " font-medium text-slate-900"}>{p.no}</td><td className={td}>{fmtDate(p.date)}</td>
                <td className={td}>{supplierByCode(p.supplier)?.name ?? p.supplier}</td><td className={td}>{p.method}</td><td className={td}>{p.invoices.join(", ")}</td>
                <td className={tdR}>{inr(p.tds)}</td><td className={tdR}>{inr(p.amount)}</td><td className={td}><Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <Drawer open={open} onClose={() => setOpen(false)} title="Create payment" subtitle={suppliers.size === 1 ? supplierByCode([...suppliers][0])?.name : undefined}>
        <div className="space-y-4">
          <TableWrap>
            <thead className="bg-slate-50"><tr><th className={th}>Invoice</th><th className={th + " w-40"}>Pay now</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {chosen.map((p) => (
                <tr key={p.id}>
                  <td className={td}>{p.invoiceNo}<div className="text-xs text-slate-500">Outstanding {inr(outstanding(p))}</div></td>
                  <td className={td}><input type="number" min={0} className={inputCls} value={selected[p.id]} aria-label={`Amount for ${p.invoiceNo}`} onChange={(e) => setSelected({ ...selected, [p.id]: e.target.value })} /></td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Method"><select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field label="Payment date"><input type="date" className={inputCls} value={date} min={BUSINESS_DATE} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="TDS %" hint="Apply only where TDS is deductible for this supplier."><input type="number" min={0} className={inputCls} value={tdsPct} onChange={(e) => setTdsPct(e.target.value)} /></Field>
          </div>
          <dl className="space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Invoice amount</dt><dd>{inr(gross)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">TDS</dt><dd>− {inr(tds)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Net payment</dt><dd>{inr(gross - tds)}</dd></div>
          </dl>
          {errors.length > 0 && <Notice tone="amber"><ul className="list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul></Notice>}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={errors.length > 0} onClick={schedule}>Schedule payment</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}