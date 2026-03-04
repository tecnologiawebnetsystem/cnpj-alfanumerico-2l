import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Public routes that never require auth
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/forgot-password",
  "/license-expired",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route)
  const isApiRoute = pathname.startsWith("/api/")
  const isStaticAsset = pathname.startsWith("/_next/") || pathname.includes(".")
  const isAuthRoute = pathname.startsWith("/auth/")
  const isSolucoes = pathname.startsWith("/solucoes")
  const isReforma = pathname.startsWith("/reforma")

  // Always allow public, API, static, auth, and informational routes
  if (isPublicRoute || isApiRoute || isStaticAsset || isAuthRoute || isSolucoes || isReforma) {
    return NextResponse.next()
  }

  // Require session for protected routes
  const sessionToken = request.cookies.get("session_token")?.value

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dev") ||
    pathname.startsWith("/analyzer") ||
    pathname.startsWith("/analysis") ||
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/integrations") ||
    pathname.startsWith("/tasks")

  if (isProtectedRoute) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const session = JSON.parse(Buffer.from(sessionToken, "base64").toString())
      const tokenAge = Date.now() - session.timestamp
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

      if (tokenAge > maxAge) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
