"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Cloud, Plus } from 'lucide-react'

interface AzureAccount {
  organization: string
  projects: {
    id: string
    name: string
    is_active: boolean
    last_used: string | null
  }[]
}

interface AzureAccountSelectorProps {
  repositoryId?: string
  currentAccountId?: string | null
  onAccountChange?: (accountId: string) => void
  showAddButton?: boolean
}

export function AzureAccountSelector({ 
  repositoryId,
  currentAccountId,
  onAccountChange,
  showAddButton = true
}: AzureAccountSelectorProps) {
  const [accounts, setAccounts] = useState<AzureAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(currentAccountId || null)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const response = await fetch("/api/integrations/azure-accounts")
      const data = await response.json()
      
      if (response.ok) {
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error("[v0] Error loading Azure accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId)
    onAccountChange?.(accountId)
  }

  // Flatten accounts for select
  const allProjects = accounts.flatMap(acc => 
    acc.projects.map(proj => ({
      id: proj.id,
      label: `${acc.organization} / ${proj.name}`,
      organization: acc.organization,
      project: proj.name,
      isActive: proj.is_active
    }))
  )

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Cloud className="h-4 w-4 animate-spin" />
        Carregando contas Azure DevOps...
      </div>
    )
  }

  if (allProjects.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">Nenhuma conta Azure configurada</Badge>
        {showAddButton && (
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Conta
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedAccountId || undefined} onValueChange={handleAccountChange}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Selecione Organização / Projeto" />
        </SelectTrigger>
        <SelectContent>
          {allProjects.map(proj => (
            <SelectItem key={proj.id} value={proj.id}>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span>{proj.label}</span>
                {!proj.isActive && (
                  <Badge variant="secondary" className="ml-2">Inativa</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showAddButton && (
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      )}
    </div>
  )
}
