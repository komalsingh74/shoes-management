"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Users, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type Item = { id: string; name: string; code: string; phone: string; dept: string; skill: string; level: string; shift: string; wageType: string; wage: number; status: "Active" | "Inactive" };

const seed: Item[] = [
  { id: "EMP-001", name: "Ramesh Kumar", code: "W-001", phone: "98370 10101", dept: "Stitching", skill: "Stitcher", level: "Senior", shift: "Morning", wageType: "Piece rate", wage: 12, status: "Active" },
  { id: "EMP-002", name: "Sunita Devi", code: "W-002", phone: "98370 20202", dept: "Cutting", skill: "Cutter", level: "Skilled", shift: "Morning", wageType: "Daily", wage: 650, status: "Active" },
  { id: "EMP-003", name: "Vikram Singh", code: "W-003", phone: "98370 30303", dept: "Quality", skill: "QC", level: "Supervisor", shift: "General", wageType: "Monthly", wage: 28000, status: "Active" },
  { id: "EMP-004", name: "Mohan Lal", code: "W-004", phone: "98370 40404", dept: "Packing", skill: "Packer", level: "Trainee", shift: "Evening", wageType: "Daily", wage: 450, status: "Inactive" },
];
const blank = (): Item => ({ id: "", name: "", code: "", phone: "", dept: "Stitching", skill: "Stitcher", level: "Skilled", shift: "Morning", wageType: "Daily", wage: 0, status: "Active" });
const initials = (s: string) => s.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const inp = "h-11 rounded-xl";

export default function EmployeeMasterPage() {
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
    setRows((r) => form.id ? r.map((x) => (x.id === form.id ? form : x)) : [...r, { ...form, id: `EMP-${String(r.length + 1).padStart(3, "0")}` }]);
    setOpen(false);
  };

  const stats = [
    { icon: Users, label: "Total workers", value: rows.length },
    { icon: CheckCircle2, label: "Active workers", value: rows.filter((r) => r.status === "Active").length },
    { icon: Building2, label: "Departments", value: new Set(rows.map((r) => r.dept)).size },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
<Card className="p-4">
  <header className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        Employee / Worker master
      </h1>

      <p className="mt-0 text-sm text-slate-500">
        Departments, skills, shifts, wages and skill levels.
      </p>
    </div>

    <Button
      onClick={openNew}
      className="group relative h-11 overflow-hidden rounded-xl bg-[#0b0b14] px-5 font-semibold text-white shadow-lg shadow-indigo-900/20 ring-1 ring-white/10 hover:bg-[#12121f]"
    >
      {/* Indigo glow */}
      <span className="pointer-events-none absolute -left-6 -top-8 h-20 w-20 rounded-full bg-indigo-600/50 blur-2xl transition-opacity group-hover:opacity-80" />

      <span className="relative flex items-center">
        <Plus className="mr-2 h-4 w-4 text-indigo-300" />
        Add employee
      </span>
    </Button>
  </header>
</Card>

      <main className="mx-auto space-y-3 px-0 py-4 ">
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
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, department or skill" className={`${inp} border-slate-200 bg-slate-50 pl-10`} />
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
                  {["Employee", "Department", "Skill", "Shift", "Wage", "Status"].map((h, i) => <TableHead key={h} className={i === 0 ? "pl-5" : ""}>{h}</TableHead>)}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => openEdit(r)}>
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#111827] text-xs font-semibold text-white">{initials(r.name)}</div>
                        <div><p className="font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.code} · {r.phone}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{r.dept}</TableCell>
                    <TableCell className="text-slate-600"><div className="flex items-center gap-2"><Badge variant="secondary" className="rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{r.skill}</Badge><span className="text-xs text-slate-500">{r.level}</span></div></TableCell>
                    <TableCell className="text-slate-600">{r.shift}</TableCell>
                    <TableCell className="font-medium text-slate-900">₹{r.wage.toLocaleString("en-IN")} <span className="text-xs text-slate-500">/ {r.wageType}</span></TableCell>
                    <TableCell><Badge className={r.status === "Active" ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100"}>{r.status}</Badge></TableCell>
                    <TableCell><Pencil className="h-4 w-4 text-slate-400" /></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-14 text-center text-slate-500">No employees found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans !max-w-2xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle className="text-xl font-bold">{form.id ? "Edit employee" : "New employee"}</SheetTitle>
            <SheetDescription>{form.id ? `${form.id} · ${form.name}` : "Fill in the details, then save."}</SheetDescription>
          </SheetHeader>
          <Tabs defaultValue="a" className="flex-1 overflow-y-auto p-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100">
              <TabsTrigger value="a">Profile</TabsTrigger>
              <TabsTrigger value="b">Skills & wages</TabsTrigger>
            </TabsList>
            <TabsContent value="a" className="mt-5 space-y-4">
              <Field label="Full name"><Input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Employee code"><Input className={inp} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="W-001" /></Field>
              <Field label="Phone"><Input className={inp} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
              </div>
              <Pick label="Department" value={form.dept} onChange={(v) => set("dept", v as Item["dept"])} options={["Cutting", "Stitching", "Lasting", "Molding", "Finishing", "Quality", "Packing", "Store"]} />
            </TabsContent>
            <TabsContent value="b" className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
              <Pick label="Skill" value={form.skill} onChange={(v) => set("skill", v as Item["skill"])} options={["Cutter", "Stitcher", "Laster", "Molder", "Finisher", "QC", "Packer", "Helper"]} />
              <Pick label="Skill level" value={form.level} onChange={(v) => set("level", v as Item["level"])} options={["Trainee", "Skilled", "Senior", "Supervisor"]} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
              <Pick label="Shift" value={form.shift} onChange={(v) => set("shift", v as Item["shift"])} options={["Morning", "Evening", "Night", "General"]} />
              <Pick label="Wage type" value={form.wageType} onChange={(v) => set("wageType", v as Item["wageType"])} options={["Daily", "Monthly", "Piece rate"]} />
              </div>
              <Field label="Wage (₹)"><Input type="number" className={inp} value={form.wage} onChange={(e) => set("wage", +e.target.value)} /></Field>
              <Pick label="Status" value={form.status} onChange={(v) => set("status", v as Item["status"])} options={["Active", "Inactive"]} />
            </TabsContent>
          </Tabs>
          <SheetFooter className="flex-row justify-between gap-2 border-t border-slate-100 p-4">
            {form.id ? <Button variant="ghost" onClick={remove} className="h-11 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button> : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl">Cancel</Button>
              <Button onClick={save} className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]">Save employee</Button>
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