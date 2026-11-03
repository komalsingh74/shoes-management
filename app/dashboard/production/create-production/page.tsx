import { redirect } from "next/navigation"

export default function Page() {
  redirect("/dashboard/production/production-management?tab=create")
}
