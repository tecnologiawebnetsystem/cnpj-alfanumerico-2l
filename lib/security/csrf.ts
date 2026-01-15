import { randomBytes } from "crypto"

const CSRF_TOKEN_LENGTH = 32
const CSRF_TOKEN_HEADER = "x-csrf-token"

export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex")
}

export function validateCsrfToken(token: string | null, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  if (token.length !== storedToken.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i)
  }

  return result === 0
}

export function getCsrfTokenFromRequest(request: Request): string | null {
  return request.headers.get(CSRF_TOKEN_HEADER)
}
