"use client"

import { useMemo, useState } from "react"
import { Save, RotateCcw } from "lucide-react"
import { showSuccess, showError } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { modules, roles } from "@/components/settings/Mock"
import { Page, PageHeader, SearchBox, FilterSelect, ConfirmDialog, EmptyState, card, primaryBtn, outlineBtn } from "@/components/settings/Shared"

const LEVELS: Record<string, { label: string; cls: string }> = {
  F: { label: "Full Control", cls: "bg-indigo-600 text-white" }, A: { label: "Approve + Edit", cls: "bg-emerald-100 text-emerald-700" },
  E: { label: "Create + Edit", cls: "bg-blue-100 text-blue-700" }, V: { label: "View Only", cls: "bg-slate-200 text-slate-700" }, N: { label: "No Access", cls: "bg-slate-50 text-slate-400" },
}
// Default access per role. "*X" = all modules, then module+level tokens.
const SEED: Record<string, string> = {
  SYS_ADMIN: "*F", OWNER: "*V M16A M13A M05A", SALES_MGR: "M05A M02V M03V M16V M07V", MERCH: "M05E M03V M04V M02V M07V",
  PROD_ENG: "M04E M03E M07E M02V", PURCHASE: "M10E M09V M03V M11V M02V", STORE: "M11E M09E M10V M02V",
  PROD_MGR: "M06A M07V M04V M15V M02V M16V M08V", LINE_SUP: "M06E M07E M02V", QC_INSP: "M08E M07V M06V M02V",
  DISPATCH: "M12E M07V M05V M02V", ACCOUNTS: "M13E M10V M12V M16V M02V", HR: "M14E M02V", SAMPLE_LEAD: "M04V M05V M07E",
}
const build = () => {
  const m: Record<string, string> = {}
  roles.forEach(r => {
    const toks = (SEED[r.code] ?? "").split(" ").filter(Boolean)
    modules.forEach(md => (m[`${md.code}|${r.code}`] = toks.find(t => t[0] === "*")?.[1] ?? "N"))
    toks.filter(t => t[0] !== "*").forEach(t => (m[`${t.slice(0, 3)}|${r.code}`] = t[3]))
  })
  return m
}
const DEFAULT = build()

export default function PermissionMatrixPage() {
  const [saved, setSaved] = useState(DEFAULT)
  const [draft, setDraft] = useState(DEFAULT)
  const [role, setRole] = useState("all"), [q, setQ] = useState("")
  const [dlg, setDlg] = useState<"save" | "reset" | null>(null)
  const changes = useMemo(() => Object.keys(draft).filter(k => draft[k] !== saved[k]).length, [draft, saved])
  const cols = roles.filter(r => role === "all" || r.name === role)
  const rows = modules.filter(m => (m.code + m.name).toLowerCase().includes(q.toLowerCase()))

  return (
    <Page>
      <PageHeader crumbs={["Settings", "Administration", "Permission Matrix"]} title="Permission Matrix" desc="Control which modules and operations each role can access.">
        {changes > 0 && <span className="flex items-center gap-2 self-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"><span className="h-2 w-2 rounded-full bg-amber-500" />{changes} unsaved change{changes > 1 && "s"}</span>}
        <Button variant="outline" className={outlineBtn} onClick={() => setDlg("reset")}><RotateCcw className="mr-2 h-4 w-4" />Reset to Default</Button>
        <Button className={primaryBtn} disabled={!changes} onClick={() => setDlg("save")}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
      </PageHeader>
      <div className={card}>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
          <FilterSelect value={role} onChange={setRole} all="All roles" options={roles.map(r => r.name)} className="w-full sm:w-56" />
          <SearchBox value={q} onChange={setQ} placeholder="Search module" />
          <div className="flex flex-wrap gap-1.5">{Object.entries(LEVELS).map(([k, l]) => <span key={k} className={`rounded-md px-2 py-1 text-xs font-medium ${l.cls}`}>{k} · {l.label}</span>)}</div>
        </div>
        {rows.length === 0 ? <EmptyState text="No modules match your search." /> : (
          <div className="max-h-[66vh] overflow-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-30 min-w-[230px] border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">Module</th>
                  {cols.map(r => <th key={r.code} className="sticky top-0 z-20 min-w-[130px] border-b border-slate-200 bg-slate-50 px-2 py-3 text-center text-xs font-semibold leading-tight text-slate-600">{r.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map(m => (
                  <tr key={m.code} className="group">
                    <td className="sticky left-0 z-10 border-b border-r border-slate-100 bg-white px-4 py-2.5 group-hover:bg-slate-50"><span className="mr-2 text-xs font-semibold text-indigo-600">{m.code}</span><span className="font-medium text-slate-800">{m.name}</span></td>
                    {cols.map(r => {
                      const k = `${m.code}|${r.code}`, v = draft[k]
                      return (
                        <td key={k} className="border-b border-slate-100 px-2 py-2 text-center group-hover:bg-slate-50/60">
                          <select value={v} aria-label={`${m.name} for ${r.name}`} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))}
                            className={`h-8 w-24 cursor-pointer rounded-lg border-0 px-2 text-center text-xs font-semibold outline-none ring-offset-1 focus:ring-2 focus:ring-indigo-400 ${LEVELS[v].cls} ${v !== saved[k] ? "ring-2 ring-amber-400" : ""}`}>
                            {Object.entries(LEVELS).map(([c, l]) => <option key={c} value={c}>{c} – {l.label}</option>)}
                          </select>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog open={dlg === "save"} onClose={() => setDlg(null)} title="Save permission changes?" desc={`${changes} permission${changes > 1 ? "s" : ""} will be updated for the affected roles.`} okLabel="Save changes"
        onOk={() => { setSaved(draft); setDlg(null); showSuccess("Permissions saved") }} />
      <ConfirmDialog open={dlg === "reset"} onClose={() => setDlg(null)} title="Reset to default?" desc="All permissions return to the standard ShoeFlow defaults. Saved changes will be discarded." okLabel="Reset"
        onOk={() => { setDraft(DEFAULT); setSaved(DEFAULT); setDlg(null); showSuccess("Permissions reset to default") }} />
    </Page>
  )
}