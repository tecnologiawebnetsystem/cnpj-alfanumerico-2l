"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileCode, 
  GitBranch,
  Settings,
  X,
  Mail,
  Loader2,
  RefreshCw,
  BellRing,
  AlertCircle,
  Info
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Alert {
  id: string
  type: "critical" | "warning" | "info" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
  data?: any
}

interface AlertSettings {
  analysisComplete: boolean
  taskOverdue: boolean
  criticalFinding: boolean
  weeklyReport: boolean
  emailNotifications: boolean
}

interface AlertsPanelProps {
  clientId: string
  userId?: string
}

const ALERT_ICONS = {
  critical: AlertTriangle,
  warning: Clock,
  info: Info,
  success: CheckCircle2
}

const ALERT_COLORS = {
  critical: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-green-50 border-green-200 text-green-800"
}

export function AlertsPanel({ clientId, userId }: AlertsPanelProps) {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<AlertSettings>({
    analysisComplete: true,
    taskOverdue: true,
    criticalFinding: true,
    weeklyReport: false,
    emailNotifications: false
  })
  const [savingSettings, setSavingSettings] = useState(false)

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin-client/alerts?client_id=${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        })))
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/admin-client/alert-settings?client_id=${clientId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  useEffect(() => {
    fetchAlerts()
    fetchSettings()
    // Auto-refresh every minute
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [clientId])

  const markAsRead = async (alertId: string) => {
    try {
      await fetch(`/api/admin-client/alerts/${alertId}/read`, {
        method: "POST"
      })
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, read: true } : a
      ))
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/admin-client/alerts/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId })
      })
      setAlerts(prev => prev.map(a => ({ ...a, read: true })))
      toast({
        title: "Alertas marcados como lidos",
        description: "Todos os alertas foram marcados como lidos"
      })
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      await fetch(`/api/admin-client/alert-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, settings })
      })
      toast({
        title: "Configuracoes salvas",
        description: "Suas preferencias de notificacao foram atualizadas"
      })
      setSettingsOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Nao foi possivel salvar as configuracoes",
        variant: "destructive"
      })
    } finally {
      setSavingSettings(false)
    }
  }

  const unreadCount = alerts.filter(a => !a.read).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#0052CC]" />
            <CardTitle>Alertas e Notificacoes</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} {unreadCount === 1 ? "novo" : "novos"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchAlerts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configuracoes de Notificacao</DialogTitle>
                  <DialogDescription>
                    Configure quais alertas voce deseja receber
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analise Concluida</p>
                      <p className="text-sm text-muted-foreground">Notificar quando uma analise terminar</p>
                    </div>
                    <Switch 
                      checked={settings.analysisComplete}
                      onCheckedChange={(v) => setSettings({...settings, analysisComplete: v})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tarefa Atrasada</p>
                      <p className="text-sm text-muted-foreground">Alertar sobre tarefas proximas do prazo</p>
                    </div>
                    <Switch 
                      checked={settings.taskOverdue}
                      onCheckedChange={(v) => setSettings({...settings, taskOverdue: v})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Finding Critico</p>
                      <p className="text-sm text-muted-foreground">Notificar findings de alta prioridade</p>
                    </div>
                    <Switch 
                      checked={settings.criticalFinding}
                      onCheckedChange={(v) => setSettings({...settings, criticalFinding: v})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Relatorio Semanal</p>
                      <p className="text-sm text-muted-foreground">Receber resumo semanal por email</p>
                    </div>
                    <Switch 
                      checked={settings.weeklyReport}
                      onCheckedChange={(v) => setSettings({...settings, weeklyReport: v})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Notificacoes por Email</p>
                        <p className="text-sm text-muted-foreground">Enviar copia por email</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.emailNotifications}
                      onCheckedChange={(v) => setSettings({...settings, emailNotifications: v})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveSettings} disabled={savingSettings}>
                    {savingSettings && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={markAllAsRead}>
            Marcar todos como lidos
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellRing className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum alerta no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const Icon = ALERT_ICONS[alert.type]
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${ALERT_COLORS[alert.type]} ${
                      !alert.read ? "ring-2 ring-offset-2 ring-blue-500/20" : "opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs mt-1 opacity-90">{alert.message}</p>
                          <p className="text-xs mt-2 opacity-60">
                            {alert.timestamp.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      {!alert.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => markAsRead(alert.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
