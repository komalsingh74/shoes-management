"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ClipboardList, FilePlus2, LayoutDashboard } from "lucide-react"
import { PageHeader } from "@/components/production/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductionOverview from "@/components/production/production-overview"
import ProductionOrders from "@/components/production/production-orders"
import CreateProductionOrder from "@/components/production/create-production-order"

export default function ProductionManagement({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  const [createdId, setCreatedId] = useState("")

  return (
    <div className="space-y-2">
      <PageHeader title="Production Management" description="Monitor production progress, track orders and plan new production in one place." />
      {createdId && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">Production order {createdId} created successfully.</p>}
      <Tabs value={activeTab} onValueChange={(tab) => router.push(`/dashboard/production/production-management?tab=${tab}`, { scroll: false })} className="gap-2">
        <TabsList aria-label="Production management sections" className="w-full sm:w-fit group-data-horizontal/tabs:h-12">
          <TabsTrigger value="overview" className="px-3 sm:px-5"><LayoutDashboard />Overview</TabsTrigger>
          <TabsTrigger value="orders" className="px-3 sm:px-5"><ClipboardList />Orders</TabsTrigger>
          <TabsTrigger value="create" className="px-3 sm:px-5"><FilePlus2 />Create Order</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><ProductionOverview /></TabsContent>
        <TabsContent value="orders" forceMount className="data-[state=inactive]:hidden"><ProductionOrders key={createdId} /></TabsContent>
        <TabsContent value="create" forceMount className="data-[state=inactive]:hidden"><CreateProductionOrder onCreated={(id) => {
          setCreatedId(id)
          router.push("/dashboard/production/production-management?tab=orders", { scroll: false })
        }} /></TabsContent>
      </Tabs>
    </div>
  )
}
