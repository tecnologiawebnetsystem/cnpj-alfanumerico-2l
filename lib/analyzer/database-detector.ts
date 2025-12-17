export interface DatabaseFinding {
  file: string
  table: string
  column: string
  type: string
  size: number
  database: "SQL Server" | "MySQL" | "PostgreSQL" | "Oracle" | "Unknown"
  suggestion: string
}

export class DatabaseDetector {
  async analyzeFile(filePath: string, content: string): Promise<DatabaseFinding[]> {
    const findings: DatabaseFinding[] = []
    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      const createTableMatch = line.match(/CREATE\s+TABLE\s+(\w+)/i)
      if (createTableMatch) {
        const tableName = createTableMatch[1]
        const tableContent = this.extractTableDefinition(lines, i)
        const cnpjColumns = this.findCNPJColumns(tableContent)

        cnpjColumns.forEach((col) => {
          findings.push({
            file: filePath,
            table: tableName,
            column: col.name,
            type: col.type,
            size: col.size,
            database: this.detectDatabase(content),
            suggestion: this.generateDatabaseSuggestion(col, tableName),
          })
        })
      }

      const alterMatch = line.match(/ALTER\s+TABLE\s+(\w+)/i)
      if (alterMatch && /cnpj|documento/i.test(line)) {
        const tableName = alterMatch[1]
        const columnMatch = line.match(/(\w+)\s+(VARCHAR|CHAR|NVARCHAR)/i)
        if (columnMatch) {
          findings.push({
            file: filePath,
            table: tableName,
            column: columnMatch[1],
            type: columnMatch[2],
            size: 14,
            database: this.detectDatabase(content),
            suggestion: `ALTER TABLE ${tableName} ALTER COLUMN ${columnMatch[1]} VARCHAR(14) - Já suporta alfanumérico`,
          })
        }
      }
    }

    return findings
  }

  private extractTableDefinition(lines: string[], startIndex: number): string {
    let definition = ""
    let braceCount = 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]
      definition += line + "\n"

      braceCount += (line.match(/\(/g) || []).length
      braceCount -= (line.match(/\)/g) || []).length

      if (braceCount === 0 && line.includes(")")) break
    }

    return definition
  }

  private findCNPJColumns(tableDefinition: string) {
    const columns: Array<{ name: string; type: string; size: number }> = []
    const cnpjPattern = /(\w*cnpj\w*|\w*documento\w*)\s+(VARCHAR|CHAR|NVARCHAR|TEXT)\s*$$(\d+)$$/gi

    let match
    while ((match = cnpjPattern.exec(tableDefinition)) !== null) {
      columns.push({
        name: match[1],
        type: match[2],
        size: Number.parseInt(match[3]),
      })
    }

    return columns
  }

  private detectDatabase(content: string): DatabaseFinding["database"] {
    if (/NVARCHAR|IDENTITY|GETDATE/i.test(content)) return "SQL Server"
    if (/AUTO_INCREMENT|CURRENT_TIMESTAMP/i.test(content)) return "MySQL"
    if (/SERIAL|TIMESTAMP/i.test(content)) return "PostgreSQL"
    if (/NUMBER|SYSDATE|VARCHAR2/i.test(content)) return "Oracle"
    return "Unknown"
  }

  private generateDatabaseSuggestion(col: { name: string; type: string; size: number }, table: string): string {
    if (col.size < 14) {
      return `⚠️ CRÍTICO: Aumentar tamanho de ${col.size} para 14 caracteres - ALTER TABLE ${table} ALTER COLUMN ${col.name} VARCHAR(14)`
    }
    if (col.type.includes("CHAR")) {
      return `✓ Campo já suporta alfanumérico (${col.type}(${col.size})) - Apenas validar constraints`
    }
    return `Verificar se campo ${col.name} aceita letras maiúsculas (A-Z) além de números`
  }
}
