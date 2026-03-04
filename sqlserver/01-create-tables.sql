-- ============================================================================
-- CNPJ ALFANUMERICO - SQL SERVER
-- Script 01: Criação de todas as tabelas
-- Compatível com: SQL Server 2016+
-- ============================================================================

USE master;
GO

-- Criar banco se não existir
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'CNPJAlfanumerico')
BEGIN
    CREATE DATABASE CNPJAlfanumerico
    COLLATE Latin1_General_CI_AI;
END
GO

USE CNPJAlfanumerico;
GO

-- ============================================================================
-- 1. TABELA: clients (Empresas/Clientes do sistema - Multi-tenant)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'clients')
BEGIN
    CREATE TABLE clients (
        id            UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        name          NVARCHAR(255)     NOT NULL,
        cnpj          NVARCHAR(20)      NULL,
        email         NVARCHAR(255)     NOT NULL,
        phone         NVARCHAR(20)      NULL,
        plan          NVARCHAR(50)      NOT NULL DEFAULT 'free',   -- free | basic | pro | enterprise
        status        NVARCHAR(20)      NOT NULL DEFAULT 'active', -- active | suspended | cancelled
        max_analyses  INT               NOT NULL DEFAULT 10,
        max_api_calls INT               NOT NULL DEFAULT 1000,
        created_at    DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at    DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_clients PRIMARY KEY (id),
        CONSTRAINT UQ_clients_email UNIQUE (email),
        CONSTRAINT UQ_clients_cnpj  UNIQUE (cnpj),
        CONSTRAINT CK_clients_plan   CHECK (plan   IN ('free','basic','pro','enterprise')),
        CONSTRAINT CK_clients_status CHECK (status IN ('active','suspended','cancelled','trial'))
    );
END
GO

-- ============================================================================
-- 2. TABELA: users (Usuários do sistema)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id            UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id     UNIQUEIDENTIFIER  NULL,
        email         NVARCHAR(255)     NOT NULL,
        password_hash NVARCHAR(255)     NOT NULL,
        name          NVARCHAR(255)     NOT NULL,
        role          NVARCHAR(50)      NOT NULL DEFAULT 'user',   -- super_admin | admin | user | dev | scrum_master | product_owner
        status        NVARCHAR(20)      NOT NULL DEFAULT 'active', -- active | inactive | suspended
        last_login    DATETIMEOFFSET    NULL,
        created_at    DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at    DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_users PRIMARY KEY (id),
        CONSTRAINT UQ_users_email UNIQUE (email),
        CONSTRAINT FK_users_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        CONSTRAINT CK_users_role   CHECK (role   IN ('super_admin','admin','user','dev','scrum_master','product_owner')),
        CONSTRAINT CK_users_status CHECK (status IN ('active','inactive','suspended'))
    );
END
GO

-- ============================================================================
-- 3. TABELA: analyses (Análises de repositórios)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'analyses')
BEGIN
    CREATE TABLE analyses (
        id               UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id        UNIQUEIDENTIFIER  NULL,
        user_id          UNIQUEIDENTIFIER  NULL,
        repository_name  NVARCHAR(255)     NOT NULL,
        repository_url   NVARCHAR(500)     NULL,
        repository_type  NVARCHAR(50)      NOT NULL DEFAULT 'github', -- zip | github | gitlab | azure
        language         NVARCHAR(100)     NULL,
        status           NVARCHAR(50)      NOT NULL DEFAULT 'pending', -- pending | processing | completed | failed
        total_files      INT               NOT NULL DEFAULT 0,
        files_analyzed   INT               NOT NULL DEFAULT 0,
        cnpj_occurrences INT               NOT NULL DEFAULT 0,
        database_fields  INT               NOT NULL DEFAULT 0,
        estimated_hours  DECIMAL(10,2)     NOT NULL DEFAULT 0,
        error_message    NVARCHAR(MAX)     NULL,
        started_at       DATETIMEOFFSET    NULL,
        completed_at     DATETIMEOFFSET    NULL,
        created_at       DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at       DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_analyses PRIMARY KEY (id),
        CONSTRAINT FK_analyses_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        CONSTRAINT FK_analyses_users   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE NO ACTION,
        CONSTRAINT CK_analyses_status  CHECK (status IN ('pending','processing','completed','failed'))
    );
END
GO

-- ============================================================================
-- 4. TABELA: findings (Ocorrências de CNPJ em código-fonte)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'findings')
BEGIN
    CREATE TABLE findings (
        id             UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        analysis_id    UNIQUEIDENTIFIER  NOT NULL,
        client_id      UNIQUEIDENTIFIER  NULL,
        file_path      NVARCHAR(500)     NOT NULL,
        file_type      NVARCHAR(50)      NULL,
        line_number    INT               NULL,
        field_name     NVARCHAR(255)     NULL,
        field_type     NVARCHAR(100)     NULL,  -- cnpj_only | cpf_cnpj | document
        context        NVARCHAR(MAX)     NULL,
        suggestion     NVARCHAR(MAX)     NULL,
        confidence     NVARCHAR(20)      NULL,  -- high | medium | low
        is_input       BIT               NOT NULL DEFAULT 0,
        is_output      BIT               NOT NULL DEFAULT 0,
        is_database    BIT               NOT NULL DEFAULT 0,
        is_validation  BIT               NOT NULL DEFAULT 0,
        supports_cpf   BIT               NOT NULL DEFAULT 0,
        created_at     DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_findings PRIMARY KEY (id),
        CONSTRAINT FK_findings_analyses FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE,
        CONSTRAINT FK_findings_clients  FOREIGN KEY (client_id)   REFERENCES clients(id)  ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 5. TABELA: database_findings (Ocorrências em esquemas de banco de dados)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'database_findings')
BEGIN
    CREATE TABLE database_findings (
        id            UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        analysis_id   UNIQUEIDENTIFIER  NOT NULL,
        client_id     UNIQUEIDENTIFIER  NULL,
        database_type NVARCHAR(100)     NULL,  -- mysql | postgresql | sqlserver | oracle
        table_name    NVARCHAR(255)     NOT NULL,
        column_name   NVARCHAR(255)     NOT NULL,
        column_type   NVARCHAR(100)     NULL,
        max_length    INT               NULL,
        is_nullable   BIT               NULL,
        suggestion    NVARCHAR(MAX)     NULL,
        created_at    DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_database_findings PRIMARY KEY (id),
        CONSTRAINT FK_database_findings_analyses FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE,
        CONSTRAINT FK_database_findings_clients  FOREIGN KEY (client_id)   REFERENCES clients(id)  ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 6. TABELA: api_keys (Chaves de acesso à API por cliente)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'api_keys')
BEGIN
    CREATE TABLE api_keys (
        id           UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id    UNIQUEIDENTIFIER  NOT NULL,
        key_hash     NVARCHAR(255)     NOT NULL,
        key_prefix   NVARCHAR(20)      NOT NULL,
        name         NVARCHAR(255)     NOT NULL,
        status       NVARCHAR(20)      NOT NULL DEFAULT 'active', -- active | revoked | expired
        rate_limit   INT               NOT NULL DEFAULT 100,
        last_used_at DATETIMEOFFSET    NULL,
        expires_at   DATETIMEOFFSET    NULL,
        created_at   DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_api_keys     PRIMARY KEY (id),
        CONSTRAINT UQ_api_keys_hash UNIQUE (key_hash),
        CONSTRAINT FK_api_keys_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        CONSTRAINT CK_api_keys_status  CHECK (status IN ('active','revoked','expired'))
    );
END
GO

-- ============================================================================
-- 7. TABELA: reports (Relatórios gerados)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'reports')
BEGIN
    CREATE TABLE reports (
        id           UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        analysis_id  UNIQUEIDENTIFIER  NOT NULL,
        client_id    UNIQUEIDENTIFIER  NOT NULL,
        format       NVARCHAR(20)      NOT NULL, -- json | pdf | excel
        file_url     NVARCHAR(MAX)     NULL,
        file_size    INT               NULL,
        generated_at DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_reports PRIMARY KEY (id),
        CONSTRAINT FK_reports_analyses FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE,
        CONSTRAINT FK_reports_clients  FOREIGN KEY (client_id)   REFERENCES clients(id)  ON DELETE NO ACTION,
        CONSTRAINT CK_reports_format   CHECK (format IN ('json','pdf','excel'))
    );
END
GO

-- ============================================================================
-- 8. TABELA: usage_logs (Logs de uso da API)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usage_logs')
BEGIN
    CREATE TABLE usage_logs (
        id            UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id     UNIQUEIDENTIFIER  NULL,
        api_key_id    UNIQUEIDENTIFIER  NULL,
        endpoint      NVARCHAR(255)     NOT NULL,
        method        NVARCHAR(10)      NOT NULL,
        status_code   INT               NULL,
        response_time INT               NULL, -- milissegundos
        ip_address    NVARCHAR(45)      NULL,
        user_agent    NVARCHAR(MAX)     NULL,
        created_at    DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_usage_logs PRIMARY KEY (id),
        CONSTRAINT FK_usage_logs_clients  FOREIGN KEY (client_id)  REFERENCES clients(id)  ON DELETE SET NULL,
        CONSTRAINT FK_usage_logs_api_keys FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 9. TABELA: webhooks (Webhooks configurados por cliente)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'webhooks')
BEGIN
    CREATE TABLE webhooks (
        id               UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id        UNIQUEIDENTIFIER  NOT NULL,
        url              NVARCHAR(MAX)     NOT NULL,
        events           NVARCHAR(MAX)     NOT NULL, -- JSON array: ["analysis.completed","analysis.failed"]
        secret           NVARCHAR(255)     NOT NULL,
        status           NVARCHAR(20)      NOT NULL DEFAULT 'active',
        last_triggered_at DATETIMEOFFSET   NULL,
        created_at       DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_webhooks PRIMARY KEY (id),
        CONSTRAINT FK_webhooks_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        CONSTRAINT CK_webhooks_status  CHECK (status IN ('active','inactive'))
    );
END
GO

-- ============================================================================
-- 10. TABELA: plans (Planos de assinatura)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'plans')
BEGIN
    CREATE TABLE plans (
        id              UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        name            NVARCHAR(100)     NOT NULL,
        display_name    NVARCHAR(255)     NOT NULL,
        description     NVARCHAR(MAX)     NULL,
        price_monthly   DECIMAL(10,2)     NULL,
        price_quarterly DECIMAL(10,2)     NULL,
        price_annual    DECIMAL(10,2)     NULL,
        features        NVARCHAR(MAX)     NULL, -- JSON
        limits          NVARCHAR(MAX)     NULL, -- JSON
        is_active       BIT               NOT NULL DEFAULT 1,
        is_popular      BIT               NOT NULL DEFAULT 0,
        sort_order      INT               NOT NULL DEFAULT 0,
        created_at      DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at      DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_plans  PRIMARY KEY (id),
        CONSTRAINT UQ_plans_name UNIQUE (name)
    );
END
GO

-- ============================================================================
-- 11. TABELA: subscriptions (Assinaturas dos clientes)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'subscriptions')
BEGIN
    CREATE TABLE subscriptions (
        id                    UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id             UNIQUEIDENTIFIER  NOT NULL,
        plan_id               UNIQUEIDENTIFIER  NOT NULL,
        status                NVARCHAR(50)      NOT NULL DEFAULT 'active', -- active | cancelled | expired | suspended | trialing
        billing_cycle         NVARCHAR(20)      NULL,                      -- monthly | quarterly | annual
        current_period_start  DATE              NOT NULL,
        current_period_end    DATE              NOT NULL,
        cancel_at_period_end  BIT               NOT NULL DEFAULT 0,
        cancelled_at          DATETIMEOFFSET    NULL,
        trial_start           DATE              NULL,
        trial_end             DATE              NULL,
        created_at            DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at            DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_subscriptions PRIMARY KEY (id),
        CONSTRAINT FK_subscriptions_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        CONSTRAINT FK_subscriptions_plans   FOREIGN KEY (plan_id)   REFERENCES plans(id)
    );
END
GO

-- ============================================================================
-- 12. TABELA: payments (Histórico de pagamentos)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
BEGIN
    CREATE TABLE payments (
        id               UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id        UNIQUEIDENTIFIER  NOT NULL,
        subscription_id  UNIQUEIDENTIFIER  NULL,
        amount           DECIMAL(10,2)     NOT NULL,
        currency         NCHAR(3)          NOT NULL DEFAULT 'BRL',
        status           NVARCHAR(50)      NOT NULL DEFAULT 'pending', -- pending | completed | failed | refunded
        payment_method   NVARCHAR(50)      NULL,  -- credit_card | boleto | pix
        transaction_id   NVARCHAR(255)     NULL,
        gateway          NVARCHAR(50)      NULL,  -- stripe | mercadopago
        gateway_response NVARCHAR(MAX)     NULL,  -- JSON
        paid_at          DATETIMEOFFSET    NULL,
        refunded_at      DATETIMEOFFSET    NULL,
        created_at       DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_payments PRIMARY KEY (id),
        CONSTRAINT FK_payments_clients       FOREIGN KEY (client_id)       REFERENCES clients(id)       ON DELETE CASCADE,
        CONSTRAINT FK_payments_subscriptions FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 13. TABELA: repositories (Repositórios de código)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'repositories')
BEGIN
    CREATE TABLE repositories (
        id               UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id        UNIQUEIDENTIFIER  NOT NULL,
        user_id          UNIQUEIDENTIFIER  NULL,
        name             NVARCHAR(255)     NOT NULL,
        full_name        NVARCHAR(500)     NULL,
        url              NVARCHAR(MAX)     NULL,
        description      NVARCHAR(MAX)     NULL,
        language         NVARCHAR(100)     NULL,
        default_branch   NVARCHAR(100)     NOT NULL DEFAULT 'main',
        is_private       BIT               NOT NULL DEFAULT 1,
        github_id        BIGINT            NULL,
        stars_count      INT               NOT NULL DEFAULT 0,
        forks_count      INT               NOT NULL DEFAULT 0,
        size_kb          INT               NOT NULL DEFAULT 0,
        last_analyzed_at DATETIMEOFFSET    NULL,
        created_at       DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at       DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_repositories PRIMARY KEY (id),
        CONSTRAINT FK_repositories_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        CONSTRAINT FK_repositories_users   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 14. TABELA: notifications (Notificações dos usuários)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notifications')
BEGIN
    CREATE TABLE notifications (
        id         UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        user_id    UNIQUEIDENTIFIER  NOT NULL,
        client_id  UNIQUEIDENTIFIER  NOT NULL,
        type       NVARCHAR(50)      NOT NULL,  -- task_assigned | license_expiring | analysis_complete
        title      NVARCHAR(255)     NOT NULL,
        message    NVARCHAR(MAX)     NOT NULL,
        link       NVARCHAR(MAX)     NULL,
        is_read    BIT               NOT NULL DEFAULT 0,
        read_at    DATETIMEOFFSET    NULL,
        priority   NVARCHAR(20)      NOT NULL DEFAULT 'normal', -- low | normal | high | urgent
        category   NVARCHAR(50)      NULL,
        metadata   NVARCHAR(MAX)     NULL,  -- JSON
        created_at DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        expires_at DATETIMEOFFSET    NULL,
        CONSTRAINT PK_notifications PRIMARY KEY (id),
        CONSTRAINT FK_notifications_users   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
        CONSTRAINT FK_notifications_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 15. TABELA: achievements (Conquistas do sistema de gamificação)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'achievements')
BEGIN
    CREATE TABLE achievements (
        id                 UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        name               NVARCHAR(100)     NOT NULL,
        display_name       NVARCHAR(255)     NOT NULL,
        description        NVARCHAR(MAX)     NOT NULL,
        icon               NVARCHAR(50)      NULL,
        category           NVARCHAR(50)      NULL,  -- analysis | tasks | collaboration | streak
        points             INT               NOT NULL DEFAULT 0,
        rarity             NVARCHAR(20)      NOT NULL DEFAULT 'common', -- common | rare | epic | legendary
        requirement_type   NVARCHAR(50)      NULL,
        requirement_value  INT               NULL,
        is_active          BIT               NOT NULL DEFAULT 1,
        created_at         DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_achievements      PRIMARY KEY (id),
        CONSTRAINT UQ_achievements_name UNIQUE (name)
    );
END
GO

-- ============================================================================
-- 16. TABELA: user_achievements (Conquistas obtidas pelos usuários)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_achievements')
BEGIN
    CREATE TABLE user_achievements (
        id             UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        user_id        UNIQUEIDENTIFIER  NOT NULL,
        achievement_id UNIQUEIDENTIFIER  NOT NULL,
        progress       INT               NOT NULL DEFAULT 0,
        metadata       NVARCHAR(MAX)     NULL, -- JSON
        earned_at      DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_user_achievements           PRIMARY KEY (id),
        CONSTRAINT UQ_user_achievements_pair      UNIQUE (user_id, achievement_id),
        CONSTRAINT FK_user_achievements_users     FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
        CONSTRAINT FK_user_achievements_achievem  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- 17. TABELA: user_stats (Estatísticas dos usuários)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_stats')
BEGIN
    CREATE TABLE user_stats (
        id                   UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        user_id              UNIQUEIDENTIFIER  NOT NULL,
        total_points         INT               NOT NULL DEFAULT 0,
        current_streak       INT               NOT NULL DEFAULT 0,
        longest_streak       INT               NOT NULL DEFAULT 0,
        last_activity_date   DATE              NULL,
        tasks_completed      INT               NOT NULL DEFAULT 0,
        analyses_completed   INT               NOT NULL DEFAULT 0,
        comments_made        INT               NOT NULL DEFAULT 0,
        achievements_earned  INT               NOT NULL DEFAULT 0,
        rank                 NVARCHAR(50)      NOT NULL DEFAULT 'Beginner',
        created_at           DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at           DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_user_stats        PRIMARY KEY (id),
        CONSTRAINT UQ_user_stats_user   UNIQUE (user_id),
        CONSTRAINT FK_user_stats_users  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- 18. TABELA: comments (Comentários em tarefas e análises)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'comments')
BEGIN
    CREATE TABLE comments (
        id                UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        user_id           UNIQUEIDENTIFIER  NOT NULL,
        client_id         UNIQUEIDENTIFIER  NOT NULL,
        entity_type       NVARCHAR(50)      NOT NULL, -- task | analysis | finding
        entity_id         UNIQUEIDENTIFIER  NOT NULL,
        parent_comment_id UNIQUEIDENTIFIER  NULL,
        content           NVARCHAR(MAX)     NOT NULL,
        mentions          NVARCHAR(MAX)     NULL, -- JSON array de UUIDs
        attachments       NVARCHAR(MAX)     NULL, -- JSON
        is_edited         BIT               NOT NULL DEFAULT 0,
        edited_at         DATETIMEOFFSET    NULL,
        is_deleted        BIT               NOT NULL DEFAULT 0,
        deleted_at        DATETIMEOFFSET    NULL,
        created_at        DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at        DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_comments PRIMARY KEY (id),
        CONSTRAINT FK_comments_users          FOREIGN KEY (user_id)           REFERENCES users(id)    ON DELETE CASCADE,
        CONSTRAINT FK_comments_clients        FOREIGN KEY (client_id)         REFERENCES clients(id)  ON DELETE NO ACTION,
        CONSTRAINT FK_comments_parent         FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 19. TABELA: activity_logs (Logs de auditoria)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'activity_logs')
BEGIN
    CREATE TABLE activity_logs (
        id          UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        user_id     UNIQUEIDENTIFIER  NULL,
        client_id   UNIQUEIDENTIFIER  NOT NULL,
        action      NVARCHAR(100)     NOT NULL, -- created | updated | deleted | assigned
        entity_type NVARCHAR(50)      NOT NULL, -- task | analysis | user | client
        entity_id   UNIQUEIDENTIFIER  NULL,
        entity_name NVARCHAR(255)     NULL,
        old_value   NVARCHAR(MAX)     NULL, -- JSON
        new_value   NVARCHAR(MAX)     NULL, -- JSON
        ip_address  NVARCHAR(45)      NULL,
        user_agent  NVARCHAR(MAX)     NULL,
        metadata    NVARCHAR(MAX)     NULL, -- JSON
        created_at  DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_activity_logs PRIMARY KEY (id),
        CONSTRAINT FK_activity_logs_users   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE SET NULL,
        CONSTRAINT FK_activity_logs_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- 20. TABELA: permissions (Permissões do sistema)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'permissions')
BEGIN
    CREATE TABLE permissions (
        id           UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        name         NVARCHAR(100)     NOT NULL,
        display_name NVARCHAR(255)     NOT NULL,
        description  NVARCHAR(MAX)     NULL,
        category     NVARCHAR(50)      NULL,
        created_at   DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_permissions      PRIMARY KEY (id),
        CONSTRAINT UQ_permissions_name UNIQUE (name)
    );
END
GO

-- ============================================================================
-- 21. TABELA: role_permissions (Permissões por papel)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'role_permissions')
BEGIN
    CREATE TABLE role_permissions (
        id            UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        role          NVARCHAR(50)      NOT NULL,
        permission_id UNIQUEIDENTIFIER  NOT NULL,
        created_at    DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_role_permissions      PRIMARY KEY (id),
        CONSTRAINT UQ_role_permissions_pair UNIQUE (role, permission_id),
        CONSTRAINT FK_role_permissions_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- 22. TABELA: login_attempts (Tentativas de login)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'login_attempts')
BEGIN
    CREATE TABLE login_attempts (
        id             UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        email          NVARCHAR(255)     NOT NULL,
        ip_address     NVARCHAR(45)      NOT NULL,
        user_agent     NVARCHAR(MAX)     NULL,
        success        BIT               NOT NULL,
        failure_reason NVARCHAR(255)     NULL,
        created_at     DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_login_attempts PRIMARY KEY (id)
    );
END
GO

-- ============================================================================
-- 23. TABELA: ai_suggestions (Sugestões geradas por IA)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_suggestions')
BEGIN
    CREATE TABLE ai_suggestions (
        id                   UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        finding_id           UNIQUEIDENTIFIER  NULL,
        database_finding_id  UNIQUEIDENTIFIER  NULL,
        client_id            UNIQUEIDENTIFIER  NOT NULL,
        suggestion_type      NVARCHAR(50)      NULL,  -- code_fix | migration_script | validation
        original_code        NVARCHAR(MAX)     NULL,
        suggested_code       NVARCHAR(MAX)     NULL,
        explanation          NVARCHAR(MAX)     NULL,
        confidence_score     DECIMAL(3,2)      NULL,  -- 0.00 a 1.00
        model_used           NVARCHAR(100)     NULL,
        tokens_used          INT               NULL,
        status               NVARCHAR(50)      NOT NULL DEFAULT 'pending', -- pending | accepted | rejected | modified
        applied_by           UNIQUEIDENTIFIER  NULL,
        applied_at           DATETIMEOFFSET    NULL,
        feedback             NVARCHAR(MAX)     NULL,
        created_at           DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_ai_suggestions PRIMARY KEY (id),
        CONSTRAINT FK_ai_suggestions_findings     FOREIGN KEY (finding_id)          REFERENCES findings(id)          ON DELETE NO ACTION,
        CONSTRAINT FK_ai_suggestions_db_findings  FOREIGN KEY (database_finding_id) REFERENCES database_findings(id) ON DELETE NO ACTION,
        CONSTRAINT FK_ai_suggestions_clients      FOREIGN KEY (client_id)           REFERENCES clients(id)           ON DELETE CASCADE,
        CONSTRAINT FK_ai_suggestions_applied_by   FOREIGN KEY (applied_by)          REFERENCES users(id)             ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 24. TABELA: ai_chat_history (Histórico de chat com IA)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ai_chat_history')
BEGIN
    CREATE TABLE ai_chat_history (
        id         UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        user_id    UNIQUEIDENTIFIER  NULL,
        client_id  UNIQUEIDENTIFIER  NULL,
        session_id UNIQUEIDENTIFIER  NOT NULL,
        role       NVARCHAR(20)      NOT NULL, -- user | assistant | system
        content    NVARCHAR(MAX)     NOT NULL,
        metadata   NVARCHAR(MAX)     NULL, -- JSON
        created_at DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_ai_chat_history PRIMARY KEY (id),
        CONSTRAINT FK_ai_chat_history_users   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE SET NULL,
        CONSTRAINT FK_ai_chat_history_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    );
END
GO

-- ============================================================================
-- 25. TABELA: shared_links (Links compartilháveis)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'shared_links')
BEGIN
    CREATE TABLE shared_links (
        id              UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id       UNIQUEIDENTIFIER  NOT NULL,
        entity_type     NVARCHAR(50)      NOT NULL, -- analysis | report | finding
        entity_id       UNIQUEIDENTIFIER  NOT NULL,
        token           NVARCHAR(255)     NOT NULL,
        password_hash   NVARCHAR(255)     NULL,
        expires_at      DATETIMEOFFSET    NULL,
        max_views       INT               NULL,
        view_count      INT               NOT NULL DEFAULT 0,
        is_active       BIT               NOT NULL DEFAULT 1,
        created_by      UNIQUEIDENTIFIER  NULL,
        last_accessed_at DATETIMEOFFSET   NULL,
        created_at      DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_shared_links       PRIMARY KEY (id),
        CONSTRAINT UQ_shared_links_token UNIQUE (token),
        CONSTRAINT FK_shared_links_clients    FOREIGN KEY (client_id)  REFERENCES clients(id) ON DELETE CASCADE,
        CONSTRAINT FK_shared_links_created_by FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 26. TABELA: sprints (Sprints do Scrum)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sprints')
BEGIN
    CREATE TABLE sprints (
        id                 UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id          UNIQUEIDENTIFIER  NOT NULL,
        name               NVARCHAR(255)     NOT NULL,
        goal               NVARCHAR(MAX)     NULL,
        start_date         DATE              NOT NULL,
        end_date           DATE              NOT NULL,
        status             NVARCHAR(50)      NOT NULL DEFAULT 'planning', -- planning | active | review | retrospective | completed | cancelled
        velocity           INT               NOT NULL DEFAULT 0,
        completed_velocity INT               NOT NULL DEFAULT 0,
        created_by         UNIQUEIDENTIFIER  NULL,
        created_at         DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at         DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_sprints             PRIMARY KEY (id),
        CONSTRAINT CK_sprints_dates       CHECK (end_date > start_date),
        CONSTRAINT FK_sprints_clients     FOREIGN KEY (client_id)  REFERENCES clients(id) ON DELETE CASCADE,
        CONSTRAINT FK_sprints_created_by  FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 27. TABELA: tasks (Tarefas/Kanban)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tasks')
BEGIN
    CREATE TABLE tasks (
        id                  UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id           UNIQUEIDENTIFIER  NOT NULL,
        sprint_id           UNIQUEIDENTIFIER  NULL,
        analysis_id         UNIQUEIDENTIFIER  NULL,
        finding_id          UNIQUEIDENTIFIER  NULL,
        assigned_to         UNIQUEIDENTIFIER  NULL,
        created_by          UNIQUEIDENTIFIER  NULL,
        title               NVARCHAR(500)     NOT NULL,
        description         NVARCHAR(MAX)     NULL,
        file_path           NVARCHAR(500)     NULL,
        line_number         INT               NULL,
        status              NVARCHAR(50)      NOT NULL DEFAULT 'todo', -- todo | in_progress | review | done
        priority            NVARCHAR(20)      NOT NULL DEFAULT 'medium', -- low | medium | high | critical
        severity            NVARCHAR(20)      NULL,  -- low | medium | high | critical
        story_points        INT               NOT NULL DEFAULT 0,
        epic                NVARCHAR(255)     NULL,
        user_story          NVARCHAR(MAX)     NULL,
        acceptance_criteria NVARCHAR(MAX)     NULL,
        backlog_priority    INT               NOT NULL DEFAULT 0,
        is_blocked          BIT               NOT NULL DEFAULT 0,
        blocked_reason      NVARCHAR(MAX)     NULL,
        ai_solution         NVARCHAR(MAX)     NULL,
        estimated_hours     DECIMAL(10,2)     NULL,
        actual_hours        DECIMAL(10,2)     NULL,
        due_date            DATE              NULL,
        started_at          DATETIMEOFFSET    NULL,
        completed_at        DATETIMEOFFSET    NULL,
        created_at          DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at          DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_tasks PRIMARY KEY (id),
        CONSTRAINT FK_tasks_clients   FOREIGN KEY (client_id)   REFERENCES clients(id)   ON DELETE CASCADE,
        CONSTRAINT FK_tasks_sprints   FOREIGN KEY (sprint_id)   REFERENCES sprints(id)   ON DELETE NO ACTION,
        CONSTRAINT FK_tasks_analyses  FOREIGN KEY (analysis_id) REFERENCES analyses(id)  ON DELETE NO ACTION,
        CONSTRAINT FK_tasks_findings  FOREIGN KEY (finding_id)  REFERENCES findings(id)  ON DELETE NO ACTION,
        CONSTRAINT FK_tasks_assigned  FOREIGN KEY (assigned_to) REFERENCES users(id)     ON DELETE NO ACTION,
        CONSTRAINT FK_tasks_created   FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE NO ACTION,
        CONSTRAINT CK_tasks_status    CHECK (status   IN ('todo','in_progress','review','done')),
        CONSTRAINT CK_tasks_priority  CHECK (priority IN ('low','medium','high','critical'))
    );
END
GO

-- ============================================================================
-- 28. TABELA: sprint_retrospectives (Retrospectivas de sprint)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sprint_retrospectives')
BEGIN
    CREATE TABLE sprint_retrospectives (
        id                UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        sprint_id         UNIQUEIDENTIFIER  NOT NULL,
        client_id         UNIQUEIDENTIFIER  NOT NULL,
        what_went_well    NVARCHAR(MAX)     NULL,
        what_to_improve   NVARCHAR(MAX)     NULL,
        action_items      NVARCHAR(MAX)     NULL,
        created_by        UNIQUEIDENTIFIER  NULL,
        created_at        DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at        DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_sprint_retrospectives PRIMARY KEY (id),
        CONSTRAINT FK_sprint_retro_sprints  FOREIGN KEY (sprint_id)  REFERENCES sprints(id)  ON DELETE CASCADE,
        CONSTRAINT FK_sprint_retro_clients  FOREIGN KEY (client_id)  REFERENCES clients(id)  ON DELETE NO ACTION,
        CONSTRAINT FK_sprint_retro_created  FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 29. TABELA: daily_standups (Daily standups da equipe)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'daily_standups')
BEGIN
    CREATE TABLE daily_standups (
        id            UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        sprint_id     UNIQUEIDENTIFIER  NOT NULL,
        user_id       UNIQUEIDENTIFIER  NOT NULL,
        client_id     UNIQUEIDENTIFIER  NOT NULL,
        standup_date  DATE              NOT NULL DEFAULT CAST(SYSDATETIMEOFFSET() AS DATE),
        what_did      NVARCHAR(MAX)     NULL,
        what_will_do  NVARCHAR(MAX)     NULL,
        blockers      NVARCHAR(MAX)     NULL,
        created_at    DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_daily_standups         PRIMARY KEY (id),
        CONSTRAINT UQ_daily_standups_unique  UNIQUE (sprint_id, user_id, standup_date),
        CONSTRAINT FK_daily_standups_sprints FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
        CONSTRAINT FK_daily_standups_users   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE NO ACTION,
        CONSTRAINT FK_daily_standups_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 30. TABELA: integration_configs (Configurações de integrações externas)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'integration_configs')
BEGIN
    CREATE TABLE integration_configs (
        id               UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id        UNIQUEIDENTIFIER  NOT NULL,
        integration_type NVARCHAR(50)      NOT NULL, -- slack | jira | trello | gitlab | github | azure
        name             NVARCHAR(255)     NOT NULL,
        config           NVARCHAR(MAX)     NOT NULL, -- JSON
        is_active        BIT               NOT NULL DEFAULT 1,
        last_sync_at     DATETIMEOFFSET    NULL,
        last_error       NVARCHAR(MAX)     NULL,
        created_by       UNIQUEIDENTIFIER  NULL,
        created_at       DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at       DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_integration_configs      PRIMARY KEY (id),
        CONSTRAINT UQ_integration_configs_key  UNIQUE (client_id, integration_type, name),
        CONSTRAINT FK_integration_clients      FOREIGN KEY (client_id)  REFERENCES clients(id) ON DELETE CASCADE,
        CONSTRAINT FK_integration_created_by   FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE NO ACTION
    );
END
GO

-- ============================================================================
-- 31. TABELA: webhook_logs (Logs de execução de webhooks)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'webhook_logs')
BEGIN
    CREATE TABLE webhook_logs (
        id              UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        webhook_id      UNIQUEIDENTIFIER  NOT NULL,
        event_type      NVARCHAR(100)     NOT NULL,
        payload         NVARCHAR(MAX)     NOT NULL, -- JSON
        response_status INT               NULL,
        response_body   NVARCHAR(MAX)     NULL,
        error_message   NVARCHAR(MAX)     NULL,
        retry_count     INT               NOT NULL DEFAULT 0,
        triggered_at    DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_webhook_logs PRIMARY KEY (id),
        CONSTRAINT FK_webhook_logs_webhooks FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- 32. TABELA: analytics_events (Eventos de analytics)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'analytics_events')
BEGIN
    CREATE TABLE analytics_events (
        id         UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id  UNIQUEIDENTIFIER  NULL,
        user_id    UNIQUEIDENTIFIER  NULL,
        event_type NVARCHAR(100)     NOT NULL,
        event_name NVARCHAR(255)     NOT NULL,
        properties NVARCHAR(MAX)     NULL, -- JSON
        session_id UNIQUEIDENTIFIER  NULL,
        ip_address NVARCHAR(45)      NULL,
        user_agent NVARCHAR(MAX)     NULL,
        created_at DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_analytics_events PRIMARY KEY (id),
        CONSTRAINT FK_analytics_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        CONSTRAINT FK_analytics_users   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE SET NULL
    );
END
GO

-- ============================================================================
-- 33. TABELA: settings (Configurações do sistema)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'settings')
BEGIN
    CREATE TABLE settings (
        id         UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
        client_id  UNIQUEIDENTIFIER  NULL,  -- NULL = configuração global
        key        NVARCHAR(100)     NOT NULL,
        value      NVARCHAR(MAX)     NULL,
        created_at DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at DATETIMEOFFSET    NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_settings      PRIMARY KEY (id),
        CONSTRAINT UQ_settings_key  UNIQUE (client_id, key),
        CONSTRAINT FK_settings_clients FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================================

-- clients
CREATE INDEX IF NOT EXISTS IX_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS IX_clients_plan   ON clients(plan);

-- users
CREATE INDEX IF NOT EXISTS IX_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS IX_users_role      ON users(role);
CREATE INDEX IF NOT EXISTS IX_users_status    ON users(status);

-- analyses
CREATE INDEX IF NOT EXISTS IX_analyses_client_id  ON analyses(client_id);
CREATE INDEX IF NOT EXISTS IX_analyses_user_id    ON analyses(user_id);
CREATE INDEX IF NOT EXISTS IX_analyses_status     ON analyses(status);
CREATE INDEX IF NOT EXISTS IX_analyses_created_at ON analyses(created_at DESC);

-- findings
CREATE INDEX IF NOT EXISTS IX_findings_analysis_id ON findings(analysis_id);
CREATE INDEX IF NOT EXISTS IX_findings_client_id   ON findings(client_id);
CREATE INDEX IF NOT EXISTS IX_findings_file_type   ON findings(file_type);

-- database_findings
CREATE INDEX IF NOT EXISTS IX_db_findings_analysis_id ON database_findings(analysis_id);
CREATE INDEX IF NOT EXISTS IX_db_findings_client_id   ON database_findings(client_id);
CREATE INDEX IF NOT EXISTS IX_db_findings_table       ON database_findings(table_name);

-- api_keys
CREATE INDEX IF NOT EXISTS IX_api_keys_client_id ON api_keys(client_id);
CREATE INDEX IF NOT EXISTS IX_api_keys_status    ON api_keys(status);

-- usage_logs
CREATE INDEX IF NOT EXISTS IX_usage_logs_client_id  ON usage_logs(client_id);
CREATE INDEX IF NOT EXISTS IX_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS IX_usage_logs_endpoint   ON usage_logs(endpoint);

-- notifications
CREATE INDEX IF NOT EXISTS IX_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS IX_notifications_client_id  ON notifications(client_id);
CREATE INDEX IF NOT EXISTS IX_notifications_is_read    ON notifications(is_read);
CREATE INDEX IF NOT EXISTS IX_notifications_created_at ON notifications(created_at DESC);

-- tasks
CREATE INDEX IF NOT EXISTS IX_tasks_client_id  ON tasks(client_id);
CREATE INDEX IF NOT EXISTS IX_tasks_sprint_id  ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS IX_tasks_assigned   ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS IX_tasks_status     ON tasks(status);

-- sprints
CREATE INDEX IF NOT EXISTS IX_sprints_client_id ON sprints(client_id);
CREATE INDEX IF NOT EXISTS IX_sprints_status    ON sprints(status);
CREATE INDEX IF NOT EXISTS IX_sprints_dates     ON sprints(start_date, end_date);

-- activity_logs
CREATE INDEX IF NOT EXISTS IX_activity_client_id  ON activity_logs(client_id);
CREATE INDEX IF NOT EXISTS IX_activity_user_id    ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS IX_activity_entity     ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS IX_activity_created_at ON activity_logs(created_at DESC);

-- payments
CREATE INDEX IF NOT EXISTS IX_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS IX_payments_status    ON payments(status);

-- login_attempts
CREATE INDEX IF NOT EXISTS IX_login_email ON login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS IX_login_ip    ON login_attempts(ip_address, created_at DESC);

-- repositories
CREATE INDEX IF NOT EXISTS IX_repositories_client_id ON repositories(client_id);

-- ai_suggestions
CREATE INDEX IF NOT EXISTS IX_ai_suggestions_finding ON ai_suggestions(finding_id);
CREATE INDEX IF NOT EXISTS IX_ai_suggestions_status  ON ai_suggestions(status);

-- shared_links
CREATE INDEX IF NOT EXISTS IX_shared_links_token  ON shared_links(token);
CREATE INDEX IF NOT EXISTS IX_shared_links_entity ON shared_links(entity_type, entity_id);

-- analytics_events
CREATE INDEX IF NOT EXISTS IX_analytics_type   ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS IX_analytics_client ON analytics_events(client_id, created_at DESC);

GO

PRINT 'Script 01 - Tabelas criadas com sucesso!';
GO
