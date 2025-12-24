# Como Executar o Sistema WPF - CNPJAnalyzer

## Pré-requisitos

### Software Necessário
- **Visual Studio 2022** (Community, Professional ou Enterprise)
  - Download: https://visualstudio.microsoft.com/downloads/
- **.NET 8.0 SDK** ou superior
  - Download: https://dotnet.microsoft.com/download/dotnet/8.0
- **Git** (para clonar o repositório)

### Workloads do Visual Studio
Ao instalar o Visual Studio, certifique-se de incluir:
- ✅ Desenvolvimento de área de trabalho do .NET
- ✅ ASP.NET e desenvolvimento Web (opcional, para entender o projeto web)

## Configuração do Ambiente

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `wpf/src/CNPJAnalyzer.WPF/appsettings.json`:

```json
{
  "Supabase": {
    "Url": "SUA_URL_SUPABASE_AQUI",
    "Key": "SUA_CHAVE_SUPABASE_AQUI"
  },
  "GitHub": {
    "Token": "SEU_TOKEN_GITHUB_AQUI"
  },
  "GitLab": {
    "Token": "SEU_TOKEN_GITLAB_AQUI"
  },
  "Azure": {
    "Token": "SEU_TOKEN_AZURE_AQUI"
  }
}
```

**As mesmas credenciais do projeto web funcionam aqui!**

### 2. Restaurar Pacotes NuGet

Abra o terminal na pasta `wpf/` e execute:

```bash
dotnet restore
```

### 3. Compilar a Solução

```bash
dotnet build
```

## Executando o Projeto

### Opção 1: Via Visual Studio (Recomendado)

1. Abra o arquivo `wpf/CNPJAnalyzer.sln` no Visual Studio 2022
2. Aguarde o Visual Studio restaurar os pacotes NuGet automaticamente
3. No Solution Explorer, clique com o botão direito no projeto **CNPJAnalyzer.WPF**
4. Selecione **"Set as Startup Project"**
5. Pressione **F5** ou clique em **"Start"** (▶️)

### Opção 2: Via Linha de Comando

Na pasta `wpf/`:

```bash
dotnet run --project src/CNPJAnalyzer.WPF/CNPJAnalyzer.WPF.csproj
```

## Estrutura do Projeto

```
wpf/
├── CNPJAnalyzer.sln                    # Solução principal
├── src/
│   ├── CNPJAnalyzer.Domain/           # Camada de Domínio (Entidades, Interfaces)
│   │   └── Entities/                  # User, Client, Analysis, etc.
│   │
│   ├── CNPJAnalyzer.Application/      # Camada de Aplicação (Use Cases, Services)
│   │   ├── Interfaces/                # IUserRepository, IClientRepository
│   │   └── Services/                  # IAuthenticationService, ICodeAnalysisService
│   │
│   ├── CNPJAnalyzer.Infrastructure/   # Camada de Infraestrutura (DB, APIs)
│   │   ├── Data/                      # SupabaseContext
│   │   └── Repositories/              # Implementações dos repositórios
│   │
│   └── CNPJAnalyzer.WPF/              # Camada de Apresentação (UI)
│       ├── Views/                     # LoginWindow.xaml
│       ├── ViewModels/                # LoginViewModel.cs
│       ├── Styles/                    # Colors.xaml, Buttons.xaml
│       └── App.xaml                   # Configuração inicial
│
└── tests/
    └── CNPJAnalyzer.Tests/            # Testes Unitários (TDD)
```

## Arquitetura Implementada

### Clean Architecture (4 Camadas)
```
┌─────────────────────────────────────┐
│      CNPJAnalyzer.WPF (UI)         │  ← Views, ViewModels (MVVM)
├─────────────────────────────────────┤
│   CNPJAnalyzer.Application         │  ← Use Cases, Services
├─────────────────────────────────────┤
│   CNPJAnalyzer.Infrastructure      │  ← Supabase, Repos, APIs
├─────────────────────────────────────┤
│   CNPJAnalyzer.Domain              │  ← Entities, Interfaces (Core)
└─────────────────────────────────────┘
```

### Padrões Implementados
- ✅ **MVVM** (Model-View-ViewModel) - Para separação UI/Lógica
- ✅ **Repository Pattern** - Para acesso a dados
- ✅ **Dependency Injection** - Para inversão de controle
- ✅ **SOLID Principles** - Clean Code e manutenibilidade
- ✅ **DDD** (Domain-Driven Design) - Entidades ricas
- ✅ **TDD** (Test-Driven Development) - Estrutura de testes pronta

## Funcionalidades Implementadas

### Atualmente Disponível
- ✅ Tela de Login com Material Design
- ✅ Autenticação via Supabase (mesmo banco do web)
- ✅ Estrutura MVVM completa
- ✅ Integração com Supabase configurada
- ✅ ViewModels com CommunityToolkit.Mvvm

### Em Desenvolvimento
- ⏳ Dashboard Admin (gerenciar clientes, usuários, análises)
- ⏳ Dashboard Client (visualizar análises, tarefas, desenvolvedores)
- ⏳ Dashboard Developer (tarefas atribuídas, repositórios)
- ⏳ Sistema de análise de código (GitHub/GitLab/Azure/Database)
- ⏳ Relatórios e geração de PDFs
- ⏳ Gerenciamento de contas conectadas

## Banco de Dados

### Mesmas Tabelas do Projeto Web
O sistema WPF usa **exatamente o mesmo banco Supabase** do projeto web:

```sql
- users                 # Usuários do sistema
- clients               # Clientes
- developers            # Desenvolvedores
- accounts              # Contas GitHub/GitLab/Azure
- analyses              # Análises realizadas
- findings              # Descobertas nas análises
- tasks                 # Tarefas dos desenvolvedores
- cnpj_analysis         # Análise específica de CNPJs
```

**Não é necessário criar novas tabelas!** Use o mesmo banco do web.

## Perfis de Usuário (3 Tipos)

### 1. ADMIN
- Gerenciar todos os clientes
- Visualizar todas as análises
- Configurar sistema
- Gerenciar usuários

### 2. ADMIN_CLIENT
- Visualizar análises do seu cliente
- Gerenciar desenvolvedores
- Criar e atribuir tarefas
- Conectar contas (GitHub/GitLab/Azure)

### 3. DEVELOPER
- Visualizar tarefas atribuídas
- Ver detalhes de análises
- Marcar tarefas como concluídas

## Análise de Código (4 Tipos)

### 1. GitHub
- Analisa repositórios públicos/privados
- Busca por CNPJs em formato alfanumérico
- Gera relatórios detalhados

### 2. GitLab
- Análise via API do GitLab
- Suporte a grupos e projetos

### 3. Azure DevOps
- Integração com Azure Repos
- Análise de pull requests

### 4. Banco de Dados (NOVA FUNCIONALIDADE)
- Conexão via connection string
- Análise de tabelas e stored procedures
- Busca por CNPJs em dados

## Troubleshooting

### Erro: "Could not load file or assembly"
**Solução:** Restaure os pacotes NuGet
```bash
dotnet restore
```

### Erro: "Supabase connection failed"
**Solução:** Verifique o `appsettings.json` com as credenciais corretas

### Erro: "MaterialDesign resources not found"
**Solução:** Limpe e reconstrua a solução
```bash
dotnet clean
dotnet build
```

### Erro: ".NET 8.0 SDK not found"
**Solução:** Instale o .NET 8.0 SDK:
https://dotnet.microsoft.com/download/dotnet/8.0

## Comandos Úteis

### Compilar apenas um projeto
```bash
dotnet build src/CNPJAnalyzer.WPF/CNPJAnalyzer.WPF.csproj
```

### Executar testes
```bash
dotnet test
```

### Publicar para distribuição
```bash
dotnet publish -c Release -o ./publish
```

### Limpar artefatos de build
```bash
dotnet clean
```

## Próximos Passos

1. ✅ Verificar se o Visual Studio 2022 está instalado
2. ✅ Configurar `appsettings.json` com credenciais Supabase
3. ✅ Abrir `CNPJAnalyzer.sln` no Visual Studio
4. ✅ Restaurar pacotes NuGet (automático)
5. ✅ Pressionar F5 para executar
6. ✅ Fazer login com usuário do sistema web

## Suporte

- 📧 Email: suporte@cnpjanalyzer.com
- 📚 Documentação: `/documentacao/`
- 🌐 Projeto Web: `http://localhost:3000`
- 💻 Projeto WPF: Este projeto

## Status do Projeto

**Versão Atual:** 1.0.0-alpha
**Status:** Em Desenvolvimento Ativo
**Última Atualização:** Dezembro 2024

---

**Projeto WEB e WPF compartilham o mesmo banco de dados Supabase!**
