import { Workbench } from "@/components/production/Workbench";

export default function StitchingPage() {
  return (
    <Workbench
      title="Stitching / Fitting Workbench"
      description="Close uppers, attach lining and fit components bundle by bundle."
      kpis={[{ label: "Pairs stitched today", value: "860", sub: "target 1,000" },{ label: "Operators on floor", value: "42" },{ label: "Defect rate", value: "2.1%", sub: "limit 3%", tone: "green" },{ label: "Rework bundles", value: "4", tone: "red" }]}
      jobs={[{ id: "PO-109", article: "Derby Formal – Black", qty: 1800, done: 1260, due: "17 Oct", status: "Delayed" },{ id: "PO-114", article: "Oxford Classic – Tan", qty: 2400, done: 640, due: "21 Oct", status: "In Progress" },{ id: "PO-125", article: "Boot Chelsea – Black", qty: 900, done: 0, due: "30 Oct", status: "Planned" }]}
      steps={["Receive cut bundles & match sizes","Skive & fold edges","Stitch upper & lining","Attach eyelets / fittings","Inspect & tag bundle"]}
      metricLabel="Pairs stitched"
      rejectLabel="Defects"
    />
  )
}