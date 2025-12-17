"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, Trash2, Download, Pause, Play } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

interface LogEntry {
  timestamp: string
  level: "info" | "success" | "warning" | "error"
  message: string
  worker_id?: string
}

export default function WorkerLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(fetchLogs, 2000)
      return () => clearInterval(interval)
    }
  }, [isPaused])

  const fetchLogs = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data } = await supabase
        .from("worker_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100)

      if (data) {
        setLogs(data)
        scrollToBottom()
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const downloadLogs = () => {
    const logText = logs.map((log) => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`).join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `worker-logs-${new Date().toISOString()}.txt`
    a.click()
  }

  const getLevelColor = (level: string) => {
    const colors = {
      info: "bg-blue-100 text-blue-700 border-blue-200",
      success: "bg-green-100 text-green-700 border-green-200",
      warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
      error: "bg-red-100 text-red-700 border-red-200",
    }
    return colors[level as keyof typeof colors] || colors.info
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Logs do Worker</h1>
            <p className="text-slate-600 mt-1">Monitoramento em tempo real das operações</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {isPaused ? "Retomar" : "Pausar"}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadLogs}>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Console em Tempo Real
            </CardTitle>
            <CardDescription>
              {logs.length} entradas • Atualiza a cada 2 segundos {isPaused && "(Pausado)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea ref={scrollRef} className="h-[600px] w-full rounded-md border bg-slate-950 p-4">
              <div className="space-y-2 font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-slate-400 text-center py-8">
                    Nenhum log ainda... Inicie um worker para ver logs aqui.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-slate-100">
                      <span className="text-slate-500 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                      </span>
                      <Badge variant="outline" className={`${getLevelColor(log.level)} text-xs`}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
