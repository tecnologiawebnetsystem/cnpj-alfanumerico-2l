"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save, Loader2, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClientSettingsTabProps {
  clientId: string
}

export function ClientSettingsTab({ clientId }: ClientSettingsTabProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // CNPJ field names
  const [cnpjFields, setCnpjFields] = useState<string[]>([])
  const [newCnpjField, setNewCnpjField] = useState("")

  // File extensions
  const [fileExtensions, setFileExtensions] = useState<string[]>([])
  const [newExtension, setNewExtension] = useState("")

  useEffect(() => {
    loadSettings()
  }, [clientId])

  const loadSettings = async () => {
    try {
      console.log(" Loading settings for client:", clientId)
      const response = await fetch(`/api/client/settings?client_id=${clientId}`)
      console.log(" Settings API response status:", response.status)
      console.log(" Settings API response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(" Settings API error response:", errorText)
        throw new Error("Erro ao carregar configurações")
      }

      const data = await response.json()
      console.log(" Settings data received:", data)
      console.log(" Settings data type:", typeof data)
      console.log(" Settings data keys:", Object.keys(data))

      const cnpjFieldsValue = data.cnpj_field_names || []
      console.log(" Raw CNPJ fields value:", cnpjFieldsValue)
      console.log(" CNPJ fields type:", typeof cnpjFieldsValue)
      console.log(" CNPJ fields is array?:", Array.isArray(cnpjFieldsValue))

      const parsedCnpjFields = Array.isArray(cnpjFieldsValue)
        ? cnpjFieldsValue
        : typeof cnpjFieldsValue === "string"
          ? cnpjFieldsValue.split(",").filter((f: string) => f.trim())
          : []
      console.log(" Parsed CNPJ fields:", parsedCnpjFields)
      console.log(" Parsed CNPJ fields length:", parsedCnpjFields.length)
      setCnpjFields(parsedCnpjFields)

      const extensionsValue = data.file_extensions || []
      console.log(" Raw extensions value:", extensionsValue)
      console.log(" Extensions type:", typeof extensionsValue)
      console.log(" Extensions is array?:", Array.isArray(extensionsValue))

      const parsedExtensions = Array.isArray(extensionsValue)
        ? extensionsValue
        : typeof extensionsValue === "string"
          ? extensionsValue.split(",").filter((e: string) => e.trim())
          : []
      console.log(" Parsed extensions:", parsedExtensions)
      console.log(" Parsed extensions length:", parsedExtensions.length)
      setFileExtensions(parsedExtensions)

      console.log(" Final state - CNPJ fields:", parsedCnpjFields, "Extensions:", parsedExtensions)
      setLoading(false)
    } catch (error) {
      console.error(" Erro ao carregar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      console.log(" ========== SAVE SETTINGS START ==========")
      console.log(" Current CNPJ fields state:", cnpjFields)
      console.log(" Current file extensions state:", fileExtensions)

      const cleanedCnpjFields = cnpjFields.map((field) => {
        // Remove regex slashes if present: "/cnpj/i" -> "cnpj"
        const regexMatch = field.match(/^\/(.+)\/[gimuy]*$/)
        return regexMatch ? regexMatch[1] : field
      })

      console.log(" Original CNPJ fields:", cnpjFields)
      console.log(" Cleaned CNPJ fields:", cleanedCnpjFields)
      console.log(" Fields to save (joined):", cleanedCnpjFields.join(","))
      console.log(" Extensions to save (joined):", fileExtensions.join(","))

      const response = await fetch("/api/client/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          cnpj_field_names: cleanedCnpjFields.join(","),
          file_extensions: fileExtensions.join(","),
        }),
      })

      if (!response.ok) throw new Error("Erro ao salvar configurações")

      const responseData = await response.json()
      console.log(" Save response:", responseData)

      setCnpjFields(cleanedCnpjFields)
      setHasUnsavedChanges(false)

      console.log(" Settings saved successfully!")
      console.log(" ========== SAVE SETTINGS END ==========")

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addCnpjField = () => {
    if (newCnpjField.trim() && !cnpjFields.includes(newCnpjField.trim())) {
      setCnpjFields([...cnpjFields, newCnpjField.trim()])
      setNewCnpjField("")
      setHasUnsavedChanges(true)
    }
  }

  const removeCnpjField = (field: string) => {
    setCnpjFields(cnpjFields.filter((f) => f !== field))
    setHasUnsavedChanges(true)
  }

  const addExtension = () => {
    const ext = newExtension.trim()
    if (ext && !fileExtensions.includes(ext)) {
      // Ensure it starts with a dot
      const formattedExt = ext.startsWith(".") ? ext : `.${ext}`
      setFileExtensions([...fileExtensions, formattedExt])
      setNewExtension("")
      setHasUnsavedChanges(true)
    }
  }

  const removeExtension = (ext: string) => {
    setFileExtensions(fileExtensions.filter((e) => e !== ext))
    setHasUnsavedChanges(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Configurações</h2>
            <p className="text-sm text-muted-foreground">Gerencie as configurações de análise do sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Alterações não salvas
            </Badge>
          )}
          <Button onClick={saveSettings} disabled={saving} variant={hasUnsavedChanges ? "default" : "secondary"}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* CNPJ Fields Section */}
      <Card>
        <CardHeader>
          <CardTitle>Campos/Variáveis de CNPJ</CardTitle>
          <CardDescription>
            Configure quais nomes de campos, variáveis e propriedades o sistema deve buscar para identificar CNPJs no
            código
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 mb-4">
            <p className="text-sm font-semibold text-orange-900 mb-2">
              ⚠️ Importante: Cadastre TODAS as variações possíveis!
            </p>
            <p className="text-xs text-orange-800">
              Inclua versões com underscore (_), camelCase, MAIÚSCULAS e diferentes idiomas.
              <br />
              <strong>Exemplos:</strong> cnpj, nr_cnpj, nrCnpj, NR_CNPJ, documento, documentNumber, taxId,
              companyDocument
            </p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newCnpjField">Adicionar novo campo</Label>
              <Input
                id="newCnpjField"
                placeholder="Ex: cnpj, nr_cnpj, documentNumber, taxId..."
                value={newCnpjField}
                onChange={(e) => setNewCnpjField(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCnpjField()}
              />
            </div>
            <Button onClick={addCnpjField} className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {cnpjFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum campo configurado. Adicione campos para começar.</p>
            ) : (
              cnpjFields.map((field) => (
                <Badge key={field} variant="secondary" className="text-sm py-1.5 px-3">
                  {field}
                  <button onClick={() => removeCnpjField(field)} className="ml-2 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            O sistema buscará por esses nomes em: nomes de variáveis, propriedades de objetos, campos de banco de dados,
            parâmetros de funções, etc.
            <br />
            <strong>Nota:</strong> A busca é case-insensitive (ignora maiúsculas/minúsculas), mas é importante cadastrar
            variações com underscores e formatos diferentes.
          </p>
        </CardContent>
      </Card>

      {/* File Extensions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Extensões de Arquivos</CardTitle>
          <CardDescription>Configure quais tipos de arquivo devem ser analisados pelo sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="newExtension">Adicionar nova extensão</Label>
              <Input
                id="newExtension"
                placeholder="Ex: .ts, .java, .py..."
                value={newExtension}
                onChange={(e) => setNewExtension(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExtension()}
              />
            </div>
            <Button onClick={addExtension} className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {fileExtensions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma extensão configurada. Adicione extensões para começar.
              </p>
            ) : (
              fileExtensions.map((ext) => (
                <Badge key={ext} variant="secondary" className="text-sm py-1.5 px-3">
                  {ext}
                  <button onClick={() => removeExtension(ext)} className="ml-2 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Apenas arquivos com essas extensões serão analisados. Inclua o ponto (.) antes da extensão.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
