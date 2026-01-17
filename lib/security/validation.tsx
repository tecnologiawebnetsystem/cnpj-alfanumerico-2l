import { z } from "zod"

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("E-mail inválido")
    .min(1, "E-mail é obrigatório")
    .max(255, "E-mail muito longo")
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, "Senha é obrigatória").max(128, "Senha muito longa"),
})

// Registration validation schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .transform((val) => val.trim()),
  email: z
    .string()
    .email("E-mail inválido")
    .min(1, "E-mail é obrigatório")
    .max(255, "E-mail muito longo")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128, "Senha muito longa")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
})

// CNPJ validation schema
export const cnpjSchema = z.object({
  cnpj: z
    .string()
    .min(14, "CNPJ deve ter 14 caracteres")
    .max(18, "CNPJ muito longo")
    .transform((val) => val.replace(/[^\dA-Za-z]/g, "")),
})

// API Key validation schema
export const apiKeySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  expiresAt: z.string().datetime().optional(),
})

// Repository analysis validation
export const analysisSchema = z.object({
  repositoryIds: z.array(z.string().uuid()).min(1, "Selecione pelo menos um repositório"),
  analysisType: z.enum(["code", "database", "full"]).default("code"),
})

// Sanitize string to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim()
}

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj }
  for (const key in result) {
    if (typeof result[key] === "string") {
      ;(result as any)[key] = sanitizeString(result[key] as string)
    } else if (typeof result[key] === "object" && result[key] !== null) {
      ;(result as any)[key] = sanitizeObject(result[key] as Record<string, unknown>)
    }
  }
  return result
}

// Validate UUID
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push("Senha deve ter pelo menos 8 caracteres")

  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push("Adicione letras maiúsculas")

  if (/[a-z]/.test(password)) score += 1
  else feedback.push("Adicione letras minúsculas")

  if (/[0-9]/.test(password)) score += 1
  else feedback.push("Adicione números")

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else feedback.push("Adicione caracteres especiais")

  // Check for common patterns
  if (/^[a-z]+$|^[A-Z]+$|^[0-9]+$/.test(password)) {
    score -= 2
    feedback.push("Evite usar apenas um tipo de caractere")
  }

  return { score: Math.max(0, Math.min(7, score)), feedback }
}

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CNPJInput = z.infer<typeof cnpjSchema>
export type APIKeyInput = z.infer<typeof apiKeySchema>
export type AnalysisInput = z.infer<typeof analysisSchema>
