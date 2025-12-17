import { NextResponse } from "next/server"
import { getProblematicAnalyses } from "@/lib/monitoring/metrics"

export async function GET() {
  try {
    const analyses = await getProblematicAnalyses()
    return NextResponse.json({ analyses })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
