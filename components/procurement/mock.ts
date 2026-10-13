export type POStatus = "Draft" | "Pending approval" | "Approved" | "Sent" | "Partially received" | "Completed" | "Cancelled";

export interface Material {
  code: string;
  name: string;
  uom: string;
  gst: number;
  rate: number;
  stock?: number;
}

export interface SupplierOption {
  code: string;
  name: string;
  state: string;
  active: boolean;
  terms: string;
}

export interface POLine {
  code: string;
  qty: number;
  price: number;
  discPct: number;
  received: number;
  accepted: number;
  rejected: number;
  quarantined: number;
  needDate: string;
}

export interface PurchaseOrder {
  no: string;
  date: string;
  supplier: string;
  status: POStatus;
  terms: string;
  warehouse: string;
  buyer: string;
  freight: number;
  lines: POLine[];
  nextDelivery: string;
}

export const BUYER_STATE = "Uttar Pradesh";

export const MATERIALS: Material[] = [
  { code: "RM-LTH-BLK", name: "Leather — Black", uom: "sqm", gst: 5, rate: 95 },
  { code: "RM-SOL-BLK", name: "Rubber sole — Black", uom: "pair", gst: 12, rate: 120 },
  { code: "RM-LIN-FAB", name: "Lining fabric", uom: "mtr", gst: 5, rate: 61 },
  { code: "RM-PKG-INS", name: "Packaging insert", uom: "pcs", gst: 18, rate: 3 },
  { code: "RM-ADH-PU", name: "PU adhesive", uom: "ltr", gst: 18, rate: 250 },
  { code: "RM-INS-EVA", name: "EVA insole", uom: "pair", gst: 12, rate: 18 },
];

export const SUPPLIER_OPTIONS: SupplierOption[] = [
  { code: "SUP-0001", name: "Best Soles Ltd.", state: "Uttar Pradesh", active: true, terms: "15 days" },
  { code: "SUP-0002", name: "Agra Leather Works", state: "Uttar Pradesh", active: true, terms: "30 days" },
  { code: "SUP-0003", name: "Kanpur Rubber Co.", state: "Uttar Pradesh", active: true, terms: "30 days" },
  { code: "SUP-0004", name: "Chennai Foam Industries", state: "Tamil Nadu", active: false, terms: "45 days" },
  { code: "SUP-0005", name: "Mumbai Pack & Print", state: "Maharashtra", active: true, terms: "30 days" },
  { code: "SUP-0006", name: "Old Town Adhesives", state: "Uttar Pradesh", active: false, terms: "Advance" },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    no: "PO-2026-00060",
    date: "2026-09-20",
    supplier: "SUP-0001",
    status: "Completed",
    terms: "15 days",
    warehouse: "Main Warehouse",
    buyer: "A. Mehta",
    freight: 1200,
    nextDelivery: "2026-09-27",
    lines: [{ code: "RM-SOL-BLK", qty: 2000, price: 120, discPct: 0, received: 2000, accepted: 2000, rejected: 0, quarantined: 0, needDate: "2026-09-27" }],
  },
  {
    no: "PO-2026-00074",
    date: "2026-10-07",
    supplier: "SUP-0003",
    status: "Approved",
    terms: "30 days",
    warehouse: "Main Warehouse",
    buyer: "A. Mehta",
    freight: 4000,
    nextDelivery: "2026-10-16",
    lines: [{ code: "RM-SOL-BLK", qty: 2000, price: 120, discPct: 0, received: 0, accepted: 0, rejected: 0, quarantined: 0, needDate: "2026-10-16" }],
  },
  {
    no: "PO-2026-00076",
    date: "2026-10-09",
    supplier: "SUP-0002",
    status: "Partially received",
    terms: "30 days",
    warehouse: "Main Warehouse",
    buyer: "A. Mehta",
    freight: 2500,
    nextDelivery: "2026-10-18",
    lines: [{ code: "RM-LTH-BLK", qty: 2050, price: 95, discPct: 0, received: 2000, accepted: 1950, rejected: 30, quarantined: 20, needDate: "2026-10-18" }],
  },
  {
    no: "PO-2026-00069",
    date: "2026-10-03",
    supplier: "SUP-0005",
    status: "Sent",
    terms: "30 days",
    warehouse: "Packing Store",
    buyer: "A. Mehta",
    freight: 850,
    nextDelivery: "2026-10-21",
    lines: [{ code: "RM-PKG-INS", qty: 5000, price: 3, discPct: 0, received: 0, accepted: 0, rejected: 0, quarantined: 0, needDate: "2026-10-21" }],
  },
];

export function materialByCode(code: string) {
  return MATERIALS.find((m) => m.code === code);
}

export function supplierByCode(code: string) {
  return SUPPLIER_OPTIONS.find((s) => s.code === code);
}

export function lineNet(line: POLine) {
  const gross = line.qty * line.price;
  const disc = gross * (line.discPct / 100);
  return gross - disc;
}

export function poValue(po: PurchaseOrder) {
  const subtotal = po.lines.reduce((sum, l) => sum + lineNet(l), 0);
  const tax = po.lines.reduce((sum, l) => {
    const m = materialByCode(l.code);
    return sum + lineNet(l) * ((m?.gst ?? 0) / 100);
  }, 0);
  return Math.round(subtotal + tax + po.freight);
}
