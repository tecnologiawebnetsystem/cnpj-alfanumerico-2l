"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Github, Gitlab, Cloud } from 'lucide-react'

interface Account {
  id: string
  provider: string
  account_name: string
  organization?: string
}

interface AccountSelectorProps {
  value?: string
  onChange: (accountId: string) => void
  provider?: string
}

export function AccountSelector({
  value,
  onChange,
  provider,
}: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccounts()
  }, [])

  async function loadAccounts() {
    try {
      const response = await fetch("/api/accounts")
      if (response.ok) {
        const data = await response.json()
        let filteredAccounts = data.accounts || []

        if (provider) {
          filteredAccounts = filteredAccounts.filter(
            (acc: Account) => acc.provider === provider
          )
        }

        setAccounts(filteredAccounts)

        if (filteredAccounts.length > 0 && !value) {
          onChange(filteredAccounts[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <Github className="h-4 w-4" />
      case "gitlab":
        return <Gitlab className="h-4 w-4" />
      case "azure":
        return <Cloud className="h-4 w-4" />
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

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando contas...</div>
  }

  if (accounts.length === 0) {
    return (
      <div className="p-4 border border-dashed rounded-lg text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Nenhuma conta conectada
        </p>
        <a
          href="/integrations"
          className="text-sm text-primary hover:underline"
        >
          Adicionar conta
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Conta para Análise</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma conta" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-2">
                {getProviderIcon(account.provider)}
                <span>{account.account_name}</span>
                <Badge variant="outline" className="text-xs">
                  {getProviderName(account.provider)}
                </Badge>
                {account.organization && (
                  <span className="text-xs text-muted-foreground">
                    ({account.organization})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
