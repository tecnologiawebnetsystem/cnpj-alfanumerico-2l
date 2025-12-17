"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { HardDrive, WifiOff, Loader2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function WorkerStatusIndicator() {
  const [workerStatus, setWorkerStatus] = useState<"online" | "offline" | "loading">("loading")
  const [workerId, setWorkerId] = useState<string>("")
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  useEffect(() => {
    checkWorkerStatus()
    const interval = setInterval(checkWorkerStatus, 5000) // Check every 5s for faster updates
    return () => clearInterval(interval)
  }, [])

  const checkWorkerStatus = async () => {
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from("workers")
        .select("worker_id, last_heartbeat, status")
        .eq("status", "active")
        .gte("last_heartbeat", new Date(Date.now() - 60000).toISOString())
        .order("last_heartbeat", { ascending: false })
        .limit(1)
        .maybeSingle()

      setLastCheck(new Date())

      if (error) {
        console.error("[v0] Worker status check error:", error)
        setWorkerStatus("offline")
        return
      }

      if (data && data.worker_id) {
        setWorkerStatus("online")
        setWorkerId(data.worker_id)
      } else {
        setWorkerStatus("offline")
        setWorkerId("")
      }
    } catch (error) {
      console.error("[v0] Worker status check exception:", error)
      setWorkerStatus("offline")
    }
  }

  if (workerStatus === "loading") {
    return (
      <Badge variant="outline" className="gap-1.5 bg-gray-50 text-gray-600 border-gray-300 text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        Verificando...
      </Badge>
    )
  }

  if (workerStatus === "offline") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/worker/status">
              <Badge
                variant="outline"
                className="gap-1.5 bg-yellow-50 text-yellow-700 border-yellow-400 text-xs hover:bg-yellow-100 cursor-pointer transition-all hover:scale-105 font-medium"
              >
                <WifiOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Worker Offline</span>
                <span className="sm:hidden">Offline</span>
              </Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Worker Local não está rodando</p>
            <p className="text-xs text-muted-foreground">Clique para ver instruções de instalação</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/worker/status">
            <Badge
              variant="outline"
              className="gap-1.5 bg-green-50 text-green-700 border-green-400 text-xs hover:bg-green-100 cursor-pointer transition-all hover:scale-105 font-medium animate-pulse"
            >
              <HardDrive className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Worker Online</span>
              <span className="sm:hidden">Online</span>
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Worker Local está ativo</p>
          <p className="text-xs text-muted-foreground">ID: {workerId}</p>
          <p className="text-xs text-muted-foreground">Última verificação: {lastCheck.toLocaleTimeString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
