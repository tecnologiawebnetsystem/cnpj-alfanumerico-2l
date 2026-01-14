import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase/api-client"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log(" === /api/client/developers GET START ===", new Date().toISOString())

  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")
    const userId = searchParams.get("user_id")

    console.log(" Params - client_id:", clientId, "user_id:", userId)

    if (!clientId || !userId) {
      console.log(" ERROR: Missing parameters")
      return NextResponse.json({ error: "Missing client_id or user_id" }, { status: 400 })
    }

    console.log(" Creating service client (NO cookies)...")
    const supabase = createSupabaseServiceClient()
    console.log(" ✅ Service client created, elapsed:", Date.now() - startTime, "ms")

    console.log(" Fetching user...")
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role, client_id")
      .eq("id", userId)
      .single()
    console.log(" User fetch completed, elapsed:", Date.now() - startTime, "ms")

    if (userError || !user) {
      console.log(" ERROR: User not found or error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.client_id !== clientId && user.role?.toUpperCase() !== "SUPER_ADMIN") {
      console.log(" ERROR: User does not have access to this client")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log(" Fetching developers...")
    const { data: developers, error: devsError } = await supabase
      .from("users")
      .select("id, name, email, status, created_at, last_login")
      .eq("client_id", clientId)
      .or("role.eq.DEV,role.eq.dev")
      .order("name", { ascending: true })
    console.log(" Developers fetch completed, elapsed:", Date.now() - startTime, "ms")

    if (devsError) {
      console.error(" ERROR fetching developers:", devsError)
      return NextResponse.json({ error: "Failed to fetch developers" }, { status: 500 })
    }

    console.log(" SUCCESS: Fetched", developers?.length || 0, "developers in", Date.now() - startTime, "ms")
    console.log(" === /api/client/developers GET END ===")
    return NextResponse.json(developers || [])
  } catch (error) {
    console.error(" CRITICAL ERROR in developers API:", error)
    console.error(" Error stack:", error instanceof Error ? error.stack : "N/A")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const body = await request.json()
    const { name, email, password, client_id, role } = body

    console.log(" Creating new developer for client:", client_id)

    if (!userId || !name || !email || !password || !client_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role, client_id")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = user.role?.toUpperCase()
    if (userRole !== "ADMIN_CLIENT" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (userRole === "ADMIN_CLIENT" && user.client_id !== client_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log(" Hashing password with Web Crypto API...")
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password_hash: hashedPassword,
        role: role || "dev",
        client_id,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error(" Error creating developer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(" Developer created successfully")
    return NextResponse.json({ success: true, user_id: newUser.id })
  } catch (error) {
    console.error(" Error in create developer API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
