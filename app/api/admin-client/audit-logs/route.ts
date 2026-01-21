import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")
    const action = searchParams.get("action")
    const entityType = searchParams.get("entity_type")

    if (!clientId) {
      return NextResponse.json({ error: "client_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from("audit_logs")
      .select(`
        *,
        users:user_id (name, email)
      `, { count: "exact" })
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (action && action !== "all") {
      query = query.eq("action", action)
    }

    if (entityType && entityType !== "all") {
      query = query.eq("entity_type", entityType)
    }

    if (search) {
      query = query.or(`entity_id.ilike.%${search}%,details->description.ilike.%${search}%`)
    }

    const { data: logs, error, count } = await query

    if (error) {
      console.error("Error fetching audit logs:", error)
      return NextResponse.json({ error: "Erro ao buscar logs" }, { status: 500 })
    }

    // Map user info
    const mappedLogs = logs?.map((log: any) => ({
      ...log,
      user_name: log.users?.name || null,
      user_email: log.users?.email || null,
      users: undefined,
    })) || []

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      logs: mappedLogs,
      total: count || 0,
      page,
      limit,
      totalPages,
    })
  } catch (error: any) {
    console.error("Audit logs error:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_id, user_id, action, entity_type, entity_id, details } = body

    if (!client_id || !action || !entity_type) {
      return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get IP from headers
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || null
    const userAgent = request.headers.get("user-agent") || null

    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        client_id,
        user_id,
        action,
        entity_type,
        entity_id,
        details: details || {},
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating audit log:", error)
      return NextResponse.json({ error: "Erro ao criar log" }, { status: 500 })
    }

    return NextResponse.json({ success: true, log: data })
  } catch (error: any) {
    console.error("Create audit log error:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
