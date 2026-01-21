import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get("task_id")
    const repoUrl = searchParams.get("repo_url")
    const branch = searchParams.get("branch")

    if (!taskId || !repoUrl) {
      return NextResponse.json({ error: "task_id e repo_url sao obrigatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get integration info to access Git API
    const { data: task } = await supabase
      .from("tasks")
      .select("repository_id, client_id")
      .eq("id", taskId)
      .single()

    if (!task) {
      return NextResponse.json({ error: "Tarefa nao encontrada" }, { status: 404 })
    }

    // Get repository info (note: repositories table doesnt have project_name)
    const { data: repo } = await supabase
      .from("repositories")
      .select("id, name, full_name, url, provider, azure_devops_id, integration_id, integrations(*)")
      .eq("id", task.repository_id)
      .single()

    if (!repo || !repo.integrations) {
      // Return mock data if no integration
      return NextResponse.json({
        branches: [
          { name: "main", isDefault: true, lastCommit: "Initial commit" },
          { name: `feature/task-${taskId.substring(0, 8)}`, isDefault: false }
        ],
        pullRequests: [],
        commits: []
      })
    }

    const integration = repo.integrations
    const accessToken = integration.access_token

    // Determine if GitHub or Azure DevOps
    if (integration.provider === "github") {
      // Parse GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (!match) {
        return NextResponse.json({ error: "URL do GitHub invalida" }, { status: 400 })
      }
      const [, owner, repoName] = match

      // Fetch branches
      const branchesRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName.replace(".git", "")}/branches`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json"
          }
        }
      )
      const branches = branchesRes.ok ? await branchesRes.json() : []

      // Fetch pull requests
      const prsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName.replace(".git", "")}/pulls?state=all&per_page=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json"
          }
        }
      )
      const prs = prsRes.ok ? await prsRes.json() : []

      // Fetch recent commits
      const commitsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName.replace(".git", "")}/commits?per_page=5`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json"
          }
        }
      )
      const commits = commitsRes.ok ? await commitsRes.json() : []

      return NextResponse.json({
        branches: branches.map((b: any) => ({
          name: b.name,
          isDefault: b.name === "main" || b.name === "master",
          lastCommit: b.commit?.sha?.substring(0, 7)
        })),
        pullRequests: prs.map((pr: any) => ({
          id: pr.id.toString(),
          title: pr.title,
          status: pr.merged_at ? "merged" : pr.state,
          url: pr.html_url,
          createdAt: pr.created_at,
          author: pr.user?.login
        })),
        commits: commits.map((c: any) => ({
          sha: c.sha,
          message: c.commit?.message,
          author: c.commit?.author?.name,
          date: c.commit?.author?.date,
          url: c.html_url
        }))
      })
    }

    // Azure DevOps
    if (integration.provider === "azure") {
      const org = integration.organization
      const project = integration.project || repo.name // Use integration.project
      const repoId = repo.azure_devops_id || repo.name
      const baseUrl = integration.base_url || `https://dev.azure.com/${org}`

      const authHeader = `Basic ${Buffer.from(`:${accessToken}`).toString("base64")}`

      // Fetch branches
      const branchesRes = await fetch(
        `${baseUrl}/${project}/_apis/git/repositories/${repoId}/refs?filter=heads&api-version=7.0`,
        { headers: { Authorization: authHeader } }
      )
      const branchesData = branchesRes.ok ? await branchesRes.json() : { value: [] }

      // Fetch pull requests
      const prsRes = await fetch(
        `${baseUrl}/${project}/_apis/git/repositories/${repoId}/pullrequests?api-version=7.0&$top=5`,
        { headers: { Authorization: authHeader } }
      )
      const prsData = prsRes.ok ? await prsRes.json() : { value: [] }

      // Fetch commits
      const commitsRes = await fetch(
        `${baseUrl}/${project}/_apis/git/repositories/${repoId}/commits?api-version=7.0&$top=5`,
        { headers: { Authorization: authHeader } }
      )
      const commitsData = commitsRes.ok ? await commitsRes.json() : { value: [] }

      return NextResponse.json({
        branches: branchesData.value?.map((b: any) => ({
          name: b.name.replace("refs/heads/", ""),
          isDefault: b.name.includes("main") || b.name.includes("master"),
          lastCommit: b.objectId?.substring(0, 7)
        })) || [],
        pullRequests: prsData.value?.map((pr: any) => ({
          id: pr.pullRequestId.toString(),
          title: pr.title,
          status: pr.status === "completed" ? "merged" : pr.status === "abandoned" ? "closed" : "open",
          url: `${baseUrl}/${project}/_git/${repoId}/pullrequest/${pr.pullRequestId}`,
          createdAt: pr.creationDate,
          author: pr.createdBy?.displayName
        })) || [],
        commits: commitsData.value?.map((c: any) => ({
          sha: c.commitId,
          message: c.comment,
          author: c.author?.name,
          date: c.author?.date,
          url: `${baseUrl}/${project}/_git/${repoId}/commit/${c.commitId}`
        })) || []
      })
    }

    return NextResponse.json({
      branches: [],
      pullRequests: [],
      commits: []
    })

  } catch (error: any) {
    console.error("Error fetching git info:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
