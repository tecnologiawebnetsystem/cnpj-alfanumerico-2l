import { type NextRequest, NextResponse } from "next/server"
import { generateCodeFix } from "@/lib/ai/gemini-code-fixer"

export async function POST(req: NextRequest) {
  try {
    const { finding } = await req.json()

    if (!finding) {
      return NextResponse.json({ error: "Finding required" }, { status: 400 })
    }

    const fix = await generateCodeFix(finding)

    return NextResponse.json(fix)
  } catch (error: any) {
    console.error(" Fix code error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
