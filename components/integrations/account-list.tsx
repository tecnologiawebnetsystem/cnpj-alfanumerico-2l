"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Gitlab, Cloud, Edit2, Trash2, CheckCircle2 } from 'lucide-react'

interface Account {
  id: string
  provider: string
  account_name: string
  organization?: string
  created_at: string
  updated_at: string
}

interface AccountListProps {
  accounts: Account[]
  onUpdate: () => void
}

export function AccountList({ accounts, onUpdate }: AccountListProps) {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setNewName(account.account_name)
  }

  const handleSave = async () => {
    if (!editingAccount) return

    setSaving(true)
    try {
      const response = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_name: newName }),
      })

      if (response.ok) {
        setEditingAccount(null)
        onUpdate()
      }
    } catch (error) {
      console.error("Error updating account:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm("Tem certeza que deseja remover esta conta?")) return

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <Github className="h-5 w-5 text-primary" />
      case "gitlab":
        return <Gitlab className="h-5 w-5 text-orange-600" />
      case "azure":
        return <Cloud className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "github":
        return "GitHub"
      case "gitlab":
        return "GitLab"
      case "azure":
        return "Azure DevOps"
      default:
        return provider
    }
  }

  if (accounts.length === 0) {
    return null
  }

  return (
    <>
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-primary/10">
                {getProviderIcon(account.provider)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{account.account_name}</p>
                  <Badge variant="outline" className="text-xs">
                    {getProviderName(account.provider)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Conectado
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {account.organization && `Organização: ${account.organization} • `}
                  Adicionado em {new Date(account.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(account)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(account.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editingAccount !== null}
        onOpenChange={(open) => !open && setEditingAccount(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nome da Conta</DialogTitle>
            <DialogDescription>
              Altere o nome descritivo desta conta para facilitar a identificação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conta</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Minha Conta Pessoal"
                disabled={saving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingAccount(null)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !newName.trim()}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
