"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Loader2 } from "lucide-react"

interface Dev {
  id: string
  name: string
  email: string
}

interface RepositoryAssignmentModalProps {
  open: boolean
  onClose: () => void
  repositoryId: string
  repositoryName: string
  clientId: string
  userId: string
  onSuccess?: () => void
}

export function RepositoryAssignmentModal({
  open,
  onClose,
  repositoryId,
  repositoryName,
  clientId,
  userId,
  onSuccess,
}: RepositoryAssignmentModalProps) {
  const { toast } = useToast()
  const [devs, setDevs] = useState<Dev[]>([])
  const [selectedDev, setSelectedDev] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingDevs, setLoadingDevs] = useState(true)

  useEffect(() => {
    if (open) {
      fetchDevs()
    }
  }, [open, clientId])

  const fetchDevs = async () => {
    try {
      setLoadingDevs(true)
      const response = await fetch(`/api/client/devs?client_id=${clientId}&user_id=${userId}`)
      const data = await response.json()
      setDevs(data.filter((d: any) => d.status === "active"))
    } catch (error) {
      console.error("Error fetching devs:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar desenvolvedores",
        variant: "destructive",
      })
    } finally {
      setLoadingDevs(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedDev) {
      toast({
        title: "Atenção",
        description: "Selecione um desenvolvedor",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/repositories/${repositoryId}/assign-developer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developer_id: selectedDev,
          notes,
          user_id: userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atribuir desenvolvedor")
      }

      toast({
        title: "Sucesso",
        description: data.message,
      })

      onSuccess?.()
      handleClose()
    } catch (error: any) {
      console.error("Error assigning developer:", error)
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedDev("")
    setNotes("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Atribuir Desenvolvedor ao Repositório
          </DialogTitle>
          <DialogDescription>
            Repositório: <span className="font-semibold">{repositoryName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="developer">Desenvolvedor *</Label>
            {loadingDevs ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <Select value={selectedDev} onValueChange={setSelectedDev}>
                <SelectTrigger id="developer">
                  <SelectValue placeholder="Selecione um desenvolvedor" />
                </SelectTrigger>
                <SelectContent>
                  {devs.map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.name} ({dev.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Responsável pela migração do CNPJ neste repositório..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedDev}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Atribuir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
