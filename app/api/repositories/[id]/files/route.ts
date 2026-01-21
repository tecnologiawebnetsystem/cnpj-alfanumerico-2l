import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: repositoryId } = await params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "client_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar repositorio
    const { data: repo, error: repoError } = await supabase
      .from("repositories")
      .select("*")
      .eq("id", repositoryId)
      .eq("client_id", clientId)
      .single()

    if (repoError || !repo) {
      return NextResponse.json({ error: "Repositorio nao encontrado" }, { status: 404 })
    }

    // Buscar conexao para obter o token
    const { data: connection, error: connError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", repo.connection_id)
      .single()

    if (connError || !connection) {
      return NextResponse.json({ error: "Conexao nao encontrada" }, { status: 404 })
    }

    // Buscar configuracoes de extensoes do cliente
    const { data: settingsRows } = await supabase
      .from("client_settings")
      .select("setting_key, setting_value")
      .eq("client_id", clientId)

    const settings: Record<string, any> = {}
    if (settingsRows) {
      for (const row of settingsRows) {
        try {
          settings[row.setting_key] = JSON.parse(row.setting_value)
        } catch {
          settings[row.setting_key] = row.setting_value
        }
      }
    }

    const fileExtensions: string[] = Array.isArray(settings.file_extensions)
      ? settings.file_extensions
      : [".ts", ".tsx", ".js", ".jsx", ".java", ".cs", ".py", ".sql", ".php", ".go", ".rb"]

    const files: { path: string; content: string }[] = []
    const provider = connection.provider

    if (provider === "github") {
      // GitHub API
      const token = connection.access_token
      const repoFullName = repo.full_name || `${repo.owner}/${repo.name}`

      // Get file tree
      const treeUrl = `https://api.github.com/repos/${repoFullName}/git/trees/${repo.default_branch || "main"}?recursive=1`
      const treeRes = await fetch(treeUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!treeRes.ok) {
        return NextResponse.json({ error: "Erro ao buscar arvore de arquivos do GitHub" }, { status: 500 })
      }

      const treeData = await treeRes.json()
      const fileItems = (treeData.tree || [])
        .filter((item: any) => item.type === "blob")
        .filter((item: any) => {
          const ext = "." + (item.path.split(".").pop()?.toLowerCase() || "")
          return fileExtensions.some(allowedExt => allowedExt.toLowerCase() === ext)
        })
        .slice(0, 100) // Limit to 100 files

      // Fetch content of each file
      for (const item of fileItems) {
        try {
          const contentUrl = `https://api.github.com/repos/${repoFullName}/contents/${item.path}?ref=${repo.default_branch || "main"}`
          const contentRes = await fetch(contentUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          })

          if (contentRes.ok) {
            const contentData = await contentRes.json()
            if (contentData.content) {
              const content = Buffer.from(contentData.content, "base64").toString("utf-8")
              files.push({ path: item.path, content })
            }
          }
        } catch (e) {
          console.error(`Error fetching file ${item.path}:`, e)
        }
      }
    } else if (provider === "azure") {
      // Azure DevOps API
      const token = connection.access_token
      const org = connection.organization || connection.azure_organization
      const project = repo.project_name || repo.name

      // Get items
      const itemsUrl = `https://dev.azure.com/${org}/${project}/_apis/git/repositories/${repo.name}/items?recursionLevel=Full&api-version=7.0`
      const itemsRes = await fetch(itemsUrl, {
        headers: {
          Authorization: `Basic ${Buffer.from(`:${token}`).toString("base64")}`,
        },
      })

      if (!itemsRes.ok) {
        return NextResponse.json({ error: "Erro ao buscar arquivos do Azure DevOps" }, { status: 500 })
      }

      const itemsData = await itemsRes.json()
      const fileItems = (itemsData.value || [])
        .filter((item: any) => !item.isFolder)
        .filter((item: any) => {
          const ext = "." + (item.path.split(".").pop()?.toLowerCase() || "")
          return fileExtensions.some(allowedExt => allowedExt.toLowerCase() === ext)
        })
        .slice(0, 100) // Limit to 100 files

      // Fetch content of each file
      for (const item of fileItems) {
        try {
          const contentUrl = `https://dev.azure.com/${org}/${project}/_apis/git/repositories/${repo.name}/items?path=${encodeURIComponent(item.path)}&api-version=7.0`
          const contentRes = await fetch(contentUrl, {
            headers: {
              Authorization: `Basic ${Buffer.from(`:${token}`).toString("base64")}`,
            },
          })

          if (contentRes.ok) {
            const content = await contentRes.text()
            // Remove path leading slash
            const cleanPath = item.path.startsWith("/") ? item.path.slice(1) : item.path
            files.push({ path: cleanPath, content })
          }
        } catch (e) {
          console.error(`Error fetching file ${item.path}:`, e)
        }
      }
    } else {
      return NextResponse.json({ error: `Provider ${provider} nao suportado para download` }, { status: 400 })
    }

    return NextResponse.json({
      repository: repo.name,
      files,
      total: files.length,
    })
  } catch (error: any) {
    console.error("Error fetching repository files:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno ao buscar arquivos" },
      { status: 500 }
    )
  }
}
