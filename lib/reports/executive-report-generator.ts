import jsPDF from "jspdf"
import { SolutionGenerator } from "../analyzer/solution-generator"

export interface ExecutiveReportData {
  analysis: any
  findings: any[]
  databaseFindings: any[]
}

export class ExecutiveReportGenerator {
  private solutionGenerator = new SolutionGenerator()

  async generateExecutivePDF(data: ExecutiveReportData): Promise<Buffer> {
    const doc = new jsPDF()
    let yPos = 20

    this.addCoverPage(doc, data)
    doc.addPage()
    yPos = 20

    this.addExecutiveSummary(doc, data, yPos)
    doc.addPage()
    yPos = 20

    this.addDetailedFindings(doc, data, yPos)

    return Buffer.from(doc.output("arraybuffer"))
  }

  private addCoverPage(doc: jsPDF, data: ExecutiveReportData) {
    // Professional cover with logo placeholder and title
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, 210, 100, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(32)
    doc.setFont("helvetica", "bold")
    doc.text("RELATÓRIO EXECUTIVO", 105, 40, { align: "center" })

    doc.setFontSize(18)
    doc.setFont("helvetica", "normal")
    doc.text("Análise de Conformidade CNPJ", 105, 55, { align: "center" })

    doc.setFontSize(12)
    const repoNames = Array.from(new Set(data.findings.map((f) => f.repository))).join(", ")
    doc.text(repoNames.substring(0, 60), 105, 70, { align: "center" })

    doc.setFontSize(10)
    doc.text(
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      105,
      85,
      { align: "center" },
    )

    // Statistics section
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("ESTATÍSTICAS PRINCIPAIS", 20, 120)

    const stats = [
      { label: "Total de Ocorrências", value: data.findings.length, color: [239, 68, 68] },
      {
        label: "Arquivos Impactados",
        value: new Set(data.findings.map((f) => f.file_path)).size,
        color: [249, 115, 22],
      },
      { label: "Repositórios", value: new Set(data.findings.map((f) => f.repository)).size, color: [59, 130, 246] },
      { label: "Horas Estimadas", value: Math.ceil(data.findings.length * 0.5), color: [34, 197, 94] },
    ]

    let statY = 135
    stats.forEach((stat) => {
      doc.setFillColor(stat.color[0], stat.color[1], stat.color[2], 0.1)
      doc.roundedRect(20, statY - 5, 170, 15, 2, 2, "F")

      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(stat.label, 25, statY + 2)

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2])
      doc.text(String(stat.value), 180, statY + 5, { align: "right" })

      statY += 20
    })
  }

  private addExecutiveSummary(doc: jsPDF, data: ExecutiveReportData, startY: number) {
    let yPos = startY

    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(15, 23, 42)
    doc.text("SUMÁRIO EXECUTIVO", 20, yPos)
    yPos += 15

    // Risk assessment
    const criticalCount = data.findings.filter((f) => f.severity === "critical").length
    const highCount = data.findings.filter((f) => f.severity === "high").length

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(51, 65, 85)

    const summary = [
      `Foram identificadas ${data.findings.length} ocorrências de CNPJ em formato numérico que necessitam atualização para o novo formato alfanumérico de 18 caracteres.`,
      "",
      `Das ocorrências encontradas:`,
      `• ${criticalCount} são CRÍTICAS (impacto direto em produção)`,
      `• ${highCount} são de ALTA prioridade (sistemas principais)`,
      `• ${data.findings.length - criticalCount - highCount} são de prioridade MÉDIA/BAIXA`,
      "",
      `A implementação completa está estimada em ${Math.ceil(data.findings.length * 0.5)} horas de desenvolvimento.`,
    ]

    summary.forEach((line) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(line, 20, yPos, { maxWidth: 170 })
      yPos += 7
    })

    yPos += 10

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("IMPACTO NO NEGÓCIO", 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const businessImpact = [
      "✓ Conformidade com nova legislação da Receita Federal",
      "✓ Evitar multas e sanções legais por não conformidade",
      "✓ Manter sistemas críticos operacionais após migração nacional",
      "✓ Reduzir riscos de rejeição em integrações com APIs governamentais",
    ]

    businessImpact.forEach((item) => {
      doc.text(item, 25, yPos)
      yPos += 7
    })
  }

  private addDetailedFindings(doc: jsPDF, data: ExecutiveReportData, startY: number) {
    doc.addPage()
    let yPos = 20

    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(15, 23, 42)
    doc.text("DETALHAMENTO POR OCORRÊNCIA", 20, yPos)
    yPos += 15

    // Group by Account → Project → Repository → File
    const grouped = this.groupFindings(data.findings)

    for (const [account, projects] of Object.entries(grouped)) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Account header
      doc.setFillColor(99, 102, 241)
      doc.roundedRect(15, yPos - 5, 180, 10, 1, 1, "F")
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 255, 255)
      doc.text(`CONTA: ${account}`, 20, yPos + 2)
      yPos += 15

      for (const [project, repos] of Object.entries(projects as any)) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        // Project header
        doc.setFillColor(147, 51, 234)
        doc.roundedRect(20, yPos - 5, 170, 8, 1, 1, "F")
        doc.setFontSize(10)
        doc.setTextColor(255, 255, 255)
        doc.text(`Projeto: ${project}`, 25, yPos)
        yPos += 12

        for (const [repo, files] of Object.entries(repos as any)) {
          if (yPos > 250) {
            doc.addPage()
            yPos = 20
          }

          // Repository header
          doc.setFillColor(59, 130, 246)
          doc.roundedRect(25, yPos - 5, 160, 8, 1, 1, "F")
          doc.setFontSize(9)
          doc.setTextColor(255, 255, 255)
          doc.text(`Repositório: ${repo}`, 30, yPos)
          yPos += 12

          for (const [file, findings] of Object.entries(files as any)) {
            if (yPos > 240) {
              doc.addPage()
              yPos = 20
            }

            // File header
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(71, 85, 105)
            doc.text(`📄 ${file}`, 30, yPos)
            yPos += 7(findings as any[]).forEach((finding, idx) => {
              if (yPos > 230) {
                doc.addPage()
                yPos = 20
              }

              doc.setFillColor(249, 250, 251)
              doc.setDrawColor(226, 232, 240)
              doc.roundedRect(30, yPos - 3, 155, 50, 1, 1, "FD")

              // Line number and severity
              doc.setFontSize(7)
              doc.setFont("helvetica", "bold")
              doc.setTextColor(37, 99, 235)
              doc.text(`Linha ${finding.line_number}`, 35, yPos + 2)

              const severityColor = this.getSeverityColor(finding.severity)
              doc.setFillColor(severityColor[0], severityColor[1], severityColor[2], 0.2)
              doc.roundedRect(70, yPos - 2, 25, 5, 0.5, 0.5, "F")
              doc.setTextColor(severityColor[0], severityColor[1], severityColor[2])
              doc.text(finding.severity?.toUpperCase() || "MÉDIO", 72, yPos + 2)
              yPos += 7

              // Current code (red background)
              doc.setFillColor(254, 226, 226)
              doc.roundedRect(35, yPos, 145, 8, 0.5, 0.5, "F")
              doc.setFont("courier", "normal")
              doc.setFontSize(6)
              doc.setTextColor(153, 27, 27)
              doc.text(`- ${(finding.context || "").substring(0, 80)}`, 37, yPos + 5)
              yPos += 10

              // Suggested code (green background)
              if (finding.suggestion) {
                doc.setFillColor(220, 252, 231)
                doc.roundedRect(35, yPos, 145, 8, 0.5, 0.5, "F")
                doc.setTextColor(22, 101, 52)
                doc.text(`+ ${finding.suggestion.substring(0, 80)}`, 37, yPos + 5)
                yPos += 10
              }

              // Solution explanation (for non-technical readers)
              doc.setFont("helvetica", "normal")
              doc.setFontSize(7)
              doc.setTextColor(100, 116, 139)
              const explanation = `Ação: Alterar campo ${finding.field_name} para aceitar formato VARCHAR(18) alfanumérico`
              doc.text(explanation, 35, yPos + 2, { maxWidth: 145 })
              yPos += 8

              // Estimated effort
              doc.setFontSize(6)
              doc.setTextColor(168, 85, 247)
              doc.text(`⏱️ Estimativa: ${finding.estimated_hours || 0.5}h`, 35, yPos + 2)

              yPos += 10
            })

            yPos += 5
          }
        }
      }
    }
  }

  private groupFindings(findings: any[]) {
    return findings.reduce(
      (acc, f) => {
        const account = f.account_name || "Conta Não Identificada"
        const project = f.project || "Projeto Não Identificado"
        const repo = f.repository || "Repositório Desconhecido"
        const file = f.file_path || "Arquivo Desconhecido"

        if (!acc[account]) acc[account] = {}
        if (!acc[account][project]) acc[account][project] = {}
        if (!acc[account][project][repo]) acc[account][project][repo] = {}
        if (!acc[account][project][repo][file]) acc[account][project][repo][file] = []

        acc[account][project][repo][file].push(f)
        return acc
      },
      {} as Record<string, any>,
    )
  }

  private getSeverityColor(severity?: string): [number, number, number] {
    switch (severity) {
      case "critical":
        return [220, 38, 38]
      case "high":
        return [249, 115, 22]
      case "medium":
        return [234, 179, 8]
      case "low":
        return [34, 197, 94]
      default:
        return [100, 116, 139]
    }
  }

  async generateDetailedExcel(data: ExecutiveReportData): Promise<Buffer> {
    const jsonReport = this.generateDetailedJSON(data)

    const escapeCsv = (str: string | undefined | null) => {
      const value = str || ""
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const csv = [
      "RELATÓRIO DETALHADO DE ANÁLISE CNPJ",
      "",
      "═══════════════════════════════════════════════════════════════",
      "ABA 1: RESUMO EXECUTIVO",
      "═══════════════════════════════════════════════════════════════",
      "",
      `Data da Análise,${new Date().toLocaleDateString("pt-BR")}`,
      `Total de Contas,${Object.keys(this.groupFindings(data.findings)).length}`,
      `Total de Projetos,${new Set(data.findings.map((f) => f.project)).size}`,
      `Total de Repositórios,${new Set(data.findings.map((f) => f.repository)).size}`,
      `Total de Arquivos,${new Set(data.findings.map((f) => f.file_path)).size}`,
      `Total de Ocorrências,${data.findings.length}`,
      `Horas Estimadas,${Math.ceil(data.findings.length * 0.5)}`,
      "",
      "═══════════════════════════════════════════════════════════════",
      "ABA 2: DETALHAMENTO POR OCORRÊNCIA (LINHA A LINHA)",
      "═══════════════════════════════════════════════════════════════",
      "",
      "Conta,Projeto,Repositório,Arquivo,Linha,Severidade,Campo Afetado,Código Atual (ERRADO),Código Sugerido (CORRETO),Ação Necessária,Estimativa (h)",
      ...data.findings.map((f) =>
        [
          escapeCsv(f.account_name),
          escapeCsv(f.project),
          escapeCsv(f.repository),
          escapeCsv(f.file_path),
          f.line_number,
          escapeCsv(f.severity || "medium"),
          escapeCsv(f.field_name),
          escapeCsv(f.context),
          escapeCsv(f.suggestion),
          "ATUALIZAR CAMPO PARA VARCHAR(18) ALFANUMÉRICO",
          f.estimated_hours || 0.5,
        ].join(","),
      ),
      "",
      "═══════════════════════════════════════════════════════════════",
      "ABA 3: OCORRÊNCIAS SEM ALTERAÇÃO (COMENTÁRIOS/DOCUMENTAÇÃO)",
      "═══════════════════════════════════════════════════════════════",
      "",
      "Conta,Projeto,Repositório,Arquivo,Linha,Contexto,Observação",
      ...data.findings
        .filter((f) => f.action_required === "NONE")
        .map((f) =>
          [
            escapeCsv(f.account_name),
            escapeCsv(f.project),
            escapeCsv(f.repository),
            escapeCsv(f.file_path),
            f.line_number,
            escapeCsv(f.context),
            "Comentário ou documentação - não requer alteração",
          ].join(","),
        ),
    ]

    // Add UTF-8 BOM for Excel
    const BOM = "\uFEFF"
    return Buffer.from(BOM + csv.join("\n"), "utf-8")
  }

  generateDetailedJSON(data: ExecutiveReportData) {
    return {
      report_version: "2.0_EXECUTIVE",
      generated_at: new Date().toISOString(),
      executive_summary: {
        total_accounts: Object.keys(this.groupFindings(data.findings)).length,
        total_projects: new Set(data.findings.map((f) => f.project)).size,
        total_repositories: new Set(data.findings.map((f) => f.repository)).size,
        total_files: new Set(data.findings.map((f) => f.file_path)).size,
        total_occurrences: data.findings.length,
        estimated_hours: Math.ceil(data.findings.length * 0.5),
        severity_breakdown: {
          critical: data.findings.filter((f) => f.severity === "critical").length,
          high: data.findings.filter((f) => f.severity === "high").length,
          medium: data.findings.filter((f) => f.severity === "medium").length,
          low: data.findings.filter((f) => f.severity === "low").length,
        },
      },
      detailed_findings: data.findings.map((f) => ({
        account: f.account_name || "N/A",
        project: f.project || "N/A",
        repository: f.repository || "N/A",
        file_path: f.file_path,
        line_number: f.line_number,
        severity: f.severity || "medium",
        field_name: f.field_name,
        current_code: f.context,
        suggested_code: f.suggestion,
        code_before_lines: f.code_before || [],
        code_after_lines: f.code_after || [],
        action_required: f.action_required || "UPDATE",
        technical_solution: `Alterar ${f.field_name} de VARCHAR(14) para VARCHAR(18)`,
        business_impact: "Conformidade com nova legislação CNPJ alfanumérico",
        estimated_hours: f.estimated_hours || 0.5,
        risk_level: f.severity === "critical" ? "ALTO" : f.severity === "high" ? "MÉDIO" : "BAIXO",
        migration_steps: [
          `1. Backup da tabela/arquivo ${f.file_path}`,
          `2. Atualizar campo ${f.field_name} para VARCHAR(18)`,
          `3. Testar validações alfanuméricas`,
          `4. Deploy em homologação`,
          `5. Validar integrações`,
          `6. Deploy em produção`,
        ],
      })),
      recommendations: {
        immediate_actions: [
          "Priorizar ocorrências CRÍTICAS em sistemas de produção",
          "Criar branches de feature para cada repositório",
          "Executar testes de regressão completos",
          "Atualizar documentação técnica",
        ],
        rollback_plan: [
          "Manter backups de todos os arquivos alterados",
          "Documentar versões anteriores de schemas de banco",
          "Ter scripts de rollback prontos",
          "Monitorar logs por 48h após deploy",
        ],
      },
    }
  }
}
