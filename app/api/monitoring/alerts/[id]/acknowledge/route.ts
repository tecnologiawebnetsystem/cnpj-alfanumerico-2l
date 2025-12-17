import { NextResponse } from "next/server"
import { acknowledgeAlert } from "@/lib/monitoring/alerts"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await acknowledgeAlert(params.id, user.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to acknowledge alert" }, { status: 500 })
    }

    return NextResponse.json({ message: "Alert acknowledged" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
