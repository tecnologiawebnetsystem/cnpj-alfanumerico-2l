import { NextRequest, NextResponse } from "next/server"
import { createAnalysisComparison } from "@/lib/reports/advanced-reports"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const comparison = await createAnalysisComparison(body)
    return NextResponse.json({ comparison })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
