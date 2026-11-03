import { Activity, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SummaryCard({ label, value, sub, icon: Icon = Activity, tone }: {
  label: string; value: string; sub?: string; icon?: LucideIcon; tone?: string
}) {
  return (
    <Card className="relative isolate h-20 min-w-0 flex-row items-center gap-3 rounded-2xl bg-linear-to-br from-white to-slate-50/80 px-4 py-2 ring-1 ring-slate-200/80 shadow-sm shadow-slate-900/5 transition-[box-shadow,background-color] duration-200 hover:shadow-md hover:shadow-slate-900/10">
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ring-current/10", tone || "bg-indigo-50 text-indigo-600")}>
        <Icon className="size-[18px]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-bold leading-6 tracking-tight text-slate-900 tabular-nums">{value}</p>
        <p className="truncate text-sm font-medium leading-5 text-slate-500" title={label}>{label}</p>
        {sub && <p className="truncate text-xs leading-4 text-slate-400" title={sub}>{sub}</p>}
      </div>
    </Card>
  )
}
