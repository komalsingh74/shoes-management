"use client"

import { useMemo, useState } from "react"
import { Building2, Factory, Mail, MapPin, Pencil, Phone, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { factories as factorySeed, companies, users, type Rec } from "@/components/settings/Mock"
import { Page, PageHeader, StatGrid, StatCard, StatusBadge, CreateEditDrawer, type FieldDef, card, primaryBtn } from "@/components/settings/Shared"
import { showSuccess } from "@/lib/toast"

const currentFactoryCode = users[0]?.factory ?? factorySeed[0]?.code

export default function CompanyFactoryPage() {
  const [factory, setFactory] = useState<Rec>(() => ({ ...factorySeed.find(item => item.code === currentFactoryCode) ?? factorySeed[0] }))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const company = useMemo(() => companies.find(item => item.name === factory.company) ?? companies[0], [factory.company])

  const fields: FieldDef[] = [
    { k: "name", label: "Factory Name", req: true },
    { k: "code", label: "Factory Code", req: true },
    { k: "type", label: "Factory Type", req: true },
    { k: "gst", label: "GST Number" },
    { k: "address", label: "Address", type: "textarea", full: true },
    { k: "state", label: "State", req: true },
    { k: "city", label: "City", req: true },
    { k: "pincode", label: "Pincode" },
    { k: "contact", label: "Contact Person", req: true },
    { k: "phone", label: "Phone", req: true, check: value => /^\d{10}$/.test(value) ? undefined : "Enter a 10-digit number" },
    { k: "email", label: "Email", type: "email" },
    { k: "status", label: "Status", type: "select", options: ["Active", "Inactive"], req: true },
  ]

  const save = (updated: Rec) => {
    setFactory(previous => ({ ...previous, ...updated, code: updated.code.toUpperCase() }))
    setDrawerOpen(false)
    showSuccess("Factory details updated")
  }

  return (
    <Page>
      <PageHeader crumbs={["Settings", "Administration", "Company & Factory"]} title="Company & Factory" desc="View and maintain the details for your assigned factory.">
        <Button className={primaryBtn} onClick={() => setDrawerOpen(true)}><Pencil className="mr-2 h-4 w-4" />Edit Factory</Button>
      </PageHeader>

      <StatGrid>
        <StatCard icon={Factory} value={factory.code} label="Factory Code" />
        <StatCard icon={Building2} value={factory.type} label="Factory Type" tone="amber" />
        <StatCard icon={MapPin} value={factory.city} label="Factory Location" tone="slate" />
        <StatCard icon={Factory} value={<StatusBadge status={factory.status} />} label="Factory Status" tone="emerald" />
      </StatGrid>

      <section className={`${card} overflow-hidden`}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Factory className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">Assigned factory</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">{factory.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{factory.code} <span className="mx-1.5 text-slate-300">•</span> {factory.company}</p>
            </div>
          </div>
          <StatusBadge status={factory.status} />
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="p-5 sm:p-6">
            <SectionTitle>Factory details</SectionTitle>
            <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Detail label="Factory name" value={factory.name} icon={Factory} />
              <Detail label="Factory code" value={factory.code} />
              <Detail label="Factory type" value={factory.type} />
              <Detail label="GST number" value={factory.gst} />
              <Detail label="Address" value={[factory.address, factory.city, factory.state, factory.pincode].filter(Boolean).join(", ")} icon={MapPin} />
              <Detail label="Contact person" value={factory.contact} icon={UserRound} />
              <Detail label="Phone" value={factory.phone} icon={Phone} />
              <Detail label="Email" value={factory.email} icon={Mail} />
            </div>
          </div>

          <aside className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <SectionTitle>Company</SectionTitle>
            <p className="mt-4 text-lg font-semibold text-slate-900">{company.name}</p>
            <p className="mt-1 text-sm text-slate-500">{company.legal}</p>
            <div className="mt-5 space-y-4">
              <Detail label="Company code" value={company.code} />
              <Detail label="Registered address" value={[company.address, company.city, company.state, company.pincode].filter(Boolean).join(", ")} icon={MapPin} />
              <Detail label="Company GST number" value={company.gst} />
              <Detail label="Company contact" value={company.contact} icon={UserRound} />
              <Detail label="Company phone" value={company.phone} icon={Phone} />
              <Detail label="Company email" value={company.email} icon={Mail} />
            </div>
          </aside>
        </div>
      </section>

      <CreateEditDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={save} title="Edit Factory Details" desc="Update the profile for your assigned factory." fields={fields} initial={factory} locked={["code"]} />
    </Page>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-slate-900">{children}</h3>
}

function Detail({ label, value, icon: Icon }: { label: string; value?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 flex items-start gap-2 text-sm font-medium text-slate-800">
        {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}
        <span className="break-words">{value || "—"}</span>
      </p>
    </div>
  )
}
