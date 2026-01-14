import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { batchId: string } }) {
  try {
    const supabase = await createClient()

    const { batchId } = params

    console.log(" Progress API - batchId:", batchId)

    const { data: taskProgress, error: tasksError } = await supabase.from("task_progress").select(`
        status,
        task_id,
        tasks!task_progress_task_id_fkey(
          id,
          analysis_id,
          analyses!tasks_analysis_id_fkey(
            id,
            batch_id
          )
        )
      `)

    if (tasksError) {
      console.error(" Error fetching task progress:", tasksError)
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    console.log(" Raw task progress data:", taskProgress?.length)

    const batchTasks =
      taskProgress?.filter((tp: any) => {
        return tp.tasks?.analyses?.batch_id === batchId
      }) || []

    console.log(" Filtered batch tasks:", batchTasks.length)

    const distribution = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      total: batchTasks.length,
    }

    batchTasks.forEach((task: any) => {
      if (task.status === "pending") distribution.pending++
      else if (task.status === "in_progress") distribution.in_progress++
      else if (task.status === "completed") distribution.completed++
    })

    console.log(" Distribution calculated:", distribution)

    return NextResponse.json({ distribution })
  } catch (error) {
    console.error(" Internal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
