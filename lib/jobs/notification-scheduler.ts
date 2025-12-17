// Background job to check and send scheduled notifications
import { createClient } from "@/lib/supabase/server"
import { notifyLicenseExpiring } from "@/lib/services/notification-service"
import { sendNotification } from "@/lib/services/notification-service" // Declared the variable here

export async function checkLicenseExpirations() {
  const supabase = await createClient()

  // Get clients with licenses expiring in 30, 14, 7, 3, and 1 days
  const warningDays = [30, 14, 7, 3, 1]

  for (const days of warningDays) {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + days)
    const targetDateStr = targetDate.toISOString().split("T")[0]

    const { data: clients, error } = await supabase
      .from("clients")
      .select(`
        id,
        license_end,
        users!inner (
          id,
          email,
          phone,
          role
        )
      `)
      .eq("license_active", true)
      .eq("license_end", targetDateStr)

    if (error) {
      console.error("[v0] Error fetching expiring licenses:", error)
      continue
    }

    // Notify admins of each client
    for (const client of clients || []) {
      const admins = client.users.filter((u: any) => u.role === "admin" || u.role === "super_admin")

      for (const admin of admins) {
        await notifyLicenseExpiring({
          userId: admin.id,
          userEmail: admin.email,
          userPhone: admin.phone,
          clientId: client.id,
          daysRemaining: days,
        })
      }
    }
  }
}

export async function checkOverdueTasks() {
  const supabase = await createClient()

  const now = new Date().toISOString()

  // Get overdue tasks
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(`
      id,
      title,
      deadline,
      client_id,
      assigned_to,
      users!tasks_assigned_to_fkey (
        id,
        email,
        phone,
        name
      )
    `)
    .lt("deadline", now)
    .neq("status", "completed")
    .is("notified_overdue", null)

  if (error) {
    console.error("[v0] Error fetching overdue tasks:", error)
    return
  }

  // Send notifications
  for (const task of tasks || []) {
    if (task.users) {
      await sendNotification({
        userId: task.users.id,
        clientId: task.client_id,
        type: "task_assigned",
        title: "Tarefa atrasada",
        message: `A tarefa "${task.title}" está atrasada`,
        link: `/dashboard/tasks?id=${task.id}`,
        priority: "high",
        category: "task",
        channels: ["in_app", "email"],
        userEmail: task.users.email,
        userPhone: task.users.phone,
      })

      // Mark as notified
      await supabase.from("tasks").update({ notified_overdue: true }).eq("id", task.id)
    }
  }
}
