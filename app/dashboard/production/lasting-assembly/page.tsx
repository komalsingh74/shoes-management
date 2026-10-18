import { Workbench } from "@/components/production/Workbench";

export default function LastingPage() {
  return (
    <Workbench
      title="09. Lasting & Assembly"
      description="Last the upper, attach the sole, press and cure to finish the shoe."
      kpis={[{ label: "Pairs lasted today", value: "610", sub: "target 800" },{ label: "In press / curing", value: "240" },{ label: "Sole-off defects", value: "0.8%", tone: "green" },{ label: "Delayed jobs", value: "1", tone: "red" }]}
      jobs={[{ id: "PO-109", article: "Derby Formal – Black", qty: 1800, done: 1100, due: "18 Oct", status: "Delayed" },{ id: "PO-114", article: "Oxford Classic – Tan", qty: 2400, done: 420, due: "23 Oct", status: "In Progress" },{ id: "PO-102", article: "Sneaker Court – White", qty: 3000, done: 3000, due: "10 Oct", status: "Completed" }]}
      steps={["Fit upper on last","Toe & heel lasting","Apply cement to upper & sole","Attach sole & press","Cure, remove last & inspect"]}
      metricLabel="Pairs lasted"
      rejectLabel="Rejects"
    />
  )
}