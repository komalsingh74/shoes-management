"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Badge, Button, Card, Kpi, PageHeader, TableWrap, Tabs, inputCls, inr, num, td, tdR, th, thR } from "@/components/procurement/ui";

// Illustrative data. Replace with report endpoints filtered by the selected period.
const MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const SPEND_BY_MONTH = [1240000, 1385000, 1190000, 1520000, 1610000, 1475000];

interface SupplierRow {
  name: string; spend: number; pos: number; onTime: number | null; accepted: number | null; avgLead: number | null;
}
const SUPPLIERS: SupplierRow[] = [
  { name: "Best Soles Ltd.", spend: 2860000, pos: 14, onTime: 94, accepted: 98.2, avgLead: 5 },
  { name: "Agra Leather Works", spend: 2310000, pos: 9, onTime: 81, accepted: 96.5, avgLead: 9 },
  { name: "Kanpur Rubber Co.", spend: 1520000, pos: 7, onTime: 88, accepted: 97.1, avgLead: 8 },
  { name: "Mumbai Pack & Print", spend: 640000, pos: 11, onTime: 97, accepted: 99.4, avgLead: 6 },
  { name: "Chennai Foam Industries", spend: 210000, pos: 2, onTime: null, accepted: null, avgLead: null },
];

const CATEGORY_SPEND = [
  { name: "Soles", v: 3100000 }, { name: "Leather", v: 2310000 }, { name: "Packaging", v: 640000 },
  { name: "Insoles", v: 560000 }, { name: "Textile", v: 380000 }, { name: "Adhesive", v: 220000 },
];

const OPEN_PO_AGING = [
  { bucket: "Not yet due", count: 6 }, { bucket: "1–7 days late", count: 3 }, { bucket: "8–14 days late", count: 1 }, { bucket: "15+ days late", count: 1 },
];

const REPORTS = ["Spend analysis", "Supplier performance", "Open PO ageing"] as const;
const PERIODS = ["Last 6 months", "This quarter", "This financial year"] as const;

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function PurchaseReportsPage() {
  const [report, setReport] = useState<(typeof REPORTS)[number]>("Spend analysis");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Last 6 months");

  const totalSpend = SPEND_BY_MONTH.reduce((s, v) => s + v, 0);
  const maxMonth = Math.max(...SPEND_BY_MONTH);
  const maxSup = Math.max(...SUPPLIERS.map((s) => s.spend));
  const maxCat = Math.max(...CATEGORY_SPEND.map((c) => c.v));
  const totalPOs = SUPPLIERS.reduce((s, r) => s + r.pos, 0);
  const rated = SUPPLIERS.filter((s) => s.onTime !== null);
  const avgOnTime = useMemo(() => rated.reduce((s, r) => s + (r.onTime ?? 0), 0) / rated.length, [rated]);
  const topShare = (SUPPLIERS[0].spend / SUPPLIERS.reduce((s, r) => s + r.spend, 0)) * 100;

  function exportCurrent() {
    if (report === "Spend analysis") downloadCsv("spend-by-supplier.csv", [["Supplier", "Spend (INR)", "POs"], ...SUPPLIERS.map((s) => [s.name, s.spend, s.pos])]);
    else if (report === "Supplier performance")
      downloadCsv("supplier-performance.csv", [["Supplier", "On-time %", "Accepted %", "Avg lead days"], ...SUPPLIERS.map((s) => [s.name, s.onTime ?? "Insufficient history", s.accepted ?? "Insufficient history", s.avgLead ?? "Insufficient history"])]);
    else downloadCsv("open-po-ageing.csv", [["Bucket", "Open POs"], ...OPEN_PO_AGING.map((b) => [b.bucket, b.count])]);
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader title="Purchase Reports" subtitle="Spend, supplier performance and delivery ageing from recorded POs, receipts and invoices."
        actions={
          <>
            <select className={inputCls + " w-48"} value={period} onChange={(e) => setPeriod(e.target.value as (typeof PERIODS)[number])} aria-label="Reporting period">
              {PERIODS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <Button onClick={exportCurrent}><Download size={16} /> Export CSV</Button>
          </>
        } />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Total spend" value={inr(totalSpend)} hint={period} />
        <Kpi label="Purchase orders" value={totalPOs} />
        <Kpi label="Avg on-time delivery" value={`${avgOnTime.toFixed(0)}%`} hint="Suppliers with history only" />
        <Kpi label="Top supplier share" value={`${topShare.toFixed(0)}%`} hint="Concentration of spend" />
      </div>

      <Tabs tabs={REPORTS} value={report} onChange={setReport} />

      {report === "Spend analysis" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card title="Monthly spend">
            <div className="flex h-48 items-end gap-3" role="img" aria-label="Monthly spend bar chart">
              {SPEND_BY_MONTH.map((v, i) => (
                <div key={MONTHS[i]} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs tabular-nums text-slate-500">{(v / 100000).toFixed(1)}L</span>
                  <div className="w-full rounded-t bg-indigo-500" style={{ height: `${(v / maxMonth) * 140}px` }} />
                  <span className="text-xs text-slate-600">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Spend by material category">
            <ul className="space-y-3">
              {CATEGORY_SPEND.map((c) => (
                <li key={c.name}>
                  <div className="flex justify-between text-sm"><span>{c.name}</span><span className="tabular-nums text-slate-600">{inr(c.v)}</span></div>
                  <div className="mt-1 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-indigo-500" style={{ width: `${(c.v / maxCat) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Spend by supplier" className="lg:col-span-2" flush>
            <TableWrap>
              <thead className="bg-slate-50"><tr><th className={th}>Supplier</th><th className={thR}>POs</th><th className={thR}>Spend</th><th className={th + " w-1/3"}>Share</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {SUPPLIERS.map((s) => (
                  <tr key={s.name}>
                    <td className={td}>{s.name}</td><td className={tdR}>{num(s.pos)}</td><td className={tdR}>{inr(s.spend)}</td>
                    <td className={td}><div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-indigo-500" style={{ width: `${(s.spend / maxSup) * 100}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Card>
        </div>
      )}

      {report === "Supplier performance" && (
        <Card className="mt-5" flush>
          <TableWrap>
            <thead className="bg-slate-50"><tr>
              <th className={th}>Supplier</th><th className={thR}>On-time delivery</th><th className={thR}>Accepted quality</th><th className={thR}>Avg lead time</th><th className={th}>Rating</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {SUPPLIERS.map((s) => (
                <tr key={s.name}>
                  <td className={td}>{s.name}</td>
                  {s.onTime === null ? (
                    <td colSpan={3} className={td + " text-center text-xs text-slate-400"}>Insufficient history</td>
                  ) : (
                    <>
                      <td className={tdR}>{s.onTime}%</td><td className={tdR}>{s.accepted}%</td><td className={tdR}>{s.avgLead} days</td>
                    </>
                  )}
                  <td className={td}>
                    {s.onTime === null ? <Badge>Not rated</Badge> : s.onTime >= 90 && (s.accepted ?? 0) >= 98 ? <Badge tone="green">Strong</Badge> : s.onTime >= 85 ? <Badge tone="blue">Acceptable</Badge> : <Badge tone="amber">Watch</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Scores come from posted GRNs and inspection results within the selected period. Suppliers without enough transactions are not scored.</p>
        </Card>
      )}

      {report === "Open PO ageing" && (
        <Card title="Open POs by delivery lateness" className="mt-5">
          <ul className="space-y-3">
            {OPEN_PO_AGING.map((b) => (
              <li key={b.bucket}>
                <div className="flex justify-between text-sm"><span>{b.bucket}</span><span className="tabular-nums">{b.count} POs</span></div>
                <div className="mt-1 h-2 rounded bg-slate-100"><div className={`h-2 rounded ${b.bucket === "Not yet due" ? "bg-indigo-500" : "bg-red-400"}`} style={{ width: `${(b.count / 6) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}