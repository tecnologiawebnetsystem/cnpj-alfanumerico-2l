import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, logApiUsage } from "@/lib/api-auth"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now()
  const { id } = await params

  try {
    // Get API key from header
    const apiKey = request.headers.get("x-api-key")

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    // Validate API key
    const { valid, client, keyData, error } = await validateApiKey(apiKey)

    if (!valid || !client || !keyData) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: async () => (await cookies()).getAll(),
          setAll: async (cookiesToSet) => {
            const cookieStore = await cookies()
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      },
    )

    // Get analysis
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("client_id", client.id)
      .single()

    if (analysisError || !analysis) {
      await logApiUsage(client.id, keyData.id, `/api/v1/analyze/${id}`, "GET", 404, Date.now() - startTime, request)
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    // Get findings if analysis is completed
    let findings = []
    let databaseFindings = []

    if (analysis.status === "completed") {
      const { data: findingsData } = await supabase.from("findings").select("*").eq("analysis_id", id)

      const { data: dbFindingsData } = await supabase.from("database_findings").select("*").eq("analysis_id", id)

      findings = findingsData || []
      databaseFindings = dbFindingsData || []
    }

    await logApiUsage(client.id, keyData.id, `/api/v1/analyze/${id}`, "GET", 200, Date.now() - startTime, request)

    return NextResponse.json({
      analysis,
      findings,
      database_findings: databaseFindings,
      summary: {
        total_files: analysis.total_files,
        files_analyzed: analysis.files_analyzed,
        cnpj_occurrences: findings.length,
        database_fields: databaseFindings.length,
        estimated_hours: analysis.estimated_hours,
      },
    })
  } catch (error) {
    console.error(" Error fetching analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
