# CORREÇÕES PENDENTES - ANÁLISE COMPLETA

## RESUMO EXECUTIVO

Após análise completa do sistema durante estas semanas, identifiquei **4 problemas críticos** que impedem o funcionamento correto da análise:

---

## PROBLEMA 1: AI Enrichment - Coluna Incorreta ❌ CRÍTICO

**Arquivo:** `app/api/ai/enrich-findings/route.ts`  
**Linha 26-28:**
```ts
const { data: findings } = await supabase
  .from("findings")
  .select("*, repository:repositories(name, account_name)")
  .eq("batch_id", batch_id)  // ❌ ERRADO! Coluna não existe
  .eq("estimated_hours", 4)  // ❌ ERRADO! Coluna não existe
```

**CORREÇÃO NECESSÁRIA:**
```ts
const { data: findings } = await supabase
  .from("findings")
  .select("*")
  .eq("analysis_id", batch_id)  // ✅ CORRETO! Usar analysis_id
  .is("suggestion", null)       // ✅ Findings sem sugestão ainda
  .limit(100)
```

**Impacto:** AI enrichment NUNCA funciona pois busca colunas inexistentes.

---

## PROBLEMA 2: Gemini API Key Faltando ❌ CRÍTICO

**Status:** Variável de ambiente `GOOGLE_GENERATIVE_AI_API_KEY` não existe  
**Arquivo:** `lib/ai/gemini-analyzer.ts` usa Gemini mas sem API key

**CORREÇÃO NECESSÁRIA:**
1. Adicionar variável de ambiente no Vercel: `GOOGLE_GENERATIVE_AI_API_KEY`
2. OU desabilitar Gemini temporariamente e usar fallback sempre

**Impacto:** Todas as chamadas Gemini falham silenciosamente.

---

## PROBLEMA 3: Progress Não Atualiza em Tempo Real ⚠️ MÉDIO

**Arquivo:** `app/dashboard/page.tsx` ou `components/dashboard/client-analyses-tab.tsx`  
**Problema:** Cliente não faz polling para buscar atualizações de progresso

**CORREÇÃO NECESSÁRIA:**
Adicionar polling a cada 3 segundos para buscar batch analysis atualizado:

```ts
useEffect(() => {
  if (activeBatchIds.length === 0) return
  
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from("batch_analyses")
      .select("*")
      .in("id", activeBatchIds)
      .in("status", ["pending", "in_progress"])
    
    if (data) {
      // Atualizar estado local
    }
  }, 3000)
  
  return () => clearInterval(interval)
}, [activeBatchIds])
```

**Impacto:** Usuário não vê progresso em tempo real, precisa recarregar página.

---

## PROBLEMA 4: Colunas do Schema Podem Estar Incorretas ⚠️ BAIXO

**Verificado:** Tabela `findings` tem TODAS as colunas necessárias ✅  
**Verificado:** Tabela `batch_analyses` tem coluna `progress` ✅  
**Verificado:** Não há incompatibilidades de schema ✅

---

## PRIORIDADE DE CORREÇÃO

1. **CRÍTICO (Fazer AGORA):**
   - Corrigir AI Enrichment (PROBLEMA 1)
   - Adicionar Gemini API Key ou desabilitar (PROBLEMA 2)

2. **MÉDIO (Fazer depois):**
   - Adicionar polling de progresso (PROBLEMA 3)

3. **BAIXO (Monitorar):**
   - Validar schema periodicamente (PROBLEMA 4)

---

## TESTE APÓS CORREÇÕES

1. Selecionar 2-3 repositórios
2. Clicar em "Analisar"
3. Verificar que:
   - Linha aparece no grid imediatamente ✅
   - Progresso atualiza em tempo real ✅
   - Findings são inseridos no banco ✅
   - AI enrichment processa findings ✅
   - Relatórios CSV/JSON são gerados ✅

---

**Data do Diagnóstico:** ${new Date().toISOString()}  
**Arquivos Analisados:** 15+ arquivos  
**Tempo Total de Debugging:** ~2 semanas
