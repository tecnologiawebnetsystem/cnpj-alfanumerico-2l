import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] === DEV TASKS API START ===")
    console.log("[v0] Timestamp:", new Date().toISOString())

    const url = new URL(request.url)
    const userIdFromQuery = url.searchParams.get("user_id")
    const includeDetails = url.searchParams.get("include_details") === "true"

    console.log("[v0] Query params:", { userIdFromQuery, includeDetails })

    const cookieStore = await cookies()
    console.log("[v0] Cookies loaded")

    const userCookie = cookieStore.get("user")
    const userEmailCookie = cookieStore.get("user_email")

    console.log("[v0] Cookie check:", {
      hasUserCookie: !!userCookie,
      hasEmailCookie: !!userEmailCookie,
      emailValue: userEmailCookie?.value,
    })

    let userId: string

    if (userIdFromQuery) {
      console.log("[v0] Using user_id from query parameter:", userIdFromQuery)
      userId = userIdFromQuery
    } else if (userCookie) {
      console.log("[v0] Using user_id from cookie")
      const user = JSON.parse(userCookie.value)
      userId = user.id
      console.log("[v0] User ID from cookie:", userId)
    } else {
      console.error("[v0] No user_id found in query or cookie, returning 401")
      return NextResponse.json({ error: "Unauthorized - No user credentials" }, { status: 401 })
    }

    console.log("[v0] Creating Supabase client...")
    const supabase = await createServerClient()
    console.log("[v0] Supabase client created successfully")

    console.log("[v0] Fetching tasks for user:", userId)

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error fetching tasks:", error)
      throw error
    }

    console.log("[v0] Tasks fetched:", tasks?.length || 0, "records")

    if (includeDetails && tasks && tasks.length > 0) {
      console.log("[v0] Enriching tasks with details...")

      const analysisIds = [...new Set(tasks.map((t) => t.analysis_id).filter(Boolean))]
      const userIds = [...new Set(tasks.map((t) => t.assigned_to).filter(Boolean))]

      console.log("[v0] Fetching", analysisIds.length, "analyses and", userIds.length, "users")

      // Fetch analyses to get repository_id
      const { data: analyses } = await supabase.from("analyses").select("id, repository_id").in("id", analysisIds)

      const repositoryIds = [...new Set(analyses?.map((a) => a.repository_id).filter(Boolean) || [])]

      console.log("[v0] Fetching", repositoryIds.length, "repositories")

      // Fetch repositories
      const { data: repositories } = await supabase
        .from("repositories")
        .select("id, name, full_name")
        .in("id", repositoryIds)

      // Fetch users
      const { data: users } = await supabase.from("users").select("id, name").in("id", userIds)

      // Create maps for quick lookup
      const analysisMap = new Map(analyses?.map((a) => [a.id, a.repository_id]) || [])
      const repositoryMap = new Map(repositories?.map((r) => [r.id, r.name || r.full_name]) || [])
      const userMap = new Map(users?.map((u) => [u.id, u.name]) || [])

      // Enrich tasks with repository and user info
      const enrichedTasks = tasks.map((task) => {
        const repositoryId = task.analysis_id ? analysisMap.get(task.analysis_id) : null
        const repositoryName = repositoryId ? repositoryMap.get(repositoryId) : null

        return {
          ...task,
          repository_name: repositoryName || "Repositório não identificado",
          file_path: task.description?.match(/Arquivo: (.+)/)?.[1] || task.title?.match(/`(.+)`/)?.[1] || null,
          assigned_to_name: userMap.get(task.assigned_to) || "Desenvolvedor não identificado",
        }
      })

      console.log("[v0] Tasks enriched successfully")
      console.log("[v0] === DEV TASKS API END (enriched) ===")
      return NextResponse.json(enrichedTasks)
    }

    console.log("[v0] === DEV TASKS API END (basic) ===")
    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error("[v0] === DEV TASKS API ERROR ===")
    console.error("[v0] Error fetching dev tasks:", error)
    console.error("[v0] Error message:", error.message)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ error: "Failed to fetch tasks: " + error.message }, { status: 500 })
  }
}
