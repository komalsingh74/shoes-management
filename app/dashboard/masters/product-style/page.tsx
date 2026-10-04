"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Shapes, CheckCircle2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Style = { id: string; code: string; name: string; model: string; brand: string; gender: string; category: string; season: string; construction: string; status: "Active" | "Inactive" };

const seed: Style[] = [
  { id: "ST-001", code: "UR-101", name: "Urban Runner", model: "Runner V2", brand: "ShoeFlow", gender: "Men", category: "Sports", season: "AW26", construction: "Cemented", status: "Active" },
  { id: "ST-002", code: "CL-204", name: "Classic Oxford", model: "Oxford 1", brand: "ShoeFlow", gender: "Men", category: "Formal", season: "SS27", construction: "Stitched", status: "Active" },
  { id: "ST-003", code: "KD-310", name: "Little Stride", model: "Kids Fun", brand: "Tiny Steps", gender: "Kids", category: "Casual", season: "SS27", construction: "Vulcanized", status: "Inactive" },
];
const blank = (): Style => ({ id: "", code: "", name: "", model: "", brand: "", gender: "Men", category: "Casual", season: "", construction: "Cemented", status: "Active" });
const initials = (s: string) => s.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const inp = "h-11 rounded-xl";

export default function ProductStyleMasterPage() {
  const [rows, setRows] = useState<Style[]>(seed);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Style>(blank());

  const filtered = useMemo(
    () => rows.filter((r) => (status === "all" || r.status === status) && Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase())),
    [rows, q, status]
  );
  const set = <K extends keyof Style>(k: K, v: Style[K]) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setForm(blank()); setOpen(true); };
  const openEdit = (r: Style) => { setForm({ ...r }); setOpen(true); };
  const remove = () => { setRows((r) => r.filter((x) => x.id !== form.id)); setOpen(false); };
  const save = () => {
    if (!form.name.trim()) return;
    setRows((r) => form.id ? r.map((x) => (x.id === form.id ? form : x)) : [...r, { ...form, id: `ST-${String(r.length + 1).padStart(3, "0")}` }]);
    setOpen(false);
  };

  const stats = [
    { icon: Shapes, label: "Total styles", value: rows.length },
    { icon: CheckCircle2, label: "Active styles", value: rows.filter((r) => r.status === "Active").length },
    { icon: Tag, label: "Brands", value: new Set(rows.map((r) => r.brand)).size },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="relative overflow-hidden bg-[#0b0b14] px-6 pb-24 pt-3 text-white md:px-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
          <div>
            {/* <p className="text-sm font-semibold">Shoe<span className="text-indigo-400">Flow</span></p> */}
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Product / Style master</h1>
            <p className="mt-1 max-w-md text-sm text-slate-400">Shoe style, model, gender, category, season, construction and brand.</p>
          </div>
          <Button onClick={openNew} className="h-11 rounded-xl bg-indigo-500 px-5 font-semibold text-white hover:bg-indigo-400"><Plus className="mr-2 h-4 w-4" /> Add style</Button>
        </div>
      </header>

      <main className="relative mx-auto -mt-18 max-w-8xl space-y-5 px-6 pb-10 md:px-10">
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
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by style, brand or category" className={`${inp} border-slate-200 bg-slate-50 pl-10`} />
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
                  {["Style", "Brand", "Gender", "Category", "Season", "Construction", "Status"].map((h, i) => <TableHead key={h} className={i === 0 ? "pl-5" : ""}>{h}</TableHead>)}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => openEdit(r)}>
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#111827] text-xs font-semibold text-white">{initials(r.name)}</div>
                        <div><p className="font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.code} · {r.model}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{r.brand}</TableCell>
                    <TableCell><Badge variant="secondary" className="rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{r.gender}</Badge></TableCell>
                    <TableCell className="text-slate-600">{r.category}</TableCell>
                    <TableCell className="text-slate-600">{r.season}</TableCell>
                    <TableCell className="text-slate-600">{r.construction}</TableCell>
                    <TableCell><Badge className={r.status === "Active" ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100"}>{r.status}</Badge></TableCell>
                    <TableCell><Pencil className="h-4 w-4 text-slate-400" /></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="py-14 text-center text-slate-500">No styles found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans sm:max-w-xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle className="text-xl font-bold">{form.id ? "Edit style" : "New style"}</SheetTitle>
            <SheetDescription>{form.id ? `${form.id} · ${form.name}` : "Fill in the style details, then save."}</SheetDescription>
          </SheetHeader>
          <Tabs defaultValue="details" className="flex-1 overflow-y-auto p-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100">
              <TabsTrigger value="details">Style details</TabsTrigger>
              <TabsTrigger value="class">Classification</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-5 space-y-4">
              <Field label="Style name"><Input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Urban Runner" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Style code"><Input className={inp} value={form.code} onChange={(e) => set("code", e.target.value)} /></Field>
                <Field label="Model"><Input className={inp} value={form.model} onChange={(e) => set("model", e.target.value)} /></Field>
              </div>
              <Field label="Brand"><Input className={inp} value={form.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
            </TabsContent>
            <TabsContent value="class" className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Pick label="Gender" value={form.gender} onChange={(v) => set("gender", v)} options={["Men", "Women", "Kids", "Unisex"]} />
                <Pick label="Category" value={form.category} onChange={(v) => set("category", v)} options={["Casual", "Formal", "Sports", "Sneakers", "Sandals", "Boots"]} />
                <Field label="Season"><Input className={inp} value={form.season} onChange={(e) => set("season", e.target.value)} placeholder="AW26" /></Field>
                <Pick label="Construction" value={form.construction} onChange={(v) => set("construction", v)} options={["Cemented", "Vulcanized", "Stitched", "Injection moulded", "Strobel"]} />
              </div>
              <Pick label="Status" value={form.status} onChange={(v) => set("status", v as Style["status"])} options={["Active", "Inactive"]} />
            </TabsContent>
          </Tabs>
          <SheetFooter className="flex-row justify-between gap-2 border-t border-slate-100 p-4">
            {form.id ? <Button variant="ghost" onClick={remove} className="h-11 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button> : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl">Cancel</Button>
              <Button onClick={save} className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]">Save style</Button>
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