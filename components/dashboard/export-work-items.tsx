"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Upload, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  GitBranch,
  Settings,
  Link2,
  FolderKanban
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  title: string
  description: string
  priority: string
  status: string
  file_path?: string
  line_number?: number
}

interface ExportWorkItemsProps {
  clientId: string
  tasks: Task[]
  onExportComplete?: () => void
}

interface ExportResult {
  taskId: string
  success: boolean
  workItemId?: string
  workItemUrl?: string
  error?: string
}

export function ExportWorkItems({ clientId, tasks, onExportComplete }: ExportWorkItemsProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [targetPlatform, setTargetPlatform] = useState<"azure" | "jira">("azure")
  const [results, setResults] = useState<ExportResult[]>([])
  const [step, setStep] = useState<"select" | "config" | "export" | "results">("select")
  
  // Azure DevOps config
  const [azureProject, setAzureProject] = useState("")
  const [azureWorkItemType, setAzureWorkItemType] = useState("Task")
  const [azureAreaPath, setAreaPath] = useState("")
  
  // Jira config
  const [jiraProject, setJiraProject] = useState("")
  const [jiraIssueType, setJiraIssueType] = useState("Task")

  const pendingTasks = tasks.filter(t => t.status !== "done")

  const toggleTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const selectAll = () => {
    if (selectedTasks.size === pendingTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(pendingTasks.map(t => t.id)))
    }
  }

  const handleExport = async () => {
    if (selectedTasks.size === 0) {
      toast({
        title: "Selecione tarefas",
        description: "Selecione pelo menos uma tarefa para exportar",
        variant: "destructive"
      })
      return
    }

    setExporting(true)
    setStep("export")
    const exportResults: ExportResult[] = []

    try {
      const tasksToExport = pendingTasks.filter(t => selectedTasks.has(t.id))
      
      for (const task of tasksToExport) {
        try {
          const res = await fetch("/api/admin-client/export-work-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: clientId,
              task_id: task.id,
              platform: targetPlatform,
              config: targetPlatform === "azure" 
                ? { project: azureProject, workItemType: azureWorkItemType, areaPath: azureAreaPath }
                : { project: jiraProject, issueType: jiraIssueType }
            })
          })

          const data = await res.json()
          
          if (res.ok && data.success) {
            exportResults.push({
              taskId: task.id,
              success: true,
              workItemId: data.workItemId,
              workItemUrl: data.workItemUrl
            })
          } else {
            exportResults.push({
              taskId: task.id,
              success: false,
              error: data.error || "Erro desconhecido"
            })
          }
        } catch (error: any) {
          exportResults.push({
            taskId: task.id,
            success: false,
            error: error.message
          })
        }
      }

      setResults(exportResults)
      setStep("results")
      
      const successCount = exportResults.filter(r => r.success).length
      toast({
        title: "Exportacao Concluida",
        description: `${successCount} de ${exportResults.length} tarefas exportadas com sucesso`
      })

      if (onExportComplete) {
        onExportComplete()
      }
    } catch (error: any) {
      toast({
        title: "Erro na Exportacao",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setExporting(false)
    }
  }

  const resetDialog = () => {
    setStep("select")
    setSelectedTasks(new Set())
    setResults([])
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetDialog() }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Exportar para {targetPlatform === "azure" ? "Azure Boards" : "Jira"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-[#0052CC]" />
            Exportar Work Items
          </DialogTitle>
          <DialogDescription>
            Crie work items automaticamente no Azure DevOps ou Jira a partir das tarefas
          </DialogDescription>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4">
            <Tabs value={targetPlatform} onValueChange={(v) => setTargetPlatform(v as "azure" | "jira")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="azure">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Azure DevOps
                </TabsTrigger>
                <TabsTrigger value="jira">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Jira
                </TabsTrigger>
              </TabsList>

              <TabsContent value="azure" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Projeto</Label>
                    <Input 
                      placeholder="Nome do projeto"
                      value={azureProject}
                      onChange={(e) => setAzureProject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Work Item</Label>
                    <Select value={azureWorkItemType} onValueChange={setAzureWorkItemType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Task">Task</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="User Story">User Story</SelectItem>
                        <SelectItem value="Issue">Issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Area Path (opcional)</Label>
                  <Input 
                    placeholder="Ex: Projeto\\Area"
                    value={azureAreaPath}
                    onChange={(e) => setAreaPath(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="jira" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Projeto (Key)</Label>
                    <Input 
                      placeholder="Ex: CNPJ"
                      value={jiraProject}
                      onChange={(e) => setJiraProject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Issue</Label>
                    <Select value={jiraIssueType} onValueChange={setJiraIssueType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Task">Task</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="Story">Story</SelectItem>
                        <SelectItem value="Sub-task">Sub-task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Selecione as tarefas para exportar</Label>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedTasks.size === pendingTasks.length ? "Desmarcar todas" : "Selecionar todas"}
                </Button>
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {pendingTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma tarefa pendente para exportar
                  </p>
                ) : (
                  pendingTasks.map(task => (
                    <div 
                      key={task.id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleTask(task.id)}
                    >
                      <Checkbox 
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {task.file_path || "Sem arquivo"}
                        </p>
                      </div>
                      <Badge variant={
                        task.priority === "critical" ? "destructive" :
                        task.priority === "high" ? "default" : "secondary"
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleExport}
                disabled={selectedTasks.size === 0 || (!azureProject && targetPlatform === "azure") || (!jiraProject && targetPlatform === "jira")}
              >
                Exportar {selectedTasks.size} {selectedTasks.size === 1 ? "tarefa" : "tarefas"}
              </Button>
            </div>
          </div>
        )}

        {step === "export" && (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#0052CC]" />
            <p className="mt-4 font-medium">Exportando tarefas...</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p>
          </div>
        )}

        {step === "results" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-medium">Exportacao concluida</span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {results.map(result => {
                const task = tasks.find(t => t.id === result.taskId)
                return (
                  <div 
                    key={result.taskId}
                    className={`p-3 rounded-lg border ${
                      result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">{task?.title}</span>
                      </div>
                      {result.success && result.workItemUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={result.workItemUrl} target="_blank" rel="noopener noreferrer">
                            <Link2 className="h-4 w-4 mr-1" />
                            {result.workItemId}
                          </a>
                        </Button>
                      )}
                    </div>
                    {result.error && (
                      <p className="text-xs text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
