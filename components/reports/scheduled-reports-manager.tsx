"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, Trash2, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScheduledReportsManagerProps {
  clientId: string
}

export function ScheduledReportsManager({ clientId }: ScheduledReportsManagerProps) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    schedule_type: "weekly",
    email: "",
    format: "pdf",
    is_active: true,
  })

  useEffect(() => {
    loadSchedules()
  }, [clientId])

  const loadSchedules = async () => {
    try {
      const response = await fetch(`/api/reports/scheduled?client_id=${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules || [])
      }
    } catch (error) {
      console.error(" Error loading schedules:", error)
    }
  }

  const createSchedule = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/scheduled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, client_id: clientId }),
      })

      if (response.ok) {
        toast({
          title: "Agendamento criado",
          description: "Relatório agendado com sucesso",
        })
        setShowForm(false)
        loadSchedules()
      }
    } catch (error) {
      console.error(" Error creating schedule:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteSchedule = async (id: string) => {
    if (!confirm("Deseja realmente excluir este agendamento?")) return

    try {
      const response = await fetch(`/api/reports/scheduled/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({
          title: "Agendamento excluído",
          description: "Relatório removido com sucesso",
        })
        loadSchedules()
      }
    } catch (error) {
      console.error(" Error deleting schedule:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relatórios Agendados</CardTitle>
              <CardDescription>Configure relatórios automáticos por email</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="space-y-4 p-4 border rounded-lg mb-4">
              <div>
                <Label>Nome do Relatório</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Relatório Semanal"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Frequência</Label>
                  <Select
                    value={formData.schedule_type}
                    onValueChange={(v) => setFormData({ ...formData, schedule_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Formato</Label>
                  <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="zip">ZIP (todos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Email para Envio</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seuemail@exemplo.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Ativo</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={createSchedule} disabled={loading}>
                  {loading ? "Criando..." : "Criar Agendamento"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {schedules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">Nenhum relatório agendado ainda</div>
            )}

            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{schedule.name}</span>
                    <Badge variant={schedule.is_active ? "default" : "secondary"}>
                      {schedule.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3 inline mr-1" />
                    {schedule.email} • {schedule.schedule_type} • {schedule.format.toUpperCase()}
                  </div>
                  {schedule.next_run_at && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Próximo envio: {new Date(schedule.next_run_at).toLocaleString()}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteSchedule(schedule.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
