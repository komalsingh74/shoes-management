import { Workbench } from "@/components/production/Workbench";


export default function BottomPrepPage() {
  return (
    <Workbench
      title="Bottom Preparation Workbench"
      description="Prepare soles, insoles and shanks so they are ready for lasting."
      kpis={[{ label: "Soles prepared", value: "740", sub: "target 900" },{ label: "Active jobs", value: "2" },{ label: "Rejects", value: "1.2%", tone: "green" },{ label: "Awaiting insoles", value: "1", tone: "red" }]}
      jobs={[{ id: "PO-114", article: "Oxford Classic – Tan", qty: 2400, done: 980, due: "22 Oct", status: "In Progress" },{ id: "PO-109", article: "Derby Formal – Black", qty: 1800, done: 1500, due: "18 Oct", status: "Delayed" },{ id: "PO-121", article: "Loafer Suede – Brown", qty: 1200, done: 0, due: "29 Oct", status: "Planned" }]}
      steps={["Check sole & insole sizes","Buff & roughen sole surface","Apply primer","Attach insole & shank","Match pairs & stack"]}
      metricLabel="Soles prepared"
      rejectLabel="Rejects"
    />
  )
}