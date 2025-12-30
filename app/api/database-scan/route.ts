import { createClient } from "@/lib/supabase/server"
import { DatabaseScanner } from "@/lib/database/scanner"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { connection_string, database_type, schemas } = body

    if (!connection_string || !database_type) {
      return Response.json({ error: "connection_string e database_type são obrigatórios" }, { status: 400 })
    }

    // Start scan
    const scanner = new DatabaseScanner(connection_string, database_type)
    const results = await scanner.scanForCNPJs(schemas || [])

    // Save results
    const { data: scan, error } = await supabase
      .from("database_scans")
      .insert({
        user_id: user.id,
        database_type,
        connection_string_hash: hashConnectionString(connection_string),
        schemas_scanned: schemas || [],
        findings_count: results.findings.length,
        status: "completed",
        results,
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ scan, findings: results.findings })
  } catch (error: any) {
    console.error("Database scan error:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function hashConnectionString(connStr: string): string {
  // Remove sensitive data before hashing
  const sanitized = connStr.replace(/(Password|PWD)=([^;]+)/gi, "Password=***")
  return Buffer.from(sanitized).toString("base64").slice(0, 64)
}
