import { type NextRequest, NextResponse } from "next/server"
import { db as supabase } from "@/lib/db/sqlserver"
import { getCurrentUser } from "@/lib/auth-actions"

export const dynamic = "force-dynamic"

// Returns the first analysis of a batch, for redirect purposes
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const { data: batchAnalyses } = await supabase
      .from("analyses")
      .select("id")
      .eq("batch_id", id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (!batchAnalyses || batchAnalyses.length === 0) {
      return NextResponse.json({ firstAnalysisId: null }, { status: 404 })
    }

    return NextResponse.json({ firstAnalysisId: batchAnalyses[0].id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
