import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Fetch clients data
  const { data: clients, error } = await supabase.from("clients").select("plan, license_active, license_end")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by plan
  const byPlan: Record<string, number> = {}
  clients?.forEach((client) => {
    const plan = client.plan || "free"
    byPlan[plan] = (byPlan[plan] || 0) + 1
  })

  const planData = Object.entries(byPlan).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  // Group by license status
  const now = new Date()
  let active = 0
  let expired = 0
  let expiring_soon = 0

  clients?.forEach((client) => {
    if (!client.license_active) {
      expired++
    } else if (client.license_end) {
      const endDate = new Date(client.license_end)
      const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry <= 30) {
        expiring_soon++
      } else {
        active++
      }
    } else {
      active++
    }
  })

  const licenseData = [
    { name: "Ativas", value: active },
    { name: "Expirando em breve", value: expiring_soon },
    { name: "Expiradas", value: expired },
  ]

  return NextResponse.json({
    byPlan: planData,
    byLicenseStatus: licenseData,
  })
}
