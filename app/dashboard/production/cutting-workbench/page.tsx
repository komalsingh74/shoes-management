import { Workbench } from "@/components/production/Workbench";


export default function CuttingPage() {
  return (
    <Workbench
      title="Cutting Workbench"
      description="Cut leather, lining and synthetic parts from issued material using approved dies."
      kpis={[{ label: "Pairs cut today", value: "1,120", sub: "target 1,400" },{ label: "Active jobs", value: "3" },{ label: "Wastage", value: "6.4%", sub: "limit 8%", tone: "green" },{ label: "Waiting for material", value: "1", tone: "red" }]}
      jobs={[{ id: "PO-114", article: "Oxford Classic – Tan", qty: 2400, done: 1320, due: "20 Oct", status: "In Progress" },{ id: "PO-109", article: "Derby Formal – Black", qty: 1800, done: 1800, due: "16 Oct", status: "Completed" },{ id: "PO-121", article: "Loafer Suede – Brown", qty: 1200, done: 0, due: "28 Oct", status: "Planned" }]}
      steps={["Verify issued material & grade","Fit die and set cutting press","Cut upper parts","Cut lining & reinforcements","Count & bundle by size"]}
      metricLabel="Pairs cut"
      rejectLabel="Wastage (m²)"
    />
  )
}