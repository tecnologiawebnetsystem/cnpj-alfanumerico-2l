import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CNPJDetector } from "@/lib/analyzer/cnpj-detector"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repository_id, batch_id, client_id, report_type } = body

    if (!repository_id || !client_id) {
      return NextResponse.json({ error: "repository_id e client_id obrigatorios" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar configuracoes do cliente
    const { data: clientSettingsRows } = await supabase
      .from("client_settings")
      .select("setting_key, setting_value")
      .eq("client_id", client_id)
    
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
    
    const cnpjFieldNames: string[] = Array.isArray(clientSettings.cnpj_field_names) 
      ? clientSettings.cnpj_field_names
      : ["cnpj", "cpf_cnpj", "documento", "nr_cnpj", "num_cnpj", "inscricao", "inscricaofederal", "cadastro_nacional"]
    
    const fileExtensions: string[] = Array.isArray(clientSettings.file_extensions)
      ? clientSettings.file_extensions
      : [".ts", ".tsx", ".js", ".jsx", ".java", ".cs", ".py", ".sql", ".php", ".go", ".rb"]

    // Buscar configuracoes de IA
    const { data: aiSettings } = await supabase
      .from("ai_provider_settings")
      .select("*")
      .eq("client_id", client_id)
      .eq("is_active", true)
      .single()

    // Inicializar detector
    const detector = new CNPJDetector(cnpjFieldNames)

    // Buscar informacoes do repositorio
    const { data: repo, error: repoError } = await supabase
      .from("repositories")
      .select("*")
      .eq("id", repository_id)
      .single()

    if (repoError || !repo) {
      return NextResponse.json({ error: "Repositorio nao encontrado" }, { status: 404 })
    }

    // Buscar integracao
    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("client_id", client_id)
      .single()

    if (!integration) {
      return NextResponse.json({ error: "Integracao nao encontrada" }, { status: 404 })
    }

    // Criar registro de analysis
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        batch_id: batch_id,
        repository_id: repository_id,
        client_id: client_id,
        status: "processing",
        progress: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (analysisError) throw analysisError

    // Criar log de clone
    await supabase.from("repository_clone_logs").insert({
      repository_id: repository_id,
      analysis_id: analysis.id,
      status: "analyzing",
      clone_started_at: new Date().toISOString(),
    })

    // Analisar repositorio via API
    let findings: any[] = []
    let filesProcessed = 0

    if (repo.provider === "github" || integration.provider === "github") {
      const result = await analyzeGitHubRepository(repo, integration.access_token, fileExtensions, detector)
      findings = result.findings
      filesProcessed = result.filesProcessed
    } else {
      const result = await analyzeAzureRepository(repo, integration, fileExtensions, detector)
      findings = result.findings
      filesProcessed = result.filesProcessed
    }

    // Processar com IA se habilitado
    if (aiSettings && findings.length > 0) {
      findings = await processWithAI(findings, aiSettings)
    }

    // Salvar findings
    if (findings.length > 0) {
      const findingsToInsert = findings.map((f: any) => ({
        analysis_id: analysis.id,
        client_id: client_id,
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
        repository: repo.name || repo.full_name,
      }))

      await supabase.from("findings").insert(findingsToInsert)
    }

    // Atualizar analysis
    await supabase
      .from("analyses")
      .update({
        status: "completed",
        progress: 100,
        completed_at: new Date().toISOString(),
        results: {
          files_processed: filesProcessed,
          findings_count: findings.length,
          ai_enabled: !!aiSettings,
        },
      })
      .eq("id", analysis.id)

    // Atualizar repositorio com last_analyzed_at
    await supabase
      .from("repositories")
      .update({ last_analyzed_at: new Date().toISOString() })
      .eq("id", repository_id)

    // Atualizar batch
    if (batch_id) {
      const { data: batch } = await supabase
        .from("batch_analyses")
        .select("completed_repositories, total_findings")
        .eq("id", batch_id)
        .single()

      await supabase
        .from("batch_analyses")
        .update({
          completed_repositories: (batch?.completed_repositories || 0) + 1,
          total_findings: (batch?.total_findings || 0) + findings.length,
          total_files: (batch?.total_findings || 0) + filesProcessed,
        })
        .eq("id", batch_id)
    }

    return NextResponse.json({
      success: true,
      analysis_id: analysis.id,
      repository_name: repo.name || repo.full_name,
      files_processed: filesProcessed,
      findings_count: findings.length,
      ai_enabled: !!aiSettings,
    })
  } catch (error: any) {
    console.error("Erro ao analisar repositorio:", error)
    return NextResponse.json({ error: error.message || "Erro ao analisar" }, { status: 500 })
  }
}

// Funcoes auxiliares (mesmas do analyze-sequential)
async function analyzeGitHubRepository(
  repo: any,
  accessToken: string,
  fileExtensions: string[],
  detector: any
): Promise<{ findings: any[]; filesProcessed: number }> {
  const findings: any[] = []
  let filesProcessed = 0

  try {
    const treeUrl = `https://api.github.com/repos/${repo.full_name || repo.name}/git/trees/${repo.default_branch || "main"}?recursive=1`
    const treeResponse = await fetch(treeUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!treeResponse.ok) {
      // Try master branch
      const masterTreeUrl = treeUrl.replace(`/${repo.default_branch || "main"}?`, "/master?")
      const masterResponse = await fetch(masterTreeUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })
      if (!masterResponse.ok) return { findings: [], filesProcessed: 0 }
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
  detector: any
): Promise<{ findings: any[]; filesProcessed: number }> {
  const findings: any[] = []
  let filesProcessed = 0

  const files = (treeData.tree || []).filter((item: any) => {
    if (item.type !== "blob") return false
    const ext = "." + (item.path.split(".").pop()?.toLowerCase() || "")
    return fileExtensions.some(allowedExt => allowedExt.toLowerCase() === ext)
  })

  const filesToAnalyze = files.slice(0, 100)

  for (const file of filesToAnalyze) {
    try {
      const contentUrl = `https://api.github.com/repos/${repo.full_name || repo.name}/contents/${file.path}`
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
          action_required: "Atualizar para suportar novo formato CNPJ",
        })
      }
    } catch (error) {
      console.error(`Error reading file ${file.path}:`, error)
    }
  }

  return { findings, filesProcessed }
}

async function analyzeAzureRepository(
  repo: any,
  integration: any,
  fileExtensions: string[],
  detector: any
): Promise<{ findings: any[]; filesProcessed: number }> {
  const findings: any[] = []
  let filesProcessed = 0

  try {
    const azureOrg = integration.organization
    const azureProject = integration.project || repo.name
    const accessToken = integration.access_token

    const baseUrl = `https://dev.azure.com/${azureOrg}/${azureProject}/_apis/git/repositories/${repo.name}`
    const authHeader = `Basic ${Buffer.from(`:${accessToken}`).toString("base64")}`

    const itemsUrl = `${baseUrl}/items?recursionLevel=Full&api-version=7.0`
    const itemsResponse = await fetch(itemsUrl, {
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
    })

    if (!itemsResponse.ok) return { findings: [], filesProcessed: 0 }

    const itemsData = await itemsResponse.json()
    
    const files = (itemsData.value || []).filter((item: any) => {
      if (item.isFolder) return false
      const ext = "." + (item.path.split(".").pop()?.toLowerCase() || "")
      return fileExtensions.some(allowedExt => allowedExt.toLowerCase() === ext)
    })

    const filesToAnalyze = files.slice(0, 100)

    for (const file of filesToAnalyze) {
      try {
        const contentUrl = `${baseUrl}/items?path=${encodeURIComponent(file.path)}&api-version=7.0`
        const contentResponse = await fetch(contentUrl, { headers: { Authorization: authHeader } })

        if (!contentResponse.ok) continue

        const content = await contentResponse.text()
        filesProcessed++

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
            action_required: "Atualizar para suportar novo formato CNPJ",
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

async function processWithAI(findings: any[], aiSettings: any): Promise<any[]> {
  const apiKey = aiSettings.api_key
  const model = aiSettings.model_name || "gemini-1.5-flash"

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

Responda em JSON: {"analysis": "explicacao", "suggestion": "codigo", "confidence": 0.0-1.0}`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: aiSettings.temperature || 0.3, maxOutputTokens: aiSettings.max_tokens || 2048 },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
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
            processedFindings[i] = { ...finding, ai_analysis: text, ai_confidence: 0.5 }
          }
        }
      }
    } catch (error) {
      console.error("Error processing finding with AI:", error)
    }
  }

  return processedFindings
}
