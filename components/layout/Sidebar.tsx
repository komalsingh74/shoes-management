"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  ShoppingCart,
  Factory,
  Package,
  Boxes,
  ShoppingBag,
  Store,
  ShieldCheck,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  FilePlus2,
  ListChecks,
  Users,
  BadgePercent,
  FileOutput,
  LogOut,
  Footprints,
  Ruler,
  Palette,
  Layers,
   FileText,      // Product Specification
  Workflow,      // Routing
  ClipboardCheck, // Quality Specification
  PackageCheck,  // Packing Specification
  ClipboardList,
  CalendarDays,
  Scissors,
  Shirt,
  Hammer,
  Paintbrush,
  Archive,
  ScanLine,
  ArrowLeftRight,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

type BadgeTone = "red" | "amber" | "slate";
type Badge = { value: string; tone: BadgeTone };
type Child = { label: string; href: string; icon: LucideIcon; badge?: Badge; section?: string };
type Item = { label: string; icon: LucideIcon; href?: string; badge?: Badge; children?: Child[] };
type Section = { title: string; items: Item[] };

const BRAND = "ShoeFlow"; // apna brand name yahan badlo
const STORAGE_KEY = "sidebar-collapsed";

// Badges sample hain, apni API ke numbers se jodo.
const SECTIONS: Section[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }],
  },
  {
    title: "Business",
    items: [
      {
        label: "Master",
        icon: Database,
        children: [
          { label: "Customer Master", href: "/dashboard/masters/custumer", icon: Users },
          { label: "Product / Style Master", href: "/dashboard/masters/product-style", icon: Package },
          { label: "SKU / Variant Master", href: "/dashboard/masters/sku-variant", icon: Boxes },
          { label: "Size Master", href: "/dashboard/masters/size", icon: Ruler },
          { label: "Color Master", href: "/dashboard/masters/color", icon: Palette },
          { label: "Material Master", href: "/dashboard/masters/material", icon: Layers },
          { label: "Supplier / Vendor Master", href: "/dashboard/masters/supplier-vendor", icon: ShoppingBag },
          { label: "BOM Master", href: "/dashboard/masters/bom", icon: Boxes },
          { label: "Routing / Operation Master", href: "/dashboard/masters/routing-operation", icon: Factory },
          { label: "Employee / Worker Master", href: "/dashboard/masters/employee-worker", icon: Users },
          { label: "Factory / Plant / Warehouse Master", href: "/dashboard/masters/factory-plant-warehouse", icon: Store },
          { label: "Season / Collection Master", href: "/dashboard/masters/season-collection", icon: Layers },
          { label: "Packing Master", href: "/dashboard/masters/packing", icon: Package },
          { label: "Unit of Measure Master", href: "/dashboard/masters/unit-of-measure", icon: Ruler },
          { label: "Tax / Commercial Master", href: "/dashboard/masters/tax-commercial", icon: BadgePercent },
          { label: "Pricing / Costing Master", href: "/dashboard/masters/pricing-costing", icon: BadgePercent },
          { label: "Approval / Workflow Master", href: "/dashboard/masters/approval-workflow", icon: ShieldCheck },
        ],
      },
            {
        label: "Product Engineering",
        icon: Workflow,
        children: [
          { label: "Product Specification", href: "/dashboard/product-engineering/product-specification", icon: FileText },
          { label: "BOM", href: "/dashboard/product-engineering/bom", icon: Boxes },
          { label: "Routing", href: "/dashboard/product-engineering/routing", icon: Workflow },
          { label: "Catalog", href: "/dashboard/product-engineering/catalog", icon: Layers },
          { label: "Quality Specification", href: "/dashboard/product-engineering/quality-specification", icon: ClipboardCheck },
          { label: "Packing Specification", href: "/dashboard/product-engineering/packing-specification", icon: PackageCheck },
        ],
      },
      {
        label: "Sales",
        icon: ShoppingCart,
        children: [
          { label: "Create Sales Order", href: "/dashboard/sales/create", icon: FilePlus2 },
          {
            label: "Sales Order List / Tracker",
            href: "/dashboard/sales/orders",
            icon: ListChecks,
            badge: { value: "12", tone: "slate" },
          },
          { label: "Customer Master", href: "/dashboard/sales/customers", icon: Users },
          { label: "Rate Contracts / Pricing", href: "/dashboard/sales/pricing", icon: BadgePercent },
          { label: "Export Documents", href: "/dashboard/sales/export", icon: FileOutput },
        ],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Production",
        icon: Factory,
        children: [
          { section: "Overview", label: "01. Production Dashboard", href: "/dashboard/production/production-dashboard", icon: LayoutDashboard },
          { label: "02. Production Orders", href: "/dashboard/production/production-orders", icon: ClipboardList },
          { label: "03. Create Production Order", href: "/dashboard/production/create-production", icon: FilePlus2 },
          { label: "04. Planning & Scheduling", href: "/dashboard/production/planning-schedule", icon: CalendarDays },
          { section: "Material Preparation", label: "05. Material Reservation & Issue", href: "/dashboard/production/material-reservation-issue", icon: Boxes },
          { section: "Shop Floor Workbenches", label: "06. Cutting Workbench", href: "/dashboard/production/cutting-workbench", icon: Scissors },
          { label: "07. Stitching / Fitting Workbench", href: "/dashboard/production/stiching-workbench", icon: Shirt },
          { label: "08. Bottom Preparation Workbench", href: "/dashboard/production/bottom-pre-workbench", icon: PackageCheck },
          { label: "09. Lasting & Assembly", href: "/dashboard/production/lasting-assembly", icon: Hammer },
          { label: "10. Finishing Workbench", href: "/dashboard/production/finishing-workbench", icon: Paintbrush },
          { section: "Quality & Dispatch Preparation", label: "11. Quality Inspection & Rework", href: "/dashboard/production/quality-inspection-rework", icon: ClipboardCheck },
          { label: "12. Packing & Cartonization", href: "/dashboard/production/packing-cartonization", icon: Package },
          { label: "13. Finished Goods Receipt", href: "/dashboard/production/finished-goods-receipt", icon: Archive },
          { section: "Control & Analytics", label: "14. Batch & Department Transfers", href: "/dashboard/production/batch-department-transfers", icon: ArrowLeftRight },
          { label: "15. Batch Traceability", href: "/dashboard/production/batch-traceability", icon: ScanLine },
          { label: "16. Production Reports & Analytics", href: "/dashboard/production/production-reports-analytics", icon: BarChart3 },
        ],
      },
      { label: "Product", icon: Package, href: "/dashboard/product" },
      { label: "QC", icon: ShieldCheck, href: "/dashboard/qc" },
    ],
  },
  {
    title: "Supply",
    items: [
      { label: "Inventory", icon: Boxes, href: "/dashboard/inventory", badge: { value: "3", tone: "amber" } },
      {
        label: "Purchase & Procurement",
        icon: ShoppingBag,
        children: [
          { label: "Supplier Management", href: "/dashboard/masters/supplier-vendor", icon: Users },
          { label: "Purchase Requisitions", href: "/dashboard/purchase/purchase-requisitions", icon: FilePlus2 },
          { label: "Supplier Quotations & Comparison", href: "/dashboard/purchase/supplier-quotations", icon: FileText },
          { label: "Purchase Orders", href: "/dashboard/purchase/purchase-orders", icon: ListChecks },
          { label: "Goods Receipt Notes (GRN)", href: "/dashboard/purchase/goods-receipt-notes", icon: PackageCheck },
          { label: "Supplier Invoices", href: "/dashboard/purchase/supplier-invoices", icon: ClipboardCheck },
          { label: "Supplier Payments", href: "/dashboard/purchase/supplier-payments", icon: BadgePercent },
          { label: "Purchase Reports", href: "/dashboard/purchase/purchase-reports", icon: FileOutput },
        ],
      },
      { label: "Store", icon: Store, href: "/dashboard/store" },
    ],
  },
];

const BADGE_STYLES: Record<BadgeTone, { pill: string; dot: string }> = {
  red: { pill: "bg-red-50 text-red-600", dot: "bg-red-500" },
  amber: { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  slate: { pill: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [tip, setTip] = useState<{ label: string; top: number } | null>(null);

  const isActive = (href?: string) => {
    if (!href) return false;
    // Dashboard home sirf exact match par active ho, sub-pages par nahi
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const allItems = SECTIONS.flatMap((s) => s.items);
const [openGroup, setOpenGroup] = useState<string | null>(
  allItems.find((m) => m.children?.some((c) => isActive(c.href)))?.label ?? null
);

  // Saved choice yaad rakho; pehli baar chhoti screen par apne aap collapse
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) setCollapsed(saved === "1");
      else if (window.innerWidth < 1024) setCollapsed(true);
    } catch {
      /* storage available nahi, ignore */
    }
  }, []);


  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("remember");

  window.location.replace("/");
};

  const updateCollapsed = (value: boolean) => {
    setCollapsed(value);
    setTip(null);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const showTip = (e: React.MouseEvent | React.FocusEvent, label: string) => {
    if (!collapsed) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTip({ label, top: r.top + r.height / 2 });
  };
  const hideTip = () => setTip(null);

  const row =
    "group relative flex items-center gap-2.5 h-9 rounded-lg px-2.5 text-[13px] font-medium " +
    "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

  const renderBadge = (badge?: Badge) =>
    badge && !collapsed ? (
      <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${BADGE_STYLES[badge.tone].pill}`}>
        {badge.value}
      </span>
    ) : null;

  const renderDot = (badge?: Badge) =>
    badge && collapsed ? (
      <span className={`absolute top-1.5 right-2 w-2 h-2 rounded-full ring-2 ring-white ${BADGE_STYLES[badge.tone].dot}`} />
    ) : null;

  const renderItem = (item: Item) => {
    const Icon = item.icon;

    // Simple link
    if (!item.children) {
      const active = isActive(item.href);
      return (
        <Link
          key={item.label}
          href={item.href!}
          aria-label={collapsed ? item.label : undefined}
          aria-current={active ? "page" : undefined}
          onMouseEnter={(e) => showTip(e, item.label)}
          onMouseLeave={hideTip}
          onFocus={(e) => showTip(e, item.label)}
          onBlur={hideTip}
          className={`${row} ${active ? "bg-[#0b0b14] text-white font-semibold" : "text-slate-800 hover:bg-slate-100 hover:text-slate-900"}`}
        >
          {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-indigo-400" />}
          <Icon size={18} className={`shrink-0 ${active ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-700"}`} />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {renderBadge(item.badge)}
          {renderDot(item.badge)}
        </Link>
      );
    }

    // Group with children
    const open = openGroup === item.label && !collapsed;
    const groupActive = item.children.some((c) => isActive(c.href));
    return (
      <div key={item.label}>
        <button
          type="button"
          aria-expanded={open}
          aria-label={collapsed ? item.label : undefined}
          onMouseEnter={(e) => showTip(e, item.label)}
          onMouseLeave={hideTip}
          onFocus={(e) => showTip(e, item.label)}
          onBlur={hideTip}
          onClick={() => {
            if (collapsed) {
              updateCollapsed(false);
              setOpenGroup(item.label);
            } else {
              setOpenGroup(open ? null : item.label);
            }
          }}
          className={`${row} w-full ${groupActive ? "text-slate-900 font-semibold" : "text-slate-800 hover:bg-slate-100 hover:text-slate-900"} ${
            open ? "bg-slate-50" : ""
          }`}
        >
          {groupActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-indigo-400" />}
          <Icon size={18} className={`shrink-0 ${groupActive ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-700"}`} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              <ChevronDown size={16} className={`shrink-0 text-slate-600 transition-transform ${open ? "rotate-180" : ""}`} />
            </>
          )}
        </button>

        <div className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <ul className="overflow-hidden ml-5 pl-2 border-l border-slate-200 space-y-0.5">
            {item.children.map((child) => {
              const CIcon = child.icon;
              const active = isActive(child.href);
              return (
                <li key={child.href} className="first:mt-0.5 last:mb-0.5">
                  {child.section && <p className="px-2 pb-1 pt-3 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{child.section}</p>}
                  <Link
                    href={child.href}
                    tabIndex={open ? 0 : -1}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2 min-h-8 px-2 py-1 rounded-md text-xs transition-colors
                      outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                        active
                          ? "bg-[#0b0b14] text-white font-semibold"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                  >
                    <CIcon size={15} className="shrink-0" />
                    <span className="leading-snug">{child.label}</span>
                    {child.badge && (
                      <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${BADGE_STYLES[child.badge.tone].pill}`}>
                        {child.badge.value}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className={`sticky top-0 h-screen shrink-0 flex flex-col bg-white text-slate-600 border-r border-slate-200
          transition-[width] duration-200 ${collapsed ? "w-[80px]" : "w-68"}`}
      >
        {/* Brand */}
        <div className={`flex items-center h-14 border-b border-slate-200 ${collapsed ? "justify-center" : "justify-between px-3"}`}>
          {collapsed ? (
            <button
              onClick={() => updateCollapsed(false)}
              aria-label="Expand sidebar"
              onMouseEnter={(e) => showTip(e, "Expand")}
              onMouseLeave={hideTip}
              className="group relative grid place-items-center w-8 h-8 rounded-lg bg-[#0b0b14] text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              <Footprints size={18} className="group-hover:opacity-0 transition-opacity" />
              <PanelLeftOpen size={18} className="absolute opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid place-items-center w-8 h-8 shrink-0 rounded-lg bg-[#0b0b14] text-white">
                  <Footprints size={18} />
                </span>
                <span className="text-base font-bold tracking-tight text-slate-900 truncate">{BRAND}</span>
              </div>
              <button
                onClick={() => updateCollapsed(true)}
                aria-label="Collapse sidebar"
                className="grid place-items-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          )}
        </div>

        {/* Menu */}
        <nav
          aria-label="Main"
          onScroll={hideTip}
          className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
        >
          {SECTIONS.map((section, i) => (
            <div key={section.title}>
              {collapsed ? (
                i > 0 && <div className="mx-2 my-3 border-t border-slate-200" />
              ) : (
                <p className={`px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 ${i > 0 ? "mt-4" : "mt-1"}`}>
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">{section.items.map(renderItem)}</div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-2">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1.5">
              <span className="grid place-items-center w-8 h-8 rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">AK</span>
              <button
                aria-label="Log out"
                onMouseEnter={(e) => showTip(e, "Log out")}
                onMouseLeave={hideTip}
                className="grid place-items-center w-9 h-9 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2">
              <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">AK</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">Amit Kumar</p>
                <p className="text-xs text-slate-500 truncate">Admin</p>
              </div>
              <button
                aria-label="Log out"
                className="grid place-items-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                onClick={handleLogout}
              >
                <LogOut size={17} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Collapsed-mode tooltip (nav ke overflow se clip na ho isliye fixed) */}
      {collapsed && tip && (
        <div
          role="tooltip"
          style={{ top: tip.top }}
          className="pointer-events-none fixed left-[80px] z-50 -translate-y-1/2 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-white/10"
        >
          {tip.label}
        </div>
      )}
    </>
  );
}
