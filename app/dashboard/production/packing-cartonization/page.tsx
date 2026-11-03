"use client";

import { useState } from "react";

import { Package, Boxes, Weight, CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordSheet } from "@/components/production/record-sheet";
import { PageHeader, StatCards, DataCard, StatusBadge } from "@/components/production/module-kit";

const CARTONS = [
  { no: "CTN-0101", style: "MC-2401", ratio: "6:7:8:9 (1:2:2:1)", pairs: 12, weight: "9.6 kg", status: "Packed" },
  { no: "CTN-0102", style: "MC-2401", ratio: "6:7:8:9 (1:2:2:1)", pairs: 12, weight: "9.5 kg", status: "Packed" },
  { no: "CTN-0103", style: "WS-1102", ratio: "4:5:6:7 (2:2:1:1)", pairs: 12, weight: "6.8 kg", status: "Open" },
  { no: "CTN-0104", style: "SS-4501", ratio: "7:8:9 (1:1:1)", pairs: 6, weight: "7.9 kg", status: "Pending" },
];

export default function PackingPage() {
  const [cartons, setCartons] = useState(CARTONS);
  return (
    <div className="space-y-2">
      <PageHeader step="10" title="Packing & Cartonization"
        desc="Quality pass hue pairs ko size ratio ke hisaab se carton mai pack karein."
        actions={<>
          <Button variant="outline" className="rounded-xl"><Printer className="mr-2 h-4 w-4" />Print labels</Button>
          <RecordSheet title="New carton" description="Create a carton for packed production pairs." fields={[{ name: "style", label: "Style / Production order" }, { name: "ratio", label: "Size ratio" }, { name: "pairs", label: "Pairs", type: "number", min: 1 }, { name: "weight", label: "Weight (kg)", type: "number", min: 0.01, step: "0.01" }]} onSave={(v) => { setCartons((rows) => [{ no: "CTN-" + Date.now(), style: v.style, ratio: v.ratio, pairs: Number(v.pairs), weight: v.weight + " kg", status: "Packed" }, ...rows]); }} />
        </>} />
      <StatCards stats={[
        { label: "Cartons packed", value: String(58 + cartons.length - CARTONS.length), icon: Package, tone: "bg-indigo-50 text-indigo-600" },
        { label: "Pairs packed", value: String(696 + cartons.slice(0, -CARTONS.length).reduce((sum, row) => sum + row.pairs, 0)), icon: Boxes, tone: "bg-emerald-50 text-emerald-600" },
        { label: "Open cartons", value: "3", icon: CheckCircle2, tone: "bg-amber-50 text-amber-600" },
        { label: "Total weight", value: `${(542 + cartons.slice(0, -CARTONS.length).reduce((sum, row) => sum + parseFloat(row.weight), 0)).toFixed(2)} kg`, icon: Weight, tone: "bg-sky-50 text-sky-600" },
      ]} />
      <div className="grid gap-6">
        <DataCard title="Cartons" rows={cartons} columns={[
          { header: "Carton no.", render: (r) => <span className="font-semibold">{r.no}</span> },
          { header: "Style", render: (r) => r.style },
          { header: "Size ratio", render: (r) => r.ratio },
          { header: "Pairs", align: "right", render: (r) => r.pairs },
          { header: "Weight", align: "right", render: (r) => r.weight },
          { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]} />

      </div>
    </div>
  );
}