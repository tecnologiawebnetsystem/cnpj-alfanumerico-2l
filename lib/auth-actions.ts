"use server"

import bcrypt from "bcryptjs"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

/**
 * Server Action para hash de senha
 * Deve ser usado apenas no server-side
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Server Action para comparar senha com hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Obter usuário atual no server-side (para APIs e Server Components)
 * Mudamos para buscar o email do cookie ao invés de usar Supabase Auth
 */
export async function getCurrentUser() {
  try {
    console.log(" getCurrentUser - Start")

    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value

    console.log(" User email from cookie:", userEmail)

    if (!userEmail) {
      console.log(" No user email in cookie")
      return null
    }

    const supabase = await createServerClient()

    // Buscar dados do usuário no banco
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        name,
        role,
        client_id,
        clients(name)
      `)
      .eq("email", userEmail)
      .single()

    if (userError || !user) {
      console.error(" Error fetching user:", userError)
      return null
    }

    console.log(" User found:", { email: user.email, role: user.role })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      client_id: user.client_id,
      client_name: user.clients?.name || null,
    }
  } catch (error) {
    console.error(" Error in getCurrentUser:", error)
    return null
  }
}
