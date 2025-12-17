import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const baseId = searchParams.get("base")
    const compareId = searchParams.get("compare")

    if (!baseId || !compareId) {
      return NextResponse.json({ error: "base and compare IDs are required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get findings for both analyses
    const { data: baseFindings } = await supabase.from("findings").select("*").eq("analysis_id", baseId)

    const { data: compareFindings } = await supabase.from("findings").select("*").eq("analysis_id", compareId)

    // Create maps for comparison
    const baseMap = new Map()
    baseFindings?.forEach((f) => {
      const key = `${f.file_path}:${f.line_number}`
      baseMap.set(key, f)
    })

    const compareMap = new Map()
    compareFindings?.forEach((f) => {
      const key = `${f.file_path}:${f.line_number}`
      compareMap.set(key, f)
    })

    // Find resolved and new findings
    const resolved = []
    const newFindings = []

    baseMap.forEach((finding, key) => {
      if (!compareMap.has(key)) {
        resolved.push({
          repository: finding.repository || "Desconhecido",
          file: finding.file_path,
          line: finding.line_number,
          status: "resolved",
        })
      }
    })

    compareMap.forEach((finding, key) => {
      if (!baseMap.has(key)) {
        newFindings.push({
          repository: finding.repository || "Desconhecido",
          file: finding.file_path,
          line: finding.line_number,
          status: "new",
        })
      }
    })

    const totalBase = baseFindings?.length || 0
    const totalCompare = compareFindings?.length || 0
    const improvement = totalBase > 0 ? Math.round(((totalBase - totalCompare) / totalBase) * 100) : 0

    return NextResponse.json({
      resolved: resolved.length,
      new: newFindings.length,
      improvement: improvement > 0 ? improvement : 0,
      changes: [...resolved, ...newFindings],
    })
  } catch (error) {
    console.error("[v0] Error comparing analyses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
