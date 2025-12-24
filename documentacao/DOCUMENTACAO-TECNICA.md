# Documentação Técnica - Sistema CNPJ Alfanumérico

## ARQUITETURA

### Stack:
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes (Serverless)
- **Banco**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + shadcn/ui
- **Reports**: jsPDF + ExcelJS + JSZip

### Estrutura:
```
/app                 # Páginas e APIs
/components          # Componentes React
/lib                 # Utilitários e lógica
  /analyzer          # Core de análise
  /reports           # Geradores de relatório
/scripts             # Migrations SQL
/worker-local        # Worker Node.js local
```

## FLUXO DE ANÁLISE

### 1. Inicialização:
```typescript
POST /api/analyze
{
  "repositories": ["repo1", "repo2"],
  "provider": "azuredevops",
  "analysis_method": "local" | "cloud"
}
```

### 2. Processamento:
- Cria registro em `batch_analyses`
- Se local: cria jobs em `worker_jobs`
- Se cloud: processa via API diretamente

### 3. Detecção:
```typescript
CNPJDetector.detect(content, customFields)
- Regex patterns dinâmicos
- Context extraction (3 linhas antes/depois)
- Severity classification
```

### 4. Geração de Soluções:
```typescript
SolutionGenerator.generate(finding)
- Analisa linguagem do arquivo
- Sugere código correto
- Estima horas de trabalho
```

## BANCO DE DADOS

### Tabelas Principais:
- `users` - Usuários e perfis
- `clients` - Clientes (empresas)
- `batch_analyses` - Análises
- `findings` - Ocorrências detectadas
- `findings_compressed` - Findings compactados
- `worker_jobs` - Jobs para worker local
- `workers` - Workers ativos
- `system_errors` - Logs de erro

## APIs PRINCIPAIS

### Análise:
- `POST /api/analyze` - Iniciar análise
- `GET /api/analyses` - Listar análises
- `GET /api/analyses/[id]` - Detalhes

### Relatórios:
- `GET /api/reports/[id]` - Download ZIP
- `GET /api/reports/analytics` - Dados dashboard
- `GET /api/reports/comparison` - Comparar análises

### Worker:
- `GET /api/worker/download` - Download worker ZIP
- `GET /api/worker/status` - Status workers
