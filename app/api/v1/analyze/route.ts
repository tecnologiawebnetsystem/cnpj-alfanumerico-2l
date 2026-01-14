import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, logApiUsage } from "@/lib/api-auth"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get API key from header
    const apiKey = request.headers.get("x-api-key")

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required. Include it in the X-API-Key header." }, { status: 401 })
    }

    // Validate API key
    const { valid, client, keyData, error } = await validateApiKey(apiKey)

    if (!valid || !client || !keyData) {
      await logApiUsage("", "", "/api/v1/analyze", "POST", 401, Date.now() - startTime, request)
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { repository_url, repository_type = "github", webhook_url } = body

    if (!repository_url) {
      await logApiUsage(client.id, keyData.id, "/api/v1/analyze", "POST", 400, Date.now() - startTime, request)
      return NextResponse.json({ error: "repository_url is required" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = await createServerClient()

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        client_id: client.id,
        repository_name: repository_url,
        repository_type,
        status: "pending",
      })
      .select()
      .single()

    if (analysisError || !analysis) {
      await logApiUsage(client.id, keyData.id, "/api/v1/analyze", "POST", 500, Date.now() - startTime, request)
      return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 })
    }

    // Log API usage
    await logApiUsage(client.id, keyData.id, "/api/v1/analyze", "POST", 202, Date.now() - startTime, request)

    // Return analysis ID and status
    return NextResponse.json(
      {
        analysis_id: analysis.id,
        status: "pending",
        message: "Analysis started. Use GET /api/v1/analyze/:id to check status.",
        estimated_time: "5-10 minutes",
      },
      { status: 202 },
    )
  } catch (error) {
    console.error(" Error in analyze endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

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
    const supabase = await createServerClient()

    // Get all analyses for this client
    const { data: analyses, error: analysesError } = await supabase
      .from("analyses")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (analysesError) {
      await logApiUsage(client.id, keyData.id, "/api/v1/analyze", "GET", 500, Date.now() - startTime, request)
      return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
    }

    await logApiUsage(client.id, keyData.id, "/api/v1/analyze", "GET", 200, Date.now() - startTime, request)

    return NextResponse.json({
      analyses: analyses || [],
      total: analyses?.length || 0,
    })
  } catch (error) {
    console.error(" Error fetching analyses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
