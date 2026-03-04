/**
 * lib/supabase/client.ts
 * Compatibilidade: exporta createClient apontando para SQL Server via API.
 * No browser, todas as mutações são feitas via fetch para as API routes.
 * Este arquivo é importado em Client Components apenas para ler estado local.
 */
import { db } from "@/lib/db/sqlserver"

export function createClient() {
  return db
}
