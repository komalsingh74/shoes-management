"use client"

import { useMemo, useSyncExternalStore } from "react"
import { initialOrders, type ProductionOrder } from "./order-data"

const STORAGE_KEY = "shoeflow-production-orders-v1"
const CHANGE_EVENT = "production-orders-changed"
const emptySnapshot = () => "[]"

function snapshot() {
  try { return localStorage.getItem(STORAGE_KEY) || "[]" } catch { return "[]" }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

function readOrders(value: string): ProductionOrder[] {
  try {
    const rows = JSON.parse(value)
    return Array.isArray(rows) ? rows.filter((row) => row && typeof row.id === "string" && typeof row.art === "string" && typeof row.cust === "string" && Number.isFinite(row.qty) && typeof row.due === "string" && Number.isFinite(row.pct) && typeof row.s === "string") : []
  } catch { return [] }
}

export function useProductionOrders() {
  const value = useSyncExternalStore(subscribe, snapshot, emptySnapshot)
  const orders = useMemo(() => [...readOrders(value), ...initialOrders], [value])

  function createOrder(order: ProductionOrder) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...readOrders(snapshot())]))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return { orders, createOrder }
}
