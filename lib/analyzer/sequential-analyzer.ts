/**
 * Sequential Repository Analyzer
 * Fluxo: Fetch via API -> Analyze -> AI Processing -> Next
 * Processa um repositorio por vez via APIs (GitHub/Azure DevOps)
 * NAO usa git clone - funciona em ambiente serverless
 */

import { createClient } from "@/lib/supabase/server"
import { CNPJDetector } from "@/lib/analyzer/cnpj-detector"

interface AnalysisResult {
  repositoryId: string
  repositoryName: string
  status: "success" | "error" | "skipped"
  filesProcessed: number
  findingsCount: number
  error?: string
  duration: number
}

interface Finding {
  file_path: string
  line_number: number
  field_name: string
  context: string
  code_context: string
  code_before_lines: string
  code_after_lines: string
  suggestion: string
  action_required: string
  ai_analysis?: string
  ai_suggestion?: string
  ai_confidence?: number
}

interface AnalysisProgress {
  totalRepositories: number
  currentRepository: number
  currentRepositoryName: string
  phase: "fetching" | "analyzing" | "ai_processing" | "saving" | "completed"
  filesProcessed: number
  findingsCount: number
  percentage: number
}

export class SequentialAnalyzer {
  private clientId: string
  private analysisId: string
  private onProgress?: (progress: AnalysisProgress) => void
  private aiEnabled: boolean = false
  private aiApiKey: string = ""
  private aiModel: string = "gemini-1.5-flash"
  private cnpjFields: string[] = []
  private fileExtensions: string[] = []
  private detector: CNPJDetector

  constructor(
    clientId: string,
    analysisId: string,
    options?: {
      onProgress?: (progress: AnalysisProgress) => void
      aiEnabled?: boolean
      aiApiKey?: string
      aiModel?: string
      cnpjFields?: string[]
      fileExtensions?: string[]
    }
  ) {
    this.clientId = clientId
    this.analysisId = analysisId
    this.onProgress = options?.onProgress
    this.aiEnabled = options?.aiEnabled || false
    this.aiApiKey = options?.aiApiKey || ""
    this.aiModel = options?.aiModel || "gemini-1.5-flash"
    this.cnpjFields = options?.cnpjFields || ["cnpj", "nr_cnpj", "nrCnpj", "documento", "cpf_cnpj", "inscricao"]
    this.fileExtensions = options?.fileExtensions || [".ts", ".tsx", ".js", ".jsx", ".java", ".cs", ".py", ".sql", ".php"]
    this.detector = new CNPJDetector(this.cnpjFields)
  }

  /**
   * Analisa multiplos repositorios sequencialmente usando APIs (sem git clone)
   */
  async analyzeRepositories(repositoryIds: string[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = []
    const totalRepositories = repositoryIds.length
    const supabase = await createClient()

    for (let i = 0; i < repositoryIds.length; i++) {
      const repoId = repositoryIds[i]
      const startTime = Date.now()

      try {
        // Buscar informacoes do repositorio
        const { data: repo } = await supabase
          .from("repositories")
          .select("*")
          .eq("id", repoId)
          .single()

        if (!repo) {
          results.push({
            repositoryId: repoId,
            repositoryName: "Desconhecido",
            status: "error",
            filesProcessed: 0,
            findingsCount: 0,
            error: "Repositorio nao encontrado",
            duration: Date.now() - startTime,
          })
          continue
        }

        // Buscar integracao do cliente
        const { data: integration } = await supabase
          .from("integrations")
          .select("*")
          .eq("client_id", this.clientId)
          .eq("provider", repo.provider || "azure")
          .single()

        if (!integration) {
          results.push({
            repositoryId: repoId,
            repositoryName: repo.name,
            status: "error",
            filesProcessed: 0,
            findingsCount: 0,
            error: "Integracao nao encontrada",
            duration: Date.now() - startTime,
          })
          continue
        }

        // Atualizar progresso - Buscando arquivos
        this.updateProgress({
          totalRepositories,
          currentRepository: i + 1,
          currentRepositoryName: repo.name,
          phase: "fetching",
          filesProcessed: 0,
          findingsCount: 0,
          percentage: Math.round((i / totalRepositories) * 100),
        })

        // Criar log de analise
        const { data: analysisLog } = await supabase
          .from("repository_clone_logs")
          .insert({
            repository_id: repoId,
            analysis_id: this.analysisId,
            status: "analyzing",
            clone_started_at: new Date().toISOString(),
          })
          .select()
          .single()

        // Buscar e analisar arquivos via API
        let analysisResult: { filesProcessed: number; findings: Finding[] }

        if (repo.provider === "github" || integration.provider === "github") {
          analysisResult = await this.analyzeGitHubRepository(repo, integration.access_token)
        } else {
          analysisResult = await this.analyzeAzureRepository(repo, integration)
        }

        // Atualizar progresso - Analisando
        this.updateProgress({
          totalRepositories,
          currentRepository: i + 1,
          currentRepositoryName: repo.name,
          phase: "analyzing",
          filesProcessed: analysisResult.filesProcessed,
          findingsCount: analysisResult.findings.length,
          percentage: Math.round(((i + 0.5) / totalRepositories) * 100),
        })

        // Processar com IA se habilitado
        if (this.aiEnabled && this.aiApiKey && analysisResult.findings.length > 0) {
          this.updateProgress({
            totalRepositories,
            currentRepository: i + 1,
            currentRepositoryName: repo.name,
            phase: "ai_processing",
            filesProcessed: analysisResult.filesProcessed,
            findingsCount: analysisResult.findings.length,
            percentage: Math.round(((i + 0.7) / totalRepositories) * 100),
          })

          analysisResult.findings = await this.processWithAI(analysisResult.findings)
        }

        // Salvar findings no banco
        if (analysisResult.findings.length > 0) {
          this.updateProgress({
            totalRepositories,
            currentRepository: i + 1,
            currentRepositoryName: repo.name,
            phase: "saving",
            filesProcessed: analysisResult.filesProcessed,
            findingsCount: analysisResult.findings.length,
            percentage: Math.round(((i + 0.9) / totalRepositories) * 100),
          })

          const findingsToInsert = analysisResult.findings.map((f) => ({
            analysis_id: this.analysisId,
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
          }))

          await supabase.from("findings").insert(findingsToInsert)
        }

        // Atualizar log
        await supabase
          .from("repository_clone_logs")
          .update({
            status: "completed",
            clone_completed_at: new Date().toISOString(),
            analysis_completed_at: new Date().toISOString(),
            cleanup_at: new Date().toISOString(),
            files_processed: analysisResult.filesProcessed,
            findings_count: analysisResult.findings.length,
          })
          .eq("id", analysisLog?.id)

        results.push({
          repositoryId: repoId,
          repositoryName: repo.name,
          status: "success",
          filesProcessed: analysisResult.filesProcessed,
          findingsCount: analysisResult.findings.length,
          duration: Date.now() - startTime,
        })
      } catch (error: any) {
        console.error(`Erro ao analisar repositorio ${repoId}:`, error)
        results.push({
          repositoryId: repoId,
          repositoryName: "Erro",
          status: "error",
          filesProcessed: 0,
          findingsCount: 0,
          error: error.message,
          duration: Date.now() - startTime,
        })
      }
    }

    // Progresso final
    this.updateProgress({
      totalRepositories,
      currentRepository: totalRepositories,
      currentRepositoryName: "Concluido",
      phase: "completed",
      filesProcessed: results.reduce((acc, r) => acc + r.filesProcessed, 0),
      findingsCount: results.reduce((acc, r) => acc + r.findingsCount, 0),
      percentage: 100,
    })

    return results
  }

  /**
   * Analisa repositorio GitHub via API REST
   */
  private async analyzeGitHubRepository(
    repo: any,
    accessToken: string
  ): Promise<{ filesProcessed: number; findings: Finding[] }> {
    const findings: Finding[] = []
    let filesProcessed = 0

    try {
      const repoFullName = repo.full_name || `${repo.owner}/${repo.name}`
      
      // Get repository tree
      let treeUrl = `https://api.github.com/repos/${repoFullName}/git/trees/main?recursive=1`
      let treeResponse = await fetch(treeUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!treeResponse.ok) {
        // Try master branch
        treeUrl = `https://api.github.com/repos/${repoFullName}/git/trees/master?recursive=1`
        treeResponse = await fetch(treeUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        })
      }

      if (!treeResponse.ok) {
        console.error("Could not get GitHub repository tree")
        return { filesProcessed: 0, findings: [] }
      }

      const treeData = await treeResponse.json()
      
      // Filter files by extension
      const files = (treeData.tree || []).filter((item: any) => {
        if (item.type !== "blob") return false
        const ext = "." + (item.path.split(".").pop()?.toLowerCase() || "")
        return this.fileExtensions.some(allowedExt => allowedExt.toLowerCase() === ext)
      })

      // Analyze files (limit to 50)
      const filesToAnalyze = files.slice(0, 50)

      for (const file of filesToAnalyze) {
        try {
          const contentUrl = `https://api.github.com/repos/${repoFullName}/contents/${file.path}`
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
          const fileFindings = this.analyzeFileContent(content, file.path)
          findings.push(...fileFindings)
        } catch (error) {
          console.error(`Error reading GitHub file ${file.path}:`, error)
        }
      }
    } catch (error) {
      console.error("Error analyzing GitHub repository:", error)
    }

    return { filesProcessed, findings }
  }

  /**
   * Analisa repositorio Azure DevOps via API REST
   */
  private async analyzeAzureRepository(
    repo: any,
    integration: any
  ): Promise<{ filesProcessed: number; findings: Finding[] }> {
    const findings: Finding[] = []
    let filesProcessed = 0

    try {
      const azureOrg = integration.azure_organization || integration.organization
      const azureProject = repo.project_name || repo.project || repo.name
      const accessToken = integration.access_token

      const baseUrl = `https://dev.azure.com/${azureOrg}/${azureProject}/_apis/git/repositories/${repo.azure_repo_id || repo.name}`
      const authHeader = `Basic ${Buffer.from(`:${accessToken}`).toString("base64")}`

      // Get repository items
      const itemsUrl = `${baseUrl}/items?recursionLevel=Full&api-version=7.0`
      const itemsResponse = await fetch(itemsUrl, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      })

      if (!itemsResponse.ok) {
        console.error("Could not get Azure repository items")
        return { filesProcessed: 0, findings: [] }
      }

      const itemsData = await itemsResponse.json()
      
      // Filter files by extension
      const files = (itemsData.value || []).filter((item: any) => {
        if (item.isFolder) return false
        const ext = "." + (item.path.split(".").pop()?.toLowerCase() || "")
        return this.fileExtensions.some(allowedExt => allowedExt.toLowerCase() === ext)
      })

      // Analyze files (limit to 50)
      const filesToAnalyze = files.slice(0, 50)

      for (const file of filesToAnalyze) {
        try {
          const contentUrl = `${baseUrl}/items?path=${encodeURIComponent(file.path)}&api-version=7.0`
          const contentResponse = await fetch(contentUrl, {
            headers: { Authorization: authHeader },
          })

          if (!contentResponse.ok) continue

          const content = await contentResponse.text()
          filesProcessed++
          const fileFindings = this.analyzeFileContent(content, file.path)
          findings.push(...fileFindings)
        } catch (error) {
          console.error(`Error reading Azure file ${file.path}:`, error)
        }
      }
    } catch (error) {
      console.error("Error analyzing Azure repository:", error)
    }

    return { filesProcessed, findings }
  }

  /**
   * Analisa conteudo de arquivo usando CNPJDetector
   */
  private analyzeFileContent(content: string, filePath: string): Finding[] {
    const findings: Finding[] = []
    const detectorFindings = this.detector.analyze(content, filePath)

    for (const finding of detectorFindings) {
      findings.push({
        file_path: filePath,
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

    return findings
  }

  /**
   * Processa findings com IA (Gemini)
   */
  private async processWithAI(findings: Finding[]): Promise<Finding[]> {
    if (!this.aiApiKey) return findings

    const processedFindings = [...findings]
    const findingsToProcess = findings.slice(0, 10) // Limit to 10 for performance

    for (let i = 0; i < findingsToProcess.length; i++) {
      try {
        const finding = findingsToProcess[i]
        
        const prompt = `Analise o seguinte codigo que contem um campo CNPJ e forneca:
1. Uma explicacao do problema (por que precisa ser atualizado para CNPJ alfanumerico)
2. Uma sugestao de codigo corrigido

Arquivo: ${finding.file_path}
Linha: ${finding.line_number}
Campo: ${finding.field_name}

Codigo:
${finding.code_before_lines || ''}
${finding.context}
${finding.code_after_lines || ''}

Responda em JSON: {"analysis": "...", "suggestion": "...", "confidence": 0.0-1.0}`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.aiModel}:generateContent?key=${this.aiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
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

  /**
   * Atualiza o progresso da analise
   */
  private updateProgress(progress: AnalysisProgress): void {
    if (this.onProgress) {
      this.onProgress(progress)
    }
  }
}
