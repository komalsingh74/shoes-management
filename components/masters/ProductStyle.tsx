"use client";

import { useMemo, useState, type ElementType, type ReactNode } from "react";
import { Search, Plus, Download, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/* ---------- Types ---------- */
export type Row = Record<string, any>;
export type Field = {
  key: string; label: string; full?: boolean; placeholder?: string;
  type?: "text" | "number" | "select" | "tags" | "color" | "textarea";
  options?: string[];
};
export type FormSection = { title: string; desc: string; icon: ElementType; fields: Field[] };
export type Column = { label: string; render: (r: Row) => ReactNode };
export type MasterConfig = {
  title: string;          // "Product / Style Master"
  singular: string;       // "style"
  description: string;
  idPrefix: string;       // "ST"
  nameKey: string;        // sheet header title
  columns: Column[];
  sections: FormSection[];
  initial: Row[];
  blank: Row;
};

/* ---------- Small helpers for column renders ---------- */
export const Cell = ({ title, sub }: { title: ReactNode; sub?: ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-slate-900">{title}</p>
    {sub && <p className="text-xs text-slate-500">{sub}</p>}
  </div>
);
export const Swatch = ({ hex }: { hex: string }) => (
  <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-slate-200" style={{ background: hex }} />
);
export const Chips = ({ items, max = 2 }: { items: string[]; max?: number }) => (
  <div className="flex flex-wrap items-center gap-1">
    {items.slice(0, max).map((b) => (
      <Badge key={b} variant="outline" className="rounded-md border-slate-200 font-normal text-slate-700">{b}</Badge>
    ))}
    {items.length > max && <span className="text-xs text-slate-500">+{items.length - max}</span>}
  </div>
);

const STATUSES = ["Active", "Inactive"] as const;

/* ---------- Page ---------- */
export default function MasterPage({ cfg }: { cfg: MasterConfig }) {
  const [rows, setRows] = useState<Row[]>(cfg.initial);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "Active" | "Inactive">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Row>(cfg.blank);

  const count = (s: string) => (s === "all" ? rows.length : rows.filter((r) => r.status === s).length);
  const filtered = useMemo(
    () => rows.filter((r) => (tab === "all" || r.status === tab) && JSON.stringify(Object.values(r)).toLowerCase().includes(q.toLowerCase())),
    [rows, q, tab]
  );

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setForm({ ...cfg.blank }); setOpen(true); };
  const openEdit = (r: Row) => { setForm(structuredClone(r)); setOpen(true); };
  const remove = (id: string) => { setRows((r) => r.filter((x) => x.id !== id)); setOpen(false); };
  const save = () => {
    if (!String(form[cfg.nameKey] ?? "").trim()) return;
    setRows((r) =>
      form.id ? r.map((x) => (x.id === form.id ? form : x))
              : [...r, { ...form, id: `${cfg.idPrefix}-${String(r.length + 1).padStart(3, "0")}` }]
    );
    setOpen(false);
  };

  return (
    <div className="space-y-6 p-6 font-sans text-slate-900 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{cfg.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{cfg.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 rounded-lg border-slate-200 bg-white"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button onClick={openNew} className="h-10 rounded-lg bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-500">
            <Plus className="mr-2 h-4 w-4" />Add {cfg.singular}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[["Total", count("all")], ["Active", count("Active")], ["Inactive", count("Inactive")]].map(([l, v]) => (
          <div key={l as string} className="px-6 py-4">
            <p className="text-sm text-slate-500">{l}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3">
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {(["all", ...STATUSES] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
                {t === "all" ? "All" : t} <span className="ml-1 text-slate-400">{count(t)}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${cfg.singular}`} className="h-10 rounded-lg border-slate-200 pl-9" />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {cfg.columns.map((c) => (
                <TableHead key={c.label} className="h-11 px-4 text-xs font-medium text-slate-500 first:pl-5">{c.label}</TableHead>
              ))}
              <TableHead className="h-11 px-4 text-xs font-medium text-slate-500">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} onClick={() => openEdit(r)} className="cursor-pointer hover:bg-slate-50/70">
                {cfg.columns.map((c, i) => (
                  <TableCell key={c.label} className={`px-4 py-3 text-sm text-slate-600 ${i === 0 ? "pl-5" : ""}`}>{c.render(r)}</TableCell>
                ))}
                <TableCell className="px-4">
                  <span className={`inline-flex items-center gap-1.5 text-sm ${r.status === "Active" ? "text-emerald-700" : "text-slate-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${r.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />{r.status}
                  </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(r)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => remove(r.id)} className="text-red-600 focus:text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={cfg.columns.length + 2} className="py-16 text-center text-sm text-slate-500">No {cfg.singular} found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Side sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 bg-white p-0 font-sans sm:max-w-[560px]">
          <div className="border-b border-slate-200 px-6 py-5 pr-14">
            <SheetTitle className="truncate text-lg font-semibold">{form.id ? form[cfg.nameKey] : `New ${cfg.singular}`}</SheetTitle>
            <SheetDescription className="text-sm">{form.id ? `${form.id} · ${form.status}` : `Add a ${cfg.singular} to ${cfg.title}`}</SheetDescription>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto bg-slate-50/60 px-6 py-6">
            {cfg.sections.map((s, si) => (
              <section key={s.title}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><s.icon className="h-4 w-4" /></div>
                  <div><h3 className="text-sm font-semibold">{s.title}</h3><p className="text-xs text-slate-500">{s.desc}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 [&_input]:h-10">
                  {s.fields.map((f) => (
                    <FieldInput key={f.key} f={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
                  ))}
                  {si === 0 && (
                    <FieldInput f={{ key: "status", label: "Status", type: "select", options: [...STATUSES] }} value={form.status} onChange={(v) => set("status", v)} />
                  )}
                </div>
              </section>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
            {form.id ? <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => remove(form.id)}>Delete</Button> : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} className="bg-indigo-600 text-white hover:bg-indigo-500">Save {cfg.singular}</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------- Form fields ---------- */
function FieldInput({ f, value, onChange }: { f: Field; value: any; onChange: (v: any) => void }) {
  const [tag, setTag] = useState("");
  const type = f.type ?? "text";
  let input: ReactNode;

  if (type === "select") {
    input = (
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>{f.options!.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    );
  } else if (type === "textarea") {
    input = <Textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="resize-none" />;
  } else if (type === "number") {
    input = <Input type="number" value={value ?? 0} onChange={(e) => onChange(+e.target.value)} />;
  } else if (type === "color") {
    input = (
      <div className="flex gap-2">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} aria-label={f.label}
          className="h-10 w-12 cursor-pointer rounded-md border border-slate-200 bg-white p-1" />
        <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
      </div>
    );
  } else if (type === "tags") {
    const list: string[] = value ?? [];
    const add = () => { const t = tag.trim(); if (t && !list.includes(t)) onChange([...list, t]); setTag(""); };
    input = (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={f.placeholder ?? "Type and press Enter"} />
          <Button type="button" variant="outline" onClick={add}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {list.map((t) => (
            <Badge key={t} variant="outline" className="gap-1 rounded-md border-slate-200 bg-white py-1 font-normal">
              {t}<button onClick={() => onChange(list.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X className="h-3 w-3 text-slate-400 hover:text-slate-900" /></button>
            </Badge>
          ))}
        </div>
      </div>
    );
  } else {
    input = <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />;
  }

  const full = f.full || type === "tags" || type === "textarea";
  return (
    <div className={`space-y-1.5 ${full ? "col-span-2" : "col-span-2 sm:col-span-1"}`}>
      <Label className="text-xs font-medium text-slate-600">{f.label}</Label>
      {input}
    </div>
  );
}