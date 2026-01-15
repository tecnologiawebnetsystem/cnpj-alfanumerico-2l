import { z } from "zod"

export const emailSchema = z.string().email("Email inválido").max(255)

export const passwordSchema = z
  .string()
  .min(12, "Senha deve ter no mínimo 12 caracteres")
  .max(128, "Senha muito longa")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial")

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
})

export const cnpjSchema = z.string().regex(/^[A-Z0-9]{14}$/, "CNPJ alfanumérico inválido")

export const repositoryUrlSchema = z.string().url("URL inválida").max(500)

export const apiKeySchema = z.string().min(32, "API key inválida").max(128)

export const userIdSchema = z.string().uuid("ID de usuário inválido")

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// SQL Injection prevention
export function sanitizeSqlInput(input: string): string {
  return input.replace(/['";\\]/g, "")
}

// XSS prevention
export function sanitizeHtmlInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

// Path traversal prevention
export function sanitizeFilePath(path: string): string {
  return path.replace(/\.\./g, "").replace(/[^a-zA-Z0-9\-_/.]/g, "")
}
