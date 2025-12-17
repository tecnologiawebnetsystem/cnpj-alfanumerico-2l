import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"

// POST /api/analytics/events - Track analytics event
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    const body = await request.json()
    const { event_type, event_name, properties } = body

    const supabase = await createClient()

    const { error } = await supabase.from("analytics_events").insert({
      client_id: user?.client_id,
      user_id: user?.id,
      event_type,
      event_name,
      properties,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error tracking analytics event:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/analytics/events - Get analytics events (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("event_type")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const supabase = await createClient()

    let query = supabase
      .from("analytics_events")
      .select("*")
      .eq("client_id", user.client_id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    if (startDate) {
      query = query.gte("created_at", startDate)
    }

    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    const { data: events, error } = await query

    if (error) throw error

    return NextResponse.json({ events })
  } catch (error: any) {
    console.error("[v0] Error fetching analytics events:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
