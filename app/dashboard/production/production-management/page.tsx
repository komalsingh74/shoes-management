import ProductionManagement from "@/components/production/production-management"

export default async function Page({ searchParams }: {
  searchParams: Promise<{ tab?: string | string[] }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === "orders" || tab === "create" ? tab : "overview"
  return <ProductionManagement activeTab={activeTab} />
}
