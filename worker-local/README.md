# CNPJ Detector - Local Worker

Worker local para análise de repositórios com detecção de CNPJ.

## Instalação

1. Clone ou copie a pasta `worker-local` para sua máquina
2. Instale as dependências:

\`\`\`bash
cd worker-local
npm install
\`\`\`

3. Configure o arquivo `.env`:

\`\`\`bash
cp .env.example .env
\`\`\`

Edite o `.env` com suas credenciais:
- SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (do painel Supabase)
- AZURE_DEVOPS_PAT (Personal Access Token do Azure DevOps)
- PROJECTS_ROOT (padrão: C:\Projetos)

## Execução

### Modo Produção
\`\`\`bash
npm start
\`\`\`

### Modo Desenvolvimento (com hot reload)
\`\`\`bash
npm run dev
\`\`\`

## Como Funciona

1. **Polling**: O worker verifica a cada 10 segundos se há análises pendentes
2. **Clone**: Baixa os repositórios para `C:\Projetos\{projeto}\{repo}\`
3. **Análise**: Varre todos os arquivos localmente procurando CNPJs
4. **Upload**: Envia os resultados para o banco de dados
5. **Progress**: Atualiza o progresso em tempo real

## Estrutura de Pastas

\`\`\`
C:\Projetos\
  ├── ProjetoA\
  │   ├── RepoA1\
  │   └── RepoA2\
  └── ProjetoB\
      ├── RepoB1\
      └── RepoB2\
\`\`\`

## Vantagens

- ✅ Análise 10x mais rápida (local vs API)
- ✅ Sem limites de rate da API Azure DevOps
- ✅ Repositórios ficam disponíveis localmente
- ✅ Pode processar offline após clone

## Monitoramento

O worker envia "heartbeat" a cada 10 segundos para indicar que está ativo.
Você pode ver o status na interface web.

## Troubleshooting

### Erro de autenticação Azure DevOps
Verifique se o PAT está correto e tem permissões de leitura de código.

### Erro ao criar pasta C:\Projetos
Execute o worker com permissões de administrador.

### Erro de conexão Supabase
Verifique SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env
