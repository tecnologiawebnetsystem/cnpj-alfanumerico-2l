import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth-actions"
import { generateText } from "ai"

// GET /api/ai/suggestions - Get AI suggestions for findings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const findingId = searchParams.get("finding_id")
    const status = searchParams.get("status")

    const supabase = await createServerClient()

    let query = supabase
      .from("ai_suggestions")
      .select("*")
      .eq("client_id", user.client_id)
      .order("created_at", { ascending: false })

    if (findingId) {
      query = query.eq("finding_id", findingId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: suggestions, error } = await query

    if (error) throw error

    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error(" Error fetching AI suggestions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/ai/suggestions - Generate AI suggestion
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { finding_id, database_finding_id, original_code, language } = body

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an expert developer helping migrate CNPJ fields from numeric (14 digits) to alphanumeric (20 characters) format in Brazil.

Original code (${language}):
\`\`\`${language}
${original_code}
\`\`\`

Task: Suggest the corrected code that properly handles the new alphanumeric CNPJ format (20 characters).

Requirements:
1. Change field length from 14 to 20 characters
2. Update validation to accept alphanumeric characters
3. Maintain backward compatibility if possible
4. Add comments explaining the changes

Respond in JSON format:
{
  "suggested_code": "the corrected code",
  "explanation": "brief explanation of changes",
  "confidence": 0.95
}`,
    })

    const suggestion = JSON.parse(text)

    const supabase = await createServerClient()

    const { data: savedSuggestion, error } = await supabase
      .from("ai_suggestions")
      .insert({
        finding_id,
        database_finding_id,
        client_id: user.client_id,
        original_code,
        suggested_code: suggestion.suggested_code,
        explanation: suggestion.explanation,
        confidence_score: suggestion.confidence,
        language,
        model_used: "gpt-4o-mini",
        status: "completed",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(savedSuggestion)
  } catch (error: any) {
    console.error(" Error creating AI suggestion:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
