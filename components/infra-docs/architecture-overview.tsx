"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Globe,
  Server,
  Database,
  Shield,
  Layers,
  GitBranch,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react"

const stackItems = [
  {
    category: "Frontend / SSR",
    icon: Globe,
    items: [
      { name: "Next.js 16", detail: "App Router + React 19.2" },
      { name: "Tailwind CSS 4", detail: "+ shadcn/ui" },
      { name: "TypeScript 5.7", detail: "Tipagem estatica" },
      { name: "Monaco Editor", detail: "Editor de codigo inline" },
    ],
  },
  {
    category: "Backend / API",
    icon: Server,
    items: [
      { name: "Next.js API Routes", detail: "REST + Server Actions" },
      { name: "SQL Server", detail: "Banco principal da aplicacao" },
      { name: "Upstash Redis", detail: "Cache + Rate Limiting" },
      { name: "Worker System", detail: "Jobs assincronos" },
    ],
  },
  {
    category: "Banco de Dados",
    icon: Database,
    items: [
      { name: "SQL Server", detail: "Banco principal + Scan de CNPJs" },
      { name: "Oracle DB", detail: "Scan de CNPJs em bancos clientes" },
      { name: "Redis", detail: "Cache, sessoes, rate limit" },
    ],
  },
  {
    category: "Integracoes",
    icon: GitBranch,
    items: [
      { name: "GitHub API", detail: "@octokit/rest" },
      { name: "Azure DevOps", detail: "REST API v7.0" },
      { name: "GitLab API", detail: "Axios-based client" },
      { name: "mssql (npm)", detail: "Conector SQL Server" },
    ],
  },
  {
    category: "Seguranca",
    icon: Shield,
    items: [
      { name: "2FA (TOTP)", detail: "Obrigatorio para admins" },
      { name: "bcrypt", detail: "Hash de senhas" },
      { name: "CSRF Protection", detail: "Token-based" },
      { name: "RLS", detail: "Row Level Security (SQL Server)" },
    ],
  },
  {
    category: "Monitoramento",
    icon: Monitor,
    items: [
      { name: "Audit Logging", detail: "Todas as acoes rastreadas" },
      { name: "Error Tracking", detail: "Logger centralizado" },
      { name: "Metrics", detail: "Performance e uso" },
      { name: "Alerts", detail: "Sistema de alertas" },
    ],
  },
]

const environments = [
  {
    name: "Desenvolvimento",
    color: "bg-chart-3/15 text-chart-3",
    desc: "Local + SQL Server Dev",
    specs: "Node.js 20+, 8GB RAM, SSD",
  },
  {
    name: "Homologacao / QA",
    color: "bg-chart-5/15 text-chart-5",
    desc: "Cloud staging isolado",
    specs: "Replica de producao em escala reduzida",
  },
  {
    name: "Producao",
    color: "bg-primary/15 text-primary",
    desc: "AWS ou Azure + SQL Server",
    specs: "HA, auto-scaling, backup, DR",
  },
]

const envVars = [
  { key: "SQL_SERVER_HOST", desc: "Host do SQL Server principal", required: true },
  { key: "SQL_SERVER_PORT", desc: "Porta do SQL Server (padrao 1433)", required: true },
  { key: "SQL_SERVER_DATABASE", desc: "Nome do banco de dados", required: true },
  { key: "SQL_SERVER_USER", desc: "Usuario de conexao", required: true },
  { key: "SQL_SERVER_PASSWORD", desc: "Senha de conexao (armazenada em Key Vault / Secrets Manager)", required: true },
  { key: "UPSTASH_REDIS_REST_URL", desc: "URL do Redis (Upstash)", required: true },
  { key: "UPSTASH_REDIS_REST_TOKEN", desc: "Token do Redis (Upstash)", required: true },
  { key: "ENCRYPTION_KEY", desc: "Chave de criptografia AES", required: true },
  { key: "GITHUB_TOKEN", desc: "Token de acesso GitHub", required: false },
  { key: "AZURE_DEVOPS_TOKEN", desc: "PAT do Azure DevOps", required: false },
  { key: "AZURE_DEVOPS_ORG", desc: "Organizacao Azure DevOps", required: false },
]

export function ArchitectureOverview() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Visao Geral da Arquitetura
          </CardTitle>
          <CardDescription>
            O CNPJ Detector e um sistema multi-tenant para deteccao, analise e migracao de campos
            CNPJ para o formato alfanumerico. A aplicacao possui duas frentes: uma aplicacao web
            Next.js (SSR/SSG) e um desktop WPF (.NET 8) que compartilham o mesmo banco de dados
            SQL Server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-6 font-mono text-sm leading-relaxed">
            <pre className="whitespace-pre-wrap text-foreground">{`
+------------------------------------------------------------------+
|                        INTERNET / CDN                             |
|                   (Cloudflare / CloudFront)                       |
+----------------------------------+-------------------------------+
                                   |
                                   v
+------------------------------------------------------------------+
|                    LOAD BALANCER / WAF                            |
|                (ALB / App Gateway + WAF)                          |
+----------------------------------+-------------------------------+
                                   |
              +--------------------+--------------------+
              |                                         |
              v                                         v
+---------------------------+           +---------------------------+
|     WEB APP (Next.js)     |           |    WPF DESKTOP (.NET 8)   |
|    ---------------------- |           |    -----------------       |
|    - App Router (SSR)     |           |    - MVVM Pattern         |
|    - API Routes           |           |    - Clean Architecture   |
|    - React 19             |           |    - SQL Server SDK       |
|    - Worker System        |           |    - LibGit2Sharp         |
+----------+---------+-----+           +-----------+---------------+
           |         |                              |
           v         v                              v
+------------------+ +------------------+ +------------------+
|   SQL SERVER     | |   UPSTASH REDIS  | |  SQL SERVER      |
|   (Principal)    | |   (Cache)        | |  (Clientes)      |
|   -----------    | |   -----------    | |  -----------      |
|   - Auth         | |   - Sessions    | |  - Scan CNPJ     |
|   - RLS          | |   - Rate Limit  | |  - mssql driver  |
|   - Dados App    | |   - Job Queue   | |  - INFORMATION    |
|   - Multi-tenant | |                  | |    _SCHEMA scan  |
+------------------+ +------------------+ +------------------+

+------------------------------------------------------------------+
|                   INTEGRACOES EXTERNAS                            |
|   GitHub API  |  Azure DevOps API  |  GitLab API  |  Oracle DB   |
+------------------------------------------------------------------+
`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Stack */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stackItems.map((section) => (
          <Card key={section.category}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <section.icon className="h-4 w-4 text-primary" />
                {section.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2"
                >
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.detail}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Environments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Ambientes Requeridos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {environments.map((env) => (
              <div
                key={env.name}
                className="rounded-lg border border-border p-4 space-y-2"
              >
                <Badge variant="secondary" className={env.color}>
                  {env.name}
                </Badge>
                <p className="text-sm font-medium text-foreground">{env.desc}</p>
                <p className="text-xs text-muted-foreground">{env.specs}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Env Vars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            Variaveis de Ambiente
          </CardTitle>
          <CardDescription>
            Variaveis que devem ser configuradas em cada ambiente de implantacao.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 text-left font-medium text-foreground">Variavel</th>
                  <th className="py-2 pr-4 text-left font-medium text-foreground">Descricao</th>
                  <th className="py-2 text-left font-medium text-foreground">Obrigatoria</th>
                </tr>
              </thead>
              <tbody>
                {envVars.map((v) => (
                  <tr key={v.key} className="border-b border-border/50">
                    <td className="py-2.5 pr-4">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                        {v.key}
                      </code>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{v.desc}</td>
                    <td className="py-2.5">
                      {v.required ? (
                        <Badge variant="destructive" className="text-xs">
                          Sim
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Opcional
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Multi-tenant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            Arquitetura Multi-Tenant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O sistema utiliza isolamento de dados por <code className="rounded bg-muted px-1 text-foreground">client_id</code> em
            todas as tabelas via Row Level Security (RLS) no SQL Server. Cada cliente possui seu
            proprio namespace com admins e desenvolvedores isolados.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap text-foreground">{`
Super Admin (role: admin)
|
+-- Cliente A (client_id: uuid-aaa)
|   +-- Admin Client A1 (role: admin_client)
|   +-- Admin Client A2 (role: admin_client)
|   +-- Dev A1 (role: developer)
|   +-- Dev A2 (role: developer)
|   +-- Dev A3 (role: developer)
|
+-- Cliente B (client_id: uuid-bbb)
    +-- Admin Client B1 (role: admin_client)
    +-- Dev B1 (role: developer)
    +-- Dev B2 (role: developer)

Isolamento: RLS garante que Cliente A NUNCA
acessa dados do Cliente B e vice-versa.
`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
