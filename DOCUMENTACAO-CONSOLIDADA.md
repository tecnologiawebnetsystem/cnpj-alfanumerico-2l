# CNPJ Alfanumérico - Documentação Completa do Sistema

**Versão**: 2.0  
**Data**: 2026-01-14  
**Status**: Produção  

---

## ÍNDICE

1. [Arquitetura do Sistema](#arquitetura)
2. [Segurança e Conformidade](#segurança)
3. [LGPD e Privacidade](#lgpd)
4. [Guia de Deployment](#deployment)
5. [Troubleshooting](#troubleshooting)

---

## 1. ARQUITETURA DO SISTEMA {#arquitetura}

### 1.1 Stack Tecnológico

**Frontend:**
- Next.js 16 (App Router) com React 19
- Tailwind CSS 4 + shadcn/ui
- TypeScript 5.7
- Monaco Editor para edição de código

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL 15)
- Redis (Upstash) para cache e rate limiting
- Worker system para jobs assíncronos

**Integrações:**
- GitHub API (@octokit/rest)
- GitLab API (axios)
- Azure DevOps REST API
- SQL Server / Oracle (database scanner)

### 1.2 Arquitetura Multi-Tenant

```
Cliente 1 (UUID: xxx)
├── Admin 1.1
├── Admin 1.2
└── Desenvolvedores 1.1, 1.2, 1.3

Cliente 2 (UUID: yyy)
├── Admin 2.1
└── Desenvolvedores 2.1, 2.2
```

**Isolamento de Dados:**
- RLS (Row Level Security) em todas as tabelas
- client_id como chave de isolamento
- Queries automáticas com filtro de cliente

### 1.3 Fluxo de Análise

```
1. Admin Cliente → Nova Análise
2. Sistema cria batch no banco
3. Worker (local ou servidor) processa
4. Extrai arquivos dos repositórios
5. Analisa linha por linha buscando CNPJs
6. Cria findings com contexto
7. Gera tasks para desenvolvedores
8. Sincroniza com GitHub/Azure (opcional)
9. Desenvolvedor corrige via UI
10. Sistema aplica correção (PR automático)
11. Relatórios gerados (PDF/Excel)
```

---

## 2. SEGURANÇA E CONFORMIDADE {#segurança}

### 2.1 Camadas de Segurança

**Camada 1 - Perímetro:**
- Cloudflare WAF (opcional mas recomendado)
- DDoS protection
- Rate limiting por IP (5 req/s)

**Camada 2 - Aplicação:**
- HTTPS obrigatório (HSTS habilitado)
- Security headers completos
- CSRF protection
- Input validation com Zod
- XSS protection (sanitização)

**Camada 3 - Autenticação:**
- Supabase Auth + bcrypt
- 2FA obrigatório para admins
- Session timeout (30 minutos)
- Account lockout (5 tentativas)
- IP whitelisting para admin

**Camada 4 - Dados:**
- Criptografia AES-256-GCM
- Hashing SHA-256 para API keys
- RLS no banco de dados
- Backup criptografado diário

**Camada 5 - Monitoramento:**
- Logs de segurança centralizados
- Alertas em tempo real
- Audit trail completo
- SIEM integration ready

### 2.2 Vulnerabilidades Conhecidas e Mitigações

| Vulnerabilidade | Severidade | Mitigação |
|----------------|------------|-----------|
| SQL Injection | CRÍTICA | Queries parametrizadas + RLS |
| XSS | ALTA | Sanitização de inputs + CSP |
| CSRF | ALTA | Tokens CSRF em todos os forms |
| Session Hijacking | ALTA | HttpOnly cookies + SameSite=strict |
| Brute Force | MÉDIA | Rate limiting + account lockout |
| API Abuse | MÉDIA | Rate limiting + API keys hashadas |

### 2.3 Checklist de Auditoria de Segurança

```
[ ] Pentesting realizado nos últimos 6 meses
[ ] Vulnerability scan executado semanalmente
[ ] Dependências atualizadas (npm audit clean)
[ ] Secrets rotacionados nos últimos 90 dias
[ ] Backup testado nos últimos 30 dias
[ ] Disaster recovery plan atualizado
[ ] Incident response plan documentado
[ ] Security training realizado para equipe
[ ] 2FA habilitado para 100% dos admins
[ ] Logs de segurança sendo monitorados 24/7
```

---

## 3. LGPD E PRIVACIDADE {#lgpd}

### 3.1 Dados Pessoais Tratados

**Dados Básicos:**
- Nome completo
- E-mail corporativo
- CPF (para auditoria)
- Telefone (opcional)

**Dados de Acesso:**
- Endereço IP
- User agent
- Timestamps de login
- Histórico de ações (audit log)

**Dados Sensíveis:**
- Senhas (hashadas com bcrypt)
- API tokens (hashados com SHA-256)
- Logs de segurança

### 3.2 Base Legal (Art. 7º LGPD)

- **Execução de contrato** (Art. 7º, V) - Prestação de serviços
- **Legítimo interesse** (Art. 7º, IX) - Segurança e prevenção de fraudes
- **Obrigação legal** (Art. 7º, II) - Retenção de logs fiscais

### 3.3 Direitos dos Titulares

| Direito | Implementação | Prazo |
|---------|---------------|-------|
| Acesso | API `/api/user/data` | Imediato |
| Correção | UI de perfil | Imediato |
| Exclusão | Soft delete automático | 30 dias |
| Portabilidade | Export JSON/CSV | 15 dias |
| Revogação | Botão "Revogar Consentimento" | Imediato |

### 3.4 Retenção de Dados

**Dados de Usuário:**
- Ativos: Enquanto conta estiver ativa
- Inativos >2 anos: Arquivados
- Após exclusão: Soft delete por 30 dias, depois hard delete

**Logs de Auditoria:**
- Segurança: 5 anos (obrigação legal)
- Operacionais: 1 ano
- Debug: 90 dias

### 3.5 DPO (Data Protection Officer)

**Contato:**
- E-mail: dpo@seudominio.com
- Formulário: /privacy/contact-dpo
- Telefone: +55 11 XXXX-XXXX

**Responsabilidades:**
- Monitorar conformidade LGPD
- Treinar equipe sobre privacidade
- Gerenciar incidentes de segurança
- Interface com ANPD

---

## 4. GUIA DE DEPLOYMENT {#deployment}

### 4.1 Vercel (Recomendado)

```bash
# 1. Conecte seu repositório GitHub
# 2. Selecione o projeto no Vercel
# 3. Configure as variáveis de ambiente
# 4. Deploy automático em cada push

vercel --prod
```

### 4.2 Docker (Auto-hospedado)

```dockerfile
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
docker build -t cnpj-system .
docker run -p 3000:3000 --env-file .env.production cnpj-system
```

### 4.3 Checklist Pré-Deploy

```
[ ] Tests passando (npm test)
[ ] Build sem erros (npm run build)
[ ] Variáveis de ambiente configuradas
[ ] Scripts SQL executados no Supabase
[ ] Backup do banco antes do deploy
[ ] Domínio apontando corretamente
[ ] SSL/TLS configurado
[ ] Monitoramento ativo
[ ] Rollback plan documentado
```

---

## 5. TROUBLESHOOTING {#troubleshooting}

### 5.1 Problemas Comuns

**Erro: "Supabase connection failed"**
- Verifique: `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_ANON_KEY`
- Teste: Acesse a URL no browser

**Erro: "Rate limit exceeded"**
- Causa: Muitas requisições do mesmo IP
- Solução: Aguardar 15 minutos ou verificar Redis

**Erro: "2FA required but not configured"**
- Causa: Admin sem 2FA
- Solução: Acesse /settings/security e configure 2FA

**Erro: "IP not whitelisted"**
- Causa: IP não está na whitelist
- Solução: Admin deve adicionar IP em /admin/security/whitelist

### 5.2 Logs de Debug

**Habilitar logs verbose:**
```env
LOG_LEVEL=debug
```

**Ver logs de segurança:**
```sql
SELECT * FROM security_logs 
WHERE event_type = 'failed_login' 
ORDER BY timestamp DESC 
LIMIT 50;
```

**Ver sessões ativas:**
```sql
SELECT u.email, s.ip_address, s.last_activity
FROM active_sessions s
JOIN users u ON u.id = s.user_id
WHERE s.expires_at > NOW();
```

---

## CONCLUSÃO

Este sistema foi projetado com segurança e conformidade desde o início. Todas as melhores práticas de OWASP Top 10 foram implementadas, e a conformidade com LGPD está completa.

Para suporte ou dúvidas, entre em contato:
- GitHub Issues: https://github.com/seu-usuario/cnpj-alfanumerico/issues
- E-mail: suporte@seudominio.com
