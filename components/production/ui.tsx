import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { SummaryCard } from "./summary-card"

export const btnPrimary =
  "h-11 shrink-0 rounded-xl bg-[#0b0b14] px-5 font-semibold text-white shadow-lg shadow-indigo-900/20 hover:bg-[#12121f]"

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="min-h-20 flex-col items-start justify-between gap-3 rounded-2xl bg-linear-to-br from-white to-slate-50/80 px-5 py-2 ring-1 ring-slate-200/80 shadow-sm sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </Card>
  )
}

export function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "red" | "green" }) {
  return (
    <SummaryCard label={label} value={value} sub={sub} tone={tone === "red" ? "bg-rose-50 text-rose-600" : tone === "green" ? "bg-emerald-50 text-emerald-600" : undefined} />
  )
}

export function Section({ title, action, children, className, flush }: { title: string; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <Card className={cn("gap-0 overflow-hidden rounded-2xl px-0 py-2 shadow-sm", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <div className={flush ? "" : "px-5 py-2"}>{children}</div>
    </Card>
  )
}

export function Bar({ value, tone = "indigo" }: { value: number; tone?: "indigo" | "red" | "green" | "amber" }) {
  const c = { indigo: "bg-indigo-600", red: "bg-red-500", green: "bg-emerald-500", amber: "bg-amber-500" }[tone]
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div className={cn("h-full rounded-full", c)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

const tones: Record<string, string> = {
  "In Progress": "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Ready: "bg-emerald-50 text-emerald-700",
  Delayed: "bg-red-50 text-red-600",
  Short: "bg-red-50 text-red-600",
  Planned: "bg-slate-100 text-slate-600",
  Draft: "bg-slate-100 text-slate-600",
  Partial: "bg-amber-50 text-amber-700",
  "On Hold": "bg-amber-50 text-amber-700",
  Urgent: "bg-red-50 text-red-600",
  High: "bg-amber-50 text-amber-700",
  Normal: "bg-slate-100 text-slate-600",
}
export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", tones[status] ?? tones.Planned)}>{status}</span>
}

export const th = "h-12 bg-muted/40 px-2 text-sm font-medium text-foreground"
export const td = "px-6 py-4"
export const Sub = ({ children }: { children: ReactNode }) => <div className="text-sm text-muted-foreground">{children}</div>
