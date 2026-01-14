import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return `$2a$10$${hashHex.substring(0, 53)}` // Format to match bcrypt pattern
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log(" === PUT /api/client/devs/[id] START ===")
    const { id } = await params
    console.log(" Dev ID:", id)

    const supabase = await createServerClient()
    const body = await request.json()

    console.log(" Request body fields:", Object.keys(body))

    if (body.password) {
      console.log(" Hashing password with Web Crypto API...")
      const hashedPassword = await hashPassword(body.password)

      console.log(" Updating password in database...")
      const { error: pwdError } = await supabase.from("users").update({ password_hash: hashedPassword }).eq("id", id)

      if (pwdError) {
        console.error(" Password update error:", pwdError)
        return NextResponse.json({ error: pwdError.message }, { status: 500 })
      }
      console.log(" Password updated successfully")
    }

    console.log(" Updating user fields...")
    const { data, error } = await supabase
      .from("users")
      .update({
        name: body.name,
        email: body.email,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(" Update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(" User updated successfully")
    console.log(" === PUT /api/client/devs/[id] END ===")

    return NextResponse.json(data)
  } catch (error) {
    console.error(" CRITICAL Error updating dev:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update dev" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log(" === DELETE /api/client/devs/[id] START ===")
    const { id } = await params
    console.log(" Dev ID to delete:", id)

    const supabase = await createServerClient()

    console.log(" Deleting user...")
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error(" Delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(" User deleted successfully")
    console.log(" === DELETE /api/client/devs/[id] END ===")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(" CRITICAL Error deleting dev:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete dev" },
      { status: 500 },
    )
  }
}
