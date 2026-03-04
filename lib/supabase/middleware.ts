/**
 * lib/supabase/middleware.ts
 * Compatibilidade: o middleware agora usa cookies próprios (não Supabase Auth).
 * Apenas passa a requisição adiante — autenticação é validada via cookie user_email.
 */
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request })
}
