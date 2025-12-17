// Email utility (placeholder - integrate with Resend, SendGrid, etc.)
import { getClientSetting } from "./client-settings"

export async function sendEmail({
  to,
  subject,
  html,
  text,
  clientId,
}: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  clientId?: string
}) {
  // Get Resend API key from client settings
  const resendApiKey = await getClientSetting("resend_api_key", clientId)

  if (!resendApiKey) {
    console.log("[v0] Email sending disabled - no API key configured")
    return { success: false, error: "Email not configured" }
  }

  // TODO: Integrate with Resend
  console.log("[v0] Email would be sent:", { to, subject, hasApiKey: !!resendApiKey })

  // In production, use:
  // const resend = new Resend(resendApiKey)
  // await resend.emails.send({ from: 'noreply@...', to, subject, html, text })

  return { success: true }
}

export async function sendNotificationEmail({
  to,
  notification,
}: {
  to: string
  notification: {
    title: string
    message: string
    link?: string
  }
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${notification.title}</h2>
      <p>${notification.message}</p>
      ${notification.link ? `<a href="${notification.link}" style="display: inline-block; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Ver Detalhes</a>` : ""}
    </div>
  `

  return sendEmail({
    to,
    subject: notification.title,
    html,
    text: notification.message,
  })
}
