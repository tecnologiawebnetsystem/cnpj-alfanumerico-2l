import { db } from "@/lib/db/sqlserver"

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal"
export type LogCategory = "api" | "analysis" | "queue" | "auth" | "database" | "integration" | "system"

export interface LogContext {
  client_id?: string
  user_id?: string
  request_id?: string
  session_id?: string
  trace_id?: string
  ip_address?: string
  user_agent?: string
  duration_ms?: number
  data?: unknown
  error?: Error
}

class StructuredLogger {
  private context: LogContext

  constructor(_category: LogCategory, context: LogContext = {}) {
    this.context = { ...context, trace_id: context.trace_id || `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }
  }

  private async log(level: LogLevel, message: string, category: LogCategory, data?: unknown, error?: Error): Promise<void> {
    const logEntry = {
      level,
      category,
      message,
      ...this.context,
      data: data ? JSON.stringify(data) : undefined,
      error_stack: error?.stack,
      logged_at: new Date().toISOString(),
    }

    console.log(`[${level.toUpperCase()}] [${category}] ${message}`, data || "")

    try {
      await db.from("structured_logs").insert(logEntry)
    } catch (err) {
      console.error("Failed to save log to database:", err)
    }
  }

  debug(message: string, data?: unknown): void { this.log("debug", message, "system", data) }
  info(message: string, data?: unknown): void { this.log("info", message, "system", data) }
  warn(message: string, data?: unknown): void { this.log("warn", message, "system", data) }
  error(message: string, error?: Error, data?: unknown): void { this.log("error", message, "system", data, error) }
  fatal(message: string, error?: Error, data?: unknown): void { this.log("fatal", message, "system", data, error) }

  child(additionalContext: LogContext): StructuredLogger {
    return new StructuredLogger("system", { ...this.context, ...additionalContext })
  }
}

export function createLogger(category: LogCategory, context: LogContext = {}): StructuredLogger {
  return new StructuredLogger(category, context)
}

export const logger = new StructuredLogger("system")
