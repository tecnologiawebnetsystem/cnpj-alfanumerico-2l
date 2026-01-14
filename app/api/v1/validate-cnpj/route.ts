import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, logApiUsage } from "@/lib/api-auth"
import { CNPJValidator } from "@/lib/cnpj-validator"

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
    const { cnpj, format = "auto" } = body

    if (!cnpj) {
      await logApiUsage(client.id, keyData.id, "/api/v1/validate-cnpj", "POST", 400, Date.now() - startTime, request)
      return NextResponse.json({ error: "cnpj is required" }, { status: 400 })
    }

    let validationResult
    const cleaned = cnpj.replace(/[.\-/]/g, "").toUpperCase()
    const isNumeric = /^\d+$/.test(cleaned)

    if (format === "numeric" || (format === "auto" && isNumeric)) {
      validationResult = CNPJValidator.validateNumeric(cnpj)
    } else {
      validationResult = CNPJValidator.validateAlphanumeric(cnpj)
    }

    const formatted = validationResult.valid ? CNPJValidator.format(cleaned) : null

    await logApiUsage(
      client.id,
      keyData.id,
      "/api/v1/validate-cnpj",
      "POST",
      validationResult.valid ? 200 : 400,
      Date.now() - startTime,
      request,
    )

    return NextResponse.json({
      cnpj: cleaned,
      formatted,
      is_valid: validationResult.valid,
      format: isNumeric ? "numeric" : "alphanumeric",
      message: validationResult.message,
    })
  } catch (error) {
    console.error(" Error validating CNPJ:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const count = Math.min(Number.parseInt(searchParams.get("count") || "1"), 100)

    const cnpjs = []
    for (let i = 0; i < count; i++) {
      const generated = CNPJValidator.generate()
      cnpjs.push({
        cnpj: generated,
        formatted: CNPJValidator.format(generated),
      })
    }

    await logApiUsage(client.id, keyData.id, "/api/v1/validate-cnpj", "GET", 200, Date.now() - startTime, request)

    return NextResponse.json({
      count: cnpjs.length,
      cnpjs,
    })
  } catch (error) {
    console.error(" Error generating CNPJs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
