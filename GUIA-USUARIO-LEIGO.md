# Guia Completo de Análise - Para Usuários Iniciantes

## O que o sistema faz?

Analisa seus repositórios de código procurando por campos CNPJ que precisam ser alterados de número (14 dígitos) para alfanumérico (18 caracteres).

## Passo a Passo SIMPLES

### 1. Conectar sua Conta

1. Clique em "Integrações" no menu
2. Clique em "Conectar Azure DevOps"
3. Faça login quando solicitado
4. Pronto! Sua conta está conectada

### 2. Iniciar uma Análise

1. Vá em "Analisador" no menu
2. Escolha sua conta na lista
3. Escolha o método:
   - **Cloud** (recomendado para iniciantes)
     - Funciona de qualquer lugar
     - Não precisa instalar nada
     - Clique e pronto!
   
   - **Local** (mais rápido se tem muitos repositórios)
     - Sistema configura tudo automaticamente
     - Apenas certifique-se que tem Git instalado
     - Se não tiver, o sistema avisa e ensina a instalar

4. Marque os repositórios que quer analisar
   - Use a busca para encontrar rápido
   - Pode selecionar todos de uma vez
   
5. Clique em "Iniciar Análise"

### 3. Acompanhar o Progresso

Você vai ver em tempo real:
- Quantos repositórios foram analisados
- Quantos arquivos foram verificados
- Quantas ocorrências de CNPJ foram encontradas
- Barra de progresso

### 4. Ver os Resultados

Quando terminar, você pode:

#### Gerar Tarefas Automaticamente
- Clique em "Gerar Tarefas"
- Sistema cria uma tarefa para cada ocorrência encontrada
- Tarefas já vêm priorizadas (alta, média, baixa)
- Pode atribuir para desenvolvedores depois

#### Baixar Relatório Completo
- Clique em "Gerar Relatório"
- Arquivo JSON é baixado automaticamente
- Contém tudo: estatísticas, findings, recomendações

## Perguntas Frequentes

### Quanto tempo demora?

- **1 repositório pequeno**: 30 segundos
- **10 repositórios médios**: 3-5 minutos
- **100 repositórios grandes**: 20-30 minutos

### Preciso ficar esperando?

Não! Você pode fechar a aba e voltar depois. O sistema continua processando.

### E se der erro?

O sistema mostra mensagens claras do que aconteceu. Se não entender, chame o suporte.

### Quantos repositórios posso analisar de uma vez?

Quantos quiser! O sistema aguenta até 2000+ repositórios sem problema.

### Os dados ficam seguros?

Sim! O sistema apenas lê os arquivos, nunca modifica nada. Seus dados ficam protegidos.

## Dicas para Melhores Resultados

1. **Analise por etapas**: Se tem muitos repos, comece com os mais importantes
2. **Use análise Local** se tiver 50+ repositórios (é mais rápido)
3. **Gere as tarefas** logo depois da análise para não esquecer
4. **Baixe o relatório** para ter registro do que foi encontrado

## Precisa de Ajuda?

- Email: suporte@actdigital.com
- Chat: Clique no ícone no canto inferior direito
- Wiki: Acesse nosso guia completo em /wiki

## Próximos Passos

Depois da análise:
1. Revise os findings no dashboard
2. Gere as tarefas
3. Atribua para desenvolvedores
4. Acompanhe o progresso das correções
5. Execute nova análise após correções para verificar
