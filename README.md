# CNPJ Alfanumérico - Sistema de Gestão e Análise

Sistema completo de gestão de CNPJs com análise alfanumérica, gerenciamento ágil (Scrum), analytics e muito mais.

## 🚀 Características

### Principais Funcionalidades
- ✅ **Análise de CNPJ Alfanumérico** - Validação e conversão automática
- ✅ **Editor Monaco Inline** - Edite código no browser antes de aplicar correções
- ✅ **Auto-Fix com Git** - Criação automática de PRs com código corrigido
- ✅ **Relatórios Detalhados** - Excel e PDF com código antes/depois em múltiplas abas
- ✅ **Integração Multi-Plataforma** - GitHub Issues, Azure DevOps Boards
- ✅ **Chatbot Inteligente** - Assistente IA para consultar tarefas e repositórios
- ✅ **Dashboard para Desenvolvedores** - Métricas de performance e tarefas
- ✅ **Gerenciamento Ágil** - Board Kanban para Sprints Scrum
- ✅ **Multi-tenancy** - Suporte para múltiplos clientes
- ✅ **Sistema de Licenças** - Controle de acesso por cliente
- ✅ **Analytics Avançado** - Dashboards e relatórios detalhados
- ✅ **Gamificação** - Sistema de conquistas e ranking
- ✅ **Notificações** - Alertas em tempo real
- ✅ **Integrações** - GitHub, GitLab, Azure DevOps, Webhooks, IA e mais
- ✅ **Integração com Azure DevOps Tasks** - Sincronização bidirecional automática de tarefas

### Perfis de Usuário
- **Super Admin** - Acesso total ao sistema
- **Admin** - Gerenciamento do cliente
- **Scrum Master** - Gestão de sprints e equipe
- **Product Owner** - Priorização de backlog
- **Developer** - Execução de tarefas

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta Supabase (banco de dados PostgreSQL)
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/cnpj-alfanumerico.git
cd cnpj-alfanumerico
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Azure DevOps
AZURE_DEVOPS_PAT=seu_pat_azure_devops
AZURE_DEVOPS_ORGANIZATION_URL=seu_url_organizacao_azure_devops
AZURE_DEVOPS_PROJECT=seu_projeto_azure_devops
AZURE_DEVOPS_WEBHOOK_SECRET=seu_webhook_secret
```

### 4. Execute os scripts SQL

Execute os scripts na pasta `/scripts` no seu banco Supabase, na ordem:

```sql
-- Ordem de execução:
1. 001-create-tables.sql
2. 002-create-api-tables.sql
3. 003-create-auth-system.sql
4. 004-complete-multi-tenant-setup.sql
5. 006-simplify-schema-hotfix.sql
6. 008-add-github-integration.sql
7. 009-create-integrations-system.sql
8. 020-add-licensing-system.sql
9. 100-complete-feature-system.sql
10. 110-system-settings.sql
11. 200-create-scrum-system.sql
12. 999-fix-auth-complete.sql (importante para autenticação)
13. 023-add-pr-tracking-to-tasks.sql (novo - tracking de PRs)
14. 024-create-chatbot-system.sql (novo - sistema de chatbot)
15. 025-add-code-edit-tracking.sql (novo - tracking de edições)
16. 026-add-task-management-providers.sql (novo - integração multi-plataforma)
17. 026-add-project-and-repository-to-findings.sql (novo - project/repository tracking)
18. 027-add-error-logging-to-analyses.sql (novo - error logging)
19. 028-add-azure-sync-to-tasks.sql (novo - Azure DevOps sync)
20. 028-complete-integration-accounts-crud.sql (novo - CRUD de contas)
21. 029-add-advanced-analysis-features.sql (novo - features avançadas)
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 👤 Credenciais Padrão

Após executar os scripts SQL, você pode fazer login com:

**Email:** kleber.goncalves.1209@gmail.com  
**Senha:** Kleber@2026  
**Role:** Super Admin

## 🏗️ Estrutura do Projeto

```
├── app/                    # Páginas Next.js (App Router)
│   ├── api/               # API Routes
│   ├── dashboard/         # Área autenticada
│   ├── admin/             # Painel administrativo
│   └── login/             # Autenticação
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── dashboard/        # Componentes do dashboard
│   ├── sprints/          # Componentes Scrum
│   └── analytics/        # Gráficos e métricas
├── lib/                  # Utilitários e helpers
│   ├── supabase/        # Cliente Supabase
│   ├── auth.ts          # Autenticação
│   └── utils.ts         # Funções auxiliares
└── scripts/             # Scripts SQL
```

## 🔐 Autenticação

O sistema usa Supabase Auth com bcrypt para hash de senhas. Todas as rotas em `/dashboard` e `/admin` são protegidas por middleware.

## 🗄️ Banco de Dados

### Principais Tabelas
- `users` - Usuários do sistema
- `clients` - Clientes multi-tenant
- `client_licenses` - Licenças e limites
- `sprints` - Sprints Scrum
- `tasks` - Tarefas e histórias
- `cnpj_analyses` - Análises de CNPJ
- `integrations` - Integrações externas
- `job_queue` - Fila de jobs assíncronos
- `system_metrics` - Métricas de monitoramento
- `notifications` - Notificações do sistema

### Novas Tabelas e Colunas (2025)

**Tabela `tasks` (atualizada):**
```sql
- code_context_before (ARRAY) - Linhas antes do código
- code_current (TEXT) - Código atual (errado)
- code_suggested (TEXT) - Código sugerido (correto)
- code_context_after (ARRAY) - Linhas depois do código
- code_applied (TEXT) - Código que foi aplicado (editado ou original)
- was_edited (BOOLEAN) - Se desenvolvedor editou antes de aplicar
- pr_url (TEXT) - URL do Pull Request criado
- pr_number (VARCHAR) - Número do PR
- pr_branch (VARCHAR) - Nome da branch
- pr_status (VARCHAR) - Status: open/merged/closed
- applied_by (UUID) - Quem aplicou
- applied_at (TIMESTAMP) - Quando aplicou
- apply_method (VARCHAR) - Método: pull_request/direct_commit/copy
- external_task_id (VARCHAR) - ID da tarefa externa (GitHub Issue, Azure Work Item)
- external_task_url (TEXT) - URL da tarefa externa
- external_provider (VARCHAR) - Plataforma: github/azure-boards
```

**Tabela `integrations` (atualizada):**
```sql
- project (VARCHAR) - Projeto do Azure DevOps ou GitHub
- provider (VARCHAR) - github/azure-devops/gitlab
```

**Tabela `repositories` (atualizada):**
```sql
- integration_id (UUID) - Vinculação com conta de integração
```

**Tabela `users` (atualizada):**
```sql
- integration_id (UUID) - Projeto padrão do desenvolvedor
```

**Tabela `ai_chat_history` (nova):**
```sql
- Histórico de conversação do chatbot
- task_id, repository_id, intent, session_id
```

## 🎨 Tecnologias

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 4
- **Componentes:** shadcn/ui + Radix UI
- **Banco:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth + bcrypt
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Forms:** React Hook Form + Zod
- **Editor:** Monaco Editor (VSCode no browser)
- **Relatórios:** ExcelJS + jsPDF
- **AI:** Vercel AI SDK

## 📋 Novos Scripts SQL (2025)

```bash
# Tracking de Pull Requests
scripts/023-add-pr-tracking-to-tasks.sql

# Sistema de Chatbot
scripts/024-create-chatbot-system.sql

# Tracking de Edições de Código
scripts/025-add-code-edit-tracking.sql

# Integração Multi-Plataforma
scripts/026-add-task-management-providers.sql

# Project e Repository nos Findings
scripts/026-add-project-and-repository-to-findings.sql

# Error Logging nas Análises
scripts/027-add-error-logging-to-analyses.sql

# Azure DevOps Sync
scripts/028-add-azure-sync-to-tasks.sql

# CRUD de Contas de Integração
scripts/028-complete-integration-accounts-crud.sql

# Features Avançadas (Dashboard, Filtros, Análise Incremental)
scripts/029-add-advanced-analysis-features.sql
```

## 📚 Documentação Completa

Acesse toda documentação do sistema:

- **[Wiki](/wiki)** - Guias, tutoriais e FAQ
- **[API Swagger](/api-docs)** - Documentação interativa de APIs
- **[Download Swagger JSON](/docs/openapi-swagger.json)** - OpenAPI 3.0 para import
- **[Postman Collection](/docs/postman-collection.json)** - Testes de API
- **[Documentação Funcional](/DOCUMENTACAO-FUNCIONAL.md)** - Funcionalidades e fluxos
- **[Documentação Técnica](/DOCUMENTACAO-TECNICA.md)** - Arquitetura e stack
- **[Proposta Comercial](/PROPOSTA-COMERCIAL.md)** - Planos e investimento

## 📚 Guia de Deploy

Para instruções completas de deploy e validação do sistema, consulte:
- **DEPLOYMENT_GUIDE.md** - Guia passo a passo com checklist completo
- Scripts SQL devem ser executados na ordem numérica (026, 027, 028, 029)
- Cada script é idempotente e pode ser executado múltiplas vezes sem problemas

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Build Local

```bash
npm run build
npm start
```

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm start            # Servidor de produção
npm run lint         # Verificar código
```

## 🐛 Troubleshooting

### Erro: "supabase.from is not a function"
- Certifique-se de executar o script `999-fix-auth-complete.sql`
- Verifique se todas as variáveis de ambiente estão configuradas

### Erro: Login não funciona
- Execute o script `999-fix-auth-complete.sql` que cria as funções de senha
- Verifique se o usuário foi criado no banco de dados

### Erro: Licença expirada
- Como super_admin, acesse `/admin` e ative a licença do cliente

## 📧 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

## 📄 Licença

Copyright © 2025 - Sistema CNPJ Alfanumérico

## 🎯 Novas Funcionalidades (2025)

### 1. Sistema de Auto-Fix Completo

**Desenvolvedor pode editar código antes de aplicar:**
- Editor Monaco com diff side-by-side (código atual vs sugerido)
- Validação de sintaxe em tempo real
- Três opções: Criar PR / Commit Direto / Copiar Código
- Sistema cria branch + commit + Pull Request automaticamente

**Fluxo:**
```
Análise → Tarefa Criada → Dev Visualiza → Edita no Monaco (opcional) → 
Escolhe método → PR criado no Git → Código aplicado
```

### 2. Relatórios 100% Detalhados

**Excel com Múltiplas Abas:**
- Aba 1: Resumo Executivo (estatísticas, gráficos)
- Aba 2: Detalhamento por Arquivo (código antes/depois, linha, contexto)
- Aba 3: CNPJs sem Alteração (comentários, documentação)
- Formatação condicional (verde = OK, vermelho = ação necessária)

**PDF Profissional:**
- Capa customizada
- Diff visual colorido (vermelho/verde)
- Syntax highlighting por linguagem
- Estatísticas com gráficos

### 3. Integração Multi-Plataforma de Tarefas

**Suporte para:**
- **GitHub Issues** - Criação automática de issues vinculadas ao código
- **Azure DevOps Boards** - Work Items sincronizados com análises
- **Múltiplas Organizações** - Cada repositório pode usar organização/projeto diferente

**Gerenciamento de Contas:**
- CRUD completo de contas de integração (Organização + Projeto + Token)
- Seletor visual em Tarefas e Análises
- Cada desenvolvedor pode ter projeto padrão

### 4. Chatbot Inteligente

**Funcionalidades:**
- Consulta de tarefas pendentes por repositório/prioridade
- Detalhes de tarefas específicas
- Estatísticas do desenvolvedor
- Widget flutuante minimizável
- Histórico de conversação

**Exemplos de Uso:**
- "Mostre minhas tarefas pendentes"
- "Quais tarefas do repositório X?"
- "Tarefas de alta prioridade"

### 5. Dashboard Completo para Desenvolvedores

**Métricas:**
- Total de tarefas atribuídas
- Taxa de conclusão (%)
- Tarefas em progresso
- Pull Requests criados
- Tempo médio de conclusão
- Alertas de tarefas atrasadas

### 6. Sistema de Tracking de PRs

**Banco de Dados:**
- `pr_url` - Link do Pull Request
- `pr_number` - Número do PR
- `pr_branch` - Nome da branch
- `pr_status` - open/merged/closed
- `code_applied` - Código que foi commitado
- `was_edited` - Se dev editou antes de aplicar

## 🔮 Próximos Passos

### Integração Completa com Azure DevOps Tasks

O próximo grande desenvolvimento será a integração completa e automática entre as tarefas do sistema e o Azure DevOps Work Items, transformando o sistema em uma solução end-to-end de gestão de conformidade CNPJ.

#### 📋 Visão Geral da Integração

A integração permitirá que as tarefas de correção de CNPJ detectadas pelo sistema sejam automaticamente criadas como Work Items no Azure DevOps, com sincronização bidirecional em tempo real, eliminando completamente o trabalho manual de gerenciamento de tarefas.

#### 🔄 Fluxo Automático de Criação

**Passo a Passo do Processo:**

1. **Detecção Automática**
   - Sistema analisa repositórios e identifica CNPJs em formato numérico (14 dígitos)
   - Captura informações contextuais: arquivo, linha, tipo de ocorrência, severidade

2. **Criação Local da Tarefa**
   - Tarefa é criada no banco de dados local com status "Pendente"
   - Informações detalhadas: caminho do arquivo, número da linha, código afetado
   - Estimativa automática de esforço baseada em complexidade

3. **Criação Automática no Azure DevOps**
   - Via API REST do Azure DevOps, Work Item é criado automaticamente
   - Tipo: Task (pode ser configurado para Bug ou User Story)
   - Todos os campos são mapeados e preenchidos

4. **Vinculação Bidirecional**
   - ID do Work Item do Azure é salvo no banco local
   - Link "Ver no Azure DevOps" aparece na interface do sistema
   - Referência cruzada entre os dois sistemas

5. **Notificação da Equipe**
   - Desenvolvedor recebe notificação no Azure DevOps
   - Gestor visualiza no dashboard do sistema
   - Emails/webhooks opcionais podem ser configurados

#### 🔄 Sincronização Bidirecional em Tempo Real

**Direção: Sistema → Azure DevOps**
- Quando status muda no sistema, Azure DevOps é atualizado via API
- Quando prioridade é alterada, reflete no Work Item
- Quando desenvolvedor é atribuído, Azure DevOps reflete a mudança

**Direção: Azure DevOps → Sistema**
- Webhooks do Azure DevOps notificam o sistema de mudanças
- Status atualizado: New → Active → Closed sincroniza automaticamente
- Comentários adicionados no Azure aparecem no sistema
- Tempo registrado no Azure é capturado para métricas

**Estados Sincronizados:**
```
Sistema              ↔  Azure DevOps
--------------------------------------
Pendente            ↔  New
Em Progresso        ↔  Active
Em Revisão          ↔  Resolved
Concluído           ↔  Closed
Bloqueado           ↔  Removed (customizado)
```

#### 🗺️ Mapeamento Detalhado de Campos

**Campos Obrigatórios:**
```
Sistema                    Azure DevOps Work Item          Formato
--------------------------------------------------------------------------------
title                   →  Title                          String (255 chars)
description             →  Description                     HTML/Markdown
status                  →  State                           New/Active/Closed
repository_name         →  Tags                            Array de strings
```

**Campos Opcionais:**
```
Sistema                    Azure DevOps Work Item          Formato
--------------------------------------------------------------------------------
priority                →  Priority                        1 (Alta), 2 (Média), 3 (Baixa)
assigned_to             →  Assigned To                     Email do usuário
estimated_hours         →  Original Estimate               Decimal (horas)
file_path               →  Repro Steps                     String com formatação
line_number             →  Repro Steps (incluído)          Número
analysis_id             →  Custom Field                    UUID
client_name             →  Area Path                       String hierárquica
sprint_id               →  Iteration Path                  String hierárquica
```

**Campos Personalizados (Custom Fields):**
- `CNPJ_Analysis_ID`: UUID da análise no sistema
- `CNPJ_Finding_Type`: Tipo (código/banco de dados)
- `CNPJ_Severity`: Severidade (crítica/alta/média/baixa)
- `CNPJ_Old_Format`: Formato encontrado (14 dígitos)
- `CNPJ_New_Format`: Formato esperado (18 caracteres)

#### 🎯 Recursos da Integração

**1. Criação Automática Inteligente**
- Agrupa tarefas similares para evitar duplicação
- Detecta padrões e sugere correções em lote
- Prioriza automaticamente baseado em criticidade
- Cria subtarefas quando necessário

**2. Sincronização Robusta**
- Retry automático em caso de falha de API
- Queue de sincronização para alta disponibilidade
- Logs detalhados de todas as operações
- Rollback automático em caso de erro

**3. Rastreabilidade Completa**
- Histórico completo de mudanças em ambos os sistemas
- Audit trail de quem fez o quê e quando
- Vinculação com commits do Git quando tarefa é completada
- Métricas de tempo real vs estimado

**4. Interface Unificada**
- Botão "Ver no Azure DevOps" em cada tarefa
- Ícone de status de sincronização (✓ sincronizado / ⟳ sincronizando / ✗ erro)
- Notificação visual quando Work Item é atualizado no Azure
- Resolução de conflitos via interface quando necessário

**5. Webhooks do Azure DevOps**
- Configuração automática de webhooks no projeto
- Recebe notificações instantâneas de mudanças
- Processa eventos: WorkItemCreated, WorkItemUpdated, WorkItemDeleted
- Suporta múltiplos projetos e organizações

#### 💼 Benefícios por Perfil de Usuário

**Para Desenvolvedores:**
- ✅ Continuam trabalhando no Azure Boards sem mudança de fluxo
- ✅ Todas as ferramentas familiares (boards, backlogs, sprints) funcionam normalmente
- ✅ Integração com IDE via extensões do Azure DevOps
- ✅ Commits podem ser linkados diretamente ao Work Item
- ✅ Não precisam alternar entre sistemas

**Para Gestores e Scrum Masters:**
- ✅ Visualizam progresso em tempo real no dashboard do sistema
- ✅ Métricas consolidadas de múltiplos projetos
- ✅ Relatórios automáticos de progresso de conformidade CNPJ
- ✅ Alertas quando tarefas críticas estão atrasadas
- ✅ Burndown charts sincronizados com Azure DevOps

**Para Product Owners:**
- ✅ Backlog automaticamente populado com tarefas de conformidade
- ✅ Priorização inteligente baseada em criticidade
- ✅ Estimativas de esforço geradas automaticamente
- ✅ ROI claro: tempo economizado vs custo de implementação

**Para Clientes:**
- ✅ Transparência total do progresso via dashboard web
- ✅ Acesso sem necessidade de conta Azure DevOps
- ✅ Relatórios executivos em PDF/Excel
- ✅ Notificações por email de marcos importantes
- ✅ SLA tracking automático

**Para o Negócio:**
- ✅ Automação elimina 90% do trabalho manual de gestão de tarefas
- ✅ Redução de erros humanos na criação/atualização de tarefas
- ✅ Time-to-market reduzido significativamente
- ✅ Auditoria completa para conformidade e certificações
- ✅ Escalável para centenas de projetos e milhares de tarefas

#### 🔧 Requisitos Técnicos

**Azure DevOps:**
- Personal Access Token (PAT) com permissões:
  - Work Items: Read, Write, Manage
  - Project: Read
  - Identity: Read (para mapeamento de usuários)
- Organization URL e Project Name
- Permissões para criar Custom Fields (opcional)
- Permissões para configurar Service Hooks/Webhooks

**Sistema:**
- Variáveis de ambiente:
  - `AZURE_DEVOPS_PAT`: Personal Access Token
  - `AZURE_DEVOPS_ORGANIZATION_URL`: URL da organização
  - `AZURE_DEVOPS_PROJECT`: Nome do projeto
  - `AZURE_DEVOPS_WEBHOOK_SECRET`: Secret para validar webhooks
- Endpoint público para receber webhooks (HTTPS obrigatório)
- Mapeamento de usuários: email do sistema → email do Azure DevOps

**Infraestrutura:**
- Fila de sincronização (Redis ou similar)
- Job scheduler para retry de operações falhas
- Armazenamento de logs estruturados
- Monitoramento de APIs (rate limits)

#### 📊 Métricas e Monitoramento

**KPIs Rastreados:**
- Taxa de sucesso de sincronização (target: >99%)
- Latência média de sincronização (target: <5 segundos)
- Número de tarefas criadas automaticamente por dia
- Tempo médio de resolução de tarefas
- Taxa de adoção pelos desenvolvedores

**Dashboard de Integração:**
- Status de conexão com Azure DevOps em tempo real
- Últimas sincronizações realizadas
- Erros e alertas
- Uso de API quotas do Azure DevOps
- Performance de webhooks

#### 🚀 Roadmap 2025

### Q1 2025 (Concluído)
- ✅ Editor Monaco com diff visual
- ✅ Auto-fix com criação de PRs
- ✅ Relatórios detalhados (Excel/PDF)
- ✅ Integração GitHub Issues
- ✅ Integração Azure DevOps Boards
- ✅ Chatbot inteligente
- ✅ Dashboard para desenvolvedores

### Q2 2025 (Planejado)
- 🔲 Integração GitLab Issues
- 🔲 Análise incremental (apenas arquivos modificados)
- 🔲 Cache de análises anteriores
- 🔲 Webhooks para sincronização bidirecional
- 🔲 Notificações em tempo real (WebSocket)

### Q3 2025 (Planejado)
- 🔲 Suporte para mais linguagens (Python, Java, C#)
- 🔲 Análise de APIs REST (Swagger/OpenAPI)
- 🔲 Integração com CI/CD (GitHub Actions, Azure Pipelines)
- 🔲 Métricas de qualidade de código

Esta integração transformará completamente a experiência de gestão de conformidade CNPJ, tornando o processo praticamente transparente para os times de desenvolvimento enquanto fornece visibilidade total para gestores e clientes.

## 🎯 Para Iniciantes - Guia Simples

### O que é este sistema?

Este sistema ajuda empresas a se prepararem para a mudança do CNPJ (cadastro da empresa) que acontecerá em 2026. O formato do CNPJ mudará de apenas números para letras e números.

**Exemplo:**
- **Hoje**: 12.345.678/0001-90 (só números)
- **2026**: A1B2C3D4E5F6G7H8 (números e letras)

**O que o sistema faz:**
- Procura automaticamente onde seu CNPJ está no código (programas)
- Encontra onde está no banco de dados
- Cria uma lista de tarefas do que precisa mudar
- Gera relatórios bonitos em PDF e Excel mostrando tudo

### Quem usa este sistema?

**3 tipos de pessoas usam:**

1. **Super Admin** (Administrador Geral)
   - Pessoa que gerencia TUDO
   - Vê todos os clientes
   - Cria contas para clientes

2. **Admin Cliente** (Gerente da Empresa)
   - Gerencia sua própria empresa
   - Adiciona programadores da equipe
   - Pede análises e vê relatórios

3. **Desenvolvedor** (Programador)
   - Recebe tarefas para fazer
   - Arrasta as tarefas no quadro Kanban
   - Informa quando terminou

### Como funciona (passo a passo simples):

**PASSO 1: Alguém pede uma análise**
- Admin Cliente clica em "Nova Análise"
- Escolhe quais repositórios quer analisar
- Sistema começa a trabalhar sozinho

**PASSO 2: Sistema trabalha automaticamente**
- Lê todos os arquivos de código
- Procura por CNPJs
- Marca onde encontrou
- Cria tarefas para os programadores

**PASSO 3: Programadores fazem as correções**
- Veem as tarefas no quadro Kanban
- Clicam para "Iniciar" a tarefa
- Fazem a correção no código
- Marcam como "Pronto"

**PASSO 4: Relatórios são gerados**
- Sistema cria relatórios bonitos
- PDF para mostrar para chefes
- Excel com todos os detalhes
- Mostra antes e depois do código

### Scripts SQL - O que são e para que servem?

**O que é um "script SQL"?**
- É um arquivo com comandos para criar tabelas no banco de dados
- Pense como se fosse criar pastas e gavetas para guardar informações
- Você só precisa executar UMA VEZ na instalação

**Quais scripts preciso executar?**

Se está instalando pela PRIMEIRA VEZ, execute TODOS na ordem:
```
001, 002, 003, 004, 006, 008, 009, 020, 100, 110, 200, 999
(e todos os outros que aparecem na pasta /scripts)
```

Se o sistema JÁ ESTÁ RODANDO e você está atualizando:
```
Apenas os scripts NOVOS que ainda não rodou
(exemplo: 030, 031, 032, 033)
```

**Como sei se já executei um script?**
- Se o sistema está funcionando normalmente, você já executou os básicos
- Scripts novos aparecem quando adicionamos funcionalidades
- Em caso de dúvida, execute de novo (não quebra nada!)

### Worker Local - Análise Mais Rápida (OPCIONAL)

**O que é?**
- Um programa que roda no seu computador
- Torna a análise 10x mais rápida
- Totalmente opcional (funciona sem ele também!)

**É fácil de instalar?**
- SIM! Apenas 2 cliques
- 1º clique: Baixa o ZIP
- 2º clique: Abre o arquivo "INICIAR-WORKER.bat"
- PRONTO! Sistema faz o resto sozinho

**Como saber se está funcionando?**
- Olhe no canto superior direito da tela
- Se vir: 🟢 **Worker Online** = Está rodando!
- Se vir: 🟡 **Worker Offline** = Não está rodando (mas tudo bem!)

**Onde baixar?**
- Acesse a página "Nova Análise"
- Procure por botão verde gigante "BAIXAR WORKER"
- Clique e siga os 2 passos simples

### Perguntas Frequentes

**P: Preciso saber programar para usar?**
R: NÃO! Se você é Admin Cliente, só precisa clicar em botões. Sistema faz tudo sozinho.

**P: E se der erro?**
R: Sistema mostra mensagens claras explicando o problema. Em caso de dúvida, contate suporte.

**P: Posso analisar quantos repositórios?**
R: SIM! Sistema suporta 1500+ repositórios sem problemas. Analisa todos automaticamente.

**P: Os relatórios são difíceis de entender?**
R: NÃO! Relatórios são feitos para pessoas SEM conhecimento técnico. Tem gráficos bonitos e explicações claras.

**P: Preciso instalar algo no meu computador?**
R: NÃO para usar o sistema (funciona no navegador). SIM apenas se quiser análise mais rápida (Worker Local opcional).

**P: Como saber se a análise terminou?**
R: Sistema mostra notificação verde na tela "Análise Concluída! 🎉" e atualiza automaticamente.

**P: Posso baixar os relatórios?**
R: SIM! Botão "Baixar Relatório" gera ZIP com PDF + Excel + JSON. Tudo detalhado.
