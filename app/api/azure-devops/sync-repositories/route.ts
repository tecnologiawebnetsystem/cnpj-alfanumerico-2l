import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createServerClient()

  try {
    const body = await request.json()
    const { token_id, user_id } = body

    if (!token_id || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get token
    const { data: token, error: tokenError } = await supabase
      .from("github_tokens")
      .select("*")
      .eq("id", token_id)
      .single()

    if (tokenError || !token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 })
    }

    // Fetch repositories from Azure DevOps
    const repos = await fetchAzureRepositoriesComplete(token, token.access_token)

    console.log("[v0] Fetched", repos.length, "repositories from Azure DevOps")

    // Upsert repositories into database
    const reposToUpsert = repos.map((repo: any) => ({
      name: repo.name,
      azure_devops_id: repo.id, // Azure DevOps ID (UUID)
      client_id: token.client_id,
      token_id: token.id,
      project_name: repo.project_name,
      url: repo.url || "",
      is_private: repo.is_private !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { data: upserted, error: upsertError } = await supabase
      .from("repositories")
      .upsert(reposToUpsert, {
        onConflict: "azure_devops_id,client_id",
        ignoreDuplicates: false,
      })
      .select()

    if (upsertError) {
      console.error("[v0] Error upserting repositories:", upsertError)
      return NextResponse.json({ error: "Failed to sync repositories" }, { status: 500 })
    }

    console.log("[v0] Synced", upserted?.length || reposToUpsert.length, "repositories to database")

    return NextResponse.json({
      success: true,
      synced: upserted?.length || reposToUpsert.length,
      repositories: upserted || reposToUpsert,
    })
  } catch (error: any) {
    console.error("[v0] Error in sync-repositories:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function fetchAzureRepositoriesComplete(token: any, accessToken: string) {
  const baseUrl = token.base_url || "https://dev.azure.com"
  let org = token.organization_name || token.scope

  if (org && org.includes("/")) {
    const parts = org.split("/")
    org = parts[parts.length - 1]
  }

  try {
    // Fetch all projects
    const projectsUrl = `${baseUrl}/${org}/_apis/projects?api-version=7.0`
    const projectsResponse = await fetch(projectsUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`:${accessToken}`).toString("base64")}`,
      },
    })

    if (!projectsResponse.ok) {
      throw new Error(`Failed to fetch projects: ${projectsResponse.status}`)
    }

    const projects = await projectsResponse.json()
    const allRepositories: any[] = []

    // Fetch repositories for each project
    for (const project of projects.value || []) {
      const reposUrl = `${baseUrl}/${org}/${project.name}/_apis/git/repositories?api-version=7.0`
      const reposResponse = await fetch(reposUrl, {
        headers: {
          Authorization: `Basic ${Buffer.from(`:${accessToken}`).toString("base64")}`,
        },
      })

      if (reposResponse.ok) {
        const reposData = await reposResponse.json()
        const repos = (reposData.value || []).map((repo: any) => ({
          id: repo.id, // Azure DevOps ID
          name: repo.name,
          project_name: project.name,
          url: repo.webUrl || repo.remoteUrl,
          is_private: true, // Azure DevOps repos are typically private
        }))

        allRepositories.push(...repos)
      }
    }

    return allRepositories
  } catch (error: any) {
    console.error("[v0] Error fetching Azure repositories:", error)
    return []
  }
}
