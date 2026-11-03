"use client";

import { useState } from "react";
import { Search, CheckCircle2, Loader2, Circle, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/production/module-kit";

type Batch = {
  style: string; po: string; customer: string; qty: number;
  materials: { name: string; lot: string; supplier: string }[];
  stages: { name: string; state: "done" | "active" | "todo"; who: string; time: string }[];
};

const BATCHES: Record<string, Batch> = {
  "B-0412": {
    style: "MC-2401 · Men's Casual Leather Shoe", po: "PO-2026-0187", customer: "Metro Footwear", qty: 240,
    materials: [
      { name: "Full grain leather – Tan", lot: "LT-8841", supplier: "Kanpur Tanners" },
      { name: "TPR sole – Brown", lot: "SL-2210", supplier: "Agra Soles Pvt Ltd" },
      { name: "Lining – Microfibre", lot: "LN-1095", supplier: "Delhi Textiles" },
    ],
    stages: [
      { name: "Cutting", state: "done", who: "Pooja Singh", time: "01 Nov, 09:10" },
      { name: "Stitching", state: "done", who: "Sunil Kumar", time: "01 Nov, 03:30" },
      { name: "Lasting & Assembly", state: "done", who: "Ramesh Yadav", time: "02 Nov, 12:15" },
      { name: "Finishing", state: "active", who: "Ramesh Yadav", time: "03 Nov, 10:00" },
      { name: "Quality Inspection", state: "todo", who: "-", time: "-" },
      { name: "Packing", state: "todo", who: "-", time: "-" },
    ],
  },
};

export default function BatchTraceabilityPage() {
  const [q, setQ] = useState("B-0412");
  const [active, setActive] = useState("B-0412");
  const b = BATCHES[active];
  return (
    <div className="space-y-2">
      <PageHeader step="13" title="Batch Traceability"
        desc="Batch number se material lot, department aur operator ki poori history dekhein." />
      <Card className="rounded-2xl py-2 shadow-sm">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-[260px] flex-1">
            <ScanLine className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value.toUpperCase())} placeholder="Scan ya batch no. likhein (e.g. B-0412)" className="rounded-xl pl-9" />
          </div>
          <Button onClick={() => setActive(q)} className="rounded-xl bg-slate-950 hover:bg-slate-800"><Search className="mr-2 h-4 w-4" />Trace batch</Button>
        </CardContent>
      </Card>
      {!b ? (
        <p className="rounded-2xl border border-dashed bg-white py-16 text-center text-sm text-muted-foreground">
          &quot;{active}&quot; ka koi batch nahi mila. Batch number check karke dobara try karein.
        </p>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Card className="rounded-2xl py-2 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Production journey</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative space-y-6 border-l pl-6">
                {b.stages.map((s) => (
                  <li key={s.name} className="relative">
                    <span className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-white">
                      {s.state === "done" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        : s.state === "active" ? <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                        : <Circle className="h-5 w-5 text-slate-300" />}
                    </span>
                    <div className="flex items-center justify-between">
                      <p className={cn("font-medium", s.state === "todo" && "text-muted-foreground")}>{s.name}</p>
                      <span className="text-xs text-muted-foreground">{s.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Operator: {s.who}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="rounded-2xl py-2 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-base">Batch {active}</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{b.style}</p>
                <p className="text-muted-foreground">{b.po} · {b.customer}</p>
                <Badge variant="secondary" className="rounded-full">{b.qty} pairs</Badge>
              </CardContent>
            </Card>
            <Card className="rounded-2xl py-2 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-base">Materials used</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {b.materials.map((m) => (
                  <div key={m.lot} className="rounded-xl border p-3 text-sm">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">Lot {m.lot} · {m.supplier}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}