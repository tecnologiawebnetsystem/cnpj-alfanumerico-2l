/**
 * lib/db/index.ts
 * Pool de conexão singleton com SQL Server via mssql.
 * Todas as queries do sistema devem passar por este módulo.
 */
import sql from "mssql"

const config: sql.config = {
  server: process.env.SQLSERVER_HOST!,
  port: parseInt(process.env.SQLSERVER_PORT || "1433", 10),
  database: process.env.SQLSERVER_DATABASE!,
  user: process.env.SQLSERVER_USER!,
  password: process.env.SQLSERVER_PASSWORD!,
  options: {
    encrypt: process.env.SQLSERVER_ENCRYPT === "true",
    trustServerCertificate: process.env.SQLSERVER_TRUST_SERVER_CERTIFICATE === "true",
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 15000,
  requestTimeout: 30000,
}

// Singleton do pool
let pool: sql.ConnectionPool | null = null

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool
  }
  pool = await new sql.ConnectionPool(config).connect()
  return pool
}

/**
 * Executa uma query parametrizada e retorna todos os registros.
 * @param query  SQL com parâmetros no formato @param_name
 * @param params Objeto { nome: valor } mapeado como inputs
 */
export async function query<T = Record<string, unknown>>(
  queryText: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const p = await getPool()
  const request = p.request()
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value as sql.ISqlType | string | number | boolean | null)
  }
  const result = await request.query<T>(queryText)
  return result.recordset
}

/**
 * Executa uma query e retorna apenas o primeiro registro (ou null).
 */
export async function queryOne<T = Record<string, unknown>>(
  queryText: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  const rows = await query<T>(queryText, params)
  return rows[0] ?? null
}

/**
 * Executa uma query que não retorna registros (INSERT/UPDATE/DELETE).
 * Retorna o número de linhas afetadas.
 */
export async function execute(
  queryText: string,
  params: Record<string, unknown> = {},
): Promise<number> {
  const p = await getPool()
  const request = p.request()
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value as sql.ISqlType | string | number | boolean | null)
  }
  const result = await request.query(queryText)
  return result.rowsAffected[0] ?? 0
}

export { sql }
