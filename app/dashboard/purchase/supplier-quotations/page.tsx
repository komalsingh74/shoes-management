"use client";

import { useMemo, useState } from "react";
import {
  BUSINESS_DATE, Badge, Button, Card, Field, Kpi, Notice, PageHeader, TableWrap, Tabs, Tone,
  addDays, diffDays, fmtDate, inputCls, inr, num, td, tdR, th, thR,
} from "@/components/procurement/ui";

/* ---------- RFQ register ---------- */

type RFQStatus = "Draft" | "Issued" | "Responses pending" | "Under evaluation" | "Award pending" | "Awarded" | "Closed";
interface RFQ {
  no: string; pr: string; material: string; required: string; invited: number; received: number;
  deadline: string; lowest: number | null; status: RFQStatus;
}
const RFQ_TONE: Record<RFQStatus, Tone> = {
  Draft: "gray", Issued: "blue", "Responses pending": "amber", "Under evaluation": "violet",
  "Award pending": "amber", Awarded: "green", Closed: "gray",
};
const RFQS: RFQ[] = [
  { no: "RFQ-2026-00024", pr: "PR-2026-00048", material: "Rubber sole — Black", required: "2026-10-20", invited: 3, received: 3, deadline: "2026-10-11", lowest: 115, status: "Under evaluation" },
  { no: "RFQ-2026-00025", pr: "PR-2026-00046", material: "Packaging insert", required: "2026-10-15", invited: 5, received: 2, deadline: "2026-10-14", lowest: 2.9, status: "Responses pending" },
  { no: "RFQ-2026-00023", pr: "PR-2026-00047", material: "Lining fabric", required: "2026-10-18", invited: 4, received: 4, deadline: "2026-10-06", lowest: 61, status: "Awarded" },
  { no: "RFQ-2026-00026", pr: "—", material: "PU adhesive", required: "2026-10-30", invited: 0, received: 0, deadline: "2026-10-20", lowest: null, status: "Draft" },
];

/* ---------- comparison data (illustrative, matches RFQ-2026-00024) ---------- */

const REQUIRED_QTY = 3700;
const REQUIRED_DATE = "2026-10-20";

interface Quote {
  id: string; supplier: string; price: number; qty: number; discPct: number; freight: number;
  leadDays: number; terms: string; validDays: number; specOk: boolean; sample: string;
  accepted: number | null; onTime: number | null;
}
const QUOTES: Quote[] = [
  { id: "A", supplier: "Kanpur Rubber Co.", price: 115, qty: 3700, discPct: 0, freight: 6000, leadDays: 12, terms: "30 days", validDays: 15, specOk: true, sample: "Approved", accepted: 97.1, onTime: 88 },
  { id: "B", supplier: "Best Soles Ltd.", price: 120, qty: 3700, discPct: 0, freight: 3000, leadDays: 5, terms: "15 days", validDays: 20, specOk: true, sample: "Approved", accepted: 98.2, onTime: 94 },
  { id: "C", supplier: "Agra Sole Industries", price: 118, qty: 3700, discPct: 0, freight: 4000, leadDays: 8, terms: "30 days", validDays: 10, specOk: true, sample: "Pending", accepted: null, onTime: null },
];

type Risk = "On time" | "At risk" | "Late";
function deliveryRisk(leadDays: number): { risk: Risk; date: string; buffer: number } {
  const date = addDays(BUSINESS_DATE, leadDays);
  const buffer = diffDays(date, REQUIRED_DATE);
  return { date, buffer, risk: buffer < 0 ? "Late" : buffer < 2 ? "At risk" : "On time" };
}
const RISK_TONE: Record<Risk, Tone> = { "On time": "green", "At risk": "amber", Late: "red" };

type Strategy = "Single supplier" | "Split award";

export default function QuotationsPage() {
  const [tab, setTab] = useState<"RFQ register" | "Comparison" | "Award">("RFQ register");
  const [sortByCost, setSortByCost] = useState(true);
  const [onlyCompliant, setOnlyCompliant] = useState(false);

  const rows = useMemo(() => {
    const calc = QUOTES.map((q) => {
      const gross = q.qty * q.price;
      const disc = gross * (q.discPct / 100);
      const total = gross - disc + q.freight;
      return { ...q, total, perPair: total / q.qty, ...deliveryRisk(q.leadDays) };
    });
    const list = onlyCompliant ? calc.filter((c) => c.specOk && c.sample === "Approved") : calc;
    return sortByCost ? [...list].sort((a, b) => a.total - b.total) : list;
  }, [sortByCost, onlyCompliant]);

  // Eligibility = spec compliant, full quantity, not late, sample approved.
  const eligible = rows.filter((r) => r.specOk && r.qty >= REQUIRED_QTY && r.risk !== "Late" && r.sample === "Approved");
  const lowestValid = eligible.length ? Math.min(...eligible.map((r) => r.total)) : null;
  const lowestAny = Math.min(...rows.map((r) => r.total));
  const fastest = Math.min(...rows.map((r) => r.leadDays));

  /* award state */
  const [strategy, setStrategy] = useState<Strategy>("Single supplier");
  const [single, setSingle] = useState("");
  const [split, setSplit] = useState<Record<string, string>>({ A: "", B: "", C: "" });
  const [justification, setJustification] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const splitTotal = Object.values(split).reduce((s, v) => s + (Number(v) || 0), 0);
  const chosen = strategy === "Single supplier" ? (single ? [single] : []) : Object.keys(split).filter((k) => Number(split[k]) > 0);
  const chosenRows = QUOTES.filter((q) => chosen.includes(q.id));
  const picksNonLowest = lowestValid !== null && chosen.some((id) => {
    const r = rows.find((x) => x.id === id);
    return r ? r.total > lowestValid : false;
  });
  const lateChosen = chosen.some((id) => deliveryRisk(QUOTES.find((q) => q.id === id)!.leadDays).risk === "Late");
  const unapprovedChosen = chosenRows.some((q) => q.sample !== "Approved");

  const awardErrors: string[] = [];
  if (chosen.length === 0) awardErrors.push("Select a supplier, or enter split quantities.");
  if (strategy === "Split award" && splitTotal > REQUIRED_QTY) awardErrors.push(`Split quantities total ${num(splitTotal)}, which exceeds the approved ${num(REQUIRED_QTY)} pairs.`);
  if (strategy === "Split award" && splitTotal > 0 && splitTotal < REQUIRED_QTY) awardErrors.push(`${num(REQUIRED_QTY - splitTotal)} pairs are still unallocated.`);
  if (lateChosen) awardErrors.push("A selected supplier cannot deliver by the required date. This needs a controlled exception.");
  if (unapprovedChosen) awardErrors.push("A selected supplier's sample is not approved yet.");
  if (picksNonLowest && justification.trim().length < 10) awardErrors.push("Add a justification for not selecting the lowest valid offer.");

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Supplier Quotations & Comparison"
        subtitle="Collect supplier offers, compare them on a common basis, and record an approved award. Highlights show information only — nothing is awarded automatically."
        actions={<><Button>Add quotation</Button><Button variant="primary">Create RFQ</Button></>}
      />
      <Tabs tabs={["RFQ register", "Comparison", "Award"] as const} value={tab} onChange={setTab} />

      {/* ---------------- Register ---------------- */}
      {tab === "RFQ register" && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            <Kpi label="Open RFQs" value={RFQS.filter((r) => ["Issued", "Responses pending"].includes(r.status)).length} />
            <Kpi label="Awaiting quotations" value={RFQS.filter((r) => r.received < r.invited).length} />
            <Kpi label="Ready for comparison" value={RFQS.filter((r) => r.status === "Under evaluation").length} />
            <Kpi label="Pending award approval" value={RFQS.filter((r) => r.status === "Award pending").length} />
            <Kpi label="Awarded" value={RFQS.filter((r) => r.status === "Awarded").length} />
            <Kpi label="Expiring quotations" value={1} hint="Within 3 days" />
          </div>
          <Card flush>
            <TableWrap>
              <thead className="bg-slate-50"><tr>
                <th className={th}>RFQ</th><th className={th}>Source PR</th><th className={th}>Material</th><th className={th}>Required</th>
                <th className={th}>Responses</th><th className={th}>Deadline</th><th className={thR}>Lowest valid offer</th><th className={th}>Status</th><th className={th} />
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {RFQS.map((r) => (
                  <tr key={r.no} className="hover:bg-slate-50">
                    <td className={td + " font-medium text-slate-900"}>{r.no}</td>
                    <td className={td}>{r.pr}</td>
                    <td className={td}>{r.material}</td>
                    <td className={td}>{fmtDate(r.required)}</td>
                    <td className={td}>
                      <span className={r.received < r.invited ? "font-medium text-amber-700" : ""}>{r.received} of {r.invited}</span>
                    </td>
                    <td className={td}>{fmtDate(r.deadline)}</td>
                    <td className={tdR}>{r.lowest === null ? "—" : `${inr(r.lowest)} / unit`}</td>
                    <td className={td}><Badge tone={RFQ_TONE[r.status]}>{r.status}</Badge></td>
                    <td className={td}>
                      {r.status === "Under evaluation" && <Button onClick={() => setTab("Comparison")}>Compare</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Card>
        </div>
      )}

      {/* ---------------- Comparison ---------------- */}
      {tab === "Comparison" && (
        <div className="mt-5 space-y-5">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">RFQ-2026-00024 · Rubber sole — Black</div>
                <div className="text-sm text-slate-500">{num(REQUIRED_QTY)} pairs · needed at factory by {fmtDate(REQUIRED_DATE)} · source PR-2026-00048</div>
              </div>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={sortByCost} onChange={(e) => setSortByCost(e.target.checked)} /> Sort by comparable cost</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={onlyCompliant} onChange={(e) => setOnlyCompliant(e.target.checked)} /> Technically approved only</label>
              </div>
            </div>
          </Card>

          <Notice tone="amber" title="Estimate, not landed cost">
            Totals use quantity × unit price − discount + freight. Taxes, input-tax credit, insurance, packaging and duties follow your costing rules and are not included.
          </Notice>

          <Card flush>
            <TableWrap>
              <thead className="bg-slate-50"><tr>
                <th className={th}>Criterion</th>
                {rows.map((r) => <th key={r.id} className={th}>Supplier {r.id} · {r.supplier}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                <Row label="Unit price" cells={rows.map((r) => inr(r.price))} />
                <Row label="Quantity offered" cells={rows.map((r) => <span key={r.id} className={r.qty < REQUIRED_QTY ? "text-red-600" : ""}>{num(r.qty)}</span>)} />
                <Row label="Freight" cells={rows.map((r) => inr(r.freight))} />
                <Row label="Estimated total (pre-tax)" strong cells={rows.map((r) => (
                  <div key={r.id}>
                    <div className="font-semibold text-slate-900">{inr(r.total)}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.total === lowestAny && <Badge tone="blue">Lowest cost</Badge>}
                      {lowestValid !== null && r.total === lowestValid && <Badge tone="green">Lowest valid</Badge>}
                    </div>
                  </div>
                ))} />
                <Row label="Cost per pair" cells={rows.map((r) => inr(Number(r.perPair.toFixed(2))))} />
                <Row label="Promised arrival" cells={rows.map((r) => (
                  <div key={r.id}>{fmtDate(r.date)}<div className="text-xs text-slate-500">{r.leadDays} days{r.leadDays === fastest ? " · fastest" : ""}</div></div>
                ))} />
                <Row label="Delivery risk" cells={rows.map((r) => (
                  <div key={r.id}>
                    <Badge tone={RISK_TONE[r.risk]}>{r.risk}</Badge>
                    <div className="mt-1 text-xs text-slate-500">{r.buffer >= 0 ? `${r.buffer} day buffer` : `${-r.buffer} days after required date`}</div>
                  </div>
                ))} />
                <Row label="Payment terms" cells={rows.map((r) => r.terms)} />
                <Row label="Quote valid until" cells={rows.map((r) => fmtDate(addDays(BUSINESS_DATE, r.validDays)))} />
                <Row label="Specification" cells={rows.map((r) => <Badge key={r.id} tone={r.specOk ? "green" : "red"}>{r.specOk ? "Compliant" : "Non-compliant"}</Badge>)} />
                <Row label="Sample approval" cells={rows.map((r) => <Badge key={r.id} tone={r.sample === "Approved" ? "green" : "amber"}>{r.sample}</Badge>)} />
                <Row label="Accepted quality rate" cells={rows.map((r) => r.accepted === null ? <span key={r.id} className="text-xs text-slate-400">Insufficient history</span> : `${r.accepted}%`)} />
                <Row label="On-time delivery" cells={rows.map((r) => r.onTime === null ? <span key={r.id} className="text-xs text-slate-400">Insufficient history</span> : `${r.onTime}%`)} />
              </tbody>
            </TableWrap>
          </Card>

          <div className="flex justify-end gap-2">
            <Button>Export comparison</Button>
            <Button variant="primary" onClick={() => setTab("Award")}>Record recommendation</Button>
          </div>
        </div>
      )}

      {/* ---------------- Award ---------------- */}
      {tab === "Award" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {submitted ? (
              <Notice tone="green" title="Award sent for approval">
                Recommendation saved against RFQ-2026-00024. PO drafts can be created once an authorized approver approves it.
              </Notice>
            ) : (
              <>
                <Card title="Award strategy">
                  <div className="flex gap-2">
                    {(["Single supplier", "Split award"] as Strategy[]).map((s) => (
                      <button key={s} onClick={() => setStrategy(s)} aria-pressed={strategy === s}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium ${strategy === s ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-300 text-slate-600"}`}>{s}</button>
                    ))}
                  </div>
                </Card>

                <Card title={strategy === "Single supplier" ? "Choose supplier" : `Allocate quantity (${num(splitTotal)} of ${num(REQUIRED_QTY)} pairs)`} flush>
                  <TableWrap>
                    <thead className="bg-slate-50"><tr>
                      <th className={th}>Supplier</th><th className={thR}>Estimated total</th><th className={th}>Delivery</th>
                      <th className={th + " w-40"}>{strategy === "Single supplier" ? "Select" : "Pairs"}</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {QUOTES.map((q) => {
                        const r = rows.find((x) => x.id === q.id);
                        const risk = deliveryRisk(q.leadDays).risk;
                        return (
                          <tr key={q.id}>
                            <td className={td}>Supplier {q.id} · {q.supplier}</td>
                            <td className={tdR}>{r ? inr(r.total) : "—"}</td>
                            <td className={td}><Badge tone={RISK_TONE[risk]}>{risk}</Badge></td>
                            <td className={td}>
                              {strategy === "Single supplier" ? (
                                <input type="radio" name="award" checked={single === q.id} onChange={() => setSingle(q.id)} aria-label={`Select supplier ${q.id}`} />
                              ) : (
                                <input type="number" min={0} className={inputCls} value={split[q.id]} aria-label={`Pairs for supplier ${q.id}`}
                                  onChange={(e) => setSplit({ ...split, [q.id]: e.target.value })} />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </TableWrap>
                </Card>

                <Card title="Justification">
                  <Field label="Why this supplier?" required={picksNonLowest} hint={picksNonLowest ? "Required: the selection is not the lowest valid offer. Mention delivery urgency, quality history, capacity or total cost." : "Optional when the lowest valid offer is selected."}>
                    <textarea className={inputCls} rows={3} value={justification} onChange={(e) => setJustification(e.target.value)} />
                  </Field>
                </Card>

                {awardErrors.length > 0 && (
                  <Notice tone="amber" title="Before you submit">
                    <ul className="list-disc pl-5">{awardErrors.map((e) => <li key={e}>{e}</li>)}</ul>
                  </Notice>
                )}
                <div className="flex justify-end gap-2">
                  <Button>Save draft</Button>
                  <Button variant="primary" disabled={awardErrors.length > 0} onClick={() => setSubmitted(true)}>Submit for approval</Button>
                </div>
              </>
            )}
          </div>

          <Card title="Award checklist">
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Technical and sample approval checked</li>
              <li>Delivery compared per line with required date</li>
              <li>Costs compared on the same quantity basis</li>
              <li>Total awarded quantity ≤ approved PR quantity</li>
              <li>Original quotes and negotiation notes preserved</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, cells, strong }: { label: string; cells: React.ReactNode[]; strong?: boolean }) {
  return (
    <tr className={strong ? "bg-slate-50/60" : ""}>
      <td className={td + " font-medium text-slate-600"}>{label}</td>
      {cells.map((c, i) => <td key={i} className={td}>{c}</td>)}
    </tr>
  );
}