/**
 * lib/supabase.ts
 * Re-export de compatibilidade — aponta para SQL Server.
 */
export { createClient } from "@/lib/supabase/client"
export { db as getSupabaseClient } from "@/lib/db/sqlserver"
