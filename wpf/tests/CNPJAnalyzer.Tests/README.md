# CNPJAnalyzer.Tests

Projeto de testes unitários para o sistema CNPJ Analyzer WPF.

## Tecnologias

- **xUnit** - Framework de testes
- **Moq** - Biblioteca de mocking
- **FluentAssertions** - Assertions mais legíveis
- **Coverlet** - Cobertura de código

## Estrutura

\`\`\`
CNPJAnalyzer.Tests/
├── Domain/
│   └── Entities/          # Testes das entidades
├── Application/
│   └── Services/          # Testes dos serviços
├── Infrastructure/
│   └── Repositories/      # Testes dos repositórios
└── ViewModels/            # Testes dos ViewModels
\`\`\`

## Como Executar

### Via Visual Studio
1. Abra o Test Explorer (Test > Test Explorer)
2. Clique em "Run All Tests"

### Via Linha de Comando
\`\`\`bash
# Executar todos os testes
dotnet test

# Executar com cobertura
dotnet test /p:CollectCoverage=true

# Executar testes específicos
dotnet test --filter "FullyQualifiedName~UserTests"
\`\`\`

## Padrões

### Nomenclatura
- `MethodName_Should_ExpectedBehavior_When_Condition`
- Exemplo: `LoginAsync_ShouldReturnUser_WhenCredentialsAreValid`

### Estrutura AAA
Todos os testes seguem o padrão Arrange-Act-Assert:

\`\`\`csharp
[Fact]
public async Task Example_Should_DoSomething_When_ConditionMet()
{
    // Arrange - Preparar dados e mocks
    var service = new MyService();
    
    // Act - Executar ação
    var result = await service.DoSomething();
    
    // Assert - Verificar resultado
    result.Should().NotBeNull();
}
