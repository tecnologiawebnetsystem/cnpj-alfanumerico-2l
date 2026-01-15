# CNPJ Analyzer - WPF Desktop Application

## 📋 Visão Geral

Aplicação desktop WPF completa seguindo os mesmos princípios e funcionalidades da aplicação web, utilizando o mesmo banco de dados Supabase.

## 🏗️ Arquitetura

### Clean Architecture com 4 camadas:

1. **Domain** - Entidades e regras de negócio (DDD)
2. **Application** - Use Cases e Interfaces (Application Services)
3. **Infrastructure** - Implementação de repositórios e serviços externos
4. **WPF** - Apresentação com MVVM pattern

## 🎨 Padrões Implementados

- **MVVM** - Model-View-ViewModel para separação de concerns
- **SOLID** - Princípios de design orientado a objetos
- **DDD** - Domain-Driven Design para modelagem de domínio
- **TDD** - Test-Driven Development com projeto de testes
- **Repository Pattern** - Abstração de acesso a dados
- **Dependency Injection** - Inversão de controle
- **Clean Code** - Código limpo e legível

## 🗄️ Banco de Dados

Utiliza o **mesmo banco Supabase** da aplicação web:
- Mesmas tabelas (users, clients, analyses, findings, accounts, developers, tasks)
- Mesmas regras de negócio
- Mesma estrutura de dados

## 🎯 Funcionalidades

### Para ADMIN:
- Dashboard com visão geral do sistema
- Gerenciamento de clientes
- Gerenciamento de usuários
- Visualização de todas as análises
- Relatórios globais

### Para ADMIN_CLIENT:
- Dashboard do cliente
- Gerenciamento de desenvolvedores
- Gerenciamento de tarefas
- Configuração de contas Git (GitHub, GitLab, Azure)
- Análise de repositórios Git
- **Nova**: Análise de banco de dados via connection string
- Visualização de análises
- Geração de relatórios PDF
- Configurações do cliente

### Para DEVELOPER:
- Dashboard pessoal
- Visualização de tarefas atribuídas
- Estatísticas de commits e análises
- Histórico de trabalho

## 🚀 Tecnologias

- **.NET 8** - Framework base
- **WPF** - Interface gráfica
- **Material Design** - Design system
- **CommunityToolkit.Mvvm** - Helpers para MVVM
- **Supabase SDK** - Conexão com banco de dados
- **LibGit2Sharp** - Análise de repositórios Git
- **QuestPDF** - Geração de relatórios PDF
- **xUnit** - Testes unitários

## 📁 Estrutura do Projeto

\`\`\`
wpf/
├── src/
│   ├── CNPJAnalyzer.Domain/          # Entidades e Value Objects
│   │   └── Entities/
│   │       ├── User.cs
│   │       ├── Client.cs
│   │       ├── Analysis.cs
│   │       ├── Finding.cs
│   │       ├── Account.cs
│   │       ├── Developer.cs
│   │       └── Task.cs
│   │
│   ├── CNPJAnalyzer.Application/     # Use Cases e Interfaces
│   │   ├── Interfaces/
│   │   │   ├── IUserRepository.cs
│   │   │   ├── IClientRepository.cs
│   │   │   └── IAnalysisRepository.cs
│   │   └── Services/
│   │       ├── IAuthenticationService.cs
│   │       └── ICodeAnalysisService.cs
│   │
│   ├── CNPJAnalyzer.Infrastructure/   # Implementações
│   │   ├── Data/
│   │   │   └── SupabaseContext.cs
│   │   └── Repositories/
│   │       ├── UserRepository.cs
│   │       ├── ClientRepository.cs
│   │       └── AnalysisRepository.cs
│   │
│   └── CNPJAnalyzer.WPF/             # Interface WPF
│       ├── ViewModels/
│       │   ├── LoginViewModel.cs
│       │   ├── AdminDashboardViewModel.cs
│       │   ├── ClientDashboardViewModel.cs
│       │   └── DeveloperDashboardViewModel.cs
│       ├── Views/
│       │   ├── LoginWindow.xaml
│       │   ├── AdminDashboardWindow.xaml
│       │   ├── ClientDashboardWindow.xaml
│       │   └── DeveloperDashboardWindow.xaml
│       └── Styles/
│           ├── Colors.xaml
│           └── Buttons.xaml
│
└── tests/
    └── CNPJAnalyzer.Tests/           # Testes unitários
\`\`\`

## ⚙️ Configuração

1. Abra a solução no Visual Studio 2022
2. Configure o `appsettings.json` com suas credenciais Supabase:

\`\`\`json
{
  "Supabase": {
    "Url": "https://seu-projeto.supabase.co",
    "Key": "sua-chave-anon"
  }
}
\`\`\`

3. Build e execute o projeto CNPJAnalyzer.WPF

## 🎨 Design

- **Tema Dark Professional** - Interface moderna e profissional
- **Material Design** - Componentes consistentes
- **Responsive** - Adaptável a diferentes resoluções
- **Acessível** - Seguindo padrões de acessibilidade

## 📊 Status do Projeto

✅ Estrutura Clean Architecture completa
✅ Entidades de domínio com DDD
✅ Interfaces de repositórios
✅ Configuração de DI
✅ ViewModel de Login com MVVM
✅ Tela de Login com Material Design
✅ Conexão com Supabase (mesmo banco do web)

🚧 Em desenvolvimento:
- ViewModels dos Dashboards
- Telas dos Dashboards
- Serviço de análise de código
- Serviço de análise de banco de dados
- Geração de relatórios PDF
- Testes unitários completos

## 🤝 Integração com Web

Este projeto WPF **compartilha o mesmo banco de dados** com a aplicação web Next.js:
- ✅ Mesmas tabelas
- ✅ Mesmos perfis de usuário
- ✅ Mesmas análises
- ✅ Mesmos dados
- ✅ Sincronização automática

**Usuários podem usar tanto a versão web quanto desktop com as mesmas credenciais!**
