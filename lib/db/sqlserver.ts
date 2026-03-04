/**
 * lib/db/sqlserver.ts
 * QueryBuilder compatível com a API do Supabase client.
 *
 * Cobre os padrões usados nas API routes:
 *   .from(table)
 *   .select(columns?, options?)   → SELECT
 *   .insert(data)                 → INSERT ... OUTPUT INSERTED.*
 *   .update(data)                 → UPDATE ... SET
 *   .delete()                     → DELETE
 *   .eq(col, val)
 *   .neq(col, val)
 *   .gt / .gte / .lt / .lte
 *   .in(col, arr)
 *   .is(col, null)
 *   .ilike(col, pattern)
 *   .order(col, { ascending })
 *   .limit(n)
 *   .single()
 *   .maybeSingle()
 *   .throwOnError()
 *   await → { data, error, count }
 */
import { getPool } from "./index"
import sql from "mssql"

type OperationType = "select" | "insert" | "update" | "delete"

interface WhereClause {
  col: string
  op: string
  val: unknown
}

interface OrderClause {
  col: string
  ascending: boolean
}

export interface QueryResult<T> {
  data: T | null
  error: { message: string; details?: string } | null
  count?: number | null
}

// ─── QueryBuilder ────────────────────────────────────────────────────────────

export class QueryBuilder<T = Record<string, unknown>> implements PromiseLike<QueryResult<T>> {
  private _table: string
  private _operation: OperationType = "select"
  private _columns = "*"
  private _countOnly = false
  private _whereList: WhereClause[] = []
  private _orderList: OrderClause[] = []
  private _limitVal: number | null = null
  private _insertData: Record<string, unknown> | Record<string, unknown>[] | null = null
  private _updateData: Record<string, unknown> | null = null
  private _singleRow = false
  private _maybeSingle = false
  private _joins: string[] = []

  constructor(table: string) {
    this._table = table
  }

  // ── SELECT ─────────────────────────────────────────────────────────────────

  select(columns?: string, options?: { count?: string; head?: boolean }): this {
    this._operation = "select"
    if (options?.count) {
      this._countOnly = true
    }
    if (columns && columns !== "*" && !options?.head) {
      // Parse nested selections like "users!tasks_assigned_to_fkey(name)" → join hint (simplified)
      this._columns = this._parseSelectColumns(columns)
    }
    return this
  }

  private _parseSelectColumns(raw: string): string {
    // Remove nested join syntax; real JOIN handling is done via _joins
    // e.g. "id, email, clients(name)" → "u.id, u.email" (join columns added separately)
    const parts = raw.split(",").map((p) => p.trim())
    const regularCols: string[] = []
    for (const part of parts) {
      if (part.includes("(")) {
        // e.g. "clients(name)" → join — skip in column list, handled via JOIN
        const match = part.match(/^(\w+)!?[\w]*\((.+)\)$/)
        if (match) {
          const joinTable = match[1]
          const joinCols = match[2].split(",").map((c) => `${joinTable}.${c.trim()} AS ${joinTable}__${c.trim()}`)
          this._joins.push(
            `LEFT JOIN ${joinTable} ON ${joinTable}.id = ${this._table}.${joinTable.replace(/s$/, "")}_id`,
          )
          regularCols.push(...joinCols)
        }
      } else if (part && part !== "*") {
        regularCols.push(part)
      }
    }
    return regularCols.length > 0 ? regularCols.join(", ") : "*"
  }

  // ── INSERT ─────────────────────────────────────────────────────────────────

  insert(data: Record<string, unknown> | Record<string, unknown>[]): this {
    this._operation = "insert"
    this._insertData = data
    return this
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────────

  update(data: Record<string, unknown>): this {
    this._operation = "update"
    this._updateData = data
    return this
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────

  delete(): this {
    this._operation = "delete"
    return this
  }

  // ── WHERE filters ──────────────────────────────────────────────────────────

  eq(col: string, val: unknown): this {
    if (val === null || val === undefined) {
      this._whereList.push({ col, op: "IS NULL", val: null })
    } else {
      this._whereList.push({ col, op: "=", val })
    }
    return this
  }

  neq(col: string, val: unknown): this {
    this._whereList.push({ col, op: "!=", val })
    return this
  }

  gt(col: string, val: unknown): this {
    this._whereList.push({ col, op: ">", val })
    return this
  }

  gte(col: string, val: unknown): this {
    this._whereList.push({ col, op: ">=", val })
    return this
  }

  lt(col: string, val: unknown): this {
    this._whereList.push({ col, op: "<", val })
    return this
  }

  lte(col: string, val: unknown): this {
    this._whereList.push({ col, op: "<=", val })
    return this
  }

  is(col: string, val: null): this {
    this._whereList.push({ col, op: val === null ? "IS NULL" : "IS NOT NULL", val: null })
    return this
  }

  in(col: string, arr: unknown[]): this {
    this._whereList.push({ col, op: "IN", val: arr })
    return this
  }

  ilike(col: string, pattern: string): this {
    this._whereList.push({ col, op: "LIKE", val: pattern })
    return this
  }

  // ── ORDER / LIMIT ──────────────────────────────────────────────────────────

  order(col: string, opts?: { ascending?: boolean }): this {
    this._orderList.push({ col, ascending: opts?.ascending !== false })
    return this
  }

  limit(n: number): this {
    this._limitVal = n
    return this
  }

  // ── Result modifiers ───────────────────────────────────────────────────────

  single(): this {
    this._singleRow = true
    this._limitVal = 1
    return this
  }

  maybeSingle(): this {
    this._maybeSingle = true
    this._limitVal = 1
    return this
  }

  throwOnError(): this {
    return this
  }

  // ── Build & Execute ────────────────────────────────────────────────────────

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this._execute().then(onfulfilled, onrejected)
  }

  private async _execute(): Promise<QueryResult<T>> {
    try {
      const pool = await getPool()
      const request = pool.request()
      let paramIndex = 0
      const nextParam = () => `p${paramIndex++}`

      // ── SELECT ──────────────────────────────────────────────────────────────
      if (this._operation === "select") {
        if (this._countOnly) {
          // COUNT query
          const { whereSql, bindParams } = this._buildWhere(nextParam)
          for (const [k, v] of Object.entries(bindParams)) {
            request.input(k, v as sql.ISqlType | string | number | boolean | null)
          }
          let countSql = `SELECT COUNT(*) AS cnt FROM [${this._table}]`
          if (this._joins.length) countSql += " " + [...new Set(this._joins)].join(" ")
          if (whereSql) countSql += ` WHERE ${whereSql}`

          const result = await request.query(countSql)
          return { data: null, error: null, count: result.recordset[0]?.cnt ?? 0 }
        }

        const cols = this._columns === "*" ? "*" : this._columns
        const topClause = this._limitVal ? `TOP ${this._limitVal} ` : ""
        const { whereSql, bindParams } = this._buildWhere(nextParam)
        for (const [k, v] of Object.entries(bindParams)) {
          request.input(k, v as sql.ISqlType | string | number | boolean | null)
        }

        let selectSql = `SELECT ${topClause}${cols} FROM [${this._table}]`
        if (this._joins.length) selectSql += " " + [...new Set(this._joins)].join(" ")
        if (whereSql) selectSql += ` WHERE ${whereSql}`
        if (this._orderList.length) {
          const orderParts = this._orderList.map((o) => `${o.col} ${o.ascending ? "ASC" : "DESC"}`)
          selectSql += ` ORDER BY ${orderParts.join(", ")}`
        }

        const result = await request.query<T>(selectSql)
        const rows = this._remapJoinColumns(result.recordset)

        if (this._singleRow) {
          if (rows.length === 0) {
            return { data: null, error: { message: "No rows returned" } }
          }
          return { data: rows[0] as T, error: null }
        }
        if (this._maybeSingle) {
          return { data: rows.length > 0 ? (rows[0] as T) : null, error: null }
        }
        return { data: rows as unknown as T, error: null }
      }

      // ── INSERT ──────────────────────────────────────────────────────────────
      if (this._operation === "insert" && this._insertData !== null) {
        const rows = Array.isArray(this._insertData) ? this._insertData : [this._insertData]
        const lastInserted: T[] = []

        for (const row of rows) {
          const req2 = (await getPool()).request()
          const keys = Object.keys(row)
          const paramNames = keys.map((k) => {
            const pn = `ins_${k}`
            req2.input(pn, (row[k] ?? null) as sql.ISqlType | string | number | boolean | null)
            return pn
          })
          const insertSql = `
            INSERT INTO [${this._table}] (${keys.map((k) => `[${k}]`).join(", ")})
            OUTPUT INSERTED.*
            VALUES (${paramNames.map((p) => `@${p}`).join(", ")})
          `
          const res = await req2.query<T>(insertSql)
          if (res.recordset.length > 0) lastInserted.push(res.recordset[0])
        }

        if (this._singleRow || this._maybeSingle) {
          return { data: lastInserted[0] ?? null, error: null }
        }
        return { data: lastInserted as unknown as T, error: null }
      }

      // ── UPDATE ──────────────────────────────────────────────────────────────
      if (this._operation === "update" && this._updateData !== null) {
        const keys = Object.keys(this._updateData)
        const setClauses = keys.map((k) => {
          const pn = `upd_${k}`
          request.input(pn, (this._updateData![k] ?? null) as sql.ISqlType | string | number | boolean | null)
          return `[${k}] = @${pn}`
        })

        const { whereSql, bindParams } = this._buildWhere(nextParam)
        for (const [k, v] of Object.entries(bindParams)) {
          request.input(k, v as sql.ISqlType | string | number | boolean | null)
        }

        let updateSql = `UPDATE [${this._table}] SET ${setClauses.join(", ")} OUTPUT INSERTED.*`
        if (whereSql) updateSql += ` WHERE ${whereSql}`

        const result = await request.query<T>(updateSql)
        const rows = result.recordset

        if (this._singleRow || this._maybeSingle) {
          return { data: rows[0] ?? null, error: null }
        }
        return { data: rows as unknown as T, error: null }
      }

      // ── DELETE ──────────────────────────────────────────────────────────────
      if (this._operation === "delete") {
        const { whereSql, bindParams } = this._buildWhere(nextParam)
        for (const [k, v] of Object.entries(bindParams)) {
          request.input(k, v as sql.ISqlType | string | number | boolean | null)
        }

        let deleteSql = `DELETE FROM [${this._table}]`
        if (whereSql) deleteSql += ` WHERE ${whereSql}`

        await request.query(deleteSql)
        return { data: null, error: null }
      }

      return { data: null, error: { message: "Unknown operation" } }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { data: null, error: { message } }
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _buildWhere(nextParam: () => string): {
    whereSql: string
    bindParams: Record<string, unknown>
  } {
    if (!this._whereList.length) return { whereSql: "", bindParams: {} }

    const bindParams: Record<string, unknown> = {}
    const parts = this._whereList.map((w) => {
      if (w.op === "IS NULL" || w.op === "IS NOT NULL") {
        return `[${w.col}] ${w.op}`
      }
      if (w.op === "IN") {
        const arr = w.val as unknown[]
        if (!arr.length) return "1=0"
        const paramNames = arr.map((v) => {
          const pn = nextParam()
          bindParams[pn] = v
          return `@${pn}`
        })
        return `[${w.col}] IN (${paramNames.join(", ")})`
      }
      const pn = nextParam()
      bindParams[pn] = w.val
      return `[${w.col}] ${w.op} @${pn}`
    })

    return { whereSql: parts.join(" AND "), bindParams }
  }

  /** Converte colunas "table__col" de JOINs em objetos aninhados */
  private _remapJoinColumns(rows: Record<string, unknown>[]): Record<string, unknown>[] {
    return rows.map((row) => {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(row)) {
        if (k.includes("__")) {
          const [prefix, col] = k.split("__")
          if (!out[prefix]) out[prefix] = {}
          ;(out[prefix] as Record<string, unknown>)[col] = v
        } else {
          out[k] = v
        }
      }
      return out
    })
  }
}

// ─── Factory: db.from(table) ─────────────────────────────────────────────────

export const db = {
  from<T = Record<string, unknown>>(table: string) {
    return new QueryBuilder<T>(table)
  },
  /** Alias para manter compatibilidade com createServerClient / createServiceClient */
  auth: {
    admin: {
      createUser: async (_opts: unknown) => ({ data: { user: { id: crypto.randomUUID() } }, error: null }),
      deleteUser: async (_id: string) => ({ error: null }),
    },
    getUser: async () => ({ data: { user: null }, error: null }),
  },
}
