import { db } from "@/lib/db/sqlserver"

export interface Notification {
  user_id: string
  client_id?: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
}

export interface NotificationPreferences {
  user_id: string
  email_enabled?: boolean
  email_on_analysis_complete?: boolean
  email_on_job_failed?: boolean
  email_on_alert?: boolean
  in_app_enabled?: boolean
  webhook_enabled?: boolean
  webhook_url?: string
  webhook_events?: string[]
}

export async function createNotification(notification: Notification) {
  const { data, error } = await db.from("notifications").insert(notification).single()
  if (error) throw new Error(error.message)
  return data
}

export async function getUserNotifications(userId: string, unreadOnly = false) {
  let query = db.from("notifications").select("*").eq("user_id", userId)
  if (unreadOnly) query = query.eq("read", false)
  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function markAsRead(userId: string, notificationIds: string[]) {
  if (!notificationIds.length) return
  const { error } = await db.from("notifications").update({ read: true }).eq("user_id", userId).in("id", notificationIds)
  if (error) throw new Error(error.message)
}

export async function sendEmail(to: string, subject: string, body: string, data?: Record<string, unknown>) {
  console.log("Sending email:", { to, subject, body, data })
  return { success: true, message: "Email sent" }
}

export async function triggerWebhook(webhookUrl: string, eventType: string, payload: unknown, userId: string) {
  const log: Record<string, unknown> = {
    user_id: userId,
    event_type: eventType,
    webhook_url: webhookUrl,
    payload,
    success: false,
    response_status: null,
    response_body: null,
    error_message: null,
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "CNPJ-Analyzer/1.0" },
      body: JSON.stringify({ event: eventType, timestamp: new Date().toISOString(), data: payload }),
    })
    log.response_status = response.status
    log.response_body = await response.text()
    log.success = response.ok
    if (!response.ok) log.error_message = `HTTP ${response.status}: ${log.response_body}`
  } catch (error: unknown) {
    log.error_message = error instanceof Error ? error.message : String(error)
  }

  await db.from("webhook_logs").insert(log)
  return log
}

export async function notifyAnalysisComplete(userId: string, analysisId: string, analysisData: Record<string, unknown>) {
  const { data: prefs } = await db.from("notification_preferences").select("*").eq("user_id", userId).single()
  if (!prefs) return

  const p = prefs as Record<string, unknown>

  if (p.in_app_enabled) {
    await createNotification({
      user_id: userId,
      type: "analysis_complete",
      title: "Análise Concluída",
      message: `A análise do repositório ${analysisData.repository_name} foi concluída com sucesso.`,
      data: { analysis_id: analysisId, ...analysisData },
    })
  }

  if (p.email_enabled && p.email_on_analysis_complete) {
    const { data: user } = await db.from("users").select("email").eq("id", userId).single()
    const u = user as Record<string, unknown>
    if (u?.email) {
      await sendEmail(u.email as string, "Análise Concluída", `Sua análise do repositório ${analysisData.repository_name} foi concluída.`, analysisData)
    }
  }

  if (p.webhook_enabled && p.webhook_url && (p.webhook_events as string[])?.includes("analysis_complete")) {
    await triggerWebhook(p.webhook_url as string, "analysis_complete", { analysis_id: analysisId, ...analysisData }, userId)
  }
}

export async function notifyJobFailed(userId: string, jobId: string, errorMessage: string) {
  const { data: prefs } = await db.from("notification_preferences").select("*").eq("user_id", userId).single()
  if (!prefs) return

  const p = prefs as Record<string, unknown>

  if (p.in_app_enabled) {
    await createNotification({ user_id: userId, type: "job_failed", title: "Falha na Análise", message: `Um job falhou: ${errorMessage}`, data: { job_id: jobId, error: errorMessage } })
  }

  if (p.email_enabled && p.email_on_job_failed) {
    const { data: user } = await db.from("users").select("email").eq("id", userId).single()
    const u = user as Record<string, unknown>
    if (u?.email) {
      await sendEmail(u.email as string, "Falha na Análise", `Um job falhou: ${errorMessage}`, { job_id: jobId })
    }
  }

  if (p.webhook_enabled && p.webhook_url && (p.webhook_events as string[])?.includes("job_failed")) {
    await triggerWebhook(p.webhook_url as string, "job_failed", { job_id: jobId, error: errorMessage }, userId)
  }
}
