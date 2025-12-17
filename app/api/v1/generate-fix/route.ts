import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, logApiUsage } from "@/lib/api-auth"
import { CodeGenerator } from "@/lib/code-generator"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const apiKey = request.headers.get("x-api-key")

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    const { valid, client, keyData, error } = await validateApiKey(apiKey)

    if (!valid || !client || !keyData) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { code, language, fieldName, type } = body

    if (!code || !language || !type) {
      await logApiUsage(client.id, keyData.id, "/api/v1/generate-fix", "POST", 400, Date.now() - startTime, request)
      return NextResponse.json({ error: "code, language, and type are required" }, { status: 400 })
    }

    const generator = new CodeGenerator()
    const fix = await generator.generateFix(code, language, fieldName || "cnpj", type)

    await logApiUsage(client.id, keyData.id, "/api/v1/generate-fix", "POST", 200, Date.now() - startTime, request)

    return NextResponse.json(fix)
  } catch (error) {
    console.error("[v0] Error generating fix:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
