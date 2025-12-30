"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, PlayCircle } from "lucide-react"

export default function RepositoryAnalysisPage() {
  const [repositories, setRepositories] = useState<any[]>([])
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])
  const [reportType, setReportType] = useState<"analytical" | "synthetic">("analytical")
  const [developers, setDevelopers] = useState<any[]>([])
  const [selectedDeveloper, setSelectedDeveloper] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    // Load repositories from connected accounts
    const reposRes = await fetch("/api/accounts")
    const reposData = await reposRes.json()
    const allRepos = reposData.accounts?.flatMap((acc: any) => acc.repositories || []) || []
    setRepositories(allRepos)

    // Load developers
    const devsRes = await fetch("/api/client/devs")
    const devsData = await devsRes.json()
    setDevelopers(devsData.developers || [])
  }

  async function handleAnalyze() {
    if (selectedRepos.length === 0) {
      alert("Selecione pelo menos um repositório")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin-client/analyze-repositories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository_ids: selectedRepos,
          report_type: reportType,
          assigned_developer_id: selectedDeveloper || null,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        window.location.href = `/analysis/${data.analysis_id}`
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error(error)
      alert("Erro ao iniciar análise")
    } finally {
      setLoading(false)
    }
  }

  function toggleSelectAll() {
    if (selectedRepos.length === repositories.length) {
      setSelectedRepos([])
    } else {
      setSelectedRepos(repositories.map((r) => r.url))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Análise de Repositórios</h1>
      </div>

      <Card className="p-6 space-y-6">
        {/* Repository Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Selecionar Repositórios</h2>
            <Button variant="outline" onClick={toggleSelectAll}>
              {selectedRepos.length === repositories.length ? "Desmarcar" : "Selecionar"} Todos
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-4">
            {repositories.map((repo) => (
              <div key={repo.url} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedRepos.includes(repo.url)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRepos([...selectedRepos, repo.url])
                    } else {
                      setSelectedRepos(selectedRepos.filter((r) => r !== repo.url))
                    }
                  }}
                />
                <label className="text-sm">{repo.name}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Report Type */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tipo de Relatório</h2>
          <RadioGroup value={reportType} onValueChange={(v: any) => setReportType(v)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="analytical" id="analytical" />
              <Label htmlFor="analytical">
                <div className="font-medium">Analítico</div>
                <div className="text-sm text-muted-foreground">
                  Mostra linha por linha, arquivo, erro e solução da IA
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="synthetic" id="synthetic" />
              <Label htmlFor="synthetic">
                <div className="font-medium">Sintético</div>
                <div className="text-sm text-muted-foreground">
                  Resumo geral com estatísticas e principais problemas
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Developer Assignment */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Atribuir Desenvolvedor (Opcional)</h2>
          <select
            className="w-full border rounded p-2"
            value={selectedDeveloper}
            onChange={(e) => setSelectedDeveloper(e.target.value)}
          >
            <option value="">Nenhum desenvolvedor</option>
            {developers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name} ({dev.email})
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleAnalyze} disabled={loading || selectedRepos.length === 0} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Iniciar Análise
            </>
          )}
        </Button>
      </Card>
    </div>
  )
}
