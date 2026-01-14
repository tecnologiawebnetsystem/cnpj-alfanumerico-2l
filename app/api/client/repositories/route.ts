import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("user_id")
    const clientId = searchParams.get("client_id")
    const includeProvider = searchParams.get("include_provider") === "true"

    console.log(" Repositories API - user_id:", userId, "client_id:", clientId)

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 401 })
    }

    const supabase = await createServerClient()

    // Verify user
    const { data: user } = await supabase.from("users").select("id, role, client_id").eq("id", userId).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(" User verified:", user.role, "client_id:", user.client_id)

    // Use client_id from URL or user's client_id
    const targetClientId = clientId || user.client_id

    if (!targetClientId) {
      return NextResponse.json({ error: "No client_id available" }, { status: 400 })
    }

    const { data: repositories, error } = await supabase
      .from("repositories")
      .select("*")
      .eq("client_id", targetClientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(" Error fetching repositories:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(" Repositories fetched:", repositories?.length || 0)

    if (includeProvider && repositories && repositories.length > 0) {
      // Get unique user_ids from repositories
      const userIds = [...new Set(repositories.map((r) => r.user_id).filter(Boolean))]

      if (userIds.length > 0) {
        // Fetch github_tokens to determine provider
        const { data: tokens } = await supabase.from("github_tokens").select("user_id, scope").in("user_id", userIds)

        // Create a map of user_id to provider
        const userProviderMap = new Map()
        tokens?.forEach((token) => {
          if (token.scope === "repo") {
            userProviderMap.set(token.user_id, "github")
          } else if (token.scope === "gitlab") {
            userProviderMap.set(token.user_id, "gitlab")
          } else if (token.scope === "azure") {
            userProviderMap.set(token.user_id, "azure")
          }
        })

        // Add provider to each repository
        repositories.forEach((repo) => {
          repo.provider = userProviderMap.get(repo.user_id) || "github" // default to github
        })
      }
    }

    return NextResponse.json(repositories || [])
  } catch (error) {
    console.error(" Error in repositories API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
