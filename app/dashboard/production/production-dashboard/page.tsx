import { Bar, Kpi, PageHeader, Section, StatusBadge, Sub, td, th } from "@/components/production/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const stages = [
  { name: "Cutting", wip: 1240, pct: 82 }, { name: "Stitching / Fitting", wip: 980, pct: 64 },
  { name: "Bottom Preparation", wip: 720, pct: 48 }, { name: "Lasting & Assembly", wip: 560, pct: 35 },
  { name: "Finishing & Packing", wip: 310, pct: 20 },
]
const risk = [
  { id: "PO-2026-114", art: "Oxford Classic – Tan", due: "20 Oct 2026", late: "In 2 days", pct: 58, s: "In Progress" },
  { id: "PO-2026-109", art: "Derby Formal – Black", due: "16 Oct 2026", late: "2 days late", pct: 71, s: "Delayed" },
  { id: "PO-2026-121", art: "Loafer Suede – Brown", due: "28 Oct 2026", late: "In 10 days", pct: 22, s: "Planned" },
]

export default function ProductionDashboard() {
  return (
    <div className="space-y-2 p-0">
      <PageHeader title="Production Dashboard" description="Live view of orders, WIP and output across every stage of the shoe floor." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Active orders" value="24" sub="6 starting this week" />
        <Kpi label="Pairs in WIP" value="3,810" sub="across 5 stages" />
        <Kpi label="On-time delivery" value="91%" sub="+3% vs last month" tone="green" />
        <Kpi label="Delayed orders" value="2" sub="needs attention" tone="red" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Section title="Orders at risk" flush>
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent">
              <TableHead className={th}>Order</TableHead><TableHead className={th}>Due</TableHead>
              <TableHead className={th}>Progress</TableHead><TableHead className={th}>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {risk.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className={td}><div className="font-medium">{r.id}</div><Sub>{r.art}</Sub></TableCell>
                  <TableCell className={td}><div>{r.due}</div><div className={`text-sm ${r.s === "Delayed" ? "text-red-600" : "text-muted-foreground"}`}>{r.late}</div></TableCell>
                  <TableCell className={`${td} w-48`}><Bar value={r.pct} tone={r.s === "Delayed" ? "red" : "indigo"} /></TableCell>
                  <TableCell className={td}><StatusBadge status={r.s} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
        <Section title="Stage pipeline">
          <div className="space-y-5">
            {stages.map((s) => (
              <div key={s.name}>
                <div className="mb-2 flex justify-between"><span>{s.name}</span><span className="font-semibold">{s.wip.toLocaleString("en-IN")} pairs</span></div>
                <Bar value={s.pct} />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}