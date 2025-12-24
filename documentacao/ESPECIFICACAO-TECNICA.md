# ESPECIFICAÇÃO TÉCNICA DO SISTEMA
## Sistema de Gestão de CNPJ Alfanumérico

---

## 📋 RESUMO EXECUTIVO

**Nome do Sistema:** CNPJ Alfanumérico - Sistema de Gestão e Análise  
**Versão:** 2.0  
**Tipo:** Aplicação Web Full-Stack Multi-tenant  
**Arquitetura:** Monolítica com padrão Client-Server  

---

## 🎨 FRONTEND (Client-Side)

### Linguagens e Frameworks

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **TypeScript** | 5.x | Linguagem principal |
| **React** | 19.2.1 | Biblioteca UI |
| **Next.js** | 16.0.7 | Framework Full-Stack |
| **HTML5** | - | Estrutura |
| **CSS3** | - | Estilos base |
| **Tailwind CSS** | 4.1.9 | Framework CSS |

### Bibliotecas UI

- **shadcn/ui** - Componentes reutilizáveis
- **Radix UI** - Componentes primitivos acessíveis
- **Lucide React** - Ícones
- **Recharts** - Gráficos e dashboards
- **React Hook Form** - Formulários
- **Monaco Editor** - Editor de código (VSCode no browser)
- **cmdk** - Command palette
- **Sonner** - Notificações toast

### Gerenciamento de Estado

- **React Context API** - Estado global
- **React Hooks** - Estado local
- **SWR (implícito)** - Cache de requisições

### Validação

- **Zod** - Validação de schemas
- **@hookform/resolvers** - Integração forms + validação

---

## 🔧 BACKEND (Server-Side)

### Linguagens e Runtime

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **TypeScript** | 5.x | Linguagem principal |
| **Node.js** | 18+ | Runtime JavaScript |
| **Next.js API Routes** | 16.0.7 | Endpoints REST |

### Banco de Dados

- **PostgreSQL** | Versão 15+ | Banco relacional
- **Supabase** | Plataforma BaaS
  - Hospedagem PostgreSQL
  - Authentication
  - Storage (futuro)
  - Realtime (futuro)

### APIs e Integrações

| Serviço | Biblioteca | Uso |
|---------|-----------|-----|
| **Supabase** | @supabase/supabase-js | Queries de banco |
| **GitHub** | @octokit/rest | Integração Git |
| **Azure DevOps** | axios + REST API | Work Items e Tasks |
| **AI/LLM** | Vercel AI SDK | Chatbot inteligente |

### Criptografia e Segurança

- **bcryptjs** - Hash de senhas (10 rounds)
- **otplib** - Autenticação 2FA (TOTP)
- **qrcode** - QR codes para 2FA
- **crypto** (Node.js nativo) - Tokens e secrets

---

## 🔐 SEGURANÇA

### Autenticação

**Método Principal:** Session-based Authentication

1. **Login**
   - Email + Senha (hash bcrypt)
   - 2FA opcional (TOTP via Google Authenticator)
   - Token de sessão armazenado em cookie HTTP-only

2. **Tokens**
   - Refresh tokens no banco de dados
   - Expiração configurável (padrão: 7 dias)
   - Renovação automática

3. **Senhas**
   - Hash bcrypt (salt rounds: 10)
   - Política: mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial
   - Reset via email (token temporário)

### Autorização

**Modelo:** Role-Based Access Control (RBAC)

**Roles:**
- `SUPER_ADMIN` - Acesso total ao sistema
- `ADMIN_CLIENT` - Gerencia um cliente específico
- `SCRUM_MASTER` - Gestão de sprints e equipe
- `PRODUCT_OWNER` - Priorização de backlog
- `DEVELOPER` - Execução de tarefas

**Middleware:**
- Verificação de sessão em todas as rotas `/dashboard/*` e `/admin/*`
- Validação de role por endpoint
- Rate limiting (futuro)

### Proteção de Dados

1. **Em Trânsito**
   - HTTPS obrigatório (TLS 1.3)
   - Headers de segurança: HSTS, CSP, X-Frame-Options

2. **Em Repouso**
   - Senhas: bcrypt hash
   - Tokens de integração: criptografia AES-256 (futuro)
   - Dados sensíveis: PostgreSQL com row-level security (RLS)

3. **Logs e Auditoria**
   - Todas as ações críticas são logadas
   - Tabela `activity_logs` rastreia: quem, o quê, quando
   - Logs de erro com contexto completo

### Compliance

- **LGPD** - Consentimento de dados, direito ao esquecimento
- **OWASP Top 10** - Proteção contra vulnerabilidades comuns
- **SQL Injection** - Queries parametrizadas
- **XSS** - Sanitização de inputs
- **CSRF** - Tokens em formulários

---

## 🚀 REQUISITOS PARA PUBLICAÇÃO EM EMPRESA

### 1. Infraestrutura de Servidor

#### Servidor de Aplicação (Recomendado: Vercel)

**Especificações Mínimas:**
- **CPU:** 2 vCPUs
- **RAM:** 2 GB
- **Armazenamento:** 10 GB SSD
- **Banda:** 100 GB/mês
- **Sistema Operacional:** Linux (Ubuntu 22.04 LTS ou similar)

**Alternativas:**
- **Vercel** (Recomendado) - Serverless, auto-scaling
- **AWS EC2** - t3.small ou superior
- **Google Cloud Run** - 2 vCPU, 2 GB RAM
- **Azure App Service** - B2 ou superior
- **DigitalOcean** - Droplet $12/mês

#### Banco de Dados (Supabase ou Self-Hosted PostgreSQL)

**Especificações Mínimas:**
- **CPU:** 1 vCPU
- **RAM:** 1 GB
- **Armazenamento:** 20 GB SSD (com crescimento)
- **Backup:** Diário automático
- **PostgreSQL:** Versão 15+

**Opções:**
- **Supabase** (Recomendado) - Plano Pro $25/mês
- **AWS RDS** - db.t3.micro
- **Google Cloud SQL** - db-f1-micro
- **Self-hosted** - Docker container

#### Requisitos de Rede

- **Domínio:** Próprio (ex: sistema.empresa.com.br)
- **Certificado SSL:** Let's Encrypt ou comercial
- **Firewall:** Portas 443 (HTTPS) e 22 (SSH admin)
- **CDN:** Cloudflare ou similar (opcional, recomendado)

### 2. Variáveis de Ambiente Obrigatórias

```bash
# Supabase (Banco de Dados)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...

# Azure DevOps (Integração)
AZURE_DEVOPS_PAT=xxxxxxxxxx
AZURE_DEVOPS_ORGANIZATION_URL=https://dev.azure.com/sua-org
AZURE_DEVOPS_PROJECT=nome-do-projeto
AZURE_DEVOPS_WEBHOOK_SECRET=secret-seguro-aleatorio

# GitHub (Integração)
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Email (Notificações - Futuro)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@empresa.com
SMTP_PASSWORD=senha-app

# Ambiente
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://sistema.empresa.com.br
```

### 3. Dependências de Sistema

**Node.js 18+:**
```bash
# Instalar Node.js via nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**npm ou yarn:**
```bash
npm install -g npm@latest
# ou
npm install -g yarn
```

### 4. Configuração de Deploy

#### Opção A: Vercel (Recomendado - Zero Config)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

**Vantagens:**
- Zero configuração de servidor
- Auto-scaling automático
- CDN global incluído
- Deploy em segundos
- Rollback instantâneo

#### Opção B: Docker + Self-Hosted

```dockerfile
# Dockerfile (exemplo)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build e Deploy
docker build -t cnpj-sistema .
docker run -d -p 3000:3000 --env-file .env cnpj-sistema
```

#### Opção C: Servidor Linux Tradicional

```bash
# 1. Clonar repositório
git clone https://github.com/empresa/cnpj-sistema.git
cd cnpj-sistema

# 2. Instalar dependências
npm install

# 3. Build
npm run build

# 4. Iniciar com PM2 (gerenciador de processos)
npm install -g pm2
pm2 start npm --name "cnpj-sistema" -- start
pm2 save
pm2 startup
```

### 5. Configuração de Banco de Dados

**Scripts SQL obrigatórios (em ordem):**

```bash
# Executar no Supabase SQL Editor ou psql
psql -U postgres -d nome_banco -f scripts/001-create-tables.sql
psql -U postgres -d nome_banco -f scripts/002-create-api-tables.sql
psql -U postgres -d nome_banco -f scripts/003-create-auth-system.sql
# ... [total de 20 scripts, ver README.md]
psql -U postgres -d nome_banco -f scripts/999-fix-auth-complete.sql
```

**Backup e Recuperação:**
```bash
# Backup diário automático (configurar cron)
pg_dump -U postgres nome_banco > backup_$(date +%Y%m%d).sql

# Recuperação
psql -U postgres -d nome_banco < backup_20250110.sql
```

### 6. Monitoramento e Logs

**Recomendações:**
- **Logs:** Integração com Datadog, New Relic ou Sentry
- **Uptime:** UptimeRobot ou Pingdom
- **Performance:** Vercel Analytics ou Google Analytics
- **Erros:** Sentry.io

**Configuração básica de logs:**
```bash
# PM2 Logs
pm2 logs cnpj-sistema

# Docker Logs
docker logs -f container_id

# Vercel Logs
vercel logs
```

### 7. Backup e Disaster Recovery

**Estratégia 3-2-1:**
- 3 cópias dos dados
- 2 tipos diferentes de mídia
- 1 cópia off-site

**Implementação:**
1. **Banco de Dados:** Backup automático diário (Supabase faz isso)
2. **Código:** Git repository (GitHub/GitLab/Azure DevOps)
3. **Arquivos:** Vercel Blob ou AWS S3
4. **Configurações:** Documentadas em repositório privado

**RTO/RPO:**
- **RTO (Recovery Time Objective):** < 4 horas
- **RPO (Recovery Point Objective):** < 24 horas

### 8. Segurança em Produção

**Checklist:**
- [ ] HTTPS com certificado válido
- [ ] Firewall configurado (apenas portas necessárias)
- [ ] Senhas fortes em todas as contas
- [ ] 2FA habilitado para admins
- [ ] Variáveis de ambiente fora do código
- [ ] Rate limiting configurado
- [ ] Logs de auditoria habilitados
- [ ] Backup automático funcionando
- [ ] Plano de disaster recovery documentado
- [ ] Testes de penetração realizados

### 9. Performance e Escalabilidade

**Otimizações:**
- **Cache:** Redis para sessões e queries (futuro)
- **CDN:** Cloudflare para assets estáticos
- **Compressão:** Gzip/Brotli habilitado
- **Imagens:** Next.js Image Optimization
- **Database:** Índices em colunas críticas
- **Monitoring:** Alertas de performance

**Limites do Sistema (configuração atual):**
- Usuários simultâneos: ~1.000
- Requisições/segundo: ~100
- Análises/dia: ~10.000
- Armazenamento: ~100 GB

**Escalabilidade Horizontal (quando necessário):**
- Load balancer (Nginx/HAProxy)
- Múltiplas instâncias do Next.js
- Read replicas do PostgreSQL
- Redis cluster para cache

### 10. Custos Estimados (Mensais)

**Configuração Básica (até 100 usuários):**
- Vercel Pro: $20/mês
- Supabase Pro: $25/mês
- Domínio: $10/ano (~$1/mês)
- **Total:** ~$46/mês

**Configuração Intermediária (até 1.000 usuários):**
- Vercel Team: $20/usuário (5 usuários = $100/mês)
- Supabase Team: $599/mês
- Cloudflare Pro: $20/mês
- Sentry: $26/mês
- **Total:** ~$745/mês

**Configuração Enterprise (10.000+ usuários):**
- AWS/Azure: $500-2.000/mês
- Database dedicado: $300-1.000/mês
- Monitoramento: $100-300/mês
- Suporte: $500-2.000/mês
- **Total:** ~$1.400-5.300/mês

---

## 📊 ARQUITETURA DO SISTEMA

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (Next.js)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  React   │  │Tailwind │  │shadcn/ui│      │
│  │Components│  │   CSS   │  │   Kit   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
                      │
                      │ API Routes
                      ▼
┌─────────────────────────────────────────────────┐
│          BACKEND (Next.js API Routes)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │  Tasks   │  │ Analysis │      │
│  │  Routes  │  │  Routes  │  │  Routes  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
          │                │                │
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────┐
│          DATABASE (PostgreSQL/Supabase)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Users   │  │  Tasks   │  │ Analyses │      │
│  │  Clients │  │ Sprints  │  │Findings  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

### Fluxo de Requisição

```
1. Usuário → Frontend (React)
2. Frontend → API Route (Next.js)
3. API Route → Validação (Zod)
4. API Route → Autenticação (Session Check)
5. API Route → Autorização (Role Check)
6. API Route → Business Logic
7. Business Logic → Database Query (Supabase)
8. Database → Response
9. API Route → Response Formatting
10. Frontend → UI Update
```

---

## 🧪 TESTES E QUALIDADE

### Recomendações (não implementado ainda)

**Testes Unitários:**
- Jest + React Testing Library
- Coverage mínimo: 70%

**Testes de Integração:**
- Playwright ou Cypress
- Testes de fluxos críticos

**Testes de Performance:**
- Lighthouse CI
- Core Web Vitals

---

## 📞 SUPORTE E MANUTENÇÃO

### Documentação

- **Técnica:** Este arquivo + README.md
- **API:** Swagger/OpenAPI em `/api-docs`
- **Usuário:** Wiki interno (futuro)

### Atualizações

**Frequência:** Quinzenal (sprints de 2 semanas)

**Processo:**
1. Desenvolvimento em branch `develop`
2. Pull Request com revisão de código
3. Testes em ambiente staging
4. Deploy em produção via Vercel
5. Monitoramento pós-deploy

### Contato

**Suporte Técnico:** suporte@empresa.com.br  
**Bugs/Issues:** GitHub Issues  
**Documentação:** https://docs.sistema.empresa.com.br  

---

## 📝 CHANGELOG

**v2.0 (2025-01-10)**
- Integração Azure DevOps completa
- Sistema de auto-fix com Monaco Editor
- Relatórios Excel/PDF detalhados
- Chatbot inteligente
- Dashboard de desenvolvedores

**v1.5 (2024-12-01)**
- Sistema Scrum completo
- Multi-tenancy
- Gamificação

**v1.0 (2024-10-01)**
- Release inicial
- Análise de CNPJ
- Autenticação básica

---

## ✅ CHECKLIST DE DEPLOY

**Antes do Deploy:**
- [ ] Todos os scripts SQL executados
- [ ] Variáveis de ambiente configuradas
- [ ] Certificado SSL configurado
- [ ] Domínio apontado corretamente
- [ ] Testes de integração passando
- [ ] Backup do banco de dados realizado
- [ ] Documentação atualizada

**Após o Deploy:**
- [ ] Verificar saúde da aplicação (/api/health)
- [ ] Testar login com usuário admin
- [ ] Verificar integração com Azure DevOps
- [ ] Testar criação de análise
- [ ] Verificar logs por erros
- [ ] Configurar monitoramento
- [ ] Notificar equipe

---

**Documento criado em:** 10/01/2025  
**Última atualização:** 10/01/2025  
**Versão do documento:** 1.0
