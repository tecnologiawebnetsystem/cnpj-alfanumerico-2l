/**
 * lib/db/index.ts
 * Pool singleton SQL Server com inicialização segura contra race condition.
 * Pool ampliado para até 20 conexões com acquire timeout.
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
    // Retorna datas como Date objects em vez de string
    useUTC: true,
  },
  pool: {
    max: 20,          // aumentado de 10 → 20
    min: 2,           // manter conexões pre-aquecidas
    idleTimeoutMillis: 60_000,
    acquireTimeoutMillis: 10_000, // falha rápida se o pool estiver esgotado
  },
  connectionTimeout: 15_000,
  requestTimeout: 30_000,
}

// Singleton com guard contra race condition
let pool: sql.ConnectionPool | null = null
let poolPromise: Promise<sql.ConnectionPool> | null = null

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool?.connected) return pool

  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((p) => {
        pool = p
        poolPromise = null
        return p
      })
      .catch((err) => {
        poolPromise = null
        throw err
      })
  }

  return poolPromise
}

/**
 * Executa uma query parametrizada e retorna todos os registros.
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
 * Executa INSERT/UPDATE/DELETE. Retorna linhas afetadas.
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

/**
 * Executa múltiplas queries em paralelo num único getPool().
 * Usar quando há queries independentes dentro de uma rota.
 */
export async function queryParallel<T extends Record<string, Promise<unknown>>>(
  queries: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const keys = Object.keys(queries) as (keyof T)[]
  const values = await Promise.all(keys.map((k) => queries[k]))
  return Object.fromEntries(keys.map((k, i) => [k, values[i]])) as { [K in keyof T]: Awaited<T[K]> }
}

export { sql }
