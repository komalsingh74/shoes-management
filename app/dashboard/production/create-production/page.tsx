"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader, Section, btnPrimary } from "@/components/production/ui"

const sizes = [6, 7, 8, 9, 10, 11]
const bom = [["Full-grain leather", "0.62 m²"], ["Lining – pigskin", "0.38 m²"], ["TPR sole unit", "1 pair"], ["Insole board", "1 pair"], ["Thread / adhesive", "18 g"]]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>
}

export default function CreateProductionOrder() {
  const [run, setRun] = useState<Record<number, number>>({ 6: 100, 7: 250, 8: 350, 9: 300, 10: 150, 11: 50 })
  const total = Object.values(run).reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-2 p-0">
      <PageHeader title="Create Production Order" description="Pick an article, set the size run and delivery date. Materials are checked automatically."
        action={<Button className={btnPrimary}>Create order</Button>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Section title="Order details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Article">
                <Select><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="Select article" /></SelectTrigger>
                  <SelectContent><SelectItem value="ox">Oxford Classic – Tan</SelectItem><SelectItem value="dr">Derby Formal – Black</SelectItem><SelectItem value="lo">Loafer Suede – Brown</SelectItem></SelectContent></Select>
              </Field>
              <Field label="Customer / Sales order">
                <Select><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="Link sales order" /></SelectTrigger>
                  <SelectContent><SelectItem value="so1">SO-3301 · Bata Retail</SelectItem><SelectItem value="so2">SO-3305 · Metro Footwear</SelectItem></SelectContent></Select>
              </Field>
              <Field label="Delivery date"><Input type="date" className="h-11 rounded-xl" /></Field>
              <Field label="Priority">
                <Select defaultValue="Normal"><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Normal", "High", "Urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
              </Field>
              <div className="md:col-span-2"><Field label="Notes"><Textarea placeholder="Special instructions for the floor…" className="rounded-xl" /></Field></div>
            </div>
          </Section>
          <Section title="Size run (UK)" action={<span className="font-semibold">{total.toLocaleString("en-IN")} pairs</span>}>
            <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
              {sizes.map((s) => (
                <Field key={s} label={`Size ${s}`}>
                  <Input type="number" value={run[s]} onChange={(e) => setRun({ ...run, [s]: +e.target.value })} className="h-11 rounded-xl" />
                </Field>
              ))}
            </div>
          </Section>
        </div>
        <Section title="Material requirement (BOM)">
          <p className="mb-4 text-sm text-muted-foreground">Per pair, from the article's approved BOM.</p>
          <div className="divide-y">
            {bom.map(([n, q]) => <div key={n} className="flex justify-between py-3"><span>{n}</span><span className="font-medium">{q}</span></div>)}
          </div>
          <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm">Total leather needed: <b>{(total * 0.62).toFixed(0)} m²</b></div>
        </Section>
      </div>
    </div>
  )
}