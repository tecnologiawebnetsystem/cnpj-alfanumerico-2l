"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Github, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function UploadSection() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [githubUrl, setGithubUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setError(null)
    }
  }

  const handleAnalyze = async (type: "file" | "github") => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()

      if (type === "file" && selectedFile) {
        formData.append("file", selectedFile)
        formData.append("repositoryName", selectedFile.name.replace(".zip", ""))
      } else if (type === "github" && githubUrl) {
        formData.append("githubUrl", githubUrl)
        formData.append("repositoryName", githubUrl.split("/").pop() || "repository")
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Falha ao iniciar análise")
      }

      const data = await response.json()

      router.push(`/analysis/${data.analysisId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar análise")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisar Repositório</CardTitle>
        <CardDescription>Faça upload do seu código ou forneça a URL do GitHub para análise</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload ZIP</TabsTrigger>
            <TabsTrigger value="github">GitHub URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Arquivo do Repositório</Label>
              <div className="flex items-center gap-4">
                <Input id="file-upload" type="file" accept=".zip" onChange={handleFileChange} className="flex-1" />
                {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
              </div>
              <p className="text-xs text-muted-foreground">Formatos aceitos: .zip (máximo 100MB)</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={() => handleAnalyze("file")}
              disabled={!selectedFile || isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Iniciar Análise
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="github" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-url">URL do Repositório GitHub</Label>
              <Input
                id="github-url"
                type="url"
                placeholder="https://github.com/usuario/repositorio"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Repositórios públicos ou privados (com token de acesso)</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={() => handleAnalyze("github")}
              disabled={!githubUrl || isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  Iniciar Análise
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 rounded-lg bg-muted p-4">
          <h4 className="font-medium text-sm mb-2">O que será analisado:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Campos de entrada/saída com CNPJ</li>
            <li>• Validações e máscaras de CNPJ</li>
            <li>• Estruturas de banco de dados</li>
            <li>• Arquivos que precisam alteração</li>
            <li>• Estimativa de tempo de migração</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
