"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink, LayoutGrid, List, PackageSearch, Plus, Search, X, Star, Heart, Eye, TrendingUp, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";

/* ---------- Types & sample data ---------- */
type Status = "Active" | "Draft" | "Discontinued";
type Product = {
  code: string; name: string; category: string; gender: string; season: string; status: Status;
  customer: string; colors: string[]; sizes: [number, number]; construction: string; upper: string; sole: string;
  updated: string; image?: string; price?: number; rating?: number; reviews?: number;
};

const HEX: Record<string, string> = {
  Black: "#111827", Brown: "#7c4a21", Tan: "#c9a27a", White: "#f1f5f9", Navy: "#1e3a8a", Grey: "#6b7280", Blue: "#2563eb",
};
const SPEC_HREF = "/dashboard/product-engineering/product-specification";

/* Real shoe images from Unsplash */
const IMG = {
  casual1: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=450&fit=crop",
  casual2: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=450&fit=crop",
  running1: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop",
  running2: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=450&fit=crop",
  formal1: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&h=450&fit=crop",
  formal2: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&h=450&fit=crop",
  outdoor1: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=450&fit=crop",
  outdoor2: "https://images.unsplash.com/photo-1520219306100-ec69c7abbdd7?w=600&h=450&fit=crop",
  safety1: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&h=450&fit=crop",
  kids1: "https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600&h=450&fit=crop",
  women1: "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=600&h=450&fit=crop",
  sports1: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=450&fit=crop",
};

const p = (
  code: string, name: string, category: string, gender: string, season: string, status: Status, customer: string,
  colors: string[], sizes: [number, number], construction: string, upper: string, sole: string, updated: string,
  image: string, price: number, rating: number, reviews: number
): Product => ({ code, name, category, gender, season, status, customer, colors, sizes, construction, upper, sole, updated, image, price, rating, reviews });

const PRODUCTS: Product[] = [
  p("MC-2401", "Men's Casual Shoe", "Casual", "Men", "AW-26", "Active", "ABC Footwear", ["Black", "Brown"], [6, 10], "Cemented", "Leather", "EVA", "2026-09-28", IMG.casual1, 2499, 4.5, 128),
  p("XBED-001", "XBED Air Runner", "Running", "Men", "SS-26", "Active", "Star Shoes Pvt Ltd", ["Black", "Grey", "Blue"], [6, 11], "Cemented", "Mesh", "EVA", "2026-09-27", IMG.running1, 3299, 4.8, 342),
  p("ZFLEX-002", "ZFLEX Trail", "Outdoor", "Unisex", "AW-26", "Active", "Urban Steps", ["Blue", "Tan"], [6, 10], "Stitched", "Synthetic Leather", "Rubber", "2026-09-26", IMG.outdoor1, 4599, 4.6, 89),
//   p("FD-1102", "Classic Oxford", "Formal", "Men", "AW-26", "Active", "ABC Footwear", ["Black", "Brown"], [6, 10], "Stitched", "Leather", "PU", "2026-09-24", IMG.formal1, 3799, 4.7, 215),
  p("FD-1105", "Cap-Toe Derby", "Formal", "Men", "AW-26", "Draft", "ABC Footwear", ["Black", "Tan"], [6, 10], "Stitched", "Leather", "PU", "2026-09-23", IMG.formal2, 3499, 4.4, 76),
  p("WC-3301", "Everyday Loafer", "Casual", "Women", "SS-27", "Draft", "Urban Steps", ["Tan", "White"], [4, 8], "Cemented", "Synthetic Leather", "TPR", "2026-09-22", IMG.women1, 1999, 4.3, 54),
  p("SP-5004", "Sprint Pro", "Sports", "Unisex", "SS-26", "Active", "Star Shoes Pvt Ltd", ["White", "Navy", "Black"], [5, 11], "Cemented", "Mesh", "EVA", "2026-09-20", IMG.sports1, 2899, 4.6, 187),
  p("SF-7010", "SteelGuard S3", "Safety", "Men", "AW-26", "Active", "Star Shoes Pvt Ltd", ["Black"], [6, 11], "Injection Moulded", "Leather", "PU", "2026-09-18", IMG.safety1, 3999, 4.9, 432),
  p("KD-2201", "Junior Runner", "Casual", "Kids", "SS-26", "Active", "Urban Steps", ["Blue", "Grey"], [1, 5], "Cemented", "Mesh", "EVA", "2026-09-15", IMG.kids1, 1499, 4.5, 98),
  p("WF-4120", "Heritage Brogue", "Formal", "Women", "AW-25", "Discontinued", "ABC Footwear", ["Brown"], [3, 7], "Stitched", "Leather", "PU", "2026-08-30", IMG.formal2, 3299, 4.2, 45),
  p("MC-2408", "Suede Moc", "Casual", "Men", "AW-26", "Draft", "ABC Footwear", ["Tan", "Brown", "Navy"], [6, 10], "Cemented", "Leather", "TPR", "2026-09-12", IMG.casual2, 2799, 4.4, 67),
  p("OT-6003", "Ridge Hiker", "Outdoor", "Men", "AW-26", "Active", "Urban Steps", ["Brown", "Black"], [6, 11], "Stitched", "Leather", "Rubber", "2026-09-10", IMG.outdoor2, 5499, 4.7, 156),
  p("SP-5011", "Court Lite", "Sports", "Women", "SS-27", "Draft", "Star Shoes Pvt Ltd", ["White"], [3, 8], "Cemented", "Mesh", "EVA", "2026-09-08", IMG.running2, 2599, 4.5, 112),
  p("MC-2412", "Canvas Low", "Casual", "Unisex", "SS-27", "Active", "Urban Steps", ["White", "Navy", "Grey", "Black", "Blue"], [5, 10], "Vulcanized", "Canvas", "Rubber", "2026-09-05", IMG.casual1, 1799, 4.3, 203),
];

const PAGE_SIZE = 8;
const STATUSES: ("All" | Status)[] = ["All", "Active", "Draft", "Discontinued"];
const STATUS_STYLE: Record<Status, { pill: string; dot: string }> = {
  Active: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  Draft: { pill: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-400" },
  Discontinued: { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
};
const SORTS = ["Recently updated", "Name A–Z", "Code", "Most variants", "Price: Low to High", "Price: High to Low", "Top rated"] as const;

const sizeCount = (x: Product) => x.sizes[1] - x.sizes[0] + 1;
const variantCount = (x: Product) => x.colors.length * sizeCount(x);
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const fmtPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const sel =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors " +
  "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200";

/* ---------- Small pieces ---------- */
function StatusBadge({ s }: { s: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${STATUS_STYLE[s].pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[s].dot}`} />
      {s}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </span>
  );
}

function Dots({ colors, max = 4 }: { colors: string[]; max?: number }) {
  return (
    <span className="flex items-center">
      {colors.slice(0, max).map((c, i) => (
        <span key={c} title={c} className={`h-4 w-4 rounded-full ring-2 ring-white ${i ? "-ml-1.5" : ""}`} style={{ background: HEX[c] ?? "#94a3b8", boxShadow: "inset 0 0 0 1px rgba(15,23,42,.18)" }} />
      ))}
      {colors.length > max && <span className="ml-1.5 text-xs font-medium text-slate-500">+{colors.length - max}</span>}
    </span>
  );
}

/* Real image with fallback SVG illustration */
function Art({ x, className = "", sizes }: { x: Product; className?: string; sizes?: string }) {
  const [failed, setFailed] = useState(false);
  if (x.image && !failed) {
    return (
      <Image
        src={x.image}
        alt={x.name}
        fill
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
        unoptimized
      />
    );
  }
  const fill = HEX[x.colors[0]] ?? "#64748b";
  return (
    <svg viewBox="0 0 120 70" role="img" aria-label={x.name} className={`h-full w-full p-6 ${className}`}>
      <path d="M8 50 C8 38 14 35 22 33 L40 29 C46 23 52 17 60 15 C66 14 71 19 75 25 C83 31 101 33 109 41 C114 46 114 50 112 52 L8 52 Z" fill={fill} />
      <path d="M44 28 l8 7 M52 24 l8 7 M60 21 l8 7" stroke="#fff" strokeOpacity=".7" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6" y="50" width="108" height="9" rx="4.5" fill="#e2e8f0" />
      <rect x="6" y="56" width="108" height="3" rx="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function ProductCard({ x, onOpen }: { x: Product; onOpen: () => void }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <Art x={x} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="transition-transform duration-500 group-hover:scale-110" />

        {/* Gradient overlay */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Status badge */}
        <span className="absolute left-3 top-3 z-10"><StatusBadge s={x.status} /></span>

        {/* Variant badge */}
        <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur">
          {variantCount(x)} variants
        </span>

        {/* Hover quick actions */}
        <span className={`absolute right-3 bottom-3 z-10 flex gap-1.5 transition-all duration-300 ${hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200 backdrop-blur transition hover:bg-white hover:text-indigo-600">
            <Eye size={15} />
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200 backdrop-blur transition hover:bg-white hover:text-rose-500">
            <Heart size={15} />
          </span>
        </span>
      </button>

      {/* Wishlist button (top-right, always visible on hover) */}
      <button
        type="button"
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
        className={`absolute right-3 top-12 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-md ring-1 ring-slate-200 backdrop-blur transition-all duration-300 hover:scale-110 ${hovered || liked ? "opacity-100" : "opacity-0"}`}
      >
        <Heart size={15} className={liked ? "fill-rose-500 text-rose-500" : "text-slate-600"} />
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{x.code}</p>
            <h3 className="mt-0.5 truncate text-[15px] font-semibold text-slate-900">{x.name}</h3>
          </div>
        </div>

        <p className="mt-0.5 text-sm text-slate-500">{x.category} · {x.gender} · {x.season}</p>

        {/* Rating */}
        {x.rating && (
          <div className="mt-2 flex items-center gap-1.5">
            <Stars rating={x.rating} />
            <span className="text-xs font-medium text-slate-600">{x.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-400">({x.reviews})</span>
          </div>
        )}

        {/* Price */}
        {x.price && (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">{fmtPrice(x.price)}</span>
            <span className="text-xs text-slate-400 line-through">{fmtPrice(Math.round(x.price * 1.25))}</span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">20% OFF</span>
          </div>
        )}

        {/* Colors + sizes */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
          <Dots colors={x.colors} />
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">UK {x.sizes[0]}–{x.sizes[1]}</span>
        </div>
      </div>

      {/* Bottom CTA (appears on hover) */}
      <button
        type="button"
        onClick={onOpen}
        className={`absolute bottom-0 left-0 right-0 z-10 h-10 bg-[#0b0b14] text-sm font-semibold text-white transition-transform duration-300 ${hovered ? "translate-y-0" : "translate-y-full"}`}
      >
        View Details
      </button>
    </div>
  );
}

/* ---------- Page ---------- */
export default function CatalogPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [season, setSeason] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Recently updated");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName)) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const uniq = (k: keyof Product) => Array.from(new Set(PRODUCTS.map((x) => String(x[k])))).sort();
  const f = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(1); };

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const rows = PRODUCTS.filter((x) => {
      if (category && x.category !== category) return false;
      if (gender && x.gender !== gender) return false;
      if (season && x.season !== season) return false;
      if (status !== "All" && x.status !== status) return false;
      if (!s) return true;
      const hay = [x.code, x.name, x.category, x.customer, x.season, ...x.colors, ...x.colors.map((c) => `${x.code}/${c}`)].join(" ").toLowerCase();
      return s.split(/\s+/).every((t) => hay.includes(t));
    });
    return rows.sort((a, b) =>
      sort === "Name A–Z" ? a.name.localeCompare(b.name)
      : sort === "Code" ? a.code.localeCompare(b.code)
      : sort === "Most variants" ? variantCount(b) - variantCount(a)
      : sort === "Price: Low to High" ? (a.price ?? 0) - (b.price ?? 0)
      : sort === "Price: High to Low" ? (b.price ?? 0) - (a.price ?? 0)
      : sort === "Top rated" ? (b.rating ?? 0) - (a.rating ?? 0)
      : b.updated.localeCompare(a.updated)
    );
  }, [q, category, gender, season, status, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const chips = [
    category && { k: "Category", v: category, clear: () => setCategory("") },
    gender && { k: "Gender", v: gender, clear: () => setGender("") },
    season && { k: "Season", v: season, clear: () => setSeason("") },
    status !== "All" && { k: "Status", v: status, clear: () => setStatus("All") },
  ].filter(Boolean) as { k: string; v: string; clear: () => void }[];
  const resetAll = () => { setQ(""); setCategory(""); setGender(""); setSeason(""); setStatus("All"); setPage(1); };

  const stats = [
    { label: "Total styles", value: PRODUCTS.length, icon: PackageSearch, color: "indigo" },
    { label: "Active", value: PRODUCTS.filter((x) => x.status === "Active").length, icon: TrendingUp, color: "emerald" },
    { label: "Draft", value: PRODUCTS.filter((x) => x.status === "Draft").length, icon: Eye, color: "amber" },
    { label: "Total variants", value: PRODUCTS.reduce((n, x) => n + variantCount(x), 0), icon: LayoutGrid, color: "blue" },
  ];

  return (
    <div className="mx-auto w-full">
      {/* Header */}
      <Card className="mb-2 px-4 py-3 ">
         <div className="mb-0 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Product Engineering</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Catalog</h1>
          <p className="mt-1 text-sm text-slate-600">Saare styles aur variants ek jagah. Search karo, filter lagao aur detail dekho.</p>
        </div>
        <Link href={SPEC_HREF} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0b0b14] px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-400">
          <Plus size={16} /> New product
        </Link>
      </div>
      </Card>

      {/* Stats */}
      <div className="mb-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="group rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <span className={`grid h-8 w-8 place-items-center rounded-lg bg-${s.color}-50 text-${s.color}-600 transition-transform group-hover:scale-110`}>
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search by name, style code, SKU, category, customer or color"
              aria-label="Search catalog"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-20 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
            {q ? (
              <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-400">
                <X size={16} />
              </button>
            ) : (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">/</kbd>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors lg:hidden ${showFilters ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className={`mt-2 flex flex-wrap items-center gap-2 ${showFilters ? "flex" : "hidden lg:flex"}`}>
          <select aria-label="Category" value={category} onChange={(e) => f(setCategory)(e.target.value)} className={sel}>
            <option value="">Category: All</option>
            {uniq("category").map((o) => <option key={o}>{o}</option>)}
          </select>
          <select aria-label="Gender" value={gender} onChange={(e) => f(setGender)(e.target.value)} className={sel}>
            <option value="">Gender: All</option>
            {uniq("gender").map((o) => <option key={o}>{o}</option>)}
          </select>
          <select aria-label="Season" value={season} onChange={(e) => f(setSeason)(e.target.value)} className={sel}>
            <option value="">Season: All</option>
            {uniq("season").map((o) => <option key={o}>{o}</option>)}
          </select>

          <div className="inline-flex rounded-lg border border-slate-300 p-0.5" role="group" aria-label="Status">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={status === s}
                onClick={() => f(setStatus)(s)}
                className={`h-8 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${status === s ? "bg-[#0b0b14] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])} className={sel}>
              {SORTS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5" role="group" aria-label="View">
              {([["grid", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
                <button
                  key={v}
                  type="button"
                  aria-label={`${v} view`}
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`grid h-8 w-9 place-items-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${view === v ? "bg-[#0b0b14] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <span key={c.k} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
                {c.k}: {c.v}
                <button type="button" aria-label={`Remove ${c.k} filter`} onClick={() => { c.clear(); setPage(1); }} className="grid h-4 w-4 place-items-center rounded-full hover:bg-indigo-100">
                  <X size={11} />
                </button>
              </span>
            ))}
            <button type="button" onClick={resetAll} className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline">Clear all</button>
          </div>
        )}
      </div>

      {/* Results header */}
      <div className="mb-4 mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-600" aria-live="polite">
          <span className="font-semibold text-slate-900">{list.length}</span> {list.length === 1 ? "style" : "styles"} found
        </p>
        {list.length > 0 && (
          <p className="hidden text-xs text-slate-500 sm:block">
            Showing {(cur - 1) * PAGE_SIZE + 1}–{Math.min(cur * PAGE_SIZE, list.length)}
          </p>
        )}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-500"><PackageSearch size={26} /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Koi product nahi mila</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-600">Spelling check karo ya filters kam karke dobara try karo.</p>
          <button type="button" onClick={resetAll} className="mt-4 inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-100">Reset filters</button>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((x) => <ProductCard key={x.code} x={x} onOpen={() => setOpen(x)} />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
              <tr>
                {["Product", "Category", "Gender", "Season", "Colors", "Sizes", "Variants", "Price", "Rating", "Status", "Updated"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((x) => (
                <tr key={x.code} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setOpen(x)} className="flex items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Art x={x} sizes="64px" />
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-900">{x.name}</span>
                        <span className="text-xs font-semibold text-indigo-600">{x.code}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{x.category}</td>
                  <td className="px-4 py-3 text-slate-700">{x.gender}</td>
                  <td className="px-4 py-3 text-slate-700">{x.season}</td>
                  <td className="px-4 py-3"><Dots colors={x.colors} /></td>
                  <td className="px-4 py-3 text-slate-700">UK {x.sizes[0]}–{x.sizes[1]}</td>
                  <td className="px-4 py-3 font-medium tabular-nums text-slate-900">{variantCount(x)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{x.price ? fmtPrice(x.price) : "—"}</td>
                  <td className="px-4 py-3">
                    {x.rating ? (
                      <span className="flex items-center gap-1"><Stars rating={x.rating} /><span className="text-xs text-slate-600">{x.rating}</span></span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge s={x.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(x.updated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {list.length > PAGE_SIZE && (
        <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {(cur - 1) * PAGE_SIZE + 1}–{Math.min(cur * PAGE_SIZE, list.length)} of {list.length}
          </p>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous page" disabled={cur === 1} onClick={() => setPage(cur - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {range(1, pages).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === cur ? "page" : undefined}
                onClick={() => setPage(n)}
                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${n === cur ? "bg-[#0b0b14] text-white shadow-sm" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
              >
                {n}
              </button>
            ))}
            <button type="button" aria-label="Next page" disabled={cur === pages} onClick={() => setPage(cur + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      )}

      {/* Quick view drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`${open.name} details`}>
          <button type="button" aria-label="Close details" onClick={() => setOpen(null)} className="absolute inset-0 cursor-default bg-slate-900/50 backdrop-blur-sm" />
          <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-indigo-600">{open.code}</p>
                <h2 className="truncate text-lg font-bold text-slate-900">{open.name}</h2>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge s={open.status} />
                  {open.rating && (
                    <span className="flex items-center gap-1">
                      <Stars rating={open.rating} />
                      <span className="text-xs font-medium text-slate-600">{open.rating}</span>
                    </span>
                  )}
                </div>
              </div>
              <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-500 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-400">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                <Art x={open} sizes="(max-width: 768px) 100vw, 448px" />
              </div>

              {open.price && (
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{fmtPrice(open.price)}</span>
                  <span className="text-sm text-slate-400 line-through">{fmtPrice(Math.round(open.price * 1.25))}</span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">20% OFF</span>
                </div>
              )}

              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  ["Customer", open.customer], ["Category", open.category], ["Gender", open.gender], ["Season", open.season],
                  ["Construction", open.construction], ["Upper", open.upper], ["Sole", open.sole], ["Last updated", fmtDate(open.updated)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-slate-500">{k}</dt>
                    <dd className="font-medium text-slate-900">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Variants</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {open.colors.length} colors × {sizeCount(open)} sizes = {variantCount(open)}
                  </span>
                </div>
                <div className="space-y-3">
                  {open.colors.map((c) => (
                    <div key={c} className="rounded-lg border border-slate-200 p-3">
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                        <span className="h-3.5 w-3.5 rounded-full" style={{ background: HEX[c], boxShadow: "inset 0 0 0 1px rgba(15,23,42,.2)" }} /> {c}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {range(open.sizes[0], open.sizes[1]).map((n) => (
                          <span key={n} title={`${open.code}/${c}/${n}`} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-700">UK {n}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-200 p-4">
              <button type="button" onClick={() => setOpen(null)} className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100">Close</button>
              <Link href={SPEC_HREF} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0b0b14] text-sm font-semibold text-white transition-colors hover:bg-slate-800">
                Open specification <ExternalLink size={14} />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}