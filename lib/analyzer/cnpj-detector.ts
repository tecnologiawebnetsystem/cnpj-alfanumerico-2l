import { CodeContextExtractor } from "./code-context-extractor"

export interface CNPJFinding {
  file: string
  line: number
  code: string
  type: "field" | "validation" | "mask" | "database"
  fieldName: string
  context: string
  complexity: "low" | "medium" | "high"
  suggestion: string
  language: string
  code_before?: string[]
  code_current?: string
  code_after?: string[]
  code_suggested?: string
  cnpj_found?: string
  cnpj_replacement?: string
  action_required?: "UPDATE" | "NONE"
  observation?: string
  severity?: "critical" | "high" | "medium" | "low"
  risk_level?: string
  business_impact?: string
  technical_solution?: string
  migration_steps?: string[]
  testing_requirements?: string[]
  rollback_plan?: string
  estimated_hours?: number
  dependencies?: string[]
}

export class CNPJDetector {
  private cnpjPatterns: RegExp[]
  private cnpjLiteralPattern = /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g
  private contextExtractor = new CodeContextExtractor()

  constructor(customFieldNames?: string[]) {
    const fieldNames =
      customFieldNames && customFieldNames.length > 0
        ? customFieldNames
        : ["cnpj", "cpf_cnpj", "documento", "inscricao", "inscricaofederal", "nr_cnpj", "num_cnpj", "cadastro_nacional"]

    console.log("[v0] CNPJDetector initialized with field names:", fieldNames)

    this.cnpjPatterns = fieldNames.map((name) => {
      const pattern = new RegExp(name, "gi") // gi = global + case-insensitive
      return pattern
    })

    console.log("[v0] CNPJDetector created", this.cnpjPatterns.length, "patterns")
  }

  async analyzeFile(filePath: string, content: string, language: string): Promise<CNPJFinding[]> {
    const findings: CNPJFinding[] = []
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Test if ANY pattern matches this line
      let hasMatch = false
      for (const pattern of this.cnpjPatterns) {
        pattern.lastIndex = 0 // Reset regex state
        if (pattern.test(line)) {
          hasMatch = true
          break
        }
      }

      if (hasMatch) {
        const context = this.getContext(lines, i)
        const analysis = this.fallbackAnalysis(line)

        const cnpjMatches = line.match(this.cnpjLiteralPattern)
        let detailedContext: any = {}

        if (cnpjMatches && cnpjMatches.length > 0) {
          const cnpjValue = cnpjMatches[0]
          detailedContext = this.contextExtractor.extractContext(content, i + 1, cnpjValue)
        }

        findings.push({
          file: filePath,
          line: i + 1,
          code: line.trim(),
          type: analysis.type,
          fieldName: analysis.fieldName,
          context: context,
          complexity: analysis.complexity,
          suggestion: analysis.suggestion,
          language,
          ...(cnpjMatches && {
            code_before: detailedContext.code_before,
            code_current: detailedContext.code_current,
            code_after: detailedContext.code_after,
            code_suggested: detailedContext.code_suggested,
            cnpj_found: cnpjMatches[0],
            cnpj_replacement: detailedContext.cnpj_replacement,
            action_required: detailedContext.action_required,
            observation: detailedContext.observation,
            severity: detailedContext.severity,
            risk_level: detailedContext.risk_level,
            business_impact: detailedContext.business_impact,
            technical_solution: detailedContext.technical_solution,
            migration_steps: detailedContext.migration_steps,
            testing_requirements: detailedContext.testing_requirements,
            rollback_plan: detailedContext.rollback_plan,
            estimated_hours: detailedContext.estimated_hours,
            dependencies: detailedContext.dependencies,
          }),
        })
      }
    }

    return findings
  }

  private getContext(lines: string[], lineIndex: number): string {
    const start = Math.max(0, lineIndex - 2)
    const end = Math.min(lines.length, lineIndex + 3)
    return lines.slice(start, end).join("\n")
  }

  private fallbackAnalysis(line: string) {
    const fieldMatch = line.match(/(\w*cnpj\w*|\w*documento\w*|\w*cpf\w*)/i)
    const fieldName = fieldMatch ? fieldMatch[1] : "unknown"

    let type: CNPJFinding["type"] = "field"
    let complexity: CNPJFinding["complexity"] = "low"

    if (/validate|check|verify/i.test(line)) {
      type = "validation"
      complexity = "medium"
    } else if (/mask|format|replace/i.test(line)) {
      type = "mask"
      complexity = "medium"
    } else if (/varchar|char|string|text/i.test(line)) {
      type = "database"
      complexity = "low"
    }

    return {
      type,
      fieldName,
      complexity,
      suggestion: `Alterar campo ${fieldName} para aceitar caracteres alfanuméricos (A-Z, 0-9) mantendo 14 posições`,
    }
  }
}
