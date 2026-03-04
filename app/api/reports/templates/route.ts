import { NextRequest, NextResponse } from "next/server"
import { createReportTemplate, getReportTemplates } from "@/lib/reports/advanced-reports"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const clientId = searchParams.get("clientId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const templates = await getReportTemplates(userId, clientId || undefined)
    return NextResponse.json({ templates })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const template = await createReportTemplate(body)
    return NextResponse.json({ template })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
