"use client"

import { useState } from "react"
import { Users, UserCheck, UserX, UserPlus, Plus, Eye, Pencil, Power, KeyRound } from "lucide-react"
import { showSuccess, showError } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TableCell, TableRow } from "@/components/ui/table"
import { users as seed, companies, factories, roles, STATES, Rec } from "@/components/settings/Mock"
import { Page, PageHeader, StatGrid, StatCard, StatusBadge, SearchBox, FilterSelect, DataTable, Pager, usePage, IconBtn, ConfirmDialog, CreateEditDrawer, Avatar, FieldDef, card, primaryBtn } from "@/components/settings/Shared"

export default function UserManagementPage() {
  const [users, setUsers] = useState(seed)
  const [f, setF] = useState({ q: "", company: "all", factory: "all", role: "all", status: "all" })
  const [sheet, setSheet] = useState<number | null>(null)
  const [view, setView] = useState<Rec | null>(null)
  const [conf, setConf] = useState<{ i: number; kind: "toggle" | "reset" } | null>(null)
  const name = (u: Rec) => `${u.first} ${u.last}`
  const rows = users.map((u, i) => ({ u, i })).filter(({ u }) =>
    (f.q === "" || (name(u) + u.empId + u.email + u.phone).toLowerCase().includes(f.q.toLowerCase())) &&
    (f.company === "all" || u.company === f.company) && (f.factory === "all" || u.factory === f.factory) &&
    (f.role === "all" || u.role === f.role) && (f.status === "all" || u.status === f.status))
  const pg = usePage(rows)
  const set = (k: string) => (v: string) => setF(p => ({ ...p, [k]: v }))
  const recent = users.filter(u => Date.now() - new Date(u.created).getTime() < 30 * 864e5).length
  const editing = sheet !== null && sheet >= 0
  const uniq = (k: string, label: string) => (v: string) => users.some((u, i) => i !== sheet && u[k].toLowerCase() === v.toLowerCase()) ? `${label} already in use` : undefined

  const fields: FieldDef[] = [
    { k: "empId", label: "Employee ID", req: true, check: uniq("empId", "Employee ID") }, { k: "username", label: "Username", req: true, check: uniq("username", "Username") },
    { k: "first", label: "First Name", req: true }, { k: "last", label: "Last Name", req: true },
    { k: "email", label: "Email", type: "email", req: true, check: uniq("email", "Email") }, { k: "phone", label: "Phone", req: true, check: v => /^\d{10}$/.test(v) ? undefined : "Enter a 10-digit number" },
    ...(editing ? [] : [
      { k: "password", label: "Password", type: "password", req: true, check: (v: string) => v.length < 8 ? "Use at least 8 characters" : undefined },
      { k: "confirm", label: "Confirm Password", type: "password", req: true, check: (v: string, a: Rec) => v !== a.password ? "Passwords do not match" : undefined },
    ] as FieldDef[]),
    { k: "company", label: "Company", type: "select", options: companies.map(c => c.name), req: true },
    { k: "factory", label: "Initial Factory", type: "select", options: factories.map(x => x.code), req: true },
    { k: "role", label: "Initial Role", type: "select", options: roles.filter(r => r.status === "Active").map(r => r.name), req: true },
    { k: "status", label: "Account Status", type: "select", options: ["Active", "Inactive"], req: true },
  ]
  const save = (v: Rec) => {
    const { confirm, password, ...rec } = v
    setUsers(a => editing ? a.map((x, i) => (i === sheet ? { ...x, ...rec } : x)) : [{ ...rec, created: new Date().toISOString().slice(0, 10) }, ...a])
    showSuccess(editing ? "User updated" : "User created"); setSheet(null)
  }
  const confirmAct = () => {
    if (!conf) return
    if (conf.kind === "toggle") setUsers(a => a.map((x, i) => (i === conf.i ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x)))
    showSuccess(conf.kind === "toggle" ? "Account status updated" : "Password reset link sent")
    setConf(null)
  }
  const target = conf ? users[conf.i] : null

  return (
    <Page>
      <PageHeader crumbs={["Settings", "Administration", "User Management"]} title="User Management" desc="Manage employee accounts and their access to ShoeFlow ERP.">
        <Button className={primaryBtn} onClick={() => setSheet(-1)}><Plus className="mr-2 h-4 w-4" />Add New User</Button>
      </PageHeader>
      <StatGrid>
        <StatCard icon={Users} value={users.length} label="Total Users" />
        <StatCard icon={UserCheck} value={users.filter(u => u.status === "Active").length} label="Active Users" tone="emerald" />
        <StatCard icon={UserX} value={users.filter(u => u.status !== "Active").length} label="Inactive Users" tone="slate" />
        <StatCard icon={UserPlus} value={recent} label="Recently Added (30 days)" tone="amber" />
      </StatGrid>
      <div className={card}>
        <div className="flex flex-wrap gap-2 p-3">
          <SearchBox value={f.q} onChange={set("q")} placeholder="Search by name, employee ID, email or phone" />
          <FilterSelect value={f.company} onChange={set("company")} all="All companies" options={companies.map(c => c.name)} />
          <FilterSelect value={f.factory} onChange={set("factory")} all="All factories" options={factories.map(x => x.code)} className="w-full sm:w-36" />
          <FilterSelect value={f.role} onChange={set("role")} all="All roles" options={roles.map(r => r.name)} />
          <FilterSelect value={f.status} onChange={set("status")} all="All statuses" options={["Active", "Inactive"]} className="w-full sm:w-36" />
        </div>
        <DataTable heads={["Employee ID", "Employee Name", "Email", "Phone", "Company", "Primary Role", "Status", "Created Date", "Actions"]} empty={!rows.length}>
          {pg.slice.map(({ u, i }) => (
            <TableRow key={u.empId}>
              <TableCell className="font-medium">{u.empId}</TableCell>
              <TableCell><div className="flex items-center gap-3"><Avatar name={name(u)} /><div><p className="font-medium text-slate-900">{name(u)}</p><p className="text-xs text-slate-400">@{u.username}</p></div></div></TableCell>
              <TableCell>{u.email}</TableCell><TableCell>{u.phone}</TableCell><TableCell>{u.company}</TableCell>
              <TableCell><span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{u.role}</span></TableCell>
              <TableCell><StatusBadge status={u.status} /></TableCell><TableCell className="text-slate-500">{new Date(u.created).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
              <TableCell><div className="flex"><IconBtn icon={Eye} tip="View" onClick={() => setView(u)} /><IconBtn icon={Pencil} tip="Edit" onClick={() => setSheet(i)} /><IconBtn icon={Power} tip="Activate / Deactivate" onClick={() => setConf({ i, kind: "toggle" })} /><IconBtn icon={KeyRound} tip="Reset password" onClick={() => setConf({ i, kind: "reset" })} /></div></TableCell>
            </TableRow>
          ))}
        </DataTable><Pager p={pg} />
      </div>
      <CreateEditDrawer open={sheet !== null} onClose={() => setSheet(null)} onSave={save} title={editing ? "Edit User" : "Add New User"} desc="Detailed multi-factory and multi-role access is managed in Assignments." fields={fields} initial={editing ? users[sheet!] : { status: "Active" }} />
      <ConfirmDialog open={!!conf} onClose={() => setConf(null)} onOk={confirmAct} okLabel={conf?.kind === "reset" ? "Send reset link" : "Confirm"}
        title={conf?.kind === "reset" ? "Reset password?" : `${target?.status === "Active" ? "Deactivate" : "Activate"} account?`}
        desc={target ? (conf?.kind === "reset" ? `A password reset link will be sent to ${target.email}.` : `${name(target)} will ${target.status === "Active" ? "no longer be able to sign in" : "regain access to ShoeFlow"}.`) : ""} />
      <Dialog open={!!view} onOpenChange={o => !o && setView(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {view && <><DialogHeader><DialogTitle className="flex items-center gap-3"><Avatar name={name(view)} />{name(view)}</DialogTitle></DialogHeader>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">{[["Employee ID", view.empId], ["Username", view.username], ["Email", view.email], ["Phone", view.phone], ["Company", view.company], ["Factory", view.factory], ["Primary Role", view.role], ["Created", view.created]].map(([k, v]) => <div key={k}><dt className="text-xs text-slate-400">{k}</dt><dd className="font-medium text-slate-800">{v}</dd></div>)}<div><dt className="text-xs text-slate-400">Status</dt><dd><StatusBadge status={view.status} /></dd></div></dl></>}
        </DialogContent>
      </Dialog>
    </Page>
  )
}