"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MessageSquare, Webhook, Sparkles, Eye, EyeOff, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Setting {
  id: string
  key: string
  value: string | null
  category: string
  label: string
  description: string
  is_secret: boolean
  is_required: boolean
  is_enabled: boolean
}

export function IntegrationsSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/client/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (category: string) => {
    setSaving(true)
    try {
      const categorySettings = settings.filter((s) => s.category === category)
      const response = await fetch("/api/client/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: categorySettings }),
      })

      if (response.ok) {
        toast({
          title: "Configurações salvas",
          description: "Suas configurações foram atualizadas com sucesso.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string | boolean, field: "value" | "is_enabled") => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)))
  }

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderSettingInput = (setting: Setting) => (
    <div key={setting.key} className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={setting.key}>
          {setting.label}
          {setting.is_required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Switch
          checked={setting.is_enabled}
          onCheckedChange={(checked) => updateSetting(setting.key, checked, "is_enabled")}
        />
      </div>
      <div className="relative">
        <Input
          id={setting.key}
          type={setting.is_secret && !showSecrets[setting.key] ? "password" : "text"}
          value={setting.value || ""}
          onChange={(e) => updateSetting(setting.key, e.target.value, "value")}
          placeholder={setting.description}
          disabled={!setting.is_enabled}
        />
        {setting.is_secret && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => toggleSecret(setting.key)}
          >
            {showSecrets[setting.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{setting.description}</p>
    </div>
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="email" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email
        </TabsTrigger>
        <TabsTrigger value="whatsapp" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          WhatsApp
        </TabsTrigger>
        <TabsTrigger value="webhooks" className="flex items-center gap-2">
          <Webhook className="h-4 w-4" />
          Webhooks
        </TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          IA
        </TabsTrigger>
      </TabsList>

      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Email</CardTitle>
            <CardDescription>Configure o serviço de envio de emails para notificações e relatórios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.filter((s) => s.category === "email").map(renderSettingInput)}
            <Button onClick={() => handleSave("email")} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="whatsapp">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de WhatsApp</CardTitle>
            <CardDescription>Configure a integração com WhatsApp Business para notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.filter((s) => s.category === "whatsapp").map(renderSettingInput)}
            <Button onClick={() => handleSave("whatsapp")} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="webhooks">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Webhooks</CardTitle>
            <CardDescription>Configure webhooks para integrar com outros sistemas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.filter((s) => s.category === "webhooks").map(renderSettingInput)}
            <Button onClick={() => handleSave("webhooks")} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de IA</CardTitle>
            <CardDescription>Configure as integrações de Inteligência Artificial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.filter((s) => s.category === "ai").map(renderSettingInput)}
            <Button onClick={() => handleSave("ai")} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
