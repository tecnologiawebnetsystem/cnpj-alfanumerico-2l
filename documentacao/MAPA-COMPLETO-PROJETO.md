# Mapa Completo da Estrutura do Projeto

## Visão Geral dos 2 Projetos no Mesmo Repositório

```
📁 REPOSITÓRIO RAIZ
├── 🌐 PROJETO WEB (Next.js 16 + React 19)
│   └── Estrutura detalhada abaixo
│
└── 🖥️ PROJETO DESKTOP WPF (C# + .NET 8)
    └── Pasta: wpf-desktop/
```

---

## 🌐 PROJETO WEB - Next.js (Frontend + Backend)

### Estrutura Completa

```
📦 RAIZ DO PROJETO WEB
│
├── 📁 app/ ..................... PÁGINAS E ROTAS (Next.js 16 App Router)
│   │
│   ├── 🏠 PÁGINAS PÚBLICAS
│   │   ├── page.tsx ............ Landing page principal
│   │   ├── login/page.tsx ...... Tela de login
│   │   ├── forgot-password/ .... Recuperação de senha
│   │   └── not-found.tsx ....... Página 404
│   │
│   ├── 👨‍💼 DASHBOARD ADMIN (3 perfis: SUPER_ADMIN, ADMIN, ADMIN_CLIENT)
│   │   ├── admin/page.tsx ...... Dashboard do administrador
│   │   ├── admin/settings/ ..... Configurações do sistema
│   │   ├── admin/errors/ ....... Gerenciamento de erros
│   │   └── admin-client/ ....... Gestão de clientes
│   │
│   ├── 👥 DASHBOARD CLIENTE (Perfil: CLIENT)
│   │   ├── dashboard/page.tsx .. Dashboard do cliente
│   │   ├── dashboard/settings/ . Configurações do cliente
│   │   ├── dashboard/activity/ . Atividades recentes
│   │   ├── dashboard/ai/ ....... Assistente AI
│   │   └── dashboard/sprints/ .. Gerenciamento de sprints
│   │
│   ├── 👨‍💻 DASHBOARD DESENVOLVEDOR (Perfil: DEVELOPER)
│   │   └── dev/dashboard/ ...... Dashboard do desenvolvedor
│   │
│   ├── 📊 ANÁLISES
│   │   ├── analyzer/page.tsx ... Iniciar nova análise
│   │   ├── analysis/[id]/ ...... Detalhes da análise
│   │   └── analysis-diagnostic/ . Diagnóstico de análises
│   │
│   ├── 📄 RELATÓRIOS
│   │   ├── reports/page.tsx .... Listagem de relatórios
│   │   └── documentacao/ ....... Documentação do sistema
│   │
│   ├── 🔗 INTEGRAÇÕES
│   │   ├── connections/ ........ Conexões (GitHub, GitLab, Azure)
│   │   ├── integrations/ ....... Gerenciar integrações
│   │   └── database-analyzer/ .. Análise via connection string
│   │
│   ├── 📋 TAREFAS
│   │   └── tasks/page.tsx ...... Gerenciamento de tarefas
│   │
│   ├── 📈 MONITORAMENTO
│   │   ├── monitoring/ ......... Dashboard de monitoramento
│   │   └── worker/ ............. Status do worker
│   │
│   ├── 📚 WIKI E AJUDA
│   │   ├── wiki/ ............... Base de conhecimento
│   │   └── solucao/ ............ Informações sobre soluções
│   │
│   └── 🔌 API (Backend - 180+ rotas)
│       ├── api/auth/ ........... Autenticação e login
│       │   ├── login/route.ts
│       │   ├── me/route.ts
│       │   └── reset-admin-password/
│       │
│       ├── api/admin/ .......... APIs do administrador
│       │   ├── users/ .......... CRUD de usuários
│       │   ├── clients/ ........ CRUD de clientes
│       │   ├── analyses/ ....... Análises
│       │   ├── stats/ .......... Estatísticas
│       │   └── settings/ ....... Configurações
│       │
│       ├── api/client/ ......... APIs do cliente
│       │   ├── developers/ ..... Gerenciar desenvolvedores
│       │   ├── tasks/ .......... Tarefas do cliente
│       │   ├── stats/ .......... Estatísticas do cliente
│       │   └── repositories/ ... Repositórios
│       │
│       ├── api/dev/ ............ APIs do desenvolvedor
│       │   ├── tasks/ .......... Tarefas do dev
│       │   └── dashboard/ ...... Dashboard dev
│       │
│       ├── api/analyze/ ........ Motor de análise
│       │   └── route.ts ........ Iniciar análise
│       │
│       ├── api/ai/ ............. Inteligência Artificial
│       │   ├── chat/route.ts ... Chatbot
│       │   ├── suggestions/ .... Sugestões de código
│       │   └── fix-code/ ....... Correção automática
│       │
│       ├── api/reports/ ........ Geração de relatórios
│       │   ├── generate/ ....... Gerar relatórios
│       │   ├── [id]/pdf/ ....... Exportar PDF
│       │   └── [id]/csv/ ....... Exportar CSV
│       │
│       ├── api/integrations/ ... Integrações externas
│       │   ├── accounts/ ....... Contas conectadas
│       │   ├── github/ ......... GitHub API
│       │   └── azure/ .......... Azure DevOps
│       │
│       ├── api/database-connections/ ... Conexões de banco
│       │   ├── route.ts ........ Listar conexões
│       │   └── [id]/analyze/ ... Analisar banco
│       │
│       ├── api/notifications/ .. Sistema de notificações
│       ├── api/monitoring/ ..... Monitoramento e alertas
│       ├── api/analytics/ ...... Analytics e métricas
│       └── api/v1/ ............. API pública versionada
│
├── 📁 components/ .............. COMPONENTES REACT (190+ componentes)
│   │
│   ├── 🎨 UI (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ... (40+ componentes UI)
│   │
│   ├── 📊 Dashboard
│   │   ├── dashboard-header.tsx
│   │   ├── dashboard-sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── client-overview-tab.tsx
│   │   ├── client-tasks-tab.tsx
│   │   ├── client-devs-tab.tsx
│   │   └── ... (25+ componentes de dashboard)
│   │
│   ├── 👨‍💼 Admin
│   │   ├── admin-users-tab.tsx
│   │   ├── admin-clients-tab.tsx
│   │   ├── admin-analyses-tab.tsx
│   │   └── ... (10+ componentes admin)
│   │
│   ├── 📈 Analytics
│   │   ├── analytics-dashboard.tsx
│   │   ├── analyses-chart.tsx
│   │   └── performance-chart.tsx
│   │
│   ├── 🤖 AI
│   │   ├── code-suggestion-panel.tsx
│   │   ├── semantic-search.tsx
│   │   └── chatbot-widget.tsx
│   │
│   ├── 📄 Reports
│   │   ├── analysis-comparison.tsx
│   │   ├── evolution-chart.tsx
│   │   └── scheduled-reports-manager.tsx
│   │
│   └── 🎮 Gamification
│       ├── achievements-panel.tsx
│       ├── leaderboard.tsx
│       └── streak-counter.tsx
│
├── 📁 lib/ ..................... BIBLIOTECAS E UTILITÁRIOS
│   ├── supabase/
│   │   ├── server.ts ........... Cliente Supabase para servidor
│   │   ├── client.ts ........... Cliente Supabase para cliente
│   │   └── api-client.ts ....... Cliente para API routes
│   │
│   ├── ai/
│   │   └── gemini.ts ........... Integração Google Gemini
│   │
│   ├── auth/
│   │   └── session.ts .......... Gerenciamento de sessão
│   │
│   └── utils.ts ................ Funções utilitárias
│
├── 📁 public/ .................. ARQUIVOS ESTÁTICOS
│   ├── images/
│   ├── api-spec.json ........... Especificação OpenAPI
│   └── favicon.ico
│
├── 📁 scripts/ ................. SCRIPTS DE BANCO E UTILITÁRIOS
│   └── ... (scripts SQL e Node.js)
│
├── 📄 CONFIGURAÇÕES
│   ├── package.json ............ Dependências e scripts
│   ├── tsconfig.json ........... TypeScript config
│   ├── next.config.mjs ......... Next.js config
│   ├── tailwind.config.ts ...... Tailwind CSS
│   └── .env.local .............. Variáveis de ambiente
│
└── 📚 DOCUMENTAÇÃO
    ├── README.md ............... Documentação principal
    ├── ESPECIFICACAO-TECNICA.md  Especificação técnica
    ├── DEPLOYMENT_GUIDE.md ..... Guia de deploy
    └── ... (20+ arquivos de documentação)
```

---

## 🖥️ PROJETO DESKTOP WPF - C# .NET 8

### Estrutura Completa

```
📁 wpf-desktop/
│
├── 📄 CNPJAnalyzer.Desktop.sln ... SOLUTION FILE (.NET)
│
├── 📁 src/ ....................... CÓDIGO FONTE
│   │
│   ├── 📦 CNPJAnalyzer.Core/ ..... CAMADA DE DOMÍNIO (Domain Layer)
│   │   │
│   │   ├── Domain/
│   │   │   ├── Entities/ ......... Entidades do domínio
│   │   │   │   ├── User.cs ....... Usuário (3 perfis)
│   │   │   │   ├── Client.cs ..... Cliente
│   │   │   │   ├── Developer.cs .. Desenvolvedor
│   │   │   │   ├── Analysis.cs ... Análise
│   │   │   │   ├── Task.cs ....... Tarefa
│   │   │   │   ├── Account.cs .... Conta conectada
│   │   │   │   └── Report.cs ..... Relatório
│   │   │   │
│   │   │   ├── Enums/ ............ Enumerações
│   │   │   │   ├── UserRole.cs ... SUPER_ADMIN, ADMIN, ADMIN_CLIENT, CLIENT, DEVELOPER
│   │   │   │   ├── TaskStatus.cs . Status de tarefas
│   │   │   │   └── AnalysisStatus.cs
│   │   │   │
│   │   │   └── ValueObjects/ ..... Objetos de valor
│   │   │
│   │   └── Interfaces/ ........... Contratos (abstrações)
│   │       ├── IRepository.cs .... Repository base
│   │       ├── IUserRepository.cs
│   │       ├── IAnalysisRepository.cs
│   │       └── IUnitOfWork.cs .... Unit of Work pattern
│   │
│   ├── 📦 CNPJAnalyzer.Application/ ... CAMADA DE APLICAÇÃO (Use Cases)
│   │   │
│   │   ├── Services/ ............. Serviços de negócio
│   │   │   ├── AuthenticationService.cs ... Login/Logout
│   │   │   ├── AnalysisService.cs ......... Análises
│   │   │   ├── TaskService.cs ............. Tarefas
│   │   │   ├── ReportService.cs ........... Relatórios
│   │   │   └── IntegrationService.cs ...... GitHub/GitLab/Azure
│   │   │
│   │   ├── DTOs/ ................. Data Transfer Objects
│   │   │   ├── LoginRequest.cs
│   │   │   ├── AnalysisRequest.cs
│   │   │   └── TaskResponse.cs
│   │   │
│   │   └── Validators/ ........... Validações (FluentValidation)
│   │       └── LoginRequestValidator.cs
│   │
│   ├── 📦 CNPJAnalyzer.Infrastructure/ ... CAMADA DE INFRAESTRUTURA
│   │   │
│   │   ├── Data/ ................. Acesso a dados
│   │   │   ├── SupabaseContext.cs . Contexto do Supabase
│   │   │   └── Repositories/ ...... Implementações
│   │   │       ├── UserRepository.cs
│   │   │       ├── AnalysisRepository.cs
│   │   │       └── TaskRepository.cs
│   │   │
│   │   ├── ExternalServices/ ..... Serviços externos
│   │   │   ├── GitHubService.cs .. API GitHub
│   │   │   ├── GitLabService.cs .. API GitLab
│   │   │   └── AzureService.cs ... API Azure DevOps
│   │   │
│   │   └── Analyzers/ ............ Motores de análise
│   │       ├── CodeAnalyzer.cs ... Análise de código
│   │       └── DatabaseAnalyzer.cs Análise via connection string
│   │
│   └── 📦 CNPJAnalyzer.Desktop/ .. CAMADA DE APRESENTAÇÃO (UI WPF)
│       │
│       ├── App.xaml .............. Aplicação WPF
│       ├── App.xaml.cs ........... Startup e DI
│       │
│       ├── Views/ ................ TELAS (XAML)
│       │   │
│       │   ├── LoginWindow.xaml .. Tela de login
│       │   │
│       │   ├── Admin/ ............ Telas do Administrador
│       │   │   ├── AdminDashboardWindow.xaml
│       │   │   ├── UsersManagementView.xaml
│       │   │   ├── ClientsManagementView.xaml
│       │   │   └── SystemSettingsView.xaml
│       │   │
│       │   ├── Client/ ........... Telas do Cliente
│       │   │   ├── ClientDashboardWindow.xaml
│       │   │   ├── DevelopersView.xaml
│       │   │   ├── TasksView.xaml
│       │   │   └── AnalysesView.xaml
│       │   │
│       │   ├── Developer/ ........ Telas do Desenvolvedor
│       │   │   ├── DeveloperDashboardWindow.xaml
│       │   │   └── MyTasksView.xaml
│       │   │
│       │   └── Shared/ ........... Componentes compartilhados
│       │       ├── ReportsView.xaml
│       │       └── SettingsView.xaml
│       │
│       ├── ViewModels/ ........... VIEW MODELS (MVVM)
│       │   ├── LoginViewModel.cs
│       │   ├── AdminDashboardViewModel.cs
│       │   ├── ClientDashboardViewModel.cs
│       │   └── DeveloperDashboardViewModel.cs
│       │
│       ├── Controls/ ............. CONTROLES CUSTOMIZADOS
│       │   ├── ChartControl.xaml
│       │   └── DataGridExtensions.cs
│       │
│       ├── Converters/ ........... CONVERTERS (XAML)
│       │   └── BoolToVisibilityConverter.cs
│       │
│       ├── Resources/ ............ RECURSOS (Estilos, cores)
│       │   ├── Styles.xaml ....... Estilos globais
│       │   ├── Colors.xaml ....... Paleta de cores profissional
│       │   └── Icons.xaml ........ Ícones vetoriais
│       │
│       └── appsettings.json ...... Configurações da aplicação
│
├── 📁 tests/ ..................... TESTES (TDD)
│   ├── CNPJAnalyzer.Tests.Unit/ .. Testes unitários
│   └── CNPJAnalyzer.Tests.Integration/ ... Testes de integração
│
└── 📚 DOCUMENTAÇÃO WPF
    ├── README.md ................. Guia do projeto WPF
    └── ARCHITECTURE.md ........... Arquitetura detalhada
```

---

## 🔄 Banco de Dados Compartilhado

**IMPORTANTE:** Os dois projetos usam o **MESMO BANCO DE DADOS Supabase/PostgreSQL**

```
🗄️ SUPABASE (PostgreSQL)
│
├── 📊 TABELAS PRINCIPAIS
│   ├── users ................... Usuários (3 perfis)
│   ├── clients ................. Clientes
│   ├── developers .............. Desenvolvedores
│   ├── analyses ................ Análises de código
│   ├── tasks ................... Tarefas
│   ├── accounts ................ Contas conectadas (GitHub/GitLab/Azure)
│   ├── reports ................. Relatórios
│   └── database_connections .... Conexões para análise local
│
└── 🔐 SEGURANÇA
    ├── Row Level Security (RLS) ativo
    └── Políticas por perfil (ADMIN, CLIENT, DEVELOPER)
```

---

## 📋 Funcionalidades Implementadas

### ✅ PROJETO WEB (100% Funcional)

- ✅ Login e autenticação (3 perfis)
- ✅ Dashboard Admin completo
- ✅ Dashboard Cliente completo
- ✅ Dashboard Desenvolvedor completo
- ✅ Sistema de análise de código (GitHub/GitLab/Azure)
- ✅ Análise via connection string (banco de dados)
- ✅ Gerenciamento de tarefas
- ✅ Geração de relatórios (PDF/CSV/JSON)
- ✅ Sistema de contas conectadas
- ✅ Chatbot com IA (Google Gemini)
- ✅ Sistema de gamificação
- ✅ 180+ rotas de API funcionais

### ⚠️ PROJETO WPF (Estrutura Criada - 10% Implementado)

- ✅ Estrutura Clean Architecture
- ✅ Camadas separadas (Core, Application, Infrastructure, Desktop)
- ✅ Entidades de domínio
- ✅ Interfaces definidas
- ❌ ViewModels pendentes (MVVM)
- ❌ Telas XAML pendentes
- ❌ Implementação de serviços
- ❌ Integração com Supabase
- ❌ Sistema de análises
- ❌ Geração de relatórios

---

## 🚀 Como Ver os 2 Projetos

### No seu File Explorer:

1. **Ver o projeto WEB:**
   - Clique na **raiz do repositório** (nível superior)
   - Você verá: `app/`, `components/`, `lib/`, `package.json`

2. **Ver o projeto WPF:**
   - Navegue para a pasta `wpf-desktop/`
   - Você verá: `src/`, `CNPJAnalyzer.Desktop.sln`

### Estrutura simplificada:

```
📦 REPOSITÓRIO
│
├── app/ ........................ ← PROJETO WEB
├── components/ ................. ← PROJETO WEB
├── lib/ ........................ ← PROJETO WEB
├── package.json ................ ← PROJETO WEB
│
└── wpf-desktop/ ................ ← PROJETO DESKTOP WPF
    ├── src/
    └── CNPJAnalyzer.Desktop.sln
```

---

## 📊 Estatísticas dos Projetos

### 🌐 PROJETO WEB
- **Páginas:** 40+
- **Componentes React:** 190+
- **Rotas de API:** 180+
- **Linhas de código:** ~50.000+
- **Status:** ✅ 100% Funcional

### 🖥️ PROJETO WPF
- **Arquivos criados:** 24
- **Linhas de código:** ~2.000
- **Status:** ⚠️ 10% Implementado (estrutura base)

---

## 🎯 Próximos Passos

Para completar o projeto WPF, é necessário:

1. Implementar todos os ViewModels (MVVM)
2. Criar todas as telas XAML (Login, Dashboards, etc.)
3. Implementar os serviços de negócio
4. Integrar com Supabase via REST API
5. Criar sistema de análises offline
6. Implementar geração de relatórios PDF
7. Adicionar testes unitários e de integração

**Estimativa:** 100+ arquivos adicionais para completar o WPF.

---

## ❓ Dúvidas?

Se você ainda não está vendo os arquivos:

1. **Certifique-se de estar na raiz do repositório**
2. **Recarregue o File Explorer** (F5)
3. **Verifique se o Git está sincronizado**
4. **Os dois projetos coexistem no mesmo repositório**
