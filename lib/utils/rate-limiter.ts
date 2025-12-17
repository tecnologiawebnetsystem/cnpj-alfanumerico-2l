// Simple in-memory rate limiter (for production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit({
  key,
  limit = 10,
  window = 60000, // 1 minute
}: {
  key: string
  limit?: number
  window?: number
}): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetAt) {
    // Create new record
    const resetAt = now + window
    rateLimitMap.set(key, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return { success: false, remaining: 0, resetAt: record.resetAt }
  }

  // Increment count
  record.count++
  rateLimitMap.set(key, record)
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Every minute
