"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, ShieldCheck, CheckCircle2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type Item = { id: string; name: string; module: string; condition: string; l1: string; l2: string; sla: number; status: "Active" | "Inactive" };

const seed: Item[] = [
  { id: "AP-001", name: "BOM approval", module: "BOM", condition: "Any new or changed BOM", l1: "Production head", l2: "Owner", sla: 24, status: "Active" },
  { id: "AP-002", name: "Purchase order approval", module: "Purchase", condition: "PO value above ₹50,000", l1: "Purchase head", l2: "Accounts", sla: 12, status: "Active" },
  { id: "AP-003", name: "Quality rejection", module: "Quality rejection", condition: "Rejection above 5%", l1: "QC head", l2: "None", sla: 4, status: "Active" },
  { id: "AP-004", name: "Price change", module: "Price change", condition: "Any change in selling price", l1: "Owner", l2: "None", sla: 48, status: "Inactive" },
];
const blank = (): Item => ({ id: "", name: "", module: "BOM", condition: "", l1: "Production head", l2: "None", sla: 24, status: "Active" });
const initials = (s: string) => s.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const inp = "h-11 rounded-xl";

export default function ApprovalMasterPage() {
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
    setRows((r) => form.id ? r.map((x) => (x.id === form.id ? form : x)) : [...r, { ...form, id: `AP-${String(r.length + 1).padStart(3, "0")}` }]);
    setOpen(false);
  };

  const stats = [
    { icon: ShieldCheck, label: "Total workflows", value: rows.length },
    { icon: CheckCircle2, label: "Active workflows", value: rows.filter((r) => r.status === "Active").length },
    { icon: Layers, label: "Modules covered", value: new Set(rows.map((r) => r.module)).size },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Card className="p-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Approval / Workflow master
            </h1>
            <p className="mt-0 text-sm text-slate-500">
              Who approves BOM, purchase, production, dispatch and price changes.
            </p>
          </div>
          <Button
            onClick={openNew}
            className="group relative h-11 overflow-hidden rounded-xl bg-[#0b0b14] px-5 font-semibold text-white shadow-lg shadow-indigo-900/20 ring-1 ring-white/10 hover:bg-[#12121f]"
          >
            <span className="pointer-events-none absolute -left-6 -top-8 h-20 w-20 rounded-full bg-indigo-600/50 blur-2xl transition-opacity group-hover:opacity-80" />
            <span className="relative flex items-center">
              <Plus className="mr-2 h-4 w-4 text-indigo-300" />
              Add workflow
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
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by workflow, module or approver" className={`${inp} border-slate-200 bg-slate-50 pl-10`} />
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
                  {["Workflow", "Module", "Level 1", "Level 2", "Condition", "SLA", "Status"].map((h, i) => <TableHead key={h} className={i === 0 ? "pl-5" : ""}>{h}</TableHead>)}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => openEdit(r)}>
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#111827] text-xs font-semibold text-white">{initials(r.name)}</div>
                        <div><p className="font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.id}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600"><Badge variant="secondary" className="rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{r.module}</Badge></TableCell>
                    <TableCell className="text-slate-600">{r.l1}</TableCell>
                    <TableCell className="text-slate-600">{r.l2 === "None" ? "–" : r.l2}</TableCell>
                    <TableCell className="text-slate-600">{r.condition}</TableCell>
                    <TableCell className="text-slate-600">{r.sla} hrs</TableCell>
                    <TableCell><Badge className={r.status === "Active" ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100"}>{r.status}</Badge></TableCell>
                    <TableCell><Pencil className="h-4 w-4 text-slate-400" /></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="py-14 text-center text-slate-500">No workflows found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans !max-w-2xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle className="text-xl font-bold">{form.id ? "Edit workflow" : "New workflow"}</SheetTitle>
            <SheetDescription>{form.id ? `${form.id} · ${form.name}` : "Fill in the details, then save."}</SheetDescription>
          </SheetHeader>
          <Tabs defaultValue="a" className="flex-1 overflow-y-auto p-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100">
              <TabsTrigger value="a">Workflow</TabsTrigger>
              <TabsTrigger value="b">Approvers</TabsTrigger>
            </TabsList>
            <TabsContent value="a" className="mt-5 space-y-4">
              <Field label="Workflow name"><Input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Pick label="Module" value={form.module} onChange={(v) => set("module", v as Item["module"])} options={["BOM", "Purchase", "Production", "Quality rejection", "Dispatch", "Price change"]} />
              <Field label="When it applies"><Input className={inp} value={form.condition} onChange={(e) => set("condition", e.target.value)} placeholder="PO value above ₹50,000" /></Field>
            </TabsContent>
            <TabsContent value="b" className="mt-5 space-y-4">
              <Pick label="Level 1 approver" value={form.l1} onChange={(v) => set("l1", v as Item["l1"])} options={["Store manager", "Production head", "QC head", "Purchase head", "Accounts", "Owner"]} />
              <Pick label="Level 2 approver" value={form.l2} onChange={(v) => set("l2", v as Item["l2"])} options={["None", "Production head", "QC head", "Purchase head", "Accounts", "Owner"]} />
              <Field label="Approval time limit (hours)"><Input type="number" className={inp} value={form.sla} onChange={(e) => set("sla", +e.target.value)} /></Field>
              <Pick label="Status" value={form.status} onChange={(v) => set("status", v as Item["status"])} options={["Active", "Inactive"]} />
            </TabsContent>
          </Tabs>
          <SheetFooter className="flex-row justify-between gap-2 border-t border-slate-100 p-4">
            {form.id ? <Button variant="ghost" onClick={remove} className="h-11 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button> : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl">Cancel</Button>
              <Button onClick={save} className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]">Save workflow</Button>
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