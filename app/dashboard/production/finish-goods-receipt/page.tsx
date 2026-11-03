"use client";

import { useState } from "react";
import { Warehouse, PackageCheck, Clock, AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RecordSheet } from "@/components/production/record-sheet";
import { PageHeader, StatCards, DataCard, StatusBadge } from "@/components/production/module-kit";

const RECEIPTS = [
  { grn: "FGR-7001", po: "PO-2026-0174", style: "SS-4501", cartons: 20, pairs: 120, store: "Main Warehouse", by: "Amit Kumar", date: "02 Nov", status: "Received" },
  { grn: "FGR-7002", po: "PO-2026-0187", style: "MC-2401", cartons: 11, pairs: 132, store: "Main Warehouse", by: "Amit Kumar", date: "03 Nov", status: "Partial" },
  { grn: "FGR-7003", po: "PO-2026-0191", style: "WS-1102", cartons: 15, pairs: 180, store: "Export Store", by: "-", date: "-", status: "Pending" },
];

export default function FinishedGoodsReceiptPage() {
  const [receipts, setReceipts] = useState(RECEIPTS);
  const [q, setQ] = useState("");
  const rows = receipts.filter((r) => `${r.grn} ${r.po} ${r.style}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-2">
      <PageHeader step="11" title="Finished Goods Receipt"
        desc="Packed cartons ko warehouse mai receive karke stock mai add karein."
        actions={<RecordSheet title="New receipt" description="Receive packed goods into the selected warehouse." fields={[{ name: "po", label: "Production order" }, { name: "style", label: "Style" }, { name: "cartons", label: "Cartons", type: "number", min: 1 }, { name: "pairs", label: "Pairs", type: "number", min: 1 }, { name: "store", label: "Warehouse", options: ["Main Warehouse", "Export Store"] }, { name: "by", label: "Received by" }, { name: "date", label: "Receipt date", type: "date" }, { name: "status", label: "Status", options: ["Received", "Partial", "Pending"] }]} onSave={(v) => { setReceipts((rows) => [{ grn: "FGR-" + Date.now(), po: v.po, style: v.style, cartons: Number(v.cartons), pairs: Number(v.pairs), store: v.store, by: v.by, date: v.date, status: v.status }, ...rows]); setQ(""); }} />} />
      <StatCards stats={[
        { label: "Receipts today", value: String(6 + receipts.length - RECEIPTS.length), icon: Warehouse, tone: "bg-indigo-50 text-indigo-600" },
        { label: "Pairs in stock", value: (4280 + receipts.slice(0, -RECEIPTS.length).filter((row) => row.status !== "Pending").reduce((sum, row) => sum + row.pairs, 0)).toLocaleString("en-IN"), icon: PackageCheck, tone: "bg-emerald-50 text-emerald-600" },
        { label: "Awaiting receipt", value: "15 ctn", icon: Clock, tone: "bg-amber-50 text-amber-600" },
        { label: "Short / damaged", value: "2", icon: AlertTriangle, tone: "bg-rose-50 text-rose-600" },
      ]} />
      <DataCard title="Receipts" rows={rows}
        toolbar={<div className="relative w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search GRN, PO, style..." className="rounded-xl pl-9" /></div>}
        columns={[
          { header: "Receipt", render: (r) => <span className="font-semibold">{r.grn}</span> },
          { header: "PO / Style", render: (r) => `${r.po} · ${r.style}` },
          { header: "Cartons", align: "right", render: (r) => r.cartons },
          { header: "Pairs", align: "right", render: (r) => r.pairs },
          { header: "Store", render: (r) => r.store },
          { header: "Received by", render: (r) => `${r.by} ${r.date !== "-" ? "· " + r.date : ""}` },
          { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]} />
    </div>
  );
}