import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - always allow
  const publicRoutes = ["/", "/login", "/forgot-password", "/license-expired"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route)
  const isApiRoute = pathname.startsWith("/api/")
  const isStaticAsset = pathname.startsWith("/_next/") || pathname.includes(".")

  // Allow public routes, API routes, and static assets
  if (isPublicRoute || isApiRoute || isStaticAsset) {
    return NextResponse.next()
  }

  // Verify session for protected routes
  const sessionToken = request.cookies.get("session_token")?.value

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/dev")) {
    if (!sessionToken) {
      const loginUrl = new URL("/", request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Validate session token
    try {
      const session = JSON.parse(Buffer.from(sessionToken, "base64").toString())
      const tokenAge = Date.now() - session.timestamp
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

      if (tokenAge > maxAge) {
        const loginUrl = new URL("/", request.url)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      const loginUrl = new URL("/", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
