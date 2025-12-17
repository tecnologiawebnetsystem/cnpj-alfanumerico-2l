import { NextResponse } from "next/server"
import { getCacheStatistics } from "@/lib/performance/cache"

export async function GET() {
  try {
    const stats = await getCacheStatistics()
    return NextResponse.json({ stats })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
