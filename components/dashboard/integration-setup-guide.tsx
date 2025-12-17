"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

interface IntegrationSetupGuideProps {
  open: boolean
  onClose: () => void
}

export function IntegrationSetupGuide({ open, onClose }: IntegrationSetupGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Como Configurar Integrações</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="github" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="gitlab">GitLab</TabsTrigger>
            <TabsTrigger value="azure">Azure DevOps</TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Configurando OAuth App no GitHub</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Passo 1: Acesse as Configurações</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      Acesse{" "}
                      <a
                        href="https://github.com/settings/developers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        GitHub Developer Settings <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>Clique em "OAuth Apps" no menu lateral</li>
                    <li>Clique em "New OAuth App"</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Passo 2: Preencha os Dados</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>Application name:</strong> Aegis CNPJ Alfanumérico
                    </li>
                    <li>
                      <strong>Homepage URL:</strong>{" "}
                      {typeof window !== "undefined" ? window.location.origin : "https://seu-dominio.com"}
                    </li>
                    <li>
                      <strong>Authorization callback URL:</strong>{" "}
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/api/github/callback`
                        : "https://seu-dominio.com/api/github/callback"}
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Passo 3: Obtenha as Credenciais</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      Após criar o OAuth App, você verá o <strong>Client ID</strong>
                    </li>
                    <li>
                      Clique em "Generate a new client secret" para obter o <strong>Client Secret</strong>
                    </li>
                    <li>Copie ambos e cole no formulário de integração</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Importante:</strong> O Client Secret só é mostrado uma vez. Guarde-o em local seguro!
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Alternativa: Personal Access Token</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Se preferir usar um Personal Access Token em vez de OAuth:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      Acesse{" "}
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        GitHub Tokens <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>Clique em "Generate new token" → "Generate new token (classic)"</li>
                    <li>
                      Selecione os escopos: <code className="bg-gray-100 px-1 rounded">repo</code> (acesso completo a
                      repositórios)
                    </li>
                    <li>Copie o token e cole no campo "Personal Access Token"</li>
                  </ol>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="gitlab" className="space-y-4">
            <Card className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">GitLab - Em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  A integração com GitLab está em desenvolvimento e estará disponível em breve.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="azure" className="space-y-4">
            <Card className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Azure DevOps - Em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  A integração com Azure DevOps está em desenvolvimento e estará disponível em breve.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
