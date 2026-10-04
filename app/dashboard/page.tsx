import Link from "next/link";
import {
  Plus, PackageOpen, ShoppingCart, ClipboardCheck, LineChart, TrendingUp, TrendingDown,
  Percent, Wallet, Timer, PackageMinus, Ban, Truck, CheckCircle2, PackageCheck, Hammer,
  Warehouse, ChevronRight, ArrowUpRight, type LucideIcon,
} from "lucide-react";

const inr = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);

/* ---------------- Sample data: apni API / database se laao ---------------- */
const sales = 1250000;
const expenses = 820000;
const margin = (((sales - expenses) / sales) * 100).toFixed(1);

const KPIS = [
  { label: "Total sales", sub: "This month", value: inr(sales), delta: "+12.4%", up: true, icon: TrendingUp, tint: "bg-emerald-50 text-emerald-600", featured: true },
  { label: "Total expenses", sub: "This month", value: inr(expenses), delta: "+4.1%", up: false, icon: TrendingDown, tint: "bg-red-50 text-red-600" },
  { label: "Profit margin", sub: "Sales minus expenses", value: margin + "%", delta: "+2.3%", up: true, icon: Percent, tint: "bg-indigo-50 text-indigo-600" },
  { label: "Pending payments", sub: "From 9 customers", value: inr(340000), delta: "-8.0%", up: true, icon: Wallet, tint: "bg-amber-50 text-amber-600" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PAIRS = [720, 810, 690, 850, 780, 640, 0];
const TARGET = 800;
const CHART_MAX = 1000;

const ATTENTION = [
  { label: "Delayed jobs", note: "Past their due date", value: "5", icon: Timer, tint: "bg-red-50 text-red-600", href: "/dashboard/production" },
  { label: "Raw material low", note: "Below minimum level", value: "3", icon: PackageMinus, tint: "bg-amber-50 text-amber-600", href: "/dashboard/inventory" },
  { label: "Rejection rate", note: "Today", value: "4.8%", icon: Ban, tint: "bg-red-50 text-red-600", href: "/dashboard/qc" },
  { label: "Pending dispatches", note: "Orders waiting", value: "12", icon: Truck, tint: "bg-indigo-50 text-indigo-600", href: "/dashboard/sales/orders" },
];

const MINI = [
  { label: "Today's production", value: "850", note: "Pairs completed", icon: CheckCircle2, tint: "bg-emerald-50 text-emerald-600" },
  { label: "Orders this week", value: "120", note: "Orders received", icon: PackageCheck, tint: "bg-indigo-50 text-indigo-600" },
  { label: "Active jobs", value: "28", note: "In production now", icon: Hammer, tint: "bg-slate-100 text-slate-700" },
  { label: "Stock value", value: inr(2480000), note: "Raw material and pairs", icon: Warehouse, tint: "bg-slate-100 text-slate-700" },
];

type Status = "Delivered" | "In Production" | "Pending" | "Dispatched";
const STATUS_STYLE: Record<Status, { pill: string; dot: string }> = {
  Delivered: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  "In Production": { pill: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  Pending: { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Dispatched: { pill: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
};
const ORDERS: { id: string; customer: string; pairs: number; amount: number; status: Status }[] = [
  { id: "SO-1048", customer: "Sharma Footwear", pairs: 600, amount: 285000, status: "In Production" },
  { id: "SO-1047", customer: "Metro Retail", pairs: 250, amount: 118000, status: "Dispatched" },
  { id: "SO-1046", customer: "Kapoor Traders", pairs: 400, amount: 176000, status: "Pending" },
  { id: "SO-1045", customer: "Step Up Exports", pairs: 1200, amount: 540000, status: "Delivered" },
  { id: "SO-1044", customer: "City Shoes", pairs: 180, amount: 82500, status: "Delivered" },
];

const ACTIONS: { label: string; href: string; icon: LucideIcon; color: string }[] = [
  { label: "Material issue", href: "/dashboard/store", icon: PackageOpen, color: "text-slate-500" },
  { label: "Create PO", href: "/dashboard/purchase", icon: ShoppingCart, color: "text-indigo-500" },
  { label: "QC report", href: "/dashboard/qc", icon: ClipboardCheck, color: "text-indigo-500" },
  { label: "View reports", href: "/dashboard", icon: LineChart, color: "text-indigo-500" },
];

const card = "rounded-xl border border-slate-200 bg-white";
const focus = "outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

/* ---------------- Page ---------------- */
export default function DashboardPage() {
  const now = new Date();
  const dateText = new Intl.DateTimeFormat("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
  }).format(now);
  const todayName = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Kolkata" }).format(now);
  const todayIdx = DAYS.indexOf(todayName);
  const weekTotal = PAIRS.reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 font-sans text-slate-900 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{dateText}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, Amit</h1>
          <p className="mt-1 text-sm text-slate-500">Here is what is happening in your factory today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/production"
            className={`inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-500 ${focus}`}
          >
            <Plus size={16} /> Create job
          </Link>
          {ACTIONS.map(({ label, href, icon: Icon, color }) => (
            <Link
              key={label}
              href={href}
              className={`inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${focus}`}
            >
              <Icon size={16} className={color} /> {label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map(({ label, sub, value, delta, up, icon: Icon, tint, featured }) => (
          <div
            key={label}
            className={`relative overflow-hidden p-5 ${
              featured ? "rounded-xl bg-[#0b0b14] text-white" : card
            }`}
          >
            {featured && <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-600/40 blur-3xl" />}
            <div className="relative flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${featured ? "bg-white/10 text-indigo-300" : tint}`}>
                <Icon size={19} />
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  featured ? "bg-emerald-400/15 text-emerald-300" : up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}
              >
                <ArrowUpRight size={12} className={up ? "" : "rotate-90"} /> {delta}
              </span>
            </div>
            <p className={`relative mt-4 text-sm ${featured ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
            <p className="relative mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className={`relative mt-1 text-xs ${featured ? "text-slate-500" : "text-slate-400"}`}>{sub}</p>
          </div>
        ))}
      </section>

      {/* Chart + attention */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="prod-title" className={`${card} p-6 lg:col-span-2`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="prod-title" className="text-base font-semibold">Production this week</h2>
              <p className="mt-0.5 text-sm text-slate-500">Pairs completed per day. Target: {TARGET} pairs</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tabular-nums">{new Intl.NumberFormat("en-IN").format(weekTotal)}</p>
              <p className="text-xs text-slate-500">pairs so far</p>
            </div>
          </div>

          <div className="relative mt-6 h-56">
            {/* target line */}
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-indigo-300"
              style={{ bottom: `calc(1.5rem + ${(TARGET / CHART_MAX) * 11}rem)` }}
              aria-hidden
            />
            <div className="absolute inset-0 flex items-end gap-3 sm:gap-5">
              {DAYS.map((d, i) => {
                const has = i <= todayIdx && PAIRS[i] > 0;
                const isToday = i === todayIdx;
                return (
                  <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="h-4 text-xs font-medium tabular-nums text-slate-700">{has ? PAIRS[i] : ""}</span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className={`w-full rounded-t-md transition-all ${has ? (isToday ? "bg-indigo-600" : "bg-indigo-200") : "bg-slate-100"}`}
                        style={{ height: has ? `${(PAIRS[i] / CHART_MAX) * 100}%` : "6%" }}
                      />
                    </div>
                    <span className={`text-xs ${isToday ? "font-semibold text-slate-900" : "text-slate-500"}`}>{d}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-labelledby="attn-title" className={`${card} p-6`}>
          <h2 id="attn-title" className="text-base font-semibold">Needs attention</h2>
          <p className="mt-0.5 text-sm text-slate-500">Check these first</p>
          <ul className="mt-4 divide-y divide-slate-100">
            {ATTENTION.map(({ label, note, value, icon: Icon, tint, href }) => (
              <li key={label}>
                <Link href={href} className={`group flex items-center gap-3 rounded-lg py-3 ${focus}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tint}`}><Icon size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{label}</p>
                    <p className="truncate text-xs text-slate-500">{note}</p>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">{value}</span>
                  <ChevronRight size={16} className="text-slate-300 transition-colors group-hover:text-indigo-600" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Mini stats */}
      <section aria-label="Quick stats" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MINI.map(({ label, value, note, icon: Icon, tint }) => (
          <div key={label} className={`${card} flex items-center gap-4 p-5`}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${tint}`}><Icon size={20} /></span>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-500">{label}</p>
              <p className="text-xl font-semibold tabular-nums">{value}</p>
              <p className="truncate text-xs text-slate-400">{note}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Recent orders */}
      <section aria-labelledby="orders-title" className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 id="orders-title" className="text-base font-semibold">Recent sales orders</h2>
            <p className="mt-0.5 text-sm text-slate-500">Latest 5 orders</p>
          </div>
          <Link href="/dashboard/sales/orders" className={`inline-flex items-center gap-1 rounded text-sm font-medium text-indigo-600 hover:text-indigo-700 ${focus}`}>
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3 text-right">Pairs</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ORDERS.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-6 py-3.5 font-medium text-indigo-700">{o.id}</td>
                  <td className="px-6 py-3.5 text-slate-700">{o.customer}</td>
                  <td className="px-6 py-3.5 text-right tabular-nums text-slate-700">{o.pairs}</td>
                  <td className="px-6 py-3.5 text-right font-medium tabular-nums">{inr(o.amount)}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[o.status].pill}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[o.status].dot}`} />
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}