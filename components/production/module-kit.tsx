"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PageHeader as ProductionHeader } from "./ui";
import { SummaryCard } from "./summary-card";

export function PageHeader({ title, desc, actions }: {
  step: string; title: string; desc: string; actions?: ReactNode;
}) {
  return <ProductionHeader title={title} description={desc} action={<div className="flex flex-wrap items-center gap-2 [&_button]:h-11 [&_button]:rounded-xl">{actions}</div>} />;
}

export type Stat = { label: string; value: string; icon: LucideIcon; tone: string };

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => <SummaryCard key={stat.label} {...stat} />)}
    </div>
  );
}

const GOOD = ["passed", "completed", "received", "packed", "dispatched", "traced", "ok"];
const WARN = ["pending", "in transit", "in progress", "open", "partial"];
const BAD = ["rejected", "rework", "failed", "delayed"];

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone = GOOD.includes(s) ? "bg-emerald-100 text-emerald-700"
    : WARN.includes(s) ? "bg-amber-100 text-amber-800"
    : BAD.includes(s) ? "bg-rose-100 text-rose-700"
    : "bg-slate-100 text-slate-700";
  return <Badge className={cn("rounded-full border-0 font-medium", tone)}>{status}</Badge>;
}

export type Column<T> = {
  header: string; align?: "right"; render: (row: T) => ReactNode;
};

export function DataCard<T>({ title, columns, rows, toolbar }: {
  title: string; columns: Column<T>[]; rows: T[]; toolbar?: ReactNode;
}) {
  return (
    <Card className="gap-2 rounded-2xl py-2 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 py-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {toolbar}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.header} className={cn(c.align === "right" && "text-right")}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c.header} className={cn(c.align === "right" && "text-right tabular-nums")}>
                    {c.render(r)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function BarRow({ label, value, max, tone = "bg-indigo-500" }: {
  label: string; value: number; max: number; tone?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={cn("h-2 rounded-full", tone)} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}
