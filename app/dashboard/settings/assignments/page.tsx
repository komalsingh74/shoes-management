"use client"

import { useState } from "react"
import { ClipboardList, CheckCircle2, Building2, UsersRound, Plus, Pencil, Ban, History } from "lucide-react"
import { showSuccess, showError } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TableCell, TableRow } from "@/components/ui/table"
import { assignments as seed, users, companies, factories, roles, type Assignment } from "@/components/settings/Mock"
import { Page, PageHeader, StatGrid, StatCard, StatusBadge, SearchBox, FilterSelect, DataTable, Pager, usePage, IconBtn, ConfirmDialog, FieldWrap, Avatar, card, primaryBtn, outlineBtn } from "@/components/settings/Shared"

const ALL = "__all"
const empty = { emp: "", company: "", factory: ALL, roles: [] as string[], primary: "", status: "Active" }
export default function AssignmentsPage() {
  const [rows, setRows] = useState(seed)
  const [f, setF] = useState({ q: "", company: "all", factory: "all", role: "all", status: "all" })
  const [sheet, setSheet] = useState<number | null>(null)
  const [form, setForm] = useState(empty)
  const [err, setErr] = useState<Record<string, string>>({})
  const [hist, setHist] = useState<Assignment | null>(null)
  const [conf, setConf] = useState<number | null>(null)
  const emp = (id: string) => users.find(u => u.empId === id)
  const ename = (id: string) => (emp(id) ? `${emp(id)!.first} ${emp(id)!.last}` : id)
  const set = (k: string) => (v: string) => setF(p => ({ ...p, [k]: v }))
  const list = rows.map((a, i) => ({ a, i })).filter(({ a }) =>
    (a.empId + ename(a.empId)).toLowerCase().includes(f.q.toLowerCase()) && (f.company === "all" || a.company === f.company) &&
    (f.factory === "all" || a.factory === f.factory) && (f.role === "all" || a.roles.includes(f.role)) && (f.status === "all" || a.status === f.status))
  const pg = usePage(list)
  const active = rows.filter(a => a.status === "Active")
  const multi = new Set([...new Set(active.map(a => a.empId))].filter(id => new Set(active.filter(a => a.empId === id).flatMap(a => a.roles)).size > 1)).size
  const facOpts = factories.filter(x => x.company === form.company)

  const open = (i: number) => {
    setErr({}); setSheet(i)
    setForm(i < 0 ? empty : { emp: rows[i].empId, company: rows[i].company, factory: rows[i].factory || ALL, roles: rows[i].roles, primary: rows[i].primary, status: rows[i].status })
  }
  const toggleRole = (r: string) => setForm(p => { const rs = p.roles.includes(r) ? p.roles.filter(x => x !== r) : [...p.roles, r]; return { ...p, roles: rs, primary: rs.includes(p.primary) ? p.primary : rs[0] ?? "" } })
  const save = () => {
    const e: Record<string, string> = {}, fac = form.factory === ALL ? "" : form.factory
    if (!form.emp) e.emp = "Select an employee"
    if (!form.company) e.company = "Select a company"
    if (fac && factories.find(x => x.code === fac)?.company !== form.company) e.factory = "Factory does not belong to the selected company"
    if (!form.roles.length) e.roles = "Select at least one role"
    if (!form.primary) e.primary = "Choose a primary role"
    if (form.status === "Active" && rows.some((a, i) => i !== sheet && a.status === "Active" && a.empId === form.emp && a.company === form.company && a.factory === fac)) e.emp = "An active assignment already exists for this employee, company and factory"
    setErr(e)
    if (Object.keys(e).length) return
    const today = new Date().toISOString().slice(0, 10)
    const base = { empId: form.emp, company: form.company, factory: fac, roles: form.roles, primary: form.primary, status: form.status }
    setRows(a => sheet! < 0
      ? [{ ...base, id: "A" + Date.now(), by: "Alex Morgan", date: today, history: [{ at: today, note: "Assignment created" }] }, ...a]
      : a.map((x, i) => (i === sheet ? { ...x, ...base, history: [...x.history, { at: today, note: "Assignment edited" }] } : x)))
    showSuccess(sheet! < 0 ? "Assignment created" : "Assignment updated"); setSheet(null)
  }
  const deactivate = () => {
    const today = new Date().toISOString().slice(0, 10)
    setRows(a => a.map((x, i) => (i === conf ? { ...x, status: "Inactive", history: [...x.history, { at: today, note: "Deactivated" }] } : x)))
    showSuccess("Assignment deactivated"); setConf(null)
  }

  return (
    <Page>
      <PageHeader crumbs={["Settings", "Administration", "Assignments"]} title="Assignments" desc="Manage employee access across companies, manufacturing units and roles.">
        <Button className={primaryBtn} onClick={() => open(-1)}><Plus className="mr-2 h-4 w-4" />New Assignment</Button>
      </PageHeader>
      <StatGrid>
        <StatCard icon={ClipboardList} value={rows.length} label="Total Assignments" />
        <StatCard icon={CheckCircle2} value={active.length} label="Active Assignments" tone="emerald" />
        <StatCard icon={Building2} value={active.filter(a => !a.factory).length} label="Company-wide Roles" tone="amber" />
        <StatCard icon={UsersRound} value={multi} label="Multi-role Employees" tone="slate" />
      </StatGrid>
      <div className={card}>
        <div className="flex flex-wrap gap-2 p-3">
          <SearchBox value={f.q} onChange={set("q")} placeholder="Search employee name or ID" />
          <FilterSelect value={f.company} onChange={set("company")} all="All companies" options={companies.map(c => c.name)} />
          <FilterSelect value={f.factory} onChange={set("factory")} all="All factories" options={factories.map(x => x.code)} className="w-full sm:w-36" />
          <FilterSelect value={f.role} onChange={set("role")} all="All roles" options={roles.map(r => r.name)} />
          <FilterSelect value={f.status} onChange={set("status")} all="All statuses" options={["Active", "Inactive"]} className="w-full sm:w-36" />
        </div>
        <DataTable heads={["Employee ID", "Employee Name", "Company", "Factory / Unit", "Assigned Roles", "Primary Role", "Assigned By", "Assigned Date", "Status", "Actions"]} empty={!list.length}>
          {pg.slice.map(({ a, i }) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.empId}</TableCell>
              <TableCell><div className="flex items-center gap-3"><Avatar name={ename(a.empId)} /><span className="font-medium text-slate-900">{ename(a.empId)}</span></div></TableCell>
              <TableCell>{a.company}</TableCell>
              <TableCell>{a.factory ? <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold">{a.factory}</span> : <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Company-wide</span>}</TableCell>
              <TableCell><div className="flex max-w-[260px] flex-wrap gap-1">{a.roles.map(r => <span key={r} className="rounded-md border border-slate-200 px-1.5 py-0.5 text-xs text-slate-600">{r}</span>)}</div></TableCell>
              <TableCell><span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{a.primary}</span></TableCell>
              <TableCell>{a.by}</TableCell><TableCell className="text-slate-500">{a.date}</TableCell><TableCell><StatusBadge status={a.status} /></TableCell>
              <TableCell><div className="flex"><IconBtn icon={Pencil} tip="Edit" onClick={() => open(i)} />{a.status === "Active" && <IconBtn icon={Ban} tip="Deactivate" onClick={() => setConf(i)} />}<IconBtn icon={History} tip="History" onClick={() => setHist(a)} /></div></TableCell>
            </TableRow>
          ))}
        </DataTable><Pager p={pg} />
      </div>

      <Sheet open={sheet !== null} onOpenChange={o => !o && setSheet(null)}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-slate-100 p-5 text-left"><SheetTitle className="text-lg">{sheet! < 0 ? "New Assignment" : "Edit Assignment"}</SheetTitle><SheetDescription>Leave factory as company-wide to grant the roles across every unit.</SheetDescription></SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <FieldWrap label="Select Employee" req err={err.emp}>
              <Select value={form.emp || undefined} onValueChange={v => setForm(p => ({ ...p, emp: v }))}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{users.filter(u => u.status === "Active").map(u => <SelectItem key={u.empId} value={u.empId}>{u.empId} · {u.first} {u.last}</SelectItem>)}</SelectContent></Select>
            </FieldWrap>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldWrap label="Select Company" req err={err.company}>
                <Select value={form.company || undefined} onValueChange={v => setForm(p => ({ ...p, company: v, factory: ALL }))}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent>{companies.filter(c => c.status === "Active").map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select>
              </FieldWrap>
              <FieldWrap label="Select Factory / Unit" err={err.factory}>
                <Select value={form.factory} onValueChange={v => setForm(p => ({ ...p, factory: v }))} disabled={!form.company}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={ALL}>Company-wide (no factory)</SelectItem>{facOpts.map(x => <SelectItem key={x.code} value={x.code}>{x.code} · {x.name}</SelectItem>)}</SelectContent></Select>
              </FieldWrap>
            </div>
            <FieldWrap label="Select Roles" req err={err.roles}>
              <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl border border-slate-200 p-2 sm:grid-cols-2">
                {roles.filter(r => r.status === "Active").map(r => (
                  <label key={r.code} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"><Checkbox checked={form.roles.includes(r.name)} onCheckedChange={() => toggleRole(r.name)} />{r.name}</label>
                ))}
              </div>
            </FieldWrap>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldWrap label="Choose Primary Role" req err={err.primary}>
                <Select value={form.primary || undefined} onValueChange={v => setForm(p => ({ ...p, primary: v }))} disabled={!form.roles.length}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Select primary role" /></SelectTrigger>
                  <SelectContent>{form.roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
              </FieldWrap>
              <FieldWrap label="Assignment Status">
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select>
              </FieldWrap>
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t border-slate-100 p-4"><Button variant="outline" className={outlineBtn} onClick={() => setSheet(null)}>Cancel</Button><Button className={primaryBtn} onClick={save}>Save assignment</Button></SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={conf !== null} onClose={() => setConf(null)} onOk={deactivate} okLabel="Deactivate" title="Deactivate assignment?" desc="The employee loses the roles granted by this assignment for the selected company and factory." />
      <Dialog open={!!hist} onOpenChange={o => !o && setHist(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {hist && <><DialogHeader><DialogTitle>Assignment history</DialogTitle></DialogHeader>
            <p className="-mt-2 text-sm text-slate-500">{ename(hist.empId)} · {hist.company} · {hist.factory || "Company-wide"}</p>
            <ol className="ml-2 space-y-4 border-l border-slate-200 pl-5">{[...hist.history].reverse().map((h, i) => <li key={i} className="relative"><span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500" /><p className="text-sm font-medium text-slate-800">{h.note}</p><p className="text-xs text-slate-400">{h.at}</p></li>)}</ol></>}
        </DialogContent>
      </Dialog>
    </Page>
  )
}