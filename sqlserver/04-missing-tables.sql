-- ============================================================================
-- 04 - TABELAS COMPLEMENTARES  (SQL Server / T-SQL)
-- Porta todos os objetos que existem em scripts/Postgres mas nao estavam
-- no pacote sqlserver/01-create-tables.sql
--
-- Ordem de execucao: DEPOIS de 01-create-tables.sql e 02-create-triggers.sql
-- ============================================================================

USE CNPJAlfanumerico;
GO

-- ============================================================================
-- 1. COLUNAS EXTRAS EM TABELAS JA EXISTENTES
-- ============================================================================

-- analyses: colunas adicionadas ao longo dos migrations
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('analyses') AND name = 'batch_id')
    ALTER TABLE analyses ADD batch_id UNIQUEIDENTIFIER NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('analyses') AND name = 'progress')
    ALTER TABLE analyses ADD progress INT NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('analyses') AND name = 'current_step')
    ALTER TABLE analyses ADD current_step NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('analyses') AND name = 'method')
    ALTER TABLE analyses ADD method NVARCHAR(50) NULL;  -- 'api', 'zip', 'local'

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('analyses') AND name = 'repository_id')
    ALTER TABLE analyses ADD repository_id UNIQUEIDENTIFIER NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('analyses') AND name = 'results')
    ALTER TABLE analyses ADD results NVARCHAR(MAX) NULL;  -- JSON

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('analyses') AND name = 'job_id')
    ALTER TABLE analyses ADD job_id UNIQUEIDENTIFIER NULL;

-- ai_chat_history: colunas adicionadas pelo script 024
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ai_chat_history') AND name = 'task_id')
    ALTER TABLE ai_chat_history ADD task_id UNIQUEIDENTIFIER NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ai_chat_history') AND name = 'repository_id')
    ALTER TABLE ai_chat_history ADD repository_id UNIQUEIDENTIFIER NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ai_chat_history') AND name = 'intent')
    ALTER TABLE ai_chat_history ADD intent NVARCHAR(50) NULL;

-- Indices para ai_chat_history
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('ai_chat_history') AND name = 'idx_ai_chat_history_user_session')
    CREATE INDEX idx_ai_chat_history_user_session ON ai_chat_history(user_id, session_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('ai_chat_history') AND name = 'idx_ai_chat_history_client')
    CREATE INDEX idx_ai_chat_history_client ON ai_chat_history(client_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('ai_chat_history') AND name = 'idx_ai_chat_history_created')
    CREATE INDEX idx_ai_chat_history_created ON ai_chat_history(created_at DESC);
GO

-- ============================================================================
-- 2. BATCH_ANALYSES
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'batch_analyses')
BEGIN
    CREATE TABLE batch_analyses (
        id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        client_id     UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        account_name  NVARCHAR(255)    NULL,
        status        NVARCHAR(50)     NOT NULL DEFAULT 'pending',
        -- pending | processing | completed | failed | partial
        total_repos   INT              NOT NULL DEFAULT 0,
        completed_repos INT            NOT NULL DEFAULT 0,
        failed_repos  INT              NOT NULL DEFAULT 0,
        estimated_hours DECIMAL(10,2)  NULL,
        worker_id     NVARCHAR(255)    NULL,
        error_message NVARCHAR(MAX)    NULL,
        created_by    UNIQUEIDENTIFIER NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at    DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at    DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_batch_analyses_client   ON batch_analyses(client_id);
    CREATE INDEX idx_batch_analyses_status   ON batch_analyses(status);
    CREATE INDEX idx_batch_analyses_created  ON batch_analyses(created_at DESC);
    PRINT 'Tabela batch_analyses criada.';
END
GO

-- FK batch_id em analyses -> batch_analyses
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_analyses_batch_id' AND parent_object_id = OBJECT_ID('analyses')
)
BEGIN
    ALTER TABLE analyses
        ADD CONSTRAINT FK_analyses_batch_id
        FOREIGN KEY (batch_id) REFERENCES batch_analyses(id) ON DELETE SET NULL;
END
GO

-- ============================================================================
-- 3. WORKERS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'workers')
BEGIN
    CREATE TABLE workers (
        worker_id     NVARCHAR(255)    NOT NULL PRIMARY KEY,
        status        NVARCHAR(50)     NOT NULL DEFAULT 'active',
        -- active | stopped | error
        last_heartbeat DATETIMEOFFSET  NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        machine_info  NVARCHAR(MAX)    NULL,   -- JSON
        created_at    DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at    DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_workers_status     ON workers(status);
    CREATE INDEX idx_workers_heartbeat  ON workers(last_heartbeat);
    PRINT 'Tabela workers criada.';
END
GO

-- FK worker_id em batch_analyses
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_batch_analyses_worker_id' AND parent_object_id = OBJECT_ID('batch_analyses')
)
BEGIN
    ALTER TABLE batch_analyses
        ADD CONSTRAINT FK_batch_analyses_worker_id
        FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE SET NULL;
END
GO

-- ============================================================================
-- 4. ANALYSIS_ERRORS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'analysis_errors')
BEGIN
    CREATE TABLE analysis_errors (
        id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        analysis_id      UNIQUEIDENTIFIER NULL REFERENCES batch_analyses(id) ON DELETE CASCADE,
        repository_name  NVARCHAR(500)    NULL,
        error_message    NVARCHAR(MAX)    NULL,
        error_stack      NVARCHAR(MAX)    NULL,
        worker_id        NVARCHAR(255)    NULL REFERENCES workers(worker_id),
        created_at       DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_analysis_errors_analysis ON analysis_errors(analysis_id);
    PRINT 'Tabela analysis_errors criada.';
END
GO

-- ============================================================================
-- 5. JOB_QUEUE e JOB_LOGS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'job_queue')
BEGIN
    CREATE TABLE job_queue (
        id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        client_id       UNIQUEIDENTIFIER NULL REFERENCES clients(id) ON DELETE CASCADE,
        user_id         UNIQUEIDENTIFIER NULL REFERENCES users(id) ON DELETE SET NULL,
        job_type        NVARCHAR(50)     NOT NULL,  -- 'analysis', 'report_generation', 'database_scan'
        job_data        NVARCHAR(MAX)    NOT NULL,  -- JSON
        status          NVARCHAR(20)     NOT NULL DEFAULT 'pending',
        -- pending | processing | completed | failed | paused | cancelled
        priority        INT              NOT NULL DEFAULT 0,
        attempts        INT              NOT NULL DEFAULT 0,
        max_attempts    INT              NOT NULL DEFAULT 3,
        last_error      NVARCHAR(MAX)    NULL,
        error_details   NVARCHAR(MAX)    NULL,   -- JSON
        created_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        started_at      DATETIMEOFFSET   NULL,
        completed_at    DATETIMEOFFSET   NULL,
        failed_at       DATETIMEOFFSET   NULL,
        next_retry_at   DATETIMEOFFSET   NULL,
        worker_id       NVARCHAR(100)    NULL,
        locked_at       DATETIMEOFFSET   NULL,
        locked_until    DATETIMEOFFSET   NULL,
        progress        INT              NOT NULL DEFAULT 0,
        progress_details NVARCHAR(MAX)   NULL,   -- JSON
        result          NVARCHAR(MAX)    NULL    -- JSON
    );

    CREATE INDEX idx_job_queue_status      ON job_queue(status);
    CREATE INDEX idx_job_queue_client_id   ON job_queue(client_id);
    CREATE INDEX idx_job_queue_priority    ON job_queue(priority DESC, created_at ASC);
    CREATE INDEX idx_job_queue_next_retry  ON job_queue(next_retry_at) WHERE status = 'failed';
    CREATE INDEX idx_job_queue_locked      ON job_queue(locked_until) WHERE locked_until IS NOT NULL;
    PRINT 'Tabela job_queue criada.';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'job_logs')
BEGIN
    CREATE TABLE job_logs (
        id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        job_id     UNIQUEIDENTIFIER NULL REFERENCES job_queue(id) ON DELETE CASCADE,
        level      NVARCHAR(20)     NOT NULL,  -- info | warning | error | debug
        message    NVARCHAR(MAX)    NOT NULL,
        metadata   NVARCHAR(MAX)    NULL,      -- JSON
        created_at DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_job_logs_job_id ON job_logs(job_id, created_at DESC);
    PRINT 'Tabela job_logs criada.';
END
GO

-- FK job_id em analyses -> job_queue
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_analyses_job_id' AND parent_object_id = OBJECT_ID('analyses')
)
BEGIN
    ALTER TABLE analyses
        ADD CONSTRAINT FK_analyses_job_id
        FOREIGN KEY (job_id) REFERENCES job_queue(id) ON DELETE SET NULL;
END
GO

-- ============================================================================
-- 6. TASK_PROGRESS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'task_progress')
BEGIN
    CREATE TABLE task_progress (
        id                      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        task_id                 UNIQUEIDENTIFIER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        dev_id                  UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id               UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id),
        progress_percentage     INT              NOT NULL DEFAULT 0
            CONSTRAINT chk_task_progress_pct CHECK (progress_percentage BETWEEN 0 AND 100),
        status                  NVARCHAR(50)     NOT NULL DEFAULT 'pending',
        -- pending | in_progress | blocked | completed
        estimated_hours         DECIMAL(10,2)    NULL,
        actual_hours_spent      DECIMAL(10,2)    NOT NULL DEFAULT 0,
        started_at              DATETIMEOFFSET   NULL,
        expected_completion_date DATETIMEOFFSET  NULL,
        actual_completion_date  DATETIMEOFFSET   NULL,
        last_progress_update    DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        is_delayed              BIT              NOT NULL DEFAULT 0,
        delay_days              INT              NOT NULL DEFAULT 0,
        is_blocked              BIT              NOT NULL DEFAULT 0,
        blocked_reason          NVARCHAR(MAX)    NULL,
        progress_notes          NVARCHAR(MAX)    NULL,
        created_at              DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at              DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_task_progress_task_id   ON task_progress(task_id);
    CREATE INDEX idx_task_progress_dev_id    ON task_progress(dev_id);
    CREATE INDEX idx_task_progress_client_id ON task_progress(client_id);
    CREATE INDEX idx_task_progress_status    ON task_progress(status);
    CREATE INDEX idx_task_progress_delayed   ON task_progress(is_delayed);
    PRINT 'Tabela task_progress criada.';
END
GO

-- ============================================================================
-- 7. DEV_DAILY_METRICS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'dev_daily_metrics')
BEGIN
    CREATE TABLE dev_daily_metrics (
        id                              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        dev_id                          UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id                       UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id),
        metric_date                     DATE             NOT NULL,
        tasks_assigned                  INT              NOT NULL DEFAULT 0,
        tasks_started                   INT              NOT NULL DEFAULT 0,
        tasks_completed                 INT              NOT NULL DEFAULT 0,
        tasks_blocked                   INT              NOT NULL DEFAULT 0,
        tasks_delayed                   INT              NOT NULL DEFAULT 0,
        total_hours_logged              DECIMAL(10,2)    NOT NULL DEFAULT 0,
        avg_task_completion_hours       DECIMAL(10,2)    NULL,
        avg_progress_update_frequency_hours DECIMAL(10,2) NULL,
        tasks_on_time                   INT              NOT NULL DEFAULT 0,
        tasks_late                      INT              NOT NULL DEFAULT 0,
        performance_score               DECIMAL(5,2)     NULL,
        created_at                      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT uq_dev_daily_metrics UNIQUE (dev_id, metric_date)
    );

    CREATE INDEX idx_dev_daily_metrics_dev_id    ON dev_daily_metrics(dev_id);
    CREATE INDEX idx_dev_daily_metrics_date      ON dev_daily_metrics(metric_date);
    CREATE INDEX idx_dev_daily_metrics_client_id ON dev_daily_metrics(client_id);
    PRINT 'Tabela dev_daily_metrics criada.';
END
GO

-- ============================================================================
-- 8. DEV_ALERTS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'dev_alerts')
BEGIN
    CREATE TABLE dev_alerts (
        id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        dev_id           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id        UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id),
        task_id          UNIQUEIDENTIFIER NULL REFERENCES tasks(id) ON DELETE SET NULL,
        alert_type       NVARCHAR(100)    NOT NULL,
        -- no_progress_update | task_delayed | task_blocked | low_performance | missed_deadline
        severity         NVARCHAR(20)     NOT NULL DEFAULT 'warning',
        -- info | warning | critical
        title            NVARCHAR(500)    NOT NULL,
        message          NVARCHAR(MAX)    NOT NULL,
        status           NVARCHAR(20)     NOT NULL DEFAULT 'active',
        -- active | acknowledged | resolved
        acknowledged_at  DATETIMEOFFSET   NULL,
        acknowledged_by  UNIQUEIDENTIFIER NULL REFERENCES users(id),
        resolved_at      DATETIMEOFFSET   NULL,
        metadata         NVARCHAR(MAX)    NULL,   -- JSON
        created_at       DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at       DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_dev_alerts_dev_id    ON dev_alerts(dev_id);
    CREATE INDEX idx_dev_alerts_client_id ON dev_alerts(client_id);
    CREATE INDEX idx_dev_alerts_status    ON dev_alerts(status);
    CREATE INDEX idx_dev_alerts_severity  ON dev_alerts(severity);
    PRINT 'Tabela dev_alerts criada.';
END
GO

-- ============================================================================
-- 9. ADMIN_DEV_NOTIFICATIONS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'admin_dev_notifications')
BEGIN
    CREATE TABLE admin_dev_notifications (
        id                UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        client_id         UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        admin_id          UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
        dev_id            UNIQUEIDENTIFIER NULL REFERENCES users(id),
        notification_type NVARCHAR(100)    NOT NULL,
        title             NVARCHAR(500)    NOT NULL,
        message           NVARCHAR(MAX)    NOT NULL,
        link_url          NVARCHAR(2000)   NULL,
        is_read           BIT              NOT NULL DEFAULT 0,
        read_at           DATETIMEOFFSET   NULL,
        metadata          NVARCHAR(MAX)    NULL,   -- JSON
        created_at        DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_admin_dev_notif_admin_id ON admin_dev_notifications(admin_id);
    CREATE INDEX idx_admin_dev_notif_dev_id   ON admin_dev_notifications(dev_id);
    CREATE INDEX idx_admin_dev_notif_is_read  ON admin_dev_notifications(is_read);
    PRINT 'Tabela admin_dev_notifications criada.';
END
GO

-- ============================================================================
-- 10. LEADERBOARD
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'leaderboard')
BEGIN
    CREATE TABLE leaderboard (
        id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        user_id      UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id    UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id),
        period       NVARCHAR(20)     NOT NULL,  -- daily | weekly | monthly | all_time
        metric       NVARCHAR(50)     NOT NULL,  -- points | tasks | analyses | speed
        value        DECIMAL(18,4)    NOT NULL,
        rank         INT              NULL,
        period_start DATE             NOT NULL,
        period_end   DATE             NOT NULL,
        created_at   DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT uq_leaderboard UNIQUE (user_id, period, metric, period_start)
    );

    CREATE INDEX idx_leaderboard_period ON leaderboard(period, metric, value DESC);
    CREATE INDEX idx_leaderboard_client ON leaderboard(client_id, period);
    PRINT 'Tabela leaderboard criada.';
END
GO

-- ============================================================================
-- 11. REPOSITORY_ASSIGNMENTS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'repository_assignments')
BEGIN
    CREATE TABLE repository_assignments (
        id                   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        client_id            UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        repository_url       NVARCHAR(2000)   NOT NULL,
        repository_name      NVARCHAR(500)    NOT NULL,
        repository_type      NVARCHAR(50)     NOT NULL,  -- github | gitlab | azure | database
        assigned_developer_id UNIQUEIDENTIFIER NULL REFERENCES users(id) ON DELETE SET NULL,
        assigned_at          DATETIMEOFFSET   NULL,
        assigned_by          UNIQUEIDENTIFIER NULL REFERENCES users(id),
        status               NVARCHAR(50)     NOT NULL DEFAULT 'pending',
        -- pending | assigned | in_progress | completed
        notes                NVARCHAR(MAX)    NULL,
        created_at           DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at           DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_repo_assignments_client    ON repository_assignments(client_id);
    CREATE INDEX idx_repo_assignments_developer ON repository_assignments(assigned_developer_id);
    PRINT 'Tabela repository_assignments criada.';
END
GO

-- ============================================================================
-- 12. KANBAN_TASKS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'kanban_tasks')
BEGIN
    CREATE TABLE kanban_tasks (
        id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        assignment_id   UNIQUEIDENTIFIER NOT NULL REFERENCES repository_assignments(id) ON DELETE CASCADE,
        finding_id      UNIQUEIDENTIFIER NULL REFERENCES findings(id) ON DELETE SET NULL,
        developer_id    UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title           NVARCHAR(500)    NOT NULL,
        description     NVARCHAR(MAX)    NULL,
        file_path       NVARCHAR(2000)   NULL,
        line_number     INT              NULL,
        severity        NVARCHAR(50)     NULL,  -- critical | high | medium | low
        ai_solution     NVARCHAR(MAX)    NULL,
        status          NVARCHAR(50)     NOT NULL DEFAULT 'todo',
        -- todo | in_progress | done
        priority        INT              NOT NULL DEFAULT 0,
        moved_to_in_progress_at DATETIMEOFFSET NULL,
        completed_at    DATETIMEOFFSET   NULL,
        created_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_kanban_tasks_developer ON kanban_tasks(developer_id);
    CREATE INDEX idx_kanban_tasks_status    ON kanban_tasks(status);
    PRINT 'Tabela kanban_tasks criada.';
END
GO

-- ============================================================================
-- 13. DATABASE_ANALYSES
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'database_analyses')
BEGIN
    CREATE TABLE database_analyses (
        id                   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        client_id            UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        database_type        NVARCHAR(50)     NOT NULL,  -- sqlserver | oracle | postgresql | mysql
        connection_string    NVARCHAR(MAX)    NOT NULL,  -- Criptografada
        database_name        NVARCHAR(255)    NULL,
        schema_name          NVARCHAR(255)    NULL,
        total_tables_scanned INT              NOT NULL DEFAULT 0,
        total_cnpj_found     INT              NOT NULL DEFAULT 0,
        findings             NVARCHAR(MAX)    NULL,  -- JSON array
        status               NVARCHAR(50)     NOT NULL DEFAULT 'pending',
        started_at           DATETIMEOFFSET   NULL,
        completed_at         DATETIMEOFFSET   NULL,
        error_message        NVARCHAR(MAX)    NULL,
        created_by           UNIQUEIDENTIFIER NULL REFERENCES users(id),
        created_at           DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at           DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_database_analyses_client ON database_analyses(client_id);
    PRINT 'Tabela database_analyses criada.';
END
GO

-- ============================================================================
-- 14. CLIENT_SETTINGS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'client_settings')
BEGIN
    CREATE TABLE client_settings (
        id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        client_id     UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        setting_key   NVARCHAR(100)    NOT NULL,
        setting_value NVARCHAR(MAX)    NOT NULL,
        created_at    DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at    DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT uq_client_settings UNIQUE (client_id, setting_key)
    );

    CREATE INDEX idx_client_settings_client_id ON client_settings(client_id);
    CREATE INDEX idx_client_settings_key       ON client_settings(client_id, setting_key);
    PRINT 'Tabela client_settings criada.';
END
GO

-- ============================================================================
-- 15. COUPONS e COUPON_USAGE
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'coupons')
BEGIN
    CREATE TABLE coupons (
        id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        code           NVARCHAR(50)     NOT NULL UNIQUE,
        description    NVARCHAR(MAX)    NULL,
        discount_type  NVARCHAR(20)     NOT NULL,  -- percentage | fixed
        discount_value DECIMAL(10,2)    NOT NULL,
        max_uses       INT              NULL,
        times_used     INT              NOT NULL DEFAULT 0,
        valid_from     DATE             NULL,
        valid_until    DATE             NULL,
        is_active      BIT              NOT NULL DEFAULT 1,
        created_by     UNIQUEIDENTIFIER NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at     DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    PRINT 'Tabela coupons criada.';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'coupon_usage')
BEGIN
    CREATE TABLE coupon_usage (
        id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        coupon_id       UNIQUEIDENTIFIER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        client_id       UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        subscription_id UNIQUEIDENTIFIER NULL REFERENCES subscriptions(id) ON DELETE SET NULL,
        discount_amount DECIMAL(10,2)    NOT NULL,
        used_at         DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    PRINT 'Tabela coupon_usage criada.';
END
GO

-- ============================================================================
-- 16. AFFILIATES e AFFILIATE_REFERRALS
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'affiliates')
BEGIN
    CREATE TABLE affiliates (
        id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        user_id         UNIQUEIDENTIFIER NULL REFERENCES users(id) ON DELETE SET NULL,
        name            NVARCHAR(255)    NOT NULL,
        email           NVARCHAR(255)    NOT NULL UNIQUE,
        code            NVARCHAR(50)     NOT NULL UNIQUE,
        commission_rate DECIMAL(5,2)     NOT NULL DEFAULT 10.00,
        total_referrals INT              NOT NULL DEFAULT 0,
        total_earnings  DECIMAL(10,2)    NOT NULL DEFAULT 0,
        status          NVARCHAR(50)     NOT NULL DEFAULT 'active',
        payment_info    NVARCHAR(MAX)    NULL,  -- JSON (conta bancaria, PIX etc.)
        created_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    PRINT 'Tabela affiliates criada.';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'affiliate_referrals')
BEGIN
    CREATE TABLE affiliate_referrals (
        id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        affiliate_id     UNIQUEIDENTIFIER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
        client_id        UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        subscription_id  UNIQUEIDENTIFIER NULL REFERENCES subscriptions(id) ON DELETE SET NULL,
        commission_amount DECIMAL(10,2)   NULL,
        commission_paid  BIT              NOT NULL DEFAULT 0,
        paid_at          DATETIMEOFFSET   NULL,
        created_at       DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    PRINT 'Tabela affiliate_referrals criada.';
END
GO

-- ============================================================================
-- 17. TWO_FACTOR_AUTH
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'two_factor_auth')
BEGIN
    CREATE TABLE two_factor_auth (
        id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        user_id      UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        secret       NVARCHAR(255)    NOT NULL,
        is_enabled   BIT              NOT NULL DEFAULT 0,
        backup_codes NVARCHAR(MAX)    NULL,  -- JSON array de codigos de backup
        last_used_at DATETIMEOFFSET   NULL,
        created_at   DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at   DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    PRINT 'Tabela two_factor_auth criada.';
END
GO

-- ============================================================================
-- 18. SCHEDULED_ANALYSES
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'scheduled_analyses')
BEGIN
    CREATE TABLE scheduled_analyses (
        id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        client_id       UNIQUEIDENTIFIER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        repository_id   UNIQUEIDENTIFIER NULL REFERENCES repositories(id) ON DELETE CASCADE,
        name            NVARCHAR(255)    NOT NULL,
        description     NVARCHAR(MAX)    NULL,
        schedule_type   NVARCHAR(50)     NOT NULL,  -- daily | weekly | monthly | cron
        schedule_config NVARCHAR(MAX)    NULL,  -- JSON
        is_active       BIT              NOT NULL DEFAULT 1,
        last_run_at     DATETIMEOFFSET   NULL,
        next_run_at     DATETIMEOFFSET   NULL,
        last_status     NVARCHAR(50)     NULL,  -- success | failed | running
        last_error      NVARCHAR(MAX)    NULL,
        created_by      UNIQUEIDENTIFIER NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX idx_scheduled_analyses_next_run ON scheduled_analyses(next_run_at) WHERE is_active = 1;
    PRINT 'Tabela scheduled_analyses criada.';
END
GO

-- ============================================================================
-- 19. HELP_ARTICLES e HELP_ARTICLE_FEEDBACK
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'help_articles')
BEGIN
    CREATE TABLE help_articles (
        id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        title            NVARCHAR(255)    NOT NULL,
        slug             NVARCHAR(255)    NOT NULL UNIQUE,
        content          NVARCHAR(MAX)    NOT NULL,
        excerpt          NVARCHAR(MAX)    NULL,
        category         NVARCHAR(100)    NULL,
        tags             NVARCHAR(MAX)    NULL,  -- JSON array
        author_id        UNIQUEIDENTIFIER NULL REFERENCES users(id) ON DELETE SET NULL,
        is_published     BIT              NOT NULL DEFAULT 0,
        view_count       INT              NOT NULL DEFAULT 0,
        helpful_count    INT              NOT NULL DEFAULT 0,
        not_helpful_count INT             NOT NULL DEFAULT 0,
        created_at       DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at       DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        published_at     DATETIMEOFFSET   NULL
    );

    CREATE INDEX idx_help_articles_slug     ON help_articles(slug);
    CREATE INDEX idx_help_articles_category ON help_articles(category);
    PRINT 'Tabela help_articles criada.';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'help_article_feedback')
BEGIN
    CREATE TABLE help_article_feedback (
        id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        article_id UNIQUEIDENTIFIER NOT NULL REFERENCES help_articles(id) ON DELETE CASCADE,
        user_id    UNIQUEIDENTIFIER NULL REFERENCES users(id) ON DELETE SET NULL,
        is_helpful BIT              NOT NULL,
        feedback   NVARCHAR(MAX)    NULL,
        created_at DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    PRINT 'Tabela help_article_feedback criada.';
END
GO

-- ============================================================================
-- 20. TRIGGERS updated_at PARA AS NOVAS TABELAS
-- ============================================================================

-- Macro: cria trigger de updated_at para cada tabela nova
CREATE OR ALTER TRIGGER trg_batch_analyses_updated_at
ON batch_analyses AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE batch_analyses SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_workers_updated_at
ON workers AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE workers SET updated_at = SYSDATETIMEOFFSET() WHERE worker_id IN (SELECT worker_id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_task_progress_updated_at
ON task_progress AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE task_progress SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_dev_alerts_updated_at
ON dev_alerts AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE dev_alerts SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_repository_assignments_updated_at
ON repository_assignments AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE repository_assignments SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_kanban_tasks_updated_at
ON kanban_tasks AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE kanban_tasks SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_database_analyses_updated_at
ON database_analyses AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE database_analyses SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_client_settings_updated_at
ON client_settings AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE client_settings SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_affiliates_updated_at
ON affiliates AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE affiliates SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_two_factor_auth_updated_at
ON two_factor_auth AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE two_factor_auth SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_scheduled_analyses_updated_at
ON scheduled_analyses AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE scheduled_analyses SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO
CREATE OR ALTER TRIGGER trg_help_articles_updated_at
ON help_articles AFTER UPDATE AS
BEGIN SET NOCOUNT ON; UPDATE help_articles SET updated_at = SYSDATETIMEOFFSET() WHERE id IN (SELECT id FROM inserted); END
GO

-- ============================================================================
-- 21. TRIGGER: criar task_progress automaticamente ao inserir tarefa
-- ============================================================================
CREATE OR ALTER TRIGGER trg_create_task_progress_on_insert
ON tasks AFTER INSERT AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO task_progress (task_id, dev_id, client_id, status, progress_percentage, estimated_hours)
    SELECT
        i.id,
        i.assigned_to,
        i.client_id,
        ISNULL(i.status, 'pending'),
        0,
        3.0
    FROM inserted i
    WHERE i.assigned_to IS NOT NULL;
END
GO

-- ============================================================================
-- 22. SEED: configuracoes padrao para clientes existentes
-- ============================================================================
INSERT INTO client_settings (client_id, setting_key, setting_value)
SELECT DISTINCT
    c.id,
    'cnpj_field_names',
    'cnpj,CNPJ,Cnpj,cnpjField,cnpjValue,documentNumber,cpfCnpj,taxId,companyDocument'
FROM clients c
WHERE NOT EXISTS (
    SELECT 1 FROM client_settings cs
    WHERE cs.client_id = c.id AND cs.setting_key = 'cnpj_field_names'
);

INSERT INTO client_settings (client_id, setting_key, setting_value)
SELECT DISTINCT
    c.id,
    'file_extensions',
    '.ts,.tsx,.js,.jsx,.java,.cs,.sql,.py,.html,.css,.scss,.sass'
FROM clients c
WHERE NOT EXISTS (
    SELECT 1 FROM client_settings cs
    WHERE cs.client_id = c.id AND cs.setting_key = 'file_extensions'
);
GO

PRINT '=== 04-missing-tables.sql executado com sucesso ==='
GO
