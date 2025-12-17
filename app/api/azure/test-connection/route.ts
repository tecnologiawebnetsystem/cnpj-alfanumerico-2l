export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const { organization, pat, project } = await request.json()

    console.log("[v0] Testing Azure connection...")
    console.log("[v0] Organization:", organization)
    console.log("[v0] Project:", project)

    // Detect if on-premise
    let baseUrl = "https://dev.azure.com"
    let org = organization

    if (organization.includes("://")) {
      const urlMatch = organization.match(/(https?:\/\/[^/]+)\/(.+)/)
      if (urlMatch) {
        baseUrl = urlMatch[1]
        org = urlMatch[2]
        console.log("[v0] Detected on-premise - Base:", baseUrl, "Org:", org)
      }
    }

    const results = {
      step1_base_url: "",
      step2_projects: "",
      step3_repositories: "",
      errors: [],
    }

    // Step 1: Test base URL
    try {
      const testUrl = `${baseUrl}/_apis/connectionData?api-version=6.0`
      console.log("[v0] Step 1 - Testing connection:", testUrl)

      const response = await fetch(testUrl, {
        headers: {
          Authorization: `Basic ${Buffer.from(`:${pat}`).toString("base64")}`,
          Accept: "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      results.step1_base_url = `Status: ${response.status}, Type: ${contentType}`

      if (!response.ok) {
        const text = await response.text()
        results.errors.push(`Step 1 failed: ${text.substring(0, 200)}`)
      } else {
        results.step1_base_url += " ✓ OK"
      }
    } catch (error) {
      results.errors.push(`Step 1 error: ${error.message}`)
    }

    // Step 2: Test projects endpoint
    try {
      const projectsUrl = `${baseUrl}/${org}/_apis/projects?api-version=6.0`
      console.log("[v0] Step 2 - Testing projects:", projectsUrl)

      const response = await fetch(projectsUrl, {
        headers: {
          Authorization: `Basic ${Buffer.from(`:${pat}`).toString("base64")}`,
          Accept: "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      results.step2_projects = `Status: ${response.status}, Type: ${contentType}`

      if (!response.ok) {
        const text = await response.text()
        results.errors.push(`Step 2 failed: ${text.substring(0, 200)}`)
      } else {
        const data = await response.json()
        results.step2_projects += ` ✓ Found ${data.value?.length || 0} projects`
      }
    } catch (error) {
      results.errors.push(`Step 2 error: ${error.message}`)
    }

    // Step 3: Test repositories (if project provided)
    if (project) {
      try {
        const reposUrl = `${baseUrl}/${org}/${project}/_apis/git/repositories?api-version=6.0`
        console.log("[v0] Step 3 - Testing repos:", reposUrl)

        const response = await fetch(reposUrl, {
          headers: {
            Authorization: `Basic ${Buffer.from(`:${pat}`).toString("base64")}`,
            Accept: "application/json",
          },
        })

        const contentType = response.headers.get("content-type")
        results.step3_repositories = `Status: ${response.status}, Type: ${contentType}`

        if (!response.ok) {
          const text = await response.text()
          results.errors.push(`Step 3 failed: ${text.substring(0, 200)}`)
        } else {
          const data = await response.json()
          results.step3_repositories += ` ✓ Found ${data.value?.length || 0} repositories`
        }
      } catch (error) {
        results.errors.push(`Step 3 error: ${error.message}`)
      }
    }

    return Response.json({
      success: results.errors.length === 0,
      results,
      recommendation:
        results.errors.length > 0
          ? "Verifique: 1) PAT tem permissão Code (Read), 2) URL está correta, 3) Organização/Projeto existem"
          : "Conexão OK! Todos os testes passaram.",
    })
  } catch (error) {
    console.error("[v0] Test connection error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
