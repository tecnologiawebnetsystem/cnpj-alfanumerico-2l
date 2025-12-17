import { type NextRequest, NextResponse } from "next/server"
import { analyzeWithGemini } from "@/lib/ai/gemini-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { finding } = await request.json()

    if (!finding) {
      return NextResponse.json({ error: "Finding data required" }, { status: 400 })
    }

    console.log("[v0] Analyzing finding with Gemini:", finding.fieldName)

    const analysis = await analyzeWithGemini(finding)

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("[v0] Error in analyze-cnpj endpoint:", error)
    return NextResponse.json({ error: "Failed to analyze with Gemini" }, { status: 500 })
  }
}
