"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"

const awsCosts = {
  title: "AWS - Estimativa Mensal (sa-east-1)",
  items: [
    { service: "ECS Fargate (2 tasks, 1vCPU, 2GB)", monthly: 120, notes: "Auto-scale pode aumentar" },
    { service: "ALB (Application Load Balancer)", monthly: 25, notes: "Custo fixo + LCU" },
    { service: "RDS SQL Server Standard (db.m6i.xlarge, Multi-AZ)", monthly: 680, notes: "Licenca inclusa" },
    { service: "ElastiCache Redis (cache.m6g.large)", monthly: 180, notes: "Substitui Upstash" },
    { service: "ECR (Container Registry)", monthly: 5, notes: "10 images / 2GB" },
    { service: "WAF (Web ACL + Rules)", monthly: 25, notes: "Managed rules" },
    { service: "CloudWatch (Logs + Metrics + Alarms)", monthly: 30, notes: "Depende do volume" },
    { service: "Route 53 (DNS)", monthly: 1, notes: "1 hosted zone" },
    { service: "NAT Gateway", monthly: 45, notes: "Fixo + trafego" },
    { service: "ACM (SSL Certificate)", monthly: 0, notes: "Gratuito" },
    { service: "Secrets Manager (10 secrets)", monthly: 5, notes: "~$0.40 por secret" },
    { service: "Data Transfer (estimativa)", monthly: 20, notes: "Depende do uso" },
  ],
}

const azureCosts = {
  title: "Azure - Estimativa Mensal (Brazil South)",
  items: [
    { service: "App Service (P2v3, 2 instances)", monthly: 400, notes: "Auto-scale pode aumentar" },
    { service: "Azure SQL Database (GP Gen5 4vCores)", monthly: 550, notes: "Zone redundant" },
    { service: "Azure Cache for Redis (Standard C2)", monthly: 200, notes: "Substitui Upstash" },
    { service: "Azure Front Door (Standard)", monthly: 35, notes: "CDN + WAF" },
    { service: "WAF Policy", monthly: 20, notes: "Managed rules" },
    { service: "Application Insights", monthly: 15, notes: "5GB logs/mes" },
    { service: "Key Vault (10 secrets, 10k ops)", monthly: 3, notes: "HSM nao incluso" },
    { service: "Log Analytics Workspace", monthly: 10, notes: "30 dias retencao" },
    { service: "Managed Certificate", monthly: 0, notes: "Gratuito" },
    { service: "Azure Monitor Alerts (5 rules)", monthly: 5, notes: "~$0.10/regra" },
    { service: "Data Transfer (estimativa)", monthly: 15, notes: "Depende do uso" },
  ],
}

const savingTips = [
  {
    tip: "Usar Upstash Redis em vez de ElastiCache/Azure Cache",
    saving: "~$180-200/mes",
    desc: "Upstash e serverless com free tier generoso. Para volumes baixos/medios, pode ser suficiente e muito mais barato.",
  },
  {
    tip: "Reserved Instances (1 ano) para SQL Server",
    saving: "~30-40% no RDS/Azure SQL",
    desc: "Se o projeto e de longo prazo, RI reduz significativamente o custo de banco de dados.",
  },
  {
    tip: "Usar Vercel para hospedar o Next.js",
    saving: "~$120-400/mes em compute",
    desc: "Em vez de ECS/App Service, hospedar no Vercel (Pro $20/mes) e usar apenas o cloud para SQL Server.",
  },
  {
    tip: "Savings Plans (AWS) / Reservations (Azure)",
    saving: "~20-30% em compute",
    desc: "Compromisso de 1 ou 3 anos para compute reduz custos significativamente.",
  },
  {
    tip: "Ambiente de homologacao com recursos menores",
    saving: "~50-60% em staging",
    desc: "Usar instancias menores (1/4 do tamanho de producao) para staging/QA.",
  },
  {
    tip: "Desligar homologacao fora do horario",
    saving: "~70% em staging",
    desc: "Agendar desligamento as 20h e ligamento as 8h em dias uteis.",
  },
]

function CostTable({ data }: { data: typeof awsCosts }) {
  const total = data.items.reduce((sum, item) => sum + item.monthly, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 text-left font-medium text-foreground">Servico</th>
                <th className="py-2 pr-4 text-right font-medium text-foreground">Mensal (USD)</th>
                <th className="py-2 text-left font-medium text-foreground">Observacoes</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.service} className="border-b border-border/50">
                  <td className="py-2.5 pr-4 text-foreground">{item.service}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-foreground">
                    ${item.monthly.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground">{item.notes}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td className="py-3 pr-4 font-bold text-foreground">TOTAL ESTIMADO</td>
                <td className="py-3 pr-4 text-right font-mono font-bold text-primary">
                  ${total.toLocaleString()}/mes
                </td>
                <td className="py-3 text-xs text-muted-foreground">
                  ~${(total * 12).toLocaleString()}/ano
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export function CostEstimate() {
  const awsTotal = awsCosts.items.reduce((sum, item) => sum + item.monthly, 0)
  const azureTotal = azureCosts.items.reduce((sum, item) => sum + item.monthly, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Estimativa de Custos
          </CardTitle>
          <CardDescription>
            Estimativas baseadas em precos de fevereiro de 2026 para a regiao de Sao Paulo.
            Os valores sao aproximados e podem variar conforme o uso real.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 rounded-md border border-chart-3/30 bg-chart-3/5 p-3">
            <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" />
            <p className="text-xs text-foreground">
              <strong>Nota:</strong> Os precos listados sao estimativas. Valores reais dependem do consumo,
              regiao exata e descontos aplicaveis (RI, Savings Plans). Consulte a calculadora de precos
              de cada provider para valores precisos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="bg-primary/15 text-primary">
                AWS (sa-east-1)
              </Badge>
              <p className="text-3xl font-bold text-foreground">${awsTotal.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">por mes (estimativa)</p>
              <p className="text-xs text-muted-foreground">~${(awsTotal * 12).toLocaleString()}/ano</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-chart-5/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="bg-chart-5/15 text-chart-5">
                Azure (Brazil South)
              </Badge>
              <p className="text-3xl font-bold text-foreground">${azureTotal.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">por mes (estimativa)</p>
              <p className="text-xs text-muted-foreground">~${(azureTotal * 12).toLocaleString()}/ano</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AWS Detail */}
      <CostTable data={awsCosts} />

      {/* Azure Detail */}
      <CostTable data={azureCosts} />

      {/* Hybrid Option */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Opcao Hibrida (Recomendada para Reducao de Custo)
          </CardTitle>
          <CardDescription>
            Combinar Vercel (Next.js) + Cloud (SQL Server) para otimizar custos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 text-left font-medium text-foreground">Servico</th>
                  <th className="py-2 pr-4 text-left font-medium text-foreground">Provider</th>
                  <th className="py-2 pr-4 text-right font-medium text-foreground">Mensal (USD)</th>
                  <th className="py-2 text-left font-medium text-foreground">Observacoes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { service: "Next.js App (SSR + API)", provider: "Vercel Pro", monthly: 20, notes: "Hosting otimizado" },
                  { service: "Supabase (PostgreSQL + Auth)", provider: "Supabase Pro", monthly: 25, notes: "Banco principal" },
                  { service: "Upstash Redis", provider: "Upstash", monthly: 10, notes: "Cache + rate limit" },
                  { service: "SQL Server (scan de CNPJs)", provider: "AWS RDS ou Azure SQL", monthly: 550, notes: "Banco dos clientes" },
                  { service: "DNS + SSL", provider: "Vercel/Cloudflare", monthly: 0, notes: "Incluido" },
                ].map((item) => (
                  <tr key={item.service} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 text-foreground">{item.service}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{item.provider}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-foreground">
                      ${item.monthly}
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan={2} className="py-3 pr-4 font-bold text-foreground">TOTAL HIBRIDO</td>
                  <td className="py-3 pr-4 text-right font-mono font-bold text-chart-2">
                    $605/mes
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">
                    ~$7,260/ano
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-4 rounded-md border border-chart-2/30 bg-chart-2/5 p-3">
            <p className="text-xs text-foreground">
              <strong>Economia:</strong> A opcao hibrida pode economizar entre $500-650/mes (~45-50%) comparado ao
              deploy completo em AWS ou Azure, mantendo a mesma funcionalidade e performance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Saving Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas de Otimizacao de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savingTips.map((tip) => (
              <div key={tip.tip} className="rounded-lg border border-border p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{tip.tip}</p>
                  <Badge variant="secondary" className="bg-chart-2/15 text-chart-2 shrink-0">
                    {tip.saving}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{tip.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
