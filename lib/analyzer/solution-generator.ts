export interface SolutionRecommendation {
  severity: "critical" | "high" | "medium" | "low"
  priority: number
  risk_level: string
  business_impact: string
  technical_solution: string
  code_before: string
  code_after: string
  migration_steps: string[]
  testing_required: string[]
  rollback_plan: string
  estimated_hours: number
  dependencies: string[]
  breaking_changes: boolean
}

export class SolutionGenerator {
  generateSolution(finding: any): SolutionRecommendation {
    const language = finding.language || finding.file_type
    const fieldName = finding.field_name

    // Determine severity based on context
    const severity = this.calculateSeverity(finding)
    const priority = this.calculatePriority(severity, finding)

    return {
      severity,
      priority,
      risk_level: this.getRiskLevel(severity),
      business_impact: this.getBusinessImpact(severity),
      technical_solution: this.getTechnicalSolution(language, fieldName),
      code_before: finding.code_current || finding.context,
      code_after: this.generateCorrectedCode(finding),
      migration_steps: this.getMigrationSteps(language, fieldName),
      testing_required: this.getTestingRequirements(language),
      rollback_plan: this.getRollbackPlan(language),
      estimated_hours: this.estimateHours(finding),
      dependencies: this.getDependencies(language),
      breaking_changes: this.hasBreakingChanges(finding),
    }
  }

  private calculateSeverity(finding: any): "critical" | "high" | "medium" | "low" {
    const context = (finding.context || finding.code_current || "").toLowerCase()

    // Critical: Database schema, APIs, validation
    if (context.includes("create table") || context.includes("alter table")) {
      return "critical"
    }
    if (context.includes("api") || context.includes("endpoint") || context.includes("validate")) {
      return "high"
    }
    if (context.includes("mask") || context.includes("format") || context.includes("input")) {
      return "medium"
    }
    return "low"
  }

  private calculatePriority(severity: string, finding: any): number {
    const severityScore =
      {
        critical: 100,
        high: 75,
        medium: 50,
        low: 25,
      }[severity] || 25

    // Boost priority if in main/production files
    const filePath = finding.file_path || ""
    if (filePath.includes("prod") || filePath.includes("main") || filePath.includes("api")) {
      return Math.min(100, severityScore + 20)
    }

    return severityScore
  }

  private getRiskLevel(severity: string): string {
    return (
      {
        critical: "Alto - Sistema pode parar de funcionar",
        high: "Médio-Alto - Funcionalidades críticas afetadas",
        medium: "Médio - Experiência do usuário comprometida",
        low: "Baixo - Impacto mínimo, mas necessário",
      }[severity] || "Desconhecido"
    )
  }

  private getBusinessImpact(severity: string): string {
    return (
      {
        critical: "Não conformidade com Receita Federal. Sistema não aceitará novos CNPJs após Julho/2026.",
        high: "Validações falharão para CNPJs alfanuméricos. Cadastros serão rejeitados.",
        medium: "Máscaras visuais não funcionarão corretamente. Usuários confusos.",
        low: "Campos visuais podem ter problemas de layout ou validação inconsistente.",
      }[severity] || "Impacto a ser avaliado"
    )
  }

  private getTechnicalSolution(language: string, fieldName: string): string {
    const solutions: Record<string, string> = {
      SQL: `Alterar coluna ${fieldName} de VARCHAR(14) ou CHAR(14) para VARCHAR(18) para aceitar formato alfanumérico`,
      Java: `Atualizar validação de ${fieldName} para aceitar padrão: ^[A-Z0-9]{14}$ (14 caracteres alfanuméricos)`,
      TypeScript: `Modificar regex de validação: /^[A-Z0-9]{14}$/ e atualizar max length para 18`,
      JavaScript: `Atualizar validação para aceitar letras A-Z e números 0-9, mantendo 14 caracteres`,
      Python: `Modificar regex para: r'^[A-Z0-9]{14}$' e ajustar validadores`,
      "C#": `Atualizar RegularExpression para: @"^[A-Z0-9]{14}$" e MaxLength para 18`,
    }

    return (
      solutions[language] ||
      `Atualizar campo ${fieldName} para aceitar caracteres alfanuméricos (A-Z, 0-9) com 14-18 posições`
    )
  }

  private generateCorrectedCode(finding: any): string {
    const language = finding.language || finding.file_type
    const fieldName = finding.field_name
    const currentCode = finding.code_current || finding.context || ""

    // SQL
    if (language === "SQL") {
      if (currentCode.includes("VARCHAR") || currentCode.includes("CHAR")) {
        return currentCode.replace(/VARCHAR$$\d+$$/gi, "VARCHAR(18)").replace(/CHAR$$\d+$$/gi, "VARCHAR(18)")
      }
      return `ALTER TABLE <table_name> ALTER COLUMN ${fieldName} VARCHAR(18);`
    }

    // JavaScript/TypeScript
    if (language === "JavaScript" || language === "TypeScript") {
      if (currentCode.includes("maxLength")) {
        return currentCode.replace(/maxLength:\s*\d+/, "maxLength: 18")
      }
      if (currentCode.includes("pattern")) {
        return currentCode.replace(/pattern:.*[,}]/, `pattern: /^[A-Z0-9]{14}$/`)
      }
      return `// Atualizar validação\nconst ${fieldName}Regex = /^[A-Z0-9]{14}$/;\nif (!${fieldName}Regex.test(value)) { /* erro */ }`
    }

    // Java
    if (language === "Java") {
      if (currentCode.includes("@Pattern")) {
        return currentCode.replace(/@Pattern$$.*$$/, '@Pattern(regexp = "^[A-Z0-9]{14}$")')
      }
      if (currentCode.includes("@Size")) {
        return currentCode.replace(/@Size$$.*$$/, "@Size(min = 14, max = 18)")
      }
      return `@Pattern(regexp = "^[A-Z0-9]{14}$", message = "CNPJ deve conter 14 caracteres alfanuméricos")\nprivate String ${fieldName};`
    }

    // Python
    if (language === "Python") {
      if (currentCode.includes("re.match") || currentCode.includes("re.compile")) {
        return currentCode.replace(/['"]\\d.*['"]/, '"^[A-Z0-9]{14}$"')
      }
      return `# Atualizar validação\nimport re\ncnpj_pattern = re.compile(r'^[A-Z0-9]{14}$')\nif not cnpj_pattern.match(${fieldName}):\n    raise ValueError("CNPJ inválido")`
    }

    // C#
    if (language === "C#") {
      if (currentCode.includes("[RegularExpression")) {
        return currentCode.replace(/\[RegularExpression$$.*$$\]/, '[RegularExpression(@"^[A-Z0-9]{14}$")]')
      }
      if (currentCode.includes("[MaxLength")) {
        return currentCode.replace(/\[MaxLength$$\d+$$\]/, "[MaxLength(18)]")
      }
      return `[RegularExpression(@"^[A-Z0-9]{14}$", ErrorMessage = "CNPJ deve conter 14 caracteres alfanuméricos")]\npublic string ${fieldName} { get; set; }`
    }

    return finding.code_suggested || `// Atualizar para aceitar formato alfanumérico VARCHAR(18)`
  }

  private getMigrationSteps(language: string, fieldName: string): string[] {
    if (language === "SQL") {
      return [
        "1. Fazer backup completo do banco de dados",
        `2. Executar: ALTER TABLE <nome_tabela> ALTER COLUMN ${fieldName} VARCHAR(18);`,
        "3. Verificar se há constraints ou índices que precisam ser recriados",
        "4. Testar inserção de CNPJ alfanumérico de teste",
        "5. Validar que CNPJs antigos (numéricos) continuam funcionando",
      ]
    }

    return [
      "1. Atualizar código conforme sugestão acima",
      "2. Executar testes unitários e de integração",
      "3. Validar com CNPJs de teste: numérico (12345678000190) e alfanumérico (A1B2C3D4000190)",
      "4. Deploy em ambiente de homologação",
      "5. Testar fluxo completo end-to-end",
      "6. Deploy em produção",
    ]
  }

  private getTestingRequirements(language: string): string[] {
    return [
      "Testar CNPJ numérico antigo: 12.345.678/0001-90",
      "Testar CNPJ alfanumérico novo: A1.B2C.3D4/0001-90",
      "Testar entrada de 14 caracteres sem formatação",
      "Testar entrada de 18 caracteres com formatação",
      "Validar mensagens de erro claras",
      "Testar integração com APIs da Receita Federal",
    ]
  }

  private getRollbackPlan(language: string): string {
    if (language === "SQL") {
      return "Executar script de rollback: ALTER TABLE <nome> ALTER COLUMN <campo> VARCHAR(14); (dados alfanuméricos serão truncados)"
    }
    return "Reverter código para commit anterior via Git. Nenhum dado será perdido."
  }

  private estimateHours(finding: any): number {
    const language = finding.language || finding.file_type
    let baseHours = 0

    // Base por tipo de linguagem
    if (language === "SQL") baseHours = 2
    else if (finding.field_type === "validation") baseHours = 1.5
    else if (finding.field_type === "mask") baseHours = 1
    else baseHours = 0.5

    // Multiplicadores por complexidade
    let multiplier = 1.0

    // Arquivo grande = mais complexo
    const lineNumber = finding.line_number || 0
    if (lineNumber > 500) multiplier += 0.3
    if (lineNumber > 1000) multiplier += 0.5

    // Código legado (detectar comentários antigos ou padrões velhos)
    const context = (finding.context || "").toLowerCase()
    if (context.includes("legacy") || context.includes("deprecated") || context.includes("@deprecated")) {
      multiplier += 0.5
    }

    // Arquivo crítico de produção
    const filePath = (finding.file_path || "").toLowerCase()
    if (filePath.includes("prod") || filePath.includes("production") || filePath.includes("api")) {
      multiplier += 0.3
    }

    // Múltiplas ocorrências no mesmo arquivo
    if (finding.occurrence_count && finding.occurrence_count > 5) {
      multiplier += 0.2 * Math.min(finding.occurrence_count / 10, 1)
    }

    // Falta de testes (detectar se arquivo tem testes)
    const hasTests = filePath.includes("test") || filePath.includes("spec")
    if (!hasTests && (language === "Java" || language === "TypeScript" || language === "C#")) {
      multiplier += 0.4 // Precisará criar testes
    }

    // Calcula horas finais
    const estimatedHours = Math.round(baseHours * multiplier * 10) / 10

    // Mínimo 0.5h, máximo 8h por ocorrência
    return Math.max(0.5, Math.min(8, estimatedHours))
  }

  private getDependencies(language: string): string[] {
    const deps: Record<string, string[]> = {
      SQL: ["DBA approval", "Backup completo", "Janela de manutenção"],
      Java: ["Testes JUnit atualizados", "Validação Hibernate/JPA"],
      TypeScript: ["Testes Jest/Vitest", "Validação Zod/Yup"],
      JavaScript: ["Testes Jest", "Validação frontend"],
      Python: ["Testes pytest", "Validação Pydantic"],
      "C#": ["Testes xUnit/NUnit", "Validação Entity Framework"],
    }

    return deps[language] || ["Testes automatizados", "Code review"]
  }

  private hasBreakingChanges(finding: any): boolean {
    const context = (finding.context || "").toLowerCase()
    // Breaking if it's an API endpoint or database schema
    return context.includes("api") || context.includes("create table") || context.includes("alter table")
  }
}
