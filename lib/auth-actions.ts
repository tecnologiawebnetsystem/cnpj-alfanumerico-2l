"use server"

import bcrypt from "bcryptjs"
import { db } from "@/lib/db/sqlserver"
import { queryOne } from "@/lib/db/index"
import { cookies } from "next/headers"

/**
 * Hash de senha com bcrypt (salt 10).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Compara senha em texto plano com hash bcrypt.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Obtém o usuário autenticado no server-side a partir do cookie user_email.
 * Usa uma única query com LEFT JOIN em clients para evitar round-trip extra.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value

    if (!userEmail) return null

    const row = await queryOne<Record<string, unknown>>(
      `SELECT u.id, u.email, u.name, u.role, u.client_id,
              c.name AS client_name
       FROM   users u
       LEFT JOIN clients c ON c.id = u.client_id
       WHERE  u.email = @email`,
      { email: userEmail },
    )

    if (!row) return null

    return {
      id:          row.id          as string,
      email:       row.email       as string,
      name:        row.name        as string,
      role:        row.role        as string,
      client_id:   row.client_id   as string | null,
      client_name: row.client_name as string | null,
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}
