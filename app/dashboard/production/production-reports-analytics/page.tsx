"use client";

import { useState } from "react";
import { BarChart3, Target, Gauge, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, StatCards, DataCard, BarRow } from "@/components/production/module-kit";

const DAILY = [
  { d: "Mon", v: 420 }, { d: "Tue", v: 465 }, { d: "Wed", v: 390 },
  { d: "Thu", v: 510 }, { d: "Fri", v: 478 }, { d: "Sat", v: 355 },
];
const DEPTS = [
  { name: "Cutting", planned: 520, actual: 510, eff: 98, rej: 0.8 },
  { name: "Stitching", planned: 500, actual: 462, eff: 92, rej: 2.1 },
  { name: "Lasting & Assembly", planned: 480, actual: 421, eff: 88, rej: 3.4 },
  { name: "Finishing", planned: 460, actual: 412, eff: 90, rej: 2.6 },
  { name: "Packing", planned: 450, actual: 430, eff: 96, rej: 0.4 },
];

export default function ProductionReportsPage() {
  const [range, setRange] = useState("week");
  const max = Math.max(...DAILY.map((x) => x.v));
  return (
    <div className="space-y-2">
      <PageHeader step="14" title="Production Reports & Analytics"
        desc="Output, efficiency aur rejection ka poora overview ek jagah dekhein."
        actions={<>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[150px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl"><Download className="mr-2 h-4 w-4" />Export</Button>
        </>} />
      <StatCards stats={[
        { label: "Total output (pairs)", value: "2,618", icon: BarChart3, tone: "bg-indigo-50 text-indigo-600" },
        { label: "Plan achieved", value: "91%", icon: Target, tone: "bg-emerald-50 text-emerald-600" },
        { label: "Line efficiency", value: "92.8%", icon: Gauge, tone: "bg-sky-50 text-sky-600" },
        { label: "First-pass quality", value: "96.1%", icon: ShieldCheck, tone: "bg-amber-50 text-amber-600" },
      ]} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-2xl py-2 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Daily output (pairs)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-56 items-end gap-4">
              {DAILY.map((x) => (
                <div key={x.d} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium tabular-nums">{x.v}</span>
                  <div className="w-full rounded-t-lg bg-indigo-500" style={{ height: `${(x.v / max) * 100}%` }} />
                  <span className="text-xs text-muted-foreground">{x.d}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl py-2 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Rejection by department (%)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {DEPTS.map((d) => (
              <BarRow key={d.name} label={d.name} value={d.rej} max={4} tone={d.rej > 3 ? "bg-rose-500" : "bg-emerald-500"} />
            ))}
          </CardContent>
        </Card>
      </div>
      <DataCard title="Department performance" rows={DEPTS} columns={[
        { header: "Department", render: (r) => <span className="font-semibold">{r.name}</span> },
        { header: "Planned", align: "right", render: (r) => r.planned },
        { header: "Actual", align: "right", render: (r) => r.actual },
        { header: "Efficiency", render: (r) => (
          <div className="flex min-w-[160px] items-center gap-3"><Progress value={r.eff} className="h-1.5" />
            <span className="text-xs font-medium tabular-nums">{r.eff}%</span></div>) },
        { header: "Rejection", align: "right", render: (r) => `${r.rej}%` },
      ]} />
    </div>
  );
}