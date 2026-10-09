"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Pencil, ListChecks, Shapes, CheckCircle2,
  ChevronRight, X, AlertTriangle, GitBranch, Layers,
  History, GitCompare, Upload, Trash2, Copy, Eye, ArrowRight,
  Boxes, DollarSign, ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter,
  SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — Per PDF §72 "What should a BOM line ultimately contain?"
// ─────────────────────────────────────────────────────────────────────────────

type ConsumptionMethod = "Fixed" | "Size Matrix" | "Color" | "Size + Color" | "Formula";
type BomStatus = "Draft" | "Under Review" | "Approved" | "Active" | "Superseded" | "Obsolete";
type ComponentType = "Direct Material" | "Component" | "Consumable" | "Packaging" | "Subassembly";
type ComponentCategory = "Upper" | "Lining" | "Bottom" | "Insole" | "Hardware" | "Lace" | "Thread" | "Adhesive" | "Branding" | "Finishing" | "Packaging" | "Consumable" | "Other";
type ComponentLocation = "Vamp" | "Quarter" | "Tongue" | "Collar" | "Upper" | "Lining" | "Footbed" | "Bottom" | "Sole" | "Heel" | "Toe" | "Packing" | "Not Applicable";
type Operation = "Cutting" | "Skiving" | "Stitching" | "Lasting" | "Cementing" | "Assembly" | "Finishing" | "QC" | "Packing";

type SizeMatrix = { UK6: number; UK7: number; UK8: number; UK9: number; UK10: number };
type ColorMapping = { color: string; materialId: string; materialName: string };

type Alternative = {
  id: string;
  materialId: string;
  materialName: string;
  status: "Approved" | "Conditional" | "Temporary" | "Not Approved";
  priority: number;
};

const isBomHeaderArray = (value: unknown): value is BomHeader[] =>
  Array.isArray(value) && value.every((item: unknown) =>
    typeof item === "object" && item !== null &&
    "id" in item && typeof item.id === "string" &&
    "productCode" in item && typeof item.productCode === "string" &&
    "productName" in item && typeof item.productName === "string" &&
    "currentRevision" in item && typeof item.currentRevision === "string" &&
    "applicableColors" in item && Array.isArray(item.applicableColors) &&
    "applicableSizes" in item && Array.isArray(item.applicableSizes) &&
    "revisions" in item && Array.isArray(item.revisions) &&
    item.revisions.every((revision: unknown) =>
      typeof revision === "object" && revision !== null &&
      "revision" in revision && typeof revision.revision === "string" &&
      "status" in revision && typeof revision.status === "string" &&
      "components" in revision && Array.isArray(revision.components)
    )
  );

type BomComponent = {
  id: string;
  seq: number;
  materialId: string;
  materialName: string;
  componentType: ComponentType;
  category: ComponentCategory;
  location: ComponentLocation;
  side: "Left" | "Right" | "Both" | "Pair" | "N/A";
  qty: number;                    // base qty (net)
  uom: string;
  consumptionMethod: ConsumptionMethod;
  sizeMatrix?: SizeMatrix;        // when consumptionMethod = Size Matrix / Size + Color
  colorMapping?: ColorMapping[];  // when color dependent
  sizeColorMatrix?: Record<string, SizeMatrix>; // when Size + Color
  scrapPct: number;
  yieldPct?: number;              // optional — PDF §23
  operation: Operation;
  applicableColors: string[];
  applicableSizes: string[];
  alternatives: Alternative[];
  notes?: string;
  variantRule: "All Variants" | "Selected Variants" | "Size Specific" | "Color Specific" | "Size + Color Specific";
};

type BomRevision = {
  id: string;
  revision: string;               // "Rev 01"
  status: BomStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  createdDate: string;
  changeReason?: string;
  components: BomComponent[];
};

type BomHeader = {
  id: string;                     // BOM-MC2401-001
  productId: string;
  productName: string;
  productCode: string;
  bomType: "Manufacturing BOM" | "Sample BOM" | "Costing BOM" | "Engineering BOM" | "Packaging BOM";
  plant: string;
  baseQty: number;
  baseUom: string;
  applicableColors: string[];
  applicableSizes: string[];
  currentRevision: string;
  revisions: BomRevision[];
  audit?: { date: string; user: string; action: string; details: string }[];
};

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA — MC-2401 example from PDF §105
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_MATRIX_LEATHER: SizeMatrix = { UK6: 0.78, UK7: 0.82, UK8: 0.85, UK9: 0.89, UK10: 0.94 };
const SIZE_MATRIX_LINING: SizeMatrix = { UK6: 0.36, UK7: 0.38, UK8: 0.40, UK9: 0.42, UK10: 0.44 };

const seedComponents: BomComponent[] = [
  {
    id: "C-01", seq: 10, materialId: "MAT-LTH-001", materialName: "Full Grain Leather — Black",
    componentType: "Direct Material", category: "Upper", location: "Vamp", side: "Both",
    qty: 0.85, uom: "m²", consumptionMethod: "Size Matrix",
    sizeMatrix: SIZE_MATRIX_LEATHER, scrapPct: 8, operation: "Cutting",
    applicableColors: ["Black", "Brown"], applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    alternatives: [
      { id: "ALT-1", materialId: "MAT-LTH-009", materialName: "Full Grain Leather — Supplier B", status: "Approved", priority: 1 },
    ],
    variantRule: "Size Specific",
    notes: "Vamp + Quarter cutting. Nesting optimized.",
  },
  {
    id: "C-02", seq: 20, materialId: "MAT-LIN-001", materialName: "Textile Lining",
    componentType: "Direct Material", category: "Lining", location: "Lining", side: "Both",
    qty: 0.40, uom: "m²", consumptionMethod: "Size Matrix",
    sizeMatrix: SIZE_MATRIX_LINING, scrapPct: 5, operation: "Cutting",
    applicableColors: ["Black", "Brown"], applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    alternatives: [], variantRule: "Size Specific",
  },
  {
    id: "C-03", seq: 30, materialId: "MAT-SOL-001", materialName: "EVA Sole 10mm",
    componentType: "Component", category: "Bottom", location: "Sole", side: "Pair",
    qty: 1, uom: "pair", consumptionMethod: "Fixed",
    scrapPct: 2, operation: "Assembly",
    applicableColors: ["Black", "Brown"], applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    alternatives: [], variantRule: "All Variants",
  },
  {
    id: "C-04", seq: 40, materialId: "MAT-INS-001", materialName: "Insole Board",
    componentType: "Component", category: "Insole", location: "Footbed", side: "Pair",
    qty: 1, uom: "pair", consumptionMethod: "Fixed",
    scrapPct: 0, operation: "Assembly",
    applicableColors: ["Black", "Brown"], applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    alternatives: [], variantRule: "All Variants",
  },
  {
    id: "C-05", seq: 50, materialId: "MAT-LAC-001", materialName: "Shoelace 120cm",
    componentType: "Component", category: "Lace", location: "Upper", side: "Pair",
    qty: 1, uom: "pair", consumptionMethod: "Fixed",
    scrapPct: 1, operation: "Finishing",
    applicableColors: ["Black", "Brown"], applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    alternatives: [], variantRule: "All Variants",
  },
  {
    id: "C-06", seq: 60, materialId: "MAT-THR-001", materialName: "Nylon Thread 40/3",
    componentType: "Consumable", category: "Thread", location: "Upper", side: "N/A",
    qty: 15, uom: "m", consumptionMethod: "Fixed",
    scrapPct: 3, operation: "Stitching",
    applicableColors: ["Black", "Brown"], applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    alternatives: [], variantRule: "All Variants",
  },
  {
    id: "C-07", seq: 70, materialId: "MAT-ADH-001", materialName: "PU Adhesive A",
    componentType: "Consumable", category: "Adhesive", location: "Sole", side: "N/A",
    qty: 12, uom: "g", consumptionMethod: "Fixed",
    scrapPct: 5, operation: "Cementing",
    applicableColors: ["Black", "Brown"], applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    alternatives: [
      { id: "ALT-2", materialId: "MAT-ADH-005", materialName: "PU Adhesive B — Approved", status: "Approved", priority: 1 },
      { id: "ALT-3", materialId: "MAT-ADH-009", materialName: "PU Adhesive C", status: "Conditional", priority: 2 },
    ],
    variantRule: "All Variants",
  },
  {
    id: "C-08", seq: 80, materialId: "MAT-BOX-001", materialName: "Shoe Box — Standard",
    componentType: "Packaging", category: "Packaging", location: "Packing", side: "N/A",
    qty: 1, uom: "pcs", consumptionMethod: "Fixed",
    scrapPct: 1, operation: "Packing",
    applicableColors: ["Black", "Brown"], applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    alternatives: [], variantRule: "All Variants",
  },
];

const seedBoms: BomHeader[] = [
  {
    id: "BOM-MC2401-001",
    productId: "MC-2401",
    productCode: "MC-2401",
    productName: "Men's Casual Leather Shoe",
    bomType: "Manufacturing BOM",
    plant: "Delhi Factory",
    baseQty: 1,
    baseUom: "Pair",
    applicableColors: ["Black", "Brown"],
    applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    currentRevision: "Rev 02",
    revisions: [
      {
        id: "R-02", revision: "Rev 02", status: "Active",
        effectiveFrom: "2026-10-01", createdBy: "Rahul", createdDate: "2026-10-05",
        changeReason: "Reduced leather consumption after cutting optimization",
        components: seedComponents,
      },
      {
        id: "R-01", revision: "Rev 01", status: "Superseded",
        effectiveFrom: "2026-07-01", effectiveTo: "2026-09-30",
        createdBy: "Rahul", createdDate: "2026-06-28",
        components: seedComponents.map((c) =>
          c.id === "C-01" ? { ...c, qty: 0.88, sizeMatrix: { UK6: 0.80, UK7: 0.84, UK8: 0.88, UK9: 0.92, UK10: 0.97 } } : c
        ),
      },
    ],
  },
  {
    id: "BOM-WS1102-001",
    productId: "WS-1102",
    productCode: "WS-1102",
    productName: "Women's Sandal",
    bomType: "Manufacturing BOM",
    plant: "Delhi Factory",
    baseQty: 1,
    baseUom: "Pair",
    applicableColors: ["Tan"],
    applicableSizes: ["UK3", "UK4", "UK5", "UK6", "UK7"],
    currentRevision: "Rev 01",
    revisions: [
      { id: "R-01", revision: "Rev 01", status: "Draft", effectiveFrom: "2026-11-01", createdBy: "Amit", createdDate: "2026-10-06", components: [] },
    ],
  },
  {
    id: "BOM-SS4501-001",
    productId: "SS-4501",
    productCode: "SS-4501",
    productName: "Safety Shoe",
    bomType: "Manufacturing BOM",
    plant: "Delhi Factory",
    baseQty: 1,
    baseUom: "Pair",
    applicableColors: ["Black"],
    applicableSizes: ["UK6", "UK7", "UK8", "UK9", "UK10", "UK11"],
    currentRevision: "Rev 03",
    revisions: [
      { id: "R-03", revision: "Rev 03", status: "Active", effectiveFrom: "2026-09-15", createdBy: "Rahul", createdDate: "2026-09-10", components: seedComponents },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const inp = "h-11 rounded-xl";

const initials = (s: string) =>
  s.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// PDF §22-26: Gross = Net × (1 + Scrap%) — Method A
const calcGross = (net: number, scrapPct: number) => +(net * (1 + scrapPct / 100)).toFixed(3);

const nextBomId = (productCode: string, boms: BomHeader[]) => {
  const prefix = `BOM-${productCode.replace(/-/g, "")}-`;
  const nextNumber = boms.reduce((max, bom) => {
    if (!bom.id.startsWith(prefix)) return max;
    return Math.max(max, Number(bom.id.slice(prefix.length)) || 0);
  }, 0) + 1;
  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

const nextRevision = (revisions: BomRevision[]) => {
  const nextNumber = revisions.reduce((max, revision) => {
    const number = Number(revision.revision.match(/\d+/)?.[0]) || 0;
    return Math.max(max, number);
  }, 0) + 1;
  return `Rev ${String(nextNumber).padStart(2, "0")}`;
};

const statusColor = (s: BomStatus) => {
  switch (s) {
    case "Active": return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
    case "Draft": return "bg-slate-100 text-slate-600 hover:bg-slate-100";
    case "Under Review": return "bg-amber-50 text-amber-700 hover:bg-amber-50";
    case "Approved": return "bg-blue-50 text-blue-700 hover:bg-blue-50";
    case "Superseded": return "bg-purple-50 text-purple-700 hover:bg-purple-50";
    case "Obsolete": return "bg-red-50 text-red-700 hover:bg-red-50";
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function BomMasterPage() {
  const [boms, setBoms] = useState<BomHeader[]>(seedBoms);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBom, setSelectedBom] = useState<BomHeader | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState("overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [componentEditorOpen, setComponentEditorOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<BomComponent | null>(null);
  const [compareRevisions, setCompareRevisions] = useState<[string, string]>(["", ""]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("shoes-management:boms");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (!isBomHeaderArray(parsed)) throw new Error("Saved BOM data has an invalid format.");
        setBoms(parsed);
      }
    } catch (error) {
      console.error("Unable to load saved BOM data.", error);
      setNotice("Saved BOM data could not be loaded. The sample BOMs are shown instead.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem("shoes-management:boms", JSON.stringify(boms));
    } catch (error) {
      console.error("Unable to save BOM data.", error);
      setNotice("BOM changes could not be saved in this browser.");
    }
  }, [boms, ready]);

  // Filtered list — PDF §6 BOM List
  const filtered = useMemo(
    () => boms.filter((b) => {
      const currentRev = b.revisions.find((r) => r.revision === b.currentRevision);
      const st = currentRev?.status ?? "Draft";
      const materialText = b.revisions.flatMap((revision) => revision.components.flatMap((component) => [component.materialId, component.materialName])).join(" ");
      const matchQ = [b.id, b.productCode, b.productName, materialText].join(" ").toLowerCase().includes(q.toLowerCase());
      const matchS = statusFilter === "all" || st === statusFilter;
      return matchQ && matchS;
    }),
    [boms, q, statusFilter]
  );

  // PDF §8: BOM stats
  const stats = [
    { icon: ListChecks, label: "Total BOMs", value: boms.length },
    { icon: Shapes, label: "Styles covered", value: new Set(boms.map((b) => b.productCode)).size },
    { icon: CheckCircle2, label: "Active BOMs", value: boms.filter((b) => b.revisions.find((r) => r.revision === b.currentRevision)?.status === "Active").length },
    { icon: GitBranch, label: "Total Revisions", value: boms.reduce((a, b) => a + b.revisions.length, 0) },
  ];

  const updateBom = (updatedBom: BomHeader) => {
    setBoms((current) => current.map((bom) => bom.id === updatedBom.id ? updatedBom : bom));
    setSelectedBom(updatedBom);
  };

  const recordAudit = (bom: BomHeader, action: string, details: string): BomHeader => ({
    ...bom,
    audit: [
      { date: new Date().toISOString().slice(0, 10), user: "Current User", action, details },
      ...(bom.audit ?? []),
    ],
  });

  const addRevision = (bom: BomHeader) => {
    const current = bom.revisions.find((revision) => revision.revision === bom.currentRevision) ?? bom.revisions[0];
    const revisionName = nextRevision(bom.revisions);
    const revision: BomRevision = {
      id: `R-${revisionName.replace(/\D/g, "")}`,
      revision: revisionName,
      status: "Draft",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      createdBy: "Current User",
      createdDate: new Date().toISOString().slice(0, 10),
      changeReason: "New revision",
      components: current?.components.map((component) => ({ ...component })) ?? [],
    };
    const updated = recordAudit({
      ...bom,
      currentRevision: revisionName,
      revisions: [revision, ...bom.revisions],
    }, "Created revision", revisionName);
    updateBom(updated);
    setNotice(`${revisionName} created as a draft.`);
    return updated;
  };

  const beginComponentEdit = (component: BomComponent | null = null) => {
    if (!selectedBom) return;
    const current = selectedBom.revisions.find((revision) => revision.revision === selectedBom.currentRevision);
    const editableBom = current && current.status !== "Draft" ? addRevision(selectedBom) : selectedBom;
    setSelectedBom(editableBom);
    setEditingComponent(component);
    setComponentEditorOpen(true);
  };

  const deleteComponent = (component: BomComponent) => {
    if (!selectedBom || !window.confirm(`Remove ${component.materialName} from this revision?`)) return;
    const current = selectedBom.revisions.find((revision) => revision.revision === selectedBom.currentRevision);
    const editableBom = current && current.status !== "Draft" ? addRevision(selectedBom) : selectedBom;
    const target = editableBom.revisions.find((revision) => revision.revision === editableBom.currentRevision);
    if (!target) {
      setNotice("The selected revision could not be found.");
      return;
    }
    const targetComponent = target.components.find((item) => item.id === component.id);
    if (!targetComponent) {
      setNotice("This component is no longer in the selected revision.");
      return;
    }
    const updated = recordAudit({
      ...editableBom,
      revisions: editableBom.revisions.map((revision) => revision.id === target.id
        ? { ...revision, components: revision.components.filter((item) => item.id !== targetComponent.id) }
        : revision),
    }, "Removed component", component.materialName);
    updateBom(updated);
    setNotice(`${component.materialName} removed from ${target.revision}.`);
  };

  const openRoute = () => setRouteOpen(true);

  const transitionStatus = (bom: BomHeader, status: BomStatus) => {
    const target = bom.revisions.find((revision) => revision.revision === bom.currentRevision);
    if (!target) {
      setNotice("The selected revision could not be found.");
      return;
    }
    if (["Under Review", "Approved", "Active"].includes(status) && target.components.length === 0) {
      setNotice("Add at least one material before submitting or activating this BOM.");
      return;
    }
    const revisions = bom.revisions.map((revision) => {
      if (status === "Active" && revision.status === "Active") return { ...revision, status: "Superseded" as const };
      return revision.id === target.id ? { ...revision, status } : revision;
    });
    updateBom(recordAudit({ ...bom, revisions }, status, `${target.revision} marked ${status}`));
    setNotice(`${target.revision} moved to ${status}.`);
  };

  const duplicateBom = (bom: BomHeader) => {
    const current = bom.revisions.find((revision) => revision.revision === bom.currentRevision) ?? bom.revisions[0];
    const revisionName = "Rev 01";
    const duplicate: BomHeader = {
      ...bom,
      id: nextBomId(bom.productCode, boms),
      currentRevision: revisionName,
      revisions: [{
        ...current,
        id: "R-01",
        revision: revisionName,
        status: "Draft",
        effectiveFrom: new Date().toISOString().slice(0, 10),
        effectiveTo: undefined,
        createdBy: "Current User",
        createdDate: new Date().toISOString().slice(0, 10),
        changeReason: `Duplicated from ${bom.id}`,
        components: current?.components.map((component) => ({ ...component })) ?? [],
      }],
      audit: [{ date: new Date().toISOString().slice(0, 10), user: "Current User", action: "Duplicated BOM", details: `Copied from ${bom.id}` }],
    };
    setBoms((currentBoms) => [duplicate, ...currentBoms]);
    setSelectedBom(duplicate);
    setNotice(`${duplicate.id} created as a draft copy.`);
  };

  const exportComponents = (bom: BomHeader) => {
    const revision = bom.revisions.find((item) => item.revision === bom.currentRevision);
    if (!revision) return;
    const quote = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [
      ["Seq", "Material ID", "Material", "Type", "Category", "Location", "Quantity", "UOM", "Consumption Method", "Scrap %", "Gross Qty", "Operation"],
      ...revision.components.map((component) => [
        component.seq, component.materialId, component.materialName, component.componentType,
        component.category, component.location, component.qty, component.uom,
        component.consumptionMethod, component.scrapPct, calcGross(component.qty, component.scrapPct), component.operation,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(quote).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${bom.id}-${revision.revision.replace(/\s/g, "-")}-components.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openCompare = (bom: BomHeader) => {
    if (bom.revisions.length < 2) {
      setNotice("At least two revisions are needed to compare.");
      return;
    }
    const currentIndex = bom.revisions.findIndex((revision) => revision.revision === bom.currentRevision);
    const current = bom.revisions[Math.max(currentIndex, 0)];
    const previous = bom.revisions.find((revision) => revision.id !== current?.id);
    if (current && previous) setCompareRevisions([previous.id, current.id]);
    setCompareOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Card className="p-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              BOM Management
            </h1>
            <p className="mt-0 text-sm text-slate-500">
              Manage bills of materials for manufactured products. Style → Variant → Component → Location → Consumption → Waste → Operation.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="group relative h-11 overflow-hidden rounded-xl bg-[#0b0b14] px-5 font-semibold text-white shadow-lg shadow-indigo-900/20 ring-1 ring-white/10 hover:bg-[#12121f]"
          >
            <span className="pointer-events-none absolute -left-6 -top-8 h-20 w-20 rounded-full bg-indigo-600/50 blur-2xl transition-opacity group-hover:opacity-80" />
            <span className="relative flex items-center">
              <Plus className="mr-2 h-4 w-4 text-indigo-300" />
              Create BOM
            </span>
          </Button>
        </header>
      </Card>

      <main className="mx-auto space-y-3 px-0 py-4">
        {notice && (
          <div role="status" className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm text-indigo-800">
            {notice}
            <button type="button" aria-label="Dismiss message" onClick={() => setNotice("")} className="rounded p-1 hover:bg-indigo-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {/* Stats — PDF §8 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
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

        {/* BOM List — PDF §6 */}
        <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-lg shadow-slate-900/5">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search BOM, product, material..."
                className={`${inp} border-slate-200 bg-slate-50 pl-10`}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={`${inp} w-44 border-slate-200 bg-slate-50`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Superseded">Superseded</SelectItem>
                <SelectItem value="Obsolete">Obsolete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  {["BOM Code", "Product / Style", "Rev", "Status", "Effective", "Components", "Material Cost", "Updated"].map((h, i) => (
                    <TableHead key={h} className={i === 0 ? "pl-5" : ""}>{h}</TableHead>
                  ))}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => {
                  const rev = b.revisions.find((r) => r.revision === b.currentRevision) ?? b.revisions[0];
                  const cost = rev.components.reduce((a, c) => a + calcGross(c.qty, c.scrapPct) * 300, 0); // mock cost
                  return (
                    <TableRow
                      key={b.id}
                      className="cursor-pointer"
                      onClick={() => { setSelectedBom(b); setWorkspaceTab("overview"); }}
                    >
                      <TableCell className="py-4 pl-5 font-mono text-sm font-semibold text-slate-900">
                        {b.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#111827] text-xs font-semibold text-white">
                            {initials(b.productName)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{b.productCode}</p>
                            <p className="text-xs text-slate-500">{b.productName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-700">{rev.revision}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(rev.status)}>{rev.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{rev.effectiveFrom}</TableCell>
                      <TableCell className="text-sm text-slate-600">{rev.components.length}</TableCell>
                      <TableCell className="font-medium text-slate-900">₹{cost.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-slate-500">{rev.createdDate}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          aria-label={`Open ${b.id}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedBom(b);
                            setWorkspaceTab("overview");
                          }}
                          className="rounded-md p-2 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4 text-slate-400" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-14 text-center text-slate-500">
                      No BOMs match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* ─────────────────────────────────────────────────────────────────────
          BOM WORKSPACE — PDF §90-91, §25
          ───────────────────────────────────────────────────────────────────── */}
      <Sheet open={!!selectedBom} onOpenChange={(o) => !o && setSelectedBom(null)}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans !max-w-6xl">
          {selectedBom && (() => {
            const currentRev = selectedBom.revisions.find((r) => r.revision === selectedBom.currentRevision) ?? selectedBom.revisions[0];
            const variantTotal = selectedBom.applicableColors.length * selectedBom.applicableSizes.length;
            const coveredVariantCount = selectedBom.applicableColors.flatMap((color) => selectedBom.applicableSizes.map((size) =>
              currentRev.components.length > 0 && currentRev.components.every((component) =>
                component.variantRule === "All Variants" ||
                (component.applicableColors.includes(color) && component.applicableSizes.includes(size))
              )
            )).filter(Boolean).length;
            return (
              <>
                {/* Workspace header — PDF §25 */}
                <SheetHeader className="border-b border-slate-100 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <button type="button" onClick={() => setSelectedBom(null)} className="mb-1 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900">
                        ← BOM Management
                      </button>
                      <SheetTitle className="flex items-center gap-3 text-xl font-bold">
                        <span className="font-mono">{selectedBom.id} / {currentRev.revision}</span>
                        <Badge className={statusColor(currentRev.status)}>{currentRev.status}</Badge>
                      </SheetTitle>
                      <SheetDescription className="mt-1">
                        {selectedBom.productCode} — {selectedBom.productName}
                      </SheetDescription>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>Effective: <strong className="text-slate-700">{currentRev.effectiveFrom}</strong></span>
                        <span>Plant: <strong className="text-slate-700">{selectedBom.plant}</strong></span>
                        <span>Base: <strong className="text-slate-700">{selectedBom.baseQty} {selectedBom.baseUom}</strong></span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentRev.status === "Active" ? (
                        <Button variant="outline" className="h-9 rounded-xl" onClick={() => openCompare(selectedBom)}>
                          <GitCompare className="mr-2 h-4 w-4" /> Compare Revisions
                        </Button>
                      ) : null}
                      {currentRev.status === "Draft" && (
                        <Button className="h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => transitionStatus(selectedBom, "Under Review")}>
                          <ClipboardCheck className="mr-2 h-4 w-4" /> Submit for Review
                        </Button>
                      )}
                      {currentRev.status === "Under Review" && (
                        <Button className="h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => transitionStatus(selectedBom, "Approved")}>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      )}
                      {currentRev.status === "Approved" && (
                        <Button className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => transitionStatus(selectedBom, "Active")}>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Activate
                        </Button>
                      )}
                      {currentRev.status === "Active" && (
                        <Button variant="outline" className="h-9 rounded-xl" onClick={() => addRevision(selectedBom)}>
                          <Plus className="mr-2 h-4 w-4" /> New Revision
                        </Button>
                      )}
                      <Button variant="outline" className="h-9 rounded-xl" onClick={() => duplicateBom(selectedBom)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </Button>
                      <Button variant="outline" className="h-9 rounded-xl" onClick={() => setWorkspaceTab("audit")}>
                        <History className="mr-2 h-4 w-4" /> History
                      </Button>
                    </div>
                  </div>
                </SheetHeader>

                {/* Tabs — PDF §90 */}
                <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="flex-1 overflow-y-auto">
                  <div className="border-b border-slate-100 px-6 pt-4">
                    <TabsList className="grid w-full grid-cols-7 rounded-xl bg-slate-100">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="components">Components</TabsTrigger>
                      <TabsTrigger value="variants">Variants</TabsTrigger>
                      <TabsTrigger value="operations">Operations</TabsTrigger>
                      <TabsTrigger value="cost">Cost</TabsTrigger>
                      <TabsTrigger value="revisions">Revisions</TabsTrigger>
                      <TabsTrigger value="audit">Audit</TabsTrigger>
                    </TabsList>
                  </div>

                  {/* ── OVERVIEW TAB — PDF §47 ── */}
                  <TabsContent value="overview" className="space-y-3 p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Card className="rounded-2xl border-slate-200 p-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Boxes className="h-4 w-4" /> COMPONENTS
                        </div>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{currentRev.components.length}</p>
                      </Card>
                      <Card className="rounded-2xl border-slate-200 p-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Layers className="h-4 w-4" /> VARIANTS
                        </div>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          {selectedBom.applicableColors.length * selectedBom.applicableSizes.length}
                          <span className="ml-2 text-sm font-normal text-slate-500">
                            ({selectedBom.applicableColors.length} colors × {selectedBom.applicableSizes.length} sizes)
                          </span>
                        </p>
                      </Card>
                      <Card className="rounded-2xl border-slate-200 p-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <DollarSign className="h-4 w-4" /> MATERIAL COST
                        </div>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                          ₹{currentRev.components.reduce((a, c) => a + calcGross(c.qty, c.scrapPct) * 300, 0).toFixed(2)}
                          <span className="ml-1 text-sm font-normal text-slate-500">/ {selectedBom.baseUom.toLowerCase()}</span>
                        </p>
                      </Card>
                    </div>

                    {/* Manufacturing Readiness — PDF §64 */}
                    <Card className="rounded-2xl border-slate-200 p-5">
                      <h3 className="mb-3 text-sm font-semibold text-slate-700">Manufacturing Readiness</h3>
                      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-indigo-600" style={{ width: "100%" }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 sm:grid-cols-3">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Product</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Components</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Variants</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Operations</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cost</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Validation</span>
                      </div>
                    </Card>

                    {/* Recent Changes — PDF §98 */}
                    <Card className="rounded-2xl border-slate-200 p-5">
                      <h3 className="mb-3 text-sm font-semibold text-slate-700">Recent Changes</h3>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <span><strong>05 Oct</strong> — Revision 2 approved by Rahul</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <span><strong>04 Oct</strong> — Leather quantity changed 0.88 → 0.85 m²</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <span><strong>03 Oct</strong> — EVA Sole supplier changed</span>
                        </li>
                      </ul>
                    </Card>
                  </TabsContent>

                  {/* ── COMPONENTS TAB — PDF §48, §92 ── */}
                  <TabsContent value="components" className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          {selectedBom.id} / {currentRev.revision}
                        </span>
                        <span className="text-xs text-slate-500">Base Qty: {selectedBom.baseQty} {selectedBom.baseUom}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="h-9 rounded-xl" onClick={() => exportComponents(selectedBom)}>
                          <Upload className="mr-2 h-4 w-4" /> Export
                        </Button>
                        <Button className="h-9 rounded-xl bg-[#111827] text-white hover:bg-[#1f2937]" onClick={() => beginComponentEdit()}>
                          <Plus className="mr-2 h-4 w-4" /> Add Material
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                            {["Seq", "Material", "Type", "Location", "Net Qty", "UOM", "Method", "Scrap %", "Gross Qty", "Operation", "Cost", ""].map((h, i) => (
                              <TableHead key={h} className={i === 0 ? "pl-4" : ""}>{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentRev.components.map((c) => {
                            const gross = calcGross(c.qty, c.scrapPct);
                            const cost = gross * 300;
                            return (
                              <TableRow key={c.id}>
                                <TableCell className="py-3 pl-4 font-mono text-xs text-slate-500">
                                  {c.seq}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">{c.materialName}</p>
                                    <p className="font-mono text-[10px] text-slate-400">{c.materialId}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="rounded-md bg-slate-100 text-slate-600">
                                    {c.componentType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">{c.location}</TableCell>
                                <TableCell className="text-sm font-medium text-slate-900">
                                  {c.consumptionMethod === "Size Matrix" ? "Matrix" : c.qty}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">{c.uom}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="rounded-md text-[10px]">
                                    {c.consumptionMethod}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">{c.scrapPct}%</TableCell>
                                <TableCell className="text-sm font-medium text-slate-900">{gross}</TableCell>
                                <TableCell className="text-sm text-slate-600">{c.operation}</TableCell>
                                <TableCell className="text-sm font-medium text-slate-900">₹{cost.toFixed(2)}</TableCell>
                                <TableCell>
                                  <button
                                    type="button"
                                    aria-label={`Edit ${c.materialName}`}
                                    onClick={() => beginComponentEdit(c)}
                                    className="rounded-md p-2 hover:bg-slate-100"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-slate-400" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Remove ${c.materialName}`}
                                    onClick={() => deleteComponent(c)}
                                    className="rounded-md p-2 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-600" />
                                  </button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                            <TableCell colSpan={10} className="py-3 pl-4 text-right text-sm font-semibold text-slate-700">
                              Total Material Cost
                            </TableCell>
                            <TableCell className="text-sm font-bold text-slate-900">
                              ₹{currentRev.components.reduce((a, c) => a + calcGross(c.qty, c.scrapPct) * 300, 0).toFixed(2)}
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* ── VARIANTS TAB — PDF §93 ── */}
                  <TabsContent value="variants" className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700">Variant Coverage</h3>
                        <p className="text-xs text-slate-500">
                          {coveredVariantCount} / {variantTotal} variants covered ({variantTotal ? Math.round(coveredVariantCount / variantTotal * 100) : 0}%)
                        </p>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                            <TableHead className="pl-4">SKU</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>BOM Coverage</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBom.applicableColors.flatMap((color) =>
                            selectedBom.applicableSizes.map((size) => (
                              <TableRow key={`${color}-${size}`}>
                                <TableCell className="pl-4 font-mono text-xs text-slate-500">
                                  {selectedBom.productCode}-{color.slice(0, 3).toUpperCase()}-{size.replace("UK", "")}
                                </TableCell>
                                <TableCell className="text-sm text-slate-700">{color}</TableCell>
                                <TableCell className="text-sm text-slate-700">{size}</TableCell>
                                <TableCell>
                                  {currentRev.components.length > 0 && currentRev.components.every((component) =>
                                    component.variantRule === "All Variants" ||
                                    (component.applicableColors.includes(color) && component.applicableSizes.includes(size))
                                  ) ? (
                                    <span className="flex items-center gap-1 text-sm text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Covered</span>
                                  ) : <span className="text-sm text-amber-600">Missing</span>}
                                </TableCell>
                                <TableCell>
                                  <Badge className={statusColor(currentRev.status)}>{currentRev.status}</Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* ── OPERATIONS TAB — PDF §95, §17 ── */}
                  <TabsContent value="operations" className="space-y-4 p-6">
                    <Card className="rounded-2xl border-slate-200 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700">Material Consumption by Operation</h3>
                          <p className="text-xs text-slate-500">BOM ↔ Routing link. Routing remains separate (PDF §32).</p>
                        </div>
                        <Button variant="outline" className="h-9 rounded-xl" onClick={openRoute}>
                          <Eye className="mr-2 h-4 w-4" /> View Route
                        </Button>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                              <TableHead className="pl-4">Operation</TableHead>
                              <TableHead>Work Center</TableHead>
                              <TableHead>Components</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {["Cutting", "Skiving", "Stitching", "Lasting", "Cementing", "Assembly", "Finishing", "QC", "Packing"].map((op) => {
                              const comps = currentRev.components.filter((c) => c.operation === op);
                              if (comps.length === 0) return null;
                              return (
                                <TableRow key={op}>
                                  <TableCell className="pl-4 font-medium text-slate-900">{op}</TableCell>
                                  <TableCell className="text-sm text-slate-600">
                                    {op === "Cutting" ? "Cutting Dept" : op === "Stitching" ? "Stitching Line 1" : op === "Cementing" || op === "Assembly" ? "Assembly" : op === "Packing" ? "Packing" : "—"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {comps.map((c) => (
                                        <Badge key={c.id} variant="secondary" className="rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                                          {c.materialName}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* ── COST TAB — PDF §97 ── */}
                  <TabsContent value="cost" className="space-y-4 p-6">
                    <Card className="rounded-2xl border-slate-200 p-5">
                      <h3 className="mb-4 text-sm font-semibold text-slate-700">BOM Cost Summary</h3>
                      <p className="mb-4 text-xs text-slate-500">Cost Basis: 1 {selectedBom.baseUom}</p>
                      <div className="space-y-2">
                        {currentRev.components.map((c) => {
                          const gross = calcGross(c.qty, c.scrapPct);
                          const cost = gross * 300;
                          return (
                            <div key={c.id} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0">
                              <span className="text-slate-700">{c.materialName}</span>
                              <span className="font-medium text-slate-900">₹{cost.toFixed(2)}</span>
                            </div>
                          );
                        })}
                        <div className="flex items-center justify-between border-t-2 border-slate-200 pt-3 text-base font-semibold">
                          <span className="text-slate-900">Material Cost</span>
                          <span className="text-slate-900">
                            ₹{currentRev.components.reduce((a, c) => a + calcGross(c.qty, c.scrapPct) * 300, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Card>
                    <Card className="rounded-2xl border-slate-200 p-5">
                      <h3 className="mb-3 text-sm font-semibold text-slate-700">Cost Breakdown (Full)</h3>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-slate-600">Material Cost</span><span className="font-medium">₹{currentRev.components.reduce((a, c) => a + calcGross(c.qty, c.scrapPct) * 300, 0).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Labor Cost</span><span className="font-medium">₹85.00</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Machine Cost</span><span className="font-medium">₹30.00</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Factory Overhead</span><span className="font-medium">₹45.00</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">Packaging</span><span className="font-medium">₹25.00</span></div>
                        <div className="flex justify-between border-t-2 border-slate-200 pt-2 text-base font-bold">
                          <span>Manufacturing Cost</span>
                          <span>₹{(currentRev.components.reduce((a, c) => a + calcGross(c.qty, c.scrapPct) * 300, 0) + 185).toFixed(2)}</span>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* ── REVISIONS TAB — PDF §34, §91 ── */}
                  <TabsContent value="revisions" className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">BOM Revisions</h3>
                      <Button className="h-9 rounded-xl bg-[#111827] text-white hover:bg-[#1f2937]" onClick={() => addRevision(selectedBom)}>
                        <Plus className="mr-2 h-4 w-4" /> Create Revision
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                            <TableHead className="pl-4">Revision</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Effective From</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBom.revisions.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="pl-4 font-mono text-sm font-medium text-slate-900">{r.revision}</TableCell>
                              <TableCell><Badge className={statusColor(r.status)}>{r.status}</Badge></TableCell>
                              <TableCell className="text-sm text-slate-600">{r.effectiveFrom}</TableCell>
                              <TableCell className="text-sm text-slate-600">{r.createdBy}</TableCell>
                              <TableCell className="text-sm text-slate-600">{r.createdDate}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 rounded-lg text-xs"
                                  onClick={() => {
                                    const other = selectedBom.revisions.find((revision) => revision.id !== r.id);
                                    if (!other) {
                                      setNotice("At least two revisions are needed to compare.");
                                      return;
                                    }
                                    setCompareRevisions([other.id, r.id]);
                                    setCompareOpen(true);
                                  }}
                                >
                                  <GitCompare className="mr-1 h-3.5 w-3.5" /> Compare
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* ── AUDIT TAB — PDF §98 ── */}
                  <TabsContent value="audit" className="space-y-4 p-6">
                    <h3 className="text-sm font-semibold text-slate-700">BOM History</h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                            <TableHead className="pl-4">Date</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(selectedBom.audit?.length ? selectedBom.audit : [
                            { date: "05 Oct 2026", user: "Rahul", action: "Approved", details: "Rev 2 approved" },
                            { date: "04 Oct 2026", user: "Amit", action: "Updated component", details: "Leather 0.88 → 0.85 m²" },
                            { date: "04 Oct 2026", user: "Amit", action: "Updated component", details: "EVA supplier changed" },
                            { date: "03 Oct 2026", user: "Amit", action: "Created revision", details: "Rev 2 created" },
                            { date: "01 Oct 2026", user: "Rahul", action: "Approved", details: "Rev 1 approved" },
                            { date: "28 Sep 2026", user: "Amit", action: "Created BOM", details: "Rev 1" },
                          ]).map((h, i) => (
                            <TableRow key={i}>
                              <TableCell className="pl-4 text-sm text-slate-600">{h.date}</TableCell>
                              <TableCell className="text-sm text-slate-700">{h.user}</TableCell>
                              <TableCell className="text-sm text-slate-700">{h.action}</TableCell>
                              <TableCell className="text-sm text-slate-600">{h.details}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      <Sheet open={routeOpen} onOpenChange={setRouteOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans sm:max-w-2xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle>Material Routing</SheetTitle>
            <SheetDescription>{selectedBom ? `${selectedBom.productCode} · Current revision operations` : "Operations linked to this BOM."}</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {selectedBom && (() => {
              const revision = selectedBom.revisions.find((item) => item.revision === selectedBom.currentRevision);
              const workCenters: Record<Operation, string> = {
                Cutting: "Cutting Department", Skiving: "Skiving Department", Stitching: "Stitching Line 1",
                Lasting: "Lasting Department", Cementing: "Assembly", Assembly: "Assembly",
                Finishing: "Finishing Department", QC: "Quality Control", Packing: "Packing Department",
              };
              const routeOperations: Operation[] = ["Cutting", "Skiving", "Stitching", "Lasting", "Cementing", "Assembly", "Finishing", "QC", "Packing"];
              return (
                <div className="space-y-3">
                  {routeOperations.map((operation, index) => {
                    const linkedMaterials = revision?.components.filter((component) => component.operation === operation) ?? [];
                    if (linkedMaterials.length === 0) return null;
                    return (
                      <Card key={operation} className="rounded-xl border-slate-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">{index + 1}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-semibold text-slate-900">{operation}</p>
                              <span className="text-xs text-slate-500">{workCenters[operation]}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {linkedMaterials.map((component) => <Badge key={component.id} variant="secondary">{component.materialName}</Badge>)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                  {!revision?.components.length && <p className="py-10 text-center text-sm text-slate-500">Add materials with operations to see the linked route.</p>}
                </div>
              );
            })()}
          </div>
        </SheetContent>
      </Sheet>

      {/* ─────────────────────────────────────────────────────────────────────
          CREATE BOM WIZARD — PDF §44-45, §71-74
          ───────────────────────────────────────────────────────────────────── */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans !max-w-3xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle className="text-xl font-bold">Create BOM</SheetTitle>
            <SheetDescription>Select product → Define BOM → Components → Variants → Review → Save</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <CreateBomWizard
              key={String(createOpen)}
              boms={boms}
              onCancel={() => setCreateOpen(false)}
              onSave={(savedBom) => {
                setBoms((current) => current.some((bom) => bom.id === savedBom.id)
                  ? current.map((bom) => bom.id === savedBom.id ? savedBom : bom)
                  : [savedBom, ...current]);
                setNotice(`${savedBom.id} ${savedBom.currentRevision} saved.`);
                setCreateOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ─────────────────────────────────────────────────────────────────────
          REVISION COMPARISON — PDF §75, §29
          ───────────────────────────────────────────────────────────────────── */}
      <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans !max-w-3xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle className="text-xl font-bold">Compare Revisions</SheetTitle>
            <SheetDescription>
              {selectedBom ? `${selectedBom.id} — ${selectedBom.productName}` : "Select two revisions to compare."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {selectedBom && (() => {
              const left = selectedBom.revisions.find((revision) => revision.id === compareRevisions[0]);
              const right = selectedBom.revisions.find((revision) => revision.id === compareRevisions[1]);
              const componentIds = new Set([...(left?.components ?? []), ...(right?.components ?? [])].map((component) => component.materialId));
              const getComponent = (revision: BomRevision | undefined, id: string) => revision?.components.find((component) => component.materialId === id);
              const cost = (revision: BomRevision | undefined) => revision?.components.reduce((total, component) => total + calcGross(component.qty, component.scrapPct) * 300, 0) ?? 0;
              return (
                <>
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    {[0, 1].map((column) => (
                      <Select
                        key={column}
                        value={compareRevisions[column]}
                        onValueChange={(value) => setCompareRevisions((current) => {
                          const next: [string, string] = [...current];
                          next[column] = value;
                          return next;
                        })}
                      >
                        <SelectTrigger className={`${inp} w-full`}><SelectValue placeholder={`Choose revision ${column + 1}`} /></SelectTrigger>
                        <SelectContent>
                          {selectedBom.revisions.map((revision) => (
                            <SelectItem
                              key={revision.id}
                              value={revision.id}
                              disabled={revision.id === compareRevisions[column === 0 ? 1 : 0]}
                            >
                              {revision.revision} · {revision.status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                  {compareRevisions[0] && compareRevisions[0] === compareRevisions[1] && (
                    <p role="status" className="mb-3 text-sm text-amber-700">Choose two different revisions to compare.</p>
                  )}
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                          <TableHead className="pl-4">Material</TableHead>
                          <TableHead>{left?.revision ?? "Revision 1"}</TableHead>
                          <TableHead>{right?.revision ?? "Revision 2"}</TableHead>
                          <TableHead>Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...componentIds].map((id) => {
                          const a = getComponent(left, id);
                          const b = getComponent(right, id);
                          const aValue = a ? `${a.qty} ${a.uom} · ${a.scrapPct}% scrap` : "Not included";
                          const bValue = b ? `${b.qty} ${b.uom} · ${b.scrapPct}% scrap` : "Not included";
                          const changed = aValue !== bValue;
                          return (
                            <TableRow key={id}>
                              <TableCell className="pl-4 font-medium text-slate-900">{b?.materialName ?? a?.materialName ?? id}</TableCell>
                              <TableCell className="text-sm text-slate-600">{aValue}</TableCell>
                              <TableCell className="text-sm text-slate-600">{bValue}</TableCell>
                              <TableCell className={`text-sm ${changed ? "font-medium text-amber-700" : "text-slate-400"}`}>{changed ? "Changed" : "—"}</TableCell>
                            </TableRow>
                          );
                        })}
                        {componentIds.size === 0 && (
                          <TableRow><TableCell colSpan={4} className="py-8 text-center text-slate-500">No materials to compare.</TableCell></TableRow>
                        )}
                        <TableRow className="bg-slate-50/70">
                          <TableCell className="pl-4 font-semibold text-slate-900">Material Cost</TableCell>
                          <TableCell className="text-sm text-slate-600">₹{cost(left).toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-slate-600">₹{cost(right).toFixed(2)}</TableCell>
                          <TableCell className="text-sm font-medium">{left && right ? `₹${(cost(right) - cost(left)).toFixed(2)}` : "—"}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  {(right?.changeReason || left?.changeReason) && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      <strong>Change Reason:</strong> {right?.changeReason ?? left?.changeReason}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={componentEditorOpen} onOpenChange={setComponentEditorOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 font-sans sm:max-w-xl">
          <SheetHeader className="border-b border-slate-100 p-6">
            <SheetTitle>{editingComponent ? "Edit Material" : "Add Material"}</SheetTitle>
            <SheetDescription>Update component details for the current BOM revision.</SheetDescription>
          </SheetHeader>
          {selectedBom && (
            <ComponentEditor
              key={`${componentEditorOpen}-${editingComponent?.id ?? "new"}`}
              component={editingComponent}
              nextSeq={Math.max(0, ...selectedBom.revisions.find((revision) => revision.revision === selectedBom.currentRevision)?.components.map((component) => component.seq) ?? []) + 10}
              colors={selectedBom.applicableColors}
              sizes={selectedBom.applicableSizes}
              onCancel={() => setComponentEditorOpen(false)}
              onSave={(component) => {
                const target = selectedBom.revisions.find((revision) => revision.revision === selectedBom.currentRevision);
                if (!target) {
                  setNotice("The selected revision could not be found.");
                  return;
                }
                const components = editingComponent
                  ? target.components.map((item) => item.id === editingComponent.id ? component : item)
                  : [...target.components, component].sort((a, b) => a.seq - b.seq);
                const updated = recordAudit({
                  ...selectedBom,
                  revisions: selectedBom.revisions.map((revision) => revision.id === target.id ? { ...revision, components } : revision),
                }, editingComponent ? "Updated component" : "Added component", component.materialName);
                updateBom(updated);
                setComponentEditorOpen(false);
                setNotice(`${component.materialName} ${editingComponent ? "updated" : "added"}.`);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE BOM WIZARD — PDF §44-45
// ─────────────────────────────────────────────────────────────────────────────

function CreateBomWizard({
  boms, onCancel, onSave,
}: {
  boms: BomHeader[];
  onCancel: () => void;
  onSave: (bom: BomHeader) => void;
}) {
  const [step, setStep] = useState(1);
  const [productCode, setProductCode] = useState("");
  const [bomType, setBomType] = useState<BomHeader["bomType"]>("Manufacturing BOM");
  const [plant, setPlant] = useState("Delhi Factory");
  const [baseQty, setBaseQty] = useState(1);
  const [baseUom, setBaseUom] = useState("Pair");
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState<"separate" | "revision">("separate");
  const [revisionSourceId, setRevisionSourceId] = useState("");
  const [components, setComponents] = useState<BomComponent[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const matchingBoms = boms.filter((bom) => bom.productCode === productCode);
  const existingBom = matchingBoms.find((bom) => bom.id === revisionSourceId) ?? matchingBoms[0];
  const sourceBom = boms.find((bom) => bom.id === revisionSourceId) ?? existingBom;
  const productOptions = [
    { code: "MC-2401", name: "Men's Casual Leather Shoe", meta: "Casual Shoe · Men · 10 SKUs" },
    { code: "WS-1102", name: "Women's Sandal", meta: "Sandal · Women · 10 SKUs" },
    { code: "SS-4501", name: "Safety Shoe", meta: "Safety Shoe · Men · 6 SKUs" },
  ];
  const colorOptions = productCode === "WS-1102" ? ["Tan", "Black", "Brown"] : ["Black", "Brown"];
  const sizeOptions = productCode === "WS-1102" ? ["UK3", "UK4", "UK5", "UK6", "UK7"] : ["UK6", "UK7", "UK8", "UK9", "UK10", "UK11"];

  const selectProduct = (code: string) => {
    setProductCode(code);
    setMode("separate");
    setRevisionSourceId("");
    setComponents([]);
    setColors(code === "WS-1102" ? ["Tan"] : ["Black", "Brown"]);
    setSizes(code === "WS-1102" ? ["UK3", "UK4", "UK5", "UK6", "UK7"] : ["UK6", "UK7", "UK8", "UK9", "UK10"]);
  };

  const selectMode = (nextMode: "separate" | "revision", bom = existingBom) => {
    setMode(nextMode);
    if (nextMode === "revision" && bom) {
      setRevisionSourceId(bom.id);
      const revision = bom.revisions.find((item) => item.revision === bom.currentRevision) ?? bom.revisions[0];
      setComponents(revision?.components.map((component) => ({ ...component })) ?? []);
      setColors([...bom.applicableColors]);
      setSizes([...bom.applicableSizes]);
      setBomType(bom.bomType);
      setPlant(bom.plant);
      setBaseQty(bom.baseQty);
      setBaseUom(bom.baseUom);
    } else {
      setRevisionSourceId("");
      setComponents([]);
    }
  };

  const toggleValue = (values: string[], setValues: (next: string[]) => void, value: string) => {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const save = (status: "Draft" | "Under Review") => {
    if (!productCode || baseQty <= 0 || !effectiveFrom || components.length === 0 || colors.length === 0 || sizes.length === 0) return;
    const selectedProduct = productOptions.find((product) => product.code === productCode);
    const today = new Date().toISOString().slice(0, 10);
    const revisionName = sourceBom && mode === "revision" ? nextRevision(sourceBom.revisions) : "Rev 01";
    const revision: BomRevision = {
      id: `R-${revisionName.replace(/\D/g, "")}`,
      revision: revisionName,
      status,
      effectiveFrom,
      createdBy: "Current User",
      createdDate: today,
      changeReason: mode === "revision" ? "New revision" : undefined,
      components: components.map((component) => ({
        ...component,
        applicableColors: [...colors],
        applicableSizes: [...sizes],
        variantRule: colors.length < colorOptions.length || sizes.length < sizeOptions.length ? "Selected Variants" : "All Variants",
      })),
    };
    if (sourceBom && mode === "revision") {
      onSave({
        ...sourceBom,
        bomType, plant, baseQty, baseUom,
        applicableColors: colors,
        applicableSizes: sizes,
        currentRevision: revisionName,
        revisions: [revision, ...sourceBom.revisions],
        audit: [
          { date: today, user: "Current User", action: "Created revision", details: `${revisionName} created as ${status}` },
          ...(sourceBom.audit ?? []),
        ],
      });
      return;
    }
    const newBom: BomHeader = {
      id: nextBomId(productCode, boms),
      productId: productCode,
      productCode,
      productName: selectedProduct?.name ?? productCode,
      bomType, plant, baseQty, baseUom,
      applicableColors: colors,
      applicableSizes: sizes,
      currentRevision: revisionName,
      revisions: [revision],
      audit: [{ date: today, user: "Current User", action: "Created BOM", details: `${revisionName} saved as ${status}` }],
    };
    onSave(newBom);
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        {["Product", "Components", "Variants", "Review", "Save"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
              step > i ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
            }`}>
              {step > i ? "✓" : i + 1}
            </div>
            <span className={step === i + 1 ? "font-semibold text-slate-900" : "text-slate-500"}>{s}</span>
            {i < 4 && <ChevronRight className="h-3 w-3 text-slate-300" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Select Product</h3>
            <p className="text-xs text-slate-500">Choose the product/style this BOM will manufacture.</p>
          </div>
          <div className="space-y-2">
            {productOptions.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => selectProduct(p.code)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  productCode === p.code ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#111827] text-xs font-semibold text-white">
                  {initials(p.name)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{p.code}</p>
                  <p className="text-sm text-slate-600">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.meta}</p>
                </div>
                {productCode === p.code && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
              </button>
            ))}
          </div>

          {existingBom && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">Existing BOM found</p>
                  <p className="text-xs text-amber-800">
                    {productCode} already has {matchingBoms.length} BOM{matchingBoms.length === 1 ? "" : "s"}. Create a revision or a separate BOM?
                  </p>
                  {matchingBoms.length > 1 && (
                    <div className="mt-2 max-w-sm">
                      <Field label="BOM for new revision">
                        <Select value={existingBom.id} onValueChange={(id) => setRevisionSourceId(id)}>
                          <SelectTrigger className={`${inp} w-full bg-white`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {matchingBoms.map((bom) => <SelectItem key={bom.id} value={bom.id}>{bom.id} · {bom.plant}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button type="button" size="sm" variant={mode === "revision" ? "default" : "outline"} className="h-8 rounded-lg text-xs" onClick={() => selectMode("revision", existingBom)}>Create New Revision</Button>
                    <Button type="button" size="sm" variant={mode === "separate" ? "default" : "ghost"} className="h-8 rounded-lg text-xs" onClick={() => selectMode("separate")}>Create Separate BOM</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="BOM Type">
              <Select value={bomType} onValueChange={(v) => setBomType(v as BomHeader["bomType"])}>
                <SelectTrigger className={`${inp} w-full`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Manufacturing BOM", "Sample BOM", "Costing BOM", "Engineering BOM", "Packaging BOM"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Plant">
              <Select value={plant} onValueChange={setPlant}>
                <SelectTrigger className={`${inp} w-full`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Delhi Factory", "Mumbai Factory", "Chennai Factory"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Base Quantity">
              <Input type="number" className={inp} value={baseQty} onChange={(e) => setBaseQty(+e.target.value)} />
            </Field>
            <Field label="Base UOM">
              <Select value={baseUom} onValueChange={setBaseUom}>
                <SelectTrigger className={`${inp} w-full`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Pair", "Pcs", "Set"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Effective From">
              <Input type="date" className={inp} value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {step > 1 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              {step === 2 && "Select the materials that belong in this BOM. You can adjust quantities and operations after creating the draft."}
              {step === 3 && "Choose the colors and sizes covered by this BOM."}
              {step === 4 && "Review the BOM header, components, and selected variants."}
              {step === 5 && "Save step — save as draft or submit for review."}
            </p>
          </div>
          {step === 2 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Available materials</p>
              {seedComponents.map((component) => {
                const selected = components.some((item) => item.materialId === component.materialId);
                return (
                  <label key={component.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => setComponents((current) => selected
                        ? current.filter((item) => item.materialId !== component.materialId)
                        : [...current, { ...component, id: `C-${String(current.length + 1).padStart(2, "0")}`, seq: (current.length + 1) * 10 }])}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900">{component.materialName}</span>
                      <span className="block text-xs text-slate-500">{component.materialId} · {component.qty} {component.uom} · {component.operation}</span>
                    </span>
                    {selected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </label>
                );
              })}
              <p className="text-xs text-slate-500">{components.length} material(s) selected.</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Colors</p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button key={color} type="button" aria-pressed={colors.includes(color)} onClick={() => toggleValue(colors, setColors, color)} className={`rounded-full border px-3 py-1.5 text-sm ${colors.includes(color) ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}>
                      {colors.includes(color) ? "✓ " : ""}{color}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button key={size} type="button" aria-pressed={sizes.includes(size)} onClick={() => toggleValue(sizes, setSizes, size)} className={`rounded-lg border px-3 py-1.5 text-sm ${sizes.includes(size) ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}>
                      {sizes.includes(size) ? "✓ " : ""}{size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <Card className="space-y-3 rounded-xl border-slate-200 p-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Product</span><strong>{productCode}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">BOM Type / Plant</span><strong>{bomType} · {plant}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Base quantity</span><strong>{baseQty} {baseUom}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Effective from</span><strong>{effectiveFrom}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Materials</span><strong>{components.length}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Variants</span><strong>{colors.length} colors × {sizes.length} sizes</strong></div>
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-2 text-slate-500">Selected materials</p>
                <ul className="space-y-1">{components.map((component) => <li key={component.id} className="text-slate-700">{component.materialName} · {component.qty} {component.uom}</li>)}</ul>
              </div>
            </Card>
          )}
          {step === 5 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="mt-3 text-base font-semibold text-emerald-900">Ready to Save</p>
              <p className="text-sm text-emerald-700">
                {sourceBom && mode === "revision" ? sourceBom.id : nextBomId(productCode, boms)} · {sourceBom && mode === "revision" ? nextRevision(sourceBom.revisions) : "Rev 01"}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between border-t border-slate-100 pt-4">
        <Button variant="ghost" onClick={onCancel} className="h-11 rounded-xl">Cancel</Button>
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="h-11 rounded-xl">
              Back
            </Button>
          )}
          {step < 5 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && (!productCode || baseQty <= 0 || !effectiveFrom)) ||
                (step === 2 && components.length === 0) ||
                (step === 3 && (colors.length === 0 || sizes.length === 0))
              }
              className="h-11 rounded-xl bg-[#111827] text-white hover:bg-[#1f2937]"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => save("Under Review")} className="h-11 rounded-xl">Submit for Review</Button>
              <Button onClick={() => save("Draft")} className="h-11 rounded-xl bg-[#111827] text-white hover:bg-[#1f2937]">Save Draft</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ComponentEditor({
  component, nextSeq, colors, sizes, onCancel, onSave,
}: {
  component: BomComponent | null;
  nextSeq: number;
  colors: string[];
  sizes: string[];
  onCancel: () => void;
  onSave: (component: BomComponent) => void;
}) {
  const [draft, setDraft] = useState<BomComponent>(() => component ?? {
    id: `C-${String(nextSeq / 10).padStart(2, "0")}`,
    seq: nextSeq,
    materialId: "",
    materialName: "",
    componentType: "Direct Material",
    category: "Other",
    location: "Not Applicable",
    side: "N/A",
    qty: 1,
    uom: "pcs",
    consumptionMethod: "Fixed",
    scrapPct: 0,
    operation: "Cutting",
    applicableColors: colors,
    applicableSizes: sizes,
    alternatives: [],
    variantRule: "All Variants",
  });
  const update = <K extends keyof BomComponent>(key: K, value: BomComponent[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const categories: ComponentCategory[] = ["Upper", "Lining", "Bottom", "Insole", "Hardware", "Lace", "Thread", "Adhesive", "Branding", "Finishing", "Packaging", "Consumable", "Other"];
  const locations: ComponentLocation[] = ["Vamp", "Quarter", "Tongue", "Collar", "Upper", "Lining", "Footbed", "Bottom", "Sole", "Heel", "Toe", "Packing", "Not Applicable"];
  const operations: Operation[] = ["Cutting", "Skiving", "Stitching", "Lasting", "Cementing", "Assembly", "Finishing", "QC", "Packing"];

  return (
    <form
      className="flex flex-1 flex-col overflow-y-auto"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <div className="grid flex-1 content-start gap-4 overflow-y-auto p-6 sm:grid-cols-2">
        <Field label="Material ID"><Input required value={draft.materialId} onChange={(event) => update("materialId", event.target.value)} className={inp} placeholder="MAT-001" /></Field>
        <Field label="Material Name"><Input required value={draft.materialName} onChange={(event) => update("materialName", event.target.value)} className={inp} placeholder="Material description" /></Field>
        <Field label="Component Type">
          <Select value={draft.componentType} onValueChange={(value) => update("componentType", value as ComponentType)}>
            <SelectTrigger className={`${inp} w-full`}><SelectValue /></SelectTrigger>
            <SelectContent>{["Direct Material", "Component", "Consumable", "Packaging", "Subassembly"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Category">
          <Select value={draft.category} onValueChange={(value) => update("category", value as ComponentCategory)}>
            <SelectTrigger className={`${inp} w-full`}><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Location">
          <Select value={draft.location} onValueChange={(value) => update("location", value as ComponentLocation)}>
            <SelectTrigger className={`${inp} w-full`}><SelectValue /></SelectTrigger>
            <SelectContent>{locations.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Operation">
          <Select value={draft.operation} onValueChange={(value) => update("operation", value as Operation)}>
            <SelectTrigger className={`${inp} w-full`}><SelectValue /></SelectTrigger>
            <SelectContent>{operations.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Net Quantity"><Input required min="0.001" step="any" type="number" value={draft.qty} onChange={(event) => update("qty", Number(event.target.value))} className={inp} /></Field>
        <Field label="Unit of Measure"><Input required value={draft.uom} onChange={(event) => update("uom", event.target.value)} className={inp} /></Field>
        <Field label="Scrap %"><Input required min="0" max="100" step="any" type="number" value={draft.scrapPct} onChange={(event) => update("scrapPct", Number(event.target.value))} className={inp} /></Field>
        <Field label="Notes"><Textarea value={draft.notes ?? ""} onChange={(event) => update("notes", event.target.value)} className="min-h-11 rounded-xl" /></Field>
      </div>
      <SheetFooter className="border-t border-slate-100 p-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!draft.materialId.trim() || !draft.materialName.trim() || draft.qty <= 0 || draft.scrapPct < 0 || draft.scrapPct > 100}>Save Material</Button>
      </SheetFooter>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD HELPER
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  );
}