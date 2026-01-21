# Novas Funcionalidades - CNPJ Detector

## Visao Geral

Este documento descreve todas as novas funcionalidades implementadas no sistema CNPJ Detector, divididas por perfil de usuario.

---

# ADMIN CLIENTE

## 1. ChatBot IA Expandido (Assistente Inteligente)

**Localizacao:** Botao flutuante no canto inferior direito do Dashboard

**O que faz:**
- Assistente virtual inteligente que utiliza IA (Google Gemini) para ajudar o administrador
- Responde duvidas sobre o sistema e suas funcionalidades
- Gera codigo de correcao automaticamente baseado nos findings
- Cria relatorios automaticos sob demanda
- Sugere priorizacao de tarefas

**Como usar:**
1. Acesse o Dashboard (`/dashboard`)
2. Clique no botao com icone de chat no canto inferior direito
3. Digite sua pergunta ou use os comandos rapidos:
   - "Gerar codigo" - Gera codigo de correcao para um finding
   - "Criar relatorio" - Gera relatorio em formato texto
   - "Listar tarefas" - Mostra tarefas pendentes com prioridade
   - "Ajuda" - Explica como usar o sistema

**Arquivos:**
- `components/dashboard/ai-assistant.tsx`
- `app/api/ai/assistant/route.ts`

---

## 2. Dashboard com Metricas em Tempo Real

**Localizacao:** Menu lateral > "Metricas"

**O que faz:**
- Exibe graficos e estatisticas sobre o progresso das correcoes de CNPJ
- Mostra evolucao mensal das correcoes
- Taxa de correcao (antes vs depois)
- Ranking de repositorios por quantidade de findings
- Cards com totais: CNPJs encontrados, tarefas pendentes, tarefas concluidas

**Metricas disponiveis:**
- Total de CNPJs alfanumericos encontrados
- Tarefas pendentes vs concluidas
- Porcentagem de progresso geral
- Grafico de linha com evolucao mensal
- Top 5 repositorios com mais findings

**Arquivos:**
- `components/dashboard/metrics-dashboard.tsx`
- `app/api/admin-client/metrics/route.ts`

---

## 3. Sistema de Alertas e Notificacoes

**Localizacao:** Menu lateral > "Alertas"

**O que faz:**
- Gera alertas automaticos baseados em regras configuradas
- Notifica quando uma analise e concluida
- Alerta sobre tarefas criticas sem responsavel
- Avisa quando tarefas estao atrasadas (passou do prazo)
- Permite configurar quais alertas deseja receber

**Tipos de alertas:**
- **Critico (vermelho):** Findings criticos sem tarefa criada
- **Aviso (amarelo):** Tarefas atrasadas ou proximas do prazo
- **Sucesso (verde):** Analise concluida com sucesso
- **Info (azul):** Tarefas sem desenvolvedor atribuido

**Configuracoes:**
- Ativar/desativar alertas criticos
- Ativar/desativar alertas de prazo
- Ativar/desativar notificacoes de analise
- Definir limite de dias para considerar atrasado

**Arquivos:**
- `components/dashboard/alerts-panel.tsx`
- `app/api/admin-client/alerts/route.ts`
- `app/api/admin-client/alert-settings/route.ts`

---

## 4. Integracao com Jira e Azure Boards

**Localizacao:** Menu lateral > "Relatorios" > Botao "Exportar Work Items"

**O que faz:**
- Exporta tarefas do CNPJ Detector diretamente para o Jira ou Azure DevOps Boards
- Cria Work Items/Issues automaticamente com todas as informacoes
- Mapeia prioridade, descricao, horas estimadas
- Salva referencia do item externo na tarefa local

**Como usar:**
1. Acesse a aba "Relatorios"
2. Clique em "Exportar Work Items"
3. Selecione o destino (Azure Boards ou Jira)
4. Escolha as tarefas que deseja exportar
5. Configure o projeto/board de destino
6. Clique em "Exportar"

**Campos exportados:**
- Titulo da tarefa
- Descricao completa com codigo atual e sugerido
- Prioridade (Critical, High, Medium, Low)
- Horas estimadas
- Link para o arquivo no repositorio

**Arquivos:**
- `components/dashboard/export-work-items.tsx`
- `app/api/admin-client/export-work-items/route.ts`

---

## 5. Sistema de Auditoria (Historico de Acoes)

**Localizacao:** Menu lateral > "Auditoria"

**O que faz:**
- Registra todas as acoes realizadas no sistema
- Mostra quem fez, o que fez e quando
- Permite filtrar por tipo de acao, entidade e periodo
- Exporta historico em formato CSV

**Acoes registradas:**
- Criacao de tarefas
- Atualizacao de status
- Exclusao de registros
- Execucao de analises
- Exportacao de relatorios
- Alteracao de configuracoes
- Login/logout de usuarios

**Informacoes registradas:**
- Usuario que executou a acao
- Tipo de acao (criar, atualizar, excluir, etc.)
- Entidade afetada (tarefa, analise, repositorio, etc.)
- Dados anteriores e posteriores (quando aplicavel)
- Data e hora exata
- Endereco IP (quando disponivel)

**Filtros disponiveis:**
- Por tipo de acao
- Por entidade
- Por periodo (data inicial e final)
- Busca por texto

**Arquivos:**
- `components/dashboard/audit-panel.tsx`
- `app/api/admin-client/audit-logs/route.ts`
- `lib/audit.ts` (utilitario para registrar acoes)
- `scripts/create-audit-logs-table.sql`

---

## 6. Configuracao On-Premise para Azure DevOps

**Localizacao:** Integracoes > Gerenciar Contas > Azure DevOps

**O que faz:**
- Permite conectar com Azure DevOps Server (TFS) on-premise
- Diferencia entre Azure DevOps Cloud e On-Premise
- Configura URL customizada do servidor

**Como usar:**
1. Acesse "Integracoes" > "Gerenciar Contas"
2. Selecione "Azure DevOps"
3. Marque o checkbox "On-Premise" se aplicavel
4. Informe a URL do servidor (ex: https://tfs.empresa.com/tfs)
5. Informe a Colecao (Collection)
6. Cole o Personal Access Token

**Arquivos:**
- `components/integrations/integration-account-manager.tsx`
- `app/api/integrations/accounts/route.ts`

---

# DESENVOLVEDOR

## 1. Timer/Cronometro de Trabalho

**Localizacao:** Ao abrir uma tarefa no Board Kanban

**O que faz:**
- Permite iniciar/pausar um cronometro ao trabalhar em uma tarefa
- Registra automaticamente as horas trabalhadas
- Atualiza o campo "Horas Restantes" da tarefa
- Historico de todas as sessoes de trabalho

**Como usar:**
1. Abra uma tarefa clicando nela no Board Kanban
2. Clique no botao "Iniciar Timer"
3. Trabalhe na tarefa normalmente
4. Clique em "Parar" quando terminar ou pausar
5. O tempo e registrado automaticamente

**Arquivos:**
- `components/dev/work-timer.tsx`
- `app/api/dev/time-entries/route.ts`
- `app/api/dev/time-entries/[id]/route.ts`
- `scripts/create-time-tracking-table.sql`

---

## 2. Assistente IA para Codigo

**Localizacao:** Botao flutuante no canto inferior direito (Ctrl+K)

**O que faz:**
- Ajuda a entender o codigo que precisa ser alterado
- Gera codigo de correcao automaticamente
- Explica a mudanca necessaria passo a passo
- Responde duvidas tecnicas sobre a tarefa

**Comandos rapidos:**
- "Gerar correcao" - Cria codigo pronto para copiar
- "Explicar codigo" - Explica o que o codigo atual faz
- "Como testar" - Sugere formas de testar a alteracao
- "Duvidas" - Responde perguntas sobre a tarefa

**Como usar:**
1. Pressione Ctrl+K ou clique no botao de chat
2. Selecione uma tarefa (opcional)
3. Use os comandos rapidos ou digite sua pergunta
4. Copie o codigo gerado diretamente para sua IDE

**Arquivos:**
- `components/dev/dev-ai-assistant.tsx`
- `app/api/dev/ai-assistant/route.ts`

---

## 3. Checklist de Conclusao

**Localizacao:** Ao marcar uma tarefa como "Concluida"

**O que faz:**
- Exibe uma lista de verificacao antes de finalizar a tarefa
- Garante que todos os passos foram seguidos
- Evita esquecimentos e retrabalho

**Itens do checklist:**
- [ ] Codigo foi alterado conforme sugerido
- [ ] Alteracao foi testada localmente
- [ ] Commit foi realizado
- [ ] Pull Request foi aberto (se aplicavel)
- [ ] Testes automatizados passaram
- [ ] Codigo foi revisado

**Arquivos:**
- `components/dev/task-checklist.tsx`

---

## 4. Historico de Atividades

**Localizacao:** Aba "Historico" no dashboard do desenvolvedor

**O que faz:**
- Mostra todas as tarefas concluidas pelo desenvolvedor
- Exibe tempo total gasto em cada tarefa
- Lista commits e PRs relacionados
- Estatisticas de produtividade

**Informacoes exibidas:**
- Tarefas concluidas por periodo
- Tempo medio por tarefa
- Total de horas trabalhadas
- Grafico de produtividade

**Arquivos:**
- `components/dev/activity-history.tsx`
- `app/api/dev/activity-history/route.ts`

---

## 5. Notificacoes em Tempo Real

**Localizacao:** Icone de sino no header + Aba "Notificacoes"

**O que faz:**
- Alerta quando uma nova tarefa e atribuida
- Avisa sobre prazos proximos
- Notifica sobre comentarios do admin
- Mostra atualizacoes de tarefas relacionadas

**Tipos de notificacao:**
- Nova tarefa atribuida
- Prazo em 24 horas
- Comentario adicionado
- Tarefa devolvida para revisao
- Mencao em comentario

**Arquivos:**
- `components/dev/dev-notifications.tsx`
- `app/api/dev/notifications/route.ts`

---

## 6. Diff Viewer (Visualizador de Diferencas)

**Localizacao:** Detalhes da tarefa > Aba "Codigo"

**O que faz:**
- Mostra o codigo atual e o codigo sugerido lado a lado
- Destaca as diferencas com cores (vermelho = removido, verde = adicionado)
- Syntax highlighting para melhor leitura
- Botao para copiar codigo sugerido

**Recursos:**
- Visualizacao lado a lado (split view)
- Visualizacao unificada (unified view)
- Destaque de sintaxe por linguagem
- Numeros de linha
- Botao de copiar

**Arquivos:**
- `components/dev/diff-viewer.tsx`

---

## 7. Atalhos de Teclado

**Localizacao:** Disponivel em toda a interface do desenvolvedor

**O que faz:**
- Permite navegar e executar acoes usando apenas o teclado
- Aumenta a produtividade evitando uso do mouse
- Mostra ajuda de atalhos ao pressionar "?"

**Atalhos disponiveis:**
| Atalho | Acao |
|--------|------|
| `Ctrl + K` | Abrir Assistente IA |
| `Ctrl + F` | Ativar Modo Foco |
| `Ctrl + 1` | Ir para Board Kanban |
| `Ctrl + 2` | Ir para Historico |
| `Ctrl + 3` | Ir para Conquistas |
| `Ctrl + 4` | Ir para Notificacoes |
| `?` | Mostrar ajuda de atalhos |
| `Esc` | Fechar modal/dialog |

**Arquivos:**
- `hooks/use-keyboard-shortcuts.ts`
- `components/dev/keyboard-shortcuts-help.tsx`

---

## 8. Modo Foco (Pomodoro)

**Localizacao:** Botao "Foco" no header ou Ctrl+F

**O que faz:**
- Esconde todas as distraccoes, mostrando apenas a tarefa atual
- Implementa tecnica Pomodoro (25 min trabalho + 5 min pausa)
- Timer visual com progresso
- Notificacao sonora ao fim de cada sessao
- Registra sessoes de foco para estatisticas

**Configuracoes:**
- Tempo de trabalho (padrao: 25 minutos)
- Tempo de pausa curta (padrao: 5 minutos)
- Tempo de pausa longa (padrao: 15 minutos)
- Sessoes ate pausa longa (padrao: 4)

**Como usar:**
1. Selecione uma tarefa
2. Pressione Ctrl+F ou clique em "Modo Foco"
3. O timer inicia automaticamente
4. Trabalhe focado ate o timer terminar
5. Faca uma pausa quando notificado
6. Repita o ciclo

**Arquivos:**
- `components/dev/focus-mode.tsx`
- `scripts/create-time-tracking-table.sql` (tabela focus_sessions)

---

## 9. Gamificacao (Pontos e Badges)

**Localizacao:** Aba "Conquistas" no dashboard do desenvolvedor

**O que faz:**
- Sistema de pontos por tarefas concluidas
- Badges/conquistas por marcos atingidos
- Ranking entre desenvolvedores
- Niveis de experiencia

**Sistema de pontos:**
- Tarefa concluida: +10 pontos
- Tarefa critica concluida: +25 pontos
- Tarefa antes do prazo: +5 pontos bonus
- Streak de 5 dias: +50 pontos bonus

**Badges disponiveis:**
- **Primeiro Passo:** Concluir primeira tarefa
- **Veloz:** Concluir 5 tarefas em um dia
- **Consistente:** Trabalhar 5 dias seguidos
- **Mestre CNPJ:** Concluir 100 tarefas
- **Focado:** Completar 10 sessoes Pomodoro
- **Madrugador:** Trabalhar antes das 8h
- **Noturno:** Trabalhar apos as 22h

**Arquivos:**
- `components/dev/gamification-panel.tsx`
- `app/api/dev/gamification/route.ts`

---

## 10. Integracao Git (Branches e PRs)

**Localizacao:** Detalhes da tarefa > Aba "Git"

**O que faz:**
- Mostra informacoes do repositorio relacionado a tarefa
- Lista branches associadas
- Exibe status de Pull Requests
- Link direto para o arquivo no GitHub/Azure DevOps

**Informacoes exibidas:**
- Nome do repositorio
- Branch principal
- Branches relacionadas a tarefa
- Pull Requests abertos
- Status do CI/CD (se disponivel)
- Link para o arquivo no repositorio

**Acoes disponiveis:**
- Abrir arquivo no navegador
- Copiar nome da branch sugerida
- Ver historico de commits do arquivo
- Abrir Pull Request

**Arquivos:**
- `components/dev/git-integration.tsx`
- `app/api/dev/git-info/route.ts`

---

# TABELAS CRIADAS

## time_entries
Armazena registros de tempo trabalhado em tarefas.

```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- task_id: UUID (FK -> tasks)
- started_at: TIMESTAMP
- ended_at: TIMESTAMP
- duration_minutes: INTEGER
- description: TEXT
- created_at: TIMESTAMP
```

## focus_sessions
Armazena sessoes de trabalho focado (Pomodoro).

```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- task_id: UUID (FK -> tasks)
- started_at: TIMESTAMP
- ended_at: TIMESTAMP
- duration_minutes: INTEGER
- session_type: TEXT (work/short_break/long_break)
- completed: BOOLEAN
- created_at: TIMESTAMP
```

## audit_logs
Armazena historico de todas as acoes do sistema.

```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- client_id: UUID (FK -> clients)
- action: TEXT
- entity_type: TEXT
- entity_id: UUID
- old_data: JSONB
- new_data: JSONB
- ip_address: TEXT
- user_agent: TEXT
- created_at: TIMESTAMP
```

---

# COMO ACESSAR

## Admin Cliente

1. Faca login como Admin Cliente
2. Acesse o Dashboard (`/dashboard`)
3. Use o menu lateral para navegar:
   - **Metricas:** Graficos e estatisticas
   - **Alertas:** Notificacoes automaticas
   - **Auditoria:** Historico de acoes
4. O Assistente IA esta disponivel no botao flutuante (canto inferior direito)

## Desenvolvedor

1. Faca login como Desenvolvedor
2. Acesse `/dev` para o novo dashboard completo
3. Use as abas superiores:
   - **Board:** Kanban com suas tarefas
   - **Historico:** Atividades concluidas
   - **Conquistas:** Pontos e badges
   - **Notificacoes:** Alertas e avisos
4. Use os atalhos de teclado para maior produtividade
5. O Assistente IA esta disponivel via Ctrl+K

---

# PROXIMOS PASSOS SUGERIDOS

1. **Treinamento:** Apresentar as novas funcionalidades para a equipe
2. **Feedback:** Coletar sugestoes de melhorias dos usuarios
3. **Metricas:** Acompanhar adocao das novas funcionalidades
4. **Ajustes:** Refinar configuracoes baseado no uso real

---

*Documento gerado em Janeiro/2026*
*Versao 2.0 do CNPJ Detector*
