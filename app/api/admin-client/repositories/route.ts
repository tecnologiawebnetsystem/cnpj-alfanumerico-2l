import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

async function getCurrentUser(userId?: string) {
  try {
    if (userId) {
      const supabase = await createServerClient()
      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, name, role, client_id, status")
        .eq("id", userId)
        .maybeSingle()

      if (error || !user) {
        return null
      }
      return user
    }

    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value

    if (!userEmail) {
      return null
    }

    const supabase = await createServerClient()
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, role, client_id, status")
      .eq("email", userEmail)
      .maybeSingle()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    const user = await getCurrentUser(userId || undefined)

    if (!user || user.role.toUpperCase() !== "ADMIN_CLIENT") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!user.client_id) {
      return NextResponse.json({ error: "Usuário sem cliente associado" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Only get repositories from the same client
    const { data, error } = await supabase
      .from("repositories")
      .select("*")
      .eq("client_id", user.client_id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
