"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Network,
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

const securityLayers = [
  {
    layer: "Camada 1 - Perimetro",
    color: "bg-destructive/15 text-destructive",
    items: [
      { name: "WAF (AWS WAF / Azure Front Door WAF)", desc: "OWASP Top 10, SQL injection, XSS" },
      { name: "DDoS Protection", desc: "AWS Shield Standard / Azure DDoS Protection" },
      { name: "Rate Limiting (WAF)", desc: "2000 req / 5 min por IP no WAF" },
      { name: "Geo Restriction", desc: "Permitir apenas Brasil (opcional)" },
    ],
  },
  {
    layer: "Camada 2 - Rede",
    color: "bg-chart-3/15 text-chart-3",
    items: [
      { name: "VPC / VNet", desc: "Isolamento de rede (10.0.0.0/16)" },
      { name: "Subnets privadas", desc: "ECS/App Service, RDS/SQL, Redis sem IP publico" },
      { name: "Security Groups / NSG", desc: "Regras firewall por servico" },
      { name: "NAT Gateway", desc: "Saida controlada para internet" },
      { name: "Private Endpoints", desc: "Acesso privado a SQL e Redis" },
    ],
  },
  {
    layer: "Camada 3 - Aplicacao",
    color: "bg-primary/15 text-primary",
    items: [
      { name: "HTTPS obrigatorio", desc: "HSTS habilitado (max-age=63072000)" },
      { name: "Security Headers", desc: "CSP, X-Frame-Options, X-Content-Type, CORS" },
      { name: "Rate Limiting (App)", desc: "5 req/s por IP via Upstash Redis" },
      { name: "Input Validation", desc: "Zod schemas em todas as rotas" },
      { name: "CSRF Protection", desc: "Token-based CSRF" },
    ],
  },
  {
    layer: "Camada 4 - Autenticacao",
    color: "bg-chart-5/15 text-chart-5",
    items: [
      { name: "Supabase Auth", desc: "JWT + bcrypt password hashing" },
      { name: "2FA (TOTP)", desc: "Obrigatorio para admins (otplib)" },
      { name: "Session Management", desc: "Redis-backed, timeout 30 min" },
      { name: "Account Lockout", desc: "5 tentativas -> bloqueio temporario" },
      { name: "IP Whitelisting", desc: "Para acesso admin (configuravel)" },
    ],
  },
  {
    layer: "Camada 5 - Dados",
    color: "bg-chart-4/15 text-chart-4",
    items: [
      { name: "RLS (Row Level Security)", desc: "Isolamento multi-tenant por client_id" },
      { name: "Encryption at Rest", desc: "AES-256 (RDS TDE / Azure SQL TDE)" },
      { name: "Encryption in Transit", desc: "TLS 1.2+ obrigatorio" },
      { name: "Connection String Encryption", desc: "AES-256 no banco (ENCRYPTION_KEY)" },
      { name: "Secrets Management", desc: "AWS Secrets Manager / Azure Key Vault" },
    ],
  },
]

const securityGroups = {
  aws: [
    {
      name: "sg-alb",
      desc: "Application Load Balancer",
      inbound: [
        { port: "443", source: "0.0.0.0/0", desc: "HTTPS publico" },
        { port: "80", source: "0.0.0.0/0", desc: "HTTP (redirect)" },
      ],
      outbound: [
        { port: "3000", dest: "sg-ecs", desc: "ECS Tasks" },
      ],
    },
    {
      name: "sg-ecs",
      desc: "ECS Fargate Tasks",
      inbound: [
        { port: "3000", source: "sg-alb", desc: "Do ALB" },
      ],
      outbound: [
        { port: "1433", dest: "sg-rds", desc: "SQL Server" },
        { port: "6379", dest: "sg-redis", desc: "Redis" },
        { port: "443", dest: "0.0.0.0/0", desc: "Internet (Supabase, GitHub)" },
      ],
    },
    {
      name: "sg-rds",
      desc: "RDS SQL Server",
      inbound: [
        { port: "1433", source: "sg-ecs", desc: "Do ECS" },
      ],
      outbound: [],
    },
    {
      name: "sg-redis",
      desc: "ElastiCache Redis",
      inbound: [
        { port: "6379", source: "sg-ecs", desc: "Do ECS" },
      ],
      outbound: [],
    },
  ],
  azure: [
    {
      name: "nsg-app",
      desc: "App Service Subnet",
      inbound: [
        { port: "443", source: "Front Door", desc: "Do Front Door" },
      ],
      outbound: [
        { port: "1433", dest: "snet-data", desc: "Azure SQL" },
        { port: "6380", dest: "snet-cache", desc: "Redis (SSL)" },
        { port: "443", dest: "Internet", desc: "Supabase, GitHub" },
      ],
    },
    {
      name: "nsg-data",
      desc: "Data Subnet (SQL + Key Vault)",
      inbound: [
        { port: "1433", source: "snet-app", desc: "Do App Service" },
      ],
      outbound: [],
    },
    {
      name: "nsg-cache",
      desc: "Cache Subnet (Redis)",
      inbound: [
        { port: "6380", source: "snet-app", desc: "Do App Service" },
      ],
      outbound: [],
    },
  ],
}

const complianceItems = [
  {
    standard: "LGPD",
    items: [
      "Consentimento de coleta de dados implementado",
      "Direito de exclusao (DSAR) implementado",
      "Audit logging de todas as acoes com dados pessoais",
      "Criptografia de dados sensiveis em repouso e transito",
      "Isolamento de dados por cliente (multi-tenant RLS)",
      "Retencao de dados configuravel por cliente",
    ],
  },
  {
    standard: "SOC 2",
    items: [
      "Controle de acesso baseado em roles (RBAC)",
      "Autenticacao multi-fator (2FA) para admins",
      "Audit trail completo de todas as operacoes",
      "Monitoramento e alertas de seguranca",
      "Backup e recuperacao de desastres",
      "Politica de retencao de logs (12 meses)",
    ],
  },
  {
    standard: "PCI DSS (se aplicavel)",
    items: [
      "Dados de CNPJ nao sao dados de cartao, mas boas praticas se aplicam",
      "Criptografia AES-256 para dados sensiveis",
      "Segmentacao de rede (VPC/VNet)",
      "Acesso restrito por IP e role",
      "Testes de penetracao periodicos recomendados",
    ],
  },
]

export function NetworkDiagram() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Rede e Seguranca
          </CardTitle>
          <CardDescription>
            Topologia de rede, security groups, e camadas de seguranca para o CNPJ Detector.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Security Layers */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Camadas de Seguranca (Defense in Depth)
        </h2>
        <div className="space-y-4">
          {securityLayers.map((layer) => (
            <Card key={layer.layer}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="secondary" className={layer.color}>
                    {layer.layer}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {layer.items.map((item) => (
                    <div key={item.name} className="rounded-md border border-border p-3 space-y-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Groups - AWS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security Groups (AWS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {securityGroups.aws.map((sg) => (
            <div key={sg.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground">{sg.name}</code>
                <span className="text-sm text-muted-foreground">{sg.desc}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-1.5 pr-3 text-left font-medium text-foreground">Direcao</th>
                      <th className="py-1.5 pr-3 text-left font-medium text-foreground">Porta</th>
                      <th className="py-1.5 pr-3 text-left font-medium text-foreground">Origem/Destino</th>
                      <th className="py-1.5 text-left font-medium text-foreground">Descricao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sg.inbound.map((rule, i) => (
                      <tr key={`in-${i}`} className="border-b border-border/50">
                        <td className="py-1.5 pr-3">
                          <Badge variant="secondary" className="bg-chart-2/15 text-chart-2 text-xs">INBOUND</Badge>
                        </td>
                        <td className="py-1.5 pr-3 font-mono text-foreground">{rule.port}</td>
                        <td className="py-1.5 pr-3 font-mono text-muted-foreground">{rule.source}</td>
                        <td className="py-1.5 text-muted-foreground">{rule.desc}</td>
                      </tr>
                    ))}
                    {sg.outbound.map((rule, i) => (
                      <tr key={`out-${i}`} className="border-b border-border/50">
                        <td className="py-1.5 pr-3">
                          <Badge variant="secondary" className="bg-chart-5/15 text-chart-5 text-xs">OUTBOUND</Badge>
                        </td>
                        <td className="py-1.5 pr-3 font-mono text-foreground">{rule.port}</td>
                        <td className="py-1.5 pr-3 font-mono text-muted-foreground">{rule.dest}</td>
                        <td className="py-1.5 text-muted-foreground">{rule.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* NSGs - Azure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Network Security Groups (Azure)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {securityGroups.azure.map((nsg) => (
            <div key={nsg.name} className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground">{nsg.name}</code>
                <span className="text-sm text-muted-foreground">{nsg.desc}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-1.5 pr-3 text-left font-medium text-foreground">Direcao</th>
                      <th className="py-1.5 pr-3 text-left font-medium text-foreground">Porta</th>
                      <th className="py-1.5 pr-3 text-left font-medium text-foreground">Origem/Destino</th>
                      <th className="py-1.5 text-left font-medium text-foreground">Descricao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nsg.inbound.map((rule, i) => (
                      <tr key={`in-${i}`} className="border-b border-border/50">
                        <td className="py-1.5 pr-3">
                          <Badge variant="secondary" className="bg-chart-2/15 text-chart-2 text-xs">INBOUND</Badge>
                        </td>
                        <td className="py-1.5 pr-3 font-mono text-foreground">{rule.port}</td>
                        <td className="py-1.5 pr-3 font-mono text-muted-foreground">{rule.source}</td>
                        <td className="py-1.5 text-muted-foreground">{rule.desc}</td>
                      </tr>
                    ))}
                    {nsg.outbound.map((rule, i) => (
                      <tr key={`out-${i}`} className="border-b border-border/50">
                        <td className="py-1.5 pr-3">
                          <Badge variant="secondary" className="bg-chart-5/15 text-chart-5 text-xs">OUTBOUND</Badge>
                        </td>
                        <td className="py-1.5 pr-3 font-mono text-foreground">{rule.port}</td>
                        <td className="py-1.5 pr-3 font-mono text-muted-foreground">{rule.dest}</td>
                        <td className="py-1.5 text-muted-foreground">{rule.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Conformidade e Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {complianceItems.map((compliance) => (
            <div key={compliance.standard} className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">{compliance.standard}</h3>
              <div className="grid gap-1.5">
                {compliance.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-chart-2 shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ports Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portas Utilizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 text-left font-medium text-foreground">Porta</th>
                  <th className="py-2 pr-4 text-left font-medium text-foreground">Protocolo</th>
                  <th className="py-2 pr-4 text-left font-medium text-foreground">Servico</th>
                  <th className="py-2 text-left font-medium text-foreground">Exposicao</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { port: "443", proto: "HTTPS", service: "ALB / Front Door", exposure: "Publica" },
                  { port: "80", proto: "HTTP", service: "Redirect para HTTPS", exposure: "Publica" },
                  { port: "3000", proto: "HTTP", service: "Next.js (interna)", exposure: "Privada" },
                  { port: "1433", proto: "TDS", service: "SQL Server", exposure: "Privada" },
                  { port: "6379", proto: "RESP", service: "Redis", exposure: "Privada" },
                  { port: "6380", proto: "RESP+TLS", service: "Redis (Azure SSL)", exposure: "Privada" },
                  { port: "5432", proto: "PostgreSQL", service: "Supabase (externo)", exposure: "Internet (TLS)" },
                ].map((row) => (
                  <tr key={row.port + row.service} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-foreground">{row.port}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{row.proto}</td>
                    <td className="py-2 pr-4 text-foreground">{row.service}</td>
                    <td className="py-2">
                      <Badge
                        variant="secondary"
                        className={
                          row.exposure === "Publica"
                            ? "bg-destructive/15 text-destructive"
                            : row.exposure === "Privada"
                              ? "bg-chart-2/15 text-chart-2"
                              : "bg-chart-3/15 text-chart-3"
                        }
                      >
                        {row.exposure}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
