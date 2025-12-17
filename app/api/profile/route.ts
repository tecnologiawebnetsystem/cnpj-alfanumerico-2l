import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      },
    )

    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, avatar_url, theme_color, theme_preferences")
      .eq("id", userId)
      .single()

    if (error) throw error

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("[API] Error fetching profile:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      },
    )

    const body = await request.json()
    const { userId, name, theme_color, theme_preferences, password } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const updates: any = {}
    if (name) updates.name = name
    if (theme_color) updates.theme_color = theme_color
    if (theme_preferences) updates.theme_preferences = theme_preferences

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("users").update(updates).eq("id", userId)

      if (error) throw error
    }

    if (password) {
      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash(password, 10)

      const { error } = await supabase.from("users").update({ password: hashedPassword }).eq("id", userId)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[API] Error updating profile:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
