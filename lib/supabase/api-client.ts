import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * SOLUÇÃO DEFINITIVA: Cliente Supabase para API Routes SEM cookies
 * Usa apenas o token JWT do header Authorization
 * NÃO usa await cookies() que trava na Vercel
 */
export function createSupabaseApiClient(request?: NextRequest) {
  console.log(" 🔧 Creating API client WITHOUT cookies (Vercel fix)")

  // Tenta pegar o token do header Authorization
  const authHeader = request?.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  console.log(" Token from header:", token ? "✅ Found" : "❌ Not found")

  // Cria cliente básico sem cookies
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  })

  return client
}

/**
 * Cliente Supabase SIMPLES para service operations
 * Usa service role key - SEM autenticação de usuário
 */
export function createSupabaseServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    console.error(" ❌ SUPABASE_SERVICE_ROLE_KEY not found!")
    throw new Error("Service role key not configured")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
