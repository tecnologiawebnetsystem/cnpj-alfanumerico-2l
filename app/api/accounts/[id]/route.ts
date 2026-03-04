import { NextResponse } from "next/server"
import { db as supabase } from "@/lib/db/sqlserver"
import { getSessionFromRequest } from "@/lib/api-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: account, error } = await supabase
      .from("github_tokens")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", session.id)
      .single()

    if (error) throw error
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 })

    const { access_token, ...accountData } = account as any
    return NextResponse.json({ account: accountData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { account_name } = await request.json()
    if (!account_name?.trim()) {
      return NextResponse.json({ error: "Account name is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("github_tokens")
      .update({ account_name: account_name.trim() })
      .eq("id", params.id)
      .eq("user_id", session.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ message: "Account name updated successfully", account: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userRole = session.role?.toLowerCase() || ""
    const canManage = ["admin", "super_admin", "admin_client"].includes(userRole)
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden - Only Admin users can delete accounts" }, { status: 403 })
    }

    const { error } = await supabase.from("github_tokens").delete().eq("id", params.id)
    if (error) throw error

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userRole = session.role?.toLowerCase() || ""
    const canManage = ["admin", "super_admin", "admin_client"].includes(userRole)
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden - Only Admin users can manage tokens" }, { status: 403 })
    }

    const body = await request.json()
    const { account_name, access_token } = body
    const updateData: any = {}

    if (account_name !== undefined) {
      if (!account_name?.trim()) return NextResponse.json({ error: "Account name is required" }, { status: 400 })
      updateData.account_name = account_name.trim()
    }
    if (access_token?.trim()) updateData.access_token = access_token.trim()

    const { data, error } = await supabase
      .from("github_tokens")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: "Account not found" }, { status: 404 })

    return NextResponse.json({ message: "Account updated successfully", account: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
