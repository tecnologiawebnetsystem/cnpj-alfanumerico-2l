import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getClientId, authLimiter } from "@/lib/security/rate-limiter"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply rate limiting to authentication endpoints
  if (pathname.startsWith("/api/auth/")) {
    const clientId = getClientId(request)
    const rateLimitResult = await authLimiter.check(5, `auth_${clientId}`) // 5 attempts per 15 minutes

    if (!rateLimitResult.success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      })
    }
  }

  // Public routes
  const publicRoutes = ["/", "/login", "/forgot-password", "/license-expired", "/api/auth/login"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith("/api/v1/"))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verify session for protected routes
  const sessionToken = request.cookies.get("session_token")?.value

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/dev")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Validate session token
    try {
      const session = JSON.parse(Buffer.from(sessionToken, "base64").toString())
      const tokenAge = Date.now() - session.timestamp
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

      if (tokenAge > maxAge) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("redirect", pathname)
        loginUrl.searchParams.set("error", "session_expired")
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
