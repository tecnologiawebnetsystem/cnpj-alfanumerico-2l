import { db as supabase } from "@/lib/db/sqlserver"

export interface ReportTemplate {
  id?: string
  name: string
  description?: string
  client_id?: string
  user_id?: string
  sections: string[]
  filters?: Record<string, any>
  format: "pdf" | "excel" | "json" | "html"
  is_default?: boolean
}

export interface AnalysisComparison {
  id?: string
  name: string
  base_analysis_id: string
  compare_analysis_id: string
  client_id?: string
  user_id?: string
  diff_summary?: any
}

// Criar template de relatório
export async function createReportTemplate(template: ReportTemplate) {
  // supabase already bound above
  
  const { data, error } = await supabase
    .from("report_templates")
    .insert(template)
    .select()
    .single()

  if (error) throw error
  return data
}

// Listar templates de relatório
export async function getReportTemplates(userId: string, clientId?: string) {
  // supabase already bound above
  
  let query = supabase
    .from("report_templates")
    .select("*")
    .eq("user_id", userId)

  if (clientId) {
    query = query.eq("client_id", clientId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data
}

// Criar comparação de análises
export async function createAnalysisComparison(comparison: AnalysisComparison) {
  // supabase already bound above
  
  // Calcular diff usando função SQL
  const { data: diffData } = await supabase.rpc("calculate_analysis_diff", {
    base_id: comparison.base_analysis_id,
    compare_id: comparison.compare_analysis_id,
  })

  const { data, error } = await supabase
    .from("analysis_comparisons")
    .insert({
      ...comparison,
      diff_summary: diffData,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Buscar evolução de métricas
export async function getAnalysisEvolution(
  repositoryId: string,
  startDate?: Date,
  endDate?: Date
) {
  // supabase already bound above
  
  let query = supabase
    .from("analysis_evolution")
    .select("*")
    .eq("repository_id", repositoryId)

  if (startDate) {
    query = query.gte("analysis_date", startDate.toISOString())
  }

  if (endDate) {
    query = query.lte("analysis_date", endDate.toISOString())
  }

  const { data, error } = await query.order("analysis_date", { ascending: true })

  if (error) throw error
  return data
}

// Exportar relatório em múltiplos formatos
export async function exportReport(
  analysisId: string,
  format: "pdf" | "excel" | "json" | "html",
  templateId?: string
) {
  // supabase already bound above
  
  let template: ReportTemplate | null = null

  if (templateId) {
    const { data } = await supabase
      .from("report_templates")
      .select("*")
      .eq("id", templateId)
      .single()
    template = data
  }

  // Buscar dados da análise
  const { data: analysis } = await supabase
    .from("analyses")
    .select("*, findings(*), tasks(*), repositories(*)")
    .eq("id", analysisId)
    .single()

  if (!analysis) throw new Error("Analysis not found")

  // Aplicar filtros do template
  let findings = analysis.findings
  if (template?.filters) {
    if (template.filters.severity) {
      findings = findings.filter((f: any) =>
        template!.filters!.severity.includes(f.severity)
      )
    }
    if (template.filters.status) {
      findings = findings.filter((f: any) =>
        template!.filters!.status.includes(f.status)
      )
    }
  }

  const reportData = {
    analysis,
    findings,
    tasks: analysis.tasks,
    repository: analysis.repositories,
    sections: template?.sections || ["summary", "findings", "tasks"],
    format,
  }

  return reportData
}
