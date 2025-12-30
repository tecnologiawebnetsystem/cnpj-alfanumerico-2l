"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Database, AlertCircle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function DatabaseScannerPage() {
  const [connectionString, setConnectionString] = useState("")
  const [databaseType, setDatabaseType] = useState<"sqlserver" | "oracle">("sqlserver")
  const [schemas, setSchemas] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  async function handleScan() {
    if (!connectionString) {
      alert("Informe a connection string")
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const res = await fetch("/api/database-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_string: connectionString,
          database_type: databaseType,
          schemas: schemas
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setResults(data)
      } else {
        alert(data.error || "Erro ao escanear banco de dados")
      }
    } catch (error) {
      console.error(error)
      alert("Erro ao conectar ao banco de dados")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Database className="h-8 w-8" />
        Análise de Banco de Dados
      </h1>

      <Card className="p-6 space-y-6">
        <div>
          <Label>Tipo de Banco de Dados</Label>
          <RadioGroup value={databaseType} onValueChange={(v: any) => setDatabaseType(v)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sqlserver" id="sqlserver" />
              <Label htmlFor="sqlserver">SQL Server</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oracle" id="oracle" />
              <Label htmlFor="oracle">Oracle</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="connString">Connection String</Label>
          <Input
            id="connString"
            type="password"
            placeholder={
              databaseType === "sqlserver"
                ? "Server=myServer;Database=myDB;User Id=myUser;Password=myPass;"
                : "user/password@hostname:port/servicename"
            }
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="schemas">Schemas (opcional, separados por vírgula)</Label>
          <Input
            id="schemas"
            placeholder="dbo, sales, hr"
            value={schemas}
            onChange={(e) => setSchemas(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">Deixe vazio para escanear todos os schemas</p>
        </div>

        <Button onClick={handleScan} disabled={loading || !connectionString} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Escaneando...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Iniciar Scan
            </>
          )}
        </Button>
      </Card>

      {results && (
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Resultados</h2>

          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold">{results.findings?.length || 0}</div>
              <div className="text-sm text-muted-foreground">CNPJs Encontrados</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {results.findings?.filter((f: any) => f.is_valid_cnpj).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">CNPJs Válidos</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {results.findings?.filter((f: any) => f.needs_migration).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Precisam Migração</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">
                {new Set(results.findings?.map((f: any) => `${f.schema}.${f.table}`)).size || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tabelas Afetadas</div>
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Detalhes dos Findings</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.findings?.map((finding: any, idx: number) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-mono text-sm">
                        {finding.schema}.{finding.table}.{finding.column}
                      </div>
                      <div className="font-mono font-bold">{finding.value}</div>
                      <div className="text-xs text-muted-foreground">Row ID: {finding.row_identifier}</div>
                    </div>
                    <div className="flex gap-2">
                      {finding.is_valid_cnpj ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Válido
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Inválido
                        </Badge>
                      )}
                      {finding.needs_migration && <Badge variant="secondary">Precisa Migração</Badge>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
