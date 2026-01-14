import type { ExtractedFile } from "./file-extractor"

interface Finding {
  analysis_id: string
  file_path: string
  file_type: string
  line_number: number
  field_name: string
  field_type: string
  context: string
  suggestion: string
  is_input: boolean
  is_output: boolean
  is_database: boolean
  is_validation: boolean
  supports_cpf: boolean
}

export async function analyzeCNPJPatterns(files: ExtractedFile[], analysisId: string): Promise<Finding[]> {
  const findings: Finding[] = []

  // CNPJ patterns to search for
  const cnpjPatterns = [
    /cnpj/i,
    /cpf_cnpj/i,
    /documento/i,
    /cadastro.*nacional/i,
    /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/, // CNPJ format: 00.000.000/0000-00
  ]

  for (const file of files) {
    const lines = file.content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1

      // Check if line contains CNPJ-related patterns
      const hasCNPJPattern = cnpjPatterns.some((pattern) => pattern.test(line))

      if (hasCNPJPattern) {
        const analysis = analyzeLineWithPatterns(line, file.path, lineNumber)

        if (analysis) {
          findings.push({
            analysis_id: analysisId,
            file_path: file.path,
            file_type: file.extension,
            line_number: lineNumber,
            field_name: analysis.fieldName,
            field_type: analysis.fieldType,
            context: line.trim(),
            suggestion: analysis.suggestion,
            is_input: analysis.isInput,
            is_output: analysis.isOutput,
            is_database: analysis.isDatabase,
            is_validation: analysis.isValidation,
            supports_cpf: analysis.supportsCPF,
          })
        }
      }
    }
  }

  return findings
}

function analyzeLineWithPatterns(line: string, filePath: string, lineNumber: number) {
  try {
    const lowerLine = line.toLowerCase()

    // Extract field name
    const fieldNameMatch = line.match(/(\w*cnpj\w*|\w*cpf_cnpj\w*|\w*documento\w*)/i)
    const fieldName = fieldNameMatch ? fieldNameMatch[1] : "cnpj_field"

    // Determine field type and characteristics
    const isDatabase = /varchar|char|string|text|column|table|alter|create/i.test(line)
    const isValidation = /validate|check|verify|test|match|regex|pattern/i.test(line)
    const isInput = /input|field|form|textbox|entry/i.test(line)
    const isOutput = /display|show|print|render|output/i.test(line)
    const supportsCPF = /cpf/i.test(line)

    // Determine field type
    let fieldType = "field"
    if (isDatabase) fieldType = "database"
    else if (isValidation) fieldType = "validation"
    else if (isInput) fieldType = "input"
    else if (isOutput) fieldType = "output"

    // Generate suggestion based on type
    let suggestion = ""
    if (isDatabase) {
      suggestion = `Alterar tipo da coluna '${fieldName}' para VARCHAR(14) para suportar caracteres alfanuméricos (A-Z, 0-9)`
    } else if (isValidation) {
      suggestion = `Atualizar validação de '${fieldName}' para aceitar padrão [A-Z0-9]{14} em vez de apenas números`
    } else if (isInput) {
      suggestion = `Modificar campo de entrada '${fieldName}' para aceitar caracteres alfanuméricos (A-Z, 0-9) mantendo 14 posições`
    } else {
      suggestion = `Adaptar '${fieldName}' para processar CNPJ alfanumérico com 14 caracteres (letras e números)`
    }

    return {
      fieldName,
      fieldType,
      isInput,
      isOutput,
      isDatabase,
      isValidation,
      supportsCPF,
      suggestion,
    }
  } catch (error) {
    console.error(" Pattern analysis error:", error)
    return null
  }
}
