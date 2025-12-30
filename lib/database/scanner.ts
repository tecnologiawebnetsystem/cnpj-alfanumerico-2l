import sql from "mssql"
import oracledb from "oracledb"

export type DatabaseType = "sqlserver" | "oracle"

export interface CNPJFinding {
  schema: string
  table: string
  column: string
  value: string
  row_identifier: string
  is_valid_cnpj: boolean
  needs_migration: boolean
}

export class DatabaseScanner {
  constructor(
    private connectionString: string,
    private databaseType: DatabaseType,
  ) {}

  async scanForCNPJs(schemas: string[] = []): Promise<{ findings: CNPJFinding[]; summary: any }> {
    if (this.databaseType === "sqlserver") {
      return this.scanSQLServer(schemas)
    } else {
      return this.scanOracle(schemas)
    }
  }

  private async scanSQLServer(schemas: string[]): Promise<{ findings: CNPJFinding[]; summary: any }> {
    const findings: CNPJFinding[] = []
    let connection: sql.ConnectionPool | null = null

    try {
      connection = await sql.connect(this.connectionString)

      // Get all tables and columns
      const schemaFilter = schemas.length > 0 ? `AND TABLE_SCHEMA IN (${schemas.map((s) => `'${s}'`).join(",")})` : ""

      const tablesResult = await connection.query(`
        SELECT 
          TABLE_SCHEMA,
          TABLE_NAME,
          COLUMN_NAME,
          DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE DATA_TYPE IN ('varchar', 'char', 'nvarchar', 'nchar', 'text', 'ntext')
          AND CHARACTER_MAXIMUM_LENGTH >= 11
          ${schemaFilter}
        ORDER BY TABLE_SCHEMA, TABLE_NAME
      `)

      // Scan each column for CNPJ patterns
      for (const row of tablesResult.recordset) {
        const { TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME } = row

        // Search for CNPJ patterns (14 digits with or without formatting)
        const query = `
          SELECT TOP 1000
            [${COLUMN_NAME}] as value,
            CAST(NEWID() AS VARCHAR(36)) as row_id
          FROM [${TABLE_SCHEMA}].[${TABLE_NAME}]
          WHERE [${COLUMN_NAME}] LIKE '%[0-9][0-9].[0-9][0-9][0-9].[0-9][0-9][0-9]/[0-9][0-9][0-9][0-9]-[0-9][0-9]%'
             OR [${COLUMN_NAME}] LIKE '%[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]%'
        `

        try {
          const dataResult = await connection.query(query)

          for (const dataRow of dataResult.recordset) {
            const cnpjValue = dataRow.value
            if (cnpjValue && this.looksLikeCNPJ(cnpjValue)) {
              findings.push({
                schema: TABLE_SCHEMA,
                table: TABLE_NAME,
                column: COLUMN_NAME,
                value: cnpjValue,
                row_identifier: dataRow.row_id,
                is_valid_cnpj: this.validateCNPJ(cnpjValue),
                needs_migration: this.needsMigration(cnpjValue),
              })
            }
          }
        } catch (err) {
          console.error(`Error scanning ${TABLE_SCHEMA}.${TABLE_NAME}.${COLUMN_NAME}:`, err)
        }
      }

      return {
        findings,
        summary: {
          total_findings: findings.length,
          tables_with_cnpj: new Set(findings.map((f) => `${f.schema}.${f.table}`)).size,
          valid_cnpjs: findings.filter((f) => f.is_valid_cnpj).length,
          needs_migration: findings.filter((f) => f.needs_migration).length,
        },
      }
    } finally {
      if (connection) await connection.close()
    }
  }

  private async scanOracle(schemas: string[]): Promise<{ findings: CNPJFinding[]; summary: any }> {
    const findings: CNPJFinding[] = []
    let connection: oracledb.Connection | null = null

    try {
      connection = await oracledb.getConnection(this.connectionString)

      // Get all tables and columns
      const schemaFilter =
        schemas.length > 0 ? `AND OWNER IN (${schemas.map((s) => `'${s.toUpperCase()}'`).join(",")})` : ""

      const tablesResult = await connection.execute(`
        SELECT 
          OWNER,
          TABLE_NAME,
          COLUMN_NAME,
          DATA_TYPE,
          DATA_LENGTH
        FROM ALL_TAB_COLUMNS
        WHERE DATA_TYPE IN ('VARCHAR2', 'CHAR', 'CLOB')
          AND DATA_LENGTH >= 11
          ${schemaFilter}
        ORDER BY OWNER, TABLE_NAME
      `)

      // Scan each column for CNPJ patterns
      for (const row of tablesResult.rows || []) {
        const [OWNER, TABLE_NAME, COLUMN_NAME] = row as string[]

        const query = `
          SELECT 
            "${COLUMN_NAME}" as value,
            ROWID as row_id
          FROM "${OWNER}"."${TABLE_NAME}"
          WHERE REGEXP_LIKE("${COLUMN_NAME}", '[0-9]{2}\.[0-9]{3}\.[0-9]{3}/[0-9]{4}-[0-9]{2}')
             OR REGEXP_LIKE("${COLUMN_NAME}", '[0-9]{14}')
          AND ROWNUM <= 1000
        `

        try {
          const dataResult = await connection.execute(query)

          for (const dataRow of dataResult.rows || []) {
            const [cnpjValue, rowId] = dataRow as [string, string]
            if (cnpjValue && this.looksLikeCNPJ(cnpjValue)) {
              findings.push({
                schema: OWNER,
                table: TABLE_NAME,
                column: COLUMN_NAME,
                value: cnpjValue,
                row_identifier: rowId,
                is_valid_cnpj: this.validateCNPJ(cnpjValue),
                needs_migration: this.needsMigration(cnpjValue),
              })
            }
          }
        } catch (err) {
          console.error(`Error scanning ${OWNER}.${TABLE_NAME}.${COLUMN_NAME}:`, err)
        }
      }

      return {
        findings,
        summary: {
          total_findings: findings.length,
          tables_with_cnpj: new Set(findings.map((f) => `${f.schema}.${f.table}`)).size,
          valid_cnpjs: findings.filter((f) => f.is_valid_cnpj).length,
          needs_migration: findings.filter((f) => f.needs_migration).length,
        },
      }
    } finally {
      if (connection) await connection.close()
    }
  }

  private looksLikeCNPJ(value: string): boolean {
    // Check if value matches CNPJ pattern
    const digits = value.replace(/\D/g, "")
    return digits.length === 14
  }

  private validateCNPJ(cnpj: string): boolean {
    const digits = cnpj.replace(/\D/g, "")
    if (digits.length !== 14) return false

    // Check if all digits are the same
    if (/^(\d)\1+$/.test(digits)) return false

    // Validate check digits
    let size = digits.length - 2
    let numbers = digits.substring(0, size)
    const digitsCheck = digits.substring(size)
    let sum = 0
    let pos = size - 7

    for (let i = size; i >= 1; i--) {
      sum += Number.parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== Number.parseInt(digitsCheck.charAt(0))) return false

    size = size + 1
    numbers = digits.substring(0, size)
    sum = 0
    pos = size - 7

    for (let i = size; i >= 1; i--) {
      sum += Number.parseInt(numbers.charAt(size - i)) * pos--
      if (pos < 2) pos = 9
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    return result === Number.parseInt(digitsCheck.charAt(1))
  }

  private needsMigration(cnpj: string): boolean {
    // Check if CNPJ is numeric only (needs to be migrated to alphanumeric)
    const digits = cnpj.replace(/\D/g, "")
    return /^\d+$/.test(digits)
  }
}
