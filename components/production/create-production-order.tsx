"use client"

import { useId, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader, Section, btnPrimary } from "./ui"
import { useProductionOrders } from "./use-production-orders"

const products = [
  { id: "ox", name: "Oxford Classic - Tan", material: "Full-grain leather", upper: 0.62, lining: 0.38, sole: "TPR sole unit" },
  { id: "dr", name: "Derby Formal - Black", material: "Full-grain leather", upper: 0.68, lining: 0.40, sole: "Rubber sole unit" },
  { id: "lo", name: "Loafer Suede - Brown", material: "Suede", upper: 0.58, lining: 0.34, sole: "TPR sole unit" },
]
const sizes = [6, 7, 8, 9, 10, 11]
const emptyRun = () => Object.fromEntries(sizes.map((size) => [size, 0])) as Record<number, number>
const selectClass = "h-11 w-full rounded-xl border bg-background px-3 text-sm"

export default function CreateProductionOrder({ onCreated }: { onCreated?: (id: string) => void }) {
  const id = useId()
  const { createOrder } = useProductionOrders()
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [start, setStart] = useState("")
  const [target, setTarget] = useState("")
  const [customer, setCustomer] = useState("")
  const [priority, setPriority] = useState("Normal")
  const [notes, setNotes] = useState("")
  const [run, setRun] = useState<Record<number, number>>(emptyRun)
  const [error, setError] = useState("")
  const product = products.find((item) => item.id === productId)
  const total = Number(quantity) || 0
  const sizeTotal = Object.values(run).reduce((sum, count) => sum + count, 0)
  const formId = id + "-form"

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (!product || !start || !target || !Number.isSafeInteger(total) || total < 1) {
      setError("Select a product, enter a whole quantity above zero and complete both dates.")
      return
    }
    if (target < start) { setError("Target date must be on or after the planned start date."); return }
    if (Object.values(run).some((count) => !Number.isSafeInteger(count) || count < 0) || (sizeTotal !== 0 && sizeTotal !== total)) {
      setError("Size quantities must be whole numbers and their total must match the order quantity, or leave all sizes at zero.")
      return
    }
    const orderId = "PO-" + start.slice(0, 4) + "-" + crypto.randomUUID().slice(0, 8).toUpperCase()
    try {
      createOrder({ id: orderId, art: product.name, cust: customer || "Unassigned", qty: total,
        due: new Date(target + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        plannedStart: start, targetDate: target, priority, notes, sizeRun: { ...run }, pct: 0, s: "Planned" })
    } catch {
      setError("Could not save the order in this browser. Enable browser storage and try again.")
      return
    }
    setProductId(""); setQuantity(""); setStart(""); setTarget(""); setCustomer(""); setPriority("Normal"); setNotes(""); setRun(emptyRun())
    onCreated?.(orderId)
  }

  return (
    <div className="space-y-2">
      <PageHeader title="Create Production Order" description="Choose a product, plan quantities and dates, and review material requirements."
        action={<Button type="submit" form={formId} className={btnPrimary}>Save Production Order</Button>} />
      <form id={formId} onSubmit={save} className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-2">
          <Section title="Order details">
            <div className="grid gap-4 py-2 md:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor={id + "-product"}>Product *</Label>
                <select id={id + "-product"} value={productId} onChange={(e) => setProductId(e.target.value)} required className={selectClass}>
                  <option value="" disabled>Select product</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select></div>
              <div className="space-y-1.5"><Label htmlFor={id + "-quantity"}>Quantity (pairs) *</Label>
                <Input id={id + "-quantity"} type="number" min={1} step={1} required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><Label htmlFor={id + "-start"}>Planned Start Date *</Label>
                <Input id={id + "-start"} type="date" required value={start} onChange={(e) => setStart(e.target.value)} className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><Label htmlFor={id + "-target"}>Target Date *</Label>
                <Input id={id + "-target"} type="date" min={start || undefined} required value={target} onChange={(e) => setTarget(e.target.value)} className="h-11 rounded-xl" /></div>
              <div className="space-y-1.5"><Label htmlFor={id + "-customer"}>Customer / Sales order</Label>
                <select id={id + "-customer"} value={customer} onChange={(e) => setCustomer(e.target.value)} className={selectClass}>
                  <option value="">Unassigned</option><option value="Bata Retail">SO-3301 - Bata Retail</option><option value="Metro Footwear">SO-3305 - Metro Footwear</option>
                </select></div>
              <div className="space-y-1.5"><Label htmlFor={id + "-priority"}>Priority</Label>
                <select id={id + "-priority"} value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>{["Normal", "High", "Urgent"].map((value) => <option key={value}>{value}</option>)}</select></div>
              <div className="space-y-1.5 md:col-span-2"><Label htmlFor={id + "-notes"}>Notes</Label><Textarea id={id + "-notes"} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions for the floor" className="rounded-xl" /></div>
            </div>
          </Section>
          <Section title="Size run (UK, optional)" action={<span className="text-sm font-semibold">{sizeTotal.toLocaleString("en-IN")} / {total.toLocaleString("en-IN")} pairs</span>}>
            <div className="grid grid-cols-3 gap-3 py-2 md:grid-cols-6">{sizes.map((size) => <div key={size} className="space-y-1.5"><Label htmlFor={id + "-size-" + size}>Size {size}</Label><Input id={id + "-size-" + size} type="number" min={0} step={1} value={run[size]} onChange={(e) => setRun({ ...run, [size]: Number(e.target.value) })} className="h-11 rounded-xl" /></div>)}</div>
          </Section>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <p className="text-xs text-slate-500">Orders are saved in this browser. Material quantities below are planning estimates from the sample BOM.</p>
        </div>
        <Section title="Required materials / BOM">
          {!product ? <p className="py-4 text-sm text-slate-500">Select a product to view its BOM and total material requirements.</p> : <>
            <p className="py-2 text-sm font-medium">{product.name} / {total.toLocaleString("en-IN")} pairs</p>
            <div className="divide-y">{[
              [product.material, product.upper + " m2", (total * product.upper).toFixed(2) + " m2"],
              ["Lining", product.lining + " m2", (total * product.lining).toFixed(2) + " m2"],
              [product.sole, "1 pair", total.toLocaleString("en-IN") + " pairs"],
              ["Insole board", "1 pair", total.toLocaleString("en-IN") + " pairs"],
              ["Thread / adhesive", "18 g", (total * 18 / 1000).toFixed(2) + " kg"],
            ].map(([name, perPair, required]) => <div key={name} className="flex items-center justify-between gap-3 py-2"><div><p className="text-sm">{name}</p><p className="text-xs text-slate-500">{perPair} per pair</p></div><span className="text-sm font-semibold tabular-nums">{required}</span></div>)}</div>
          </>}
        </Section>
      </form>
    </div>
  )
}
