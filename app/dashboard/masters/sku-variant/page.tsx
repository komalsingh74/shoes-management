"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Barcode, CheckCircle2, Shapes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type Item = { id: string; sku: string; style: string; size: string; color: string; hex: string; width: string; materials: string; mrp: number; status: "Active" | "Inactive" };

const seed: Item[] = [
  { id: "SKU-001", sku: "UR101-BLK-8", style: "Urban Runner", size: "UK 8", color: "Black", hex: "#111827", width: "Medium", materials: "Mesh upper + EVA sole", mrp: 1999, status: "Active" },
  { id: "SKU-002", sku: "UR101-WHT-9", style: "Urban Runner", size: "UK 9", color: "White", hex: "#f1f5f9", width: "Wide", materials: "Mesh upper + EVA sole", mrp: 1999, status: "Active" },
  { id: "SKU-003", sku: "CL204-BRN-7", style: "Classic Oxford", size: "UK 7", color: "Brown", hex: "#78350f", width: "Medium", materials: "Leather upper + PU sole", mrp: 3499, status: "Inactive" },
];
const blank = (): Item => ({ id: "", sku: "", style: "", size: "", color: "", hex: "#111827", width: "Medium", materials: "", mrp: 0, status: "Active" });
const initials = (s: string) => s.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const inp = "h-11 rounded-xl";

export default function SkuVariantMasterPage() {
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
    if (!String(form.sku).trim()) return;
    setRows((r) => form.id ? r.map((x) => (x.id === form.id ? form : x)) : [...r, { ...form, id: `SKU-${String(r.length + 1).padStart(3, "0")}` }]);
    setOpen(false);
  };

  const stats = [
    { icon: Barcode, label: "Total SKUs", value: rows.length },
    { icon: CheckCircle2, label: "Active SKUs", value: rows.filter((r) => r.status === "Active").length },
    { icon: Shapes, label: "Styles covered", value: new Set(rows.map((r) => r.style)).size },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Card className="p-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              SKU / Variant master
            </h1>
            <p className="mt-0 text-sm text-slate-500">
              Size, color, width and material combination for every unique sellable SKU.
            </p>
          </div>
          <Button
            onClick={openNew}
            className="group relative h-11 overflow-hidden rounded-xl bg-[#0b0b14] px-5 font-semibold text-white shadow-lg shadow-indigo-900/20 ring-1 ring-white/10 hover:bg-[#12121f]"
          >
            <span className="pointer-events-none absolute -left-6 -top-8 h-20 w-20 rounded-full bg-indigo-600/50 blur-2xl transition-opacity group-hover:opacity-80" />
            <span className="relative flex items-center">
              <Plus className="mr-2 h-4 w-4 text-indigo-300" />
              Add SKU
            </span>
          </Button>
        </header>
      </Card>

      <main className="mx-auto space-y-3 px-0 py-4">
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
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by SKU, style or color" className={`${inp} border-slate-200 bg-slate-50 pl-10`} />
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
                  {["SKU", "Size", "Color", "Width", "Material combination", "MRP", "Status"].map((h, i) => <TableHead key={h} className={i === 0 ? "pl-5" : ""}>{h}</TableHead>)}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => openEdit(r)}>
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl border border-slate-200" style={{ background: r.hex }} />
                        <div><p className="font-semibold text-slate-900">{r.sku}</p><p className="text-xs text-slate-500">{r.style}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{r.size}</TableCell>
                    <TableCell className="text-slate-600"><span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-slate-200" style={{ background: r.hex }} />{r.color}</span></TableCell>
                    <TableCell className="text-slate-600"><Badge variant="secondary" className="rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{r.width}</Badge></TableCell>
                    <TableCell className="text-slate-600">{r.materials}</TableCell>
                    <TableCell className="font-medium text-slate-900">₹{r.mrp.toLocaleString("en-IN")}</TableCell>
                    <TableCell><Badge className={r.status === "Active" ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100"}>{r.status}</Badge></TableCell>
                    <TableCell><Pencil className="h-4 w-4 text-slate-400" /></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="py-14 text-center text-slate-500">No SKUs found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans !max-w-2xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle className="text-xl font-bold">{form.id ? "Edit SKU" : "New SKU"}</SheetTitle>
            <SheetDescription>{form.id ? `${form.id} · ${form.sku}` : "Fill in the details, then save."}</SheetDescription>
          </SheetHeader>
          <Tabs defaultValue="a" className="flex-1 overflow-y-auto p-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100">
              <TabsTrigger value="a">Variant</TabsTrigger>
              <TabsTrigger value="b">Color & material</TabsTrigger>
            </TabsList>
            <TabsContent value="a" className="mt-5 space-y-4">
              <Field label="SKU code"><Input className={inp} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="UR101-BLK-8" /></Field>
              <Field label="Style"><Input className={inp} value={form.style} onChange={(e) => set("style", e.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Size"><Input className={inp} value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="UK 8" /></Field>
              <Pick label="Width" value={form.width} onChange={(v) => set("width", v as Item["width"])} options={["Narrow", "Medium", "Wide"]} />
              </div>
            </TabsContent>
            <TabsContent value="b" className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Color name"><Input className={inp} value={form.color} onChange={(e) => set("color", e.target.value)} /></Field>
              <Field label="Color shade">
                <div className="flex gap-2">
                  <input type="color" aria-label="Color shade" value={form.hex || "#000000"} onChange={(e) => set("hex", e.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-slate-200 bg-white p-1" />
                  <Input className={inp} value={form.hex} onChange={(e) => set("hex", e.target.value)} placeholder="#000000" />
                </div>
              </Field>
              </div>
              <Field label="Material combination"><Input className={inp} value={form.materials} onChange={(e) => set("materials", e.target.value)} placeholder="Mesh upper + EVA sole" /></Field>
              <Field label="MRP (₹)"><Input type="number" className={inp} value={form.mrp} onChange={(e) => set("mrp", +e.target.value)} /></Field>
              <Pick label="Status" value={form.status} onChange={(v) => set("status", v as Item["status"])} options={["Active", "Inactive"]} />
            </TabsContent>
          </Tabs>
          <SheetFooter className="flex-row justify-between gap-2 border-t border-slate-100 p-4">
            {form.id ? <Button variant="ghost" onClick={remove} className="h-11 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button> : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl">Cancel</Button>
              <Button onClick={save} className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]">Save SKU</Button>
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