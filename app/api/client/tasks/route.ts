import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase/api-client"

export async function GET(request: NextRequest) {
  try {
    console.log(" === GET /api/client/tasks START ===")
    const { searchParams } = new URL(request.url)
    const client_id = searchParams.get("client_id")
    const includeRepo = searchParams.get("include_repo") === "true"

    console.log(" client_id:", client_id)
    console.log(" includeRepo:", includeRepo)

    if (!client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    console.log(" Querying tasks table...")
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("client_id", client_id)
      .order("created_at", { ascending: false })

    if (tasksError) {
      console.error(" Error fetching tasks:", tasksError)
      throw tasksError
    }

    console.log(" Found", tasks?.length || 0, "tasks")

    const userIds = [...new Set(tasks?.map((task) => task.assigned_to).filter(Boolean) || [])]
    console.log(" Fetching", userIds.length, "unique users...")

    const { data: users, error: usersError } = await supabase.from("users").select("id, name").in("id", userIds)

    if (usersError) console.error(" Error fetching users:", usersError)

    const userMap = new Map(users?.map((u) => [u.id, u.name]) || [])

    const repositoryMap = new Map()
    if (includeRepo && tasks && tasks.length > 0) {
      const analysisIds = [...new Set(tasks.map((t) => t.analysis_id).filter(Boolean))]
      console.log(" Fetching repositories for", analysisIds.length, "analyses...")

      if (analysisIds.length > 0) {
        const { data: analyses } = await supabase.from("analyses").select("id, repository_id").in("id", analysisIds)

        const repositoryIds = [...new Set(analyses?.map((a) => a.repository_id).filter(Boolean) || [])]

        if (repositoryIds.length > 0) {
          const { data: repositories } = await supabase
            .from("repositories")
            .select("id, name, full_name")
            .in("id", repositoryIds)

          const analysisRepoMap = new Map(analyses?.map((a) => [a.id, a.repository_id]) || [])
          const repoNameMap = new Map(repositories?.map((r) => [r.id, r.name || r.full_name]) || [])

          for (const [analysisId, repoId] of analysisRepoMap.entries()) {
            if (repoId) {
              repositoryMap.set(analysisId, repoNameMap.get(repoId))
            }
          }
        }
      }
    }

    const tasksWithUsers = (tasks || []).map((task) => ({
      ...task,
      assigned_to_name: task.assigned_to ? userMap.get(task.assigned_to) || "Usuário não encontrado" : "Não atribuído",
      repository_name: includeRepo && task.analysis_id ? repositoryMap.get(task.analysis_id) || "N/A" : undefined,
      file_path: task.description?.match(/Arquivo: (.+)/)?.[1] || task.title?.match(/`(.+)`/)?.[1] || undefined,
    }))

    console.log(` Tasks enriched with user data and repositories`)
    console.log(" === GET /api/client/tasks END ===")

    return NextResponse.json(tasksWithUsers)
  } catch (error) {
    console.error(" CRITICAL Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log(" === POST /api/client/tasks START ===")

    const supabase = createSupabaseServiceClient()
    const body = await request.json()

    console.log(" Creating new task:", body.title)

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status || "pending",
        assigned_to: body.assigned_to,
        client_id: body.client_id,
      })
      .select()
      .single()

    if (error) {
      console.error(" Error creating task:", error)
      throw error
    }

    console.log(" Task created successfully:", data.id)
    console.log(" === POST /api/client/tasks END ===")

    return NextResponse.json(data)
  } catch (error) {
    console.error(" CRITICAL Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log(" === PUT /api/client/tasks START ===")
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("task_id")

    console.log(" taskId:", taskId)

    if (!taskId) {
      return NextResponse.json({ error: "task_id is required" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()
    const body = await request.json()

    console.log(" Updating task:", taskId)

    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: body.title,
        description: body.description,
        priority: body.priority,
        assigned_to: body.assigned_to === "none" ? null : body.assigned_to,
        status: body.status,
      })
      .eq("id", taskId)
      .select()
      .single()

    if (error) {
      console.error(" Error updating task:", error)
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
    }

    console.log(" Task updated successfully:", taskId)
    console.log(" === PUT /api/client/tasks END ===")

    return NextResponse.json(data)
  } catch (error) {
    console.error(" CRITICAL Error in update task API:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
