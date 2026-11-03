export type ProductionOrder = {
  id: string; art: string; cust: string; qty: number; due: string; pct: number; s: string;
  plannedStart?: string; targetDate?: string; priority?: string; notes?: string; sizeRun?: Record<number, number>
}


export const initialOrders: ProductionOrder[] = [
  { id: "PO-2026-121", art: "Loafer Suede – Brown", cust: "Metro Footwear", qty: 1200, due: "28 Oct 2026", pct: 22, s: "Planned" },
  { id: "PO-2026-114", art: "Oxford Classic – Tan", cust: "Bata Retail", qty: 2400, due: "20 Oct 2026", pct: 58, s: "In Progress" },
  { id: "PO-2026-109", art: "Derby Formal – Black", cust: "Walkway Stores", qty: 1800, due: "16 Oct 2026", pct: 71, s: "Delayed" },
  { id: "PO-2026-102", art: "Sneaker Court – White", cust: "Urban Steps", qty: 3000, due: "10 Oct 2026", pct: 100, s: "Completed" },
]
