import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    console.log(' ========== FETCHING DEVELOPER METRICS ==========')
    
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error(' Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(' Fetching metrics for user:', user.id)

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('client_id')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error(' Error fetching user data:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const clientId = userData.client_id

    // Get all tasks assigned to this developer
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('client_id', clientId)
      .eq('assigned_to', user.id)

    if (tasksError) {
      console.error(' Error fetching tasks:', tasksError)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    console.log(' Fetched tasks:', tasks?.length || 0)

    const total_tasks = tasks?.length || 0
    const completed_tasks = tasks?.filter(t => t.status === 'concluido').length || 0
    const in_progress_tasks = tasks?.filter(t => t.status === 'em_progresso').length || 0
    const pending_tasks = tasks?.filter(t => t.status === 'pendente').length || 0

    // Calculate overdue tasks
    const now = new Date()
    const overdue_tasks = tasks?.filter(t => {
      if (t.status === 'concluido') return false
      if (!t.due_date) return false
      return new Date(t.due_date) < now
    }).length || 0

    // Calculate completion rate
    const completion_rate = total_tasks > 0 
      ? Math.round((completed_tasks / total_tasks) * 100)
      : 0

    // Calculate average completion time
    const completedWithTime = tasks?.filter(t => 
      t.status === 'concluido' && t.completed_at && t.created_at
    ) || []
    
    let avg_completion_time_hours = 0
    if (completedWithTime.length > 0) {
      const totalHours = completedWithTime.reduce((sum, task) => {
        const start = new Date(task.created_at).getTime()
        const end = new Date(task.completed_at).getTime()
        const hours = (end - start) / (1000 * 60 * 60)
        return sum + hours
      }, 0)
      avg_completion_time_hours = totalHours / completedWithTime.length
    }

    // Tasks this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const tasks_this_week = tasks?.filter(t => 
      new Date(t.created_at) >= oneWeekAgo
    ).length || 0

    // Tasks this month
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const tasks_this_month = tasks?.filter(t => 
      new Date(t.created_at) >= oneMonthAgo
    ).length || 0

    // Count PRs
    const prs_created = tasks?.filter(t => t.pr_url).length || 0
    const prs_merged = tasks?.filter(t => t.pr_status === 'merged').length || 0

    const metrics = {
      total_tasks,
      completed_tasks,
      in_progress_tasks,
      pending_tasks,
      overdue_tasks,
      completion_rate,
      avg_completion_time_hours,
      tasks_this_week,
      tasks_this_month,
      prs_created,
      prs_merged
    }

    console.log(' Metrics calculated:', metrics)
    console.log(' ========== DEVELOPER METRICS COMPLETE ==========')

    return NextResponse.json(metrics)
  } catch (error) {
    console.error(' ========== ERROR IN DEVELOPER METRICS ==========')
    console.error(' Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
