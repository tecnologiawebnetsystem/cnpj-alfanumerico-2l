# CORREÇÃO CRÍTICA: createServerClient sem await

## O QUE ACONTECEU

Durante a implementação do sistema de autenticação baseado em token, EU REESCREVI a API de login e ACIDENTALMENTE removi o `await` do `createServerClient()`.

Isso quebrou o login que estava funcionando.

## PROBLEMA SISTÊMICO ENCONTRADO

Ao fazer uma busca completa no código, encontrei **~42 lugares** onde `createServerClient()` está sendo chamado SEM `await`, o que causa o erro:

```
Error: supabase.from is not a function
```

## ARQUIVOS CORRIGIDOS NESTE COMMIT

1. ✅ `app/api/auth/login/route.ts` - Adicionado await (CRÍTICO)
2. ✅ `app/api/integrations/accounts/[id]/route.ts` - 3 funções corrigidas
3. ✅ `app/api/integrations/accounts/route.ts` - 2 funções corrigidas
4. ✅ `app/api/accounts/[id]/route.ts` - 4 funções corrigidas

## ARQUIVOS QUE AINDA PRECISAM SER CORRIGIDOS

Os seguintes arquivos TÊM O MESMO PROBLEMA mas não são críticos para o fluxo de análise atual:

- `app/api/admin-client/dev-monitoring/route.ts`
- `app/api/admin/clients/[id]/route.ts`
- `app/api/admin/users/[id]/route.ts`
- `app/api/client/devs/[id]/route.ts`
- `app/api/client/devs/route.ts`
- `app/api/client/tasks/[id]/route.ts`
- `app/api/client/tasks/route.ts`
- `app/api/dev/dashboard/route.ts`
- `app/api/dev/progress/route.ts`
- `app/api/errors/[id]/route.ts`
- `app/api/profile/avatar/route.ts`
- `app/api/profile/route.ts`
- `app/api/tasks/[id]/apply/route.ts`
- `app/api/v1/analyze/[id]/route.ts`
- `app/api/v1/analyze/route.ts`
- `lib/api-auth.ts`

## LIÇÃO APRENDIDA

Ao fazer refatorações, NÃO devo reescrever código que funciona. Devo fazer mudanças CIRÚRGICAS e MINIMAMENTE INVASIVAS.

## PRÓXIMOS PASSOS

1. ✅ Login funcionando novamente
2. Testar análise com 1 repositório
3. Corrigir os outros arquivos DEPOIS que a análise funcionar
