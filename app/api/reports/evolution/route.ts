import { NextRequest, NextResponse } from "next/server"
import { getAnalysisEvolution } from "@/lib/reports/advanced-reports"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repositoryId = searchParams.get("repositoryId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!repositoryId) {
      return NextResponse.json(
        { error: "repositoryId is required" },
        { status: 400 }
      )
    }

    const evolution = await getAnalysisEvolution(
      repositoryId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    )

    return NextResponse.json({ evolution })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
