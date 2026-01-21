import { createClient } from "@/lib/supabase/server"

export type AuditAction = 
  | "create" 
  | "update" 
  | "delete" 
  | "analyze" 
  | "export" 
  | "export_work_items"
  | "login" 
  | "logout" 
  | "assign" 
  | "status_change" 
  | "settings_change"
  | "view"
  | "download"

export type AuditEntityType = 
  | "task" 
  | "repository" 
  | "user" 
  | "analysis" 
  | "settings" 
  | "integration"
  | "report"
  | "finding"

interface AuditLogParams {
  clientId: string
  userId?: string
  action: AuditAction
  entityType: AuditEntityType
  entityId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an action to the audit trail
 * Use this function in API routes and server actions to track user actions
 */
export async function logAudit({
  clientId,
  userId,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
  userAgent,
}: AuditLogParams): Promise<boolean> {
  try {
    const supabase = await createClient()

    await supabase.from("audit_logs").insert({
      client_id: clientId,
      user_id: userId || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || {},
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    })

    return true
  } catch (error) {
    console.error("Failed to log audit:", error)
    return false
  }
}

/**
 * Helper to extract IP and user agent from request headers
 */
export function getRequestInfo(request: Request): { ipAddress: string | null; userAgent: string | null } {
  const forwarded = request.headers.get("x-forwarded-for")
  const ipAddress = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip")
  const userAgent = request.headers.get("user-agent")
  
  return { ipAddress, userAgent }
}

/**
 * Pre-built audit functions for common actions
 */
export const audit = {
  taskCreated: (clientId: string, userId: string, taskId: string, taskTitle: string) =>
    logAudit({
      clientId,
      userId,
      action: "create",
      entityType: "task",
      entityId: taskId,
      details: { description: `Tarefa criada: ${taskTitle}` },
    }),

  taskUpdated: (clientId: string, userId: string, taskId: string, changes: Record<string, any>) =>
    logAudit({
      clientId,
      userId,
      action: "update",
      entityType: "task",
      entityId: taskId,
      details: { description: "Tarefa atualizada", changes },
    }),

  taskDeleted: (clientId: string, userId: string, taskId: string, taskTitle: string) =>
    logAudit({
      clientId,
      userId,
      action: "delete",
      entityType: "task",
      entityId: taskId,
      details: { description: `Tarefa excluida: ${taskTitle}` },
    }),

  taskAssigned: (clientId: string, userId: string, taskId: string, assigneeId: string, assigneeName: string) =>
    logAudit({
      clientId,
      userId,
      action: "assign",
      entityType: "task",
      entityId: taskId,
      details: { description: `Tarefa atribuida para ${assigneeName}`, assignee_id: assigneeId },
    }),

  taskStatusChanged: (clientId: string, userId: string, taskId: string, fromStatus: string, toStatus: string) =>
    logAudit({
      clientId,
      userId,
      action: "status_change",
      entityType: "task",
      entityId: taskId,
      details: { description: `Status alterado de ${fromStatus} para ${toStatus}`, from: fromStatus, to: toStatus },
    }),

  analysisStarted: (clientId: string, userId: string, repoIds: string[], repoNames: string[]) =>
    logAudit({
      clientId,
      userId,
      action: "analyze",
      entityType: "analysis",
      entityId: repoIds.join(","),
      details: { description: `Analise iniciada em ${repoNames.length} repositorio(s)`, repositories: repoNames },
    }),

  analysisCompleted: (clientId: string, userId: string, batchId: string, totalFindings: number) =>
    logAudit({
      clientId,
      userId,
      action: "analyze",
      entityType: "analysis",
      entityId: batchId,
      details: { description: `Analise concluida: ${totalFindings} findings encontrados`, total_findings: totalFindings },
    }),

  workItemsExported: (clientId: string, userId: string, taskIds: string[], platform: string, success: number, failed: number) =>
    logAudit({
      clientId,
      userId,
      action: "export_work_items",
      entityType: "task",
      entityId: taskIds.join(","),
      details: { 
        description: `${success} tarefas exportadas para ${platform}`,
        platform,
        total: taskIds.length,
        success,
        failed,
      },
    }),

  settingsChanged: (clientId: string, userId: string, settingType: string, changes: Record<string, any>) =>
    logAudit({
      clientId,
      userId,
      action: "settings_change",
      entityType: "settings",
      details: { description: `Configuracoes alteradas: ${settingType}`, setting_type: settingType, changes },
    }),

  userLogin: (clientId: string, userId: string, userEmail: string, ipAddress?: string) =>
    logAudit({
      clientId,
      userId,
      action: "login",
      entityType: "user",
      entityId: userId,
      details: { description: `Usuario logou: ${userEmail}` },
      ipAddress,
    }),

  userLogout: (clientId: string, userId: string, userEmail: string) =>
    logAudit({
      clientId,
      userId,
      action: "logout",
      entityType: "user",
      entityId: userId,
      details: { description: `Usuario deslogou: ${userEmail}` },
    }),

  integrationAdded: (clientId: string, userId: string, provider: string, accountName: string) =>
    logAudit({
      clientId,
      userId,
      action: "create",
      entityType: "integration",
      details: { description: `Integracao adicionada: ${provider} - ${accountName}`, provider, account_name: accountName },
    }),

  integrationRemoved: (clientId: string, userId: string, provider: string, accountName: string) =>
    logAudit({
      clientId,
      userId,
      action: "delete",
      entityType: "integration",
      details: { description: `Integracao removida: ${provider} - ${accountName}`, provider, account_name: accountName },
    }),

  reportGenerated: (clientId: string, userId: string, reportType: string, format: string) =>
    logAudit({
      clientId,
      userId,
      action: "export",
      entityType: "report",
      details: { description: `Relatorio gerado: ${reportType} em ${format}`, report_type: reportType, format },
    }),
}
