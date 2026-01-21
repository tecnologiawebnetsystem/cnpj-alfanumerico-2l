import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: tokens, error } = await supabase
      .from("github_tokens")
      .select("id, created_at, scope, github_username, account_name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(" Error fetching tokens:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const tokensWithProvider =
      tokens?.map((token) => {
        const isGitLab = token.scope === "gitlab"
        const isAzure = token.scope && token.scope !== "repo" && token.scope !== "gitlab"

        return {
          ...token,
          provider: isGitLab ? "gitlab" : isAzure ? "azure" : "github",
          organization: isAzure ? token.scope : undefined,
          gitlab_username: isGitLab ? token.github_username : undefined,
        }
      }) || []

    return NextResponse.json({ tokens: tokensWithProvider })
  } catch (error) {
    console.error(" Error in GET /api/github/tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, access_token, provider = "github", organization, account_name, is_on_premise, base_url } = body

    if (!user_id || !access_token) {
      return NextResponse.json({ error: "user_id and access_token are required" }, { status: 400 })
    }

    if (!account_name) {
      return NextResponse.json({ error: "account_name is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: user } = await supabase
      .from("users")
      .select("client_id, role")
      .eq("id", user_id)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userRole = user.role?.toLowerCase() || ""
    const canManage = userRole === "admin" || userRole === "super_admin" || userRole === "admin_client"

    if (!canManage) {
      console.log(" User does not have permission to add tokens")
      return NextResponse.json({ 
        error: "Forbidden - Only Admin users can add tokens" 
      }, { status: 403 })
    }

    const scopeValue = provider === "azure" ? organization : provider === "gitlab" ? "gitlab" : "repo"

    const { data: existing } = await supabase
      .from("github_tokens")
      .select("id, scope, provider")
      .eq("user_id", user_id)
      .eq("account_name", account_name)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("github_tokens")
        .update({
          access_token,
          scope: scopeValue,
          provider,
          is_on_premise: provider === "azure" ? is_on_premise : false,
          base_url: provider === "azure" && is_on_premise ? base_url : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)

      if (error) {
        console.error(" Error updating token:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log(` Token updated successfully for user: ${user_id}, account: ${account_name}`)
      return NextResponse.json({ success: true })
    } else {
      const { error } = await supabase.from("github_tokens").insert({
        user_id,
        client_id: user.client_id,
        access_token,
        scope: scopeValue,
        provider,
        token_type: "Bearer",
        account_name,
        is_on_premise: provider === "azure" ? is_on_premise : false,
        base_url: provider === "azure" && is_on_premise ? base_url : null,
      })

      if (error) {
        console.error(" Error inserting token:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log(` Token inserted successfully for user: ${user_id}, account: ${account_name}`)
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error(" Error in POST /api/github/tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tokenId = searchParams.get("token_id")
    const userId = searchParams.get("user_id")

    if (!tokenId || !userId) {
      return NextResponse.json({ error: "token_id and user_id are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userRole = user.role?.toLowerCase() || ""
    const canManage = userRole === "admin" || userRole === "super_admin" || userRole === "admin_client"

    if (!canManage) {
      console.log(" User does not have permission to delete tokens")
      return NextResponse.json({ 
        error: "Forbidden - Only Admin users can delete tokens" 
      }, { status: 403 })
    }

    const { error } = await supabase.from("github_tokens").delete().eq("id", tokenId).eq("user_id", userId)

    if (error) {
      console.error(" Error deleting token:", error)
      return NextResponse.json({ error: "Failed to delete token" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(" Error in DELETE /api/github/tokens:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
