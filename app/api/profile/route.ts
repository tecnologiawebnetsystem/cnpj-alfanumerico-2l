import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/sqlserver"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: user, error } = await db
      .from("users")
      .select("id, name, email, role, avatar_url, theme_color, theme_preferences")
      .eq("id", userId)
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ user })
  } catch (error: unknown) {
    console.error("[API] Error fetching profile:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, theme_color, theme_preferences, password } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (name) updates.name = name
    if (theme_color) updates.theme_color = theme_color
    if (theme_preferences) updates.theme_preferences = theme_preferences

    if (password) {
      const bcrypt = await import("bcryptjs")
      updates.password_hash = await bcrypt.hash(password, 10)
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await db.from("users").update(updates).eq("id", userId)
      if (error) throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("[API] Error updating profile:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro" }, { status: 500 })
  }
}
