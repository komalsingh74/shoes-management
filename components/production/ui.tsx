import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

export const btnPrimary =
  "h-12 rounded-xl bg-black px-6 text-base font-semibold text-white shadow-md hover:bg-black/90"

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="flex-row items-center justify-between gap-4 rounded-2xl border p-6 shadow-sm">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      {action}
    </Card>
  )
}

export function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "red" | "green" }) {
  return (
    <Card className="gap-1 rounded-2xl p-6 shadow-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className={cn("text-3xl font-bold tracking-tight", tone === "red" && "text-red-600", tone === "green" && "text-emerald-600")}>{value}</p>
      <p className="h-5 text-sm text-muted-foreground">{sub}</p>
    </Card>
  )
}

export function Section({ title, action, children, className, flush }: { title: string; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return (
    <Card className={cn("gap-0 overflow-hidden rounded-2xl p-0 shadow-sm", className)}>
      <div className="flex items-center justify-between border-b px-6 py-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <div className={flush ? "" : "p-6"}>{children}</div>
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