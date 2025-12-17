import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface Notification {
  user_id: string
  client_id?: string
  type: string
  title: string
  message: string
  data?: any
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

// Criar notificação in-app
export async function createNotification(notification: Notification) {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating notification:", error)
    throw error
  }

  return data
}

// Buscar notificações do usuário
export async function getUserNotifications(userId: string, unreadOnly = false) {
  const supabase = getSupabaseClient()
  
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)

  if (unreadOnly) {
    query = query.eq("read", false)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data
}

// Marcar notificações como lidas
export async function markAsRead(userId: string, notificationIds: string[]) {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase.rpc("mark_notifications_as_read", {
    p_user_id: userId,
    p_notification_ids: notificationIds,
  })

  if (error) throw error
}

// Enviar email
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  data?: any
) {
  // Aqui você pode integrar com serviços como SendGrid, AWS SES, etc
  console.log("[v0] Sending email:", { to, subject, body, data })
  
  // Exemplo: usando fetch para API externa
  // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {...})
  
  return { success: true, message: "Email sent" }
}

// Disparar webhook
export async function triggerWebhook(
  webhookUrl: string,
  eventType: string,
  payload: any,
  userId: string
) {
  const log = {
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
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CNPJ-Analyzer/1.0",
      },
      body: JSON.stringify({
        event: eventType,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    })

    log.response_status = response.status
    log.response_body = await response.text()
    log.success = response.ok

    if (!response.ok) {
      log.error_message = `HTTP ${response.status}: ${log.response_body}`
    }
  } catch (error: any) {
    log.error_message = error.message
  }

  // Salvar log do webhook
  const supabase = getSupabaseClient()
  await supabase.from("webhook_logs").insert(log)

  return log
}

// Notificar conclusão de análise
export async function notifyAnalysisComplete(
  userId: string,
  analysisId: string,
  analysisData: any
) {
  const supabase = getSupabaseClient()
  
  // Buscar preferências do usuário
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!prefs) return

  // Notificação in-app
  if (prefs.in_app_enabled) {
    await createNotification({
      user_id: userId,
      type: "analysis_complete",
      title: "Análise Concluída",
      message: `A análise do repositório ${analysisData.repository_name} foi concluída com sucesso.`,
      data: { analysis_id: analysisId, ...analysisData },
    })
  }

  // Email
  if (prefs.email_enabled && prefs.email_on_analysis_complete) {
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single()

    if (user?.email) {
      await sendEmail(
        user.email,
        "Análise Concluída",
        `Sua análise do repositório ${analysisData.repository_name} foi concluída.`,
        analysisData
      )
    }
  }

  // Webhook
  if (prefs.webhook_enabled && prefs.webhook_url) {
    if (prefs.webhook_events?.includes("analysis_complete")) {
      await triggerWebhook(
        prefs.webhook_url,
        "analysis_complete",
        { analysis_id: analysisId, ...analysisData },
        userId
      )
    }
  }
}

// Notificar falha de job
export async function notifyJobFailed(
  userId: string,
  jobId: string,
  errorMessage: string
) {
  const supabase = getSupabaseClient()
  
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (!prefs) return

  if (prefs.in_app_enabled) {
    await createNotification({
      user_id: userId,
      type: "job_failed",
      title: "Falha na Análise",
      message: `Um job falhou: ${errorMessage}`,
      data: { job_id: jobId, error: errorMessage },
    })
  }

  if (prefs.email_enabled && prefs.email_on_job_failed) {
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single()

    if (user?.email) {
      await sendEmail(
        user.email,
        "Falha na Análise",
        `Um job falhou: ${errorMessage}`,
        { job_id: jobId }
      )
    }
  }

  if (
    prefs.webhook_enabled &&
    prefs.webhook_url &&
    prefs.webhook_events?.includes("job_failed")
  ) {
    await triggerWebhook(
      prefs.webhook_url,
      "job_failed",
      { job_id: jobId, error: errorMessage },
      userId
    )
  }
}
