import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log(" ========== AZURE DEVOPS INTEGRATION START ==========")
    
    const currentUser = getCurrentUser()
    if (!currentUser) {
      console.log(" Azure DevOps: Authentication failed - no current user")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log(" Azure DevOps: User authenticated:", currentUser.id)

    const { task_id } = await request.json()
    console.log(" Azure DevOps: Creating Work Item for task ID:", task_id)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log(" Azure DevOps: Fetching task details from database...")
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*, analyses(repository_name)")
      .eq("id", task_id)
      .single()

    if (taskError || !task) {
      console.log(" Azure DevOps: Task not found. Error:", taskError)
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    console.log(" Azure DevOps: Task loaded successfully")
    console.log(" Azure DevOps: Task title:", task.title)
    console.log(" Azure DevOps: Repository:", task.analyses?.repository_name)
    console.log(" Azure DevOps: File path:", task.file_path)
    console.log(" Azure DevOps: Line number:", task.line_number)
    console.log(" Azure DevOps: Has current code:", !!task.code_current)
    console.log(" Azure DevOps: Has suggested code:", !!task.code_suggested)

    console.log(" Azure DevOps: Searching for Azure token for client:", task.client_id)
    const { data: token, error: tokenError } = await supabase
      .from("github_tokens")
      .select("*")
      .eq("client_id", task.client_id)
      .eq("provider", "azure")
      .eq("is_active", true)
      .single()

    if (tokenError || !token) {
      console.log(" Azure DevOps: Token not found. Error:", tokenError)
      return NextResponse.json(
        { error: "Token do Azure DevOps não encontrado. Configure a integração primeiro." },
        { status: 400 }
      )
    }

    console.log(" Azure DevOps: Token found successfully")
    console.log(" Azure DevOps: Organization:", token.account_name)
    console.log(" Azure DevOps: Token active:", token.is_active)

    let baseUrl = "https://dev.azure.com"
    let org = token.account_name
    
    if (token.account_name.includes("://")) {
      const urlMatch = token.account_name.match(/(https?:\/\/[^\/]+)\/(.+)/)
      if (urlMatch) {
        baseUrl = urlMatch[1]
        org = urlMatch[2]
        console.log(` Azure DevOps: Using custom base URL: ${baseUrl}`)
      }
    }

    const organization = org
    const project = task.analyses?.repository_name || "DefaultProject"
    const azureUrl = `${baseUrl}/${organization}/${project}/_apis/wit/workitems/$Task?api-version=7.0`

    console.log(" Azure DevOps: Code diff prepared:", codeDiff.length, "characters")

    const codeDiff = task.code_current && task.code_suggested 
      ? `
### Código Atual (Errado)
\`\`\`${task.language || 'text'}
${task.code_before?.join('\n') || ''}
${task.code_current}
${task.code_after?.join('\n') || ''}
\`\`\`

### Código Sugerido (Correto)
\`\`\`${task.language || 'text'}
${task.code_before?.join('\n') || ''}
${task.code_suggested}
${task.code_after?.join('\n') || ''}
\`\`\`
`
      : ''

    console.log(" Azure DevOps: Work Item data prepared:", JSON.stringify(workItemData, null, 2))

    console.log(" Azure DevOps: Calling Azure DevOps API...")
    const azureResponse = await fetch(azureUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json-patch+json",
        "Authorization": `Basic ${Buffer.from(`:${token.access_token}`).toString("base64")}`,
      },
      body: JSON.stringify(workItemData),
    })

    console.log(" Azure DevOps: API response status:", azureResponse.status)

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text()
      console.error(" Azure DevOps: API error response:", errorText)
      return NextResponse.json(
        { error: "Erro ao criar Work Item no Azure DevOps", details: errorText },
        { status: azureResponse.status }
      )
    }

    const workItem = await azureResponse.json()
    console.log(" Azure DevOps: Work Item created successfully!")
    console.log(" Azure DevOps: Work Item ID:", workItem.id)
    console.log(" Azure DevOps: Work Item URL:", workItem._links?.html?.href)

    const workItemUrl = workItem._links?.html?.href || `${baseUrl}/${organization}/${project}/_workitems/edit/${workItem.id}`

    console.log(" Azure DevOps: Updating task with Work Item info...")
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        azure_devops_id: workItem.id.toString(),
        azure_work_item_url: workItemUrl,
        azure_synced_at: new Date().toISOString(),
      })
      .eq("id", task_id)

    if (updateError) {
      console.error(" Azure DevOps: Error updating task:", updateError)
    } else {
      console.log(" Azure DevOps: Task updated successfully")
    }

    console.log(" ========== AZURE DEVOPS INTEGRATION SUCCESS ==========")

    return NextResponse.json({
      success: true,
      work_item_id: workItem.id,
      work_item_url: workItemUrl,
    })
  } catch (error) {
    console.error(" ========== AZURE DEVOPS INTEGRATION ERROR ==========")
    console.error(" Azure DevOps: Unexpected error:", error)
    console.error(" Azure DevOps: Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: "Erro ao integrar com Azure DevOps" },
      { status: 500 }
    )
  }
}
