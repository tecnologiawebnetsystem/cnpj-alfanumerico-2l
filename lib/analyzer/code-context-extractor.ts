export class CodeContextExtractor {
  private readonly CONTEXT_LINES_BEFORE = 2
  private readonly CONTEXT_LINES_AFTER = 2

  extractContext(
    fileContent: string,
    lineNumber: number,
    cnpjFound: string
  ): {
    code_before: string[]
    code_current: string
    code_after: string[]
    code_suggested: string
    cnpj_replacement: string
    action_required: 'UPDATE' | 'NONE'
    observation: string
  } {
    const lines = fileContent.split('\n')
    const currentLine = lines[lineNumber - 1] || ''

    // Extract context lines
    const code_before: string[] = []
    for (let i = Math.max(0, lineNumber - 1 - this.CONTEXT_LINES_BEFORE); i < lineNumber - 1; i++) {
      if (lines[i] !== undefined) {
        code_before.push(lines[i])
      }
    }

    const code_after: string[] = []
    for (let i = lineNumber; i < Math.min(lines.length, lineNumber + this.CONTEXT_LINES_AFTER); i++) {
      if (lines[i] !== undefined) {
        code_after.push(lines[i])
      }
    }

    // Determine if action is required
    const shouldUpdate = this.shouldUpdateCNPJ(currentLine, cnpjFound, fileContent, lineNumber)

    // Generate suggested code
    const cnpj_replacement = this.generateAlphanumericCNPJ(cnpjFound)
    const code_suggested = shouldUpdate.shouldUpdate 
      ? currentLine.replace(cnpjFound, cnpj_replacement)
      : currentLine

    return {
      code_before,
      code_current: currentLine,
      code_after,
      code_suggested,
      cnpj_replacement,
      action_required: shouldUpdate.shouldUpdate ? 'UPDATE' : 'NONE',
      observation: shouldUpdate.reason
    }
  }

  private shouldUpdateCNPJ(
    line: string,
    cnpj: string,
    fileContent: string,
    lineNumber: number
  ): { shouldUpdate: boolean; reason: string } {
    const lineTrimmed = line.trim()

    // Check if it's a comment
    if (lineTrimmed.startsWith('//') || 
        lineTrimmed.startsWith('/*') || 
        lineTrimmed.startsWith('*') ||
        lineTrimmed.startsWith('#') ||
        lineTrimmed.startsWith('--')) {
      return {
        shouldUpdate: false,
        reason: 'CNPJ encontrado em comentário de documentação. Nenhuma alteração necessária pois não é um valor real de dados.'
      }
    }

    // Check if it's in documentation/markdown
    if (lineTrimmed.startsWith('>') || lineTrimmed.match(/^#{1,6}\s/)) {
      return {
        shouldUpdate: false,
        reason: 'CNPJ encontrado em documentação markdown. Usado apenas como exemplo didático, não requer alteração.'
      }
    }

    // Check if it's in a test file with example data
    if (line.includes('example') || line.includes('test') || line.includes('mock')) {
      return {
        shouldUpdate: false,
        reason: 'CNPJ encontrado em dados de teste/exemplo. Pode ser mantido para testes desde que não seja dado real.'
      }
    }

    // Check if it's in a constant definition for examples
    if (lineTrimmed.toUpperCase().includes('EXAMPLE') || lineTrimmed.toUpperCase().includes('SAMPLE')) {
      return {
        shouldUpdate: false,
        reason: 'CNPJ definido como constante de exemplo. Se for apenas para demonstração, não requer alteração.'
      }
    }

    // Default: needs update
    return {
      shouldUpdate: true,
      reason: 'CNPJ deve ser atualizado para formato alfanumérico de 18 caracteres conforme nova regulamentação da Receita Federal.'
    }
  }

  private generateAlphanumericCNPJ(oldCNPJ: string): string {
    // Remove formatação
    const cleaned = oldCNPJ.replace(/[^\d]/g, '')
    
    if (cleaned.length !== 14) {
      return oldCNPJ // Return original if invalid
    }

    // Generate 4 random alphanumeric characters
    const alphanumeric = this.generateRandomAlphanumeric(4)
    
    // New format: 14 digits + 4 alphanumeric = 18 characters
    return `${cleaned}${alphanumeric}`
  }

  private generateRandomAlphanumeric(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
