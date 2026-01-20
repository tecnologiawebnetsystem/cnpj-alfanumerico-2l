import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CNPJDetector } from "@/lib/analyzer/cnpj-detector"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repository_ids, client_id } = body

    if (!repository_ids || !Array.isArray(repository_ids) || repository_ids.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um repositorio" }, { status: 400 })
    }

    if (!client_id) {
      return NextResponse.json({ error: "client_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar configuracoes de IA do cliente
    const { data: aiSettings } = await supabase
      .from("ai_provider_settings")
      .select("*")
      .eq("client_id", client_id)
      .eq("provider", "gemini")
      .eq("is_active", true)
      .single()

    // Buscar configuracoes de campos CNPJ e extensoes
    const { data: clientSettingsRows } = await supabase
      .from("client_settings")
      .select("setting_key, setting_value")
      .eq("client_id", client_id)
    
    // Parse client settings - values are stored as JSON strings
    const clientSettings: Record<string, any> = {}
    if (clientSettingsRows) {
      for (const row of clientSettingsRows) {
        try {
          clientSettings[row.setting_key] = JSON.parse(row.setting_value)
        } catch {
          clientSettings[row.setting_key] = row.setting_value
        }
      }
    }
    
    // Get CNPJ field names (already parsed as array from JSON)
    const cnpjFieldNames: string[] = Array.isArray(clientSettings.cnpj_field_names) 
      ? clientSettings.cnpj_field_names
      : typeof clientSettings.cnpj_field_names === "string"
        ? clientSettings.cnpj_field_names.split(",").map((s: string) => s.trim())
        : ["cnpj", "cpf_cnpj", "documento", "nr_cnpj", "num_cnpj", "inscricao", "inscricaofederal", "cadastro_nacional"]
    
    // Get file extensions (already parsed as array from JSON)
    const fileExtensions: string[] = Array.isArray(clientSettings.file_extensions)
      ? clientSettings.file_extensions
      : typeof clientSettings.file_extensions === "string"
        ? clientSettings.file_extensions.split(",").map((s: string) => s.trim())
        : [".ts", ".tsx", ".js", ".jsx", ".java", ".cs", ".py", ".sql", ".php", ".go", ".rb"]
    
    console.log("========== ANALYSIS SETTINGS LOADED ==========")
    console.log("CNPJ Field Names:", cnpjFieldNames)
    console.log("File Extensions:", fileExtensions)
    console.log("AI Enabled:", !!aiSettings)
    console.log("===============================================")

    // Initialize CNPJ Detector with configured field names
    const detector = new CNPJDetector(cnpjFieldNames)

    // Criar registro de batch analysis
    const { data: batch, error: batchError } = await supabase
      .from("batch_analyses")
      .insert({
        client_id: client_id,
        name: `Analise Sequencial - ${new Date().toLocaleString("pt-BR")}`,
        status: "processing",
        total_repositories: repository_ids.length,
        completed_repositories: 0,
        failed_repositories: 0,
        analysis_method: "sequential",
      })
      .select()
      .single()

    if (batchError) {
      console.error("Erro ao criar batch:", batchError)
      throw batchError
    }

    // Criar registro de analysis principal
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        batch_id: batch.id,
        client_id: client_id,
        status: "processing",
        progress: 0,
      })
      .select()
      .single()

    if (analysisError) {
      console.error("Erro ao criar analysis:", analysisError)
      throw analysisError
    }

    // Processar repositorios sequencialmente
    const results = []
    let totalFindings = 0
    let completedRepos = 0
    let failedRepos = 0

    for (let i = 0; i < repository_ids.length; i++) {
      const repoId = repository_ids[i]

      try {
        // Buscar informacoes do repositorio
        const { data: repo } = await supabase
          .from("repositories")
          .select("*")
          .eq("id", repoId)
          .single()

        if (!repo) {
          failedRepos++
          results.push({
            repositoryId: repoId,
            status: "error",
            error: "Repositorio nao encontrado",
          })
          continue
        }

        console.log(`\n========== ANALYZING REPOSITORY ${i + 1}/${repository_ids.length}: ${repo.name} ==========`)

        // Buscar integracao do cliente para obter tokens
        const { data: integration } = await supabase
          .from("integrations")
          .select("*")
          .eq("client_id", client_id)
          .eq("provider", repo.provider || "azure")
          .single()

        if (!integration) {
          failedRepos++
          results.push({
            repositoryId: repoId,
            repositoryName: repo.name,
            status: "error",
            error: "Integracao nao encontrada para o provider",
          })
          continue
        }

        // Criar log de clone
        const { data: cloneLog } = await supabase
          .from("repository_clone_logs")
          .insert({
            repository_id: repoId,
            analysis_id: analysis.id,
            status: "analyzing",
            clone_started_at: new Date().toISOString(),
          })
          .select()
          .single()

        // Atualizar progresso
        const progress = Math.round(((i + 0.5) / repository_ids.length) * 100)
        await supabase
          .from("analyses")
          .update({ progress, status: "processing" })
          .eq("id", analysis.id)

        // ANALISE REAL: Buscar arquivos via API do provider
        let findings: any[] = []
        let filesProcessed = 0

        if (repo.provider === "github" || integration.provider === "github") {
          // GitHub API
          const githubResult = await analyzeGitHubRepository(
            repo, 
            integration.access_token, 
            fileExtensions, 
            detector
          )
          findings = githubResult.findings
          filesProcessed = githubResult.filesProcessed
        } else {
          // Azure DevOps API
          const azureResult = await analyzeAzureRepository(
            repo, 
            integration, 
            fileExtensions, 
            detector
          )
          findings = azureResult.findings
          filesProcessed = azureResult.filesProcessed
        }

        console.log(`Found ${findings.length} findings in ${filesProcessed} files`)

        // Processar com IA se habilitado
        if (aiSettings && findings.length > 0) {
          console.log("Processing findings with AI...")
          findings = await processWithAI(findings, aiSettings)
        }

        // Salvar findings
        if (findings.length > 0) {
          const findingsToInsert = findings.map((f: any) => ({
            analysis_id: analysis.id,
            repository_id: repoId,
            file_path: f.file_path,
            line_number: f.line_number,
            field_name: f.field_name,
            context: f.context,
            code_context: f.code_context,
            code_before_lines: f.code_before_lines,
            code_after_lines: f.code_after_lines,
            suggestion: f.suggestion,
            action_required: f.action_required,
            ai_analysis: f.ai_analysis,
            ai_suggestion: f.ai_suggestion,
            ai_confidence: f.ai_confidence,
            ai_analyzed_at: aiSettings ? new Date().toISOString() : null,
          }))

          await supabase.from("findings").insert(findingsToInsert)
          totalFindings += findings.length
        }

        // Atualizar log de clone
        await supabase
          .from("repository_clone_logs")
          .update({
            status: "completed",
            clone_completed_at: new Date().toISOString(),
            analysis_completed_at: new Date().toISOString(),
            cleanup_at: new Date().toISOString(),
            files_processed: filesProcessed,
            findings_count: findings.length,
          })
          .eq("id", cloneLog?.id)

        completedRepos++
        results.push({
          repositoryId: repoId,
          repositoryName: repo.name,
          status: "success",
          filesProcessed,
          findingsCount: findings.length,
        })
      } catch (error: any) {
        console.error(`Error analyzing repository ${repoId}:`, error)
        failedRepos++
        results.push({
          repositoryId: repoId,
          status: "error",
          error: error.message,
        })
      }
    }

    // Atualizar batch com resultados finais
    await supabase
      .from("batch_analyses")
      .update({
        status: "completed",
        completed_repositories: completedRepos,
        failed_repositories: failedRepos,
        completed_at: new Date().toISOString(),
      })
      .eq("id", batch.id)

    // Atualizar analysis com resultados finais
    await supabase
      .from("analyses")
      .update({
        status: "completed",
        progress: 100,
        results: {
          total_findings: totalFindings,
          repositories_processed: completedRepos,
          repositories_failed: failedRepos,
        },
      })
      .eq("id", analysis.id)

    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      analysis_id: analysis.id,
      total_findings: totalFindings,
      completed_repositories: completedRepos,
      failed_repositories: failedRepos,
      results,
      ai_enabled: !!aiSettings,
    })
  } catch (error: any) {
    console.error("Erro na analise sequencial:", error)
    return NextResponse.json({ error: error.message || "Erro ao iniciar analise" }, { status: 500 })
  }
}

/**
 * Analisa repositorio do GitHub via API (sem git clone)
 */
async function analyzeGitHubRepository(
  repo: any,
  accessToken: string,
  fileExtensions: string[],
  detector: CNPJDetector
): Promise<{ findings: any[]; filesProcessed: number }> {
  const findings: any[] = []
  let filesProcessed = 0

  try {
    // Get repository tree
    const treeUrl = `https://api.github.com/repos/${repo.full_name || repo.owner + '/' + repo.name}/git/trees/main?recursive=1`
    const treeResponse = await fetch(treeUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!treeResponse.ok) {
      // Try master branch
      const masterTreeUrl = treeUrl.replace("/main?", "/master?")
      const masterResponse = await fetch(masterTreeUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })
      if (!masterResponse.ok) {
        console.error("Could not get repository tree")
        return { findings: [], filesProcessed: 0 }
      }
      const treeData = await masterResponse.json()
      return processGitHubTree(repo, treeData, accessToken, fileExtensions, detector)
    }

    const treeData = await treeResponse.json()
    return processGitHubTree(repo, treeData, accessToken, fileExtensions, detector)
  } catch (error) {
    console.error("Error analyzing GitHub repository:", error)
    return { findings, filesProcessed }
  }
}

async function processGitHubTree(
  repo: any,
  treeData: any,
  accessToken: string,
  fileExtensions: string[],
  detector: CNPJDetector
): Promise<{ findings: any[]; filesProcessed: number }> {
  const findings: any[] = []
  let filesProcessed = 0

  const files = (treeData.tree || []).filter((item: any) => {
    if (item.type !== "blob") return false
    const ext = "." + (item.path.split(".").pop()?.toLowerCase() || "")
    return fileExtensions.some(allowedExt => allowedExt.toLowerCase() === ext)
  })

  console.log(`GitHub: Found ${files.length} files to analyze (filtered from ${treeData.tree?.length || 0})`)

  // Analyze each file (limit to 50 files for performance)
  const filesToAnalyze = files.slice(0, 50)

  for (const file of filesToAnalyze) {
    try {
      const contentUrl = `https://api.github.com/repos/${repo.full_name || repo.owner + '/' + repo.name}/contents/${file.path}`
      const contentResponse = await fetch(contentUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!contentResponse.ok) continue

      const contentData = await contentResponse.json()
      const content = Buffer.from(contentData.content || "", "base64").toString("utf-8")

      filesProcessed++

      // Analyze content with CNPJ detector
      const fileFindings = detector.analyze(content, file.path)
      
      for (const finding of fileFindings) {
        findings.push({
          file_path: file.path,
          line_number: finding.lineNumber,
          field_name: finding.fieldName,
          context: finding.line,
          code_context: finding.line,
          code_before_lines: finding.codeBefore,
          code_after_lines: finding.codeAfter,
          suggestion: finding.suggestion || "Verificar compatibilidade com CNPJ alfanumerico",
          action_required: "Atualizar para suportar novo formato CNPJ (12 caracteres alfanumericos)",
        })
      }
    } catch (error) {
      console.error(`Error reading file ${file.path}:`, error)
    }
  }

  return { findings, filesProcessed }
}

/**
 * Analisa repositorio do Azure DevOps via API (sem git clone)
 */
async function analyzeAzureRepository(
  repo: any,
  integration: any,
  fileExtensions: string[],
  detector: CNPJDetector
): Promise<{ findings: any[]; filesProcessed: number }> {
  const findings: any[] = []
  let filesProcessed = 0

  try {
    const azureOrg = integration.azure_organization || integration.organization
    const azureProject = repo.project_name || repo.project || repo.name
    const accessToken = integration.access_token

    const baseUrl = `https://dev.azure.com/${azureOrg}/${azureProject}/_apis/git/repositories/${repo.azure_repo_id || repo.name}`
    const authHeader = `Basic ${Buffer.from(`:${accessToken}`).toString("base64")}`

    // Get repository items (files)
    const itemsUrl = `${baseUrl}/items?recursionLevel=Full&api-version=7.0`
    const itemsResponse = await fetch(itemsUrl, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!itemsResponse.ok) {
      console.error("Could not get Azure repository items:", await itemsResponse.text())
      return { findings: [], filesProcessed: 0 }
    }

    const itemsData = await itemsResponse.json()
    
    // Filter files by extension
    const files = (itemsData.value || []).filter((item: any) => {
      if (item.isFolder) return false
      const ext = "." + (item.path.split(".").pop()?.toLowerCase() || "")
      return fileExtensions.some(allowedExt => allowedExt.toLowerCase() === ext)
    })

    console.log(`Azure: Found ${files.length} files to analyze (filtered from ${itemsData.value?.length || 0})`)

    // Analyze each file (limit to 50 files for performance)
    const filesToAnalyze = files.slice(0, 50)

    for (const file of filesToAnalyze) {
      try {
        const contentUrl = `${baseUrl}/items?path=${encodeURIComponent(file.path)}&api-version=7.0`
        const contentResponse = await fetch(contentUrl, {
          headers: {
            Authorization: authHeader,
          },
        })

        if (!contentResponse.ok) continue

        const content = await contentResponse.text()
        filesProcessed++

        // Analyze content with CNPJ detector
        const fileFindings = detector.analyze(content, file.path)
        
        for (const finding of fileFindings) {
          findings.push({
            file_path: file.path,
            line_number: finding.lineNumber,
            field_name: finding.fieldName,
            context: finding.line,
            code_context: finding.line,
            code_before_lines: finding.codeBefore,
            code_after_lines: finding.codeAfter,
            suggestion: finding.suggestion || "Verificar compatibilidade com CNPJ alfanumerico",
            action_required: "Atualizar para suportar novo formato CNPJ (12 caracteres alfanumericos)",
          })
        }
      } catch (error) {
        console.error(`Error reading file ${file.path}:`, error)
      }
    }

    return { findings, filesProcessed }
  } catch (error) {
    console.error("Error analyzing Azure repository:", error)
    return { findings, filesProcessed }
  }
}

/**
 * Processa findings com IA (Gemini)
 */
async function processWithAI(findings: any[], aiSettings: any): Promise<any[]> {
  const apiKey = aiSettings.api_key
  const model = aiSettings.model_name || "gemini-1.5-flash"

  // Process max 10 findings with AI to avoid timeout
  const findingsToProcess = findings.slice(0, 10)
  const processedFindings = [...findings]

  for (let i = 0; i < findingsToProcess.length; i++) {
    try {
      const finding = findingsToProcess[i]
      
      const prompt = `Analise o seguinte codigo que contem um campo CNPJ e forneca:
1. Uma explicacao do problema (por que precisa ser atualizado para CNPJ alfanumerico)
2. Uma sugestao de codigo corrigido

Arquivo: ${finding.file_path}
Linha: ${finding.line_number}
Campo encontrado: ${finding.field_name}

Codigo atual:
${finding.code_before_lines || ''}
${finding.context}
${finding.code_after_lines || ''}

Responda em JSON com o formato:
{
  "analysis": "explicacao do problema",
  "suggestion": "codigo sugerido para correcao",
  "confidence": 0.0 a 1.0
}`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: aiSettings.temperature || 0.3,
              maxOutputTokens: aiSettings.max_tokens || 2048,
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
        
        // Try to parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const aiResult = JSON.parse(jsonMatch[0])
            processedFindings[i] = {
              ...finding,
              ai_analysis: aiResult.analysis,
              ai_suggestion: aiResult.suggestion,
              ai_confidence: aiResult.confidence || 0.8,
            }
          } catch {
            // If JSON parse fails, use raw text
            processedFindings[i] = {
              ...finding,
              ai_analysis: text,
              ai_suggestion: null,
              ai_confidence: 0.5,
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing finding with AI:", error)
    }
  }

  return processedFindings
}
