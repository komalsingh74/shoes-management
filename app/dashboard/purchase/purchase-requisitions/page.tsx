"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  BUSINESS_DATE, Badge, Button, Card, DL, Drawer, Field, Kpi, Notice, PageHeader, TableWrap, Tone,
  fmtDate, inputCls, num, td, tdR, th, thR,
} from "@/components/procurement/ui";
import { MATERIALS, materialByCode } from "@/components/procurement/mock";

type PRStatus = "Draft" | "Pending approval" | "Approved" | "Partially ordered" | "Ordered" | "Rejected" | "Cancelled";
type Priority = "Normal" | "Urgent";

interface PRLine { code: string; qty: number; ordered: number; note: string }
interface PR {
  no: string;
  date: string;
  dept: string;
  requester: string;
  required: string;
  priority: Priority;
  status: PRStatus;
  reason: string;
  lines: PRLine[];
}

const TONE: Record<PRStatus, Tone> = {
  Draft: "gray",
  "Pending approval": "amber",
  Approved: "blue",
  "Partially ordered": "violet",
  Ordered: "green",
  Rejected: "red",
  Cancelled: "gray",
};

const SEED: PR[] = [
  { no: "PR-2026-00048", date: "2026-10-05", dept: "Production – Cutting", requester: "S. Gupta", required: "2026-10-20", priority: "Urgent", status: "Approved", reason: "School shoe batch SS-26-14", lines: [{ code: "RM-SOL-BLK", qty: 3700, ordered: 0, note: "Size-wise split as per BOM" }] },
  { no: "PR-2026-00047", date: "2026-10-04", dept: "Production – Stitching", requester: "A. Khan", required: "2026-10-18", priority: "Normal", status: "Partially ordered", reason: "Leather for SS-26-12", lines: [{ code: "RM-LTH-BLK", qty: 5000, ordered: 5000, note: "" }, { code: "RM-LIN-FAB", qty: 1500, ordered: 0, note: "" }] },
  { no: "PR-2026-00046", date: "2026-10-02", dept: "Packing", requester: "M. Singh", required: "2026-10-15", priority: "Normal", status: "Pending approval", reason: "Monthly packing stock", lines: [{ code: "RM-PKG-INS", qty: 4000, ordered: 0, note: "" }] },
  { no: "PR-2026-00044", date: "2026-09-28", dept: "Production – Assembly", requester: "S. Gupta", required: "2026-10-08", priority: "Urgent", status: "Ordered", reason: "Adhesive for assembly line 2", lines: [{ code: "RM-ADH-PU", qty: 80, ordered: 80, note: "" }] },
];

const DEPARTMENTS = ["Production – Cutting", "Production – Stitching", "Production – Assembly", "Packing", "Maintenance"];

interface DraftLine { code: string; qty: string; note: string }

export default function PurchaseRequisitionsPage() {
  const [prs, setPrs] = useState<PR[]>(SEED);
  const [statusFilter, setStatusFilter] = useState<"All" | PRStatus>("All");
  const [view, setView] = useState<PR | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");

  // create form
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [required, setRequired] = useState("");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ code: MATERIALS[0].code, qty: "", note: "" }]);
  const [touched, setTouched] = useState(false);

  const rows = prs.filter((p) => statusFilter === "All" || p.status === statusFilter);

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!required) e.push("Set the date the material is needed at the factory.");
    else if (required < BUSINESS_DATE) e.push("The required date cannot be in the past.");
    if (!reason.trim()) e.push("Add a short reason, such as the production batch or style.");
    lines.forEach((l, i) => {
      if (!(Number(l.qty) > 0)) e.push(`Line ${i + 1}: enter a quantity greater than zero.`);
    });
    const codes = lines.map((l) => l.code);
    if (new Set(codes).size !== codes.length) e.push("The same material appears on more than one line. Combine them into one line.");
    return e;
  }, [required, reason, lines]);

  function reset() {
    setDept(DEPARTMENTS[0]); setRequired(""); setPriority("Normal"); setReason("");
    setLines([{ code: MATERIALS[0].code, qty: "", note: "" }]); setTouched(false);
  }

  function save(submit: boolean) {
    setTouched(true);
    if (submit && errors.length) return;
    const no = `PR-2026-${String(49 + prs.filter((p) => p.no > "PR-2026-00048").length).padStart(5, "0")}`;
    setPrs([
      {
        no, date: BUSINESS_DATE, dept, requester: "You", required: required || BUSINESS_DATE, priority, reason,
        status: submit ? "Pending approval" : "Draft",
        lines: lines.map((l) => ({ code: l.code, qty: Number(l.qty) || 0, ordered: 0, note: l.note })),
      },
      ...prs,
    ]);
    setToast(submit ? `${no} submitted for approval.` : `${no} saved as draft.`);
    setCreating(false);
    reset();
  }

  const count = (s: PRStatus) => prs.filter((p) => p.status === s).length;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Purchase Requisitions"
        subtitle="Raise and track internal requests for materials. Approved requisitions feed RFQs and purchase orders, and each line tracks how much has already been ordered."
        actions={<Button variant="primary" onClick={() => setCreating(true)}><Plus size={16} /> New requisition</Button>}
      />
      {toast && <div className="mb-4"><Notice tone="green">{toast}</Notice></div>}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Total requisitions" value={prs.length} />
        <Kpi label="Pending approval" value={count("Pending approval")} />
        <Kpi label="Approved, not ordered" value={count("Approved")} hint="Ready for RFQ or PO" />
        <Kpi label="Partially ordered" value={count("Partially ordered")} />
        <Kpi label="Urgent open" value={prs.filter((p) => p.priority === "Urgent" && !["Ordered", "Cancelled", "Rejected"].includes(p.status)).length} tone="alert" />
      </div>

      <Card flush>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <select className={inputCls + " w-48"} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "All" | PRStatus)} aria-label="Filter by status">
            <option value="All">All statuses</option>
            {Object.keys(TONE).map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <TableWrap>
          <thead className="bg-slate-50">
            <tr>
              <th className={th}>PR number</th><th className={th}>Date</th><th className={th}>Department</th>
              <th className={th}>Materials</th><th className={th}>Required by</th><th className={th}>Priority</th><th className={th}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => (
              <tr key={p.no} className="cursor-pointer hover:bg-slate-50" onClick={() => setView(p)}>
                <td className={td + " font-medium text-slate-900"}>{p.no}</td>
                <td className={td}>{fmtDate(p.date)}</td>
                <td className={td}>{p.dept}<div className="text-xs text-slate-500">{p.requester}</div></td>
                <td className={td}>{p.lines.length === 1 ? materialByCode(p.lines[0].code)?.name : `${p.lines.length} materials`}</td>
                <td className={td}>{fmtDate(p.required)}</td>
                <td className={td}><Badge tone={p.priority === "Urgent" ? "red" : "gray"}>{p.priority}</Badge></td>
                <td className={td}><Badge tone={TONE[p.status]}>{p.status}</Badge></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">No requisitions with this status.</td></tr>
            )}
          </tbody>
        </TableWrap>
      </Card>

      {/* Detail */}
      <Drawer open={!!view} onClose={() => setView(null)} title={view?.no ?? ""} subtitle={view?.reason} wide>
        {view && (
          <div className="space-y-5">
            <div className="flex items-center gap-2"><Badge tone={TONE[view.status]}>{view.status}</Badge><Badge tone={view.priority === "Urgent" ? "red" : "gray"}>{view.priority}</Badge></div>
            <DL rows={[["Department", view.dept], ["Requester", view.requester], ["Raised on", fmtDate(view.date)], ["Required at factory", fmtDate(view.required)]]} />
            <TableWrap>
              <thead className="bg-slate-50"><tr>
                <th className={th}>Material</th><th className={thR}>Requested</th><th className={thR}>Ordered</th><th className={thR}>Remaining</th><th className={thR}>Stock on hand</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {view.lines.map((l) => {
                  const m = materialByCode(l.code);
                  return (
                    <tr key={l.code}>
                      <td className={td}>{m?.name}<div className="text-xs text-slate-500">{l.code}{l.note && ` · ${l.note}`}</div></td>
                      <td className={tdR}>{num(l.qty)} {m?.uom}</td>
                      <td className={tdR}>{num(l.ordered)}</td>
                      <td className={tdR}>{num(l.qty - l.ordered)}</td>
                      <td className={tdR}>{num(m?.stock ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
            <p className="text-xs text-slate-400">Remaining quantity is the balance a buyer can still order. POs cannot exceed it without an authorized exception.</p>
          </div>
        )}
      </Drawer>

      {/* Create */}
      <Drawer open={creating} onClose={() => setCreating(false)} title="New purchase requisition" wide>
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Department" required>
              <select className={inputCls} value={dept} onChange={(e) => setDept(e.target.value)}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
            </Field>
            <Field label="Required at factory by" required>
              <input type="date" className={inputCls} min={BUSINESS_DATE} value={required} onChange={(e) => setRequired(e.target.value)} />
            </Field>
            <Field label="Priority">
              <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}><option>Normal</option><option>Urgent</option></select>
            </Field>
            <Field label="Reason or production batch" required>
              <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. School shoe batch SS-26-14" />
            </Field>
          </div>

          <Card title="Materials needed" flush action={
            <Button onClick={() => {
              const free = MATERIALS.find((m) => !lines.some((l) => l.code === m.code));
              if (free) setLines([...lines, { code: free.code, qty: "", note: "" }]);
            }}><Plus size={14} /> Add material</Button>
          }>
            <TableWrap>
              <thead className="bg-slate-50"><tr>
                <th className={th}>Material</th><th className={thR}>Stock on hand</th><th className={th + " w-40"}>Quantity</th><th className={th}>Note</th><th className={th} />
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((l, i) => {
                  const m = materialByCode(l.code);
                  return (
                    <tr key={i}>
                      <td className={td}>
                        <select className={inputCls} value={l.code} aria-label={`Material for line ${i + 1}`}
                          onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, code: e.target.value } : x)))}>
                          {MATERIALS.map((mm) => <option key={mm.code} value={mm.code}>{mm.name}</option>)}
                        </select>
                      </td>
                      <td className={tdR}>{num(m?.stock ?? 0)} {m?.uom}</td>
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <input type="number" min={0} className={inputCls} value={l.qty} aria-label={`Quantity for line ${i + 1}`}
                            onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))} />
                          <span className="text-xs text-slate-500">{m?.uom}</span>
                        </div>
                      </td>
                      <td className={td}><input className={inputCls} value={l.note} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} /></td>
                      <td className={td}>
                        <Button variant="ghost" aria-label="Remove line" disabled={lines.length === 1} onClick={() => setLines(lines.filter((_, j) => j !== i))}><Trash2 size={16} /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          </Card>

          {touched && errors.length > 0 && (
            <Notice tone="red" title="Fix these before submitting">
              <ul className="list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
            </Notice>
          )}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={() => save(false)}>Save draft</Button>
            <Button variant="primary" onClick={() => save(true)}>Submit for approval</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}