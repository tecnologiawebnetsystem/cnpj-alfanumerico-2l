# Arquitetura do Sistema CNPJ Alfanumérico

## Visão Geral

Sistema completo para análise e migração de campos CNPJ para formato alfanumérico em múltiplas plataformas (GitHub, GitLab, Azure DevOps).

## Stack Tecnológico

**Frontend:**
- Next.js 16.0.7 com App Router
- React 19.2.1
- TypeScript 5.7.3
- Tailwind CSS 4.1.9
- Shadcn/ui Components

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL + Auth + Storage)
- Upstash Redis para rate limiting

**Integrações:**
- GitHub API via @octokit/rest
- GitLab API (implementado)
- Azure DevOps API (implementado)
- SQL Server via mssql
- Oracle DB via oracledb

## Arquitetura de Segurança

✅ **Implementado:**
- Redis rate limiting persistente
- 2FA obrigatório para admins
- Session management com Redis
- IP whitelisting administrativo
- CSRF protection
- Input validation com Zod
- Security headers (HSTS, CSP, etc)
- RLS no Supabase
- Audit logging
- LGPD compliance

## Integrações Git

### GitHub
- ✅ Autenticação via OAuth
- ✅ Listagem de repositórios
- ✅ Clonagem e extração de arquivos
- ✅ Criação de branches
- ✅ Commits automáticos
- ✅ Pull Requests

### GitLab
- ✅ Client implementado
- ✅ Branches, commits, merge requests
- ⚠️ Autenticação OAuth pendente

### Azure DevOps
- ✅ Totalmente implementado
- ✅ Boards, Repos, Pipelines

## Sistema de Análise

1. **Extração:** ZIP, GitHub, GitLab, Azure DevOps
2. **Detecção:** CNPJDetector com regex customizáveis
3. **Análise:** Multi-thread com progress tracking
4. **Resultados:** Findings + Suggestions por arquivo/linha
5. **Tasks:** Criação automática de tarefas

## Próximas Implementações

Priority 1:
- Report generation
- Database scan automation
- Email notifications (Resend)
- Connection string encryption

Priority 2:
- Pentesting
- Vulnerability scanning automatizado
- WAF setup
