# SQL Server - CNPJ Alfanumérico

Scripts para criação e carga inicial do banco de dados no **SQL Server 2016+**.

## Ordem de execução

Execute os scripts **nesta ordem** no SQL Server Management Studio (SSMS) ou Azure Data Studio:

| # | Arquivo                | Descrição                                         |
|---|------------------------|---------------------------------------------------|
| 1 | `01-create-tables.sql` | Cria o banco `CNPJAlfanumerico` e todas as tabelas|
| 2 | `02-create-triggers.sql` | Cria os triggers de `updated_at` automático     |
| 3 | `03-seed-data.sql`     | Insere dados iniciais: planos, usuários, demos    |

## Credenciais criadas

| Perfil     | E-mail                              | Senha      |
|------------|-------------------------------------|------------|
| Super Admin| admin@webnetsystems.com.br          | Admin@2026 |
| Demo Admin | joao.silva@techcorp.com.br          | Demo@2026  |
| Demo Admin | ana.paula@inovacaodigital.com.br    | Demo@2026  |
| Demo Dev   | roberto.lima@codemasters.dev        | Demo@2026  |
| Demo Admin | rafael.torres@startuplab.com        | Demo@2026  |
| Demo Admin | patricia.mendes@enterprisesys.com.br| Demo@2026  |

> **IMPORTANTE:** Troque a senha do Super Admin no primeiro login.

## Tabelas criadas

| Tabela                  | Descrição                                 |
|-------------------------|-------------------------------------------|
| `clients`               | Empresas/clientes (multi-tenant)          |
| `users`                 | Usuários do sistema                       |
| `analyses`              | Análises de repositórios                  |
| `findings`              | Ocorrências de CNPJ em código-fonte       |
| `database_findings`     | Ocorrências em schemas de banco           |
| `api_keys`              | Chaves de acesso à API                    |
| `reports`               | Relatórios gerados (PDF, JSON, Excel)     |
| `usage_logs`            | Logs de uso da API                        |
| `webhooks`              | Webhooks configurados por cliente         |
| `webhook_logs`          | Histórico de execução de webhooks         |
| `plans`                 | Planos de assinatura                      |
| `subscriptions`         | Assinaturas dos clientes                  |
| `payments`              | Histórico de pagamentos                   |
| `repositories`          | Repositórios de código vinculados         |
| `notifications`         | Notificações em tempo real                |
| `achievements`          | Conquistas (gamificação)                  |
| `user_achievements`     | Conquistas obtidas por usuários           |
| `user_stats`            | Estatísticas e pontuação de usuários      |
| `comments`              | Comentários em tarefas e análises         |
| `activity_logs`         | Logs de auditoria                         |
| `permissions`           | Permissões granulares do sistema          |
| `role_permissions`      | Permissões por papel (role)               |
| `login_attempts`        | Registro de tentativas de login           |
| `ai_suggestions`        | Sugestões geradas por IA                  |
| `ai_chat_history`       | Histórico de chat com IA                  |
| `shared_links`          | Links compartilháveis de análises         |
| `sprints`               | Sprints do Scrum                          |
| `tasks`                 | Tarefas / Board Kanban                    |
| `sprint_retrospectives` | Retrospectivas de sprint                  |
| `daily_standups`        | Daily standups da equipe                  |
| `integration_configs`   | Configurações de integrações externas     |
| `analytics_events`      | Eventos de analytics                      |
| `settings`              | Configurações globais e por cliente       |
