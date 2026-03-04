import { cookies } from "next/headers"
import { MonitoringDashboard } from "@/components/monitoring/monitoring-dashboard"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-actions"

export default async function MonitoringPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "super_admin") {
    redirect("/dashboard")
  }

  return <MonitoringDashboard />
}
