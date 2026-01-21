"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Focus, Play, Pause, RotateCcw, Coffee, Timer, X, CheckCircle2 } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  priority?: string
  estimated_hours?: number
}

interface FocusModeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onComplete?: () => void
}

const POMODORO_WORK = 25 * 60 // 25 minutes in seconds
const POMODORO_BREAK = 5 * 60 // 5 minutes in seconds
const POMODORO_LONG_BREAK = 15 * 60 // 15 minutes in seconds

export function FocusMode({ open, onOpenChange, task, onComplete }: FocusModeProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(POMODORO_WORK)
  const [mode, setMode] = useState<"work" | "break" | "long_break">("work")
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [totalWorkTime, setTotalWorkTime] = useState(0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getMaxTime = () => {
    switch (mode) {
      case "work": return POMODORO_WORK
      case "break": return POMODORO_BREAK
      case "long_break": return POMODORO_LONG_BREAK
    }
  }

  const progress = ((getMaxTime() - timeLeft) / getMaxTime()) * 100

  const handleComplete = useCallback(() => {
    if (mode === "work") {
      setCompletedPomodoros((p) => p + 1)
      setTotalWorkTime((t) => t + POMODORO_WORK)
      
      // After 4 pomodoros, take a long break
      if ((completedPomodoros + 1) % 4 === 0) {
        setMode("long_break")
        setTimeLeft(POMODORO_LONG_BREAK)
      } else {
        setMode("break")
        setTimeLeft(POMODORO_BREAK)
      }
    } else {
      setMode("work")
      setTimeLeft(POMODORO_WORK)
    }
    setIsRunning(false)

    // Play notification sound
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(mode === "work" ? "Pomodoro Concluido!" : "Pausa Terminada!", {
        body: mode === "work" ? "Hora de fazer uma pausa" : "Hora de voltar ao trabalho",
        icon: "/favicon.ico"
      })
    }
  }, [mode, completedPomodoros])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleComplete()
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, handleComplete])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const reset = () => {
    setIsRunning(false)
    setMode("work")
    setTimeLeft(POMODORO_WORK)
  }

  const getModeInfo = () => {
    switch (mode) {
      case "work":
        return { label: "Foco", color: "text-blue-600", bg: "bg-blue-100", icon: Focus }
      case "break":
        return { label: "Pausa", color: "text-green-600", bg: "bg-green-100", icon: Coffee }
      case "long_break":
        return { label: "Pausa Longa", color: "text-purple-600", bg: "bg-purple-100", icon: Coffee }
    }
  }

  const modeInfo = getModeInfo()
  const ModeIcon = modeInfo.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Focus className="h-5 w-5 text-blue-600" />
            Modo Foco - Pomodoro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Info */}
          {task && (
            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  {task.priority && (
                    <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                      {task.priority}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${modeInfo.bg}`}>
              <ModeIcon className={`h-5 w-5 ${modeInfo.color}`} />
              <span className={`font-medium ${modeInfo.color}`}>{modeInfo.label}</span>
            </div>

            <div className="text-7xl font-mono font-bold tracking-tight">
              {formatTime(timeLeft)}
            </div>

            <Progress value={progress} className="h-2" />

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={reset}
                disabled={isRunning}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                className="w-32"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">{completedPomodoros}</div>
              <div className="text-xs text-muted-foreground">Pomodoros</div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(totalWorkTime / 60)}
              </div>
              <div className="text-xs text-muted-foreground">Minutos Focados</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="text-2xl font-bold text-purple-600">
                {4 - (completedPomodoros % 4)}
              </div>
              <div className="text-xs text-muted-foreground">Ate Pausa Longa</div>
            </div>
          </div>

          {/* Mark Complete Button */}
          {task && onComplete && (
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={onComplete}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marcar Tarefa como Concluida
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
