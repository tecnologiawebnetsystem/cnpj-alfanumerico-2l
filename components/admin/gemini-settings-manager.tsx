"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GeminiSettings {
  id?: string
  client_id: string
  api_key: string
  model_name: string
  temperature: number
  max_tokens: number
  is_active: boolean
}

export default function GeminiSettingsManager({ clientId }: { clientId: string }) {
  const [settings, setSettings] = useState<GeminiSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/gemini-settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        } else {
          // Initialize with default values
          setSettings({
            client_id: clientId,
            api_key: "",
            model_name: "gemini-1.5-pro",
            temperature: 0.7,
            max_tokens: 4096,
            is_active: true,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching Gemini settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    setMessage(null)

    try {
      const method = settings.id ? "PUT" : "POST"
      const response = await fetch("/api/admin/gemini-settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        setMessage({ type: "success", text: "Configurações Gemini AI salvas com sucesso!" })
      } else {
        setMessage({ type: "error", text: "Erro ao salvar configurações" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao salvar configurações" })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof GeminiSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <CardTitle>Configurações Gemini AI</CardTitle>
        </div>
        <CardDescription>
          Configure a integração com o Google Gemini AI para análise inteligente de código e sugestões automáticas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert className={`${message.type === "success" ? "border-green-500" : "border-red-500"}`}>
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api_key">
              API Key <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="api_key"
                type={showApiKey ? "text" : "password"}
                value={settings?.api_key || ""}
                onChange={(e) => updateSetting("api_key", e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha sua API key em{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="model_name">Modelo</Label>
            <Select
              value={settings?.model_name || "gemini-1.5-pro"}
              onValueChange={(v) => updateSetting("model_name", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Recomendado)</SelectItem>
                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Mais rápido)</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              O modelo Pro oferece melhor qualidade, enquanto o Flash é mais rápido e econômico
            </p>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature: {settings?.temperature || 0.7}</Label>
            <Input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings?.temperature || 0.7}
              onChange={(e) => updateSetting("temperature", Number.parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controla a criatividade das respostas (0 = mais preciso, 2 = mais criativo)
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="max_tokens">Máximo de Tokens</Label>
            <Input
              id="max_tokens"
              type="number"
              min="1024"
              max="8192"
              step="256"
              value={settings?.max_tokens || 4096}
              onChange={(e) => updateSetting("max_tokens", Number.parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Limite de tokens por resposta (maior = respostas mais longas, mas maior custo)
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="font-medium">
                Ativar Integração
              </Label>
              <p className="text-sm text-muted-foreground">Habilitar análises com Gemini AI</p>
            </div>
            <Switch
              id="is_active"
              checked={settings?.is_active || false}
              onCheckedChange={(checked) => updateSetting("is_active", checked)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button variant="outline" onClick={fetchSettings} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !settings?.api_key}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
