import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-actions"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error(" Error fetching current user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
