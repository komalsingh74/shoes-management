"use client"

import { useState } from "react"
import { Boxes, CheckCircle2, CircleOff, Plus, Pencil, Power, Lock, CornerDownRight } from "lucide-react"
import { showSuccess, showError } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { modules as seed, Rec } from "@/components/settings/Mock"
import { Page, PageHeader, StatGrid, StatCard, StatusBadge, SearchBox, FilterSelect, DataTable, Pager, usePage, IconBtn, ConfirmDialog, CreateEditDrawer, FieldDef, card, primaryBtn } from "@/components/settings/Shared"

const CORE = new Set(seed.map(m => m.code))
export default function ModuleManagementPage() {
  const [mods, setMods] = useState(seed)
  const [q, setQ] = useState(""), [status, setStatus] = useState("all")
  const [sheet, setSheet] = useState<number | null>(null)
  const [conf, setConf] = useState<number | null>(null)
  const rows = mods.map((m, i) => ({ m, i })).filter(({ m }) => (m.code + m.name + m.description).toLowerCase().includes(q.toLowerCase()) && (status === "all" || m.status === status))
    .sort((a, b) => +a.m.order - +b.m.order)
  const pg = usePage(rows, 8)
  const editing = sheet !== null && sheet >= 0
  const cur = editing ? mods[sheet!] : null
  const nameOf = (c: string) => mods.find(m => m.code === c)?.name ?? "—"

  const fields: FieldDef[] = [
    { k: "code", label: "Module Code", req: true, check: v => !/^M\d{2,}$/i.test(v) ? "Use format M17" : mods.some((m, i) => i !== sheet && m.code.toLowerCase() === v.toLowerCase()) ? "Module code already exists" : undefined },
    { k: "name", label: "Module Name", req: true },
    { k: "description", label: "Description", type: "textarea" },
    { k: "parent", label: "Parent Module (optional)", type: "select", options: ["None", ...mods.filter(m => m.code !== cur?.code && !m.parent).map(m => m.code)] },
    { k: "order", label: "Display Sequence", type: "number", req: true, check: v => +v > 0 ? undefined : "Must be greater than 0" },
    { k: "status", label: "Status", type: "select", options: ["Active", "Inactive"], req: true },
  ]
  const save = (v: Rec) => {
    const rec = { ...v, code: v.code.toUpperCase(), parent: v.parent === "None" ? "" : v.parent ?? "" }
    setMods(a => editing ? a.map((x, i) => (i === sheet ? rec : x)) : [...a, rec])
    showSuccess(editing ? "Module updated" : "Module added"); setSheet(null)
  }
  const toggle = () => { setMods(a => a.map((x, i) => (i === conf ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x))); showSuccess("Module status updated"); setConf(null) }

  return (
    <Page>
      <PageHeader crumbs={["Settings", "Administration", "Module Management"]} title="Module Management" desc="Manage ERP modules and their navigation structure.">
        <Button className={primaryBtn} onClick={() => setSheet(-1)}><Plus className="mr-2 h-4 w-4" />Add Module</Button>
      </PageHeader>
      <StatGrid cols={3}>
        <StatCard icon={Boxes} value={mods.length} label="Total Modules" />
        <StatCard icon={CheckCircle2} value={mods.filter(m => m.status === "Active").length} label="Active Modules" tone="emerald" />
        <StatCard icon={CircleOff} value={mods.filter(m => m.status !== "Active").length} label="Inactive Modules" tone="slate" />
      </StatGrid>
      <div className={card}>
        <div className="flex flex-wrap gap-2 p-3">
          <SearchBox value={q} onChange={setQ} placeholder="Search by module code, name or description" />
          <FilterSelect value={status} onChange={setStatus} all="All statuses" options={["Active", "Inactive"]} className="w-full sm:w-40" />
        </div>
        <DataTable heads={["Module Code", "Module Name", "Description", "Parent Module", "Display Order", "Status", "Actions"]} empty={!rows.length}>
          {pg.slice.map(({ m, i }) => (
            <TableRow key={m.code}>
              <TableCell><span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">{m.code}</span></TableCell>
              <TableCell className="font-medium text-slate-900"><span className="flex items-center gap-1.5">{m.parent && <CornerDownRight className="h-3.5 w-3.5 text-slate-400" />}{m.name}{CORE.has(m.code) && <Lock className="h-3 w-3 text-slate-300" />}</span></TableCell>
              <TableCell className="max-w-[300px] truncate text-slate-500">{m.description}</TableCell>
              <TableCell className="text-slate-600">{m.parent ? `${m.parent} · ${nameOf(m.parent)}` : "—"}</TableCell>
              <TableCell>{m.order}</TableCell><TableCell><StatusBadge status={m.status} /></TableCell>
              <TableCell><div className="flex"><IconBtn icon={Pencil} tip="Edit" onClick={() => setSheet(i)} /><IconBtn icon={Power} tip="Activate / Deactivate" onClick={() => setConf(i)} /></div></TableCell>
            </TableRow>
          ))}
        </DataTable><Pager p={pg} />
      </div>
      <CreateEditDrawer open={sheet !== null} onClose={() => setSheet(null)} onSave={save} title={editing ? "Edit Module" : "Add Module"}
        desc={cur && CORE.has(cur.code) ? "Core module: code is protected." : "Modules appear in the Permission Matrix and navigation."}
        fields={fields} initial={cur ? { ...cur, parent: cur.parent || "None" } : { status: "Active", parent: "None", order: String(mods.length + 1) }} locked={cur && CORE.has(cur.code) ? ["code"] : []} />
      <ConfirmDialog open={conf !== null} onClose={() => setConf(null)} onOk={toggle} title="Change module status?" desc="Inactive modules are hidden from navigation for all roles." />
    </Page>
  )
}