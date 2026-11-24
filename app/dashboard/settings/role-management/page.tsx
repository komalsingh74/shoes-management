"use client"

import { useState } from "react"
import { ShieldCheck, Lock, Wrench, Users, Plus, Eye, Pencil, Copy, Power } from "lucide-react"
import { showSuccess, showError } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TableCell, TableRow } from "@/components/ui/table"
import { roles as seed, Rec } from "@/components/settings/Mock"
import { Page, PageHeader, StatGrid, StatCard, StatusBadge, SearchBox, FilterSelect, DataTable, Pager, usePage, IconBtn, ConfirmDialog, CreateEditDrawer, FieldDef, card, primaryBtn } from "@/components/settings/Shared"

export default function RoleManagementPage() {
  const [roles, setRoles] = useState(seed)
  const [q, setQ] = useState(""), [type, setType] = useState("all"), [status, setStatus] = useState("all")
  const [sheet, setSheet] = useState<number | null>(null)
  const [view, setView] = useState<Rec | null>(null)
  const [conf, setConf] = useState<number | null>(null)
  const rows = roles.map((r, i) => ({ r, i })).filter(({ r }) => (r.name + r.code + r.description).toLowerCase().includes(q.toLowerCase()) && (type === "all" || r.type === type) && (status === "all" || r.status === status))
  const pg = usePage(rows, 8)
  const editing = sheet !== null && sheet >= 0
  const isSystem = editing && roles[sheet!].type === "System"
  const dup = (k: string) => (v: string) => roles.some((r, i) => i !== sheet && r[k].toLowerCase() === v.toLowerCase()) ? `${k === "code" ? "Role code" : "Role name"} already exists` : undefined

  const fields: FieldDef[] = [
    { k: "name", label: "Role Name", req: true, check: dup("name") },
    { k: "code", label: "Role Code", req: true, check: v => !/^[A-Z0-9_]+$/i.test(v) ? "Use letters, numbers and underscores only" : dup("code")(v) },
    { k: "description", label: "Description", req: true, full: true },
    { k: "responsibilities", label: "Responsibilities", type: "textarea" },
    { k: "approval", label: "Approval Authority", type: "select", options: ["None", "Level 1", "Level 2", "Final"] },
    { k: "type", label: "Role Type", type: "select", options: ["System", "Custom"], req: true },
    { k: "status", label: "Status", type: "select", options: ["Active", "Inactive"], req: true },
  ]
  const save = (v: Rec) => {
    const rec = { users: "0", ...v, code: v.code.toUpperCase() }
    setRoles(a => editing ? a.map((x, i) => (i === sheet ? { ...x, ...rec } : x)) : [rec, ...a])
    showSuccess(editing ? "Role updated" : "Role created"); setSheet(null)
  }
  const clone = (r: Rec) => {
    setRoles(a => [{ ...r, code: r.code + "_COPY", name: r.name + " (Copy)", type: "Custom", users: "0" }, ...a])
    showSuccess("Role cloned as a custom role")
  }
  const toggle = () => { setRoles(a => a.map((x, i) => (i === conf ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x))); showSuccess("Role status updated"); setConf(null) }

  return (
    <Page>
      <PageHeader crumbs={["Settings", "Administration", "Role Management"]} title="Role Management" desc="Create and manage roles that control employee responsibilities.">
        <Button className={primaryBtn} onClick={() => setSheet(-1)}><Plus className="mr-2 h-4 w-4" />Create Role</Button>
      </PageHeader>
      <StatGrid>
        <StatCard icon={ShieldCheck} value={roles.length} label="Total Roles" />
        <StatCard icon={Lock} value={roles.filter(r => r.type === "System").length} label="System Roles" tone="slate" />
        <StatCard icon={Wrench} value={roles.filter(r => r.type === "Custom").length} label="Custom Roles" tone="amber" />
        <StatCard icon={Users} value={roles.reduce((s, r) => s + +r.users, 0)} label="Assigned Users" tone="emerald" />
      </StatGrid>
      <div className={card}>
        <div className="flex flex-wrap gap-2 p-3">
          <SearchBox value={q} onChange={setQ} placeholder="Search roles by name, code or description" />
          <FilterSelect value={type} onChange={setType} all="All types" options={["System", "Custom"]} className="w-full sm:w-36" />
          <FilterSelect value={status} onChange={setStatus} all="All statuses" options={["Active", "Inactive"]} className="w-full sm:w-36" />
        </div>
        <DataTable heads={["Role Code", "Role Name", "Description", "Role Type", "Assigned Users", "Status", "Actions"]} empty={!rows.length}>
          {pg.slice.map(({ r, i }) => (
            <TableRow key={r.code}>
              <TableCell><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold">{r.code}</span></TableCell>
              <TableCell className="font-medium text-slate-900"><span className="flex items-center gap-1.5">{r.type === "System" && <Lock className="h-3.5 w-3.5 text-slate-400" />}{r.name}</span></TableCell>
              <TableCell className="max-w-[280px] truncate text-slate-500">{r.description}</TableCell>
              <TableCell><StatusBadge status={r.type} /></TableCell><TableCell>{r.users}</TableCell><TableCell><StatusBadge status={r.status} /></TableCell>
              <TableCell><div className="flex"><IconBtn icon={Eye} tip="View" onClick={() => setView(r)} /><IconBtn icon={Pencil} tip="Edit" onClick={() => setSheet(i)} /><IconBtn icon={Copy} tip="Clone" onClick={() => clone(r)} /><IconBtn icon={Power} tip="Activate / Deactivate" onClick={() => setConf(i)} /></div></TableCell>
            </TableRow>
          ))}
        </DataTable><Pager p={pg} />
      </div>
      <CreateEditDrawer open={sheet !== null} onClose={() => setSheet(null)} onSave={save} title={editing ? "Edit Role" : "Create Role"}
        desc={isSystem ? "System role: code and type are protected." : "Define responsibilities, then set module access in the Permission Matrix."}
        fields={fields} initial={editing ? roles[sheet!] : { type: "Custom", status: "Active", approval: "None" }} locked={isSystem ? ["code", "type"] : []} />
      <ConfirmDialog open={conf !== null} onClose={() => setConf(null)} onOk={toggle} title="Change role status?" desc={conf !== null && roles[conf].type === "System" ? "This is a system role. Deactivating it may affect assigned users." : "Users with this role keep their assignments but the role becomes unavailable for new ones."} />
      <Dialog open={!!view} onOpenChange={o => !o && setView(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {view && <><DialogHeader><DialogTitle>{view.name}</DialogTitle><DialogDescription>{view.code} · {view.type} role</DialogDescription></DialogHeader>
            <div className="space-y-3 text-sm"><p className="text-slate-600">{view.description}</p>
              <div><p className="text-xs text-slate-400">Responsibilities</p><p>{view.responsibilities || "—"}</p></div>
              <div className="flex gap-6"><div><p className="text-xs text-slate-400">Approval authority</p><p className="font-medium">{view.approval}</p></div><div><p className="text-xs text-slate-400">Assigned users</p><p className="font-medium">{view.users}</p></div><div><p className="text-xs text-slate-400">Status</p><StatusBadge status={view.status} /></div></div></div></>}
        </DialogContent>
      </Dialog>
    </Page>
  )
}