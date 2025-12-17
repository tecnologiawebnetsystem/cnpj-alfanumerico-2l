import { createClient } from "@supabase/supabase-js"

// Function to create Supabase client
function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal"
export type LogCategory =
  | "api"
  | "analysis"
  | "queue"
  | "auth"
  | "database"
  | "integration"
  | "system"

export interface LogContext {
  client_id?: string
  user_id?: string
  request_id?: string
  session_id?: string
  trace_id?: string
  ip_address?: string
  user_agent?: string
  duration_ms?: number
  data?: any
  error?: Error
}

class StructuredLogger {
  private context: LogContext

  constructor(category: LogCategory, context: LogContext = {}) {
    this.context = {
      ...context,
      trace_id: context.trace_id || this.generateTraceId(),
    }
  }

  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private async log(
    level: LogLevel,
    message: string,
    category: LogCategory,
    data?: any,
    error?: Error
  ): Promise<void> {
    const logEntry = {
      level,
      category,
      message,
      ...this.context,
      data: data ? JSON.stringify(data) : undefined,
      error_stack: error?.stack,
      logged_at: new Date().toISOString(),
    }

    // Console.log para desenvolvimento
    const emoji = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
      fatal: "💀",
    }

    console.log(
      `${emoji[level]} [${category}] ${message}`,
      data ? data : ""
    )

    // Salvar no banco de dados
    try {
      const supabase = getSupabaseClient()
      await supabase.from("structured_logs").insert(logEntry)
    } catch (error) {
      console.error("Failed to save log to database:", error)
    }
  }

  debug(message: string, data?: any): void {
    this.log("debug", message, "system", data)
  }

  info(message: string, data?: any): void {
    this.log("info", message, "system", data)
  }

  warn(message: string, data?: any): void {
    this.log("warn", message, "system", data)
  }

  error(message: string, error?: Error, data?: any): void {
    this.log("error", message, "system", data, error)
  }

  fatal(message: string, error?: Error, data?: any): void {
    this.log("fatal", message, "system", data, error)
  }

  // Criar logger filho com contexto adicional
  child(additionalContext: LogContext): StructuredLogger {
    return new StructuredLogger("system", {
      ...this.context,
      ...additionalContext,
    })
  }
}

// Factory para criar loggers por categoria
export function createLogger(
  category: LogCategory,
  context: LogContext = {}
): StructuredLogger {
  return new StructuredLogger(category, context)
}

// Logger global padrão
export const logger = new StructuredLogger("system")
