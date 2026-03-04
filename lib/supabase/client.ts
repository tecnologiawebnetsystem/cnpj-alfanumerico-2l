/**
 * lib/supabase/client.ts
 * Compatibilidade para Client Components.
 *
 * No browser NÃO existe acesso direto ao banco (mssql é Node.js only).
 * Client Components devem usar fetch() para as API routes.
 * Este módulo exporta um stub vazio para não quebrar imports existentes.
 */

// Stub: Client Components não devem usar o banco diretamente.
// Use fetch("/api/...") nos Client Components.
export function createClient() {
  throw new Error(
    "createClient() não pode ser usado em Client Components. Use fetch('/api/...') para acessar dados."
  )
}
