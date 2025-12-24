# 🚀 Guia de Deploy - CNPJ Detector System

## Status: ✅ PRONTO PARA PRODUÇÃO

---

## 📋 Pré-requisitos

- Acesso ao Supabase do projeto
- Permissões para executar scripts SQL
- Acesso ao painel de administração

---

## 🗄️ Scripts SQL a Executar (OBRIGATÓRIO)

Execute os scripts SQL na seguinte ordem:

### 1️⃣ Script 026 - Project e Repository
```sql
-- scripts/026-add-project-and-repository-to-findings.sql
-- Adiciona colunas project e repository à tabela findings
-- TEMPO: ~5 segundos
```

**O que faz:**
- Adiciona coluna `project` (nome do projeto Azure DevOps)
- Adiciona coluna `repository` (nome do repositório)
- Cria índices para melhor performance
- Permite rastreamento completo: Projeto → Repositório → Arquivo

**Como executar:**
1. Vá para Supabase → SQL Editor
2. Cole o conteúdo do script 026
3. Clique em "Run"
4. Verifique se retorna 2 linhas (project, repository)

---

### 2️⃣ Script 027 - Error Logging
```sql
-- scripts/027-add-error-logging-to-analyses.sql
-- Adiciona tracking de erros nas análises
-- TEMPO: ~3 segundos
```

**O que faz:**
- Adiciona `error_message` nas análises
- Adiciona `error_details` (JSON) para debug
- Adiciona `retry_count` para controle de tentativas
- Permite diagnóstico completo de falhas

**Como executar:**
1. Vá para Supabase → SQL Editor
2. Cole o conteúdo do script 027
3. Clique em "Run"
4. Verifique mensagem de sucesso

---

### 3️⃣ Script 028 - Azure DevOps Sync
```sql
-- scripts/028-add-azure-sync-to-tasks.sql
-- Adiciona integração com Azure DevOps
-- TEMPO: ~3 segundos
```

**O que faz:**
- Adiciona `azure_work_item_id` nas tarefas
- Adiciona `azure_work_item_url` para link direto
- Permite criar work items diretamente do sistema

**Como executar:**
1. Vá para Supabase → SQL Editor
2. Cole o conteúdo do script 028
3. Clique em "Run"
4. Verifique se retorna colunas criadas

---

## ✅ Checklist de Validação Pós-Deploy

### 1. Teste Análise de Repositórios

```bash
# Cenário 1: Análise Pequena (5-10 repos)
✓ Dashboard → Nova Análise
✓ Selecionar conta Azure DevOps
✓ Selecionar 5-10 repositórios
✓ Clicar em "Iniciar Análise"
✓ Aguardar conclusão (verificar progresso atualizando)
✓ Verificar se status muda para "Concluída"
```

```bash
# Cenário 2: Análise Grande (50+ repos)
✓ Mesmos passos acima com 50+ repos
✓ Verificar processamento em chunks
✓ Verificar se não trava em nenhum percentual
✓ Tempo esperado: ~5-10 minutos para 50 repos
```

### 2. Teste Relatórios

```bash
✓ Abrir análise concluída
✓ Clicar em "Baixar Relatório"
✓ Verificar download do arquivo ZIP
✓ Extrair ZIP e verificar 3 arquivos:
  - relatorio.pdf (com Project e Repository)
  - relatorio.csv (com colunas project e repository)
  - relatorio.json (com estrutura completa)
```

### 3. Teste Tarefas e Kanban

```bash
# Admin Cliente:
✓ Dashboard → Tarefas
✓ Criar nova tarefa
✓ Atribuir a desenvolvedor
✓ Clicar em botão "Azure DevOps" (sincronizar)
✓ Verificar se work item foi criado no Azure

# Desenvolvedor:
✓ Acessar /tasks
✓ Ver Kanban com 3 colunas
✓ Arrastar card entre colunas
✓ Verificar se status atualiza
```

### 4. Teste Documentação

```bash
✓ Menu lateral → API Docs
✓ Testar endpoint "Criar Análise"
✓ Enviar JSON de exemplo
✓ Ver response 200 OK

✓ Menu lateral → Wiki
✓ Verificar guia de análise
✓ Verificar explicação Cloud vs On-Premise
```

---

## 🔧 Funcionalidades Implementadas

### Sistema de Análise
- ✅ Azure DevOps Cloud (dev.azure.com)
- ✅ Azure DevOps On-Premise (devops.bs2.com)
- ✅ GitHub (github.com)
- ✅ Processamento em chunks (50 repos/vez)
- ✅ Concorrência controlada (10 análises simultâneas)
- ✅ Retry automático com exponential backoff
- ✅ Progress tracking em tempo real
- ✅ Logs extensivos para debug
- ✅ Error logging no banco de dados

### Captura de Dados
- ✅ Campo `project` (projeto Azure DevOps)
- ✅ Campo `repository` (repositório)
- ✅ Campos customizados de CNPJ
- ✅ Extensões de arquivos personalizadas
- ✅ Tipos de finding (código e banco de dados)

### Relatórios
- ✅ PDF com hierarquia visual (Projeto → Repo → Arquivo)
- ✅ CSV com todas as colunas
- ✅ JSON completo
- ✅ ZIP com os 3 formatos juntos
- ✅ Decompressão automática de findings

### Interface
- ✅ Dashboard com métricas
- ✅ Análises com status e progresso
- ✅ Detalhes de análise com findings agrupados
- ✅ Kanban para desenvolvedores
- ✅ Tarefas com Azure DevOps sync
- ✅ API Docs Swagger interativo
- ✅ Wiki com guias completos

### Integrações
- ✅ Azure DevOps (Cloud + On-Premise)
- ✅ GitHub
- ✅ Supabase (Database)
- ✅ WhatsApp API (preparado para implementar)

---

## 🐛 Troubleshooting

### Problema: Análise travou em X%
**Solução:**
1. Verificar logs no console do navegador (F12)
2. Verificar coluna `error_message` na tabela `analyses`
3. Verificar coluna `error_log` na tabela `batch_analyses`
4. Reprocessar análise se necessário

### Problema: Relatório sem findings
**Solução:**
1. Verificar se análise concluiu com sucesso
2. Verificar tabela `findings` se tem registros
3. Verificar tabela `findings_compressed` se está usando compressão
4. Logs na API de relatórios mostram contagem de findings

### Problema: Botão "Exibir Detalhes" não funciona
**Solução:**
1. Verificar se análise está com status "completed"
2. Aguardar se ainda está processando
3. Verificar se há findings salvos no banco

---

## 📊 Performance Esperada

- **5 repositórios:** ~30 segundos
- **10 repositórios:** ~1 minuto
- **50 repositórios:** ~5-10 minutos
- **100 repositórios:** ~15-20 minutos
- **500 repositórios:** ~1-2 horas
- **1500 repositórios:** ~4-6 horas

*Tempos variam conforme tamanho dos repositórios e quantidade de arquivos*

---

## 🎯 Próximas Features Planejadas

- [ ] Dashboard visual de métricas (gráficos)
- [ ] Filtros avançados na análise
- [ ] Análise incremental (cache)
- [ ] Agendamento automático de análises
- [ ] Comparação entre análises (antes vs depois)
- [ ] Notificações WhatsApp automáticas

---

## 📞 Suporte

Em caso de problemas críticos:
1. Verificar logs extensivos em todos os componentes
2. Consultar Wiki para troubleshooting
3. Verificar documentação Swagger para APIs

---

**Sistema validado e pronto para produção! 🚀**

Data da última revisão: 20/11/2025
