import { LRUCache } from "lru-cache"

type RateLimitConfig = {
  interval: number
  uniqueTokenPerInterval: number
}

const tokenCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 60000, // 1 minute
})

export function rateLimit(config: RateLimitConfig) {
  return {
    check: async (
      limit: number,
      token: string,
    ): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> => {
      const tokenCount = tokenCache.get(token) || [0]
      const currentUsage = tokenCount[0] || 0
      const now = Date.now()
      const reset = now + config.interval

      if (currentUsage >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset,
        }
      }

      tokenCache.set(token, [currentUsage + 1])

      return {
        success: true,
        limit,
        remaining: limit - (currentUsage + 1),
        reset,
      }
    },
  }
}

// Different rate limits for different endpoints
export const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export const strictLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
})

export const authLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 100,
})

// Get client identifier for rate limiting
export function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "unknown"
  return ip
}
