"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Terminal, Zap, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ApiDocumentation() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documentação da API</h2>
          <p className="text-muted-foreground mt-2">Integre o sistema de análise de CNPJ em suas aplicações</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/api-spec.json" download className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            OpenAPI Spec
          </a>
        </Button>
      </div>

      <Tabs defaultValue="quickstart" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quickstart">Início Rápido</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="quickstart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Autenticação
              </CardTitle>
              <CardDescription>Como autenticar suas requisições usando API Keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Header de Autenticação</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Todas as requisições devem incluir o header X-API-Key:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">{`X-API-Key: SUA_API_KEY`}</pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <code className="bg-muted px-3 py-2 rounded text-sm block">
                  {typeof window !== "undefined" ? window.location.origin : ""}/api/v1
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">100 requisições por minuto por API Key</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Fluxo Básico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Obtenha sua API Key na aba "API Keys"</li>
                <li>Envie seu repositório para análise via POST /analyze</li>
                <li>Receba o analysis_id na resposta</li>
                <li>Consulte o status via GET /analyze/:id</li>
                <li>Quando status = "completed", baixe os resultados</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>POST /api/v1/analyze</CardTitle>
              <CardDescription>Iniciar análise de repositório</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Badge>application/json</Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {`{
  "repository_url": "https://github.com/user/repo",
  "repository_type": "github",
  "webhook_url": "https://seu-site.com/webhook" // opcional
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Response (202 Accepted)</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {`{
  "analysis_id": "uuid-da-analise",
  "status": "pending",
  "message": "Analysis started",
  "estimated_time": "5-10 minutes"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GET /api/v1/analyze/:id</CardTitle>
              <CardDescription>Consultar resultado de análise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Response (200 OK)</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {`{
  "analysis": {
    "id": "uuid",
    "status": "completed",
    "repository_name": "meu-sistema",
    "total_files": 150,
    "cnpj_found": 45
  },
  "findings": [
    {
      "file_path": "src/config.js",
      "line_number": 42,
      "cnpj_value": "12.345.678/0001-95",
      "severity": "high"
    }
  ]
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>POST /api/v1/validate-cnpj</CardTitle>
              <CardDescription>Validar CNPJ alfanumérico</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {`{
  "cnpj": "12ABC456DE7890"
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Response (200 OK)</h4>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {`{
  "cnpj": "12ABC456DE7890",
  "is_valid": true,
  "formatted": "12.ABC.456/DE78-90",
  "check_digit": "0"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Exemplos de Integração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">JavaScript / Node.js</h3>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {`const response = await fetch('${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sua_api_key_aqui'
  },
  body: JSON.stringify({
    repository_url: 'https://github.com/user/repo',
    repository_type: 'github'
  })
});

const data = await response.json();
console.log('Análise iniciada:', data.analysis_id);`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Python</h3>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {`import requests

response = requests.post(
    '${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/analyze',
    headers={'X-API-Key': 'sua_api_key_aqui'},
    json={
        'repository_url': 'https://github.com/user/repo',
        'repository_type': 'github'
    }
)

data = response.json()
print(f"Análise iniciada: {data['analysis_id']}")`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">cURL</h3>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/analyze \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sua_api_key_aqui" \\
  -d '{
    "repository_url": "https://github.com/user/repo",
    "repository_type": "github"
  }'`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Receba notificações quando análises terminarem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Como Funciona</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Ao enviar uma análise, você pode incluir um webhook_url. Quando a análise terminar, enviaremos um POST
                  para essa URL com os resultados.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payload do Webhook</h3>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {`{
  "event": "analysis.completed",
  "analysis_id": "uuid",
  "status": "completed",
  "repository_name": "meu-projeto",
  "cnpj_found": 45,
  "timestamp": "2025-01-15T10:30:00Z"
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Exemplo de Handler</h3>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {`// Express.js
app.post('/webhook', (req, res) => {
  const { event, analysis_id, status } = req.body;
  
  if (event === 'analysis.completed') {
    console.log(\`Análise \${analysis_id} concluída!\`);
    // Processar resultados...
  }
  
  res.status(200).send('OK');
});`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
