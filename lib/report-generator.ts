import { DetailedReportGenerator, type DetailedFinding } from "./reports/detailed-report-generator"
import { jsPDF } from "jspdf"
import ExcelJS from "exceljs"

interface ReportData {
  analysis: any
  findings: any[]
  databaseFindings: any[]
}

export function generateJSONReport(data: ReportData) {
  const estimatedHours =
    data.analysis.estimated_hours ||
    data.analysis.results?.summary?.estimated_hours ||
    Math.ceil((data.findings.length * 3 + data.databaseFindings.length * 6) / 60)

  const uniqueFiles = new Set(data.findings.map((f) => f.file_path))
  const totalFiles = uniqueFiles.size || data.analysis.total_files || data.analysis.files_analyzed || 0

  const uniqueRepos = new Set(data.findings.map((f) => f.repository || data.analysis.repository_name))
  const uniqueProjects = new Set(data.findings.map((f) => f.project).filter(Boolean))

  const estimatesByProject = Array.from(uniqueProjects).map((project) => {
    const projectFindings = data.findings.filter((f) => f.project === project)
    const projectRepos = new Set(projectFindings.map((f) => f.repository))
    const projectFiles = new Set(projectFindings.map((f) => f.file_path))
    const projectHours = Math.ceil((projectFindings.length * 0.5) / 8)

    return {
      project_name: project,
      total_repositories: projectRepos.size,
      total_files: projectFiles.size,
      total_occurrences: projectFindings.length,
      estimated_hours: projectHours,
      repositories: Array.from(projectRepos).map((repo) => {
        const repoFindings = projectFindings.filter((f) => f.repository === repo)
        const repoFiles = new Set(repoFindings.map((f) => f.file_path))
        return {
          repository_name: repo,
          total_files: repoFiles.size,
          total_occurrences: repoFindings.length,
          estimated_hours: Math.ceil((repoFindings.length * 0.5) / 8),
        }
      }),
    }
  })

  const estimatesByRepository = Array.from(uniqueRepos).map((repo) => {
    const repoFindings = data.findings.filter((f) => f.repository === repo || data.analysis.repository_name === repo)
    const repoFiles = new Set(repoFindings.map((f) => f.file_path))
    const repoHours = Math.ceil((repoFindings.length * 0.5) / 8)

    return {
      repository_name: repo,
      project: repoFindings[0]?.project || "N/A",
      total_files: repoFiles.size,
      files_with_occurrences: repoFiles.size,
      total_occurrences: repoFindings.length,
      estimated_hours: repoHours,
    }
  })

  return {
    report_version: "2.0",
    report_type: "Executive CNPJ Analysis",
    generated_at: new Date().toISOString(),

    executive_summary: {
      total_projects: uniqueProjects.size,
      total_repositories: uniqueRepos.size,
      total_files_analyzed: data.analysis.total_files || totalFiles,
      files_with_occurrences: totalFiles,
      total_cnpj_occurrences: data.findings.length,
      total_database_fields: data.databaseFindings.length,
      total_estimated_hours: estimatedHours,
      compliance_status: "Action Required",
      deadline: "Julho 2026 (Receita Federal)",
      business_impact: "High - Sistema não aceitará novos CNPJs após prazo",
    },

    estimates_by_project: estimatesByProject,

    estimates_by_repository: estimatesByRepository,

    analysis: {
      id: data.analysis.id,
      account_name: data.analysis.account_name,
      repositories: Array.from(uniqueRepos),
      repository_count: uniqueRepos.size,
      projects: Array.from(uniqueProjects),
      project_count: uniqueProjects.size,
      status: data.analysis.status,
      created_at: data.analysis.created_at,
      completed_at: data.analysis.completed_at,
    },

    code_findings: data.findings.map((f) => ({
      account_name: f.account_name || data.analysis.account_name,
      project: f.project || "N/A",
      repository: f.repository || data.analysis.repository_name,
      file_path: f.file_path,
      line_number: f.line_number,
      field_name: f.field_name,
      field_type: f.field_type,
      severity: calculateSeverity(f),
      error: `Campo ${f.field_name || "CNPJ"} com formato numérico`,
      solution: f.suggestion || f.code_suggested || "Atualizar para aceitar formato alfanumérico VARCHAR(18)",
      code_snippet: f.code_snippet || f.context,
      confidence: f.confidence,
      estimated_hours: 0.5,
    })),

    database_findings: data.databaseFindings.map((f) => ({
      account_name: data.analysis.account_name,
      database_type: f.database_type,
      table_name: f.table_name,
      column_name: f.column_name,
      column_type: f.column_type,
      max_length: f.max_length,
      is_nullable: f.is_nullable,
      solution: f.suggestion,
      estimated_hours: 1,
    })),

    recommendations: {
      priority_actions: [
        "Atualizar validações de CNPJ para aceitar formato alfanumérico",
        "Modificar campos de banco de dados para VARCHAR(18)",
        "Atualizar máscaras de input nos formulários",
        "Revisar integrações com APIs externas",
      ],
      estimated_effort: {
        total_hours: estimatedHours,
        breakdown: {
          code_changes: Math.round(estimatedHours * 0.6),
          database_migration: Math.round(estimatedHours * 0.2),
          testing: Math.round(estimatedHours * 0.2),
        },
      },
    },
  }
}

function calculateSeverity(finding: any): string {
  const context = (finding.context || finding.code_current || "").toLowerCase()
  if (context.includes("create table") || context.includes("alter table")) return "critical"
  if (context.includes("api") || context.includes("validate")) return "high"
  if (context.includes("mask") || context.includes("format")) return "medium"
  return "low"
}

export async function generatePDFReport(data: ReportData): Promise<Buffer> {
  const estimatedHours =
    data.analysis.estimated_hours ||
    data.analysis.results?.summary?.estimated_hours ||
    Math.ceil((data.findings.length * 0.5 + data.databaseFindings.length * 1) / 8)

  const uniqueFiles = new Set(data.findings.map((f) => f.file_path))
  const totalFiles = uniqueFiles.size || data.analysis.total_files || data.analysis.files_analyzed || 0
  const totalFilesAnalyzed = data.analysis.total_files || totalFiles

  const uniqueRepos = new Set(data.findings.map((f) => f.repository || data.analysis.repository_name))
  const uniqueProjects = new Set(data.findings.map((f) => f.project).filter(Boolean))

  const doc = new jsPDF()
  let yPos = 20

  // ============ CAPA PROFISSIONAL ============
  doc.setFillColor(30, 58, 138) // blue-900
  doc.rect(0, 0, 210, 85, "F")

  doc.setFontSize(32)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("CNPJ ALFANUMÉRICO", 105, 35, { align: "center" })

  doc.setFontSize(18)
  doc.setFont("helvetica", "normal")
  doc.text("Relatório de Análise Executiva", 105, 48, { align: "center" })

  doc.setFontSize(11)
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 105, 58, { align: "center" })

  // Estatísticas na capa
  yPos = 75
  const coverStats = [
    { label: "Projetos", value: uniqueProjects.size, icon: "📊" },
    { label: "Repositórios", value: uniqueRepos.size, icon: "📁" },
    { label: "Arquivos Analisados", value: totalFilesAnalyzed, icon: "📄" },
    { label: "Ocorrências", value: data.findings.length, icon: "🔍" },
  ]

  const boxWidth = 45
  const startX = 12
  coverStats.forEach((stat, i) => {
    const xPos = startX + i * (boxWidth + 2)

    doc.setFillColor(255, 255, 255)
    doc.roundedRect(xPos, yPos, boxWidth, 20, 2, 2, "F")

    doc.setFontSize(24)
    doc.setTextColor(30, 58, 138)
    doc.setFont("helvetica", "bold")
    doc.text(String(stat.value), xPos + 22.5, yPos + 10, { align: "center" })

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(71, 85, 105)
    doc.text(stat.label, xPos + 22.5, yPos + 16, { align: "center" })
  })

  // Alerta de compliance
  yPos = 105
  doc.setFillColor(239, 68, 68) // red-500
  doc.roundedRect(15, yPos, 180, 25, 2, 2, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("⚠️  ATENÇÃO: COMPLIANCE OBRIGATÓRIA", 105, yPos + 8, { align: "center" })
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Receita Federal: CNPJs alfanuméricos obrigatórios a partir de Julho/2026", 105, yPos + 15, {
    align: "center",
  })
  doc.text(`Estimativa Total: ${estimatedHours} horas de desenvolvimento`, 105, yPos + 21, { align: "center" })

  // ============ PÁGINA 2: SUMÁRIO EXECUTIVO ============
  doc.addPage()
  yPos = 20

  doc.setFillColor(30, 58, 138)
  doc.rect(0, 0, 210, 15, "F")
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("📊  SUMÁRIO EXECUTIVO", 15, 10)

  yPos = 25
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(51, 65, 85)

  const summaryText = [
    `Este relatório apresenta uma análise completa de ${totalFilesAnalyzed} arquivos em ${uniqueRepos.size} repositórios`,
    `distribuídos em ${uniqueProjects.size} projetos. Foram identificadas ${data.findings.length} ocorrências de campos CNPJ`,
    `que necessitam atualização para o novo formato alfanumérico estabelecido pela Receita Federal.`,
    ``,
    `IMPACTO NO NEGÓCIO:`,
    `A partir de Julho/2026, novos CNPJs serão emitidos no formato alfanumérico (14 caracteres A-Z0-9).`,
    `Sistemas que não forem atualizados não conseguirão processar estes novos documentos, causando`,
    `rejeição de cadastros, falhas em integrações e não conformidade legal.`,
  ]

  summaryText.forEach((line) => {
    if (line.startsWith("IMPACTO")) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(220, 38, 38) // red-600
    } else if (line === "") {
      yPos += 3
      return
    } else {
      doc.setFont("helvetica", "normal")
      doc.setTextColor(51, 65, 85)
    }
    doc.text(line, 15, yPos)
    yPos += 5
  })

  // ============ PÁGINA 3: ESTIMATIVAS POR PROJETO ============
  doc.addPage()
  yPos = 20

  doc.setFillColor(30, 58, 138)
  doc.rect(0, 0, 210, 15, "F")
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("📈  ESTIMATIVAS POR PROJETO", 15, 10)

  yPos = 30

  Array.from(uniqueProjects).forEach((project, idx) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    const projectFindings = data.findings.filter((f) => f.project === project)
    const projectRepos = new Set(projectFindings.map((f) => f.repository))
    const projectFiles = new Set(projectFindings.map((f) => f.file_path))
    const projectHours = Math.ceil((projectFindings.length * 0.5) / 8)

    // Project header
    doc.setFillColor(147, 51, 234) // purple-600
    doc.roundedRect(15, yPos - 5, 180, 10, 1, 1, "F")
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(`${idx + 1}. ${project || "Sem Projeto"}`, 18, yPos + 1)
    yPos += 12

    // Project stats cards
    const projectStats = [
      { label: "Repositórios", value: projectRepos.size, color: [59, 130, 246] }, // blue
      { label: "Arquivos", value: projectFiles.size, color: [16, 185, 129] }, // green
      { label: "Ocorrências", value: projectFindings.length, color: [251, 146, 60] }, // orange
      { label: "Horas Est.", value: `${projectHours}h`, color: [234, 179, 8] }, // yellow
    ]

    const cardW = 42
    projectStats.forEach((stat, i) => {
      const xPos = 20 + i * (cardW + 3)

      doc.setFillColor(stat.color[0], stat.color[1], stat.color[2], 0.1)
      doc.roundedRect(xPos, yPos, cardW, 15, 1, 1, "F")

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2])
      doc.text(String(stat.value), xPos + 21, yPos + 7, { align: "center" })

      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 116, 139)
      doc.text(stat.label, xPos + 21, yPos + 12, { align: "center" })
    })

    yPos += 20
  })

  // ============ PÁGINA 4: ESTIMATIVAS POR REPOSITÓRIO ============
  doc.addPage()
  yPos = 20

  doc.setFillColor(30, 58, 138)
  doc.rect(0, 0, 210, 15, "F")
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("📁  ESTIMATIVAS POR REPOSITÓRIO", 15, 10)

  yPos = 30

  // Table header
  doc.setFillColor(241, 245, 249) // slate-100
  doc.rect(15, yPos - 5, 180, 8, "F")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(51, 65, 85)
  doc.text("#", 18, yPos)
  doc.text("Repositório", 28, yPos)
  doc.text("Projeto", 95, yPos)
  doc.text("Arquivos", 130, yPos)
  doc.text("Ocorrências", 155, yPos)
  doc.text("Horas", 182, yPos)
  yPos += 8

  Array.from(uniqueRepos).forEach((repo, idx) => {
    if (yPos > 275) {
      doc.addPage()
      yPos = 20
    }

    const repoFindings = data.findings.filter((f) => f.repository === repo || data.analysis.repository_name === repo)
    const repoFiles = new Set(repoFindings.map((f) => f.file_path))
    const repoHours = Math.ceil((repoFindings.length * 0.5) / 8)
    const repoProject = repoFindings[0]?.project || "N/A"

    // Row background (zebra striping)
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252) // slate-50
      doc.rect(15, yPos - 4, 180, 7, "F")
    }

    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(51, 65, 85)
    doc.text(String(idx + 1), 18, yPos)
    doc.text(repo.substring(0, 30), 28, yPos)
    doc.text(repoProject.substring(0, 20), 95, yPos)
    doc.text(String(repoFiles.size), 138, yPos, { align: "center" })
    doc.text(String(repoFindings.length), 165, yPos, { align: "center" })
    doc.text(`${repoHours}h`, 187, yPos, { align: "center" })

    yPos += 7
  })

  // ============ SEÇÃO ANALÍTICA: DETALHAMENTO ============
  doc.addPage()
  yPos = 20

  doc.setFillColor(30, 58, 138)
  doc.rect(0, 0, 210, 15, "F")
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("🔍  DETALHAMENTO ANALÍTICO", 15, 10)

  yPos = 30

  // Organize by Project → Repository → File
  const findingsByProject: Record<string, Record<string, any[]>> = {}

  data.findings.forEach((f) => {
    const project = f.project || "Sem Projeto"
    const repo = f.repository || data.analysis.repository_name || "Sem Repositório"

    if (!findingsByProject[project]) findingsByProject[project] = {}
    if (!findingsByProject[project][repo]) findingsByProject[project][repo] = []
    findingsByProject[project][repo].push(f)
  })

  Object.entries(findingsByProject).forEach(([projectName, repos]) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    // Project header
    doc.setFillColor(147, 51, 234) // purple-600
    doc.roundedRect(15, yPos - 5, 180, 8, 1, 1, "F")
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(`📂 ${projectName}`, 20, yPos)
    yPos += 10

    Object.entries(repos).forEach(([repoName, repoFindings]) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Repository header
      doc.setFillColor(59, 130, 246) // blue-500
      doc.roundedRect(20, yPos - 5, 170, 7, 1, 1, "F")
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 255, 255)
      doc.text(`📁 ${repoName}`, 23, yPos)
      yPos += 9

      // Show first 3 findings per repo to keep PDF manageable
      repoFindings.slice(0, 3).forEach((f, idx) => {
        if (yPos > 255) {
          doc.addPage()
          yPos = 20
        }

        // Finding card
        doc.setFillColor(249, 250, 251) // gray-50
        doc.setDrawColor(229, 231, 235) // gray-200
        doc.roundedRect(25, yPos - 3, 165, 30, 1, 1, "FD")

        // File path and line
        doc.setFontSize(7)
        doc.setFont("courier", "bold")
        doc.setTextColor(71, 85, 105)
        doc.text(f.file_path.substring(0, 70), 28, yPos + 2)

        doc.setFontSize(7)
        doc.setTextColor(37, 99, 235) // blue-600
        doc.text(`Linha ${f.line_number}`, 28, yPos + 7)
        yPos += 10

        // Code snippet
        if (f.code_snippet || f.context) {
          doc.setFillColor(255, 255, 255)
          doc.roundedRect(28, yPos, 157, 7, 0.5, 0.5, "F")
          doc.setFont("courier", "normal")
          doc.setFontSize(6)
          doc.setTextColor(30, 41, 59)
          const code = (f.code_snippet || f.context || "").substring(0, 80)
          doc.text(code, 30, yPos + 4.5)
          yPos += 9
        }

        // Solution
        if (f.suggestion || f.code_suggested) {
          doc.setFillColor(220, 252, 231) // green-100
          doc.setDrawColor(187, 247, 208)
          doc.roundedRect(28, yPos, 157, 8, 0.5, 0.5, "FD")
          doc.setFont("helvetica", "normal")
          doc.setFontSize(6.5)
          doc.setTextColor(22, 101, 52) // green-800
          const solution = (f.suggestion || f.code_suggested || "").substring(0, 85)
          doc.text(`✓ ${solution}`, 30, yPos + 5)
          yPos += 10
        }

        yPos += 5
      })

      if (repoFindings.length > 3) {
        doc.setFontSize(7)
        doc.setFont("helvetica", "italic")
        doc.setTextColor(100, 116, 139)
        doc.text(`... e mais ${repoFindings.length - 3} ocorrências neste repositório`, 30, yPos)
        yPos += 8
      }
    })
  })

  // ============ RECOMENDAÇÕES ============
  doc.addPage()
  yPos = 20

  doc.setFillColor(30, 58, 138)
  doc.rect(0, 0, 210, 15, "F")
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("✅  PLANO DE AÇÃO RECOMENDADO", 15, 10)

  yPos = 35

  const recommendations = [
    {
      priority: "1",
      title: "Atualização de Banco de Dados",
      description: "Modificar campos CNPJ para VARCHAR(18) em todas as tabelas",
      hours: Math.round(estimatedHours * 0.2),
    },
    {
      priority: "2",
      title: "Validações de Backend",
      description: "Atualizar regexes e validações para aceitar formato alfanumérico",
      hours: Math.round(estimatedHours * 0.4),
    },
    {
      priority: "3",
      title: "Interface de Usuário",
      description: "Atualizar máscaras de input e mensagens de validação",
      hours: Math.round(estimatedHours * 0.2),
    },
    {
      priority: "4",
      title: "Testes e Homologação",
      description: "Validar com CNPJs numéricos e alfanuméricos",
      hours: Math.round(estimatedHours * 0.2),
    },
  ]

  recommendations.forEach((rec, idx) => {
    doc.setFillColor(239, 246, 255) // blue-50
    doc.setDrawColor(191, 219, 254)
    doc.roundedRect(15, yPos, 180, 25, 2, 2, "FD")

    // Priority badge
    doc.setFillColor(37, 99, 235) // blue-600
    doc.circle(22, yPos + 12, 4, "F")
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text(rec.priority, 22, yPos + 13.5, { align: "center" })

    // Title
    doc.setFontSize(11)
    doc.setTextColor(30, 64, 175) // blue-800
    doc.text(rec.title, 30, yPos + 8)

    // Description
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(51, 65, 85)
    doc.text(rec.description, 30, yPos + 14)

    // Hours badge
    doc.setFillColor(234, 179, 8, 0.2) // yellow-500 transparent
    doc.roundedRect(30, yPos + 17, 25, 6, 1, 1, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(161, 98, 7) // yellow-700
    doc.text(`⏱️ ${rec.hours}h`, 32, yPos + 21)

    yPos += 30
  })

  return Buffer.from(doc.output("arraybuffer"))
}

export async function generateExcelReport(data: ReportData): Promise<Buffer> {
  const estimatedHours =
    data.analysis.estimated_hours ||
    data.analysis.results?.summary?.estimated_hours ||
    Math.ceil((data.findings.length * 0.5 + data.databaseFindings.length * 1) / 8)

  const uniqueFiles = new Set(data.findings.map((f) => f.file_path))
  const totalFiles = uniqueFiles.size || data.analysis.total_files || data.analysis.files_analyzed || 0
  const totalFilesAnalyzed = data.analysis.total_files || totalFiles

  const uniqueRepos = new Set(data.findings.map((f) => f.repository || data.analysis.repository_name))
  const uniqueProjects = new Set(data.findings.map((f) => f.project).filter(Boolean))

  const workbook = new ExcelJS.Workbook()

  const dashboardSheet = workbook.addWorksheet("Dashboard Executivo")

  // Title
  dashboardSheet.mergeCells("A1:F1")
  const titleCell = dashboardSheet.getCell("A1")
  titleCell.value = "RELATÓRIO EXECUTIVO - CNPJ ALFANUMÉRICO"
  titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } }
  dashboardSheet.getRow(1).height = 35

  // Summary stats
  let row = 3
  dashboardSheet.getCell(`A${row}`).value = "Gerado em:"
  dashboardSheet.getCell(`B${row}`).value = new Date().toLocaleString("pt-BR")
  row++

  dashboardSheet.getCell(`A${row}`).value = "Conta:"
  dashboardSheet.getCell(`B${row}`).value = data.analysis.account_name || "N/A"
  row += 2

  const metrics = [
    ["Total de Projetos", uniqueProjects.size],
    ["Total de Repositórios", uniqueRepos.size],
    ["Arquivos Analisados", totalFilesAnalyzed],
    ["Arquivos com Ocorrências", totalFiles],
    ["Total de Ocorrências", data.findings.length],
    ["Campos de Banco", data.databaseFindings.length],
    ["Estimativa Total (horas)", estimatedHours],
  ]

  metrics.forEach(([label, value]) => {
    dashboardSheet.getCell(`A${row}`).value = label
    dashboardSheet.getCell(`A${row}`).font = { bold: true }
    dashboardSheet.getCell(`A${row}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } }
    dashboardSheet.getCell(`B${row}`).value = value
    dashboardSheet.getCell(`B${row}`).font = { bold: true, size: 14, color: { argb: "FF1E3A8A" } }
    row++
  })

  dashboardSheet.getColumn("A").width = 35
  dashboardSheet.getColumn("B").width = 25

  const projectSheet = workbook.addWorksheet("Estimativas por Projeto")

  projectSheet.columns = [
    { header: "Projeto", key: "project", width: 35 },
    { header: "Repositórios", key: "repos", width: 15 },
    { header: "Arquivos", key: "files", width: 12 },
    { header: "Ocorrências", key: "occurrences", width: 15 },
    { header: "Horas Estimadas", key: "hours", width: 18 },
  ]

  const headerRow = projectSheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } }
  headerRow.alignment = { horizontal: "center", vertical: "middle" }
  headerRow.height = 25

  Array.from(uniqueProjects).forEach((project) => {
    const projectFindings = data.findings.filter((f) => f.project === project)
    const projectRepos = new Set(projectFindings.map((f) => f.repository))
    const projectFiles = new Set(projectFindings.map((f) => f.file_path))
    const projectHours = Math.ceil((projectFindings.length * 0.5) / 8)

    projectSheet.addRow({
      project: project || "Sem Projeto",
      repos: projectRepos.size,
      files: projectFiles.size,
      occurrences: projectFindings.length,
      hours: projectHours,
    })
  })

  const repoSheet = workbook.addWorksheet("Estimativas por Repositório")

  repoSheet.columns = [
    { header: "#", key: "id", width: 8 },
    { header: "Projeto", key: "project", width: 25 },
    { header: "Repositório", key: "repo", width: 35 },
    { header: "Arquivos Analisados", key: "total_files", width: 20 },
    { header: "Arquivos c/ Ocorrências", key: "files_with_issues", width: 25 },
    { header: "Total Ocorrências", key: "occurrences", width: 18 },
    { header: "Horas Estimadas", key: "hours", width: 18 },
  ]

  const repoHeaderRow = repoSheet.getRow(1)
  repoHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } }
  repoHeaderRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B82F6" } }
  repoHeaderRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
  repoHeaderRow.height = 30

  Array.from(uniqueRepos).forEach((repo, idx) => {
    const repoFindings = data.findings.filter((f) => f.repository === repo || data.analysis.repository_name === repo)
    const repoFiles = new Set(repoFindings.map((f) => f.file_path))
    const repoHours = Math.ceil((repoFindings.length * 0.5) / 8)

    repoSheet.addRow({
      id: idx + 1,
      project: repoFindings[0]?.project || "N/A",
      repo: repo,
      total_files: data.analysis.total_files || 0,
      files_with_issues: repoFiles.size,
      occurrences: repoFindings.length,
      hours: repoHours,
    })
  })

  const detailSheet = workbook.addWorksheet("Detalhamento Linha a Linha")

  detailSheet.columns = [
    { header: "#", key: "id", width: 8 },
    { header: "Conta", key: "account", width: 20 },
    { header: "Projeto", key: "project", width: 25 },
    { header: "Repositório", key: "repository", width: 30 },
    { header: "Arquivo", key: "file", width: 50 },
    { header: "Linha", key: "line", width: 10 },
    { header: "Campo", key: "field", width: 20 },
    { header: "Severidade", key: "severity", width: 12 },
    { header: "Código Atual", key: "code_current", width: 60 },
    { header: "Código Sugerido", key: "code_suggested", width: 60 },
    { header: "Horas Est.", key: "hours", width: 12 },
  ]

  const detailHeaderRow = detailSheet.getRow(1)
  detailHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } }
  detailHeaderRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } }
  detailHeaderRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
  detailHeaderRow.height = 30

  data.findings.forEach((f, idx) => {
    const severity = calculateSeverity(f)

    const dataRow = detailSheet.addRow({
      id: idx + 1,
      account: f.account_name || data.analysis.account_name,
      project: f.project || "N/A",
      repository: f.repository || data.analysis.repository_name,
      file: f.file_path,
      line: f.line_number,
      field: f.field_name || "CNPJ",
      severity: severity.toUpperCase(),
      code_current: f.context || f.code_snippet || "N/A",
      code_suggested: f.suggestion || f.code_suggested || "Atualizar para VARCHAR(18)",
      hours: 0.5,
    })

    // Color code by severity
    const severityColors: Record<string, string> = {
      critical: "FFEF4444", // red-500
      high: "FFF97316", // orange-500
      medium: "FFF59E0B", // amber-500
      low: "FF84CC16", // lime-500
    }

    dataRow.getCell("severity").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: severityColors[severity] || "FFCCCCCC" },
    }
    dataRow.getCell("severity").font = { bold: true, color: { argb: "FFFFFFFF" } }

    dataRow.alignment = { wrapText: true, vertical: "top" }
    dataRow.height = 40
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export async function generateExecutiveReport(data: ReportData) {
  const estimatedHours =
    data.analysis.estimated_hours ||
    data.analysis.results?.summary?.estimated_hours ||
    Math.ceil((data.findings.length * 3 + data.databaseFindings.length * 6) / 60)

  const totalFiles =
    data.analysis.total_files || data.analysis.results?.summary?.total_files || data.analysis.files_analyzed || 0

  const summary = {
    total_files: totalFiles,
    cnpj_occurrences: data.findings.length,
    database_fields: data.databaseFindings.length,
    estimated_hours: estimatedHours,
  }

  const complexityBreakdown = {
    low: data.findings.filter((f) => f.complexity === "low").length,
    medium: data.findings.filter((f) => f.complexity === "medium").length,
    high: data.findings.filter((f) => f.complexity === "high").length,
  }

  const languageBreakdown = data.findings.reduce(
    (acc, f) => {
      acc[f.language] = (acc[f.language] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const databaseBreakdown = data.databaseFindings.reduce(
    (acc, f) => {
      acc[f.database_type] = (acc[f.database_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    executive_summary: {
      title: "Relatório Executivo - Migração CNPJ Alfanumérico",
      repository: data.analysis.repository_name,
      analysis_date: new Date(data.analysis.completed_at).toLocaleDateString("pt-BR"),
      deadline: "Julho de 2026",
      status: "Análise Concluída",
    },
    impact_analysis: {
      scope: {
        total_files_analyzed: summary.total_files,
        files_requiring_changes: data.findings.length,
        database_tables_affected: new Set(data.databaseFindings.map((f) => f.table_name)).size,
        estimated_effort_hours: summary.estimated_hours,
        estimated_effort_days: Math.ceil(summary.estimated_hours / 8),
      },
      complexity: {
        low: complexityBreakdown.low,
        medium: complexityBreakdown.medium,
        high: complexityBreakdown.high,
        distribution: {
          low_percentage: Math.round((complexityBreakdown.low / data.findings.length) * 100),
          medium_percentage: Math.round((complexityBreakdown.medium / data.findings.length) * 100),
          high_percentage: Math.round((complexityBreakdown.high / data.findings.length) * 100),
        },
      },
      technologies: {
        languages: languageBreakdown,
        databases: databaseBreakdown,
      },
    },
    financial_impact: {
      estimated_cost: {
        development: summary.estimated_hours * 150,
        testing: summary.estimated_hours * 0.3 * 150,
        deployment: 5000,
        total: summary.estimated_hours * 150 * 1.3 + 5000,
      },
      risk_of_non_compliance: {
        description: "Não conformidade com Receita Federal após julho/2026",
        potential_fines: "Multas e impossibilidade de emitir novos CNPJs",
        business_impact: "Interrupção de cadastros e operações",
      },
    },
    implementation_roadmap: {
      phase_1: {
        name: "Preparação e Planejamento",
        duration: "1-2 semanas",
        activities: [
          "Revisar relatório técnico detalhado",
          "Alocar equipe de desenvolvimento",
          "Definir ambiente de testes",
          "Criar plano de rollback",
        ],
      },
      phase_2: {
        name: "Desenvolvimento",
        duration: `${Math.ceil((summary.estimated_hours * 0.6) / 40)} semanas`,
        activities: [
          "Atualizar validações de CNPJ",
          "Modificar schemas de banco de dados",
          "Ajustar interfaces de usuário",
          "Atualizar integrações de API",
        ],
      },
      phase_3: {
        name: "Testes e Validação",
        duration: `${Math.ceil((summary.estimated_hours * 0.3) / 40)} semanas`,
        activities: [
          "Testes unitários e integração",
          "Testes de regressão",
          "Validação com dados reais",
          "Homologação com stakeholders",
        ],
      },
      phase_4: {
        name: "Deploy e Monitoramento",
        duration: "1 semana",
        activities: ["Deploy em produção", "Monitoramento intensivo", "Suporte dedicado", "Documentação final"],
      },
    },
    critical_success_factors: [
      "Alocação de equipe dedicada ao projeto",
      "Ambiente de testes com dados reais",
      "Plano de comunicação com usuários",
      "Backup completo antes de alterações",
      "Monitoramento pós-deploy por 30 dias",
    ],
    recommendations: {
      immediate: [
        "Iniciar planejamento detalhado imediatamente",
        "Alocar orçamento para desenvolvimento",
        "Definir equipe responsável",
      ],
      short_term: [
        "Criar ambiente de desenvolvimento dedicado",
        "Implementar testes automatizados",
        "Treinar equipe sobre novo formato",
      ],
      long_term: [
        "Estabelecer processo de validação contínua",
        "Documentar lições aprendidas",
        "Preparar suporte para usuários finais",
      ],
    },
  }
}

export async function generateExecutivePDFReport(data: ReportData): Promise<string> {
  const executive = generateExecutiveReport(data)

  const content = `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        RELATÓRIO EXECUTIVO - MIGRAÇÃO CNPJ ALFANUMÉRICO       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

Repositório: ${executive.executive_summary.repository}
Data da Análise: ${executive.executive_summary.analysis_date}
Prazo Legal: ${executive.executive_summary.deadline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. SUMÁRIO EXECUTIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A Receita Federal implementará o CNPJ Alfanumérico em julho de 2026.
Este relatório apresenta a análise completa do impacto no sistema
${executive.executive_summary.repository} e o plano de ação necessário.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. ANÁLISE DE IMPACTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Escopo do Projeto:
  • Arquivos Analisados: ${executive.impact_analysis.scope.total_files_analyzed}
  • Arquivos que Requerem Alteração: ${executive.impact_analysis.scope.files_requiring_changes}
  • Tabelas de Banco Afetadas: ${executive.impact_analysis.scope.database_tables_affected}
  • Esforço Estimado: ${executive.impact_analysis.scope.estimated_effort_hours} horas (${executive.impact_analysis.scope.estimated_effort_days} dias úteis)

Distribuição de Complexidade:
  • Baixa: ${executive.impact_analysis.complexity.low} ocorrências (${executive.impact_analysis.complexity.distribution.low_percentage}%)
  • Média: ${executive.impact_analysis.complexity.medium} ocorrências (${executive.impact_analysis.complexity.distribution.medium_percentage}%)
  • Alta: ${executive.impact_analysis.complexity.high} ocorrências (${executive.impact_analysis.complexity.distribution.high_percentage}%)

Tecnologias Envolvidas:
  Linguagens: ${Object.entries(executive.impact_analysis.technologies.languages)
    .map(([lang, count]) => `${lang} (${count})`)
    .join(", ")}
  Bancos de Dados: ${Object.entries(executive.impact_analysis.technologies.databases)
    .map(([db, count]) => `${db} (${count})`)
    .join(", ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. IMPACTO FINANCEIRO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Investimento Estimado:
  • Desenvolvimento: R$ ${executive.financial_impact.estimated_cost.development.toLocaleString("pt-BR")}
  • Testes: R$ ${executive.financial_impact.estimated_cost.testing.toLocaleString("pt-BR")}
  • Deploy: R$ ${executive.financial_impact.estimated_cost.deployment.toLocaleString("pt-BR")}
  ─────────────────────────────────────────────────────────────
  TOTAL: R$ ${executive.financial_impact.estimated_cost.total.toLocaleString("pt-BR")}

Risco de Não Conformidade:
  ${executive.financial_impact.risk_of_non_compliance.description}
  • ${executive.financial_impact.risk_of_non_compliance.potential_fines}
  • ${executive.financial_impact.risk_of_non_compliance.business_impact}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. ROADMAP DE IMPLEMENTAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Object.entries(executive.implementation_roadmap)
  .map(
    ([key, phase]: [string, any]) => `
${phase.name} (${phase.duration})
${phase.activities.map((activity: string) => `  ✓ ${activity}`).join("\n")}
`,
  )
  .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. FATORES CRÍTICOS DE SUCESSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${executive.critical_success_factors.map((factor) => `  • ${factor}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. RECOMENDAÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ações Imediatas:
${executive.recommendations.immediate.map((rec) => `  1. ${rec}`).join("\n")}

Curto Prazo (1-3 meses):
${executive.recommendations.short_term.map((rec) => `  2. ${rec}`).join("\n")}

Longo Prazo (3-6 meses):
${executive.recommendations.long_term.map((rec) => `  3. ${rec}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Relatório gerado por: CNPJ Alfanumérico
Data de geração: ${new Date().toLocaleString("pt-BR")}
Versão: 1.0


`

  return content
}

export async function generateEnhancedExcelReport(data: ReportData): Promise<Buffer> {
  const detailedGenerator = new DetailedReportGenerator()

  const detailedFindings: DetailedFinding[] = data.findings.map((f) => ({
    repository: data.analysis.repository_name,
    file_path: f.file_path,
    line_number: f.line_number,
    language: f.language || "Unknown",
    cnpj_found: f.cnpj_found || "N/A",
    code_current: f.code_current || f.code_snippet || f.context || "",
    code_before: f.code_before || [],
    code_after: f.code_after || [],
    code_suggested: f.code_suggested || f.suggestion || "",
    action_required: f.action_required || "UPDATE",
    observation: f.observation || f.suggestion || "CNPJ deve ser atualizado para formato alfanumérico",
  }))

  return await detailedGenerator.generateDetailedExcel(detailedFindings, {
    repository_name: data.analysis.repository_name,
    completed_at: data.analysis.completed_at,
    total_files: data.analysis.total_files || data.analysis.files_analyzed,
    estimated_hours: data.analysis.estimated_hours,
  })
}

export async function generateEnhancedPDFReport(data: ReportData): Promise<Buffer> {
  const detailedGenerator = new DetailedReportGenerator()

  const detailedFindings: DetailedFinding[] = data.findings.map((f) => ({
    repository: data.analysis.repository_name,
    file_path: f.file_path,
    line_number: f.line_number,
    language: f.language || "Unknown",
    cnpj_found: f.cnpj_found || "N/A",
    code_current: f.code_current || f.code_snippet || f.context || "",
    code_before: f.code_before || [],
    code_after: f.code_after || [],
    code_suggested: f.code_suggested || f.suggestion || "",
    action_required: f.action_required || "UPDATE",
    observation: f.observation || f.suggestion || "CNPJ deve ser atualizado para formato alfanumérico",
  }))

  return await detailedGenerator.generateDetailedPDF(detailedFindings, {
    repository_name: data.analysis.repository_name,
    completed_at: data.analysis.completed_at,
    total_files: data.analysis.total_files || data.analysis.files_analyzed,
    estimated_hours: data.analysis.estimated_hours,
  })
}
