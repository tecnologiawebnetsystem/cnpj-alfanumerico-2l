import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { analysisId: string } }) {
  try {
    const { analysisId } = params
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: analysis } = await supabase
      .from("analyses")
      .select("*, repositories(*), connections:connection_id(account_name)")
      .eq("id", analysisId)
      .single()

    const { data: findings } = await supabase.from("findings").select("*").eq("analysis_id", analysisId)

    const accountName = analysis?.connections?.account_name || "N/A"
    const repositoryName = analysis?.repositories?.name || analysis?.repository_name || "N/A"

    const totalEstimatedHours = findings?.reduce((sum, f) => sum + (f.estimated_hours || 4), 0) || 0

    const report = {
      metadata: {
        analysisId,
        accountName, // Added account name
        repositoryName, // Added repository name
        status: analysis?.status,
        createdAt: analysis?.created_at,
        completedAt: analysis?.completed_at,
      },
      summary: {
        totalFiles: analysis?.results?.summary?.total_files || 0,
        totalFindings: findings?.length || 0,
        totalEstimatedHours, // Added total estimated hours
        durationSeconds: analysis?.completed_at
          ? Math.round((new Date(analysis.completed_at).getTime() - new Date(analysis.created_at).getTime()) / 1000)
          : 0,
      },
      findings:
        findings?.map((f) => ({
          accountName, // Added to each finding
          repositoryName, // Added to each finding
          filePath: f.file_path,
          lineNumber: f.line_number,
          fieldName: f.field_name,
          codeCurrent: f.code_current,
          suggestion: f.suggestion,
          estimatedHours: f.estimated_hours || 4, // Added estimated hours
          language: f.language,
          createdAt: f.created_at,
        })) || [],
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error(" Error generating JSON:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
