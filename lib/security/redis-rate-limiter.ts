import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export class RedisRateLimiter {
  private prefix: string
  private limit: number
  private window: number // seconds

  constructor(prefix: string, limit: number, windowSeconds: number) {
    this.prefix = prefix
    this.limit = limit
    this.window = windowSeconds
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.prefix}:${identifier}`
    const now = Date.now()
    const windowStart = now - this.window * 1000

    try {
      // Remove old entries outside the time window
      await redis.zremrangebyscore(key, 0, windowStart)

      // Count requests in current window
      const count = await redis.zcard(key)

      if (count >= this.limit) {
        // Get oldest request timestamp to calculate reset time
        const oldestEntry = await redis.zrange(key, 0, 0, { withScores: true })
        const resetTimestamp =
          oldestEntry.length > 0 ? Number(oldestEntry[1]) + this.window * 1000 : now + this.window * 1000

        return {
          success: false,
          limit: this.limit,
          remaining: 0,
          reset: Math.ceil(resetTimestamp / 1000),
        }
      }

      // Add current request
      await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` })
      await redis.expire(key, this.window)

      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - count - 1,
        reset: Math.ceil((now + this.window * 1000) / 1000),
      }
    } catch (error) {
      console.error(" Redis rate limiter error:", error)
      // Fail open on Redis errors to not block legitimate users
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit,
        reset: Math.ceil((now + this.window * 1000) / 1000),
      }
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = `${this.prefix}:${identifier}`
    await redis.del(key)
  }
}

// Pre-configured rate limiters
export const loginRateLimiter = new RedisRateLimiter("login", 5, 900) // 5 attempts per 15 minutes
export const apiRateLimiter = new RedisRateLimiter("api", 100, 60) // 100 requests per minute
export const passwordResetRateLimiter = new RedisRateLimiter("pwd-reset", 3, 3600) // 3 attempts per hour
