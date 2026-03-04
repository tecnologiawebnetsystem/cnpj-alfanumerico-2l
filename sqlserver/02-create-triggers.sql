-- ============================================================================
-- CNPJ ALFANUMERICO - SQL SERVER
-- Script 02: Triggers para updated_at automático
-- Compatível com: SQL Server 2016+
-- ============================================================================

USE CNPJAlfanumerico;
GO

-- ============================================================================
-- TRIGGER: clients - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_clients_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_clients_updated_at;
GO
CREATE TRIGGER TR_clients_updated_at
ON clients
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE clients
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: users - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_users_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_users_updated_at;
GO
CREATE TRIGGER TR_users_updated_at
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE users
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: analyses - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_analyses_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_analyses_updated_at;
GO
CREATE TRIGGER TR_analyses_updated_at
ON analyses
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE analyses
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: tasks - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_tasks_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_tasks_updated_at;
GO
CREATE TRIGGER TR_tasks_updated_at
ON tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE tasks
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: sprints - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_sprints_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_sprints_updated_at;
GO
CREATE TRIGGER TR_sprints_updated_at
ON sprints
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE sprints
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: plans - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_plans_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_plans_updated_at;
GO
CREATE TRIGGER TR_plans_updated_at
ON plans
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE plans
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: subscriptions - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_subscriptions_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_subscriptions_updated_at;
GO
CREATE TRIGGER TR_subscriptions_updated_at
ON subscriptions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE subscriptions
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: repositories - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_repositories_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_repositories_updated_at;
GO
CREATE TRIGGER TR_repositories_updated_at
ON repositories
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE repositories
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: user_stats - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_user_stats_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_user_stats_updated_at;
GO
CREATE TRIGGER TR_user_stats_updated_at
ON user_stats
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE user_stats
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: integration_configs - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_integration_configs_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_integration_configs_updated_at;
GO
CREATE TRIGGER TR_integration_configs_updated_at
ON integration_configs
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE integration_configs
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: settings - atualiza updated_at automaticamente
-- ============================================================================
IF OBJECT_ID('dbo.TR_settings_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_settings_updated_at;
GO
CREATE TRIGGER TR_settings_updated_at
ON settings
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE settings
    SET updated_at = SYSDATETIMEOFFSET()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================================
-- TRIGGER: user_stats - atualiza automaticamente ao concluir uma tarefa
-- ============================================================================
IF OBJECT_ID('dbo.TR_tasks_update_user_stats', 'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_tasks_update_user_stats;
GO
CREATE TRIGGER TR_tasks_update_user_stats
ON tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- Incrementa tasks_completed quando status muda para 'done'
    UPDATE us
    SET
        us.tasks_completed    = us.tasks_completed + 1,
        us.last_activity_date = CAST(SYSDATETIMEOFFSET() AS DATE),
        us.updated_at         = SYSDATETIMEOFFSET()
    FROM user_stats us
    INNER JOIN inserted i ON us.user_id = i.assigned_to
    INNER JOIN deleted  d ON d.id       = i.id
    WHERE i.status = 'done'
      AND (d.status IS NULL OR d.status <> 'done');
END;
GO

PRINT 'Script 02 - Triggers criados com sucesso!';
GO
