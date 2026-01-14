// Comprehensive error logging utility
// Logs all types of errors to the database

interface ErrorLogData {
  error_type: "api" | "rendering" | "timeout" | "database" | "network" | "validation" | "unknown"
  error_message: string
  error_stack?: string
  error_code?: string
  page_url?: string
  component_name?: string
  file_path?: string
  line_number?: number
  column_number?: number
  http_method?: string
  http_status?: number
  request_url?: string
  request_body?: any
  response_body?: any
  metadata?: Record<string, any>
  severity?: "low" | "medium" | "high" | "critical"
}

// Get browser and device info
function getBrowserInfo() {
  if (typeof window === "undefined") return {}

  const ua = navigator.userAgent
  let browser = "Unknown"
  let os = "Unknown"
  let device_type: "desktop" | "mobile" | "tablet" = "desktop"

  // Detect browser
  if (ua.includes("Chrome")) browser = "Chrome"
  else if (ua.includes("Safari")) browser = "Safari"
  else if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("Edge")) browser = "Edge"

  // Detect OS
  if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("Mac")) os = "macOS"
  else if (ua.includes("Linux")) os = "Linux"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("iOS")) os = "iOS"

  // Detect device type
  if (/mobile/i.test(ua)) device_type = "mobile"
  else if (/tablet/i.test(ua)) device_type = "tablet"

  return { browser, os, device_type, user_agent: ua }
}

// Main error logging function
export async function logError(data: ErrorLogData): Promise<void> {
  try {
    const browserInfo = getBrowserInfo()

    const errorLog = {
      ...data,
      ...browserInfo,
      page_url: data.page_url || (typeof window !== "undefined" ? window.location.href : ""),
      occurred_at: new Date().toISOString(),
      // Add automatic severity detection if not provided
      severity: data.severity || detectSeverity(data),
    }

    // Send to API
    const response = await fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorLog),
    })

    if (!response.ok) {
      console.error(" Failed to log error to database:", response.statusText)
    }
  } catch (err) {
    // Fallback: at least log to console if database logging fails
    console.error(" Error logger failed:", err)
    console.error(" Original error:", data)
  }
}

// Auto-detect severity based on error type and message
function detectSeverity(data: ErrorLogData): "low" | "medium" | "high" | "critical" {
  // Critical errors
  if (
    data.error_type === "database" ||
    data.error_message.toLowerCase().includes("critical") ||
    data.error_message.toLowerCase().includes("fatal") ||
    (data.http_status && data.http_status >= 500)
  ) {
    return "critical"
  }

  // High severity errors
  if (
    data.error_type === "timeout" ||
    data.error_type === "rendering" ||
    data.error_message.toLowerCase().includes("timeout") ||
    data.error_message.toLowerCase().includes("crash") ||
    (data.http_status && data.http_status >= 400)
  ) {
    return "high"
  }

  // Medium severity errors
  if (data.error_type === "api" || data.error_type === "network" || data.error_type === "validation") {
    return "medium"
  }

  // Default to low
  return "low"
}

// Convenience function for API errors
export async function logApiError(error: any, request?: Request, response?: Response) {
  await logError({
    error_type: "api",
    error_message: error.message || "API Error",
    error_stack: error.stack,
    http_method: request?.method,
    http_status: response?.status,
    request_url: request?.url,
    metadata: {
      error: error,
    },
  })
}

// Convenience function for timeout errors
export async function logTimeoutError(operation: string, timeout: number) {
  await logError({
    error_type: "timeout",
    error_message: `Operation "${operation}" timed out after ${timeout}ms`,
    severity: "high",
    metadata: {
      operation,
      timeout,
    },
  })
}

// Convenience function for database errors
export async function logDatabaseError(error: any, query?: string) {
  await logError({
    error_type: "database",
    error_message: error.message || "Database Error",
    error_stack: error.stack,
    severity: "critical",
    metadata: {
      query,
      error,
    },
  })
}
