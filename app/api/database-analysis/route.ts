import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createConnection } from "@/lib/database/connection-manager"
import { scanDatabaseForCNPJ } from "@/lib/database/cnpj-scanner"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).single()

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const body = await request.json()
    const { database_type, connection_string, database_name, schema_name } = body

    // Create database analysis record
    const { data: analysis, error } = await supabase
      .from("database_analyses")
      .insert({
        client_id: client.id,
        database_type,
        connection_string, // TODO: Encrypt this
        database_name,
        schema_name,
        status: "running",
        started_at: new Date().toISOString(),
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Start async scan
    scanDatabaseAsync(analysis.id, database_type, connection_string, database_name, schema_name).catch(console.error)

    return NextResponse.json({ analysis_id: analysis.id })
  } catch (error: any) {
    console.error("Error starting database analysis:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function scanDatabaseAsync(
  analysisId: string,
  dbType: string,
  connectionString: string,
  dbName: string,
  schemaName?: string,
) {
  const supabase = await createServerClient()

  try {
    const connection = await createConnection(dbType, connectionString)
    const results = await scanDatabaseForCNPJ(connection, dbName, schemaName)

    await supabase
      .from("database_analyses")
      .update({
        status: "completed",
        total_tables_scanned: results.total_tables,
        total_cnpj_found: results.total_cnpj,
        findings: results.findings,
        completed_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
  } catch (error: any) {
    await supabase
      .from("database_analyses")
      .update({
        status: "failed",
        error_message: error.message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
  }
}
