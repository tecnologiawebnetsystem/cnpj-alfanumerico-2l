import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/utils/rate-limiter"

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: { limit?: number; window?: number } = {},
) {
  return async (request: NextRequest) => {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const key = `rate-limit:${ip}:${request.nextUrl.pathname}`

    const result = rateLimit({
      key,
      limit: options.limit,
      window: options.window,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": options.limit?.toString() || "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
          },
        },
      )
    }

    const response = await handler(request)

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", options.limit?.toString() || "10")
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
    response.headers.set("X-RateLimit-Reset", new Date(result.resetAt).toISOString())

    return response
  }
}
