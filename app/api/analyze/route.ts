import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, getUserFromToken } from "@/lib/supabase/server"
import { CNPJDetector } from "@/lib/analyzer/cnpj-detector"

interface AnalyzeRequest {
  repositoryIds: string[]
  accountName: string
  searchPatterns?: Array<{
    field_name: string
    pattern: string
    description?: string
  }>
  analysisMethod?: "cloud" | "local"
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function POST(request: NextRequest) {
  console.log(" ========== ANALYZE API START ==========")

  let supabase: any // Declare supabase variable

  try {
    console.log(" Step 1: Creating Supabase client...")
    supabase = await createServerClient()
    console.log(" Step 1: ✓ Supabase client created")

    console.log(" Step 2: Parsing request body...")
    const body: AnalyzeRequest = await request.json()

    if (!body) {
      console.log(" Step 2: ✗ Empty request body")
      return NextResponse.json({ error: "Corpo da requisição vazio" }, { status: 400 })
    }

    const { repositoryIds, accountName, searchPatterns, analysisMethod = "cloud" } = body

    if (!repositoryIds || !Array.isArray(repositoryIds) || repositoryIds.length === 0) {
      console.log(" Step 2: ✗ Invalid or empty repositoryIds")
      return NextResponse.json({ error: "IDs de repositórios inválidos ou vazios" }, { status: 400 })
    }

    if (!accountName) {
      console.log(" Step 2: ✗ Missing accountName")
      return NextResponse.json({ error: "Nome da conta é obrigatório" }, { status: 400 })
    }

    console.log(" Step 2: ✓ Request parsed", {
      repositoryCount: repositoryIds.length,
      accountName,
      analysisMethod,
      hasCustomPatterns: !!searchPatterns?.length,
    })

    console.log(" Step 3: Getting current user from token...")
    const authHeader = request.headers.get("authorization")
    const user = await getUserFromToken(authHeader)

    if (!user) {
      console.log(" Step 3: ✗ User not authenticated")
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    console.log(" Step 3: ✓ User authenticated:", user.email, "Role:", user.role)

    console.log(" Step 4: Creating batch analysis...")
    const batchId = globalThis.crypto.randomUUID()

    try {
      const { data: batchData, error: rpcError } = await supabase.rpc("create_batch_analysis", {
        p_id: batchId,
        p_client_id: user.client_id,
        p_user_id: user.id,
        p_total_repos: repositoryIds.length,
      })

      if (rpcError) {
        console.log(" Step 4: RPC failed, using direct insert...", rpcError.message)
        const { error: insertError } = await supabase.from("batch_analyses").insert({
          id: batchId,
          client_id: user.client_id,
          user_id: user.id,
          status: "in_progress",
          started_at: new Date().toISOString(),
          total_repositories: repositoryIds.length,
          completed_repositories: 0,
        })

        if (insertError) {
          console.log(" Step 4: ✗ Failed to create batch", insertError)
          throw insertError
        }
      }

      console.log(" Step 4: ✓ Batch created:", batchId)
    } catch (batchError: any) {
      console.log(" Step 4: ✗ Batch creation failed", batchError)
      return NextResponse.json({ error: "Erro ao criar lote de análise", details: batchError.message }, { status: 500 })
    }

    console.log(" Step 5: Fetching repositories from database...")
    const { data: repos, error: reposError } = await supabase
      .from("repositories")
      .select("id, name, url")
      .in("id", repositoryIds)

    if (reposError || !repos || repos.length === 0) {
      console.log(" Step 5: ✗ No repositories found in database")

      try {
        const syncResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/azure-devops/sync-repositories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: request.headers.get("Authorization") || "",
            },
            body: JSON.stringify({
              accountName,
              repositoryIds,
            }),
          },
        )

        if (!syncResponse.ok) {
          throw new Error("Failed to sync repositories")
        }

        const { data: syncedRepos, error: syncError } = await supabase
          .from("repositories")
          .select("id, name, url")
          .in("id", repositoryIds)

        if (syncError || !syncedRepos || syncedRepos.length === 0) {
          console.log(" Step 5: ✗ Still no repositories after sync")
          return NextResponse.json({ error: "Não foi possível sincronizar repositórios" }, { status: 404 })
        }

        console.log(" Step 5: ✓ Synced and loaded", syncedRepos.length, "repositories")
      } catch (syncErr: any) {
        console.log(" Step 5: ✗ Sync failed:", syncErr.message)
        return NextResponse.json(
          { error: "Erro ao sincronizar repositórios", details: syncErr.message },
          { status: 500 },
        )
      }
    } else {
      console.log(" Step 5: ✓ Loaded", repos.length, "repositories")
    }

    console.log(" Step 6: Loading search patterns...")
    let patterns = searchPatterns || []

    if (!patterns.length) {
      try {
        const { data: dbPatterns } = await supabase
          .from("search_patterns")
          .select("field_name, pattern, description")
          .eq("user_id", user.id)
          .eq("is_active", true)

        if (dbPatterns && dbPatterns.length > 0) {
          patterns = dbPatterns
          console.log(" Step 6: ✓ Loaded", patterns.length, "custom patterns")
        } else {
          patterns = [
            { field_name: "CNPJ", pattern: "CNPJ", description: "CNPJ padrão" },
            { field_name: "NR_INSCRICAO", pattern: "NR_INSCRICAO", description: "Número de inscrição" },
          ]
          console.log(" Step 6: ✓ Using default patterns")
        }
      } catch (patternError) {
        patterns = [
          { field_name: "CNPJ", pattern: "CNPJ", description: "CNPJ padrão" },
          { field_name: "NR_INSCRICAO", pattern: "NR_INSCRICAO", description: "Número de inscrição" },
        ]
        console.log(" Step 6: Using default patterns (error loading custom patterns)")
      }
    }

    console.log(" Step 7: Initializing CNPJ detector...")
    const detector = new CNPJDetector(patterns.map((p) => p.field_name))
    console.log(" Step 7: ✓ Detector initialized")

    console.log(" Step 8: Starting repository analysis...")
    let completedCount = 0
    let totalFindings = 0
    let totalFiles = 0

    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i]
      console.log(` Step 8.${i + 1}: Analyzing repository ${i + 1}/${repos.length}:`, repo.name)

      try {
        const analysisId = globalThis.crypto.randomUUID()

        console.log(` Step 8.${i + 1}.1: Creating analysis record...`)
        const { error: analysisError } = await supabase.from("analyses").insert({
          id: analysisId,
          batch_id: batchId,
          client_id: user.client_id,
          user_id: user.id,
          repository_id: repo.id,
          status: "in_progress",
          started_at: new Date().toISOString(),
        })

        if (analysisError) {
          console.log(` Step 8.${i + 1}.1: ✗ Failed to create analysis`, analysisError)
          continue
        }

        console.log(` Step 8.${i + 1}.2: Fetching repository files...`)
        const azureOrg = process.env.AZURE_DEVOPS_ORG || "BS2Tech"
        const azureToken = process.env.AZURE_DEVOPS_TOKEN
        const azureBaseUrl = process.env.AZURE_DEVOPS_BASE_URL || "https://dev.azure.com"

        if (!azureToken) {
          console.log(` Step 8.${i + 1}.2: ✗ No Azure DevOps token`)
          throw new Error("Azure DevOps token não configurado")
        }

        const filesUrl = `${azureBaseUrl}/${azureOrg}/_apis/git/repositories/${repo.name}/items?recursionLevel=Full&api-version=7.0`
        const filesResponse = await fetch(filesUrl, {
          headers: {
            Authorization: `Basic ${Buffer.from(`:${azureToken}`).toString("base64")}`,
            "Content-Type": "application/json",
          },
        })

        if (!filesResponse.ok) {
          console.log(` Step 8.${i + 1}.2: ✗ Failed to fetch files`)
          throw new Error("Failed to fetch repository files")
        }

        const filesData = await filesResponse.json()
        const files = filesData.value.filter((item: any) => !item.isFolder)
        totalFiles += files.length

        console.log(` Step 8.${i + 1}.3: Analyzing ${files.length} files...`)

        for (const file of files) {
          try {
            const contentUrl = `${azureBaseUrl}/${azureOrg}/_apis/git/repositories/${repo.name}/items?path=${encodeURIComponent(file.path)}&api-version=7.0`
            const contentResponse = await fetch(contentUrl, {
              headers: {
                Authorization: `Basic ${Buffer.from(`:${azureToken}`).toString("base64")}`,
                "Content-Type": "text/plain",
              },
            })

            if (!contentResponse.ok) continue

            const content = await contentResponse.text()
            const language = file.path.split(".").pop() || "unknown"
            const results = await detector.analyzeFile(file.path, content, language)

            if (results.length > 0) {
              console.log(` Found ${results.length} findings in ${file.path}`)

              for (const finding of results) {
                const { error: findingError } = await supabase.from("findings").insert({
                  id: globalThis.crypto.randomUUID(),
                  analysis_id: analysisId,
                  file_path: finding.file,
                  line_number: finding.line,
                  cnpj_found: finding.cnpj_found || "",
                  field_name: finding.fieldName,
                  context: finding.context,
                  suggestion: finding.suggestion,
                  code_before: finding.code_before,
                  code_current: finding.code_current,
                  code_after: finding.code_after,
                  code_suggested: finding.code_suggested,
                  cnpj_replacement: finding.cnpj_replacement,
                  action_required: finding.action_required,
                  observation: finding.observation,
                  client_id: user.client_id,
                })

                if (!findingError) {
                  totalFindings++
                }
              }
            }
          } catch (fileError) {
            console.log(` Error analyzing file ${file.path}:`, fileError)
          }
        }

        const { error: updateAnalysisError } = await supabase
          .from("analyses")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", analysisId)

        if (updateAnalysisError) {
          console.log(` Failed to update analysis status`, updateAnalysisError)
        }

        completedCount++
        const progress = Math.round((completedCount / repos.length) * 100)

        console.log(` Step 8.${i + 1}.4: Updating batch progress...`)
        try {
          await supabase.rpc("update_batch_progress", {
            p_batch_id: batchId,
            p_completed: completedCount,
            p_total_findings: totalFindings,
            p_total_files: totalFiles,
            p_progress: progress,
          })
        } catch (rpcError) {
          await supabase
            .from("batch_analyses")
            .update({
              completed_repositories: completedCount,
              total_findings: totalFindings,
              total_files: totalFiles,
              progress: progress,
            })
            .eq("id", batchId)
        }

        console.log(` Step 8.${i + 1}: ✓ Repository ${i + 1}/${repos.length} completed (${progress}%)`)
      } catch (repoError: any) {
        console.log(` Step 8.${i + 1}: ✗ Error analyzing repository:`, repoError.message)
        continue
      }
    }

    console.log(" Step 9: Finalizing batch analysis...")
    try {
      await supabase.rpc("complete_batch_analysis", {
        p_batch_id: batchId,
        p_total_findings: totalFindings,
        p_total_files: totalFiles,
      })
    } catch (rpcError) {
      await supabase
        .from("batch_analyses")
        .update({
          status: "completed",
          error_message: rpcError.message,
          completed_at: new Date().toISOString(),
          total_findings: totalFindings,
          total_files: totalFiles,
          progress: 100, // Garantir 100% ao invés de 99%
        })
        .eq("id", batchId)
    }
    console.log(" Step 9: ✓ Batch finalized")

    console.log(" ========== ANALYZE API SUCCESS ==========")
    return NextResponse.json({
      success: true,
      batchId,
      stats: {
        totalRepositories: repos.length,
        completedRepositories: completedCount,
        totalFindings,
        totalFiles,
      },
    })
  } catch (error: any) {
    console.log(" ========== FATAL ERROR ==========")
    console.log(" Error type:", error.constructor.name)
    console.log(" Error message:", error.message)
    console.log(" Error stack:", error.stack)
    console.log(" =====================================")

    try {
      const batchId = error.batchId || null
      if (batchId) {
        await supabase
          .from("batch_analyses")
          .update({
            status: "failed",
            error_message: error.message,
            completed_at: new Date().toISOString(),
          })
          .eq("id", batchId)
      }
    } catch (updateError) {
      console.error(" Failed to update batch status:", updateError)
    }

    return NextResponse.json(
      {
        error: "Erro ao processar análise",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
