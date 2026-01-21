import { cookies } from "next/headers"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

interface Session {
  userId: string
  email: string
  role: string
  clientId: string
  createdAt: number
  lastActivity: number
  ip: string
  userAgent: string
}

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

export class SessionManager {
  private static async generateSessionId(): Promise<string> {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  static async createSession(
    userId: string,
    email: string,
    role: string,
    clientId: string,
    ip: string,
    userAgent: string,
  ): Promise<string> {
    const sessionId = await this.generateSessionId()
    const now = Date.now()

    const session: Session = {
      userId,
      email,
      role,
      clientId,
      createdAt: now,
      lastActivity: now,
      ip,
      userAgent,
    }

    // Store in Redis with 24h expiration
    await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(session))

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
      path: "/",
    })

    return sessionId
  }

  static async getSession(sessionId: string): Promise<Session | null> {
    try {
      const data = await redis.get<string>(`session:${sessionId}`)
      if (!data) return null

      const session: Session = typeof data === "string" ? JSON.parse(data) : data
      const now = Date.now()

      // Check if session expired due to inactivity
      if (now - session.lastActivity > SESSION_TIMEOUT) {
        await this.destroySession(sessionId)
        return null
      }

      // Check if session exceeded max age
      if (now - session.createdAt > SESSION_MAX_AGE) {
        await this.destroySession(sessionId)
        return null
      }

      // Update last activity
      session.lastActivity = now
      await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(session))

      return session
    } catch (error) {
      console.error("[v0] Session retrieval error:", error)
      return null
    }
  }

  static async rotateSession(oldSessionId: string): Promise<string | null> {
    const session = await this.getSession(oldSessionId)
    if (!session) return null

    // Create new session with same data
    const newSessionId = await this.createSession(
      session.userId,
      session.email,
      session.role,
      session.clientId,
      session.ip,
      session.userAgent,
    )

    // Destroy old session
    await this.destroySession(oldSessionId)

    return newSessionId
  }

  static async destroySession(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`)
    const cookieStore = await cookies()
    cookieStore.delete("session_id")
  }

  static async getCurrentSession(): Promise<Session | null> {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value
    if (!sessionId) return null

    return this.getSession(sessionId)
  }
}
