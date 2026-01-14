// Service to send notifications via different channels
import { createNotification } from "@/lib/utils/notifications"
import { sendNotificationEmail } from "@/lib/utils/email"
import { sendWhatsAppNotification } from "@/lib/utils/whatsapp"
import type { NotificationType, NotificationPriority } from "@/lib/types"

interface SendNotificationOptions {
  userId: string
  clientId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  priority?: NotificationPriority
  category?: string
  metadata?: Record<string, any>
  channels?: ("in_app" | "email" | "whatsapp")[]
  userEmail?: string
  userPhone?: string
}

export async function sendNotification(options: SendNotificationOptions) {
  const {
    userId,
    clientId,
    type,
    title,
    message,
    link,
    priority = "normal",
    category,
    metadata,
    channels = ["in_app"],
    userEmail,
    userPhone,
  } = options

  const results: Record<string, boolean> = {}

  // Always create in-app notification
  if (channels.includes("in_app")) {
    try {
      await createNotification({
        userId,
        clientId,
        type,
        title,
        message,
        link,
        priority,
        category,
        metadata,
      })
      results.in_app = true
    } catch (error) {
      console.error(" Error creating in-app notification:", error)
      results.in_app = false
    }
  }

  // Send email if requested and email is provided
  if (channels.includes("email") && userEmail) {
    try {
      await sendNotificationEmail({
        to: userEmail,
        notification: { title, message, link },
      })
      results.email = true
    } catch (error) {
      console.error(" Error sending email notification:", error)
      results.email = false
    }
  }

  // Send WhatsApp if requested and phone is provided
  if (channels.includes("whatsapp") && userPhone) {
    try {
      await sendWhatsAppNotification({
        to: userPhone,
        notification: { title, message, link },
      })
      results.whatsapp = true
    } catch (error) {
      console.error(" Error sending WhatsApp notification:", error)
      results.whatsapp = false
    }
  }

  return results
}

// Helper functions for common notification scenarios

export async function notifyTaskAssigned(params: {
  assignedToUserId: string
  assignedToEmail: string
  assignedToPhone?: string
  clientId: string
  taskTitle: string
  taskId: string
  assignedByName: string
}) {
  return sendNotification({
    userId: params.assignedToUserId,
    clientId: params.clientId,
    type: "task_assigned",
    title: "Nova tarefa atribuída",
    message: `${params.assignedByName} atribuiu a tarefa "${params.taskTitle}" para você`,
    link: `/dashboard/tasks?id=${params.taskId}`,
    priority: "normal",
    category: "task",
    channels: ["in_app", "email"],
    userEmail: params.assignedToEmail,
    userPhone: params.assignedToPhone,
  })
}

export async function notifyLicenseExpiring(params: {
  userId: string
  userEmail: string
  userPhone?: string
  clientId: string
  daysRemaining: number
}) {
  return sendNotification({
    userId: params.userId,
    clientId: params.clientId,
    type: "license_expiring",
    title: "Licença expirando em breve",
    message: `Sua licença expira em ${params.daysRemaining} dias. Renove agora para continuar usando o sistema.`,
    link: "/dashboard/settings/license",
    priority: params.daysRemaining <= 7 ? "urgent" : "high",
    category: "license",
    channels: ["in_app", "email", "whatsapp"],
    userEmail: params.userEmail,
    userPhone: params.userPhone,
  })
}

export async function notifyAnalysisComplete(params: {
  userId: string
  userEmail: string
  clientId: string
  analysisId: string
  repositoryName: string
  findingsCount: number
}) {
  return sendNotification({
    userId: params.userId,
    clientId: params.clientId,
    type: "analysis_complete",
    title: "Análise concluída",
    message: `A análise do repositório "${params.repositoryName}" foi concluída. ${params.findingsCount} ocorrências encontradas.`,
    link: `/analysis/${params.analysisId}`,
    priority: "normal",
    category: "analysis",
    channels: ["in_app", "email"],
    userEmail: params.userEmail,
  })
}

export async function notifyAchievementEarned(params: {
  userId: string
  userEmail: string
  clientId: string
  achievementName: string
  achievementPoints: number
}) {
  return sendNotification({
    userId: params.userId,
    clientId: params.clientId,
    type: "achievement_earned",
    title: "Nova conquista desbloqueada!",
    message: `Parabéns! Você ganhou a conquista "${params.achievementName}" e +${params.achievementPoints} pontos!`,
    link: "/dashboard/achievements",
    priority: "normal",
    category: "achievement",
    channels: ["in_app"],
    userEmail: params.userEmail,
  })
}
