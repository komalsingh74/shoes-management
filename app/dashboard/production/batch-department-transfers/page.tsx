"use client";

import { useState } from "react";
import { ArrowRightLeft, Truck, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordSheet } from "@/components/production/record-sheet";
import { PageHeader, StatCards, DataCard, StatusBadge } from "@/components/production/module-kit";

const TRANSFERS = [
  { id: "TRF-5501", batch: "B-0412", from: "Cutting", to: "Stitching", qty: 240, by: "Ramesh Yadav", time: "09:10 AM", status: "Completed" },
  { id: "TRF-5502", batch: "B-0412", from: "Stitching", to: "Lasting", qty: 240, by: "Sunil Kumar", time: "01:40 PM", status: "In transit" },
  { id: "TRF-5503", batch: "B-0413", from: "Cutting", to: "Stitching", qty: 180, by: "Pooja Singh", time: "11:25 AM", status: "Pending" },
  { id: "TRF-5504", batch: "B-0409", from: "Lasting", to: "Finishing", qty: 120, by: "Ramesh Yadav", time: "Yesterday", status: "Completed" },
];

export default function BatchTransfersPage() {
  const [transfers, setTransfers] = useState(TRANSFERS);
  const [tab, setTab] = useState("all");
  const rows = tab === "all" ? transfers : transfers.filter((t) => t.status.toLowerCase() === tab);
  return (
    <div className="space-y-2">
      <PageHeader step="12" title="Batch & Department Transfers"
        desc="Batch ko ek department se doosre department mai bhejein aur receive confirm karein."
        actions={<RecordSheet title="New transfer" description="Select a batch and its source and destination departments." fields={[{ name: "batch", label: "Batch" }, { name: "from", label: "From department", options: ["Cutting", "Stitching", "Bottom Preparation", "Lasting", "Finishing", "Quality", "Packing"] }, { name: "to", label: "To department", options: ["Cutting", "Stitching", "Bottom Preparation", "Lasting", "Finishing", "Quality", "Packing"] }, { name: "qty", label: "Pairs", type: "number", min: 1 }, { name: "by", label: "Sent by" }]} onSave={(v) => { setTransfers((rows) => [{ id: "TRF-" + Date.now(), batch: v.batch, from: v.from, to: v.to, qty: Number(v.qty), by: v.by, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), status: "Pending" }, ...rows]); setTab("all"); }} />} />
      <StatCards stats={[
        { label: "Transfers today", value: String(19 + transfers.length - TRANSFERS.length), icon: ArrowRightLeft, tone: "bg-indigo-50 text-indigo-600" },
        { label: "In transit", value: String(4 + transfers.filter((row) => row.status === "In transit").length - TRANSFERS.filter((row) => row.status === "In transit").length), icon: Truck, tone: "bg-sky-50 text-sky-600" },
        { label: "Awaiting receive", value: String(3 + transfers.filter((row) => row.status === "Pending").length - TRANSFERS.filter((row) => row.status === "Pending").length), icon: Clock, tone: "bg-amber-50 text-amber-600" },
        { label: "Completed", value: String(12 + transfers.filter((row) => row.status === "Completed").length - TRANSFERS.filter((row) => row.status === "Completed").length), icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
      ]} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in transit">In transit</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      <DataCard title="Transfers" rows={rows} columns={[
        { header: "Transfer", render: (r) => <span className="font-semibold">{r.id}</span> },
        { header: "Batch", render: (r) => r.batch },
        { header: "Route", render: (r) => <span className="flex items-center gap-2">{r.from}<ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />{r.to}</span> },
        { header: "Pairs", align: "right", render: (r) => r.qty },
        { header: "Sent by", render: (r) => `${r.by} · ${r.time}` },
        { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        { header: "", align: "right", render: (r) => r.status === "Completed" ? null :
          <Button onClick={() => setTransfers((items) => items.map((item) => item.id === r.id ? { ...item, status: item.status === "Pending" ? "In transit" : "Completed" } : item))} size="sm" variant="outline" className="rounded-lg">{r.status === "Pending" ? "Send" : "Receive"}</Button> },
      ]} />
    </div>
  );
}