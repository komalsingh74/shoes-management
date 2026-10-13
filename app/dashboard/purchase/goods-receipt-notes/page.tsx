"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  BUSINESS_DATE, Badge, Button, Card, Drawer, Field, Kpi, Notice, PageHeader, Stepper, TableWrap, Tone,
  fmtDate, inputCls, num, td, tdR, th, thR,
} from "@/components/procurement/ui";
import { PURCHASE_ORDERS, materialByCode, supplierByCode } from "@/components/procurement/mock";

type GRNStatus = "Draft" | "Receipt recorded" | "Awaiting inspection" | "Awaiting posting" | "Posted" | "Cancelled";
type InspStatus = "Not required" | "Pending" | "Passed" | "Partially accepted" | "Rejected";
type Discrepancy = "None" | "Shortage" | "Excess" | "Damage" | "Wrong material";

interface GRNLine {
  code: string; challanQty: number; received: number; batch: string; condition: "Good" | "Damaged packaging";
  accepted: number; rejected: number; quarantined: number; disposition: string; inspected: boolean;
}
interface GRN {
  no: string; date: string; po: string; challan: string; status: GRNStatus; inspection: InspStatus;
  discrepancy: Discrepancy; lines: GRNLine[];
}

const GRN_TONE: Record<GRNStatus, Tone> = {
  Draft: "gray", "Receipt recorded": "blue", "Awaiting inspection": "amber", "Awaiting posting": "violet", Posted: "green", Cancelled: "red",
};
const INSP_TONE: Record<InspStatus, Tone> = {
  "Not required": "gray", Pending: "amber", Passed: "green", "Partially accepted": "violet", Rejected: "red",
};

const SEED: GRN[] = [
  { no: "GRN-2026-00112", date: "2026-10-09", po: "PO-2026-00076", challan: "CH-7781", status: "Posted", inspection: "Partially accepted", discrepancy: "Shortage",
    lines: [{ code: "RM-LTH-BLK", challanQty: 2050, received: 2000, batch: "LTH-B-0912", condition: "Good", accepted: 1950, rejected: 30, quarantined: 20, disposition: "Return to supplier", inspected: true }] },
  { no: "GRN-2026-00113", date: "2026-10-11", po: "PO-2026-00074", challan: "CH-4412", status: "Awaiting inspection", inspection: "Pending", discrepancy: "None",
    lines: [{ code: "RM-SOL-BLK", challanQty: 2000, received: 2000, batch: "SOL-B-1011", condition: "Good", accepted: 0, rejected: 0, quarantined: 0, disposition: "", inspected: false }] },
];

const DISPOSITIONS = ["Return to supplier", "Request replacement", "Request credit note", "Hold for reinspection", "Accept with deviation (needs approval)", "Scrap"];
const TOLERANCE_PCT = 5; // over-receipt tolerance, configure per material category

const RECEIVABLE = PURCHASE_ORDERS.filter((p) => ["Approved", "Sent", "Partially received"].includes(p.status));

export default function GRNPage() {
  const [grns, setGrns] = useState<GRN[]>(SEED);
  const [mode, setMode] = useState<"list" | "create">("list");
  const [inspecting, setInspecting] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  /* create form */
  const [poNo, setPoNo] = useState("");
  const [challan, setChallan] = useState("");
  const [received, setReceived] = useState<Record<string, string>>({});
  const [challanQty, setChallanQty] = useState<Record<string, string>>({});
  const [batch, setBatch] = useState<Record<string, string>>({});
  const [damaged, setDamaged] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState(false);

  const po = PURCHASE_ORDERS.find((p) => p.no === poNo);

  const createErrors = useMemo(() => {
    const e: string[] = [];
    if (!po) { e.push("Select the purchase order this delivery belongs to."); return e; }
    if (!challan.trim()) e.push("Enter the supplier challan or delivery note number.");
    if (grns.some((g) => g.po === po.no && g.challan.toLowerCase() === challan.trim().toLowerCase() && challan.trim()))
      e.push(`Challan ${challan} was already recorded against ${po.no}.`);
    const active = po.lines.filter((l) => Number(received[l.code]) > 0);
    if (active.length === 0) e.push("Enter the quantity physically received for at least one line.");
    active.forEach((l) => {
      const outstanding = l.qty - l.received;
      const now = Number(received[l.code]);
      const max = Math.floor(outstanding * (1 + TOLERANCE_PCT / 100));
      if (now > max) e.push(`${materialByCode(l.code)?.name}: ${num(now)} exceeds the outstanding ${num(outstanding)} plus ${TOLERANCE_PCT}% tolerance. Over-receipt needs authorization.`);
      if (!(batch[l.code] ?? "").trim()) e.push(`${materialByCode(l.code)?.name}: add the supplier batch or lot number.`);
    });
    return e;
  }, [po, challan, received, batch, grns]);

  function createGRN() {
    setTouched(true);
    if (createErrors.length || !po) return;
    const lines: GRNLine[] = po.lines.filter((l) => Number(received[l.code]) > 0).map((l) => ({
      code: l.code, challanQty: Number(challanQty[l.code]) || Number(received[l.code]), received: Number(received[l.code]),
      batch: batch[l.code], condition: damaged[l.code] ? "Damaged packaging" : "Good", accepted: 0, rejected: 0, quarantined: 0, disposition: "", inspected: false,
    }));
    let disc: Discrepancy = "None";
    if (lines.some((l) => l.received < l.challanQty)) disc = "Shortage";
    else if (lines.some((l) => l.received > l.challanQty)) disc = "Excess";
    else if (lines.some((l) => l.condition === "Damaged packaging")) disc = "Damage";
    const no = `GRN-2026-${String(114 + grns.filter((g) => g.no > "GRN-2026-00113").length).padStart(5, "0")}`;
    setGrns([{ no, date: BUSINESS_DATE, po: po.no, challan: challan.trim(), status: "Awaiting inspection", inspection: "Pending", discrepancy: disc, lines }, ...grns]);
    setToast(`${no} recorded. Quantities are held in the receiving area until inspection and posting are complete.`);
    setMode("list"); setPoNo(""); setChallan(""); setReceived({}); setChallanQty({}); setBatch({}); setDamaged({}); setTouched(false);
  }

  function updateGRN(no: string, fn: (g: GRN) => GRN) {
    setGrns((gs) => gs.map((g) => (g.no === no ? fn(g) : g)));
  }

  const monthPosted = grns.filter((g) => g.status === "Posted").length;

  /* ================= CREATE ================= */
  if (mode === "create")
    return (
      <div className="mx-auto max-w-6xl p-6">
        <PageHeader title="Receive materials" subtitle="Record what physically arrived. This does not make stock usable — inspection and posting come next."
          actions={<Button onClick={() => setMode("list")}>Back to GRN list</Button>} />
        <div className="space-y-5">
          <Card title="Delivery details">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Purchase order" required>
                <select className={inputCls} value={poNo} onChange={(e) => { setPoNo(e.target.value); setReceived({}); }}>
                  <option value="">Select PO</option>
                  {RECEIVABLE.map((p) => <option key={p.no} value={p.no}>{p.no} · {supplierByCode(p.supplier)?.name}</option>)}
                </select>
              </Field>
              <Field label="Supplier"><input className={inputCls} readOnly value={po ? supplierByCode(po.supplier)?.name ?? "" : ""} /></Field>
              <Field label="Supplier challan no." required><input className={inputCls} value={challan} onChange={(e) => setChallan(e.target.value)} /></Field>
            </div>
            {!po && <p className="mt-3 text-xs text-slate-500">Only approved POs with outstanding quantity are listed. Cancelled or completed POs cannot be received.</p>}
          </Card>

          {po && (
            <Card title="Outstanding lines" flush>
              <TableWrap>
                <thead className="bg-slate-50"><tr>
                  <th className={th}>Material</th><th className={thR}>PO qty</th><th className={thR}>Previously received</th><th className={thR}>Outstanding</th>
                  <th className={th + " w-32"}>Per challan</th><th className={th + " w-32"}>Counted now</th><th className={th + " w-40"}>Batch / lot</th><th className={th}>Damaged</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {po.lines.map((l) => {
                    const m = materialByCode(l.code);
                    const out = l.qty - l.received;
                    const now = Number(received[l.code]) || 0;
                    const ch = Number(challanQty[l.code]);
                    return (
                      <tr key={l.code}>
                        <td className={td}>{m?.name}<div className="text-xs text-slate-500">{m?.uom}</div></td>
                        <td className={tdR}>{num(l.qty)}</td><td className={tdR}>{num(l.received)}</td><td className={tdR + " font-medium"}>{num(out)}</td>
                        <td className={td}><input type="number" min={0} className={inputCls} value={challanQty[l.code] ?? ""} aria-label={`Challan qty ${m?.name}`} onChange={(e) => setChallanQty({ ...challanQty, [l.code]: e.target.value })} /></td>
                        <td className={td}>
                          <input type="number" min={0} className={inputCls} value={received[l.code] ?? ""} aria-label={`Counted qty ${m?.name}`} onChange={(e) => setReceived({ ...received, [l.code]: e.target.value })} />
                          {now > 0 && ch > 0 && now !== ch && <div className="mt-1 text-xs text-amber-700">{now < ch ? `${num(ch - now)} short` : `${num(now - ch)} excess`} vs challan</div>}
                        </td>
                        <td className={td}><input className={inputCls} value={batch[l.code] ?? ""} aria-label={`Batch ${m?.name}`} onChange={(e) => setBatch({ ...batch, [l.code]: e.target.value })} /></td>
                        <td className={td}><input type="checkbox" checked={!!damaged[l.code]} aria-label={`Damaged ${m?.name}`} onChange={(e) => setDamaged({ ...damaged, [l.code]: e.target.checked })} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
              <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                The counted quantity is always what the warehouse physically counted. If it differs from the challan, a discrepancy is recorded; the count is never changed to match the challan. Leave lines blank if nothing arrived for them.
              </p>
            </Card>
          )}

          {touched && createErrors.length > 0 && (
            <Notice tone="red" title="Fix before submitting"><ul className="list-disc pl-5">{createErrors.map((e) => <li key={e}>{e}</li>)}</ul></Notice>
          )}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setMode("list")}>Cancel</Button>
            <Button variant="primary" onClick={createGRN}>Submit receipt</Button>
          </div>
        </div>
      </div>
    );

  /* ================= LIST ================= */
  const insp = grns.find((g) => g.no === inspecting) ?? null;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader title="Goods Receipt Notes (GRN)" subtitle="Receiving, inspection and posting are separate steps. Received quantity is never assumed to be accepted quantity."
        actions={<Button variant="primary" onClick={() => setMode("create")}><Plus size={16} /> Receive against PO</Button>} />
      {toast && <div className="mb-4"><Notice tone="green">{toast}</Notice></div>}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-6">
        <Kpi label="Receipts today" value={grns.filter((g) => g.date === BUSINESS_DATE).length} />
        <Kpi label="Pending inspection" value={grns.filter((g) => g.status === "Awaiting inspection").length} />
        <Kpi label="Awaiting posting" value={grns.filter((g) => g.status === "Awaiting posting").length} />
        <Kpi label="With discrepancies" value={grns.filter((g) => g.discrepancy !== "None").length} />
        <Kpi label="POs partly received" value={PURCHASE_ORDERS.filter((p) => p.status === "Partially received").length} />
        <Kpi label="Posted this month" value={monthPosted} />
      </div>

      <Card flush>
        <TableWrap>
          <thead className="bg-slate-50"><tr>
            <th className={th}>GRN</th><th className={th}>Date</th><th className={th}>PO / Supplier</th><th className={th}>Challan</th><th className={th}>Materials</th>
            <th className={thR}>Received</th><th className={th}>Inspection</th><th className={th}>Discrepancy</th><th className={th}>Status</th><th className={th} />
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {grns.map((g) => {
              const p = PURCHASE_ORDERS.find((x) => x.no === g.po);
              return (
                <tr key={g.no} className="hover:bg-slate-50">
                  <td className={td + " font-medium text-slate-900"}>{g.no}</td>
                  <td className={td}>{fmtDate(g.date)}</td>
                  <td className={td}>{g.po}<div className="text-xs text-slate-500">{supplierByCode(p?.supplier ?? "")?.name}</div></td>
                  <td className={td}>{g.challan}</td>
                  <td className={td}>{g.lines.length === 1 ? materialByCode(g.lines[0].code)?.name : `${g.lines.length} materials`}</td>
                  <td className={tdR}>{num(g.lines.reduce((s, l) => s + l.received, 0))}</td>
                  <td className={td}><Badge tone={INSP_TONE[g.inspection]}>{g.inspection}</Badge></td>
                  <td className={td}>{g.discrepancy === "None" ? <span className="text-slate-400">None</span> : <Badge tone="amber">{g.discrepancy}</Badge>}</td>
                  <td className={td}><Badge tone={GRN_TONE[g.status]}>{g.status}</Badge></td>
                  <td className={td}><Button onClick={() => setInspecting(g.no)}>{g.status === "Awaiting inspection" || g.status === "Awaiting posting" ? "Inspect" : "View"}</Button></td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </Card>

      <InspectionDrawer grn={insp} onClose={() => setInspecting(null)} onChange={updateGRN} />
    </div>
  );
}

/* ================= INSPECTION & DISPOSITION ================= */

function InspectionDrawer({ grn, onClose, onChange }: { grn: GRN | null; onClose: () => void; onChange: (no: string, fn: (g: GRN) => GRN) => void }) {
  const [draft, setDraft] = useState<Record<string, { a: string; r: string; q: string; d: string }>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  if (!grn) return <Drawer open={false} onClose={onClose} title="" children={null} />;

  const editable = grn.status === "Awaiting inspection";
  const step = grn.status === "Posted" ? 4 : grn.status === "Awaiting posting" ? 3 : 2;
  const get = (code: string, l: GRNLine) => draft[code] ?? { a: String(l.accepted || ""), r: String(l.rejected || ""), q: String(l.quarantined || ""), d: l.disposition };

  const problems: string[] = [];
  grn.lines.forEach((l) => {
    const d = get(l.code, l);
    const sum = (Number(d.a) || 0) + (Number(d.r) || 0) + (Number(d.q) || 0);
    const name = materialByCode(l.code)?.name;
    if (sum !== l.received) problems.push(`${name}: accepted + rejected + quarantined is ${num(sum)}, but ${num(l.received)} were received.`);
    if (((Number(d.r) || 0) + (Number(d.q) || 0)) > 0 && !d.d) problems.push(`${name}: choose a disposition for rejected or quarantined quantity.`);
  });

  function recordInspection() {
    if (problems.length || !grn) return;
    onChange(grn.no, (g) => {
      const lines = g.lines.map((l) => {
        const d = get(l.code, l);
        return { ...l, accepted: Number(d.a) || 0, rejected: Number(d.r) || 0, quarantined: Number(d.q) || 0, disposition: d.d, inspected: true };
      });
      const acc = lines.reduce((s, l) => s + l.accepted, 0);
      const rec = lines.reduce((s, l) => s + l.received, 0);
      const insp: InspStatus = acc === rec ? "Passed" : acc === 0 ? "Rejected" : "Partially accepted";
      return { ...g, lines, inspection: insp, status: "Awaiting posting" };
    });
  }
  function post() {
    if (!grn) return;
    // Server must make this idempotent: re-posting the same GRN must not add stock twice.
    onChange(grn.no, (g) => (g.status === "Awaiting posting" ? { ...g, status: "Posted" } : g));
  }

  return (
    <Drawer open onClose={onClose} title={grn.no} subtitle={`${grn.po} · challan ${grn.challan}`} wide>
      <div className="space-y-5">
        <Stepper steps={["Receipt recorded", "Inspection", "Posting", "Inventory updated"]} current={step - 1} />
        {grn.discrepancy !== "None" && <Notice tone="amber" title={`Discrepancy: ${grn.discrepancy}`}>Raise a supplier claim from the details tab if the shortfall or damage is not resolved on site.</Notice>}

        {grn.lines.map((l) => {
          const m = materialByCode(l.code);
          const d = get(l.code, l);
          return (
            <Card key={l.code} title={m?.name}>
              <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                <span>Received: <b>{num(l.received)} {m?.uom}</b></span>
                <span>Challan: {num(l.challanQty)}</span>
                <span>Batch: {l.batch}</span>
                <span>Packaging: {l.condition}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Accepted"><input type="number" min={0} disabled={!editable} className={inputCls} value={d.a} onChange={(e) => setDraft({ ...draft, [l.code]: { ...d, a: e.target.value } })} /></Field>
                <Field label="Rejected"><input type="number" min={0} disabled={!editable} className={inputCls} value={d.r} onChange={(e) => setDraft({ ...draft, [l.code]: { ...d, r: e.target.value } })} /></Field>
                <Field label="Quarantined"><input type="number" min={0} disabled={!editable} className={inputCls} value={d.q} onChange={(e) => setDraft({ ...draft, [l.code]: { ...d, q: e.target.value } })} /></Field>
                <Field label="Disposition for rejected / held">
                  <select disabled={!editable} className={inputCls} value={d.d} onChange={(e) => setDraft({ ...draft, [l.code]: { ...d, d: e.target.value } })}>
                    <option value="">None</option>{DISPOSITIONS.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
              </div>
              {editable && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {["Size and dimensions", "Colour and finish", "Visible defects", "Batch label matches challan"].map((c) => {
                    const key = `${l.code}:${c}`;
                    return <label key={c} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={!!checks[key]} onChange={(e) => setChecks({ ...checks, [key]: e.target.checked })} /> {c}</label>;
                  })}
                </div>
              )}
            </Card>
          );
        })}

        {editable && problems.length > 0 && <Notice tone="amber"><ul className="list-disc pl-5">{problems.map((p) => <li key={p}>{p}</li>)}</ul></Notice>}

        {grn.status === "Awaiting posting" && (
          <Notice tone="blue" title="Ready to post">
            Accepted stock moves to the usable warehouse. Rejected and quarantined stock stays in restricted locations until its disposition is complete.
          </Notice>
        )}
        {grn.status === "Posted" && <Notice tone="green">Posted. Corrections now need a reversal or adjustment — quantities cannot be edited directly.</Notice>}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button onClick={onClose}>Close</Button>
          {editable && <Button variant="primary" disabled={problems.length > 0} onClick={recordInspection}>Record inspection</Button>}
          {grn.status === "Awaiting posting" && <Button variant="primary" onClick={post}>Post to inventory</Button>}
        </div>
      </div>
    </Drawer>
  );
}