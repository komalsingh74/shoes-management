"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Kpi, PageHeader, Section, StatusBadge, Sub, btnPrimary, td, th } from "@/components/production/ui"

const rows = [
  { id: "PO-114", mat: "Full-grain leather – Tan", req: 1488, res: 1488, iss: 900, stock: 4200, s: "Partial" },
  { id: "PO-114", mat: "TPR sole unit (UK 6–11)", req: 2400, res: 2400, iss: 0, stock: 3100, s: "Ready" },
  { id: "PO-109", mat: "Pigskin lining", req: 684, res: 520, iss: 0, stock: 520, s: "Short" },
  { id: "PO-121", mat: "Suede – Brown", req: 744, res: 744, iss: 744, stock: 1800, s: "Completed" },
]

export default function MaterialReservationIssue() {
  const [sel, setSel] = useState<number[]>([1])
  return (
    <div className="space-y-2 p-0">
      <PageHeader title="Material Reservation & Issue" description="Reserve stock against orders, then issue to the shop floor. Short items are flagged for purchase."
        action={<Button className={btnPrimary}>Issue materials ({sel.length})</Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Orders awaiting issue" value="5" />
        <Kpi label="Fully reserved" value="12" tone="green" />
        <Kpi label="Short items" value="1" sub="raise purchase request" tone="red" />
        <Kpi label="Issued today" value="38 lines" />
      </div>
      <Section title="Material lines" flush action={<Tabs defaultValue="all"><TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="res">Reserved</TabsTrigger><TabsTrigger value="short">Short</TabsTrigger></TabsList></Tabs>}>
        <Table>
          <TableHeader><TableRow className="hover:bg-transparent">
            <TableHead className={`${th} w-12`} />
            {["Order / Material", "Required", "Reserved", "Issued", "In stock", "Status"].map((h) => <TableHead key={h} className={th}>{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="pl-6"><Checkbox checked={sel.includes(i)} onCheckedChange={() => setSel((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i])} /></TableCell>
                <TableCell className={td}><div className="font-medium">{r.mat}</div><Sub>{r.id}</Sub></TableCell>
                {[r.req, r.res, r.iss, r.stock].map((n, j) => <TableCell key={j} className={td}>{n.toLocaleString("en-IN")}</TableCell>)}
                <TableCell className={td}><StatusBadge status={r.s} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </div>
  )
}