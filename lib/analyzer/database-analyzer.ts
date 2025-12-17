import type { ExtractedFile } from "./file-extractor"

interface DatabaseFinding {
  analysis_id: string
  database_type: string
  table_name: string
  column_name: string
  column_type: string
  column_length: number | null
  is_nullable: boolean
  has_index: boolean
  suggestion: string
}

export async function analyzeDatabaseSchema(files: ExtractedFile[], analysisId: string): Promise<DatabaseFinding[]> {
  const findings: DatabaseFinding[] = []

  // Find SQL files
  const sqlFiles = files.filter((f) => f.extension === "sql")

  for (const file of sqlFiles) {
    const dbType = detectDatabaseType(file.content)
    const tables = extractTableDefinitions(file.content)

    for (const table of tables) {
      const cnpjColumns = table.columns.filter((col) => isCNPJColumn(col.name))

      for (const column of cnpjColumns) {
        findings.push({
          analysis_id: analysisId,
          database_type: dbType,
          table_name: table.name,
          column_name: column.name,
          column_type: column.type,
          column_length: column.length,
          is_nullable: column.nullable,
          has_index: column.indexed,
          suggestion: generateDatabaseSuggestion(column),
        })
      }
    }
  }

  return findings
}

function detectDatabaseType(content: string): string {
  if (content.includes("NVARCHAR") || content.includes("IDENTITY")) return "SQL Server"
  if (content.includes("VARCHAR2") || content.includes("NUMBER")) return "Oracle"
  if (content.includes("AUTO_INCREMENT")) return "MySQL"
  if (content.includes("SERIAL") || content.includes("gen_random_uuid")) return "PostgreSQL"
  return "Unknown"
}

interface TableDefinition {
  name: string
  columns: ColumnDefinition[]
}

interface ColumnDefinition {
  name: string
  type: string
  length: number | null
  nullable: boolean
  indexed: boolean
}

function extractTableDefinitions(content: string): TableDefinition[] {
  const tables: TableDefinition[] = []
  const createTableRegex = /CREATE\s+TABLE\s+(\w+)\s*$$([\s\S]*?)$$/gi

  let match
  while ((match = createTableRegex.exec(content)) !== null) {
    const tableName = match[1]
    const columnsText = match[2]

    const columns = parseColumns(columnsText)
    tables.push({ name: tableName, columns })
  }

  return tables
}

function parseColumns(columnsText: string): ColumnDefinition[] {
  const columns: ColumnDefinition[] = []
  const lines = columnsText.split(",")

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("CONSTRAINT") || trimmed.startsWith("PRIMARY") || trimmed.startsWith("FOREIGN"))
      continue

    const parts = trimmed.split(/\s+/)
    if (parts.length < 2) continue

    const name = parts[0]
    const type = parts[1]
    const lengthMatch = type.match(/$$(\d+)$$/)
    const length = lengthMatch ? Number.parseInt(lengthMatch[1]) : null
    const nullable = !trimmed.includes("NOT NULL")
    const indexed = false // Would need more complex parsing

    columns.push({ name, type, length, nullable, indexed })
  }

  return columns
}

function isCNPJColumn(columnName: string): boolean {
  const patterns = [/cnpj/i, /cpf_cnpj/i, /documento/i, /cadastro/i]
  return patterns.some((pattern) => pattern.test(columnName))
}

function generateDatabaseSuggestion(column: ColumnDefinition): string {
  const currentLength = column.length || 14

  if (currentLength < 18) {
    return `Aumentar tamanho do campo de ${currentLength} para 18 caracteres para suportar formato alfanumérico`
  }

  return "Campo já possui tamanho adequado, verificar validações e máscaras"
}
