"use client";

import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  ShoppingCart,
  FilePlus,
  Box,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Factory,
  FileText,
  MoreHorizontal,
  Printer,
  Edit3,
  X,
  Layers,
  Calendar,
  CreditCard,
  MapPin,
  Trash2,
  Tag,
  Copy,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Types ---
type OrderStatus =
  | "Draft"
  | "Pending Approval"
  | "Confirmed"
  | "In Production"
  | "Ready for Dispatch"
  | "Completed"
  | "On Hold"
  | "Cancelled";

interface SizeMap {
  [size: string]: number;
}

interface OrderLine {
  id: string;
  style: string;
  productName: string;
  color: string;
  sizeGroup: string;
  sizes: SizeMap;
  price: number;
  discount: number;
  tax: number;
  expectedQty?: number;
}

interface Order {
  id: string;
  customer: string;
  customerPo: string;
  orderDate: string;
  deliveryDate: string;
  status: OrderStatus;
  lines: OrderLine[];
  produced: number;
  dispatched: number;
  priority: "Normal" | "High" | "Urgent";
  salesPerson: string;
  location: string;
  paymentTerms: string;
  amendments: string[];
  activityLog: { time: string; text: string }[];
}

// --- Mock Data ---
const STYLES = {
  "MC-2401": {
    name: "Men's Casual Leather Shoe",
    sizes: ["6", "7", "8", "9", "10", "11"],
  },
  "M-102": {
    name: "Men's Casual Sneaker",
    sizes: ["6", "7", "8", "9", "10", "11"],
  },
  "M-205": { name: "Men's Formal Shoe", sizes: ["7", "8", "9", "10", "11"] },
  "WS-1102": { name: "Women's Sandal", sizes: ["3", "4", "5", "6", "7", "8"] },
  "SS-4501": { name: "Safety Shoe", sizes: ["6", "7", "8", "9", "10", "11"] },
};

const COLORS = ["Black", "White", "Brown", "Tan", "Navy"];
const CUSTOMERS = ["ABC Footwear Pvt. Ltd.", "XYZ Shoes", "LMN Retail"];
const STATUSES: OrderStatus[] = [
  "Draft",
  "Pending Approval",
  "Confirmed",
  "In Production",
  "Ready for Dispatch",
  "Completed",
  "On Hold",
  "Cancelled",
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "SO-2026-0184",
    customer: "ABC Footwear Pvt. Ltd.",
    customerPo: "ABC/PO/2026/184",
    orderDate: "2026-10-08",
    deliveryDate: "2026-11-25",
    status: "In Production",
    lines: [
      {
        id: "l1",
        style: "M-102",
        productName: "Men's Casual Sneaker",
        color: "Black",
        sizeGroup: "UK 6-11",
        sizes: { "6": 50, "7": 100, "8": 150, "9": 120, "10": 80 },
        price: 850,
        discount: 2,
        tax: 18,
      },
      {
        id: "l2",
        style: "M-102",
        productName: "Men's Casual Sneaker",
        color: "White",
        sizeGroup: "UK 6-11",
        sizes: { "6": 30, "7": 60, "8": 90, "9": 70, "10": 50 },
        price: 870,
        discount: 2,
        tax: 18,
      },
      {
        id: "l3",
        style: "M-205",
        productName: "Men's Formal Shoe",
        color: "Brown",
        sizeGroup: "UK 7-11",
        sizes: { "7": 60, "8": 100, "9": 100, "10": 80, "11": 60 },
        price: 920,
        discount: 0,
        tax: 18,
      },
    ],
    produced: 750,
    dispatched: 150,
    priority: "Normal",
    salesPerson: "Rahul Sharma",
    location: "Main Warehouse",
    paymentTerms: "30 Days",
    amendments: [],
    activityLog: [
      { time: "2026-10-08 10:00", text: "Order created by Rahul" },
      { time: "2026-10-09 09:12", text: "Manager confirmed order" },
    ],
  },
  {
    id: "SO-2026-0185",
    customer: "XYZ Shoes",
    customerPo: "XYZ/PO/291",
    orderDate: "2026-10-09",
    deliveryDate: "2026-11-28",
    status: "Confirmed",
    lines: [
      {
        id: "l4",
        style: "MC-2401",
        productName: "Men's Casual Leather Shoe",
        color: "Black",
        sizeGroup: "UK 6-11",
        sizes: {
          "6": 200,
          "7": 400,
          "8": 700,
          "9": 900,
          "10": 800,
          "11": 500,
        },
        price: 640,
        discount: 0,
        tax: 18,
      },
    ],
    produced: 0,
    dispatched: 0,
    priority: "High",
    salesPerson: "Rahul Sharma",
    location: "Main Warehouse",
    paymentTerms: "30 Days",
    amendments: [],
    activityLog: [{ time: "2026-10-09 10:00", text: "Order created" }],
  },
  {
    id: "SO-2026-0186",
    customer: "LMN Retail",
    customerPo: "LMN/PO/091",
    orderDate: "2026-10-10",
    deliveryDate: "2026-12-02",
    status: "Ready for Dispatch",
    lines: [
      {
        id: "l5",
        style: "SS-4501",
        productName: "Safety Shoe",
        color: "Tan",
        sizeGroup: "UK 6-11",
        sizes: {
          "6": 300,
          "7": 350,
          "8": 400,
          "9": 450,
          "10": 350,
          "11": 250,
        },
        price: 980,
        discount: 0,
        tax: 18,
      },
    ],
    produced: 2100,
    dispatched: 0,
    priority: "Normal",
    salesPerson: "Amit Kumar",
    location: "Main Warehouse",
    paymentTerms: "15 Days",
    amendments: [],
    activityLog: [{ time: "2026-10-10 10:00", text: "Order created" }],
  },
  {
    id: "SO-2026-0181",
    customer: "XYZ Shoes",
    customerPo: "XYZ/PO/270",
    orderDate: "2026-09-28",
    deliveryDate: "2026-10-16",
    status: "In Production",
    lines: [
      {
        id: "l6",
        style: "WS-1102",
        productName: "Women's Sandal",
        color: "Brown",
        sizeGroup: "UK 3-8",
        sizes: { "3": 100, "4": 200, "5": 300, "6": 300, "7": 200, "8": 100 },
        price: 410,
        discount: 0,
        tax: 18,
      },
    ],
    produced: 300,
    dispatched: 0,
    priority: "Urgent",
    salesPerson: "Rahul Sharma",
    location: "Main Warehouse",
    paymentTerms: "30 Days",
    amendments: [],
    activityLog: [{ time: "2026-09-28 10:00", text: "Order created" }],
  },
];

// --- Utilities ---
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const calcLineTotal = (line: OrderLine) => {
  return Object.values(line.sizes).reduce((a, b) => a + b, 0);
};

const calcOrderQty = (order: Order) =>
  order.lines.reduce((a, l) => a + calcLineTotal(l), 0);

const calcOrderValue = (order: Order) => {
  return order.lines.reduce((total, line) => {
    const qty = calcLineTotal(line);
    const subtotal = qty * line.price;
    const discounted = subtotal * (1 - line.discount / 100);
    return total + discounted * (1 + line.tax / 100);
  }, 0);
};

const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

const getRisk = (order: Order) => {
  if (["Completed", "Cancelled", "Draft"].includes(order.status)) return "";
  const today = new Date("2026-10-11");
  const delivery = new Date(order.deliveryDate);
  const daysLeft = Math.round(
    (delivery.getTime() - today.getTime()) / 86400000
  );
  const pendingProduction = calcOrderQty(order) - order.produced;

  if (daysLeft < 0 && pendingProduction > 0) return "Overdue";
  if (pendingProduction > 0 && daysLeft * 60 < pendingProduction)
    return "Delivery Risk";
  return "";
};

// --- Sub-Components ---

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-700",
    "Pending Approval": "bg-amber-50 text-amber-700",
    Confirmed: "bg-indigo-50 text-indigo-700",
    "In Production": "bg-orange-50 text-orange-700",
    "Ready for Dispatch": "bg-emerald-50 text-emerald-700",
    Completed: "bg-emerald-50 text-emerald-700",
    "On Hold": "bg-rose-50 text-rose-700",
    Cancelled: "bg-rose-50 text-rose-700",
  };
  return (
    <Badge
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </Badge>
  );
};

const ProgressBar = ({
  current,
  total,
  color = "bg-indigo-600",
}: {
  current: number;
  total: number;
  color?: string;
}) => {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// --- Main Component ---
export default function OrderModulePage() {
  const [view, setView] = useState<"dashboard" | "list" | "create" | "detail">(
    "dashboard"
  );
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState("Overview");

  // List filters
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState(false);
  const [customerFilter, setCustomerFilter] = useState("");

  // Wizard State
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<Order>>({
    customer: "",
    customerPo: "",
    orderDate: "2026-10-11",
    deliveryDate: "",
    priority: "Normal",
    salesPerson: "Rahul Sharma",
    location: "Main Warehouse",
    paymentTerms: "30 Days",
    lines: [],
  });
  const [wizardErrors, setWizardErrors] = useState<string[]>([]);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // --- Handlers ---
  const handleCreateOrder = () => {
    setWizardData({
      customer: "",
      customerPo: "",
      orderDate: "2026-10-11",
      deliveryDate: "",
      priority: "Normal",
      salesPerson: "Rahul Sharma",
      location: "Main Warehouse",
      paymentTerms: "30 Days",
      lines: [],
    });
    setWizardStep(0);
    setWizardErrors([]);
    setView("create");
  };

  const handleSelectOrder = (id: string) => {
    setSelectedOrderId(id);
    setActiveDetailTab("Overview");
    setView("detail");
  };

  const handleSaveOrder = (status: OrderStatus) => {
    const errors = validateWizard();
    if (status !== "Draft" && errors.length > 0) {
      setWizardErrors(errors);
      return;
    }

    const newOrder: Order = {
      ...(wizardData as Order),
      id: `SO-2026-0${187 + orders.length}`,
      status: status,
      produced: 0,
      dispatched: 0,
      amendments: [],
      activityLog: [
        {
          time: new Date().toISOString().slice(0, 16).replace("T", " "),
          text: `Order created as ${status}`,
        },
      ],
    };

    setOrders([newOrder, ...orders]);
    setToast(`Order ${newOrder.id} saved as ${status}`);
    setView("list");
  };

  const validateWizard = (step?: number) => {
    const errors: string[] = [];
    const checkStep = step !== undefined ? step : -1;
    const w = wizardData;

    if (checkStep === 0 || checkStep === -1) {
      if (!w.customer) errors.push("Select a customer.");
      if (!w.customerPo) errors.push("Customer PO number is required.");
      if (!w.deliveryDate) errors.push("Delivery date is required.");
      if (w.deliveryDate && w.orderDate && w.deliveryDate < w.orderDate)
        errors.push("Delivery date cannot be before order date.");
      const dup = orders.find(
        (o) => o.customer === w.customer && o.customerPo === w.customerPo
      );
      if (dup)
        errors.push(
          `Duplicate PO: ${w.customerPo} already exists as ${dup.id}.`
        );
    }
    if (checkStep === 1 || checkStep === -1) {
      if (!w.lines || w.lines.length === 0)
        errors.push("Add at least one style and colour.");
    }
    if (checkStep === 2 || checkStep === -1) {
      w.lines?.forEach((l) => {
        const total = calcLineTotal(l);
        if (total === 0)
          errors.push(`${l.style} / ${l.color} has no quantity.`);
        if (l.expectedQty && total > l.expectedQty)
          errors.push(
            `${l.style} / ${l.color} exceeds PO quantity by ${
              total - l.expectedQty
            } pairs.`
          );
      });
    }
    if (checkStep === 3 || checkStep === -1) {
      w.lines?.forEach((l) => {
        if (!l.price || l.price <= 0)
          errors.push(`Enter a valid unit price for ${l.style} / ${l.color}.`);
      });
    }
    return errors;
  };

  const nextStep = () => {
    const errors = validateWizard(wizardStep);
    if (errors.length > 0) {
      setWizardErrors(errors);
      return;
    }
    setWizardErrors([]);
    setWizardStep((s) => Math.min(s + 1, 4));
  };

  // --- Render Views ---
const renderDashboard = () => {
  const totalOrders = orders.length;
  const pendingApproval = orders.filter((o) => o.status === "Pending Approval").length;
  const inProduction = orders
    .filter((o) => o.status === "In Production")
    .reduce((a, o) => a + calcOrderQty(o), 0);
  const readyDispatch = orders.filter((o) => o.status === "Ready for Dispatch").length;
  const totalOrdered = orders.reduce((a, o) => a + calcOrderQty(o), 0);
  const totalProduced = orders.reduce((a, o) => a + o.produced, 0);
  const totalDispatched = orders.reduce((a, o) => a + o.dispatched, 0);
  const totalValue = orders.reduce((a, o) => a + calcOrderValue(o), 0);
  const riskOrders = orders.filter((o) => getRisk(o) !== "");

    const statusCounts = STATUSES.map((s) => ({
    status: s,
    count: orders.filter((o) => o.status === s).length,
  })).filter((x) => x.count > 0);

  const productionPct = totalOrdered ? Math.round((totalProduced / totalOrdered) * 100) : 0;
  const dispatchPct = totalOrdered ? Math.round((totalDispatched / totalOrdered) * 100) : 0;

  // Sparkline data generator (mocked trend)
  const spark = (seed: number) =>
    Array.from({ length: 12 }, (_, i) =>
      Math.max(10, Math.round(Math.sin(i * 0.8 + seed) * 20 + 40 + (i * 2)))
    );

  const showOrders = (status = "All") => {
    setStatusFilter(status);
    setRiskFilter(false);
    setCustomerFilter("");
    setSearchQuery("");
    setView("list");
  };

  // ---------- Reusable Sparkline ----------
  const Sparkline = ({ data, color = "#6366f1" }: { data: number[]; color?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 30 - ((v - min) / range) * 26 - 2;
        return `${x},${y}`;
      })
      .join(" ");
    const areaPoints = `0,30 ${points} 100,30`;
    const id = `spark-${color.replace("#", "")}-${data[0]}`;
    return (
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${id})`} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // ---------- Status meta ----------
  const statusMeta: Record<string, { color: string; dot: string; text: string }> = {
    Draft: { color: "bg-slate-400", dot: "bg-slate-400", text: "text-slate-600" },
    "Pending Approval": { color: "bg-amber-500", dot: "bg-amber-500", text: "text-amber-700" },
    Confirmed: { color: "bg-indigo-500", dot: "bg-indigo-500", text: "text-indigo-700" },
    "In Production": { color: "bg-orange-500", dot: "bg-orange-500", text: "text-orange-700" },
    "Ready for Dispatch": { color: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-700" },
    Completed: { color: "bg-teal-500", dot: "bg-teal-500", text: "text-teal-700" },
    "On Hold": { color: "bg-rose-400", dot: "bg-rose-400", text: "text-rose-700" },
    Cancelled: { color: "bg-rose-600", dot: "bg-rose-600", text: "text-rose-700" },
  };

  const recentActivity = orders
    .flatMap((o) =>
      o.activityLog.map((log) => ({ ...log, orderId: o.id, customer: o.customer }))
    )
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="space-y-2">
      {/* ═══════════════════════════════════════════════ */}
      {/* ROW 1 : HERO + QUICK ACTIONS                    */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at top right, black, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at top right, black, transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
              <span className="text-xs font-medium text-slate-500">
                Updated just now
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Order Overview
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Real-time view of your sales pipeline — from PO confirmation to
              final dispatch.
               {/* Track risk, monitor production, and act fast. */}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                onClick={handleCreateOrder}
                className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
              <Button
                variant="outline"
                onClick={() => showOrders()}
                className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                All Orders
              </Button>
              <Button
                variant="ghost"
                onClick={() => showOrders("In Production")}
                className="h-10 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <Factory className="mr-2 h-4 w-4" />
                Production
              </Button>
            </div>
          </div>

          {/* Right: Big value number */}
          <div className="flex shrink-0 flex-col items-start gap-1 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 lg:min-w-[260px]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Order Value
            </span>
            <span className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              {inr(totalValue)}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">
                ↑ 8.2%
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
            <div className="mt-2 h-px w-full bg-slate-200" />
            <div className="mt-2 flex w-full items-center justify-between text-xs">
              <span className="text-slate-500">{totalOrders} active orders</span>
              <span className="font-semibold text-slate-900">
                {totalOrdered.toLocaleString()} pairs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ROW 2 : KPI CARDS WITH SPARKLINES               */}
      {/* ═══════════════════════════════════════════════ */}
 <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  {[
    {
      label: "Total Orders",
      value: totalOrders,
      sub: "All statuses",
      icon: ShoppingCart,
      trend: "+12.4%",
      trendUp: true,
      color: "#6366f1",
      spark: spark(1),
      action: () => showOrders(),
    },
    {
      label: "Ordered Pairs",
      value: totalOrdered.toLocaleString(),
      sub: `${productionPct}% produced`,
      icon: Box,
      trend: "+8.1%",
      trendUp: true,
      color: "#0ea5e9",
      spark: spark(2),
      action: () => showOrders(),
    },
    {
      label: "In Production",
      value: inProduction.toLocaleString(),
      sub: `${totalOrders - readyDispatch} batches`,
      icon: Factory,
      trend: "+24.6%",
      trendUp: true,
      color: "#f59e0b",
      spark: spark(3),
      action: () => showOrders("In Production"),
    },
    {
      label: "Ready to Ship",
      value: readyDispatch,
      sub: "Awaiting dispatch",
      icon: Truck,
      trend: "-3.2%",
      trendUp: false,
      color: "#10b981",
      spark: spark(4),
      action: () => showOrders("Ready for Dispatch"),
    },
  ].map((kpi, idx) => {
    const Icon = kpi.icon;
    return (
      <Card
        key={kpi.label}
        onClick={kpi.action}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            kpi.action();
          }
        }}
        className="group relative cursor-pointer overflow-hidden rounded-xl border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        style={{ animationDelay: `${idx * 50}ms` }}
      >
        {/* Top row: icon + label + trend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="grid h-7 w-7 place-items-center rounded-md"
              style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-slate-500">
              {kpi.label}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
              kpi.trendUp
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {kpi.trendUp ? "↑" : "↓"} {kpi.trend}
          </span>
        </div>

        {/* Value + sub */}
        <div className="mt-2.5 flex items-end justify-between gap-2">
          <div>
            <p className="text-2xl font-bold tabular-nums leading-none tracking-tight text-slate-900">
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{kpi.sub}</p>
          </div>

          {/* Mini sparkline inline right side */}
          <div className="h-8 w-16 shrink-0 opacity-80">
            <Sparkline data={kpi.spark} color={kpi.color} />
          </div>
        </div>
      </Card>
    );
  })}
</section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ROW 3 : MAIN CHART + PRODUCTION FUNNEL          */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="grid gap-5 xl:grid-cols-3">
        {/* LEFT: Status Breakdown (2 cols) */}
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-start justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Pipeline Breakdown
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Orders grouped by current lifecycle stage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 sm:inline-block">
                Last 30 days
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showOrders()}
                className="h-8 rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {statusCounts.map((s) => {
              const pct = totalOrders ? Math.round((s.count / totalOrders) * 100) : 0;
              const meta = statusMeta[s.status] || statusMeta.Draft;
              const orderValue = orders
                .filter((o) => o.status === s.status)
                .reduce((a, o) => a + calcOrderValue(o), 0);
              return (
                <button
                  key={s.status}
                  onClick={() => showOrders(s.status)}
                  className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-slate-50/80"
                >
                  <div className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`text-sm font-semibold ${meta.text}`}>
                        {s.status}
                      </span>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs tabular-nums text-slate-500">
                          {inr(orderValue)}
                        </span>
                        <span className="w-10 text-right text-sm font-bold tabular-nums text-slate-900">
                          {s.count}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${meta.color} transition-all duration-700 ease-out`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[11px] tabular-nums text-slate-500">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </button>
              );
            })}
          </div>
        </Card>

        {/* RIGHT: Production Funnel */}
      <Card className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
  {/* Header */}
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-base font-semibold text-slate-900">
        Production Funnel
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Order → Produce → Dispatch
      </p>
    </div>
    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      Live
    </span>
  </div>

  {/* Donut Chart */}
  <div className="mt-4 flex items-center justify-center">
    <div className="relative h-40 w-40">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="10"
        />
        {/* Produced ring */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#prodGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(productionPct / 100) * 264} 264`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Dispatched ring (inner, smaller) */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="url(#dispatchGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(dispatchPct / 100) * 188} 188`}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="prodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="dispatchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Produced
        </span>
        <span className="text-3xl font-bold tabular-nums leading-none text-slate-900">
          {productionPct}
          <span className="text-lg text-slate-400">%</span>
        </span>
        <span className="mt-0.5 text-[10px] text-slate-500">
          {totalProduced.toLocaleString()} / {totalOrdered.toLocaleString()}
        </span>
      </div>
    </div>
  </div>

  {/* Legend */}
  <div className="mt-4 flex items-center justify-center gap-4 text-[11px]">
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
      <span className="text-slate-600">
        Produced <span className="font-semibold text-slate-900">{productionPct}%</span>
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500" />
      <span className="text-slate-600">
        Dispatched <span className="font-semibold text-slate-900">{dispatchPct}%</span>
      </span>
    </div>
  </div>

  {/* Divider */}
  <div className="my-4 h-px bg-slate-100" />

  {/* Step-wise breakdown (compact) */}
  <div className="space-y-3">
    {[
      { label: "Ordered", value: totalOrdered, pct: 100, color: "#6366f1" },
      { label: "Produced", value: totalProduced, pct: productionPct, color: "#8b5cf6" },
      { label: "Dispatched", value: totalDispatched, pct: dispatchPct, color: "#10b981" },
    ].map((step) => (
      <div key={step.label}>
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium text-slate-600">{step.label}</span>
          <span className="font-bold tabular-nums text-slate-900">
            {step.value.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${step.pct}%`, backgroundColor: step.color }}
          />
        </div>
      </div>
    ))}
  </div>

  {/* Bottleneck insight */}
  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-700">
      <AlertTriangle className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-amber-800">
        {totalOrdered - totalProduced > 0 ? "Production bottleneck" : "All clear"}
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700/80">
        {totalOrdered - totalProduced > 0
          ? `${(totalOrdered - totalProduced).toLocaleString()} pairs pending production.`
          : "All orders have entered production."}
      </p>
    </div>
  </div>
</Card>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ROW 4 : ATTENTION + ACTIVITY                    */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="grid gap-5 xl:grid-cols-5">
        {/* Attention (3 cols) */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm xl:col-span-3">
          <div className="flex items-start justify-between border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Needs Attention
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {riskOrders.length + pendingApproval} items require action
                </p>
              </div>
            </div>
            {riskOrders.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                {riskOrders.length} at risk
              </span>
            )}
          </div>

          {riskOrders.length === 0 && pendingApproval === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                Everything is on track
              </p>
              <p className="mt-1 text-xs text-slate-500">
                No urgent actions needed right now.
              </p>
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              {riskOrders.map((o) => {
                const risk = getRisk(o);
                const pending = calcOrderQty(o) - o.dispatched;
                const isOverdue = risk === "Overdue";
                const daysLeft = Math.round(
                  (new Date(o.deliveryDate).getTime() -
                    new Date("2026-10-11").getTime()) /
                    86400000
                );
                return (
                  <button
                    key={o.id}
                    onClick={() => handleSelectOrder(o.id)}
                    className="group flex w-full items-center gap-4 border-b border-slate-100 px-5 py-3.5 text-left transition-colors last:border-0 hover:bg-slate-50/80"
                  >
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        isOverdue
                          ? "bg-rose-50 text-rose-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {o.id}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isOverdue
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {risk}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {o.customer} · {pending.toLocaleString()} pairs pending
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-xs font-semibold ${
                          isOverdue ? "text-rose-600" : "text-amber-600"
                        }`}
                      >
                        {daysLeft < 0
                          ? `${Math.abs(daysLeft)}d overdue`
                          : `${daysLeft}d left`}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {formatDate(o.deliveryDate)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </button>
                );
              })}
              {orders
                .filter((o) => o.status === "Pending Approval")
                .map((o) => (
                  <button
                    key={o.id}
                    onClick={() => handleSelectOrder(o.id)}
                    className="group flex w-full items-center gap-4 border-b border-slate-100 px-5 py-3.5 text-left transition-colors last:border-0 hover:bg-slate-50/80"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {o.id}
                        </span>
                        <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                          Approval
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {o.customer} · {calcOrderQty(o).toLocaleString()} pairs
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </button>
                ))}
            </div>
          )}
        </Card>

        {/* Activity (2 cols) */}
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-start justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent Activity
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Latest updates across orders
              </p>
            </div>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Live
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-5">
            <ol className="relative space-y-4 border-l border-slate-200 pl-6">
              {recentActivity.map((log, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-indigo-500 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-snug text-slate-900">
                      {log.text}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      <span className="font-medium text-slate-600">
                        {log.orderId}
                      </span>{" "}
                      · {log.customer}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {log.time}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Card>
      </section>
    </div>
  );
};

  const renderList = () => {
    let filtered = orders;
    if (statusFilter !== "All")
      filtered = filtered.filter((o) => o.status === statusFilter);
    if (customerFilter)
      filtered = filtered.filter((o) => o.customer === customerFilter);
    if (riskFilter) filtered = filtered.filter((o) => getRisk(o) !== "");
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerPo.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.lines.some((l) => l.style.toLowerCase().includes(q))
      );
    }

    return (
      <div className="space-y-2">
        <Card className="p-4">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Sales Orders
              </h1>
              <p className="mt-0 text-sm text-slate-500">
                Manage customer orders, quantities and delivery status.
              </p>
            </div>
            <Button
              onClick={handleCreateOrder}
              className="group relative h-11 overflow-hidden rounded-xl bg-[#0b0b14] px-5 font-semibold text-white shadow-lg shadow-indigo-900/20 ring-1 ring-white/10 hover:bg-[#12121f]"
            >
              <span className="pointer-events-none absolute -left-6 -top-8 h-20 w-20 rounded-full bg-indigo-600/50 blur-2xl transition-opacity group-hover:opacity-80" />
              <span className="relative flex items-center">
                <Plus className="mr-2 h-4 w-4 text-indigo-300" /> Create Order
              </span>
            </Button>
          </header>
        </Card>

        <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-lg shadow-slate-900/5">
          {/* Filters */}
          <div className="border-b border-slate-100 p-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["All", ...STATUSES.filter((s) => orders.some((o) => o.status === s))].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      statusFilter === tab
                        ? "bg-[#0b0b14] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab}{" "}
                    {tab === "All"
                      ? orders.length
                      : orders.filter((o) => o.status === tab).length}
                  </button>
                )
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[220px] relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order, PO, customer, style..."
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10"
                />
              </div>
              <Select value={customerFilter} onValueChange={setCustomerFilter}>
                <SelectTrigger className="h-11 w-48 rounded-xl border-slate-200 bg-slate-50">
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All customers</SelectItem>
                  {CUSTOMERS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-4 h-11 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                At risk
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="pl-5">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-right">Pairs</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => {
                  const qty = calcOrderQty(order);
                  const risk = getRisk(order);
                  return (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => handleSelectOrder(order.id)}
                    >
                      <TableCell className="py-4 pl-5">
                        <div className="font-semibold text-slate-900">
                          {order.id}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          PO: {order.customerPo}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {order.customer}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-900">
                          {formatDate(order.deliveryDate)}
                        </div>
                        {risk && (
                          <div
                            className={`text-xs font-medium mt-0.5 ${
                              risk === "Overdue"
                                ? "text-rose-600"
                                : "text-amber-600"
                            }`}
                          >
                            ⚠ {risk}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {qty.toLocaleString()}
                      </TableCell>
                      <TableCell className="min-w-[140px]">
                        <ProgressBar current={order.produced} total={qty} />
                        <div className="text-xs text-slate-500 mt-1">
                          {order.produced.toLocaleString()} produced
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-14 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Box size={48} className="text-slate-300 mb-4" />
                        <p className="font-semibold text-slate-900">
                          No orders found
                        </p>
                        <p className="text-sm mt-1">
                          Try changing your search or filters.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStatusFilter("All");
                            setSearchQuery("");
                            setRiskFilter(false);
                            setCustomerFilter("");
                          }}
                          className="mt-4 rounded-xl"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
            <span>
              Showing 1-{filtered.length} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="rounded-lg">
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled className="rounded-lg">
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // --- Wizard Steps ---

  const renderWizardStep1 = () => (
    <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 space-y-2">
      <h2 className="font-semibold text-slate-900 text-lg">
        Customer information
      </h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">
            Customer *
          </Label>
          <Select
            value={wizardData.customer}
            onValueChange={(v) => setWizardData({ ...wizardData, customer: v })}
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMERS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">
            Customer PO No. *
          </Label>
          <Input
            value={wizardData.customerPo}
            onChange={(e) =>
              setWizardData({ ...wizardData, customerPo: e.target.value })
            }
            placeholder="ABC/PO/2026/190"
            className="h-11 rounded-xl border-slate-200"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">PO date</Label>
          <Input
            type="date"
            value={wizardData.orderDate}
            onChange={(e) =>
              setWizardData({ ...wizardData, orderDate: e.target.value })
            }
            className="h-11 rounded-xl border-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">
            Order date
          </Label>
          <Input
            type="date"
            value={wizardData.orderDate}
            onChange={(e) =>
              setWizardData({ ...wizardData, orderDate: e.target.value })
            }
            className="h-11 rounded-xl border-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">
            Required delivery *
          </Label>
          <Input
            type="date"
            value={wizardData.deliveryDate}
            onChange={(e) =>
              setWizardData({ ...wizardData, deliveryDate: e.target.value })
            }
            className="h-11 rounded-xl border-slate-200"
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">
            Sales person
          </Label>
          <Select
            value={wizardData.salesPerson}
            onValueChange={(v) =>
              setWizardData({ ...wizardData, salesPerson: v })
            }
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rahul Sharma">Rahul Sharma</SelectItem>
              <SelectItem value="Amit Kumar">Amit Kumar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">Priority</Label>
          <Select
            value={wizardData.priority}
            onValueChange={(v) =>
              setWizardData({ ...wizardData, priority: v as any })
            }
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Normal", "High", "Urgent"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">
            Delivery location
          </Label>
          <Input
            value={wizardData.location}
            onChange={(e) =>
              setWizardData({ ...wizardData, location: e.target.value })
            }
            className="h-11 rounded-xl border-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">
            Payment terms
          </Label>
          <Input
            value={wizardData.paymentTerms}
            onChange={(e) =>
              setWizardData({ ...wizardData, paymentTerms: e.target.value })
            }
            className="h-11 rounded-xl border-slate-200"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">Notes</Label>
        <Textarea
          rows={2}
          className="rounded-xl border-slate-200"
        />
      </div>
    </Card>
  );

  const renderWizardStep2 = () => {
    const addLine = (style: string, color: string) => {
      if (
        wizardData.lines?.some((l) => l.style === style && l.color === color)
      )
        return;
      const s = STYLES[style as keyof typeof STYLES];
      const newLine: OrderLine = {
        id: `l${Date.now()}`,
        style,
        productName: s.name,
        color,
        sizeGroup: `UK ${s.sizes[0]}-${s.sizes[s.sizes.length - 1]}`,
        sizes: s.sizes.reduce((acc, sz) => ({ ...acc, [sz]: 0 }), {}),
        price: 0,
        discount: 0,
        tax: 18,
        expectedQty: undefined,
      };
      setWizardData((prev) => ({
        ...prev,
        lines: [...(prev.lines || []), newLine],
      }));
    };

    const removeLine = (id: string) => {
      setWizardData((prev) => ({
        ...prev,
        lines: prev.lines?.filter((l) => l.id !== id),
      }));
    };

    return (
      <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 space-y-2">
        <h2 className="font-semibold text-slate-900 text-lg">
          Add style and colour
        </h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Style</Label>
            <Select id="wiz-style" defaultValue={Object.keys(STYLES)[0]}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STYLES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {k} – {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Colour</Label>
            <Select id="wiz-color" defaultValue={COLORS[0]}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLORS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              const s = (document.getElementById("wiz-style") as HTMLSelectElement)
                ?.value || Object.keys(STYLES)[0];
              const c = (document.getElementById("wiz-color") as HTMLSelectElement)
                ?.value || COLORS[0];
              addLine(s, c);
            }}
            className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]"
          >
            Add
          </Button>
        </div>

        {wizardData.lines && wizardData.lines.length > 0 ? (
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70">
                  <TableHead>Style</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Colour</TableHead>
                  <TableHead>Size group</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {wizardData.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-semibold text-slate-900">
                      {line.style}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {line.productName}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {line.color}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {line.sizeGroup}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(line.id)}
                      >
                        <Trash2 className="h-4 w-4 text-slate-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-300">
            No products yet. Pick a style above to start.
          </div>
        )}
      </Card>
    );
  };

  const renderWizardStep3 = () => {
    const updateSize = (lineId: string, size: string, val: string) => {
      const num = Math.max(0, parseInt(val) || 0);
      setWizardData((prev) => ({
        ...prev,
        lines: prev.lines?.map((l) =>
          l.id === lineId ? { ...l, sizes: { ...l.sizes, [size]: num } } : l
        ),
      }));
    };

    const updateExpected = (lineId: string, val: string) => {
      setWizardData((prev) => ({
        ...prev,
        lines: prev.lines?.map((l) =>
          l.id === lineId
            ? { ...l, expectedQty: val ? parseInt(val) : undefined }
            : l
        ),
      }));
    };

    const applyRatio = (lineId: string) => {
      const ratioInput = document.getElementById(
        `ratio-${lineId}`
      ) as HTMLInputElement;
      const expectedInput = document.getElementById(
        `expected-${lineId}`
      ) as HTMLInputElement;
      const ratioStr = ratioInput?.value;
      const expected = parseInt(expectedInput?.value || "0");

      if (!ratioStr || !expected) {
        setToast("Enter PO qty and a ratio");
        return;
      }

      const ratios = ratioStr.split(":").map(Number);
      if (ratios.some(isNaN) || ratios.length === 0) return;

      const line = wizardData.lines?.find((l) => l.id === lineId);
      if (!line) return;

      const sumRatio = ratios.reduce((a, b) => a + b, 0);
      if (sumRatio === 0) return;

      let remaining = expected;
      const newSizes: SizeMap = {};
      const sizes = STYLES[line.style as keyof typeof STYLES].sizes;

      sizes.forEach((sz, idx) => {
        const qty = Math.round((expected * (ratios[idx] || 0)) / sumRatio);
        newSizes[sz] = qty;
        remaining -= qty;
      });

      if (sizes.length > 0) {
        newSizes[sizes[0]] += remaining;
      }

      setWizardData((prev) => ({
        ...prev,
        lines: prev.lines?.map((l) =>
          l.id === lineId ? { ...l, sizes: newSizes } : l
        ),
      }));
    };

    const copyPrevious = (lineId: string, index: number) => {
      if (index === 0) return;
      const prevLine = wizardData.lines?.[index - 1];
      if (!prevLine) return;

      setWizardData((prev) => ({
        ...prev,
        lines: prev.lines?.map((l) =>
          l.id === lineId
            ? {
                ...l,
                sizes: { ...prevLine.sizes },
                expectedQty: prevLine.expectedQty,
              }
            : l
        ),
      }));
    };

    const totalQty =
      wizardData.lines?.reduce((a, l) => a + calcLineTotal(l), 0) || 0;

    return (
      <div className="space-y-6">
        <Card className="p-4 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 flex justify-between items-center">
          <span className="font-semibold text-slate-900">
            Order total:{" "}
            <span className="text-indigo-600 text-lg">
              {totalQty.toLocaleString()}
            </span>{" "}
            pairs
          </span>
        </Card>

        {wizardData.lines?.map((line, index) => {
          const lineTotal = calcLineTotal(line);
          const sizes = STYLES[line.style as keyof typeof STYLES].sizes;

          return (
            <Card
              key={line.id}
              className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 space-y-4"
            >
              <div className="flex justify-between items-end">
                <h3 className="font-semibold text-slate-900 text-lg">
                  {line.style} / {line.color}
                </h3>
                <div className="flex items-end gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-500">
                      PO qty
                    </Label>
                    <Input
                      id={`expected-${line.id}`}
                      type="number"
                      min="0"
                      value={line.expectedQty || ""}
                      onChange={(e) => updateExpected(line.id, e.target.value)}
                      className="w-24 h-9 rounded-lg border-slate-200 text-center text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-500">
                      Ratio e.g. 1:2:3:2:1
                    </Label>
                    <Input
                      id={`ratio-${line.id}`}
                      type="text"
                      placeholder="1:2:3:2:1:0"
                      className="w-32 h-9 rounded-lg border-slate-200 text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => applyRatio(line.id)}
                    variant="outline"
                    className="h-9 rounded-lg"
                  >
                    Apply
                  </Button>
                  {index > 0 && (
                    <Button
                      onClick={() => copyPrevious(line.id, index)}
                      variant="outline"
                      className="h-9 rounded-lg"
                    >
                      Copy prev
                    </Button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70">
                      {sizes.map((sz) => (
                        <TableHead key={sz} className="text-center">
                          {sz}
                        </TableHead>
                      ))}
                      <TableHead className="text-center bg-indigo-50 text-indigo-700">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {sizes.map((sz) => (
                        <TableCell key={sz} className="p-2">
                          <Input
                            type="number"
                            min="0"
                            value={line.sizes[sz] || ""}
                            onChange={(e) =>
                              updateSize(line.id, sz, e.target.value)
                            }
                            className="w-16 mx-auto h-9 rounded-lg border-slate-200 text-center text-sm"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="p-2 text-center font-bold text-indigo-700 bg-indigo-50/50 text-lg">
                        {lineTotal}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {line.expectedQty && lineTotal !== line.expectedQty && (
                <div
                  className={`text-sm font-medium ${
                    lineTotal < line.expectedQty
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {lineTotal < line.expectedQty
                    ? `⚠ Quantity mismatch: ${
                        line.expectedQty - lineTotal
                      } pairs remaining`
                    : `❌ Exceeds PO by ${lineTotal - line.expectedQty} pairs`}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const renderWizardStep4 = () => {
    const updatePrice = (
      lineId: string,
      field: "price" | "discount" | "tax",
      val: string
    ) => {
      const num = parseFloat(val) || 0;
      setWizardData((prev) => ({
        ...prev,
        lines: prev.lines?.map((l) =>
          l.id === lineId ? { ...l, [field]: num } : l
        ),
      }));
    };

    const subtotal =
      wizardData.lines?.reduce(
        (a, l) => a + calcLineTotal(l) * l.price,
        0
      ) || 0;
    const discount =
      wizardData.lines?.reduce(
        (a, l) => a + calcLineTotal(l) * l.price * (l.discount / 100),
        0
      ) || 0;
    const tax =
      wizardData.lines?.reduce(
        (a, l) =>
          a +
          calcLineTotal(l) *
            l.price *
            (1 - l.discount / 100) *
            (l.tax / 100),
        0
      ) || 0;
    const grandTotal = subtotal - discount + tax;

    return (
      <div className="space-y-2">
        <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          <h2 className="font-semibold text-slate-900 text-lg mb-4">
            Item pricing
          </h2>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70">
                  <TableHead>Style / colour</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit price ₹</TableHead>
                  <TableHead className="text-right">Disc %</TableHead>
                  <TableHead className="text-right">Tax %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wizardData.lines?.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium text-slate-900">
                      {line.style} / {line.color}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {calcLineTotal(line)}
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="number"
                        min="0"
                        value={line.price}
                        onChange={(e) =>
                          updatePrice(line.id, "price", e.target.value)
                        }
                        className="w-24 ml-auto h-9 rounded-lg border-slate-200 text-right text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={line.discount}
                        onChange={(e) =>
                          updatePrice(line.id, "discount", e.target.value)
                        }
                        className="w-20 ml-auto h-9 rounded-lg border-slate-200 text-right text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        type="number"
                        min="0"
                        value={line.tax}
                        onChange={(e) =>
                          updatePrice(line.id, "tax", e.target.value)
                        }
                        className="w-20 ml-auto h-9 rounded-lg border-slate-200 text-right text-sm"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{inr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span className="text-rose-600">-{inr(discount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span>{inr(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2">
                <span>Grand Total</span>
                <span className="text-indigo-600">{inr(grandTotal)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5">
          <h2 className="font-semibold text-slate-900 text-lg mb-4">
            Packing & Documents
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Pairs per carton
              </Label>
              <Input
                type="number"
                defaultValue={12}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Packing type
              </Label>
              <Input
                type="text"
                defaultValue="Individual Box"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />{" "}
              Label Required
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />{" "}
              Barcode Required
            </label>
          </div>
        </Card>
      </div>
    );
  };

  const renderWizardStep5 = () => {
    const totalQty =
      wizardData.lines?.reduce((a, l) => a + calcLineTotal(l), 0) || 0;
    const subtotal =
      wizardData.lines?.reduce(
        (a, l) => a + calcLineTotal(l) * l.price,
        0
      ) || 0;
    const discount =
      wizardData.lines?.reduce(
        (a, l) => a + calcLineTotal(l) * l.price * (l.discount / 100),
        0
      ) || 0;
    const tax =
      wizardData.lines?.reduce(
        (a, l) =>
          a +
          calcLineTotal(l) *
            l.price *
            (1 - l.discount / 100) *
            (l.tax / 100),
        0
      ) || 0;
    const grandTotal = subtotal - discount + tax;

    return (
      <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 space-y-6">
        <h2 className="font-semibold text-slate-900 text-lg">Review order</h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
              Customer
            </p>
            <p className="font-semibold text-slate-900 text-lg">
              {wizardData.customer}
            </p>
            <p className="text-sm text-slate-600">
              PO: {wizardData.customerPo}
            </p>
            <p className="text-sm text-slate-600">
              Order: {formatDate(wizardData.orderDate!)}
            </p>
            <p className="text-sm text-slate-600">
              Delivery: {formatDate(wizardData.deliveryDate!)}
            </p>
            <p className="text-sm text-slate-600">
              {wizardData.priority} priority · {wizardData.salesPerson}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
              Commercials
            </p>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Discount</span>
              <span className="text-rose-600">-{inr(discount)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax</span>
              <span>{inr(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2">
              <span>Grand Total</span>
              <span className="text-indigo-600">{inr(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-3">
            Products & Quantities
          </p>
          <div className="space-y-3">
            {wizardData.lines?.map((line) => (
              <div
                key={line.id}
                className="flex justify-between items-center bg-slate-50 p-3 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {line.style} / {line.color}
                  </p>
                  <p className="text-xs text-slate-500">{line.sizeGroup}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    {calcLineTotal(line).toLocaleString()} pairs
                  </p>
                  <p className="text-xs text-slate-500">
                    {inr(line.price)} / pair
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right font-semibold text-slate-900 text-lg">
            Total: {totalQty.toLocaleString()} pairs
          </div>
        </div>
      </Card>
    );
  };

  const renderWizard = () => {
    const steps = [
      "Customer & PO",
      "Products",
      "Quantities",
      "Commercial",
      "Review",
    ];

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Sales Order
          </h1>
        </div>

        {/* Stepper */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex-1 min-w-[120px] p-3 rounded-xl border text-center text-sm font-semibold transition-colors ${
                i === wizardStep
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : i < wizardStep
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              {i < wizardStep ? "✓ " : `${i + 1}. `}
              {step}
            </div>
          ))}
        </div>

        {/* Errors */}
        {wizardErrors.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-1">
            {wizardErrors.map((e, i) => (
              <p
                key={i}
                className="text-sm text-rose-700 font-medium flex items-center gap-2"
              >
                <AlertTriangle size={16} /> {e}
              </p>
            ))}
          </div>
        )}

        {/* Step Content */}
        {wizardStep === 0 && renderWizardStep1()}
        {wizardStep === 1 && renderWizardStep2()}
        {wizardStep === 2 && renderWizardStep3()}
        {wizardStep === 3 && renderWizardStep4()}
        {wizardStep === 4 && renderWizardStep5()}

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-lg">
          <Button
            variant="outline"
            onClick={() =>
              wizardStep > 0 ? setWizardStep((s) => s - 1) : setView("list")
            }
            className="h-11 rounded-xl"
          >
            {wizardStep > 0 ? "Back" : "Cancel"}
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSaveOrder("Draft")}
              className="h-11 rounded-xl"
            >
              Save draft
            </Button>
            {wizardStep < 4 ? (
              <Button
                onClick={nextStep}
                className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]"
              >
                Continue
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSaveOrder("Pending Approval")}
                  className="h-11 rounded-xl border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                >
                  Submit for approval
                </Button>
                <Button
                  onClick={() => handleSaveOrder("Confirmed")}
                  className="h-11 rounded-xl bg-[#111827] px-6 font-semibold text-white hover:bg-[#1f2937]"
                >
                  Confirm order
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Detail View ---
  const renderDetail = () => {
    const order = orders.find((o) => o.id === selectedOrderId);
    if (!order) return null;

    const totalQty = calcOrderQty(order);
    const risk = getRisk(order);

    const handleAction = (action: string) => {
      if (action === "confirm") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: "Confirmed" as OrderStatus,
                  activityLog: [
                    ...o.activityLog,
                    {
                      time: new Date().toISOString().slice(0, 16).replace("T", " "),
                      text: "Status changed to Confirmed",
                    },
                  ],
                }
              : o
          )
        );
        setToast("Order confirmed");
      }
      if (action === "production") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: "In Production" as OrderStatus,
                  activityLog: [
                    ...o.activityLog,
                    {
                      time: new Date().toISOString().slice(0, 16).replace("T", " "),
                      text: "Status changed to In Production",
                    },
                  ],
                }
              : o
          )
        );
        setToast("Production started");
      }
      if (action === "dispatch") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: "Ready for Dispatch" as OrderStatus,
                  activityLog: [
                    ...o.activityLog,
                    {
                      time: new Date().toISOString().slice(0, 16).replace("T", " "),
                      text: "Status changed to Ready for Dispatch",
                    },
                  ],
                }
              : o
          )
        );
        setToast("Ready for dispatch");
      }
      if (action === "complete") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: "Completed" as OrderStatus,
                  activityLog: [
                    ...o.activityLog,
                    {
                      time: new Date().toISOString().slice(0, 16).replace("T", " "),
                      text: "Order completed",
                    },
                  ],
                }
              : o
          )
        );
        setToast("Order completed");
      }
    };

    const ActionButtons = () => {
      const btns = [];
      if (order.status === "Draft")
        btns.push(
          <Button
            key="submit"
            onClick={() => handleAction("confirm")}
            variant="outline"
            className="h-10 rounded-xl"
          >
            Submit
          </Button>
        );
      if (order.status === "Pending Approval")
        btns.push(
          <Button
            key="confirm"
            onClick={() => handleAction("confirm")}
            className="h-10 rounded-xl bg-[#111827] text-white hover:bg-[#1f2937]"
          >
            Confirm
          </Button>
        );
      if (order.status === "Confirmed")
        btns.push(
          <Button
            key="prod"
            onClick={() => handleAction("production")}
            className="h-10 rounded-xl bg-[#111827] text-white hover:bg-[#1f2937]"
          >
            Start production
          </Button>
        );
      if (order.status === "In Production")
        btns.push(
          <Button
            key="dispatch"
            onClick={() => handleAction("dispatch")}
            className="h-10 rounded-xl bg-[#111827] text-white hover:bg-[#1f2937]"
          >
            Mark Ready for Dispatch
          </Button>
        );
      if (order.status === "Ready for Dispatch")
        btns.push(
          <Button
            key="complete"
            onClick={() => handleAction("complete")}
            className="h-10 rounded-xl bg-[#111827] text-white hover:bg-[#1f2937]"
          >
            Mark Completed
          </Button>
        );

      btns.push(
        <Button key="amend" variant="outline" className="h-10 rounded-xl">
          Amend
        </Button>
      );
      btns.push(
        <Button key="print" variant="outline" className="h-10 rounded-xl">
          Print
        </Button>
      );

      return <div className="flex gap-2 flex-wrap">{btns}</div>;
    };

    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => setView("list")}
          className="text-sm text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 -ml-2"
        >
          <ChevronLeft size={16} /> Orders
        </Button>

        <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {order.id}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-slate-500 text-sm mt-1">
              {order.customer} · PO {order.customerPo}
            </p>
          </div>
          <ActionButtons />
        </Card>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Ordered", value: totalQty.toLocaleString() },
            { label: "Produced", value: order.produced.toLocaleString() },
            { label: "Dispatched", value: order.dispatched.toLocaleString() },
            {
              label: "Pending",
              value: (totalQty - order.dispatched).toLocaleString(),
            },
          ].map((kpi, i) => (
            <Card
              key={i}
              className="flex-row items-center gap-4 rounded-2xl border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 text-center justify-center"
            >
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {kpi.value}
                </p>
                <p className="text-sm text-slate-500">{kpi.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeDetailTab}
          onValueChange={setActiveDetailTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 rounded-xl bg-slate-100 h-12">
            {["Overview", "Items", "Size Matrix", "Delivery", "Activity"].map(
              (tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                >
                  {tab}
                </TabsTrigger>
              )
            )}
          </TabsList>

          <TabsContent value="Overview" className="mt-6">
            <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">
                  Order progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Production</span>
                      <span>
                        {order.produced} / {totalQty}
                      </span>
                    </div>
                    <ProgressBar current={order.produced} total={totalQty} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Dispatch</span>
                      <span>
                        {order.dispatched} / {totalQty}
                      </span>
                    </div>
                    <ProgressBar
                      current={order.dispatched}
                      total={totalQty}
                      color="bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Delivery</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    Required: <strong>{formatDate(order.deliveryDate)}</strong> (
                    {Math.round(
                      (new Date(order.deliveryDate).getTime() -
                        new Date("2026-10-11").getTime()) /
                        86400000
                    )}{" "}
                    days left)
                  </p>
                  <p>
                    Remaining production:{" "}
                    <strong>{totalQty - order.produced}</strong> pairs
                  </p>
                  {risk ? (
                    <div className="bg-rose-50 text-rose-700 p-3 rounded-xl font-medium flex items-center gap-2">
                      <AlertTriangle size={16} /> {risk} — at 60 pairs/day,
                      finish ≈{" "}
                      {formatDate(
                        new Date(
                          new Date("2026-10-11").getTime() +
                            Math.ceil((totalQty - order.produced) / 60) *
                              86400000
                        ).toISOString()
                      )}
                    </div>
                  ) : (
                    <p className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={16} /> On track
                    </p>
                  )}
                  <p className="text-slate-500 mt-4">
                    Value {inr(calcOrderValue(order))} · {order.priority}{" "}
                    priority · {order.salesPerson}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="Items" className="mt-6">
            <Card className="p-0 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70">
                    <TableHead className="pl-5">Style</TableHead>
                    <TableHead>Colour</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">Produced</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.lines.map((line) => {
                    const q = calcLineTotal(line);
                    const p = Math.round((order.produced * q) / totalQty) || 0;
                    return (
                      <TableRow key={line.id}>
                        <TableCell className="pl-5 font-semibold text-slate-900">
                          {line.style}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {line.color}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {q}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600">
                          {p}
                        </TableCell>
                        <TableCell className="text-right text-amber-600 font-medium">
                          {q - p}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="Size Matrix" className="mt-6 space-y-6">
            {order.lines.map((line) => (
              <Card
                key={line.id}
                className="p-0 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 overflow-hidden"
              >
                <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-900 border-b border-slate-200">
                  {line.style} / {line.color}
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/70">
                        {Object.keys(line.sizes).map((sz) => (
                          <TableHead key={sz} className="text-center">
                            {sz}
                          </TableHead>
                        ))}
                        <TableHead className="text-center bg-indigo-50 text-indigo-700 font-bold">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        {Object.values(line.sizes).map((q, i) => (
                          <TableCell key={i} className="text-center">
                            {q}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold text-indigo-700 bg-indigo-50/50 text-lg">
                          {calcLineTotal(line)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ))}
            {order.amendments.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Amendments
                </h4>
                {order.amendments.map((a, i) => (
                  <p key={i} className="text-sm text-slate-600">
                    Rev {i + 2}: {a}
                  </p>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="Delivery" className="mt-6">
            <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5 text-sm text-slate-600">
              {order.dispatched > 0 ? (
                <div>
                  <p className="mb-4">
                    Dispatched so far: <strong>{order.dispatched}</strong> pairs
                    · Balance <strong>{totalQty - order.dispatched}</strong>
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p>
                      Dispatch #1 · 11 Oct 2026 · {order.dispatched} pairs
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No dispatches yet.
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="Activity" className="mt-6">
            <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-lg shadow-slate-900/5">
              <div className="border-l-2 border-slate-200 pl-6 ml-2 space-y-6">
                {[...order.activityLog].reverse().map((log, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
                    <p className="text-xs text-slate-500">{log.time}</p>
                    <p className="text-sm font-medium text-slate-900">
                      {log.text}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const activeView = view === "detail" ? "list" : view;
  const handleBack = () => {
    setView(view === "detail" ? "list" : "dashboard");
  };
  const navigationItems = [
    {
      id: "dashboard",
      label: "Order dashboard",
      icon: LayoutDashboard,
      action: () => setView("dashboard"),
    },
    {
      id: "create",
      label: "Create order",
      icon: FilePlus,
      action: () => {
        if (view !== "create") handleCreateOrder();
      },
    },
    {
      id: "list",
      label: "Order list",
      icon: ShoppingCart,
      action: () => setView("list"),
    },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[1600px] space-y-2 px-2 py-0 ">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          {view === "dashboard" ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          ) : (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="h-10 rounded-xl px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <nav
            aria-label="Order management"
            className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1"
          >
            {navigationItems.map(({ id, label, icon: Icon, action }) => (
              <Button
                key={id}
                type="button"
                variant="ghost"
                aria-current={activeView === id ? "page" : undefined}
                onClick={action}
                className={`h-9 shrink-0 rounded-lg px-3 text-sm ${
                  activeView === id
                    ? "bg-white font-semibold text-indigo-700 shadow-sm hover:bg-white"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>

        {view === "dashboard" && renderDashboard()}
        {view === "list" && renderList()}
        {view === "create" && renderWizard()}
        {view === "detail" && renderDetail()}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#0b0b14] text-white px-6 py-3 rounded-xl shadow-2xl z-50 text-sm font-medium animate-in slide-in-from-bottom-5">
          {toast}
        </div>
      )}
    </div>
  );
}