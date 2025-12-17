import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

async function getCurrentUser(userId?: string) {
  try {
    if (userId) {
      console.log("[v0] User ID from query:", userId)
      const supabase = await createServerClient()

      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, name, role, client_id, status")
        .eq("id", userId)
        .maybeSingle()

      if (error || !user) {
        console.error("[v0] User not found by ID:", error)
        return null
      }

      console.log("[v0] User found by ID:", user.email, "role:", user.role)
      return user
    }

    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value

    if (!userEmail) {
      console.log("[v0] No user_email cookie found")
      return null
    }

    const supabase = await createServerClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, role, client_id, status")
      .eq("email", userEmail)
      .maybeSingle()

    if (error || !user) {
      console.error("[v0] User not found by email:", error)
      return null
    }

    console.log("[v0] User found by email:", user.email, "role:", user.role)
    return user
  } catch (error) {
    console.error("[v0] Exception in getCurrentUser:", error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    console.log("[v0] GET /api/admin/users - Start")

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    console.log("[v0] Getting current user...")
    const user = await getCurrentUser(userId || undefined)

    console.log("[v0] Current user from API:", user)

    if (!user || (user.role.toUpperCase() !== "SUPER_ADMIN" && user.role !== "super_admin")) {
      console.error("[v0] Unauthorized access to users API, user role:", user?.role)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log("[v0] User authorized, fetching users...")

    console.log("[v0] Creating Supabase client for users query...")
    const supabase = await createServerClient()

    console.log("[v0] Executing users query...")
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        clients (
          name
        )
      `)
      .neq("role", "SUPER_ADMIN")
      .neq("role", "super_admin")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error:", error)
      throw error
    }

    console.log("[v0] Raw data from Supabase:", data?.length, "records")

    const users =
      data?.map((u) => ({
        ...u,
        client_name: u.clients?.name || null,
      })) || []

    console.log("[v0] Users fetched successfully:", users.length, "users (Super Admin hidden)")
    return NextResponse.json(users)
  } catch (error: any) {
    console.error("[v0] Error loading users:", error)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ error: error.message || "Erro ao carregar usuários" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("[v0] POST /api/admin/users - Start")

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    
    const user = await getCurrentUser(userId || undefined)

    if (!user || (user.role.toUpperCase() !== "SUPER_ADMIN" && user.role !== "super_admin")) {
      console.log("[v0] Unauthorized - user:", user?.email, "role:", user?.role)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, client_id, status } = body

    console.log("[v0] Creating user:", { name, email, role, client_id, status })

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    console.log("[v0] Hashing password with Web Crypto API...")
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    const supabase = await createServerClient()

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password_hash: hashedPassword,
        role,
        client_id: client_id === "none" ? null : client_id,
        status: status || "active",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      throw error
    }

    console.log("[v0] User created successfully")
    return NextResponse.json(newUser, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    console.log("[v0] PUT /api/admin/users - Start")

    const user = await getCurrentUser()

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id, password, ...updateData } = body

    console.log("[v0] Updating user:", id, updateData)

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    const supabase = await createServerClient()

    if (password) {
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      updateData.password_hash = hashedPassword
    }

    const { data, error } = await supabase.from("users").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] User updated successfully")
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] PUT /api/admin/users - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    console.log("[v0] DELETE /api/admin/users - Start")

    const user = await getCurrentUser()

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    console.log("[v0] Deleting user:", id)

    const supabase = await createServerClient()

    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error("[v0] Supabase delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] User deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] DELETE /api/admin/users - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
