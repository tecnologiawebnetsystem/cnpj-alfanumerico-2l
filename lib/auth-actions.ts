"use server"

import bcrypt from "bcryptjs"
import { db } from "@/lib/db/sqlserver"
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
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value

    if (!userEmail) {
      return null
    }

    const { data: user, error } = await db
      .from("users")
      .select("id, email, name, role, client_id")
      .eq("email", userEmail)
      .single()

    if (error || !user) {
      return null
    }

    const u = user as Record<string, unknown>

    // Buscar nome do cliente se existir
    let clientName: string | null = null
    if (u.client_id) {
      const { data: client } = await db
        .from("clients")
        .select("name")
        .eq("id", u.client_id as string)
        .single()
      if (client) {
        clientName = (client as Record<string, unknown>).name as string
      }
    }

    return {
      id: u.id as string,
      email: u.email as string,
      name: u.name as string,
      role: u.role as string,
      client_id: u.client_id as string | null,
      client_name: clientName,
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}
