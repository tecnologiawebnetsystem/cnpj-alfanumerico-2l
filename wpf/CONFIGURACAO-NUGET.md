# Guia de Configuração e Restauração de Pacotes NuGet

## Pacotes NuGet Necessários

### CNPJAnalyzer.WPF (Interface)
- **CommunityToolkit.Mvvm** 8.2.2 - Para implementação MVVM
- **Microsoft.Extensions.DependencyInjection** 8.0.0 - Injeção de Dependência
- **Microsoft.Extensions.Configuration.Json** 8.0.0 - Configurações via JSON
- **MaterialDesignThemes** 5.0.0 - Interface Material Design

### CNPJAnalyzer.Infrastructure (Dados)
- **Supabase** 1.3.3 - Cliente Supabase para PostgreSQL
- **Npgsql** 8.0.1 - Driver PostgreSQL
- **QuestPDF** 2024.1.3 - Geração de relatórios PDF
- **LibGit2Sharp** 0.30.0 - Integração com Git (GitHub/GitLab/Azure)

### CNPJAnalyzer.Tests (Testes)
- **xUnit** 2.6.6 - Framework de testes
- **xUnit.runner.visualstudio** 2.5.6 - Runner para Visual Studio
- **Moq** 4.20.70 - Biblioteca de mocking
- **FluentAssertions** 6.12.0 - Assertions fluentes
- **coverlet.collector** 6.0.0 - Cobertura de código

## Como Restaurar Pacotes

### Opção 1: Visual Studio 2022

1. Abra a solution: `wpf/CNPJAnalyzer.sln`
2. Clique com botão direito na Solution no Solution Explorer
3. Selecione **"Restore NuGet Packages"**
4. Aguarde o download de todos os pacotes

### Opção 2: Linha de Comando

Navegue até a pasta `wpf/` e execute:

```bash
dotnet restore CNPJAnalyzer.sln
```

### Opção 3: Build Automático

Ao fazer o primeiro build, os pacotes serão restaurados automaticamente:

```bash
cd wpf
dotnet build
```

## Verificar Instalação

Para verificar se todos os pacotes foram instalados corretamente:

```bash
dotnet list package
```

Ou no Visual Studio:
- **Tools** → **NuGet Package Manager** → **Manage NuGet Packages for Solution**

## Problemas Comuns

### Erro: "Package restore failed"

**Solução:**
```bash
dotnet nuget locals all --clear
dotnet restore --force
```

### Erro: "The type or namespace could not be found"

**Causa:** Pacotes não foram restaurados
**Solução:** Execute `dotnet restore` novamente

### Erro: "MaterialDesignThemes not found"

**Causa:** Pacote específico de WPF não instalado
**Solução:**
```bash
dotnet add package MaterialDesignThemes --version 5.0.0
```

### Erro: LibGit2Sharp não encontra DLLs nativas

**Causa:** DLLs nativas do Git não copiadas
**Solução:** Faça rebuild completo
```bash
dotnet clean
dotnet build
```

## Configuração Adicional

### appsettings.json

Crie o arquivo `wpf/src/CNPJAnalyzer.WPF/appsettings.json`:

```json
{
  "Supabase": {
    "Url": "https://seu-projeto.supabase.co",
    "Key": "sua-chave-anon-key"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  }
}
```

### Variáveis de Ambiente (Alternativa)

Ou configure variáveis de ambiente:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon-key
```

## Executar o Projeto

Após restaurar os pacotes:

### Visual Studio:
- Pressione **F5** ou clique em **Start**

### Linha de Comando:
```bash
cd wpf/src/CNPJAnalyzer.WPF
dotnet run
```

## Executar Testes

```bash
cd wpf/tests/CNPJAnalyzer.Tests
dotnet test
```

Com cobertura de código:
```bash
dotnet test --collect:"XPlat Code Coverage"
```

## Atualizar Pacotes

Para atualizar todos os pacotes para versões mais recentes:

```bash
dotnet list package --outdated
dotnet add package NomeDoPacote --version NovaVersao
```

Ou no Visual Studio:
- **Tools** → **NuGet Package Manager** → **Manage NuGet Packages for Solution**
- Aba **Updates**

## Status de Compatibilidade

Todas as versões dos pacotes são compatíveis com:
- **.NET 8.0**
- **Windows 10/11**
- **Visual Studio 2022** (17.8 ou superior)

## Suporte

Se encontrar problemas com pacotes NuGet:

1. Limpe o cache: `dotnet nuget locals all --clear`
2. Delete as pastas `bin/` e `obj/` de todos os projetos
3. Restaure novamente: `dotnet restore`
4. Faça rebuild: `dotnet build`
