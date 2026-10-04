"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, ListOrdered, CheckCircle2, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type Item = { id: string; name: string; code: string; seq: number; dept: string; stdTime: number; station: string; rate: number; status: "Active" | "Inactive" };

const seed: Item[] = [
  { id: "OP-001", name: "Cutting", code: "CUT", seq: 1, dept: "Cutting", stdTime: 6, station: "Clicking press", rate: 4, status: "Active" },
  { id: "OP-002", name: "Skiving", code: "SKV", seq: 2, dept: "Cutting", stdTime: 3, station: "Skiving machine", rate: 2, status: "Active" },
  { id: "OP-003", name: "Stitching", code: "STC", seq: 3, dept: "Stitching", stdTime: 14, station: "Stitching line A", rate: 12, status: "Active" },
  { id: "OP-004", name: "Lasting", code: "LST", seq: 4, dept: "Lasting", stdTime: 8, station: "Lasting machine", rate: 6, status: "Active" },
  { id: "OP-005", name: "Packing", code: "PCK", seq: 5, dept: "Packing", stdTime: 2, station: "Packing table", rate: 1.5, status: "Inactive" },
];
const blank = (): Item => ({ id: "", name: "", code: "", seq: 1, dept: "Cutting", stdTime: 0, station: "", rate: 0, status: "Active" });
const initials = (s: string) => s.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const inp = "h-11 rounded-xl";

export default function RoutingMasterPage() {
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
    if (!String(form.name).trim()) return;
    setRows((r) => form.id ? r.map((x) => (x.id === form.id ? form : x)) : [...r, { ...form, id: `OP-${String(r.length + 1).padStart(3, "0")}` }]);
    setOpen(false);
  };

  const stats = [
    { icon: ListOrdered, label: "Total operations", value: rows.length },
    { icon: CheckCircle2, label: "Active operations", value: rows.filter((r) => r.status === "Active").length },
    { icon: Timer, label: "Std time per pair", value: rows.filter((r) => r.status === "Active").reduce((s, r) => s + r.stdTime, 0) + " min" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="relative overflow-hidden bg-[#0b0b14] px-6 pb-24 pt-3 text-white md:px-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Routing / Operation master</h1>
            <p className="mt-1 max-w-md text-sm text-slate-400">Cutting, skiving, stitching, molding, lasting, finishing, inspection and packing.</p>
          </div>
          <Button onClick={openNew} className="h-11 rounded-xl bg-indigo-500 px-5 font-semibold text-white hover:bg-indigo-400"><Plus className="mr-2 h-4 w-4" /> Add operation</Button>
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
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by operation, department or workstation" className={`${inp} border-slate-200 bg-slate-50 pl-10`} />
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
                  {["Operation", "Department", "Std time", "Workstation", "Piece rate", "Status"].map((h, i) => <TableHead key={h} className={i === 0 ? "pl-5" : ""}>{h}</TableHead>)}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => openEdit(r)}>
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#111827] text-xs font-semibold text-white">{r.seq}</div>
                        <div><p className="font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.code}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600"><Badge variant="secondary" className="rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{r.dept}</Badge></TableCell>
                    <TableCell className="text-slate-600">{r.stdTime} min / pair</TableCell>
                    <TableCell className="text-slate-600">{r.station}</TableCell>
                    <TableCell className="font-medium text-slate-900">₹{r.rate}</TableCell>
                    <TableCell><Badge className={r.status === "Active" ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100"}>{r.status}</Badge></TableCell>
                    <TableCell><Pencil className="h-4 w-4 text-slate-400" /></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-14 text-center text-slate-500">No operations found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans !max-w-2xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle className="text-xl font-bold">{form.id ? "Edit operation" : "New operation"}</SheetTitle>
            <SheetDescription>{form.id ? `${form.id} · ${form.name}` : "Fill in the details, then save."}</SheetDescription>
          </SheetHeader>
          <Tabs defaultValue="a" className="flex-1 overflow-y-auto p-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100">
              <TabsTrigger value="a">Operation</TabsTrigger>
              <TabsTrigger value="b">Standards</TabsTrigger>
            </TabsList>
            <TabsContent value="a" className="mt-5 space-y-4">
              <Field label="Operation name"><Input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Stitching" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code"><Input className={inp} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="STC" /></Field>
              <Field label="Sequence"><Input type="number" className={inp} value={form.seq} onChange={(e) => set("seq", +e.target.value)} /></Field>
              </div>
              <Pick label="Department" value={form.dept} onChange={(v) => set("dept", v as Item["dept"])} options={["Cutting", "Stitching", "Lasting", "Molding", "Finishing", "Quality", "Packing"]} />
            </TabsContent>
            <TabsContent value="b" className="mt-5 space-y-4">
              <Field label="Standard time (min per pair)"><Input type="number" className={inp} value={form.stdTime} onChange={(e) => set("stdTime", +e.target.value)} /></Field>
              <Field label="Workstation / machine"><Input className={inp} value={form.station} onChange={(e) => set("station", e.target.value)} /></Field>
              <Field label="Piece rate (₹ per pair)"><Input type="number" className={inp} value={form.rate} onChange={(e) => set("rate", +e.target.value)} /></Field>
              <Pick label="Status" value={form.status} onChange={(v) => set("status", v as Item["status"])} options={["Active", "Inactive"]} />
            </TabsContent>
          </Tabs>
          <SheetFooter className="flex-row justify-between gap-2 border-t border-slate-100 p-4">
            {form.id ? <Button variant="ghost" onClick={remove} className="h-11 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button> : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl">Cancel</Button>
              <Button onClick={save} className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]">Save operation</Button>
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