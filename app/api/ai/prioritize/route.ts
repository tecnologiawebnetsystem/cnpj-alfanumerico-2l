import { type NextRequest, NextResponse } from "next/server"
import { prioritizeFindings } from "@/lib/ai/smart-prioritizer"

export async function POST(req: NextRequest) {
  try {
    const { findings } = await req.json()

    if (!findings || !Array.isArray(findings)) {
      return NextResponse.json({ error: "Findings array required" }, { status: 400 })
    }

    const priorities = await prioritizeFindings(findings)

    return NextResponse.json({ priorities })
  } catch (error: any) {
    console.error("[v0] Prioritize error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
