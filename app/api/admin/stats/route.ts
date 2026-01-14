import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 401 })
    }

    const supabase = await createServerClient()

    // Verificar se o usuário é super admin
    const { data: user } = await supabase.from("users").select("role").eq("id", user_id).single()

    if (!user || (user.role !== "super_admin" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Total de clientes
    const { count: totalClients } = await supabase.from("clients").select("*", { count: "exact", head: true })

    // Clientes ativos
    const { count: activeClients } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    // Contando assinaturas ativas ao invés de licenças expiradas
    const { count: activeSubscriptions } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    // Total de usuários
    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

    // Total de repositórios
    const { count: totalRepositories } = await supabase.from("repositories").select("*", { count: "exact", head: true })

    // Total de análises
    const { count: totalAnalyses } = await supabase.from("analyses").select("*", { count: "exact", head: true })

    const { count: pendingTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    return NextResponse.json({
      totalClients: totalClients || 0,
      activeClients: activeClients || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalUsers: totalUsers || 0,
      totalRepositories: totalRepositories || 0,
      totalAnalyses: totalAnalyses || 0,
      pendingTasks: pendingTasks || 0,
    })
  } catch (error: any) {
    console.error(" Error loading admin stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
