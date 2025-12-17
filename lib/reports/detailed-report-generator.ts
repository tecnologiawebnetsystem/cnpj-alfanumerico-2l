import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'

export interface DetailedFinding {
  repository: string
  file_path: string
  line_number: number
  language: string
  cnpj_found: string
  code_current: string
  code_before?: string[]
  code_after?: string[]
  code_suggested: string
  action_required: 'UPDATE' | 'NONE'
  observation: string
  project?: string // Add project field to interface
}

export class DetailedReportGenerator {
  async generateDetailedExcel(
    findings: DetailedFinding[],
    analysisData: any
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    
    const summarySheet = workbook.addWorksheet('Resumo Executivo')
    this.createSummarySheet(summarySheet, findings, analysisData)
    
    const detailsSheet = workbook.addWorksheet('Detalhamento Completo')
    this.createDetailsSheet(detailsSheet, findings)
    
    const noActionFindings = findings.filter(f => f.action_required === 'NONE')
    if (noActionFindings.length > 0) {
      const noActionSheet = workbook.addWorksheet('Sem Alteração Necessária')
      this.createNoActionSheet(noActionSheet, noActionFindings)
    }
    
    const statsSheet = workbook.addWorksheet('Estatísticas')
    this.createStatisticsSheet(statsSheet, findings, analysisData)
    
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  private createSummarySheet(
    sheet: ExcelJS.Worksheet,
    findings: DetailedFinding[],
    analysisData: any
  ) {
    // Title
    sheet.mergeCells('A1:F1')
    const titleCell = sheet.getCell('A1')
    titleCell.value = 'RELATÓRIO DE ANÁLISE CNPJ ALFANUMÉRICO'
    titleCell.font = { size: 16, bold: true }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    }
    
    sheet.getRow(1).height = 30
    
    // Repository info
    sheet.getCell('A3').value = 'Repositório:'
    sheet.getCell('B3').value = analysisData.repository_name
    sheet.getCell('A4').value = 'Data da Análise:'
    sheet.getCell('B4').value = new Date(analysisData.completed_at).toLocaleString('pt-BR')
    
    // Summary statistics
    const totalFindings = findings.length
    const requiresUpdate = findings.filter(f => f.action_required === 'UPDATE').length
    const noAction = findings.filter(f => f.action_required === 'NONE').length
    const totalFiles = new Set(findings.map(f => f.file_path)).size
    
    sheet.getCell('A6').value = 'Total de Arquivos Analisados:'
    sheet.getCell('B6').value = analysisData.total_files || 0
    
    sheet.getCell('A7').value = 'Arquivos com CNPJs:'
    sheet.getCell('B7').value = totalFiles
    
    sheet.getCell('A8').value = 'Total de CNPJs Encontrados:'
    sheet.getCell('B8').value = totalFindings
    
    sheet.getCell('A9').value = 'Requerem Atualização:'
    sheet.getCell('B9').value = requiresUpdate
    sheet.getCell('B9').font = { color: { argb: 'FFFF0000' }, bold: true }
    
    sheet.getCell('A10').value = 'Sem Alteração Necessária:'
    sheet.getCell('B10').value = noAction
    sheet.getCell('B10').font = { color: { argb: 'FF00B050' }, bold: true }
    
    sheet.getCell('A11').value = 'Estimativa de Esforço:'
    sheet.getCell('B11').value = `${analysisData.estimated_hours || 0} horas`
    
    // Style the summary section
    for (let row = 3; row <= 11; row++) {
      sheet.getCell(`A${row}`).font = { bold: true }
      sheet.getCell(`A${row}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' }
      }
    }
    
    // Set column widths
    sheet.getColumn('A').width = 30
    sheet.getColumn('B').width = 40
  }

  private createDetailsSheet(
    sheet: ExcelJS.Worksheet,
    findings: DetailedFinding[]
  ) {
    // Header row
    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Projeto', key: 'project', width: 20 }, // Add project column
      { header: 'Repositório', key: 'repository', width: 20 },
      { header: 'Caminho do Arquivo', key: 'file_path', width: 50 },
      { header: 'Linha', key: 'line_number', width: 8 },
      { header: 'Linguagem', key: 'language', width: 12 },
      { header: 'CNPJ Encontrado', key: 'cnpj_found', width: 20 },
      { header: 'Código Atual (3 linhas)', key: 'code_current', width: 50 },
      { header: 'Código Sugerido (3 linhas)', key: 'code_suggested', width: 50 },
      { header: 'Ação', key: 'action', width: 12 },
      { header: 'Observação', key: 'observation', width: 60 }
    ]
    
    // Style header
    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    }
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    headerRow.height = 30
    
    // Add data
    findings.forEach((finding, index) => {
      const codeContext = this.formatCodeContext(finding)
      
      const row = sheet.addRow({
        id: index + 1,
        project: finding.project || 'N/A', // Add project field
        repository: finding.repository,
        file_path: finding.file_path,
        line_number: finding.line_number,
        language: finding.language,
        cnpj_found: finding.cnpj_found,
        code_current: codeContext.current,
        code_suggested: codeContext.suggested,
        action: finding.action_required === 'UPDATE' ? 'ATUALIZAR' : 'SEM AÇÃO',
        observation: finding.observation
      })
      
      // Color code based on action
      if (finding.action_required === 'UPDATE') {
        row.getCell('action').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC7CE' }
        }
        row.getCell('action').font = { color: { argb: 'FF9C0006' }, bold: true }
      } else {
        row.getCell('action').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' }
        }
        row.getCell('action').font = { color: { argb: 'FF006100' }, bold: true }
      }
      
      // Wrap text for long content
      row.alignment = { wrapText: true, vertical: 'top' }
      row.height = 60
    })
    
    // Apply borders
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })
  }

  private createNoActionSheet(
    sheet: ExcelJS.Worksheet,
    findings: DetailedFinding[]
  ) {
    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Arquivo', key: 'file_path', width: 50 },
      { header: 'Linha', key: 'line_number', width: 8 },
      { header: 'CNPJ', key: 'cnpj_found', width: 20 },
      { header: 'Motivo', key: 'observation', width: 80 }
    ]
    
    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    }
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
    
    findings.forEach((finding, index) => {
      sheet.addRow({
        id: index + 1,
        file_path: finding.file_path,
        line_number: finding.line_number,
        cnpj_found: finding.cnpj_found,
        observation: finding.observation
      })
    })
    
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })
  }

  private createStatisticsSheet(
    sheet: ExcelJS.Worksheet,
    findings: DetailedFinding[],
    analysisData: any
  ) {
    // Language breakdown
    const languageStats: Record<string, number> = {}
    findings.forEach(f => {
      languageStats[f.language] = (languageStats[f.language] || 0) + 1
    })
    
    sheet.getCell('A1').value = 'Distribuição por Linguagem'
    sheet.getCell('A1').font = { size: 14, bold: true }
    sheet.getCell('A2').value = 'Linguagem'
    sheet.getCell('B2').value = 'Quantidade'
    sheet.getCell('A2').font = { bold: true }
    sheet.getCell('B2').font = { bold: true }
    
    let row = 3
    Object.entries(languageStats).forEach(([lang, count]) => {
      sheet.getCell(`A${row}`).value = lang
      sheet.getCell(`B${row}`).value = count
      row++
    })
    
    // Action required breakdown
    sheet.getCell('D1').value = 'Distribuição por Ação'
    sheet.getCell('D1').font = { size: 14, bold: true }
    sheet.getCell('D2').value = 'Ação'
    sheet.getCell('E2').value = 'Quantidade'
    sheet.getCell('D2').font = { bold: true }
    sheet.getCell('E2').font = { bold: true }
    
    const updateCount = findings.filter(f => f.action_required === 'UPDATE').length
    const noneCount = findings.filter(f => f.action_required === 'NONE').length
    
    sheet.getCell('D3').value = 'ATUALIZAR'
    sheet.getCell('E3').value = updateCount
    sheet.getCell('D4').value = 'SEM AÇÃO'
    sheet.getCell('E4').value = noneCount
    
    sheet.getColumn('A').width = 20
    sheet.getColumn('B').width = 15
    sheet.getColumn('D').width = 20
    sheet.getColumn('E').width = 15
  }

  private formatCodeContext(finding: DetailedFinding): { current: string; suggested: string } {
    const before = finding.code_before || []
    const after = finding.code_after || []
    
    const currentLines = [
      ...before.map((line, idx) => `${finding.line_number - before.length + idx}: ${line}`),
      `${finding.line_number}: ${finding.code_current} ← LINHA COM PROBLEMA`,
      ...after.map((line, idx) => `${finding.line_number + idx + 1}: ${line}`)
    ]
    
    const suggestedLines = [
      ...before.map((line, idx) => `${finding.line_number - before.length + idx}: ${line}`),
      `${finding.line_number}: ${finding.code_suggested} ← CORREÇÃO APLICADA`,
      ...after.map((line, idx) => `${finding.line_number + idx + 1}: ${line}`)
    ]
    
    return {
      current: currentLines.join('\n'),
      suggested: suggestedLines.join('\n')
    }
  }

  async generateDetailedPDF(
    findings: DetailedFinding[],
    analysisData: any
  ): Promise<Buffer> {
    const doc = new jsPDF()
    let yPos = 20
    
    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('RELATÓRIO DETALHADO - ANÁLISE CNPJ ALFANUMÉRICO', 105, yPos, { align: 'center' })
    yPos += 15
    
    // Summary
    doc.setFontSize(12)
    doc.text(`Repositório: ${analysisData.repository_name}`, 20, yPos)
    yPos += 8
    doc.text(`Data: ${new Date(analysisData.completed_at).toLocaleString('pt-BR')}`, 20, yPos)
    yPos += 15
    
    // Statistics
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMO:', 20, yPos)
    yPos += 8
    doc.setFont('helvetica', 'normal')
    
    const totalFindings = findings.length
    const requiresUpdate = findings.filter(f => f.action_required === 'UPDATE').length
    const noAction = findings.filter(f => f.action_required === 'NONE').length
    
    doc.text(`Total de CNPJs Encontrados: ${totalFindings}`, 20, yPos)
    yPos += 6
    doc.text(`Requerem Atualização: ${requiresUpdate}`, 20, yPos)
    yPos += 6
    doc.text(`Sem Alteração Necessária: ${noAction}`, 20, yPos)
    yPos += 15
    
    // Findings
    doc.setFont('helvetica', 'bold')
    doc.text('DETALHAMENTO POR OCORRÊNCIA:', 20, yPos)
    yPos += 10
    
    findings.slice(0, 10).forEach((finding, index) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(`${index + 1}. ${finding.file_path}:${finding.line_number}`, 20, yPos)
      yPos += 6
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`CNPJ: ${finding.cnpj_found} | Ação: ${finding.action_required}`, 25, yPos)
      yPos += 5
      
      doc.setTextColor(180, 0, 0)
      doc.text('Código Atual:', 25, yPos)
      yPos += 4
      doc.setTextColor(0, 0, 0)
      doc.text(finding.code_current.substring(0, 80), 30, yPos)
      yPos += 5
      
      doc.setTextColor(0, 128, 0)
      doc.text('Código Sugerido:', 25, yPos)
      yPos += 4
      doc.setTextColor(0, 0, 0)
      doc.text(finding.code_suggested.substring(0, 80), 30, yPos)
      yPos += 8
    })
    
    return Buffer.from(doc.output('arraybuffer'))
  }
}
