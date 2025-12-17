"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Copy, Eye, EyeOff, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ApiKeysSection() {
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  // Mock data - will be replaced with real data from Supabase
  const apiKeys = [
    {
      id: "1",
      key_name: "Production Key",
      api_key: "wns_abc123def456ghi789jkl012mno345pq",
      is_active: true,
      rate_limit: 1000,
      last_used_at: "2025-01-27T10:30:00Z",
      created_at: "2025-01-15T08:00:00Z",
    },
    {
      id: "2",
      key_name: "Development Key",
      api_key: "wns_xyz789uvw456rst123opq890lmn567ab",
      is_active: true,
      rate_limit: 100,
      last_used_at: "2025-01-27T09:15:00Z",
      created_at: "2025-01-20T14:30:00Z",
    },
  ]

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(keyId)) {
        newSet.delete(keyId)
      } else {
        newSet.add(keyId)
      }
      return newSet
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 8)}${"*".repeat(24)}${key.substring(key.length - 4)}`
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-sm text-muted-foreground">Gerencie suas chaves de acesso à API</p>
        </div>
        <Button onClick={() => setShowNewKeyDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova API Key
        </Button>
      </div>

      {showNewKeyDialog && (
        <Card className="p-4 mb-6 bg-muted/50">
          <h3 className="font-semibold mb-4">Criar Nova API Key</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="keyName">Nome da Key</Label>
              <Input id="keyName" placeholder="Ex: Production Key" />
            </div>
            <div>
              <Label htmlFor="rateLimit">Rate Limit (requisições/hora)</Label>
              <Input id="rateLimit" type="number" defaultValue="100" />
            </div>
            <div className="flex gap-2">
              <Button>Criar Key</Button>
              <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {apiKeys.map((key) => (
          <Card key={key.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{key.key_name}</h3>
                  <Badge variant={key.is_active ? "default" : "secondary"}>{key.is_active ? "Ativa" : "Inativa"}</Badge>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                    {visibleKeys.has(key.id) ? key.api_key : maskApiKey(key.api_key)}
                  </code>
                  <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(key.id)}>
                    {visibleKeys.has(key.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(key.api_key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Rate Limit: {key.rate_limit}/hora</span>
                  <span>Último uso: {new Date(key.last_used_at).toLocaleString("pt-BR")}</span>
                  <span>Criada em: {new Date(key.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
