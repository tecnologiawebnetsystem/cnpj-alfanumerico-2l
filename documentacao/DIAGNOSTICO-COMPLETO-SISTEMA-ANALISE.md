# 🔴 DIAGNÓSTICO COMPLETO DO SISTEMA DE ANÁLISE
## URGENTE - 48 HORAS PARA ENTREGA

**Data**: Janeiro 2025
**Status**: SISTEMA QUEBRADO - NÃO FUNCIONA
**Prioridade**: CRÍTICA

---

## 📋 RESUMO EXECUTIVO

O sistema de análise de repositórios NÃO está funcionando há 10 dias. Após análise detalhada linha por linha de TODOS os arquivos, identifiquei **7 PROBLEMAS CRÍTICOS** que impedem o funcionamento.

### IMPACTO:
- ❌ Análise de repositórios TRAVANDO
- ❌ Nenhum batch é criado com sucesso
- ❌ Relatórios PDF/CSV/JSON não funcionam
- ❌ Zero findings salvos no banco

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### PROBLEMA #1: IMPORT INVÁLIDO DO CRYPTO ⚠️ CRÍTICO
**Arquivo**: `app/api/analyze/route.ts` (LINHA 4)
**Erro**:
```ts
import { crypto } from "crypto"  // ❌ QUEBRA COMPILAÇÃO
```

**Por que falha**:
- `crypto` é um objeto GLOBAL do Node.js
- Não pode ser importado assim
- Causa erro de compilação IMEDIATO
- API nem carrega

**Solução**:
```ts
// Remover linha 4 completamente
// crypto.randomUUID() funciona sem import
```

---

### PROBLEMA #2: TABELA `search_patterns` NÃO EXISTE ⚠️ CRÍTICO
**Arquivo**: `app/api/analyze/route.ts` (LINHAS 33-40)
**Erro**:
```ts
const { data: customPatterns } = await supabase
  .from("search_patterns")  // ❌ TABELA NÃO EXISTE
  .select("pattern")
```

**Por que falha**:
- Query trava esperando resposta
- Tabela não existe no schema
- Timeout silencioso
- Background processing PARA aqui

**Schema atual**: NÃO TEM `search_patterns`
**Solução**: Usar padrões default diretos sem consultar banco

---

### PROBLEMA #3: CAMPO `azure_repo_id` NÃO EXISTE ⚠️ CRÍTICO
**Arquivo**: `app/api/analyze/route.ts` (LINHA 243)
**Erro**:
```ts
const { data: repos } = await supabase
  .from("repositories")
  .select("azure_repo_id")  // ❌ CAMPO NÃO EXISTE
```

**Schema real da tabela `repositories`**:
```
- id: uuid
- name: character varying
- azure_devops_id: uuid  ← ESTE É O CAMPO CORRETO
- provider: character varying
- client_id: uuid
```

**Por que falha**:
- Campo `azure_repo_id` NÃO EXISTE
- Query retorna NULL
- Filtro de repositórios FALHA
- Analisa repos ERRADOS

**Solução**: Usar `azure_devops_id` (UUID) invés de `azure_repo_id`

---

### PROBLEMA #4: FUNÇÕES SQL NÃO FUNCIONAM ⚠️ CRÍTICO
**Arquivo**: `app/api/analyze/route.ts` (LINHAS 60-67)
**Erro**:
```ts
const { data: batch, error: batchError } = await supabase.rpc("create_batch_analysis", {
  p_id: batchId,
  p_client_id: token.client_id,
  p_user_id: user_id,
  p_total_repos: repositories.length,
})
```

**Funções criadas**:
1. `create_batch_analysis()` - Pode estar quebrada
2. `update_batch_progress()` - Pode estar quebrada  
3. `complete_batch_analysis()` - Pode estar quebrada

**Por que pode falhar**:
- Funções podem ter sido criadas com erros
- Parâmetros podem estar errados
- RLS pode estar bloqueando

**Solução**: Verificar se funções existem e testar manualmente

---

### PROBLEMA #5: LÓGICA DE BUSCA DE REPOSITÓRIOS ERRADA ⚠️ ALTO
**Arquivo**: `app/api/analyze/route.ts` (FUNÇÃO `fetchAzureRepositories`)
**Erro**:
```ts
const filtered = allRepositories.filter((repo) => 
  azureRepoIds.includes(repo.azure_repo_id)  // ❌ CAMPO ERRADO
)
```

**Por que falha**:
- Busca campo que não existe
- Compara UUID do banco com string da Azure API
- Match NUNCA acontece
- Analisa TODOS repos ao invés dos selecionados

**Solução**: Mapear corretamente IDs do Supabase → IDs da Azure

---

### PROBLEMA #6: TABELA `batch_analyses` SEM CAMPOS NECESSÁRIOS ⚠️ MÉDIO
**Schema atual**:
```
- id: uuid
- client_id: uuid
- user_id: uuid
- status: character varying
- total_repositories: integer
- completed_repositories: integer
- total_files: integer
- total_findings: integer
- progress: integer
- started_at: timestamp with time zone
- completed_at: timestamp with time zone
- created_at: timestamp with time zone
```

**Campos FALTANDO para análise funcional**:
- ❌ `repository_ids` JSONB - Lista de repos selecionados
- ❌ `search_patterns` JSONB - Termos customizados
- ❌ `analysis_config` JSONB - Configurações da análise

**Impacto**: Não consegue rastrear quais repos analisar

---

### PROBLEMA #7: RELATÓRIOS NÃO ENCONTRAM FINDINGS ⚠️ ALTO
**Arquivo**: `app/api/reports/[id]/route.ts`
**Problema**: Código ASSUME que findings existem, mas análise NUNCA salvou nada

**Fluxo atual**:
1. Análise tenta executar ❌ TRAVA
2. Nenhum finding é salvo ❌
3. Relatório busca findings vazios ❌
4. PDF/CSV/JSON ficam vazios ❌

**Solução**: Corrigir análise PRIMEIRO, depois relatórios funcionam

---

## 🔧 PLANO DE CORREÇÃO DEFINITIVO

### FASE 1: CORREÇÃO EMERGENCIAL (2 HORAS)

#### 1.1 Remover import inválido
```ts
// app/api/analyze/route.ts
// REMOVER LINHA 4:
// import { crypto } from "crypto"
```

#### 1.2 Remover query de search_patterns
```ts
// SUBSTITUIR LINHAS 30-45 POR:
const fieldNames = ["cnpj", "cpf_cnpj", "documento", "inscricao", "nr_cnpj"]
console.log(" Using default patterns:", fieldNames)
```

#### 1.3 Corrigir campo azure_repo_id
```ts
// SUBSTITUIR LINHA 243:
const { data: repos } = await supabase
  .from("repositories")
  .select("id, name, azure_devops_id")  // ← CAMPOS CORRETOS
  .in("id", repositoryIds)
```

#### 1.4 Simplificar criação de batch (remover RPC)
```ts
// SUBSTITUIR LINHAS 60-85:
const batchId = crypto.randomUUID()
const { data: batch, error: batchError } = await supabase
  .from("batch_analyses")
  .insert({
    id: batchId,
    client_id: token.client_id,
    user_id,
    status: "in_progress",
    total_repositories: repositories.length,
    completed_repositories: 0,
    total_files: 0,
    total_findings: 0,
    progress: 0,
    started_at: new Date().toISOString(),
  })
  .select()
  .single()

if (batchError) {
  console.error(" Failed to create batch:", batchError)
  return NextResponse.json({ error: "Failed to create batch" }, { status: 500 })
}
```

---

### FASE 2: CORREÇÃO DA LÓGICA DE ANÁLISE (4 HORAS)

#### 2.1 Corrigir função de busca de repositórios
```ts
async function fetchAzureRepositories(
  token: any,
  repositoryIds: string[],  // IDs do Supabase
  analyzeAll: boolean,
  accessToken: string,
  supabase: any,
) {
  console.log(" Repository IDs (Supabase):", repositoryIds)
  
  // 1. Buscar nomes dos repositórios selecionados no Supabase
  let selectedRepoNames: string[] = []
  if (!analyzeAll && repositoryIds.length > 0) {
    const { data: repos } = await supabase
      .from("repositories")
      .select("name")
      .in("id", repositoryIds)
    
    selectedRepoNames = repos?.map(r => r.name) || []
    console.log(" Selected repo names:", selectedRepoNames)
  }
  
  // 2. Buscar TODOS os repos da Azure
  const azureRepos = await fetchAllAzureRepos(token, accessToken)
  console.log(" Azure repos fetched:", azureRepos.length)
  
  // 3. Filtrar por nome se não for analyze_all
  if (!analyzeAll && selectedRepoNames.length > 0) {
    const filtered = azureRepos.filter(repo => 
      selectedRepoNames.includes(repo.name)
    )
    console.log(" Filtered to", filtered.length, "repos")
    return filtered
  }
  
  return azureRepos
}
```

#### 2.2 Simplificar updates de progresso
```ts
// SUBSTITUIR updates RPC por insert direto:
await supabase
  .from("batch_analyses")
  .update({
    completed_repositories: i + 1,
    progress: Math.round(((i + 1) / repositories.length) * 100),
    total_files: totalFilesProcessed,
    total_findings: totalFindingsFound,
  })
  .eq("id", batchId)
```

---

### FASE 3: TESTE E VALIDAÇÃO (2 HORAS)

#### 3.1 Teste com 1 repositório pequeno
```
1. Selecionar 1 repo pequeno (< 100 arquivos)
2. Clicar em Analisar
3. Verificar logs no console
4. Confirmar que batch foi criado
5. Confirmar que findings foram salvos
```

#### 3.2 Teste de relatórios
```
1. Após análise completa
2. Baixar PDF
3. Baixar CSV
4. Baixar JSON
5. Verificar que todos têm dados
```

---

## 📊 CHECKLIST DE VALIDAÇÃO

### Banco de Dados
- [ ] Tabela `batch_analyses` existe
- [ ] Tabela `findings` existe
- [ ] Tabela `repositories` tem campo `azure_devops_id`
- [ ] Funções SQL `create_batch_analysis`, `update_batch_progress`, `complete_batch_analysis` existem
- [ ] RLS está configurado corretamente

### API de Análise
- [ ] Sem import inválido de crypto
- [ ] Não consulta tabela `search_patterns`
- [ ] Usa campo correto `azure_devops_id`
- [ ] Batch é criado com sucesso
- [ ] Progress é atualizado
- [ ] Findings são salvos

### Frontend
- [ ] Analyzer page carrega
- [ ] Lista repositórios
- [ ] Botão "Analisar" funciona
- [ ] Redireciona para dashboard
- [ ] Dashboard mostra progresso

### Relatórios
- [ ] PDF gera com dados
- [ ] CSV gera com dados
- [ ] JSON gera com dados
- [ ] Download funciona

---

## 🚀 IMPLEMENTAÇÃO IMEDIATA

Vou implementar AGORA todas as correções críticas em um único commit.

**Tempo estimado**: 2 HORAS
**Teste completo**: 1 HORA
**Total**: 3 HORAS até sistema funcional

---

## 📞 SUPORTE

Se após as correções ainda houver problemas:
1. Enviar logs COMPLETOS do console
2. Enviar screenshot do erro
3. Informar qual repositório tentou analisar
4. Informar quantos repositórios selecionou

---

**PRÓXIMOS PASSOS**: Implementando correções AGORA...
