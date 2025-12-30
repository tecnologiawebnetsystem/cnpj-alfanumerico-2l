"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState<any>({ todo: [], in_progress: [], done: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    const res = await fetch("/api/dev/kanban-tasks")
    const data = await res.json()
    setTasks(data.tasks || { todo: [], in_progress: [], done: [] })
    setLoading(false)
  }

  async function handleDragEnd(result: any) {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId) return

    const newStatus = destination.droppableId

    // Update UI optimistically
    const taskToMove = tasks[source.droppableId].find((t: any) => t.id === draggableId)
    const newTasks = { ...tasks }
    newTasks[source.droppableId] = newTasks[source.droppableId].filter((t: any) => t.id !== draggableId)
    newTasks[newStatus] = [...newTasks[newStatus], { ...taskToMove, status: newStatus }]
    setTasks(newTasks)

    // Update backend
    await fetch("/api/dev/kanban-tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: draggableId, status: newStatus }),
    })
  }

  const columns = [
    { id: "todo", title: "A Fazer", color: "bg-gray-100" },
    { id: "in_progress", title: "Em Progresso", color: "bg-blue-100" },
    { id: "done", title: "Concluído", color: "bg-green-100" },
  ]

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Board de Tarefas</h1>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {columns.map((column) => (
            <div key={column.id}>
              <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                {column.title}
                <Badge variant="secondary">{tasks[column.id]?.length || 0}</Badge>
              </h2>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${column.color} rounded-lg p-4 min-h-[500px] space-y-2`}
                  >
                    {tasks[column.id]?.map((task: any, index: number) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-4 bg-white shadow hover:shadow-md transition-shadow cursor-move"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-sm">{task.title}</h3>
                              <Badge
                                variant={
                                  task.severity === "critical"
                                    ? "destructive"
                                    : task.severity === "high"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {task.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                            {task.file_path && (
                              <p className="text-xs font-mono bg-gray-100 p-1 rounded">
                                {task.file_path}:{task.line_number}
                              </p>
                            )}
                            {task.ai_solution && (
                              <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                                <strong>Solução IA:</strong> {task.ai_solution}
                              </div>
                            )}
                            <div className="mt-2 text-xs text-muted-foreground">{task.assignment?.repository_name}</div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
