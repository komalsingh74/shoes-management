import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, PageHeader, Section, StatusBadge, Sub, btnPrimary, td, th } from "@/components/production/ui"

const orders = [
  { id: "PO-2026-121", art: "Loafer Suede – Brown", cust: "Metro Footwear", qty: 1200, due: "28 Oct 2026", pct: 22, s: "Planned" },
  { id: "PO-2026-114", art: "Oxford Classic – Tan", cust: "Bata Retail", qty: 2400, due: "20 Oct 2026", pct: 58, s: "In Progress" },
  { id: "PO-2026-109", art: "Derby Formal – Black", cust: "Walkway Stores", qty: 1800, due: "16 Oct 2026", pct: 71, s: "Delayed" },
  { id: "PO-2026-102", art: "Sneaker Court – White", cust: "Urban Steps", qty: 3000, due: "10 Oct 2026", pct: 100, s: "Completed" },
]

export default function ProductionOrders() {
  return (
    <div className="space-y-2 p-0">
      <PageHeader title="Production Orders" description="Track every order from material reservation to packing."
        action={<Button asChild className={btnPrimary}><Link href="/dashboard/production/create-production"><Plus className="mr-2 size-4" />New order</Link></Button>} />
      <Section title="All orders" flush action={
        <div className="relative w-72"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input placeholder="Search orders…" className="h-10 rounded-xl pl-9" /></div>}>
        <Table>
          <TableHeader><TableRow className="hover:bg-transparent">
            {["Order", "Customer", "Pairs", "Due", "Progress", "Status"].map((h) => <TableHead key={h} className={th}>{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className={td}><div className="font-medium">{o.id}</div><Sub>{o.art}</Sub></TableCell>
                <TableCell className={td}>{o.cust}</TableCell>
                <TableCell className={td}>{o.qty.toLocaleString("en-IN")}</TableCell>
                <TableCell className={td}>{o.due}</TableCell>
                <TableCell className={`${td} w-44`}><Bar value={o.pct} tone={o.s === "Delayed" ? "red" : o.pct === 100 ? "green" : "indigo"} /></TableCell>
                <TableCell className={td}><StatusBadge status={o.s} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </div>
  )
}