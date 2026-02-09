"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Cloud,
  Server,
  Shield,
  Database,
  HardDrive,
  Network,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
} from "lucide-react"

const awsServices = [
  {
    name: "Amazon ECS (Fargate)",
    category: "Compute",
    icon: Server,
    purpose: "Hospedar a aplicacao Next.js em containers Docker",
    config: `Cluster: cnpj-detector-cluster
Service: cnpj-detector-web
Task Definition:
  - Container: next-app
  - Image: ECR repo (cnpj-detector)
  - CPU: 1024 (1 vCPU)
  - Memory: 2048 MB
  - Port: 3000
  
Auto Scaling:
  - Min: 2 tasks
  - Max: 10 tasks
  - Target CPU: 70%
  - Target Memory: 80%
  - Scale-in cooldown: 300s
  - Scale-out cooldown: 60s`,
    notes: "Fargate elimina a necessidade de gerenciar EC2. Para ambientes menores, uma unica task com 0.5 vCPU e 1GB e suficiente.",
  },
  {
    name: "Application Load Balancer (ALB)",
    category: "Networking",
    icon: Network,
    purpose: "Distribuicao de trafego com SSL termination",
    config: `ALB: cnpj-detector-alb
  Scheme: internet-facing
  
Listeners:
  - HTTP:80 -> Redirect HTTPS:443
  - HTTPS:443 -> Target Group (ECS)
  
Target Group:
  - Protocol: HTTP
  - Port: 3000
  - Health Check: /api/ping
  - Healthy threshold: 3
  - Unhealthy threshold: 3
  - Interval: 30s
  
SSL Certificate:
  - ACM (AWS Certificate Manager)
  - Dominio: cnpj-detector.seudominio.com.br`,
    notes: "O ALB distribui trafego entre as tasks ECS e faz SSL termination com certificado ACM gratuito.",
  },
  {
    name: "Amazon RDS (SQL Server)",
    category: "Database",
    icon: Database,
    purpose: "SQL Server para scan de bancos de dados dos clientes",
    config: `Engine: SQL Server Standard Edition
  Version: 2022
  
Instance Class:
  - Producao: db.m6i.xlarge (4 vCPU, 16GB RAM)
  - Homologacao: db.m6i.large (2 vCPU, 8GB RAM)
  
Storage:
  - Type: gp3
  - Allocated: 100 GB
  - Max: 500 GB
  - IOPS: 3000
  - Throughput: 125 MB/s

Multi-AZ: Sim (producao)
Encryption: AES-256 (at rest)
Backup:
  - Automated: 7 dias
  - Window: 03:00-04:00 UTC
  
Parameter Group: cnpj-detector-sqlserver
  - max_server_memory: 12288 MB
  - cost_threshold_for_parallelism: 25
  - max_degree_of_parallelism: 4`,
    notes: "RDS SQL Server Standard suporta ate 128 GB RAM. Para scan de grandes bases, considere provisioned IOPS.",
  },
  {
    name: "Amazon ElastiCache (Redis)",
    category: "Cache",
    icon: RefreshCw,
    purpose: "Cache, sessoes e rate limiting (alternativa ao Upstash)",
    config: `Engine: Redis 7.x
  
Cluster Mode: Disabled (Replication Group)
  - Primary: 1 node
  - Read Replicas: 1
  
Node Type:
  - Producao: cache.m6g.large (2 vCPU, 6.38 GB)
  - Homologacao: cache.t4g.medium (2 vCPU, 3.09 GB)
  
Encryption:
  - In-transit: TLS enabled
  - At-rest: AES-256
  
Backup:
  - Automated: 7 dias
  - Window: 04:00-05:00 UTC
  
Obs: Se preferir manter Upstash Redis,
este servico nao e necessario.`,
    notes: "Pode manter o Upstash Redis (serverless) ou migrar para ElastiCache para menor latencia dentro da VPC.",
  },
  {
    name: "Amazon ECR",
    category: "Container Registry",
    icon: HardDrive,
    purpose: "Registro de imagens Docker da aplicacao",
    config: `Repository: cnpj-detector
  
Image Scanning:
  - Scan on push: enabled
  - Enhanced scanning: enabled
  
Lifecycle Policy:
  - Manter ultimas 10 tagged images
  - Remover untagged apos 7 dias
  
Encryption: AES-256`,
    notes: "As imagens Docker sao construidas no CI/CD e enviadas ao ECR antes do deploy no ECS.",
  },
  {
    name: "AWS WAF",
    category: "Security",
    icon: Shield,
    purpose: "Firewall de aplicacao web",
    config: `Web ACL: cnpj-detector-waf
  
Rules:
  1. AWS-AWSManagedRulesCommonRuleSet
  2. AWS-AWSManagedRulesSQLiRuleSet
  3. AWS-AWSManagedRulesKnownBadInputsRuleSet
  4. Rate Limiting Rule:
     - Limit: 2000 req / 5 min por IP
  5. Geo Restriction:
     - Allow: BR (opcional)
     
Logging: CloudWatch Logs
Metrics: CloudWatch`,
    notes: "WAF protege contra OWASP Top 10. Rate limiting complementa o rate limiter da aplicacao (Upstash/Redis).",
  },
]

const deploySteps = [
  {
    step: "1",
    title: "Configurar VPC e Subnets",
    desc: "Criar VPC com subnets publicas e privadas em 2+ AZs",
    detail: `# VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Subnets Publicas (ALB)
aws ec2 create-subnet --vpc-id vpc-xxx \\
  --cidr-block 10.0.1.0/24 --availability-zone sa-east-1a
aws ec2 create-subnet --vpc-id vpc-xxx \\
  --cidr-block 10.0.2.0/24 --availability-zone sa-east-1b

# Subnets Privadas (ECS, RDS, Redis)
aws ec2 create-subnet --vpc-id vpc-xxx \\
  --cidr-block 10.0.10.0/24 --availability-zone sa-east-1a
aws ec2 create-subnet --vpc-id vpc-xxx \\
  --cidr-block 10.0.11.0/24 --availability-zone sa-east-1b

# NAT Gateway (para ECS acessar internet)
aws ec2 create-nat-gateway --subnet-id subnet-pub-xxx \\
  --allocation-id eipalloc-xxx`,
  },
  {
    step: "2",
    title: "Criar RDS SQL Server",
    desc: "Provisionar instancia SQL Server no RDS",
    detail: `aws rds create-db-instance \\
  --db-instance-identifier cnpj-detector-sqlserver \\
  --db-instance-class db.m6i.xlarge \\
  --engine sqlserver-se \\
  --engine-version 16.00 \\
  --master-username sa_admin \\
  --master-user-password "<SENHA_FORTE>" \\
  --allocated-storage 100 \\
  --storage-type gp3 \\
  --multi-az \\
  --vpc-security-group-ids sg-xxx \\
  --db-subnet-group-name cnpj-detector-db-subnet \\
  --backup-retention-period 7 \\
  --storage-encrypted \\
  --license-model license-included`,
  },
  {
    step: "3",
    title: "Criar Cluster ECS + ECR",
    desc: "Configurar cluster Fargate e repositorio de imagens",
    detail: `# ECR Repository
aws ecr create-repository --repository-name cnpj-detector

# Build e Push da imagem
docker build -t cnpj-detector .
docker tag cnpj-detector:latest \\
  <ACCOUNT>.dkr.ecr.sa-east-1.amazonaws.com/cnpj-detector:latest
aws ecr get-login-password | docker login --username AWS \\
  --password-stdin <ACCOUNT>.dkr.ecr.sa-east-1.amazonaws.com
docker push <ACCOUNT>.dkr.ecr.sa-east-1.amazonaws.com/cnpj-detector:latest

# ECS Cluster
aws ecs create-cluster --cluster-name cnpj-detector-cluster

# Task Definition (ver arquivo task-definition.json)
aws ecs register-task-definition \\
  --cli-input-json file://task-definition.json

# Service
aws ecs create-service \\
  --cluster cnpj-detector-cluster \\
  --service-name cnpj-detector-web \\
  --task-definition cnpj-detector:1 \\
  --desired-count 2 \\
  --launch-type FARGATE \\
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-priv-a,subnet-priv-b],
    securityGroups=[sg-ecs],
    assignPublicIp=DISABLED
  }" \\
  --load-balancers "targetGroupArn=arn:aws:...,containerName=next-app,containerPort=3000"`,
  },
  {
    step: "4",
    title: "Configurar ALB + SSL",
    desc: "Application Load Balancer com certificado ACM",
    detail: `# Certificado SSL
aws acm request-certificate \\
  --domain-name cnpj-detector.seudominio.com.br \\
  --validation-method DNS

# ALB
aws elbv2 create-load-balancer \\
  --name cnpj-detector-alb \\
  --subnets subnet-pub-a subnet-pub-b \\
  --security-groups sg-alb

# Target Group
aws elbv2 create-target-group \\
  --name cnpj-detector-tg \\
  --protocol HTTP \\
  --port 3000 \\
  --vpc-id vpc-xxx \\
  --target-type ip \\
  --health-check-path /api/ping

# Listeners
aws elbv2 create-listener \\
  --load-balancer-arn arn:aws:... \\
  --protocol HTTPS --port 443 \\
  --certificates CertificateArn=arn:aws:acm:... \\
  --default-actions Type=forward,TargetGroupArn=arn:aws:...`,
  },
  {
    step: "5",
    title: "Configurar WAF e CloudWatch",
    desc: "Protecao WAF + monitoramento e alertas",
    detail: `# WAF Web ACL
aws wafv2 create-web-acl \\
  --name cnpj-detector-waf \\
  --scope REGIONAL \\
  --default-action Allow={} \\
  --rules file://waf-rules.json

# Associar WAF ao ALB
aws wafv2 associate-web-acl \\
  --web-acl-arn arn:aws:wafv2:... \\
  --resource-arn arn:aws:elasticloadbalancing:...

# CloudWatch Alarms
aws cloudwatch put-metric-alarm \\
  --alarm-name "ECS-CPU-High" \\
  --metric-name CPUUtilization \\
  --namespace AWS/ECS \\
  --statistic Average \\
  --period 300 \\
  --threshold 80 \\
  --comparison-operator GreaterThanThreshold \\
  --alarm-actions arn:aws:sns:...

aws cloudwatch put-metric-alarm \\
  --alarm-name "RDS-Storage-Low" \\
  --metric-name FreeStorageSpace \\
  --namespace AWS/RDS \\
  --statistic Average \\
  --period 300 \\
  --threshold 10737418240 \\
  --comparison-operator LessThanThreshold \\
  --alarm-actions arn:aws:sns:...`,
  },
]

export function AwsInfraSection() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Infraestrutura AWS
          </CardTitle>
          <CardDescription>
            Arquitetura recomendada para implantacao do CNPJ Detector na Amazon Web Services.
            Regiao recomendada: <strong>sa-east-1 (Sao Paulo)</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-6 font-mono text-sm">
            <pre className="whitespace-pre-wrap text-foreground">{`
AWS Region: sa-east-1 (Sao Paulo)

+-----------------------------------------------------------+
|                      Route 53 (DNS)                       |
+----------------------------+------------------------------+
                             |
+----------------------------+------------------------------+
|                  CloudFront (CDN) + WAF                   |
+----------------------------+------------------------------+
                             |
+----------------------------+------------------------------+
|              Application Load Balancer (ALB)              |
|              HTTPS:443 -> ECS Tasks:3000                  |
+----------+---------------------+--------------------------+
           |                     |
+----------+----------+ +-------+-----------+
|   ECS Task (AZ-a)   | |  ECS Task (AZ-b)  |
|   Next.js Container  | |  Next.js Container |
|   1 vCPU / 2GB RAM   | |  1 vCPU / 2GB RAM  |
+----------+----------+ +-------+-----------+
           |                     |
     +-----+-----+---------+----+------+
     |            |                     |
+----+-----+ +---+--------+ +---------+--------+
|  RDS SQL  | | ElastiCache| |   RDS SQL Server  |
|  Server   | | (Redis)    | |   (Clientes)      |
|  (App DB) | | Primary +  | |   Multi-AZ        |
|  Auth/RLS | | Replica    | |   4vCPU/16GB      |
+-----------+ +------------+ +------------------+
`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Services Detail */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Servicos AWS Necessarios</h2>
        <div className="space-y-2">
          {awsServices.map((service) => (
            <Collapsible key={service.name} className="border border-border rounded-lg px-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left hover:underline-none [&[data-state=open]>svg.chevron]:rotate-180">
                <div className="flex items-center gap-3">
                  <service.icon className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{service.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({service.category})</span>
                  </div>
                </div>
                <ChevronDown className="chevron h-4 w-4 text-muted-foreground transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pb-4">
                <p className="text-sm text-muted-foreground">{service.purpose}</p>
                <div className="rounded-md bg-muted/50 p-4 font-mono text-xs">
                  <pre className="whitespace-pre-wrap text-foreground">{service.config}</pre>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-border bg-card p-3">
                  <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">{service.notes}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      {/* Deploy Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Passo a Passo de Deploy (AWS CLI)
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
          <CardTitle>Checklist de Implantacao AWS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              "VPC com subnets publicas e privadas",
              "NAT Gateway para subnets privadas",
              "Security Groups (ALB, ECS, RDS, Redis)",
              "RDS SQL Server com Multi-AZ",
              "ElastiCache Redis ou Upstash configurado",
              "ECS Cluster Fargate com auto-scaling",
              "ALB com SSL (ACM certificate)",
              "WAF com regras OWASP",
              "CloudWatch Alarms configurados",
              "ECR com lifecycle policy",
              "Route 53 DNS configurado",
              "Secrets Manager para senhas e tokens",
              "IAM roles com least privilege",
              "Backup automatizado (RDS + Redis)",
              "CloudTrail para auditoria",
              "S3 bucket para logs (opcional)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dockerfile */}
      <Card>
        <CardHeader>
          <CardTitle>Dockerfile Recomendado</CardTitle>
          <CardDescription>Dockerfile multi-stage otimizado para Next.js</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre-wrap text-foreground">{`# ===== Stage 1: Dependencies =====
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# ===== Stage 2: Build =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ===== Stage 3: Runner =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Adicione <code className="rounded bg-muted px-1 text-foreground">output: &quot;standalone&quot;</code> no <code className="rounded bg-muted px-1 text-foreground">next.config.mjs</code> para habilitar o build standalone.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
