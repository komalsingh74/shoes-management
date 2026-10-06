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
  type LucideIcon,
} from "lucide-react";

type BadgeTone = "red" | "amber" | "slate";
type Badge = { value: string; tone: BadgeTone };
type Child = { label: string; href: string; icon: LucideIcon; badge?: Badge };
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
      { label: "Production", icon: Factory, href: "/dashboard/production", badge: { value: "5", tone: "red" } },
      { label: "Product", icon: Package, href: "/dashboard/product" },
      { label: "QC", icon: ShieldCheck, href: "/dashboard/qc" },
    ],
  },
  {
    title: "Supply",
    items: [
      { label: "Inventory", icon: Boxes, href: "/dashboard/inventory", badge: { value: "3", tone: "amber" } },
      { label: "Purchase", icon: ShoppingBag, href: "/dashboard/purchase" },
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
    allItems.find((m) => m.children?.some((c) => isActive(c.href)))?.label ?? "Sales"
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
    "group relative flex items-center gap-3 h-10 rounded-lg px-3 text-sm font-medium " +
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
          <Icon size={19} className={`shrink-0 ${active ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-700"}`} />
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
          <Icon size={19} className={`shrink-0 ${groupActive ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-700"}`} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              <ChevronDown size={16} className={`shrink-0 text-slate-600 transition-transform ${open ? "rotate-180" : ""}`} />
            </>
          )}
        </button>

        <div className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <ul className="overflow-hidden ml-[22px] pl-3 border-l border-slate-200 space-y-0.5">
            {item.children.map((child) => {
              const CIcon = child.icon;
              const active = isActive(child.href);
              return (
                <li key={child.href} className="first:mt-1 last:mb-1">
                  <Link
                    href={child.href}
                    tabIndex={open ? 0 : -1}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 min-h-9 px-2.5 py-1.5 rounded-md text-[13.5px] transition-colors
                      outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                        active
                          ? "bg-[#0b0b14] text-white font-semibold"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                  >
                    <CIcon size={16} className="shrink-0" />
                    <span className="leading-snug">{child.label}</span>
                    {child.badge && (
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${BADGE_STYLES[child.badge.tone].pill}`}>
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
        <div className={`flex items-center h-16 border-b border-slate-200 ${collapsed ? "justify-center" : "justify-between px-4"}`}>
          {collapsed ? (
            <button
              onClick={() => updateCollapsed(false)}
              aria-label="Expand sidebar"
              onMouseEnter={(e) => showTip(e, "Expand")}
              onMouseLeave={hideTip}
              className="group relative grid place-items-center w-9 h-9 rounded-lg bg-[#0b0b14] text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              <Footprints size={18} className="group-hover:opacity-0 transition-opacity" />
              <PanelLeftOpen size={18} className="absolute opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid place-items-center w-9 h-9 shrink-0 rounded-lg bg-[#0b0b14] text-white">
                  <Footprints size={18} />
                </span>
                <span className="text-lg font-bold tracking-tight text-slate-900 truncate">{BRAND}</span>
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
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
        >
          {SECTIONS.map((section, i) => (
            <div key={section.title}>
              {collapsed ? (
                i > 0 && <div className="mx-2 my-3 border-t border-slate-200" />
              ) : (
                <p className={`px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 ${i > 0 ? "mt-5" : "mt-1"}`}>
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">{section.items.map(renderItem)}</div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">AK</span>
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
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
              <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">AK</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">Amit Kumar</p>
                <p className="text-xs text-slate-500 truncate">Admin</p>
              </div>
              <button
                aria-label="Log out"
                className="grid place-items-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
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