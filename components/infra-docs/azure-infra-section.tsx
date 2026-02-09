"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Server,
  Shield,
  Database,
  HardDrive,
  Network,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Container,
  Globe,
} from "lucide-react"

const azureServices = [
  {
    name: "Azure App Service",
    category: "Compute",
    icon: Globe,
    purpose: "Hospedar a aplicacao Next.js (alternativa: Azure Container Apps)",
    config: `App Service Plan: cnpj-detector-plan
  SKU: P2v3 (4 vCPU, 16 GB RAM)
  OS: Linux
  
App Service: cnpj-detector-app
  Runtime: Node.js 20 LTS
  Always On: Enabled
  HTTP/2: Enabled
  Min TLS: 1.2
  
Auto Scale:
  - Min instances: 2
  - Max instances: 10
  - Scale rule: CPU > 70% por 5 min
  - Cool down: 5 min

Deployment Slots:
  - Production
  - Staging (swap deployment)

Custom Domain:
  - cnpj-detector.seudominio.com.br
  - Managed Certificate (gratuito)`,
    notes: "App Service e a opcao mais simples. Para containers, use Azure Container Apps com Dapr.",
  },
  {
    name: "Azure Container Apps (Alternativa)",
    category: "Compute",
    icon: Container,
    purpose: "Hospedar containers Docker com auto-scaling serverless",
    config: `Container Apps Environment: cnpj-detector-env
  Region: Brazil South
  
Container App: cnpj-detector-web
  Image: cnpjdetectoracr.azurecr.io/cnpj-detector:latest
  CPU: 1.0
  Memory: 2.0 Gi
  
Ingress:
  - External: true
  - Target Port: 3000
  - Transport: Auto
  
Scale Rules:
  - Min replicas: 2
  - Max replicas: 10
  - HTTP concurrent requests: 50
  
Env Variables:
  - Secrets via Azure Key Vault references`,
    notes: "Container Apps oferece auto-scaling serverless com cobranca por consumo. Ideal para workloads variaveis.",
  },
  {
    name: "Azure SQL Database",
    category: "Database",
    icon: Database,
    purpose: "SQL Server gerenciado para scan de CNPJs em bancos clientes",
    config: `Server: cnpj-detector-sql.database.windows.net

Database: CnpjDetectorDB
  Service Tier: General Purpose
  Compute: Provisioned
  vCores: 4
  Storage: 100 GB (max 4 TB)
  
High Availability:
  - Zone redundant: Sim (producao)
  - Geo-replication: Opcional (DR)
  
Backup:
  - PITR: 7 dias (Retention)
  - LTR: Monthly (12 meses)

Security:
  - TDE: Enabled (Transparent Data Encryption)
  - Auditing: Enabled -> Storage Account
  - Advanced Threat Protection: Enabled
  - Azure AD Authentication: Enabled
  
Firewall Rules:
  - Allow Azure services: Yes
  - App Service outbound IPs: Allowed
  - VNet Service Endpoint: Enabled`,
    notes: "Azure SQL e SQL Server totalmente gerenciado. Para bases maiores, considere Business Critical tier com In-Memory OLTP.",
  },
  {
    name: "Azure Cache for Redis",
    category: "Cache",
    icon: RefreshCw,
    purpose: "Cache, sessoes e rate limiting (alternativa ao Upstash)",
    config: `Name: cnpj-detector-redis
  
SKU:
  - Producao: Standard C2 (6 GB, 2 shards)
  - Homologacao: Basic C1 (1 GB)
  
Configuration:
  - Redis version: 6.x
  - Non-SSL port: Disabled
  - Min TLS: 1.2
  - maxmemory-policy: allkeys-lru
  
Firewall:
  - VNet integration: Enabled
  - Only App Service subnet allowed
  
Obs: Se preferir manter Upstash Redis,
este servico nao e necessario.`,
    notes: "Pode manter o Upstash Redis (serverless) ou migrar para Azure Cache for Redis para menor latencia na mesma VNet.",
  },
  {
    name: "Azure Front Door + WAF",
    category: "Networking / Security",
    icon: Shield,
    purpose: "CDN global, SSL, e Web Application Firewall",
    config: `Front Door: cnpj-detector-fd
  SKU: Standard / Premium
  
Endpoint:
  - cnpj-detector.azurefd.net
  - Custom: cnpj-detector.seudominio.com.br
  
Origin Group:
  - Origin: App Service
  - Health Probe: /api/ping
  - Interval: 30s
  
WAF Policy: cnpj-detector-waf
  Mode: Prevention
  
  Managed Rules:
  - DefaultRuleSet 2.1
  - BotManagerRuleSet 1.0
  
  Custom Rules:
  - Rate Limit: 1000 req / min por IP
  - Geo Filter: Allow BR (opcional)
  
Caching:
  - Static assets: 1 dia
  - API routes: no-cache`,
    notes: "Front Door fornece CDN + WAF + SSL em um unico servico. Para simplicidade, pode usar apenas Application Gateway.",
  },
  {
    name: "Azure Key Vault",
    category: "Security",
    icon: HardDrive,
    purpose: "Gerenciamento seguro de segredos e chaves",
    config: `Key Vault: cnpj-detector-kv
  SKU: Standard
  
Secrets:
  - SUPABASE-URL
  - SUPABASE-SERVICE-ROLE-KEY
  - SUPABASE-ANON-KEY
  - UPSTASH-REDIS-URL
  - UPSTASH-REDIS-TOKEN
  - ENCRYPTION-KEY
  - GITHUB-TOKEN
  - AZURE-DEVOPS-PAT
  - SQL-CONNECTION-STRING
  
Access Policy:
  - App Service: Get, List secrets
  - CI/CD Pipeline: Get secrets
  - Admins: Full access
  
Network:
  - Private endpoint: Enabled
  - Public access: Disabled`,
    notes: "Key Vault integra nativamente com App Service via referencia @Microsoft.KeyVault(SecretUri=...).",
  },
  {
    name: "Azure Monitor + Application Insights",
    category: "Monitoring",
    icon: Network,
    purpose: "Monitoramento, metricas e alertas",
    config: `Application Insights: cnpj-detector-ai
  - Connected to App Service
  - Sampling: Adaptive (5 events/sec)
  - Retention: 90 dias
  
Alerts:
  - CPU > 80% por 5 min
  - Memory > 85% por 5 min
  - Response time > 3s (p95)
  - Error rate > 5%
  - SQL DTU > 80%
  - Redis memory > 80%
  
Action Group:
  - Email: equipe-infra@empresa.com.br
  - SMS: +55 (11) xxxxx-xxxx
  - Azure DevOps Work Item (opcional)
  
Log Analytics Workspace:
  - Retention: 30 dias
  - Queries KQL customizadas`,
    notes: "Application Insights pode ser integrado diretamente no Next.js via @vercel/otel ou OpenTelemetry SDK.",
  },
]

const deploySteps = [
  {
    step: "1",
    title: "Criar Resource Group e Rede",
    desc: "Resource Group e VNet com subnets",
    detail: `# Resource Group
az group create \\
  --name rg-cnpj-detector \\
  --location brazilsouth

# VNet
az network vnet create \\
  --resource-group rg-cnpj-detector \\
  --name vnet-cnpj-detector \\
  --address-prefix 10.0.0.0/16 \\
  --subnet-name snet-app \\
  --subnet-prefix 10.0.1.0/24

# Subnet para banco de dados
az network vnet subnet create \\
  --resource-group rg-cnpj-detector \\
  --vnet-name vnet-cnpj-detector \\
  --name snet-data \\
  --address-prefix 10.0.2.0/24 \\
  --service-endpoints Microsoft.Sql

# Subnet para Redis
az network vnet subnet create \\
  --resource-group rg-cnpj-detector \\
  --vnet-name vnet-cnpj-detector \\
  --name snet-cache \\
  --address-prefix 10.0.3.0/24`,
  },
  {
    step: "2",
    title: "Provisionar Azure SQL Database",
    desc: "SQL Server gerenciado com seguranca",
    detail: `# SQL Server
az sql server create \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-sql \\
  --admin-user sqladmin \\
  --admin-password "<SENHA_FORTE>" \\
  --location brazilsouth

# Database
az sql db create \\
  --resource-group rg-cnpj-detector \\
  --server cnpj-detector-sql \\
  --name CnpjDetectorDB \\
  --service-objective GP_Gen5_4 \\
  --zone-redundant true \\
  --backup-storage-redundancy Geo

# Firewall - permitir servicos Azure
az sql server firewall-rule create \\
  --resource-group rg-cnpj-detector \\
  --server cnpj-detector-sql \\
  --name AllowAzureServices \\
  --start-ip-address 0.0.0.0 \\
  --end-ip-address 0.0.0.0

# VNet Rule
az sql server vnet-rule create \\
  --resource-group rg-cnpj-detector \\
  --server cnpj-detector-sql \\
  --name AllowAppSubnet \\
  --vnet-name vnet-cnpj-detector \\
  --subnet snet-data

# Auditing
az sql server audit-policy update \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-sql \\
  --state Enabled \\
  --storage-account stcnpjdetectorlogs`,
  },
  {
    step: "3",
    title: "Criar App Service",
    desc: "Aplicacao Next.js com Node.js 20",
    detail: `# App Service Plan
az appservice plan create \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-plan \\
  --sku P2v3 \\
  --is-linux

# App Service
az webapp create \\
  --resource-group rg-cnpj-detector \\
  --plan cnpj-detector-plan \\
  --name cnpj-detector-app \\
  --runtime "NODE:20-lts"

# VNet Integration
az webapp vnet-integration add \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-app \\
  --vnet vnet-cnpj-detector \\
  --subnet snet-app

# Always On + HTTP/2
az webapp config set \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-app \\
  --always-on true \\
  --http20-enabled true \\
  --min-tls-version 1.2

# Staging Slot
az webapp deployment slot create \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-app \\
  --slot staging`,
  },
  {
    step: "4",
    title: "Configurar Key Vault e Secrets",
    desc: "Armazenar segredos de forma segura",
    detail: `# Key Vault
az keyvault create \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-kv \\
  --location brazilsouth \\
  --enable-soft-delete true

# Adicionar Secrets
az keyvault secret set --vault-name cnpj-detector-kv \\
  --name "SUPABASE-URL" --value "https://xxx.supabase.co"
az keyvault secret set --vault-name cnpj-detector-kv \\
  --name "SUPABASE-SERVICE-ROLE-KEY" --value "eyJ..."
az keyvault secret set --vault-name cnpj-detector-kv \\
  --name "ENCRYPTION-KEY" --value "..."

# Dar acesso ao App Service (Managed Identity)
az webapp identity assign \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-app

PRINCIPAL_ID=$(az webapp identity show \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-app \\
  --query principalId -o tsv)

az keyvault set-policy \\
  --name cnpj-detector-kv \\
  --object-id $PRINCIPAL_ID \\
  --secret-permissions get list

# Referencia no App Service
az webapp config appsettings set \\
  --resource-group rg-cnpj-detector \\
  --name cnpj-detector-app \\
  --settings \\
    SUPABASE_URL="@Microsoft.KeyVault(SecretUri=https://cnpj-detector-kv.vault.azure.net/secrets/SUPABASE-URL)" \\
    SUPABASE_SERVICE_ROLE_KEY="@Microsoft.KeyVault(SecretUri=https://cnpj-detector-kv.vault.azure.net/secrets/SUPABASE-SERVICE-ROLE-KEY)"`,
  },
  {
    step: "5",
    title: "Front Door + WAF + Monitoramento",
    desc: "CDN, protecao e observabilidade",
    detail: `# Front Door
az afd profile create \\
  --resource-group rg-cnpj-detector \\
  --profile-name cnpj-detector-fd \\
  --sku Standard_AzureFrontDoor

# WAF Policy
az network front-door waf-policy create \\
  --resource-group rg-cnpj-detector \\
  --name cnpjDetectorWaf \\
  --mode Prevention

# Application Insights
az monitor app-insights component create \\
  --resource-group rg-cnpj-detector \\
  --app cnpj-detector-ai \\
  --location brazilsouth \\
  --application-type web

# Alert - High CPU
az monitor metrics alert create \\
  --resource-group rg-cnpj-detector \\
  --name "High-CPU-Alert" \\
  --scopes "/subscriptions/{sub}/resourceGroups/rg-cnpj-detector/providers/Microsoft.Web/sites/cnpj-detector-app" \\
  --condition "avg CpuPercentage > 80" \\
  --window-size 5m \\
  --action "/subscriptions/{sub}/resourceGroups/rg-cnpj-detector/providers/microsoft.insights/actionGroups/infra-team"`,
  },
]

export function AzureInfraSection() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Infraestrutura Azure
          </CardTitle>
          <CardDescription>
            Arquitetura recomendada para implantacao do CNPJ Detector no Microsoft Azure.
            Regiao recomendada: <strong>Brazil South (Sao Paulo)</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-6 font-mono text-sm">
            <pre className="whitespace-pre-wrap text-foreground">{`
Azure Region: Brazil South (Sao Paulo)

+-----------------------------------------------------------+
|                  Azure Front Door + WAF                    |
|            CDN + SSL + DDoS + Rate Limiting                |
+----------------------------+------------------------------+
                             |
+----------------------------+------------------------------+
|                   App Service / Container Apps             |
|            Node.js 20 LTS | P2v3 (4vCPU/16GB)            |
|            Auto-scale: 2 - 10 instances                    |
+-------+------------------+--------------------+----------+
        |                  |                     |
+-------+------+  +--------+--------+  +--------+---------+
|   Supabase   |  | Azure Cache for |  |   Azure SQL      |
|   (externo)  |  | Redis           |  |   Database       |
|   Postgres   |  | Standard C2     |  |   GP Gen5 4vCore |
|   Auth/RLS   |  | 6 GB            |  |   Zone Redundant |
+--------------+  +-----------------+  +------------------+
        |
+-------+------+
| Azure Key    |
| Vault        |
| (Secrets)    |
+--------------+

VNet: 10.0.0.0/16
  snet-app:   10.0.1.0/24  (App Service)
  snet-data:  10.0.2.0/24  (SQL + Private Endpoints)
  snet-cache: 10.0.3.0/24  (Redis)
`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Services Detail */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Servicos Azure Necessarios</h2>
        <Accordion type="multiple" className="space-y-2">
          {azureServices.map((service) => (
            <AccordionItem key={service.name} value={service.name} className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <service.icon className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{service.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({service.category})</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">{service.purpose}</p>
                <div className="rounded-md bg-muted/50 p-4 font-mono text-xs">
                  <pre className="whitespace-pre-wrap text-foreground">{service.config}</pre>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-border bg-card p-3">
                  <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">{service.notes}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Deploy Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Passo a Passo de Deploy (Azure CLI)
          </CardTitle>
          <CardDescription>
            Sequencia de comandos para provisionar a infraestrutura completa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {deploySteps.map((step) => (
              <div key={step.step} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
                <div className="ml-11 rounded-md bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                  <pre className="whitespace-pre-wrap text-foreground">{step.detail}</pre>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Implantacao Azure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              "Resource Group em Brazil South",
              "VNet com subnets segregadas",
              "App Service Plan P2v3+ com auto-scale",
              "Azure SQL Database (GP Gen5 4vCores)",
              "Azure Cache for Redis ou Upstash",
              "Key Vault com Managed Identity",
              "Front Door + WAF em modo Prevention",
              "Application Insights configurado",
              "Alerts para CPU, memoria e erros",
              "Deployment Slots (staging + production)",
              "Custom Domain + Managed Certificate",
              "VNet Integration para App Service",
              "Private Endpoints para SQL e Redis",
              "Azure AD Authentication para SQL",
              "Backup e Geo-replication configurados",
              "Azure DevOps Pipeline ou GitHub Actions",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CI/CD */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline CI/CD (Azure DevOps)</CardTitle>
          <CardDescription>Exemplo de azure-pipelines.yml para deploy automatizado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre-wrap text-foreground">{`trigger:
  branches:
    include:
      - main
      - release/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  azureSubscription: 'cnpj-detector-connection'
  appName: 'cnpj-detector-app'
  nodeVersion: '20.x'

stages:
  - stage: Build
    jobs:
      - job: BuildApp
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)

          - script: |
              npm ci
              npm run build
              npm run test
            displayName: 'Install, Build, Test'

          - task: ArchiveFiles@2
            inputs:
              rootFolderOrFile: '$(System.DefaultWorkingDirectory)'
              includeRootFolder: false
              archiveFile: '$(Build.ArtifactStagingDirectory)/app.zip'

          - publish: $(Build.ArtifactStagingDirectory)/app.zip
            artifact: drop

  - stage: DeployStaging
    dependsOn: Build
    jobs:
      - deployment: DeployToStaging
        environment: 'staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: $(azureSubscription)
                    appName: $(appName)
                    slotName: 'staging'
                    package: '$(Pipeline.Workspace)/drop/app.zip'

  - stage: DeployProduction
    dependsOn: DeployStaging
    condition: succeeded()
    jobs:
      - deployment: SwapToProduction
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureAppServiceManage@0
                  inputs:
                    azureSubscription: $(azureSubscription)
                    action: 'Swap Slots'
                    webAppName: $(appName)
                    sourceSlot: 'staging'
                    targetSlot: 'production'`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
