import { NextResponse } from "next/server"
import { cleanupExpiredCache } from "@/lib/performance/cache"
import { cleanupOldAnalyzedFiles } from "@/lib/performance/incremental"
import { archiveOldFindings } from "@/lib/performance/compression"

export async function POST() {
  try {
    const results = {
      cache_cleaned: await cleanupExpiredCache(),
      files_cleaned: await cleanupOldAnalyzedFiles(30),
      findings_archived: await archiveOldFindings(7),
    }

    return NextResponse.json({
      message: "Cleanup completed",
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
