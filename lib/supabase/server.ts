/**
 * lib/supabase/server.ts
 * Compatibilidade: exporta createClient e createServiceClient apontando para SQL Server.
 */
import { db } from "@/lib/db/sqlserver"

/** Compatível com: const supabase = await createServerClient() */
export async function createClient() {
  return db
}

/** Compatível com: const supabase = await createServiceClient() */
export async function createServiceClient() {
  return db
}

// Alias histórico usado em alguns arquivos
export { createClient as createServerClient }
