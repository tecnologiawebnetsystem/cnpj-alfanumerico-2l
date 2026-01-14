import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task_id, user_id } = body

    console.log(" Azure DevOps sync request:", { task_id, user_id })

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*, clients(id, azure_organization, azure_project)")
      .eq("id", task_id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const { data: token, error: tokenError } = await supabase
      .from("github_tokens")
      .select("access_token, account_name")
      .eq("user_id", user_id)
      .eq("provider", "azure")
      .single()

    if (tokenError || !token) {
      return NextResponse.json(
        {
          error: "Azure DevOps token not found. Please connect your Azure DevOps account first.",
        },
        { status: 400 },
      )
    }

    let baseUrl = "https://dev.azure.com"
    let orgName = task.clients.azure_organization || token.account_name

    if (token.account_name && token.account_name.startsWith("http")) {
      const urlMatch = token.account_name.match(/(https?:\/\/[^/]+)\/([^/]+)/)
      if (urlMatch) {
        baseUrl = urlMatch[1]
        orgName = urlMatch[2]
      }
    }

    const projectName = task.clients.azure_project || "DefaultProject"

    console.log(" Creating Azure DevOps work item:", { baseUrl, orgName, projectName })

    const workItemUrl = `${baseUrl}/${orgName}/${projectName}/_apis/wit/workitems/$Task?api-version=7.0`

    const workItemPayload = [
      {
        op: "add",
        path: "/fields/System.Title",
        value: task.title,
      },
      {
        op: "add",
        path: "/fields/System.Description",
        value: task.description,
      },
      {
        op: "add",
        path: "/fields/System.Tags",
        value: "CNPJ Migration; Automated",
      },
    ]

    const response = await fetch(workItemUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json-patch+json",
      },
      body: JSON.stringify(workItemPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(" Azure DevOps API error:", errorText)
      return NextResponse.json(
        {
          error: "Failed to create work item in Azure DevOps",
          details: errorText,
        },
        { status: 500 },
      )
    }

    const workItem = await response.json()
    console.log(" Work item created:", workItem.id)

    await supabase
      .from("tasks")
      .update({
        azure_work_item_id: workItem.id,
        azure_work_item_url: workItem._links.html.href,
      })
      .eq("id", task_id)

    return NextResponse.json({
      success: true,
      work_item_id: workItem.id,
      work_item_url: workItem._links.html.href,
    })
  } catch (error) {
    console.error(" Error syncing with Azure DevOps:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
