"use client";

import { useMemo, useState } from "react";
import {
  Search, Plus, Users, Wallet, Truck, MapPin, Tag, Pencil, Trash2, X, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Address = { label: string; line: string; city: string; pin: string };
type Customer = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  gst: string;
  status: "Active" | "On hold";
  brands: string[];
  addresses: Address[];
  paymentTerms: string;
  creditLimit: number;
  creditDays: number;
  transporter: string;
  packing: string;
  notes: string;
};

const seed: Customer[] = [
  {
    id: "C-001", name: "Sharma Footwear", contact: "Rakesh Sharma", phone: "98370 12345",
    email: "rakesh@sharmafootwear.in", gst: "09ABCDE1234F1Z5", status: "Active",
    brands: ["Nike", "Puma", "Campus"],
    addresses: [{ label: "Billing", line: "12, Civil Lines", city: "Bareilly", pin: "243001" }],
    paymentTerms: "Net 30", creditLimit: 250000, creditDays: 30,
    transporter: "VRL Logistics", packing: "Carton, 12 pairs per box", notes: "",
  },
  {
    id: "C-002", name: "Step Up Retail", contact: "Neha Gupta", phone: "99270 55410",
    email: "neha@stepup.in", gst: "07FGHIJ5678K1Z2", status: "Active",
    brands: ["Adidas", "Bata"],
    addresses: [
      { label: "Billing", line: "Karol Bagh Market", city: "New Delhi", pin: "110005" },
      { label: "Shipping", line: "Warehouse 4, Okhla", city: "New Delhi", pin: "110020" },
    ],
    paymentTerms: "Net 15", creditLimit: 120000, creditDays: 15,
    transporter: "Delhivery", packing: "Individual shoe box + outer carton", notes: "Call before dispatch",
  },
  {
    id: "C-003", name: "Urban Sole Co.", contact: "Imran Khan", phone: "98100 77821",
    email: "imran@urbansole.co", gst: "09KLMNO9012P1Z8", status: "On hold",
    brands: ["Skechers"],
    addresses: [{ label: "Billing", line: "Sadar Bazaar", city: "Lucknow", pin: "226001" }],
    paymentTerms: "Advance", creditLimit: 0, creditDays: 0,
    transporter: "Self pickup", packing: "Standard", notes: "Pending dues cleared first",
  },
];

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const initials = (s: string) => s.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const blank = (): Customer => ({
  id: "", name: "", contact: "", phone: "", email: "", gst: "", status: "Active",
  brands: [], addresses: [{ label: "Billing", line: "", city: "", pin: "" }],
  paymentTerms: "Net 30", creditLimit: 0, creditDays: 30, transporter: "", packing: "", notes: "",
});

export default function CustomerMasterPage() {
  const [rows, setRows] = useState<Customer[]>(seed);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Customer>(blank());
  const [brandInput, setBrandInput] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === "all" || r.status === status) &&
          `${r.name} ${r.contact} ${r.brands.join(" ")} ${r.addresses.map((a) => a.city).join(" ")}`
            .toLowerCase()
            .includes(q.toLowerCase())
      ),
    [rows, q, status]
  );

  const totalCredit = rows.reduce((s, r) => s + r.creditLimit, 0);
  const set = <K extends keyof Customer>(k: K, v: Customer[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setForm(blank()); setOpen(true); };
  const openEdit = (c: Customer) => { setForm(structuredClone(c)); setOpen(true); };
  const save = () => {
    if (!form.name.trim()) return;
    setRows((r) =>
      form.id
        ? r.map((x) => (x.id === form.id ? form : x))
        : [...r, { ...form, id: `C-${String(r.length + 1).padStart(3, "0")}` }]
    );
    setOpen(false);
  };
  const addBrand = () => {
    const b = brandInput.trim();
    if (b && !form.brands.includes(b)) set("brands", [...form.brands, b]);
    setBrandInput("");
  };
  const setAddr = (i: number, k: keyof Address, v: string) =>
    set("addresses", form.addresses.map((a, j) => (j === i ? { ...a, [k]: v } : a)));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header band — same dark/indigo mood as the login panel */}
      <header className="relative overflow-hidden bg-[#0b0b14] px-6 pb-24 pt-3 text-white md:px-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
          <div>
            {/* <p className="text-sm font-semibold">
              Shoe<span className="text-indigo-400">Flow</span>
            </p> */}
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Customer master</h1>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              Buyers, brands, addresses, payment in one place.
            </p>
          </div>
          <Button onClick={openNew} className="h-11 rounded-xl bg-indigo-500 px-5 font-semibold text-white hover:bg-indigo-400">
            <Plus className="mr-2 h-4 w-4" /> Add customer
          </Button>
        </div>
      </header>

      <main className="relative mx-auto -mt-18 max-w-8xl space-y-5 px-6 pb-12 md:px-10">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, label: "Total customers", value: rows.length },
            { icon: Building2, label: "Active buyers", value: rows.filter((r) => r.status === "Active").length },
            { icon: Wallet, label: "Credit extended", value: inr(totalCredit) },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="flex-row items-center gap-4 rounded-2xl border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-lg shadow-slate-900/5">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by buyer, brand or city"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 w-40 rounded-xl border-slate-200 bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On hold">On hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="pl-5">Buyer</TableHead>
                  <TableHead>Brands</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Terms</TableHead>
                  <TableHead>Credit limit</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => openEdit(c)}>
                    <TableCell className="py-4 pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-xl">
                          <AvatarFallback className="rounded-xl bg-[#111827] text-xs font-semibold text-white">
                            {initials(c.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.contact} · {c.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.brands.map((b) => (
                          <Badge key={b} variant="secondary" className="rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{b}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{c.addresses[0]?.city}</TableCell>
                    <TableCell className="text-slate-600">{c.paymentTerms}</TableCell>
                    <TableCell className="font-medium text-slate-900">{inr(c.creditLimit)}</TableCell>
                    <TableCell className="text-slate-600">{c.transporter}</TableCell>
                    <TableCell>
                      <Badge className={c.status === "Active"
                        ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                        : "rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell><Pencil className="h-4 w-4 text-slate-400" /></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-14 text-center text-slate-500">
                      Koi customer nahi mila. Search badlo ya naya customer add karo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* Add / Edit */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 !max-w-3xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle className="text-xl font-bold">{form.id ? "Edit customer" : "New customer"}</SheetTitle>
            <SheetDescription>{form.id ? `${form.id} · ${form.name}` : "Fill in the buyer details, then save."}</SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="buyer" className="flex-1 overflow-y-auto p-6">
            <TabsList className="grid w-full grid-cols-4 rounded-xl bg-slate-100">
              <TabsTrigger value="buyer">Buyer</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="buyer" className="mt-5 space-y-4">
              <Field label="Business name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Sharma Footwear" className="h-11 rounded-xl" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contact person"><Input value={form.contact} onChange={(e) => set("contact", e.target.value)} className="h-11 rounded-xl" /></Field>
                <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-11 rounded-xl" /></Field>
                <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className="h-11 rounded-xl" /></Field>
                <Field label="GSTIN"><Input value={form.gst} onChange={(e) => set("gst", e.target.value)} className="h-11 rounded-xl" /></Field>
              </div>
              <Field label="Brands they buy">
                <div className="flex gap-2">
                  <Input value={brandInput} onChange={(e) => setBrandInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBrand())}
                    placeholder="Type a brand, press Enter" className="h-11 rounded-xl" />
                  <Button type="button" variant="outline" onClick={addBrand} className="h-11 rounded-xl"><Tag className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.brands.map((b) => (
                    <Badge key={b} className="gap-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                      {b}
                      <button onClick={() => set("brands", form.brands.filter((x) => x !== b))} aria-label={`Remove ${b}`}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => set("status", v as Customer["status"])}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On hold">On hold</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </TabsContent>

            <TabsContent value="address" className="mt-5 space-y-4">
              {form.addresses.map((a, i) => (
                <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><MapPin className="h-4 w-4 text-indigo-500" />{a.label}</span>
                    {form.addresses.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => set("addresses", form.addresses.filter((_, j) => j !== i))} aria-label="Remove address">
                        <Trash2 className="h-4 w-4 text-slate-400" />
                      </Button>
                    )}
                  </div>
                  <Input value={a.line} onChange={(e) => setAddr(i, "line", e.target.value)} placeholder="Street, area" className="h-11 rounded-xl" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={a.city} onChange={(e) => setAddr(i, "city", e.target.value)} placeholder="City" className="h-11 rounded-xl" />
                    <Input value={a.pin} onChange={(e) => setAddr(i, "pin", e.target.value)} placeholder="PIN code" className="h-11 rounded-xl" />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-xl"
                onClick={() => set("addresses", [...form.addresses, { label: "Shipping", line: "", city: "", pin: "" }])}>
                <Plus className="mr-2 h-4 w-4" /> Add shipping address
              </Button>
            </TabsContent>

            <TabsContent value="payment" className="mt-5 space-y-4">
              <Field label="Payment terms">
                <Select value={form.paymentTerms} onValueChange={(v) => set("paymentTerms", v)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Advance", "Net 15", "Net 30", "Net 45", "Net 60"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Credit limit (₹)"><Input type="number" value={form.creditLimit} onChange={(e) => set("creditLimit", +e.target.value)} className="h-11 rounded-xl" /></Field>
                <Field label="Credit days"><Input type="number" value={form.creditDays} onChange={(e) => set("creditDays", +e.target.value)} className="h-11 rounded-xl" /></Field>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-5 space-y-4">
              <Field label="Preferred transporter">
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={form.transporter} onChange={(e) => set("transporter", e.target.value)} className="h-11 rounded-xl pl-10" />
                </div>
              </Field>
              <Field label="Packing requirements"><Input value={form.packing} onChange={(e) => set("packing", e.target.value)} className="h-11 rounded-xl" /></Field>
              <Field label="Special instructions"><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={4} className="rounded-xl" /></Field>
            </TabsContent>
          </Tabs>

          <SheetFooter className="flex-row justify-end gap-2 border-t border-slate-100 p-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl">Cancel</Button>
            <Button onClick={save} className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]">Save customer</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  );
}