import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const errorData = await request.json()

    // Get current user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get client_id if user is authenticated
    let client_id = null
    if (user) {
      const { data: userData } = await supabase.from("users").select("client_id").eq("id", user.id).single()
      client_id = userData?.client_id
    }

    // Get IP address
    const ip_address = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Insert error log
    const { error: insertError } = await supabase.from("system_errors").insert({
      client_id,
      user_id: user?.id || null,
      ip_address,
      ...errorData,
    })

    if (insertError) {
      console.error(" Failed to insert error log:", insertError)
      return NextResponse.json({ error: "Failed to log error" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error(" Error in /api/errors:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
