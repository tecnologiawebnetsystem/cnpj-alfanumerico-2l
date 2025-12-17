import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileCode } from 'lucide-react'

interface Finding {
  file_path: string
  file_type: string
  repository?: string  // Add repository field
  project?: string     // Add project field
}

export function FilesList({ findings }: { findings: Finding[] }) {
  const projectMap = new Map<string, Map<string, Map<string, { path: string; type: string; count: number }>>>()

  findings.forEach((finding) => {
    const projectName = finding.project || 'Sem Projeto'
    const repoName = finding.repository || 'Sem Repositório'
    
    if (!projectMap.has(projectName)) {
      projectMap.set(projectName, new Map())
    }
    
    const repoMap = projectMap.get(projectName)!
    if (!repoMap.has(repoName)) {
      repoMap.set(repoName, new Map())
    }
    
    const fileMap = repoMap.get(repoName)!
    const existing = fileMap.get(finding.file_path)
    if (existing) {
      existing.count++
    } else {
      fileMap.set(finding.file_path, {
        path: finding.file_path,
        type: finding.file_type,
        count: 1,
      })
    }
  })

  const totalFiles = findings.reduce((acc, f) => {
    const key = `${f.project || 'none'}-${f.repository || 'none'}-${f.file_path}`
    if (!acc.has(key)) acc.add(key)
    return acc
  }, new Set()).size

  if (totalFiles === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Arquivos que Precisam Alteração</CardTitle>
        <CardDescription>
          {totalFiles} arquivo{totalFiles !== 1 ? "s" : ""} identificado{totalFiles !== 1 ? "s" : ""} com campos CNPJ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from(projectMap.entries()).map(([projectName, repoMap]) => (
            <div key={projectName} className="space-y-3">
              {/* Project header */}
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="font-semibold text-sm text-purple-700 dark:text-purple-400">
                  Projeto: {projectName}
                </span>
              </div>
              
              {Array.from(repoMap.entries()).map(([repoName, fileMap]) => (
                <div key={repoName} className="space-y-2 pl-4">
                  {/* Repository header */}
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="font-medium text-sm text-blue-700 dark:text-blue-400">
                      Repositório: {repoName}
                    </span>
                  </div>
                  
                  {/* Files */}
                  <div className="space-y-2 pl-6">
                    {Array.from(fileMap.values()).map((file) => (
                      <div
                        key={file.path}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-mono text-sm truncate">{file.path}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="secondary">{file.type}</Badge>
                          <Badge variant="outline">
                            {file.count} ocorrência{file.count !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
