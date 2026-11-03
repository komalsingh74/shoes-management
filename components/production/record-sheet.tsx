"use client"

import { useId, useState, type FormEvent } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { btnPrimary } from "./ui"

type Field = {
  name: string; label: string; type?: "text" | "number" | "date";
  options?: string[]; min?: number; step?: string; optional?: boolean
}

export function RecordSheet({ title, description, fields, onSave }: {
  title: string; description: string; fields: Field[];
  onSave: (values: Record<string, string>) => void
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const id = useId()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>
    for (const key of Object.keys(values)) values[key] = values[key].trim()
    if (fields.some((field) => !field.optional && !values[field.name])) {
      setError("Please complete all required fields.")
      return
    }
    if (values.from && values.from === values.to) {
      setError("Select different source and destination departments.")
      return
    }
    if (values.checked && Number(values.passed) + Number(values.rejected) > Number(values.checked)) {
      setError("Passed and rejected pairs cannot exceed checked pairs.")
      return
    }
    onSave(values)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={(value) => { setOpen(value); setError("") }}>
      <SheetTrigger asChild><Button className={btnPrimary}><Plus className="size-4" />{title}</Button></SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-lg data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b p-6 pr-12">
          <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`${id}-${field.name}`}>{field.label}{!field.optional && " *"}</Label>
                {field.options ? (
                  <select id={`${id}-${field.name}`} name={field.name} required={!field.optional} defaultValue="" className="h-11 w-full rounded-xl border bg-background px-3 text-sm">
                    <option value="" disabled>Select {field.label.toLowerCase()}</option>
                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : <Input id={`${id}-${field.name}`} name={field.name} type={field.type || "text"} min={field.min} step={field.step} required={!field.optional} className="h-11 rounded-xl" />}
              </div>
            ))}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-slate-500">Records are saved for this page session.</p>
          </div>
          <SheetFooter className="flex-row justify-end border-t p-6">
            <SheetClose asChild><Button type="button" variant="outline" className="h-11 rounded-xl">Cancel</Button></SheetClose>
            <Button type="submit" className={btnPrimary}>Save</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
