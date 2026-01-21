import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task_ids, platform, client_id, integration_id } = body

    if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos uma tarefa" }, { status: 400 })
    }

    if (!platform || !["jira", "azure_boards"].includes(platform)) {
      return NextResponse.json({ error: "Plataforma invalida" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get tasks details
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .in("id", task_ids)

    if (tasksError || !tasks) {
      return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 })
    }

    // Get integration credentials
    const { data: integration, error: intError } = await supabase
      .from("integrations")
      .select("*")
      .eq("id", integration_id)
      .single()

    if (intError || !integration) {
      return NextResponse.json({ error: "Integracao nao encontrada" }, { status: 404 })
    }

    const results: { success: string[]; failed: string[] } = { success: [], failed: [] }

    if (platform === "azure_boards") {
      // Export to Azure Boards
      const baseUrl = integration.base_url || `https://dev.azure.com/${integration.organization}`
      const project = integration.project || integration.azure_project
      
      for (const task of tasks) {
        try {
          const workItem = [
            { op: "add", path: "/fields/System.Title", value: task.title },
            { op: "add", path: "/fields/System.Description", value: formatDescription(task) },
            { op: "add", path: "/fields/System.WorkItemType", value: "Task" },
            { op: "add", path: "/fields/Microsoft.VSTS.Common.Priority", value: mapPriority(task.priority) },
          ]

          if (task.estimated_hours) {
            workItem.push({ 
              op: "add", 
              path: "/fields/Microsoft.VSTS.Scheduling.OriginalEstimate", 
              value: task.estimated_hours.toString() 
            })
          }

          const response = await fetch(
            `${baseUrl}/${project}/_apis/wit/workitems/$Task?api-version=7.0`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json-patch+json",
                "Authorization": `Basic ${Buffer.from(`:${integration.access_token}`).toString("base64")}`,
              },
              body: JSON.stringify(workItem),
            }
          )

          if (response.ok) {
            const data = await response.json()
            
            // Update task with external reference
            await supabase
              .from("tasks")
              .update({
                external_id: data.id.toString(),
                external_url: data._links?.html?.href || `${baseUrl}/${project}/_workitems/edit/${data.id}`,
                external_platform: "azure_boards",
              })
              .eq("id", task.id)
            
            results.success.push(task.id)
          } else {
            const errorText = await response.text()
            console.error("Azure Boards error:", errorText)
            results.failed.push(task.id)
          }
        } catch (err) {
          console.error("Error creating work item:", err)
          results.failed.push(task.id)
        }
      }
    } else if (platform === "jira") {
      // Export to Jira
      const jiraUrl = integration.base_url || "https://your-domain.atlassian.net"
      const jiraEmail = integration.jira_email
      const jiraToken = integration.access_token
      const jiraProject = integration.jira_project_key

      for (const task of tasks) {
        try {
          const issueData = {
            fields: {
              project: { key: jiraProject },
              summary: task.title,
              description: {
                type: "doc",
                version: 1,
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: formatDescriptionPlain(task) }]
                  }
                ]
              },
              issuetype: { name: "Task" },
              priority: { name: mapJiraPriority(task.priority) },
            }
          }

          if (task.estimated_hours) {
            issueData.fields["timetracking"] = {
              originalEstimate: `${task.estimated_hours}h`
            }
          }

          const response = await fetch(
            `${jiraUrl}/rest/api/3/issue`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64")}`,
              },
              body: JSON.stringify(issueData),
            }
          )

          if (response.ok) {
            const data = await response.json()
            
            // Update task with external reference
            await supabase
              .from("tasks")
              .update({
                external_id: data.key,
                external_url: `${jiraUrl}/browse/${data.key}`,
                external_platform: "jira",
              })
              .eq("id", task.id)
            
            results.success.push(task.id)
          } else {
            const errorData = await response.json()
            console.error("Jira error:", errorData)
            results.failed.push(task.id)
          }
        } catch (err) {
          console.error("Error creating Jira issue:", err)
          results.failed.push(task.id)
        }
      }
    }

    // Log the export action
    await supabase.from("audit_logs").insert({
      client_id,
      action: "export_work_items",
      entity_type: "tasks",
      entity_id: task_ids.join(","),
      details: {
        platform,
        total: task_ids.length,
        success: results.success.length,
        failed: results.failed.length,
      },
    })

    return NextResponse.json({
      success: true,
      exported: results.success.length,
      failed: results.failed.length,
      results,
    })
  } catch (error: any) {
    console.error("Export work items error:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

function formatDescription(task: any): string {
  return `
<h3>Descricao</h3>
<p>${task.description || "Sem descricao"}</p>

<h3>Detalhes</h3>
<ul>
<li><b>Arquivo:</b> ${task.file_path || "N/A"}</li>
<li><b>Linha:</b> ${task.line_number || "N/A"}</li>
<li><b>Repositorio:</b> ${task.repository_name || "N/A"}</li>
</ul>

${task.source_code ? `<h3>Codigo Atual</h3><pre>${task.source_code}</pre>` : ""}
${task.suggested_code ? `<h3>Codigo Sugerido</h3><pre>${task.suggested_code}</pre>` : ""}
${task.ai_suggestion ? `<h3>Sugestao da IA</h3><p>${task.ai_suggestion}</p>` : ""}
  `.trim()
}

function formatDescriptionPlain(task: any): string {
  return `
Descricao: ${task.description || "Sem descricao"}

Detalhes:
- Arquivo: ${task.file_path || "N/A"}
- Linha: ${task.line_number || "N/A"}
- Repositorio: ${task.repository_name || "N/A"}

${task.source_code ? `Codigo Atual:\n${task.source_code}` : ""}
${task.suggested_code ? `Codigo Sugerido:\n${task.suggested_code}` : ""}
${task.ai_suggestion ? `Sugestao da IA: ${task.ai_suggestion}` : ""}
  `.trim()
}

function mapPriority(priority: string): number {
  switch (priority) {
    case "critical": return 1
    case "high": return 2
    case "medium": return 3
    case "low": return 4
    default: return 3
  }
}

function mapJiraPriority(priority: string): string {
  switch (priority) {
    case "critical": return "Highest"
    case "high": return "High"
    case "medium": return "Medium"
    case "low": return "Low"
    default: return "Medium"
  }
}
