/**
 * Sequential Repository Analyzer
 * Fluxo: Clone -> Analyze -> Cleanup -> Next
 * Processa um repositorio por vez para otimizar recursos
 */

import { createClient } from "@/lib/supabase/server"

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
}

interface AnalysisProgress {
  totalRepositories: number
  currentRepository: number
  currentRepositoryName: string
  phase: "cloning" | "analyzing" | "ai_processing" | "cleanup" | "completed"
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
    this.cnpjFields = options?.cnpjFields || ["cnpj", "nr_cnpj", "nrCnpj", "documento"]
    this.fileExtensions = options?.fileExtensions || [".ts", ".tsx", ".js", ".jsx", ".java", ".cs", ".py", ".php"]
  }

  /**
   * Analisa multiplos repositorios sequencialmente
   */
  async analyzeRepositories(repositoryIds: string[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = []
    const totalRepositories = repositoryIds.length

    for (let i = 0; i < repositoryIds.length; i++) {
      const repoId = repositoryIds[i]
      const startTime = Date.now()

      try {
        // Buscar informacoes do repositorio
        const supabase = await createClient()
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

        // Atualizar progresso - Clonando
        this.updateProgress({
          totalRepositories,
          currentRepository: i + 1,
          currentRepositoryName: repo.name,
          phase: "cloning",
          filesProcessed: 0,
          findingsCount: 0,
          percentage: Math.round(((i / totalRepositories) * 100)),
        })

        // Criar log de clone
        const { data: cloneLog } = await supabase
          .from("repository_clone_logs")
          .insert({
            repository_id: repoId,
            analysis_id: this.analysisId,
            status: "cloning",
            clone_started_at: new Date().toISOString(),
          })
          .select()
          .single()

        // Fase 1: Clonar repositorio (simulado - em producao usaria git clone real)
        const cloneResult = await this.cloneRepository(repo)
        
        if (!cloneResult.success) {
          await supabase
            .from("repository_clone_logs")
            .update({
              status: "error",
              error_message: cloneResult.error,
            })
            .eq("id", cloneLog?.id)

          results.push({
            repositoryId: repoId,
            repositoryName: repo.name,
            status: "error",
            filesProcessed: 0,
            findingsCount: 0,
            error: cloneResult.error,
            duration: Date.now() - startTime,
          })
          continue
        }

        // Atualizar log - Clone completo
        await supabase
          .from("repository_clone_logs")
          .update({
            status: "analyzing",
            clone_completed_at: new Date().toISOString(),
            clone_path: cloneResult.path,
            analysis_started_at: new Date().toISOString(),
          })
          .eq("id", cloneLog?.id)

        // Atualizar progresso - Analisando
        this.updateProgress({
          totalRepositories,
          currentRepository: i + 1,
          currentRepositoryName: repo.name,
          phase: "analyzing",
          filesProcessed: 0,
          findingsCount: 0,
          percentage: Math.round(((i + 0.3) / totalRepositories) * 100),
        })

        // Fase 2: Analisar codigo
        const analysisResult = await this.analyzeCode(repo, cloneResult.files || [])

        // Atualizar progresso - Processando IA (se habilitado)
        if (this.aiEnabled && analysisResult.findings.length > 0) {
          this.updateProgress({
            totalRepositories,
            currentRepository: i + 1,
            currentRepositoryName: repo.name,
            phase: "ai_processing",
            filesProcessed: analysisResult.filesProcessed,
            findingsCount: analysisResult.findings.length,
            percentage: Math.round(((i + 0.6) / totalRepositories) * 100),
          })

          // Fase 3: Processar com IA cada finding
          await this.processWithAI(analysisResult.findings)
        }

        // Salvar findings no banco
        if (analysisResult.findings.length > 0) {
          const findingsToInsert = analysisResult.findings.map((f) => ({
            analysis_id: this.analysisId,
            file_path: f.file_path,
            line_number: f.line_number,
            field_name: f.field_name,
            context: f.context,
            code_context: f.code_context,
            code_before_lines: f.code_before_lines,
            code_after_lines: f.code_after_lines,
            suggestion: f.suggestion,
            action_required: f.action_required,
          }))

          await supabase.from("findings").insert(findingsToInsert)
        }

        // Atualizar progresso - Limpando
        this.updateProgress({
          totalRepositories,
          currentRepository: i + 1,
          currentRepositoryName: repo.name,
          phase: "cleanup",
          filesProcessed: analysisResult.filesProcessed,
          findingsCount: analysisResult.findings.length,
          percentage: Math.round(((i + 0.9) / totalRepositories) * 100),
        })

        // Fase 4: Cleanup (remover arquivos clonados)
        await this.cleanup(cloneResult.path)

        // Atualizar log - Completo
        await supabase
          .from("repository_clone_logs")
          .update({
            status: "completed",
            analysis_completed_at: new Date().toISOString(),
            cleanup_at: new Date().toISOString(),
            files_processed: analysisResult.filesProcessed,
            findings_count: analysisResult.findings.length,
          })
          .eq("id", cloneLog?.id)

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

    // Atualizar progresso - Completo
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
   * Clona o repositorio (simulado para ambiente serverless)
   */
  private async cloneRepository(repo: any): Promise<{ success: boolean; path?: string; files?: any[]; error?: string }> {
    try {
      // Em ambiente serverless, nao podemos fazer git clone real
      // Usamos a API do GitHub/GitLab para buscar arquivos
      
      // Simular busca de arquivos do repositorio
      // Em producao, usar API do provider (GitHub, GitLab, etc.)
      
      return {
        success: true,
        path: `/tmp/repos/${repo.id}`,
        files: [], // Arquivos seriam buscados via API
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  /**
   * Analisa o codigo em busca de campos CNPJ
   */
  private async analyzeCode(repo: any, files: any[]): Promise<{ filesProcessed: number; findings: Finding[] }> {
    const findings: Finding[] = []
    let filesProcessed = 0

    // Padroes para buscar CNPJ
    const cnpjPatterns = this.cnpjFields.map((field) => new RegExp(field, "gi"))
    
    // Padrao numerico de CNPJ
    const cnpjNumericPattern = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g

    for (const file of files) {
      if (!this.shouldAnalyzeFile(file.path)) continue

      filesProcessed++
      const lines = (file.content || "").split("\n")

      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum]
        
        // Verificar padroes de campo CNPJ
        for (const pattern of cnpjPatterns) {
          if (pattern.test(line)) {
            const contextLines = this.getContextLines(lines, lineNum, 3)
            
            findings.push({
              file_path: file.path,
              line_number: lineNum + 1,
              field_name: this.extractFieldName(line, pattern),
              context: line.trim(),
              code_context: contextLines.current,
              code_before_lines: contextLines.before,
              code_after_lines: contextLines.after,
              suggestion: this.generateBasicSuggestion(line),
              action_required: "Verificar se o campo suporta CNPJ alfanumerico (12 caracteres)",
            })
          }
        }

        // Verificar padroes numericos de CNPJ
        if (cnpjNumericPattern.test(line)) {
          const contextLines = this.getContextLines(lines, lineNum, 3)
          
          findings.push({
            file_path: file.path,
            line_number: lineNum + 1,
            field_name: "CNPJ numerico",
            context: line.trim(),
            code_context: contextLines.current,
            code_before_lines: contextLines.before,
            code_after_lines: contextLines.after,
            suggestion: "Converter validacao para suportar formato alfanumerico",
            action_required: "Atualizar validacao e mascara para novo formato",
          })
        }
      }
    }

    return { filesProcessed, findings }
  }

  /**
   * Processa findings com IA para gerar sugestoes detalhadas
   */
  private async processWithAI(findings: Finding[]): Promise<void> {
    if (!this.aiEnabled || !this.aiApiKey) return

    // Processar sera implementado na proxima tarefa
    // Por enquanto, apenas marca como pendente de IA
  }

  /**
   * Verifica se o arquivo deve ser analisado
   */
  private shouldAnalyzeFile(filePath: string): boolean {
    const ext = "." + filePath.split(".").pop()?.toLowerCase()
    return this.fileExtensions.includes(ext)
  }

  /**
   * Extrai o nome do campo da linha
   */
  private extractFieldName(line: string, pattern: RegExp): string {
    const match = line.match(pattern)
    return match ? match[0] : "campo_cnpj"
  }

  /**
   * Obtem linhas de contexto
   */
  private getContextLines(lines: string[], currentLine: number, contextSize: number): { before: string; current: string; after: string } {
    const start = Math.max(0, currentLine - contextSize)
    const end = Math.min(lines.length, currentLine + contextSize + 1)

    return {
      before: lines.slice(start, currentLine).join("\n"),
      current: lines[currentLine],
      after: lines.slice(currentLine + 1, end).join("\n"),
    }
  }

  /**
   * Gera sugestao basica (sem IA)
   */
  private generateBasicSuggestion(line: string): string {
    if (line.includes("VARCHAR") || line.includes("CHAR")) {
      return "Aumentar tamanho do campo para VARCHAR(12) para suportar CNPJ alfanumerico"
    }
    if (line.includes("mask") || line.includes("format")) {
      return "Atualizar mascara para aceitar letras e numeros"
    }
    if (line.includes("valid") || line.includes("regex")) {
      return "Atualizar validacao para novo formato alfanumerico"
    }
    return "Revisar para compatibilidade com CNPJ alfanumerico"
  }

  /**
   * Limpa arquivos temporarios
   */
  private async cleanup(path?: string): Promise<void> {
    // Em ambiente serverless, nao ha arquivos para limpar
    // Em producao local, removeria o diretorio clonado
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
