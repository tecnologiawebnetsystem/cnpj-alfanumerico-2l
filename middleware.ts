import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acesso público a estas rotas
  const publicRoutes = ["/", "/login", "/forgot-password", "/license-expired", "/api/auth/login"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith("/api/v1/"))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Verificar se é rota de admin
  if (pathname.startsWith("/admin")) {
    // Admin routes são verificadas no componente (client-side)
    return NextResponse.next()
  }

  // Para rotas protegidas do dashboard, verificar licença
  if (pathname.startsWith("/dashboard")) {
    // A verificação de licença será feita client-side no componente
    // pois precisamos acessar o localStorage para pegar o client_id
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
