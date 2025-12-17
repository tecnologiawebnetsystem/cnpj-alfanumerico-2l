export interface EstimationFactors {
  codeFindings: number
  databaseFindings: number
  languages: string[]
  hasTests: boolean
  hasCI: boolean
  teamSize: number
  complexity: {
    low: number
    medium: number
    high: number
  }
}

export interface EstimationResult {
  totalHours: number
  breakdown: {
    analysis: number
    development: number
    testing: number
    deployment: number
    documentation: number
  }
  timeline: {
    phase: string
    duration: string
    tasks: string[]
  }[]
  risks: {
    level: "low" | "medium" | "high"
    description: string
    mitigation: string
  }[]
  recommendations: string[]
}

export class SmartEstimator {
  estimate(factors: EstimationFactors): EstimationResult {
    const baseHours = this.calculateBaseHours(factors)
    const multipliers = this.calculateMultipliers(factors)
    const totalDevelopment = baseHours * multipliers.total

    const breakdown = {
      analysis: totalDevelopment * 0.15,
      development: totalDevelopment * 0.45,
      testing: totalDevelopment * 0.25,
      deployment: totalDevelopment * 0.1,
      documentation: totalDevelopment * 0.05,
    }

    const totalHours = Object.values(breakdown).reduce((sum, hours) => sum + hours, 0)

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      breakdown,
      timeline: this.generateTimeline(breakdown, factors.teamSize),
      risks: this.identifyRisks(factors),
      recommendations: this.generateRecommendations(factors),
    }
  }

  private calculateBaseHours(factors: EstimationFactors): number {
    let hours = 0

    hours += factors.complexity.low * 0.5
    hours += factors.complexity.medium * 2
    hours += factors.complexity.high * 4

    hours += factors.databaseFindings * 1.5

    return hours
  }

  private calculateMultipliers(factors: EstimationFactors): {
    language: number
    testing: number
    ci: number
    team: number
    total: number
  } {
    let languageMultiplier = 1.0
    if (factors.languages.length > 3) languageMultiplier = 1.3
    else if (factors.languages.length > 1) languageMultiplier = 1.15

    const testingMultiplier = factors.hasTests ? 1.2 : 1.0
    const ciMultiplier = factors.hasCI ? 0.9 : 1.0
    const teamMultiplier = factors.teamSize >= 3 ? 0.85 : 1.0

    return {
      language: languageMultiplier,
      testing: testingMultiplier,
      ci: ciMultiplier,
      team: teamMultiplier,
      total: languageMultiplier * testingMultiplier * ciMultiplier * teamMultiplier,
    }
  }

  private generateTimeline(breakdown: EstimationResult["breakdown"], teamSize: number): EstimationResult["timeline"] {
    const hoursPerDay = 6
    const daysPerWeek = 5

    const calculateDuration = (hours: number): string => {
      const days = Math.ceil(hours / (hoursPerDay * teamSize))
      const weeks = Math.ceil(days / daysPerWeek)
      return weeks === 1 ? `${days} dias` : `${weeks} semanas`
    }

    return [
      {
        phase: "Fase 1: Análise e Planejamento",
        duration: calculateDuration(breakdown.analysis),
        tasks: [
          "Revisar relatório de análise automática",
          "Identificar dependências críticas",
          "Definir estratégia de migração",
          "Criar plano de testes",
        ],
      },
      {
        phase: "Fase 2: Desenvolvimento",
        duration: calculateDuration(breakdown.development),
        tasks: [
          "Atualizar validações de CNPJ",
          "Modificar campos de banco de dados",
          "Ajustar máscaras e formatações",
          "Atualizar integrações de API",
        ],
      },
      {
        phase: "Fase 3: Testes",
        duration: calculateDuration(breakdown.testing),
        tasks: ["Testes unitários", "Testes de integração", "Testes de regressão", "Validação com dados reais"],
      },
      {
        phase: "Fase 4: Deploy e Monitoramento",
        duration: calculateDuration(breakdown.deployment),
        tasks: [
          "Deploy em ambiente de homologação",
          "Validação com stakeholders",
          "Deploy em produção",
          "Monitoramento pós-deploy",
        ],
      },
    ]
  }

  private identifyRisks(factors: EstimationFactors): EstimationResult["risks"] {
    const risks: EstimationResult["risks"] = []

    if (factors.complexity.high > 10) {
      risks.push({
        level: "high",
        description: "Alto número de alterações complexas identificadas",
        mitigation: "Priorizar refatoração e revisão de código por pares",
      })
    }

    if (factors.languages.length > 3) {
      risks.push({
        level: "medium",
        description: "Múltiplas linguagens de programação no projeto",
        mitigation: "Alocar desenvolvedores especializados em cada linguagem",
      })
    }

    if (!factors.hasTests) {
      risks.push({
        level: "high",
        description: "Projeto sem cobertura de testes automatizados",
        mitigation: "Criar testes antes de iniciar alterações",
      })
    }

    if (factors.databaseFindings > 20) {
      risks.push({
        level: "medium",
        description: "Grande quantidade de alterações em banco de dados",
        mitigation: "Planejar janela de manutenção e backup completo",
      })
    }

    if (factors.teamSize < 2) {
      risks.push({
        level: "medium",
        description: "Equipe pequena para volume de trabalho",
        mitigation: "Considerar contratar suporte adicional ou estender prazo",
      })
    }

    return risks
  }

  private generateRecommendations(factors: EstimationFactors): string[] {
    const recommendations: string[] = []

    recommendations.push("Criar branch dedicada para migração CNPJ alfanumérico")
    recommendations.push("Implementar feature flag para ativar/desativar novo formato")

    if (!factors.hasTests) {
      recommendations.push("Criar suite de testes automatizados antes de iniciar alterações")
    }

    if (factors.databaseFindings > 0) {
      recommendations.push("Executar migration de banco em horário de baixo tráfego")
      recommendations.push("Manter backup completo antes de alterações em produção")
    }

    if (factors.complexity.high > 5) {
      recommendations.push("Realizar code review detalhado para alterações complexas")
      recommendations.push("Considerar pair programming para trechos críticos")
    }

    recommendations.push("Monitorar logs e métricas por 48h após deploy")
    recommendations.push("Preparar plano de rollback em caso de problemas")

    if (factors.languages.includes("Java") || factors.languages.includes("C#")) {
      recommendations.push("Atualizar bibliotecas de validação para suportar alfanumérico")
    }

    return recommendations
  }
}
