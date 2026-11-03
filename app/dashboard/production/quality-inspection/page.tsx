"use client";

import { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordSheet } from "@/components/production/record-sheet";
import { PageHeader, StatCards, DataCard, StatusBadge, BarRow } from "@/components/production/module-kit";

const INSPECTIONS = [
  { id: "QI-3091", style: "MC-2401", batch: "B-0412", checked: 120, passed: 112, rejected: 8, defect: "Stitch gap", status: "Passed" },
  { id: "QI-3092", style: "WS-1102", batch: "B-0413", checked: 90, passed: 71, rejected: 19, defect: "Glue marks", status: "Rework" },
  { id: "QI-3093", style: "SS-4501", batch: "B-0409", checked: 60, passed: 60, rejected: 0, defect: "-", status: "Passed" },
  { id: "QI-3094", style: "MC-2401", batch: "B-0414", checked: 40, passed: 0, rejected: 0, defect: "-", status: "Pending" },
];
const REWORK = [
  { id: "RW-210", style: "WS-1102", qty: 19, defect: "Glue marks", sendTo: "Finishing", status: "In progress" },
  { id: "RW-211", style: "MC-2401", qty: 8, defect: "Stitch gap", sendTo: "Stitching", status: "Pending" },
];

export default function QualityInspectionPage() {
  const [inspections, setInspections] = useState(INSPECTIONS);
  const [tab, setTab] = useState("inspection");
  return (
    <div className="space-y-2">
      <PageHeader step="09" title="Quality Inspection & Rework"
        desc="Finishing ke baad pairs check karein, defect record karein aur rework department ko bhejein."
        actions={<RecordSheet title="New inspection" description="Record checked pairs, defects and inspection results." fields={[{ name: "style", label: "Style" }, { name: "batch", label: "Batch" }, { name: "checked", label: "Checked pairs", type: "number", min: 1 }, { name: "passed", label: "Passed pairs", type: "number", min: 0 }, { name: "rejected", label: "Rejected pairs", type: "number", min: 0 }, { name: "defect", label: "Main defect", optional: true }, { name: "status", label: "Status", options: ["Pending", "Passed", "Rework", "Rejected"] }]} onSave={(v) => { setInspections((rows) => [{ id: "QI-" + Date.now(), style: v.style, batch: v.batch, checked: Number(v.checked), passed: Number(v.passed), rejected: Number(v.rejected), defect: v.defect || "-", status: v.status }, ...rows]); setTab("inspection"); }} />} />
      <StatCards stats={[
        { label: "Pairs inspected", value: String(310 + inspections.slice(0, -INSPECTIONS.length).reduce((sum, row) => sum + row.checked, 0)), icon: ClipboardCheck, tone: "bg-indigo-50 text-indigo-600" },
        { label: "Passed", value: String(243 + inspections.slice(0, -INSPECTIONS.length).reduce((sum, row) => sum + row.passed, 0)), icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
        { label: "Rejected", value: String(27 + inspections.slice(0, -INSPECTIONS.length).reduce((sum, row) => sum + row.rejected, 0)), icon: XCircle, tone: "bg-rose-50 text-rose-600" },
        { label: "Open rework", value: String(27 + inspections.slice(0, -INSPECTIONS.length).reduce((sum, row) => sum + row.rejected, 0)), icon: RotateCcw, tone: "bg-amber-50 text-amber-600" },
      ]} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="rounded-xl">
              <TabsTrigger value="inspection">Inspections</TabsTrigger>
              <TabsTrigger value="rework">Rework orders</TabsTrigger>
            </TabsList>
          </Tabs>
          {tab === "inspection" ? (
            <DataCard title="Inspection log" rows={inspections} columns={[
              { header: "Inspection", render: (r) => <span className="font-semibold">{r.id}</span> },
              { header: "Style / Batch", render: (r) => `${r.style} · ${r.batch}` },
              { header: "Checked", align: "right", render: (r) => r.checked },
              { header: "Passed", align: "right", render: (r) => r.passed },
              { header: "Rejected", align: "right", render: (r) => r.rejected },
              { header: "Main defect", render: (r) => r.defect },
              { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            ]} />
          ) : (
            <DataCard title="Rework orders" rows={REWORK} columns={[
              { header: "Rework", render: (r) => <span className="font-semibold">{r.id}</span> },
              { header: "Style", render: (r) => r.style },
              { header: "Pairs", align: "right", render: (r) => r.qty },
              { header: "Defect", render: (r) => r.defect },
              { header: "Send to", render: (r) => r.sendTo },
              { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            ]} />
          )}
        </div>
        <Card className="rounded-2xl py-2 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Defects this week</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <BarRow label="Glue marks" value={19} max={20} tone="bg-rose-500" />
            <BarRow label="Stitch gap" value={8} max={20} tone="bg-amber-500" />
            <BarRow label="Sole misalignment" value={5} max={20} tone="bg-indigo-500" />
            <BarRow label="Scuff / stain" value={3} max={20} tone="bg-sky-500" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}