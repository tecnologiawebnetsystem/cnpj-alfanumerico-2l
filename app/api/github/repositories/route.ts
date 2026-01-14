import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tokenId = searchParams.get("token_id")
    const userId = searchParams.get("user_id")
    const provider = searchParams.get("provider") || "github"

    if (!tokenId || !userId) {
      return NextResponse.json({ error: "token_id and user_id are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: tokenData, error: tokenError } = await supabase
      .from("github_tokens")
      .select("access_token, scope")
      .eq("id", tokenId)
      .eq("user_id", userId)
      .single()

    if (tokenError || !tokenData) {
      console.error(" Error fetching token:", tokenError?.message || "Token not found")
      return NextResponse.json({ error: "Token not found" }, { status: 404 })
    }

    let repositories: any[] = []

    if (provider === "github") {
      // Fetch GitHub repositories
      const githubResponse = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })

      if (!githubResponse.ok) {
        console.error(" GitHub API error:", githubResponse.status, await githubResponse.text())
        return NextResponse.json(
          { error: "Erro ao buscar repositórios do GitHub. Verifique se o token é válido." },
          { status: githubResponse.status },
        )
      }

      const githubRepos = await githubResponse.json()

      repositories = githubRepos.map((repo: any) => ({
        id: repo.id.toString(),
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || "",
        language: repo.language || "Unknown",
        is_private: repo.private,
        url: repo.html_url,
        clone_url: repo.clone_url,
        default_branch: repo.default_branch,
      }))

      console.log(` Fetched ${repositories.length} GitHub repositories`)
    } else if (provider === "azure") {
      const organization = tokenData.scope

      if (!organization) {
        return NextResponse.json({ error: "Organização do Azure DevOps não encontrada" }, { status: 400 })
      }

      let baseUrl = "https://dev.azure.com"
      let org = organization

      const isOnPremise = organization.includes("://") && !organization.includes("dev.azure.com")

      if (isOnPremise) {
        console.log(" DETECTED ON-PREMISE Azure DevOps:", organization)
        return NextResponse.json(
          {
            error: "azure_onpremise_requires_worker",
            message:
              "Azure DevOps On-Premise detectado. Servidores internos bloqueiam requisições externas por segurança. Você DEVE usar o Worker Local para análise.",
            requiresWorker: true,
            serverUrl: organization,
          },
          { status: 400 },
        )
      }

      // Check if organization contains a custom URL
      if (organization.includes("://")) {
        const urlMatch = organization.match(/(https?:\/\/[^/]+)\/(.+)/)
        if (urlMatch) {
          baseUrl = urlMatch[1]
          org = urlMatch[2]
          console.log(` Using custom Azure base URL: ${baseUrl}, org: ${org}`)
        }
      } else if (organization.includes("dev.azure.com/")) {
        const match = organization.match(/dev\.azure\.com\/([^/]+)/i)
        if (match && match[1]) {
          org = match[1]
        } else {
          const parts = organization.split("/")
          org = parts[parts.length - 1] || organization
        }
      }

      console.log(` Using Azure DevOps organization: ${org}`)

      // Azure DevOps API: List all projects first
      const projectsResponse = await fetch(`${baseUrl}/${org}/_apis/projects?api-version=7.0`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`:${tokenData.access_token}`).toString("base64")}`,
          Accept: "application/json",
        },
      })

      if (!projectsResponse.ok) {
        const errorText = await projectsResponse.text()
        console.error(" Azure DevOps API error:", projectsResponse.status, errorText)

        if (projectsResponse.status === 401) {
          return NextResponse.json(
            {
              error:
                "Token do Azure DevOps inválido ou expirado. Por favor, gere um novo Personal Access Token com as permissões corretas.",
            },
            { status: 401 },
          )
        }

        return NextResponse.json(
          {
            error: `Erro ao buscar projetos do Azure DevOps. Status: ${projectsResponse.status}. Verifique se a URL (${baseUrl}/${org}) está correta e o token tem permissões de leitura.`,
          },
          { status: projectsResponse.status },
        )
      }

      const projectsContentType = projectsResponse.headers.get("content-type")
      if (!projectsContentType?.includes("application/json")) {
        const errorText = await projectsResponse.text()
        console.error(" Azure DevOps returned non-JSON for projects:", errorText.substring(0, 200))
        return NextResponse.json(
          {
            error: `Azure DevOps retornou resposta inválida. Verifique se a URL está correta: ${baseUrl}/${org}/_apis/projects. Resposta: ${errorText.substring(0, 100)}`,
          },
          { status: 502 },
        )
      }

      const projects = await projectsResponse.json()

      if (!projects || !projects.value || !Array.isArray(projects.value)) {
        console.error(" Invalid projects data structure:", projects)
        return NextResponse.json(
          {
            error: "Estrutura de dados inválida retornada pelo Azure DevOps. Verifique se a organização existe.",
          },
          { status: 502 },
        )
      }

      // For each project, fetch repositories
      let fetchedProjectsCount = 0
      const maxProjects = 100 // Limit to prevent rate limiting

      for (const project of projects.value?.slice(0, maxProjects) || []) {
        try {
          const reposResponse = await fetch(
            `${baseUrl}/${org}/${project.name}/_apis/git/repositories?api-version=7.0`,
            {
              headers: {
                Authorization: `Basic ${Buffer.from(`:${tokenData.access_token}`).toString("base64")}`,
                Accept: "application/json",
              },
            },
          )

          if (reposResponse.status === 429) {
            console.warn(` Rate limit hit for project ${project.name}, skipping remaining projects`)
            break
          }

          if (!reposResponse.ok) {
            console.warn(` Error fetching repos for project ${project.name}: ${reposResponse.status}`)
            continue
          }

          const contentType = reposResponse.headers.get("content-type")
          if (!contentType?.includes("application/json")) {
            const errorText = await reposResponse.text()
            console.warn(` Non-JSON response for project ${project.name}: ${errorText.substring(0, 100)}`)
            continue
          }

          const reposData = await reposResponse.json()

          if (!reposData || !Array.isArray(reposData.value)) {
            console.warn(` Invalid repos data structure for project ${project.name}`)
            continue
          }

          repositories.push(
            ...(reposData.value || []).map((repo: any) => ({
              id: repo.id,
              name: repo.name,
              full_name: `${project.name}/${repo.name}`,
              description: project.description || "",
              language: "Unknown",
              is_private: true,
              url: repo.webUrl,
              clone_url: repo.remoteUrl,
              default_branch: repo.defaultBranch?.replace("refs/heads/", "") || "main",
              project: project.name,
            })),
          )

          fetchedProjectsCount++
        } catch (projectError) {
          console.warn(` Error processing project ${project.name}:`, projectError)
          continue
        }
      }

      console.log(
        ` Fetched ${repositories.length} Azure DevOps repositories from ${fetchedProjectsCount}/${projects.value?.length || 0} projects`,
      )
    } else if (provider === "gitlab") {
      // GitLab API: List user's projects
      const gitlabResponse = await fetch(
        "https://gitlab.com/api/v4/projects?membership=true&per_page=100&order_by=updated_at",
        {
          headers: {
            "PRIVATE-TOKEN": tokenData.access_token,
            Accept: "application/json",
          },
        },
      )

      if (!gitlabResponse.ok) {
        console.error(" GitLab API error:", gitlabResponse.status, await gitlabResponse.text())
        return NextResponse.json(
          { error: "Erro ao buscar repositórios do GitLab. Verifique se o token é válido." },
          { status: gitlabResponse.status },
        )
      }

      const gitlabProjects = await gitlabResponse.json()

      repositories = gitlabProjects.map((project: any) => ({
        id: project.id.toString(),
        name: project.name,
        full_name: project.path_with_namespace,
        description: project.description || "",
        language: project.languages?.[0] || "Unknown",
        is_private: project.visibility === "private",
        url: project.web_url,
        clone_url: project.http_url_to_repo,
        default_branch: project.default_branch || "main",
      }))

      console.log(` Fetched ${repositories.length} GitLab repositories`)
    }

    return NextResponse.json({ repositories })
  } catch (error) {
    console.error(" Error in GET /api/github/repositories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
