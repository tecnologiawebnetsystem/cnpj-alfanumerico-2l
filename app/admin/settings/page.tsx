"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react"
import GeminiSettingsManager from "@/components/admin/gemini-settings-manager"

interface SystemSetting {
  id: string
  key: string
  value: string | null
  category: string
  label: string
  description: string | null
  is_secret: boolean
  is_required: boolean
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [currentClientId, setCurrentClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [changes, setChanges] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSettings()
    fetchClients()
    fetchCurrentUser()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/admin/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
        if (data.clients && data.clients.length > 0) {
          setCurrentClientId(data.clients[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.user?.client_id) {
          setCurrentClientId(data.user.client_id)
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setChanges((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: changes }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Configurações salvas com sucesso!" })
        setChanges({})
        fetchSettings()
      } else {
        setMessage({ type: "error", text: "Erro ao salvar configurações" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar configurações" })
    } finally {
      setSaving(false)
    }
  }

  const toggleShowSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const getValue = (setting: SystemSetting) => {
    return changes[setting.key] !== undefined ? changes[setting.key] : setting.value || ""
  }

  const renderSetting = (setting: SystemSetting) => {
    const value = getValue(setting)
    const isBooleanSetting = value === "true" || value === "false"

    return (
      <div key={setting.id} className="space-y-2 p-4 border rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <label htmlFor={setting.key} className="text-sm font-medium">
              {setting.label}
              {setting.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {setting.description && <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          {isBooleanSetting ? (
            <div className="flex items-center space-x-2">
              {/* Simplified boolean setting rendering */}
              <input
                id={setting.key}
                type="checkbox"
                checked={value === "true"}
                onChange={(e) => handleChange(setting.key, e.target.checked ? "true" : "false")}
                className="checkbox"
              />
              <label htmlFor={setting.key} className="text-sm">
                {value === "true" ? "Habilitado" : "Desabilitado"}
              </label>
            </div>
          ) : (
            <>
              <input
                id={setting.key}
                type={setting.is_secret && !showSecrets[setting.key] ? "password" : "text"}
                value={value}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                placeholder={setting.is_secret ? "••••••••" : `Digite ${setting.label.toLowerCase()}`}
                className="flex-1 input"
              />
              {setting.is_secret && (
                <button
                  type="button"
                  className="btn btn-outline btn-icon"
                  onClick={() => toggleShowSecret(setting.key)}
                >
                  {showSecrets[setting.key] ? "EyeOff" : "Eye"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  const categories = [
    { key: "terms", label: "Termos CNPJ", icon: "📝" },
    { key: "extensions", label: "Extensões de Arquivo", icon: "📁" },
    { key: "gemini", label: "IA Gemini", icon: "✨" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie as configurações de análise do sistema</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === "success" ? "border-green-500" : "border-red-500"}`}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="terms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted rounded-lg p-1">
          <TabsTrigger value="terms" className="text-sm font-medium">
            <span className="mr-2">📝</span>
            Termos CNPJ
          </TabsTrigger>
          <TabsTrigger value="extensions" className="text-sm font-medium">
            <span className="mr-2">📁</span>
            Extensões de Arquivo
          </TabsTrigger>
          <TabsTrigger value="gemini" className="text-sm font-medium">
            <span className="mr-2">✨</span>
            IA Gemini
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Campos/Variáveis de CNPJ</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configure quais nomes de campos, variáveis e propriedades o sistema deve buscar para identificar CNPJs no
              código
            </p>

            <Alert className="mb-6 border-amber-500">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                <strong>Importante: Cadastre TODAS as variações possíveis!</strong>
                <p className="mt-2 text-xs">
                  Inclua versões com underscore (_), camelCase, MAIÚSCULAS e diferentes idiomas.
                  <br />
                  <strong>Exemplos:</strong> cnpj, nr_cnpj, nrCnpj, NR_CNPJ, documento, documentNumber, taxId,
                  companyDocument
                </p>
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
              <p>Configurações de campos CNPJ em desenvolvimento</p>
              <p className="text-xs mt-2">Em breve você poderá adicionar e gerenciar campos personalizados</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="extensions" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Extensões de Arquivo</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configure quais tipos de arquivos devem ser analisados pelo sistema
            </p>

            <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
              <p>Configurações de extensões em desenvolvimento</p>
              <p className="text-xs mt-2">
                Em breve você poderá adicionar e gerenciar extensões de arquivo personalizadas
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="gemini" className="mt-6">
          {currentClientId ? (
            <GeminiSettingsManager clientId={currentClientId} />
          ) : (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Carregando configurações do Gemini...</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setChanges({})
            setMessage(null)
          }}
          disabled={Object.keys(changes).length === 0}
        >
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving || Object.keys(changes).length === 0}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
