"use client"

import { ReactNode, useEffect, useState } from "react"
import { LucideIcon, Search, ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Rec } from "./Mock"

export const card = "rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5"
export const primaryBtn = "h-10 rounded-xl bg-slate-950 px-4 text-white shadow-sm ring-1 ring-indigo-500/0 hover:bg-slate-800 focus-visible:ring-indigo-500"
export const outlineBtn = "h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-700"
export const Page = ({ children }: { children: ReactNode }) => <div className="mx-auto w-full max-w-[1400px] space-y-4">{children}</div>

export function PageHeader({ crumbs, title, desc, children }: { crumbs?: string[]; title: string; desc: string; children?: ReactNode }) {
  return (
    <div className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}>
      <div className="min-w-0">
        {crumbs && <nav className="mb-1.5 flex flex-wrap items-center gap-1 text-xs text-slate-400">{crumbs.map((c, i) => <span key={c} className="flex items-center gap-1">{i > 0 && <ChevronRight className="h-3 w-3" />}<span className={i === crumbs.length - 1 ? "font-medium text-indigo-600" : ""}>{c}</span></span>)}</nav>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function StatCard({ icon: Icon, value, label, tone = "indigo" }: { icon: LucideIcon; value: ReactNode; label: string; tone?: "indigo" | "emerald" | "slate" | "amber" }) {
  const t = { indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", slate: "bg-slate-100 text-slate-500", amber: "bg-amber-50 text-amber-600" }[tone]
  return (
    <div className={`${card} flex items-center gap-4 p-4`}>
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${t}`}><Icon className="h-5 w-5" /></div>
      <div><p className="text-2xl font-semibold leading-none text-slate-950">{value}</p><p className="mt-1.5 text-sm text-slate-500">{label}</p></div>
    </div>
  )
}
export const StatGrid = ({ children, cols = 4 }: { children: ReactNode; cols?: number }) => <div className={`grid gap-3 sm:grid-cols-2 ${cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>{children}</div>

export function StatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = { Active: "bg-emerald-50 text-emerald-700", Inactive: "bg-slate-100 text-slate-500", System: "bg-indigo-50 text-indigo-700", Custom: "bg-violet-50 text-violet-700" }
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${m[status] ?? m.Inactive}`}>{status}</span>
}
export const Avatar = ({ name }: { name: string }) => <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-950 text-xs font-semibold text-white">{name.split(" ").map(w => w[0]).slice(0, 2).join("")}</span>

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10" /></div>
}
export function FilterSelect({ value, onChange, all, options, className = "w-full sm:w-44" }: { value: string; onChange: (v: string) => void; all: string; options: string[]; className?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-11 rounded-xl border-slate-200 bg-white ${className}`}><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="all">{all}</SelectItem>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  )
}

export function usePage<T>(rows: T[], size = 6) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(rows.length / size))
  useEffect(() => { if (page > pages) setPage(pages) }, [pages, page])
  return { page, setPage, pages, size, total: rows.length, slice: rows.slice((page - 1) * size, page * size) }
}
export function Pager({ p }: { p: ReturnType<typeof usePage> }) {
  const from = p.total ? (p.page - 1) * p.size + 1 : 0
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <span>Showing {from}–{Math.min(p.page * p.size, p.total)} of {p.total}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={p.page <= 1} onClick={() => p.setPage(p.page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="px-2 text-slate-700">{p.page} / {p.pages}</span>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={p.page >= p.pages} onClick={() => p.setPage(p.page + 1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

export const EmptyState = ({ text = "No records match your filters." }: { text?: string }) => <div className="flex flex-col items-center gap-2 py-14 text-slate-400"><Inbox className="h-8 w-8" /><p className="text-sm">{text}</p></div>
export const LoadingState = () => <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading…</div>

export function DataTable({ heads, children, empty }: { heads: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader><TableRow className="bg-slate-50/70 hover:bg-slate-50/70">{heads.map(h => <TableHead key={h} className="h-11 whitespace-nowrap text-[13px] font-semibold text-slate-600">{h}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
      {empty && <EmptyState />}
    </div>
  )
}
export const IconBtn = ({ icon: Icon, tip, onClick }: { icon: LucideIcon; tip: string; onClick: () => void }) => (
  <Button variant="ghost" size="icon" title={tip} aria-label={tip} onClick={onClick} className="h-8 w-8 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"><Icon className="h-4 w-4" /></Button>
)

export function ConfirmDialog({ open, title, desc, okLabel = "Confirm", onOk, onClose }: { open: boolean; title: string; desc: string; okLabel?: string; onOk: () => void; onClose: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={o => !o && onClose()}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{desc}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction className="rounded-xl bg-slate-950 hover:bg-slate-800" onClick={onOk}>{okLabel}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const FieldWrap = ({ label, err, full, req, children }: { label: string; err?: string; full?: boolean; req?: boolean; children: ReactNode }) => (
  <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
    <Label className="text-[13px] text-slate-700">{label}{req && <span className="text-rose-500"> *</span>}</Label>{children}
    {err && <p className="text-xs text-rose-600">{err}</p>}
  </div>
)

export interface FieldDef { k: string; label: string; type?: "text" | "email" | "password" | "textarea" | "select" | "number"; options?: string[]; req?: boolean; full?: boolean; check?: (v: string, all: Rec) => string | undefined }
export function CreateEditDrawer({ open, onClose, title, desc, fields, initial, locked = [], onSave }: { open: boolean; onClose: () => void; title: string; desc: string; fields: FieldDef[]; initial: Rec; locked?: string[]; onSave: (v: Rec) => void }) {
  const [v, setV] = useState<Rec>({})
  const [err, setErr] = useState<Rec>({})
  useEffect(() => { if (open) { setV(initial); setErr({}) } }, [open]) // eslint-disable-line
  const submit = () => {
    const e: Rec = {}
    fields.forEach(f => {
      const x = (v[f.k] ?? "").trim()
      if (f.req && !x) e[f.k] = `${f.label} is required`
      else if (x && f.type === "email" && !/^\S+@\S+\.\S+$/.test(x)) e[f.k] = "Enter a valid email address"
      else { const m = x && f.check?.(x, v); if (m) e[f.k] = m }
    })
    setErr(e)
    if (!Object.keys(e).length) onSave(v)
  }
  const set = (k: string, val: string) => setV(p => ({ ...p, [k]: val }))
  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-slate-100 p-5 text-left"><SheetTitle className="text-lg">{title}</SheetTitle><SheetDescription>{desc}</SheetDescription></SheetHeader>
        <div className="grid flex-1 content-start gap-4 overflow-y-auto p-5 sm:grid-cols-2">
          {fields.map(f => (
            <FieldWrap key={f.k} label={f.label} err={err[f.k]} full={f.full || f.type === "textarea"} req={f.req}>
              {f.type === "select" ? (
                <Select value={v[f.k] || undefined} onValueChange={x => set(f.k, x)} disabled={locked.includes(f.k)}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder={`Select ${f.label.toLowerCase()}`} /></SelectTrigger>
                  <SelectContent>{f.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              ) : f.type === "textarea" ? <Textarea rows={3} value={v[f.k] ?? ""} onChange={e => set(f.k, e.target.value)} className="rounded-xl" />
                : <Input type={f.type ?? "text"} value={v[f.k] ?? ""} disabled={locked.includes(f.k)} onChange={e => set(f.k, e.target.value)} className="h-10 rounded-xl" />}
            </FieldWrap>
          ))}
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t border-slate-100 p-4"><Button variant="outline" className={outlineBtn} onClick={onClose}>Cancel</Button><Button className={primaryBtn} onClick={submit}>Save</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
