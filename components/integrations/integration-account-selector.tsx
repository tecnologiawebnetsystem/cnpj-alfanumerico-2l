"use client"

import React, { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Cloud, Github } from 'lucide-react'

interface Integration {
  id: string
  name: string
  organization?: string
  project?: string
  integration_providers: {
    display_name: string
    name: string
  }
}

interface IntegrationAccountSelectorProps {
  value?: string
  onChange: (integrationId: string) => void
  providerFilter?: string
  label?: string
  placeholder?: string
}

export function IntegrationAccountSelector({
  value,
  onChange,
  providerFilter,
  label = "Conta de Integração",
  placeholder = "Selecione uma conta",
}: IntegrationAccountSelectorProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await fetch("/api/integrations/accounts")
      if (response.ok) {
        const data = await response.json()
        let filtered = data.integrations || []
        
        if (providerFilter) {
          filtered = filtered.filter(
            (i: Integration) => i.integration_providers.name === providerFilter
          )
        }
        
        setIntegrations(filtered)
      }
    } catch (error) {
      console.error("[v0] Error loading integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (providerName: string) => {
    if (providerName.includes("github")) return <Github className="h-4 w-4 mr-2" />
    if (providerName.includes("azure")) return <Cloud className="h-4 w-4 mr-2" />
    return <Cloud className="h-4 w-4 mr-2" />
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-10 bg-muted rounded-md animate-pulse" />
      </div>
    )
  }

  if (integrations.length === 0) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
          Nenhuma conta configurada. Adicione uma conta nas configurações.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {integrations.map((integration) => (
            <SelectItem key={integration.id} value={integration.id}>
              <div className="flex items-center gap-2">
                {getIcon(integration.integration_providers.name)}
                <div className="flex flex-col">
                  <span>{integration.name}</span>
                  {integration.organization && integration.project && (
                    <span className="text-xs text-muted-foreground">
                      {integration.organization} / {integration.project}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
