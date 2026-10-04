"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, ListChecks, Shapes, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type Item = { id: string; style: string; size: string; color: string; component: string; material: string; qty: number; uom: string; wastage: number; status: "Active" | "Inactive" };

const seed: Item[] = [
  { id: "BOM-001", style: "Urban Runner", size: "UK 8", color: "Black", component: "Upper", material: "Air mesh fabric", qty: 0.45, uom: "meter", wastage: 5, status: "Active" },
  { id: "BOM-002", style: "Urban Runner", size: "UK 8", color: "Black", component: "Sole", material: "EVA sheet 10 mm", qty: 1, uom: "pair", wastage: 2, status: "Active" },
  { id: "BOM-003", style: "Classic Oxford", size: "UK 7", color: "Brown", component: "Upper", material: "Full grain leather", qty: 1.8, uom: "sq ft", wastage: 8, status: "Active" },
  { id: "BOM-004", style: "Classic Oxford", size: "UK 7", color: "Brown", component: "Adhesive", material: "PU adhesive", qty: 0.03, uom: "litre", wastage: 10, status: "Inactive" },
];
const blank = (): Item => ({ id: "", style: "", size: "", color: "", component: "Upper", material: "", qty: 0, uom: "sq ft", wastage: 0, status: "Active" });
const initials = (s: string) => s.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const inp = "h-11 rounded-xl";

export default function BomMasterPage() {
  const [rows, setRows] = useState<Item[]>(seed);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Item>(blank());

  const filtered = useMemo(
    () => rows.filter((r) => (status === "all" || r.status === status) && Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase())),
    [rows, q, status]
  );
  const set = <K extends keyof Item>(k: K, v: Item[K]) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setForm(blank()); setOpen(true); };
  const openEdit = (r: Item) => { setForm({ ...r }); setOpen(true); };
  const remove = () => { setRows((r) => r.filter((x) => x.id !== form.id)); setOpen(false); };
  const save = () => {
    if (!String(form.style).trim()) return;
    setRows((r) => form.id ? r.map((x) => (x.id === form.id ? form : x)) : [...r, { ...form, id: `BOM-${String(r.length + 1).padStart(3, "0")}` }]);
    setOpen(false);
  };

  const stats = [
    { icon: ListChecks, label: "Total BOM lines", value: rows.length },
    { icon: Shapes, label: "Styles covered", value: new Set(rows.map((r) => r.style)).size },
    { icon: CheckCircle2, label: "Active lines", value: rows.filter((r) => r.status === "Active").length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="relative overflow-hidden bg-[#0b0b14] px-6 pb-24 pt-3 text-white md:px-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">BOM master</h1>
            <p className="mt-1 max-w-md text-sm text-slate-400">Exact materials and components required for each shoe style, size and color.</p>
          </div>
          <Button onClick={openNew} className="h-11 rounded-xl bg-indigo-500 px-5 font-semibold text-white hover:bg-indigo-400"><Plus className="mr-2 h-4 w-4" /> Add BOM line</Button>
        </div>
      </header>

      <main className="relative mx-auto -mt-18 max-w-8xl space-y-5 px-6 pb-12 md:px-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <Card key={label} className="flex-row items-center gap-4 rounded-2xl border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-sm text-slate-500">{label}</p></div>
            </Card>
          ))}
        </div>

        <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-lg shadow-slate-900/5">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by style, component or material" className={`${inp} border-slate-200 bg-slate-50 pl-10`} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className={`${inp} w-40 border-slate-200 bg-slate-50`}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  {["Style / size / color", "Component", "Material", "Quantity", "Wastage", "Status"].map((h, i) => <TableHead key={h} className={i === 0 ? "pl-5" : ""}>{h}</TableHead>)}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => openEdit(r)}>
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#111827] text-xs font-semibold text-white">{initials(r.style)}</div>
                        <div><p className="font-semibold text-slate-900">{r.style}</p><p className="text-xs text-slate-500">{r.size} · {r.color}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600"><Badge variant="secondary" className="rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{r.component}</Badge></TableCell>
                    <TableCell className="text-slate-600">{r.material}</TableCell>
                    <TableCell className="font-medium text-slate-900">{r.qty} {r.uom}</TableCell>
                    <TableCell className="text-slate-600">{r.wastage}%</TableCell>
                    <TableCell><Badge className={r.status === "Active" ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100"}>{r.status}</Badge></TableCell>
                    <TableCell><Pencil className="h-4 w-4 text-slate-400" /></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-14 text-center text-slate-500">No BOM lines found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans !max-w-2xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle className="text-xl font-bold">{form.id ? "Edit BOM line" : "New BOM line"}</SheetTitle>
            <SheetDescription>{form.id ? `${form.id} · ${form.style}` : "Fill in the details, then save."}</SheetDescription>
          </SheetHeader>
          <Tabs defaultValue="a" className="flex-1 overflow-y-auto p-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100">
              <TabsTrigger value="a">For which shoe</TabsTrigger>
              <TabsTrigger value="b">Component</TabsTrigger>
            </TabsList>
            <TabsContent value="a" className="mt-5 space-y-4">
              <Field label="Style"><Input className={inp} value={form.style} onChange={(e) => set("style", e.target.value)} placeholder="Urban Runner" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Size"><Input className={inp} value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="UK 8" /></Field>
              <Field label="Color"><Input className={inp} value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="Black" /></Field>
              </div>
            </TabsContent>
            <TabsContent value="b" className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
              <Pick label="Component" value={form.component} onChange={(v) => set("component", v as Item["component"])} options={["Upper", "Lining", "Insole", "Outsole", "Sole", "Heel", "Lace", "Thread", "Adhesive", "Packing"]} />
              <Field label="Material"><Input className={inp} value={form.material} onChange={(e) => set("material", e.target.value)} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Quantity per pair"><Input type="number" className={inp} value={form.qty} onChange={(e) => set("qty", +e.target.value)} /></Field>
              <Pick label="Unit" value={form.uom} onChange={(v) => set("uom", v as Item["uom"])} options={["sq ft", "meter", "kg", "pcs", "litre", "pair"]} />
              </div>
              <Field label="Wastage (%)"><Input type="number" className={inp} value={form.wastage} onChange={(e) => set("wastage", +e.target.value)} /></Field>
              <Pick label="Status" value={form.status} onChange={(v) => set("status", v as Item["status"])} options={["Active", "Inactive"]} />
            </TabsContent>
          </Tabs>
          <SheetFooter className="flex-row justify-between gap-2 border-t border-slate-100 p-4">
            {form.id ? <Button variant="ghost" onClick={remove} className="h-11 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button> : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl">Cancel</Button>
              <Button onClick={save} className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]">Save BOM line</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-700">{label}</Label>{children}</div>;
}
function Pick({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`${inp} w-full`}><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </Field>
  );
}