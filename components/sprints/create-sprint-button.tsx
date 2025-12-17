"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreateSprintButtonProps {
  clientId: string
}

export function CreateSprintButton({ clientId }: CreateSprintButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      client_id: clientId,
      name: formData.get("name"),
      goal: formData.get("goal"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      velocity: Number.parseInt(formData.get("velocity") as string) || 0,
    }

    try {
      const response = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setOpen(false)
        window.location.reload()
      }
    } catch (error) {
      console.error("Error creating sprint:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Sprint</DialogTitle>
          <DialogDescription>Defina o nome, objetivo e duração da sprint</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Sprint *</Label>
            <Input id="name" name="name" placeholder="Ex: Sprint 1" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Objetivo da Sprint *</Label>
            <Textarea
              id="goal"
              name="goal"
              placeholder="Ex: Implementar funcionalidades de autenticação"
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input id="start_date" name="start_date" type="date" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término *</Label>
              <Input id="end_date" name="end_date" type="date" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="velocity">Velocity Planejado (Story Points)</Label>
            <Input id="velocity" name="velocity" type="number" min="0" placeholder="Ex: 40" defaultValue="0" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Sprint"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
