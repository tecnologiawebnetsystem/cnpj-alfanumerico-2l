import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/sqlserver"
import { GitHubClient } from "@/lib/git/github-client"
import { AzureDevOpsClient } from "@/lib/git/azure-client"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { method, user_id } = body

    const { data: user } = await db.from("users").select("role, client_id").eq("id", user_id).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const u = user as Record<string, unknown>

    if (method === "direct_commit" && u.role !== "admin" && u.role !== "super_admin") {
      return NextResponse.json({ error: "Only administrators can perform direct commits" }, { status: 403 })
    }

    const { data: task } = await db.from("tasks").select("*").eq("id", params.id).single()

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const t = task as Record<string, unknown>

    // Busca repositório
    const { data: repository } = await db.from("repositories").select("*").eq("id", t.repository_id as string).single()
    const repo = repository as Record<string, unknown>

    // Busca token git
    const { data: tokenData } = await db
      .from("github_tokens")
      .select("*")
      .eq("client_id", u.client_id as string)
      .eq("provider", repo?.provider as string)
      .single()

    if (!tokenData) {
      return NextResponse.json(
        { error: `No ${repo?.provider} token found for this client` },
        { status: 400 },
      )
    }

    const token = tokenData as Record<string, unknown>

    if (method === "copy") {
      return NextResponse.json({ success: true, method: "copy", code: t.code_suggested })
    }

    const timestamp = Date.now()
    const branchName = `fix/cnpj-line-${t.line_number}-${timestamp}`
    const repoFullName = (repo?.full_name || repo?.name) as string
    const [owner, repoName] = repoFullName.split("/")

    let prNumber: number | undefined
    let prUrl: string | undefined
    let commitSha: string | undefined

    if (repo?.provider === "github") {
      const github = new GitHubClient({ token: token.access_token as string, owner, repo: repoName })
      const { content } = await github.getFileContent(t.file_path as string)
      const lines = content.split("\n")
      lines[(t.line_number as number) - 1] = t.code_suggested as string
      await github.createBranch({ branchName })
      commitSha = await github.createCommit({
        branch: branchName,
        filePath: t.file_path as string,
        content: lines.join("\n"),
        message: `fix: ${t.title}`,
      })
      if (method === "pull_request") {
        const pr = await github.createPullRequest({
          title: `Fix: ${t.title}`,
          body: `Auto-generated fix by CNPJ Analysis System`,
          head: branchName,
          base: "main",
        })
        prNumber = pr.number
        prUrl = pr.url
      }
    } else if (repo?.provider === "azure") {
      const [organization, project] = owner.split(".")
      const azure = new AzureDevOpsClient({
        token: token.access_token as string,
        organization,
        project,
        repository: repoName,
      })
      const content = await azure.getFileContent(t.file_path as string)
      const lines = content.split("\n")
      lines[(t.line_number as number) - 1] = t.code_suggested as string
      await azure.createBranch({ branchName })
      commitSha = await azure.createCommit({
        branch: branchName,
        filePath: t.file_path as string,
        content: lines.join("\n"),
        message: `fix: ${t.title}`,
      })
      if (method === "pull_request") {
        const pr = await azure.createPullRequest({
          title: `Fix: ${t.title}`,
          description: `Auto-generated fix by CNPJ Analysis System`,
          sourceBranch: branchName,
          targetBranch: "main",
        })
        prNumber = pr.number
        prUrl = pr.url
      }
    } else {
      throw new Error(`Provider ${repo?.provider} not supported yet`)
    }

    await db
      .from("tasks")
      .update({
        pr_url: prUrl,
        pr_number: prNumber,
        pr_branch: branchName,
        pr_status: method === "pull_request" ? "open" : undefined,
        applied_at: new Date().toISOString(),
        applied_by: user_id,
        apply_method: method,
        status: method === "direct_commit" ? "concluido" : "em_progresso",
      })
      .eq("id", t.id as string)

    return NextResponse.json({ success: true, method, pr_url: prUrl, pr_number: prNumber, branch_name: branchName, commit_sha: commitSha })
  } catch (error: unknown) {
    console.error("Error applying fix:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}
