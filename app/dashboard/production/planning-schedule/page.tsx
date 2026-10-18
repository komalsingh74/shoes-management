import { Button } from "@/components/ui/button"
import { Bar, Kpi, PageHeader, Section, btnPrimary } from "@/components/production/ui"

const days = ["Mon 19", "Tue 20", "Wed 21", "Thu 22", "Fri 23", "Sat 24"]
const lines: { name: string; load: number; slots: (string | null)[] }[] = [
  { name: "Cutting", load: 86, slots: ["PO-114", "PO-114", "PO-121", "PO-121", "PO-125", null] },
  { name: "Stitching Line A", load: 94, slots: ["PO-109", "PO-109", "PO-114", "PO-114", "PO-114", "PO-121"] },
  { name: "Stitching Line B", load: 62, slots: ["PO-121", "PO-121", null, "PO-125", "PO-125", null] },
  { name: "Lasting", load: 71, slots: [null, "PO-109", "PO-109", "PO-114", "PO-121", "PO-121"] },
]
const chip = (s: string | null) => !s ? "bg-muted/50 text-muted-foreground" : s.endsWith("109") ? "bg-red-50 text-red-600" : s.endsWith("114") ? "bg-blue-50 text-blue-700" : s.endsWith("121") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"

export default function PlanningScheduling() {
  return (
    <div className="space-y-2 p-0">
      <PageHeader title="Planning & Scheduling" description="Assign orders to lines for the week and balance capacity."
        action={<Button className={btnPrimary}>Auto-schedule</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="Weekly capacity" value="4,800 pairs" sub="6 working days" />
        <Kpi label="Planned load" value="3,970 pairs" sub="83% utilised" />
        <Kpi label="Over-capacity lines" value="1" sub="Stitching Line A" tone="red" />
      </div>
      <Section title="Week of 19 Oct 2026" flush>
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[220px_repeat(6,1fr)] bg-muted/40 text-sm font-medium">
              <div className="px-6 py-3.5">Line</div>{days.map((d) => <div key={d} className="px-3 py-3.5">{d}</div>)}
            </div>
            {lines.map((l) => (
              <div key={l.name} className="grid grid-cols-[220px_repeat(6,1fr)] items-center border-t">
                <div className="px-6 py-4"><div className="font-medium">{l.name}</div>
                  <div className="mt-2 flex items-center gap-2"><Bar value={l.load} tone={l.load > 90 ? "red" : "indigo"} /><span className="text-xs text-muted-foreground">{l.load}%</span></div></div>
                {l.slots.map((s, i) => <div key={i} className="p-2"><div className={`rounded-lg px-2 py-3 text-center text-xs font-medium ${chip(s)}`}>{s ?? "Free"}</div></div>)}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}