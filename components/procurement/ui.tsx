"use client";

import type { ReactNode } from "react";
import React from "react";

export type Tone = "gray" | "blue" | "amber" | "violet" | "green" | "red" | "alert";

export const BUSINESS_DATE = "2026-10-12";

const toneMap: Record<Tone, string> = {
  gray: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-100 text-blue-700 ring-blue-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  violet: "bg-violet-100 text-violet-700 ring-violet-200",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  red: "bg-rose-100 text-rose-700 ring-rose-200",
  alert: "bg-rose-100 text-rose-700 ring-rose-200",
};

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function fmtDate(value: string) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function addDays(value: string, days: number) {
  const d = new Date(`${value}T00:00:00`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function diffDays(a: string, b: string) {
  const d1 = new Date(`${a}T00:00:00`);
  const d2 = new Date(`${b}T00:00:00`);
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

export function num(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export function inr(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "₹—";
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

export const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-400";

export const th = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500";
export const thR = `${th} text-right`;
export const td = "px-3 py-2 align-top text-sm text-slate-700";
export const tdR = `${td} text-right tabular-nums`;

export function Button({ variant = "default", className, children, ...props }: { variant?: "default" | "primary" | "ghost"; className?: string; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    default: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    primary: "border border-blue-600 bg-blue-600 text-white hover:bg-blue-500",
    ghost: "border border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
  };
  return (
    <button
      {...props}
      className={cn("inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Kpi({ label, value, hint, tone = "blue" }: { label: string; value: ReactNode; hint?: string; tone?: Tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-500">{hint}</div>}
      {tone && <div className="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset bg-slate-100 text-slate-700 ring-slate-200">{tone}</div>}
    </div>
  );
}

export function Badge({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", toneMap[tone])}>{children}</span>;
}

export function Notice({ tone = "gray", title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border p-3 text-sm", toneMap[tone], "border-transparent") }>
      {title && <div className="mb-1 font-medium">{title}</div>}
      {children}
    </div>
  );
}

export function Card({ title, flush = false, action, className, children }: { title?: string; flush?: boolean; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", flush ? "overflow-hidden" : "p-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          {title && <div className="text-sm font-semibold text-slate-800">{title}</div>}
          {action}
        </div>
      )}
      <div className={flush ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

export function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="mb-1.5 flex items-center gap-1 font-medium text-slate-600">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export function Drawer({ open, onClose, title, subtitle, wide, children }: { open: boolean; onClose: () => void; title?: string; subtitle?: string; wide?: boolean; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" onClick={onClose}>
      <div className={cn("h-full w-full overflow-y-auto bg-white shadow-2xl", wide ? "max-w-5xl" : "max-w-xl")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">{title || ""}</div>
            {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600">Close</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto"><table className="min-w-full border-separate border-spacing-0">{children}</table></div>;
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((step, index) => (
        <div key={step} className={cn("flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs", index <= current ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
          <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold", index <= current ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600")}>{index + 1}</span>
          {step}
        </div>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
      {tabs.map((tab) => (
        <button key={tab} type="button" onClick={() => onChange(tab)} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", value === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
          {tab}
        </button>
      ))}
    </div>
  );
}

export function DL({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</dt>
          <dd className="mt-1 text-sm text-slate-700">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Timeline({ items }: { items: Array<{ title: string; meta?: string; done?: boolean }> }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={cn("mt-1 h-3 w-3 rounded-full ring-4 ring-white", item.done ? "bg-emerald-500" : "bg-slate-300")} />
            {index < items.length - 1 && <span className="mt-1 h-full w-px bg-slate-200" />}
          </div>
          <div className="pb-2">
            <div className="text-sm font-medium text-slate-800">{item.title}</div>
            {item.meta && <div className="text-xs text-slate-500">{item.meta}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
