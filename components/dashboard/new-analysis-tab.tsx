"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Github, FileCode, Database, Clock, AlertCircle, FolderOpen, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { GitHubRepositorySelector } from "./github-repository-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IntegrationAccountSelector } from "@/components/integrations/integration-account-selector"

export function NewAnalysisTab() {
  const router = useRouter()
  const [uploadType, setUploadType] = useState<"zip" | "repository" | "local">("zip")
  const [repositoryType, setRepositoryType] = useState<"github" | "gitlab" | "bitbucket" | "azure">("github")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [repositoryName, setRepositoryName] = useState("")
  const [repositoryUrl, setRepositoryUrl] = useState("")
  const [description, setDescription] = useState("")
  const [branch, setBranch] = useState("main")
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [selectedFolder, setSelectedFolder] = useState<FileList | null>(null)
  const [folderName, setFolderName] = useState("")
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("")

  const [showGitHubSelector, setShowGitHubSelector] = useState(false)
  const [selectedRepositories, setSelectedRepositories] = useState<any[]>([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [fileCount, setFileCount] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processedFiles, setProcessedFiles] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSelectFolder = () => {
    folderInputRef.current?.click()
  }

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFolder(e.target.files)

      const firstFile = e.target.files[0]
      const pathParts = firstFile.webkitRelativePath.split("/")
      const folder = pathParts[0]
      setFolderName(folder)

      if (!repositoryName) {
        setRepositoryName(folder)
      }
    }
  }

  const handleStartAnalysis = () => {
    if (uploadType === "zip" && !file) return
    if (uploadType === "repository" && !repositoryUrl) return
    if (uploadType === "local" && !selectedFolder) return

    // Calculate file count for confirmation
    let count = 0
    if (uploadType === "zip" && file) {
      count = 1
    } else if (uploadType === "local" && selectedFolder) {
      count = selectedFolder.length
    }

    setFileCount(count)
    setShowConfirmModal(true)
  }

  const handleAnalyze = async () => {
    setShowConfirmModal(false)
    setShowProgressModal(true)
    setIsAnalyzing(true)
    setUploadProgress(0)
    setProcessedFiles(0)

    try {
      const formData = new FormData()

      if (uploadType === "zip" && file) {
        formData.append("file", file)
        formData.append("repositoryName", repositoryName || file.name.replace(".zip", ""))
        formData.append("type", "zip")
        formData.append("selectedIntegrationId", selectedIntegrationId)
        setUploadProgress(50)
      } else if (uploadType === "repository" && repositoryUrl) {
        formData.append("repositoryUrl", repositoryUrl)
        formData.append("branch", branch)
        formData.append("repositoryName", repositoryName || repositoryUrl.split("/").pop() || "repository")
        formData.append("type", "repository")
        formData.append("repositoryType", repositoryType)
        formData.append("selectedIntegrationId", selectedIntegrationId)
        setUploadProgress(50)
      } else if (uploadType === "local" && selectedFolder) {
        const files: { name: string; content: string; path: string }[] = []
        const ignoreDirs = [
          "node_modules",
          ".git",
          "dist",
          "build",
          ".next",
          "coverage",
          ".vscode",
          ".idea",
          "vendor",
          "target",
          "bin",
          "obj",
        ]
        const textExtensions = [
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
          ".java",
          ".cs",
          ".php",
          ".py",
          ".rb",
          ".go",
          ".sql",
          ".json",
          ".xml",
          ".html",
          ".css",
          ".scss",
          ".vue",
          ".svelte",
          ".kt",
          ".swift",
        ]

        let processed = 0
        const totalFiles = selectedFolder.length

        for (let i = 0; i < selectedFolder.length; i++) {
          const file = selectedFolder[i]
          const relativePath = file.webkitRelativePath

          const shouldIgnore = ignoreDirs.some(
            (dir) => relativePath.includes(`/${dir}/`) || relativePath.startsWith(`${dir}/`),
          )
          if (shouldIgnore) {
            processed++
            continue
          }

          const hasTextExtension = textExtensions.some((ext) => file.name.endsWith(ext))
          if (hasTextExtension && file.size < 5 * 1024 * 1024) {
            try {
              const content = await file.text()
              files.push({
                name: file.name,
                content,
                path: relativePath,
              })
            } catch (error) {
              console.error(` Error reading file ${relativePath}:`, error)
            }
          }

          processed++
          setProcessedFiles(processed)
          setUploadProgress(Math.floor((processed / totalFiles) * 80))
        }

        formData.append("files", JSON.stringify(files))
        formData.append("repositoryName", repositoryName || folderName)
        formData.append("type", "local")
        formData.append("selectedIntegrationId", selectedIntegrationId)
      }

      formData.append("description", description)

      setUploadProgress(90)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      setUploadProgress(100)

      if (response.ok) {
        setShowProgressModal(false)
        setShowSuccessModal(true)

        // Redirect after showing success message
        setTimeout(() => {
          router.push(`/analysis/${data.analysisId}`)
        }, 2000)
      } else {
        setShowProgressModal(false)
        setErrorMessage(
          data.error || "Não foi possível iniciar a análise. Por favor, verifique o arquivo e tente novamente.",
        )
        setShowErrorModal(true)
        setIsAnalyzing(false)
      }
    } catch (error) {
      console.error(" Analysis error:", error)
      setShowProgressModal(false)
      setErrorMessage("Ocorreu um erro inesperado ao processar sua solicitação. Por favor, tente novamente mais tarde.")
      setShowErrorModal(true)
      setIsAnalyzing(false)
    }
  }

  const handleGitHubSelection = (repositories: any[]) => {
    console.log(" Selected repositories:", repositories)
    setSelectedRepositories(repositories)
    setShowGitHubSelector(false)

    // Se apenas um repositório foi selecionado, preencher o campo de URL
    if (repositories.length === 1) {
      setRepositoryUrl(repositories[0].html_url)
      setRepositoryName(repositories[0].name)
    } else if (repositories.length > 1) {
      setRepositoryName(`Análise em Lote (${repositories.length} repositórios)`)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Analisador de CNPJ Alfanumérico</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Faça upload do seu repositório e identifique automaticamente todos os campos CNPJ que precisam ser
            atualizados para o novo formato alfanumérico.
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              <span>Detecta múltiplas linguagens</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span>Analisa banco de dados</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Estima tempo de migração</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Enviar Repositório para Análise</h2>

        <div className="flex gap-4 mb-6">
          <Button
            variant={uploadType === "zip" ? "default" : "outline"}
            onClick={() => setUploadType("zip")}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload ZIP
          </Button>
          <Button
            variant={uploadType === "repository" ? "default" : "outline"}
            onClick={() => setUploadType("repository")}
            className="flex-1"
          >
            <Github className="h-4 w-4 mr-2" />
            Repositório
          </Button>
          <Button
            variant={uploadType === "local" ? "default" : "outline"}
            onClick={() => setUploadType("local")}
            className="flex-1"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Caminho Local
          </Button>
        </div>

        {uploadType === "zip" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="repository-name">Nome do Repositório</Label>
              <Input
                id="repository-name"
                placeholder="Ex: meu-sistema-contabil"
                value={repositoryName}
                onChange={(e) => setRepositoryName(e.target.value)}
              />
            </div>

            <div>
              <Label>Conta de Integração (opcional)</Label>
              <IntegrationAccountSelector
                value={selectedIntegrationId}
                onChange={setSelectedIntegrationId}
                placeholder="Selecione uma conta (se necessário)"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Selecione uma conta se precisar de credenciais para acessar recursos
              </p>
            </div>

            <div>
              <Label htmlFor="file-upload">Arquivo ZIP do Repositório</Label>
              <div className="mt-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              {file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Arquivo selecionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva brevemente o sistema..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        ) : uploadType === "repository" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="repository-type">Tipo de Repositório</Label>
              <Select value={repositoryType} onValueChange={(value: any) => setRepositoryType(value)}>
                <SelectTrigger id="repository-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </div>
                  </SelectItem>
                  <SelectItem value="gitlab">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.919 1.263a.455.455 0 0 0-.867 0L1.388 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.92.92 0 0 0 .331-1.024" />
                      </svg>
                      GitLab
                    </div>
                  </SelectItem>
                  <SelectItem value="bitbucket">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
                      </svg>
                      Bitbucket
                    </div>
                  </SelectItem>
                  <SelectItem value="azure">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13.55 17.88L6.11 19.5l-4.61-3.6 11.55-1.62v3.6zM13.55 4.5v3.6L2 6.48l4.61-3.6 6.94 1.62zM24 7.38v9.24l-8.95 5.13V2.25L24 7.38z" />
                      </svg>
                      Azure DevOps
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione o tipo de repositório que você deseja analisar
              </p>
            </div>

            <div>
              <Label htmlFor="repository-url">URL do Repositório</Label>
              <Input
                id="repository-url"
                placeholder={
                  repositoryType === "github"
                    ? "https://github.com/usuario/repositorio"
                    : repositoryType === "gitlab"
                      ? "https://gitlab.com/usuario/repositorio"
                      : repositoryType === "bitbucket"
                        ? "https://bitbucket.org/usuario/repositorio"
                        : "https://dev.azure.com/organization/project/_git/repository"
                }
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Cole a URL completa do repositório
                {repositoryType === "github" && " ou selecione da lista"}
              </p>
            </div>

            {repositoryType === "github" && (
              <div className="flex gap-2">
                <Button onClick={() => setShowGitHubSelector(true)} variant="outline" className="flex-1" type="button">
                  <Github className="mr-2 h-4 w-4" />
                  Selecionar Repositórios
                </Button>
              </div>
            )}

            {selectedRepositories.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{selectedRepositories.length} repositório(s) selecionado(s):</h4>
                <ul className="text-sm space-y-1">
                  {selectedRepositories.slice(0, 5).map((repo) => (
                    <li key={repo.id} className="text-muted-foreground">
                      • {repo.full_name}
                    </li>
                  ))}
                  {selectedRepositories.length > 5 && (
                    <li className="text-muted-foreground">... e mais {selectedRepositories.length - 5}</li>
                  )}
                </ul>
              </div>
            )}

            <div>
              <Label>Conta de Integração</Label>
              <IntegrationAccountSelector
                value={selectedIntegrationId}
                onChange={setSelectedIntegrationId}
                provider={repositoryType}
                placeholder="Selecione a conta para acessar o repositório"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {repositoryType === "azure" 
                  ? "Selecione a organização/projeto do Azure DevOps"
                  : `Selecione a conta ${repositoryType === "github" ? "GitHub" : repositoryType === "gitlab" ? "GitLab" : "Bitbucket"} para autenticação`
                }
              </p>
            </div>

            <div>
              <Label htmlFor="branch">Branch (opcional)</Label>
              <Input id="branch" placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="description-repository">Descrição (opcional)</Label>
              <Textarea
                id="description-repository"
                placeholder="Descreva brevemente o sistema..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="local-folder">Pasta do Projeto Local</Label>
              <input
                ref={folderInputRef}
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderChange}
                style={{ display: "none" }}
              />
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" onClick={handleSelectFolder} className="flex-1 bg-transparent">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {folderName ? folderName : "Selecionar Pasta"}
                </Button>
              </div>
              {selectedFolder && (
                <p className="text-sm text-muted-foreground mt-2">
                  Pasta selecionada: {folderName} ({selectedFolder.length} arquivos)
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Clique para selecionar a pasta do projeto no seu computador
              </p>
            </div>

            <div>
              <Label htmlFor="repository-name-local">Nome do Repositório</Label>
              <Input
                id="repository-name-local"
                placeholder="Ex: meu-sistema-contabil"
                value={repositoryName}
                onChange={(e) => setRepositoryName(e.target.value)}
              />
            </div>

            <div>
              <Label>Conta de Integração (opcional)</Label>
              <IntegrationAccountSelector
                value={selectedIntegrationId}
                onChange={setSelectedIntegrationId}
                placeholder="Selecione uma conta (se necessário)"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Selecione uma conta se precisar sincronizar com repositório remoto
              </p>
            </div>

            <div>
              <Label htmlFor="description-local">Descrição (opcional)</Label>
              <Textarea
                id="description-local"
                placeholder="Descreva brevemente o sistema..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                Linguagens Suportadas
              </h3>
              <p className="text-sm text-muted-foreground">
                JavaScript, TypeScript, Java, C#, PHP, Python, Ruby, Go e mais
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartAnalysis}
          disabled={
            isAnalyzing ||
            (uploadType === "zip" && !file) ||
            (uploadType === "repository" && !repositoryUrl) ||
            (uploadType === "local" && !selectedFolder)
          }
          className="w-full mt-6"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Analisando repositório...
            </>
          ) : (
            <>
              <FileCode className="h-4 w-4 mr-2" />
              Iniciar Análise
            </>
          )}
        </Button>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Linguagens Suportadas
          </h3>
          <p className="text-sm text-muted-foreground">
            JavaScript, TypeScript, Java, C#, PHP, Python, Ruby, Go e mais
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Bancos de Dados
          </h3>
          <p className="text-sm text-muted-foreground">SQL Server, Oracle, MySQL, PostgreSQL, MongoDB</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Tempo de Análise
          </h3>
          <p className="text-sm text-muted-foreground">2-5 minutos para repositórios médios (até 10.000 arquivos)</p>
        </Card>
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Upload</DialogTitle>
            <DialogDescription>
              {uploadType === "local" ? (
                <>
                  Você está prestes a enviar <strong>{fileCount.toLocaleString()}</strong> arquivos da pasta{" "}
                  <strong>{folderName}</strong> para análise.
                  <br />
                  <br />
                  Arquivos em pastas como node_modules, .git, dist e build serão automaticamente ignorados.
                </>
              ) : uploadType === "zip" ? (
                <>
                  Você está prestes a enviar o arquivo <strong>{file?.name}</strong> para análise.
                </>
              ) : (
                <>Você está prestes a clonar e analisar o repositório do GitHub.</>
              )}
              <br />
              <br />
              Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAnalyze}>Confirmar e Iniciar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showProgressModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" hideClose>
          <DialogHeader>
            <DialogTitle>Processando Arquivos</DialogTitle>
            <DialogDescription>
              {uploadType === "local" ? (
                <>
                  Processando {processedFiles.toLocaleString()} de {fileCount.toLocaleString()} arquivos...
                </>
              ) : (
                <>Enviando arquivos para análise...</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">{uploadProgress}% concluído</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <DialogTitle>Upload Concluído!</DialogTitle>
            </div>
            <DialogDescription>
              Seu repositório foi enviado com sucesso e a análise está em andamento.
              <br />
              <br />
              Você será redirecionado para a página de resultados em instantes...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <DialogTitle>Erro ao Iniciar Análise</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              {errorMessage}
              <br />
              <br />
              Se o problema persistir, entre em contato com o suporte.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorModal(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showGitHubSelector && (
        <GitHubRepositorySelector onSelect={handleGitHubSelection} onClose={() => setShowGitHubSelector(false)} />
      )}
    </div>
  )
}
