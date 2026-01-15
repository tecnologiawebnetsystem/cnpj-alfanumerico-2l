import { NextResponse } from "next/server"
import { logSecurityEvent } from "./audit-logger"

export function safeErrorResponse(error: unknown, userId?: string): NextResponse {
  console.error("[v0] API Error:", error)

  // Log security event
  if (userId) {
    logSecurityEvent({
      userId,
      eventType: "api_error",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      ipAddress: "unknown",
      userAgent: "unknown",
    }).catch(console.error)
  }

  // Generic error message for client
  const isDevelopment = process.env.NODE_ENV === "development"

  if (isDevelopment && error instanceof Error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export function unauthorized(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function badRequest(message = "Bad request"): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function tooManyRequests(resetTime?: number): NextResponse {
  const response = NextResponse.json({ error: "Too many requests" }, { status: 429 })

  if (resetTime) {
    response.headers.set("X-RateLimit-Reset", resetTime.toString())
  }

  return response
}
