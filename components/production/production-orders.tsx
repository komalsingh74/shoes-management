"use client"

import { useState } from "react"
import Link from "next/link"
import { useProductionOrders } from "./use-production-orders"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, PageHeader, Section, StatusBadge, Sub, btnPrimary, td, th } from "@/components/production/ui"


export default function ProductionOrders() {
  const { orders } = useProductionOrders()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All")
  const filteredOrders = orders.filter((order) =>
    (status === "All" || order.s === status) &&
    [order.id, order.art, order.cust].join(" ").toLowerCase().includes(query.trim().toLowerCase())
  )
  return (
    <div className="space-y-2 p-0">
      <PageHeader title="Production Orders" description="Track every order from material reservation to packing."
        action={<Button asChild className={btnPrimary}><Link href="/dashboard/production/production-management?tab=create"><Plus className="mr-2 size-4" />Create Production Order</Link></Button>} />
      <Section title="All orders" flush action={
        <div className="flex flex-wrap items-center gap-2"><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search orders" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders…" className="h-10 rounded-xl pl-9" /></div><select aria-label="Filter orders by status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border bg-background px-3 text-sm">
          {["All", "Planned", "In Progress", "Delayed", "Completed"].map((value) => <option key={value} value={value}>{value === "All" ? "All statuses" : value}</option>)}
        </select></div>}>
        <Table>
          <TableHeader><TableRow className="hover:bg-transparent">
            {["Order", "Customer", "Pairs", "Due", "Progress", "Status"].map((h) => <TableHead key={h} className={th}>{h}</TableHead>)}
          </TableRow></TableHeader>
          <TableBody>
            {filteredOrders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className={td}><div className="font-medium">{o.id}</div><Sub>{o.art}</Sub></TableCell>
                <TableCell className={td}>{o.cust}</TableCell>
                <TableCell className={td}>{o.qty.toLocaleString("en-IN")}</TableCell>
                <TableCell className={td}>{o.due}</TableCell>
                <TableCell className={`${td} w-44`}><Bar value={o.pct} tone={o.s === "Delayed" ? "red" : o.pct === 100 ? "green" : "indigo"} /></TableCell>
                <TableCell className={td}><StatusBadge status={o.s} /></TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No orders match your filters.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Section>
    </div>
  )
}