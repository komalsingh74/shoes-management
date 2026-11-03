"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, Kpi, PageHeader, Section, StatusBadge, Sub, btnPrimary, td, th } from "./ui"

export type Job = { id: string; article: string; qty: number; done: number; due: string; status: string }
type Props = {
  title: string
  description: string
  kpis: { label: string; value: string; sub?: string; tone?: "red" | "green" }[]
  jobs: Job[]
  steps: string[]
  metricLabel: string // e.g. "Pairs cut"
  rejectLabel: string // e.g. "Wastage"
}

export function Workbench({ title, description, kpis, jobs, steps, metricLabel, rejectLabel }: Props) {
  const [active, setActive] = useState(jobs[0])
  const [checked, setChecked] = useState<string[]>([])
  const toggle = (s: string) => setChecked((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]))
  return (
    <div className="space-y-2 p-0">
      <PageHeader title={title} description={description} action={<Button asChild className={btnPrimary}><Link href="/dashboard/production/production-management?tab=create">Create Production Order</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => <Kpi key={k.label} {...k} />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Section title="Job queue" flush>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={th}>Job</TableHead><TableHead className={th}>Progress</TableHead>
                <TableHead className={th}>Due</TableHead><TableHead className={th}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => (
                <TableRow key={j.id} onClick={() => setActive(j)} className={`cursor-pointer ${active.id === j.id ? "bg-muted/50" : ""}`}>
                  <TableCell className={td}><div className="font-medium">{j.id}</div><Sub>{j.article}</Sub></TableCell>
                  <TableCell className={`${td} w-56`}>
                    <div className="mb-1.5 text-sm">{j.done} / {j.qty} pairs</div>
                    <Bar value={(j.done / j.qty) * 100} tone={j.status === "Delayed" ? "red" : "indigo"} />
                  </TableCell>
                  <TableCell className={td}>{j.due}</TableCell>
                  <TableCell className={td}><StatusBadge status={j.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section title={`Active: ${active.id}`}>
          <p className="-mt-2 mb-5 text-sm text-muted-foreground">{active.article} · {active.qty} pairs</p>
          <div className="space-y-3">
            {steps.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-3 rounded-xl border p-3">
                <Checkbox checked={checked.includes(s)} onCheckedChange={() => toggle(s)} />
                <span className="text-sm">{s}</span>
              </label>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>{metricLabel}</Label><Input type="number" defaultValue={active.done} className="h-11 rounded-xl" /></div>
            <div className="space-y-1.5"><Label>{rejectLabel}</Label><Input type="number" defaultValue={0} className="h-11 rounded-xl" /></div>
          </div>
          <Button className={`${btnPrimary} mt-5 w-full`}>Mark complete & send to next stage</Button>
        </Section>
      </div>
    </div>
  )
}