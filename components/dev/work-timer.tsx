"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Play, Pause, Square, Clock, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WorkTimerProps {
  taskId: string
  taskTitle: string
  userId: string
  clientId?: string
  onTimeLogged?: (minutes: number) => void
}

export function WorkTimer({ taskId, taskTitle, userId, clientId, onTimeLogged }: WorkTimerProps) {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [todayTotal, setTodayTotal] = useState(0)

  // Load active timer on mount
  useEffect(() => {
    loadActiveTimer()
    loadTodayTotal()
  }, [taskId])

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused])

  const loadActiveTimer = async () => {
    try {
      const res = await fetch(`/api/dev/time-entries?task_id=${taskId}&status=running`)
      const data = await res.json()
      if (data.entry) {
        setActiveEntryId(data.entry.id)
        setIsRunning(true)
        const startTime = new Date(data.entry.started_at).getTime()
        const now = Date.now()
        setElapsedSeconds(Math.floor((now - startTime) / 1000))
      }
    } catch (error) {
      console.error("Error loading active timer:", error)
    }
  }

  const loadTodayTotal = async () => {
    try {
      const res = await fetch(`/api/dev/time-entries?task_id=${taskId}&today=true`)
      const data = await res.json()
      setTodayTotal(data.totalMinutes || 0)
    } catch (error) {
      console.error("Error loading today total:", error)
    }
  }

  const startTimer = async () => {
    try {
      const res = await fetch("/api/dev/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          user_id: userId,
          client_id: clientId,
        }),
      })
      const data = await res.json()
      if (data.entry) {
        setActiveEntryId(data.entry.id)
        setIsRunning(true)
        setIsPaused(false)
        setElapsedSeconds(0)
        toast({
          title: "Timer iniciado",
          description: `Cronometro iniciado para: ${taskTitle}`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao iniciar timer",
        description: "Nao foi possivel iniciar o cronometro",
        variant: "destructive",
      })
    }
  }

  const pauseTimer = () => {
    setIsPaused(!isPaused)
    toast({
      title: isPaused ? "Timer retomado" : "Timer pausado",
      description: isPaused ? "Cronometro retomado" : "Cronometro pausado",
    })
  }

  const stopTimer = async () => {
    if (!activeEntryId) return

    try {
      const res = await fetch(`/api/dev/time-entries/${activeEntryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          notes,
          duration_minutes: Math.ceil(elapsedSeconds / 60),
        }),
      })
      const data = await res.json()
      if (data.success) {
        const minutes = Math.ceil(elapsedSeconds / 60)
        toast({
          title: "Tempo registrado",
          description: `${formatTime(elapsedSeconds)} registrado para esta tarefa`,
        })
        onTimeLogged?.(minutes)
        setIsRunning(false)
        setIsPaused(false)
        setActiveEntryId(null)
        setElapsedSeconds(0)
        setNotes("")
        loadTodayTotal()
      }
    } catch (error) {
      toast({
        title: "Erro ao parar timer",
        description: "Nao foi possivel registrar o tempo",
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isRunning ? (isPaused ? "bg-yellow-100" : "bg-green-100 animate-pulse") : "bg-gray-100"}`}>
              <Timer className={`h-5 w-5 ${isRunning ? (isPaused ? "text-yellow-600" : "text-green-600") : "text-gray-500"}`} />
            </div>
            <div>
              <div className="text-2xl font-mono font-bold">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Hoje: {Math.floor(todayTotal / 60)}h {todayTotal % 60}m</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={startTimer} size="sm" className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
            ) : (
              <>
                <Button onClick={pauseTimer} size="sm" variant="outline">
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button onClick={stopTimer} size="sm" variant="destructive">
                  <Square className="h-4 w-4 mr-1" />
                  Parar
                </Button>
              </>
            )}
          </div>
        </div>

        {isRunning && (
          <div className="mt-3 pt-3 border-t">
            <Textarea
              placeholder="Notas sobre o trabalho realizado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
