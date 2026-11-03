"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Play,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertTriangle,
  User,
  ChevronRight,
  Layers,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PageHeader, StatCards } from "@/components/production/module-kit";

type Status = "pending" | "in_progress" | "completed";

type Job = {
  id: string;
  po: string;
  style: string;
  name: string;
  color: string;
  line: string;
  due: string;
  status: Status;
  total: number;
  finished: number;
  operator: string;
  sizes: { size: string; qty: number; done: number }[];
};

const JOBS: Job[] = [
  {
    id: "FIN-0412",
    po: "PO-2026-0187",
    style: "MC-2401",
    name: "Men's Casual Leather Shoe",
    color: "Tan",
    line: "Line A",
    due: "Today, 5:00 PM",
    status: "in_progress",
    total: 240,
    finished: 132,
    operator: "Ramesh Yadav",
    sizes: [
      { size: "UK 6", qty: 30, done: 30 },
      { size: "UK 7", qty: 60, done: 52 },
      { size: "UK 8", qty: 80, done: 40 },
      { size: "UK 9", qty: 50, done: 10 },
      { size: "UK 10", qty: 20, done: 0 },
    ],
  },
  {
    id: "FIN-0413",
    po: "PO-2026-0191",
    style: "WS-1102",
    name: "Women's Sandal",
    color: "Black",
    line: "Line B",
    due: "Tomorrow, 11:00 AM",
    status: "pending",
    total: 180,
    finished: 0,
    operator: "Unassigned",
    sizes: [
      { size: "UK 4", qty: 40, done: 0 },
      { size: "UK 5", qty: 60, done: 0 },
      { size: "UK 6", qty: 50, done: 0 },
      { size: "UK 7", qty: 30, done: 0 },
    ],
  },
  {
    id: "FIN-0409",
    po: "PO-2026-0174",
    style: "SS-4501",
    name: "Safety Shoe",
    color: "Brown",
    line: "Line A",
    due: "Yesterday",
    status: "completed",
    total: 120,
    finished: 120,
    operator: "Sunil Kumar",
    sizes: [
      { size: "UK 7", qty: 40, done: 40 },
      { size: "UK 8", qty: 50, done: 50 },
      { size: "UK 9", qty: 30, done: 30 },
    ],
  },
];

const OPERATIONS = [
  { key: "clean", label: "Upper cleaning & stain removal" },
  { key: "trim", label: "Thread & excess cement trimming" },
  { key: "polish", label: "Polishing & cream application" },
  { key: "lace", label: "Lace / buckle fitting" },
  { key: "insole", label: "Insole & sock lining insertion" },
  { key: "label", label: "Brand label & size sticker check" },
];

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-slate-100 text-slate-700" },
  in_progress: { label: "In progress", className: "bg-amber-100 text-amber-800" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700" },
};

export default function FinishingWorkbenchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [selectedId, setSelectedId] = useState(JOBS[0].id);
  const [checked, setChecked] = useState<Record<string, boolean>>({
    clean: true,
    trim: true,
    polish: true,
  });
  const [rejected, setRejected] = useState("0");

  const filtered = useMemo(
    () =>
      JOBS.filter(
        (j) =>
          (filter === "all" || j.status === filter) &&
          `${j.id} ${j.po} ${j.style} ${j.name}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [query, filter]
  );

  const job = JOBS.find((j) => j.id === selectedId) ?? JOBS[0];
  const progress = Math.round((job.finished / job.total) * 100);
  const opsDone = OPERATIONS.filter((o) => checked[o.key]).length;

  const stats = [
    { label: "Jobs in queue", value: "8", icon: Layers, tone: "bg-indigo-50 text-indigo-600" },
    { label: "Pairs finished today", value: "412", icon: PackageCheck, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Avg. time per pair", value: "3.8 min", icon: Timer, tone: "bg-sky-50 text-sky-600" },
    { label: "Sent for rework", value: "14", icon: AlertTriangle, tone: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="space-y-2">
      <PageHeader step="08" title="Finishing Workbench" desc="Lasting ke baad shoes ki cleaning, polishing aur final touch yahan complete karein."
        actions={<Button asChild className="rounded-xl bg-slate-950 hover:bg-slate-800"><Link href="/dashboard/production/production-management?tab=create"><Sparkles className="mr-2 h-4 w-4" />Create Production Order</Link></Button>} />
      <StatCards stats={stats} />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Job queue */}
        <Card className="rounded-2xl py-2 shadow-sm">
          <CardHeader className="space-y-3 pb-3">
            <CardTitle className="text-base">Finishing queue</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search job, PO or style..."
                className="rounded-xl pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "in_progress", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    filter === f
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {f === "all" ? "All" : STATUS_STYLE[f].label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Koi job nahi mila. Filter ya search badal ke dekhein.
              </p>
            )}
            {filtered.map((j) => {
              const pct = Math.round((j.finished / j.total) * 100);
              const active = j.id === selectedId;
              return (
                <button
                  key={j.id}
                  onClick={() => setSelectedId(j.id)}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all",
                    active
                      ? "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500"
                      : "hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{j.id}</span>
                    <Badge className={cn("rounded-full border-0", STATUS_STYLE[j.status].className)}>
                      {STATUS_STYLE[j.status].label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm">{j.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {j.style} · {j.color} · {j.line}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={pct} className="h-1.5" />
                    <span className="text-xs font-medium tabular-nums">
                      {j.finished}/{j.total}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {j.due}
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Job detail */}
        <div className="space-y-6">
          <Card className="rounded-2xl py-2 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{job.id}</h2>
                    <Badge className={cn("rounded-full border-0", STATUS_STYLE[job.status].className)}>
                      {STATUS_STYLE[job.status].label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.po} · {job.style} · {job.name} ({job.color})
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl" disabled={job.status === "completed"}>
                    <Play className="mr-2 h-4 w-4" /> Resume
                  </Button>
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" disabled={job.status === "completed"}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark complete
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-muted-foreground">Finished pairs</p>
                  <p className="mt-1 text-xl font-bold">
                    {job.finished} <span className="text-sm font-normal text-muted-foreground">/ {job.total}</span>
                  </p>
                  <Progress value={progress} className="mt-2 h-1.5" />
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-muted-foreground">Operations done</p>
                  <p className="mt-1 text-xl font-bold">
                    {opsDone} <span className="text-sm font-normal text-muted-foreground">/ {OPERATIONS.length}</span>
                  </p>
                  <Progress value={(opsDone / OPERATIONS.length) * 100} className="mt-2 h-1.5" />
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-muted-foreground">Operator</p>
                  <p className="mt-1 flex items-center gap-2 text-base font-semibold">
                    <User className="h-4 w-4 text-muted-foreground" /> {job.operator}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{job.line}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Checklist */}
            <Card className="rounded-2xl py-2 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Finishing checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {OPERATIONS.map((op) => (
                  <label
                    key={op.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors",
                      checked[op.key] ? "border-emerald-200 bg-emerald-50/50" : "hover:bg-slate-50"
                    )}
                  >
                    <Checkbox
                      checked={!!checked[op.key]}
                      onCheckedChange={(v) => setChecked((p) => ({ ...p, [op.key]: !!v }))}
                    />
                    <span className={cn(checked[op.key] && "text-muted-foreground line-through")}>
                      {op.label}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Output entry */}
            <Card className="rounded-2xl py-2 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Record output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Size</label>
                    <Select defaultValue={job.sizes[0].size}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {job.sizes.map((s) => (
                          <SelectItem key={s.size} value={s.size}>{s.size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Good pairs</label>
                    <Input type="number" min={0} defaultValue={0} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Rejected / rework pairs</label>
                  <Input
                    type="number"
                    min={0}
                    value={rejected}
                    onChange={(e) => setRejected(e.target.value)}
                    className="rounded-xl"
                  />
                  {Number(rejected) > 0 && (
                    <p className="flex items-center gap-1 text-xs text-rose-600">
                      <AlertTriangle className="h-3 w-3" />
                      {rejected} pair Quality Inspection & Rework me bheje jayenge.
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Remarks</label>
                  <Textarea placeholder="Koi issue ya note likhein..." className="min-h-[72px] rounded-xl" />
                </div>
                <Button className="w-full rounded-xl bg-slate-950 hover:bg-slate-800">Save output</Button>
              </CardContent>
            </Card>
          </div>

          {/* Size wise */}
          <Card className="rounded-2xl py-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Size-wise progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Planned</TableHead>
                    <TableHead className="text-right">Finished</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[200px]">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.sizes.map((s) => (
                    <TableRow key={s.size}>
                      <TableCell className="font-medium">{s.size}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.qty}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.done}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.qty - s.done}</TableCell>
                      <TableCell>
                        <Progress value={(s.done / s.qty) * 100} className="h-1.5" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}