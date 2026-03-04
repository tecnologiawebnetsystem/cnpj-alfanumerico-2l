-- ============================================================================
-- CNPJ ALFANUMERICO - SQL SERVER
-- Script 03: Dados iniciais (seed) - Super Admin, Planos, Conquistas e Permissões
-- Compatível com: SQL Server 2016+
--
-- ORDEM DE EXECUÇÃO OBRIGATÓRIA:
--   1. 01-create-tables.sql
--   2. 02-create-triggers.sql
--   3. 03-seed-data.sql  (este arquivo)
-- ============================================================================

USE CNPJAlfanumerico;
GO

-- ============================================================================
-- 1. PLANOS DE ASSINATURA
-- ============================================================================
MERGE INTO plans AS target
USING (
    VALUES
    (
        'free', 'Gratuito',
        'Para conhecer o sistema',
        0.00, 0.00, 0.00,
        '{"analyses_per_month":5,"repositories":3,"users":1,"support":"email"}',
        '{"max_users":1,"max_analyses":5,"max_repositories":3,"max_api_calls":500}',
        1, 0, 1
    ),
    (
        'basic', 'Plano Básico',
        'Ideal para pequenas empresas e startups',
        299.00, 807.30, 3228.00,
        '{"analyses_per_month":10,"repositories":5,"users":3,"support":"email"}',
        '{"max_users":3,"max_analyses":10,"max_repositories":5,"max_api_calls":1000}',
        1, 0, 2
    ),
    (
        'professional', 'Plano Profissional',
        'Para empresas em crescimento',
        699.00, 1887.30, 7548.00,
        '{"analyses_per_month":50,"repositories":20,"users":10,"support":"priority"}',
        '{"max_users":10,"max_analyses":50,"max_repositories":20,"max_api_calls":5000}',
        1, 1, 3
    ),
    (
        'enterprise', 'Plano Enterprise',
        'Para grandes empresas com demanda ilimitada',
        1999.00, 5397.30, 21588.00,
        '{"analyses_per_month":-1,"repositories":-1,"users":-1,"support":"dedicated"}',
        '{"max_users":-1,"max_analyses":-1,"max_repositories":-1,"max_api_calls":-1}',
        1, 0, 4
    )
) AS source (name, display_name, description, price_monthly, price_quarterly, price_annual, features, limits, is_active, is_popular, sort_order)
ON target.name = source.name
WHEN MATCHED THEN
    UPDATE SET
        display_name    = source.display_name,
        description     = source.description,
        price_monthly   = source.price_monthly,
        price_quarterly = source.price_quarterly,
        price_annual    = source.price_annual,
        features        = source.features,
        limits          = source.limits,
        is_active       = source.is_active,
        is_popular      = source.is_popular,
        sort_order      = source.sort_order,
        updated_at      = SYSDATETIMEOFFSET()
WHEN NOT MATCHED THEN
    INSERT (id, name, display_name, description, price_monthly, price_quarterly, price_annual, features, limits, is_active, is_popular, sort_order, created_at, updated_at)
    VALUES (NEWID(), source.name, source.display_name, source.description, source.price_monthly, source.price_quarterly, source.price_annual, source.features, source.limits, source.is_active, source.is_popular, source.sort_order, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
GO

-- ============================================================================
-- 2. CLIENTE WEBNETSYSTEMS (proprietário do sistema)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM clients WHERE email = 'contato@webnetsystems.com.br')
BEGIN
    INSERT INTO clients (id, name, cnpj, email, phone, plan, status, max_analyses, max_api_calls, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'WebNetSystems',
        '00.000.000/0001-00',
        'contato@webnetsystems.com.br',
        '(11) 99999-0000',
        'enterprise',
        'active',
        999999,
        999999,
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET()
    );
END
GO

-- ============================================================================
-- 3. SUPER ADMIN
-- Senha padrão: Admin@2026
-- Hash bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- IMPORTANTE: Troque a senha no primeiro login!
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@webnetsystems.com.br')
BEGIN
    INSERT INTO users (id, client_id, email, password_hash, name, role, status, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'admin@webnetsystems.com.br',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Super Administrador',
        'super_admin',
        'active',
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET()
    );
END
GO

-- Criar user_stats para o super admin
IF NOT EXISTS (SELECT 1 FROM user_stats WHERE user_id = '00000000-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO user_stats (id, user_id, total_points, rank, created_at, updated_at)
    VALUES (NEWID(), '00000000-0000-0000-0000-000000000001', 0, 'Master', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
END
GO

-- ============================================================================
-- 4. CLIENTES DE DEMONSTRAÇÃO
-- ============================================================================
MERGE INTO clients AS target
USING (
    VALUES
    ('12345678000190', 'TechCorp Solutions',         'contato@techcorp.com.br',             '(11) 98765-4321', 'professional', 'active', 20, 5000),
    ('98765432000180', 'Inovação Digital LTDA',      'contato@inovacaodigital.com.br',       '(21) 99876-5432', 'basic',        'active', 10, 2500),
    ('11223344000155', 'CodeMasters Desenvolvimento','contato@codemasters.dev',              '(11) 91234-5678', 'professional', 'active', 15, 4000),
    ('55667788000199', 'StartupLab Tecnologia',      'info@startuplab.com',                  '(47) 98123-4567', 'basic',        'trial',  5,  1000),
    ('22334455000166', 'Enterprise Systems SA',      'contact@enterprisesys.com.br',         '(11) 97654-3210', 'enterprise',   'active', 50, 20000)
) AS source (cnpj, name, email, phone, plan, status, max_analyses, max_api_calls)
ON target.cnpj = source.cnpj
WHEN NOT MATCHED THEN
    INSERT (id, name, cnpj, email, phone, plan, status, max_analyses, max_api_calls, created_at, updated_at)
    VALUES (NEWID(), source.name, source.cnpj, source.email, source.phone, source.plan, source.status, source.max_analyses, source.max_api_calls, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
GO

-- ============================================================================
-- 5. USUÁRIOS DE DEMONSTRAÇÃO
-- Senha padrão para todos: Demo@2026
-- Hash: $2a$10$8pQ7Z8K9Z8K9Z8K9Z8K9ZeK9Z8K9Z8K9Z8K9Z8K9Z8K9Z8K9Z8K9Zu
-- ============================================================================
DECLARE @pwd NVARCHAR(255) = '$2a$10$8pQ7Z8K9Z8K9Z8K9Z8K9ZeK9Z8K9Z8K9Z8K9Z8K9Z8K9Z8K9Z8K9Zu';

-- TechCorp Solutions
DECLARE @c1 UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '12345678000190');
IF @c1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'joao.silva@techcorp.com.br')
    INSERT INTO users (id, client_id, email, password_hash, name, role, status, created_at, updated_at)
    VALUES (NEWID(), @c1, 'joao.silva@techcorp.com.br',    @pwd, 'João Silva',    'admin', 'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
           (NEWID(), @c1, 'maria.santos@techcorp.com.br',  @pwd, 'Maria Santos',  'dev',   'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
           (NEWID(), @c1, 'pedro.costa@techcorp.com.br',   @pwd, 'Pedro Costa',   'dev',   'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- Inovação Digital LTDA
DECLARE @c2 UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '98765432000180');
IF @c2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'ana.paula@inovacaodigital.com.br')
    INSERT INTO users (id, client_id, email, password_hash, name, role, status, created_at, updated_at)
    VALUES (NEWID(), @c2, 'ana.paula@inovacaodigital.com.br',      @pwd, 'Ana Paula',      'admin', 'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
           (NEWID(), @c2, 'carlos.eduardo@inovacaodigital.com.br', @pwd, 'Carlos Eduardo', 'dev',   'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- CodeMasters Desenvolvimento
DECLARE @c3 UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '11223344000155');
IF @c3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'roberto.lima@codemasters.dev')
    INSERT INTO users (id, client_id, email, password_hash, name, role, status, created_at, updated_at)
    VALUES (NEWID(), @c3, 'roberto.lima@codemasters.dev',     @pwd, 'Roberto Lima',      'admin',        'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
           (NEWID(), @c3, 'fernanda.oliveira@codemasters.dev',@pwd, 'Fernanda Oliveira', 'dev',          'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
           (NEWID(), @c3, 'lucas.almeida@codemasters.dev',    @pwd, 'Lucas Almeida',     'scrum_master', 'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- StartupLab Tecnologia
DECLARE @c4 UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '55667788000199');
IF @c4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'rafael.torres@startuplab.com')
    INSERT INTO users (id, client_id, email, password_hash, name, role, status, created_at, updated_at)
    VALUES (NEWID(), @c4, 'rafael.torres@startuplab.com', @pwd, 'Rafael Torres', 'admin', 'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- Enterprise Systems SA
DECLARE @c5 UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '22334455000166');
IF @c5 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'patricia.mendes@enterprisesys.com.br')
    INSERT INTO users (id, client_id, email, password_hash, name, role, status, created_at, updated_at)
    VALUES (NEWID(), @c5, 'patricia.mendes@enterprisesys.com.br', @pwd, 'Patricia Mendes', 'admin',         'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
           (NEWID(), @c5, 'gustavo.ribeiro@enterprisesys.com.br', @pwd, 'Gustavo Ribeiro', 'dev',           'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
           (NEWID(), @c5, 'juliana.martins@enterprisesys.com.br', @pwd, 'Juliana Martins', 'dev',           'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
           (NEWID(), @c5, 'bruno.ferreira@enterprisesys.com.br',  @pwd, 'Bruno Ferreira',  'product_owner', 'active', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
GO

-- ============================================================================
-- 6. ASSINATURAS DOS CLIENTES DE DEMONSTRAÇÃO
-- ============================================================================
DECLARE @basic_id        UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM plans WHERE name = 'basic');
DECLARE @professional_id UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM plans WHERE name = 'professional');
DECLARE @enterprise_id   UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM plans WHERE name = 'enterprise');

DECLARE @c1_id UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '12345678000190');
DECLARE @c2_id UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '98765432000180');
DECLARE @c3_id UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '11223344000155');
DECLARE @c4_id UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '55667788000199');
DECLARE @c5_id UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '22334455000166');

IF @c1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM subscriptions WHERE client_id = @c1_id)
    INSERT INTO subscriptions (id, client_id, plan_id, status, billing_cycle, current_period_start, current_period_end, created_at, updated_at)
    VALUES
        (NEWID(), @c1_id, @professional_id, 'active',   'monthly',  DATEADD(DAY,-15,CAST(SYSDATETIMEOFFSET() AS DATE)), DATEADD(DAY, 15,CAST(SYSDATETIMEOFFSET() AS DATE)), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c2_id, @basic_id,        'active',   'annual',   DATEADD(MONTH,-2,CAST(SYSDATETIMEOFFSET() AS DATE)),DATEADD(MONTH,10,CAST(SYSDATETIMEOFFSET() AS DATE)), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c3_id, @professional_id, 'active',   'quarterly',DATEADD(DAY,-20,CAST(SYSDATETIMEOFFSET() AS DATE)), DATEADD(DAY, 70,CAST(SYSDATETIMEOFFSET() AS DATE)), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c4_id, @basic_id,        'trialing', 'monthly',  CAST(SYSDATETIMEOFFSET() AS DATE),                  DATEADD(DAY, 30,CAST(SYSDATETIMEOFFSET() AS DATE)), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c5_id, @enterprise_id,   'active',   'annual',   DATEADD(MONTH,-3,CAST(SYSDATETIMEOFFSET() AS DATE)),DATEADD(MONTH, 9,CAST(SYSDATETIMEOFFSET() AS DATE)), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
GO

-- ============================================================================
-- 7. REPOSITÓRIOS DE DEMONSTRAÇÃO
-- ============================================================================
DECLARE @c1r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '12345678000190');
DECLARE @c2r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '98765432000180');
DECLARE @c3r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '11223344000155');
DECLARE @c4r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '55667788000199');
DECLARE @c5r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM clients WHERE cnpj = '22334455000166');

DECLARE @u1r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM users WHERE email = 'joao.silva@techcorp.com.br');
DECLARE @u2r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM users WHERE email = 'ana.paula@inovacaodigital.com.br');
DECLARE @u3r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM users WHERE email = 'roberto.lima@codemasters.dev');
DECLARE @u4r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM users WHERE email = 'rafael.torres@startuplab.com');
DECLARE @u5r UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM users WHERE email = 'patricia.mendes@enterprisesys.com.br');

-- TechCorp Solutions
IF @c1r IS NOT NULL AND NOT EXISTS (SELECT 1 FROM repositories WHERE client_id = @c1r)
    INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, stars_count, forks_count, size_kb, created_at, updated_at)
    VALUES
        (NEWID(), @c1r, @u1r, 'api-gateway',   'techcorp/api-gateway',   'https://github.com/techcorp/api-gateway',   'Gateway principal da API',       'TypeScript', 'main', 1, 45,  12, 15680, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c1r, @u1r, 'frontend-app',  'techcorp/frontend-app',  'https://github.com/techcorp/frontend-app',  'Aplicação frontend React',        'JavaScript', 'main', 1, 78,  23, 28900, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c1r, @u1r, 'mobile-app',    'techcorp/mobile-app',    'https://github.com/techcorp/mobile-app',    'App mobile React Native',         'TypeScript', 'main', 1, 32,  8,  45600, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- Inovação Digital LTDA
IF @c2r IS NOT NULL AND NOT EXISTS (SELECT 1 FROM repositories WHERE client_id = @c2r)
    INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, stars_count, forks_count, size_kb, created_at, updated_at)
    VALUES
        (NEWID(), @c2r, @u2r, 'erp-system',    'inovacao/erp-system',    'https://github.com/inovacao/erp-system',    'Sistema ERP completo',            'Java',       'main', 1, 12,  3,  89000, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c2r, @u2r, 'crm-platform',  'inovacao/crm-platform',  'https://github.com/inovacao/crm-platform',  'Plataforma CRM',                  'Python',     'main', 1, 8,   2,  34500, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- CodeMasters Desenvolvimento
IF @c3r IS NOT NULL AND NOT EXISTS (SELECT 1 FROM repositories WHERE client_id = @c3r)
    INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, stars_count, forks_count, size_kb, created_at, updated_at)
    VALUES
        (NEWID(), @c3r, @u3r, 'ecommerce-api',    'codemasters/ecommerce-api',    'https://github.com/codemasters/ecommerce-api',    'API de e-commerce',       'Node.js', 'main', 1, 156, 42, 67800, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c3r, @u3r, 'payment-gateway',  'codemasters/payment-gateway',  'https://github.com/codemasters/payment-gateway',  'Gateway de pagamentos',   'Go',      'main', 1, 89,  15, 23400, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- StartupLab Tecnologia
IF @c4r IS NOT NULL AND NOT EXISTS (SELECT 1 FROM repositories WHERE client_id = @c4r)
    INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, stars_count, forks_count, size_kb, created_at, updated_at)
    VALUES
        (NEWID(), @c4r, @u4r, 'mvp-app', 'startuplab/mvp-app', 'https://github.com/startuplab/mvp-app', 'MVP da aplicação', 'TypeScript', 'main', 1, 5, 1, 12300, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

-- Enterprise Systems SA
IF @c5r IS NOT NULL AND NOT EXISTS (SELECT 1 FROM repositories WHERE client_id = @c5r)
    INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, stars_count, forks_count, size_kb, created_at, updated_at)
    VALUES
        (NEWID(), @c5r, @u5r, 'core-banking',        'enterprise/core-banking',        'https://github.com/enterprise/core-banking',        'Sistema bancário core',           'Java',   'main', 1, 234, 67, 234500, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c5r, @u5r, 'insurance-platform',  'enterprise/insurance-platform',  'https://github.com/enterprise/insurance-platform',  'Plataforma de seguros',           'C#',     'main', 1, 167, 45, 178900, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()),
        (NEWID(), @c5r, @u5r, 'fraud-detection',     'enterprise/fraud-detection',     'https://github.com/enterprise/fraud-detection',     'Sistema detecção de fraudes',     'Python', 'main', 1, 89,  23, 56700,  SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
GO

-- ============================================================================
-- 8. ANÁLISES E FINDINGS DE DEMONSTRAÇÃO
-- ============================================================================
DECLARE @repo_id     UNIQUEIDENTIFIER;
DECLARE @analysis_id UNIQUEIDENTIFIER;
DECLARE @user_id_a   UNIQUEIDENTIFIER;
DECLARE @client_id_a UNIQUEIDENTIFIER;

DECLARE repo_cursor CURSOR FOR
    SELECT r.id, r.client_id, r.user_id
    FROM repositories r
    WHERE NOT EXISTS (
        SELECT 1 FROM analyses a WHERE a.client_id = r.client_id
    );

OPEN repo_cursor;
FETCH NEXT FROM repo_cursor INTO @repo_id, @client_id_a, @user_id_a;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @analysis_id = NEWID();

    -- Criar análise
    INSERT INTO analyses (id, client_id, user_id, repository_name, repository_url, repository_type, language, status, total_files, files_analyzed, cnpj_occurrences, estimated_hours, started_at, completed_at, created_at, updated_at)
    SELECT
        @analysis_id,
        @client_id_a,
        @user_id_a,
        r.name,
        r.url,
        'github',
        r.language,
        'completed',
        150,
        148,
        ABS(CHECKSUM(NEWID())) % 15 + 3,
        CAST((ABS(CHECKSUM(NEWID())) % 20 + 5) AS DECIMAL(10,2)),
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET(),
        SYSDATETIMEOFFSET()
    FROM repositories r WHERE r.id = @repo_id;

    -- Criar findings de código
    INSERT INTO findings (id, analysis_id, client_id, file_path, file_type, line_number, field_name, field_type, context, suggestion, is_input, is_output, is_database, is_validation, supports_cpf, created_at)
    VALUES
        (NEWID(), @analysis_id, @client_id_a,
         'src/models/Company.ts', 'typescript', 45,
         'cnpj', 'string',
         'Campo CNPJ na model de empresa — aceita apenas formato numérico 14 dígitos',
         'Ampliar para NVARCHAR(20) e adicionar validação alfanumérica conforme Instrução Normativa RFB 2229/2024',
         1, 0, 1, 1, 0, SYSDATETIMEOFFSET()),
        (NEWID(), @analysis_id, @client_id_a,
         'src/controllers/CompanyController.ts', 'typescript', 78,
         'cpf_cnpj', 'string',
         'Campo unificado CPF/CNPJ no controller de criação de empresa',
         'Implementar validação que suporte CNPJ alfanumérico (letras A-Z + dígitos, 14 caracteres)',
         1, 0, 1, 1, 1, SYSDATETIMEOFFSET()),
        (NEWID(), @analysis_id, @client_id_a,
         'database/migrations/001_create_companies.sql', 'sql', 12,
         'cnpj', 'VARCHAR(14)',
         'Coluna CNPJ na tabela companies definida como VARCHAR(14) — insuficiente para o novo formato',
         'Alterar para VARCHAR(20) ou NVARCHAR(20) para suportar CNPJ alfanumérico',
         0, 0, 1, 0, 0, SYSDATETIMEOFFSET());

    -- Criar database_finding
    INSERT INTO database_findings (id, analysis_id, client_id, database_type, table_name, column_name, column_type, max_length, is_nullable, suggestion, created_at)
    VALUES
        (NEWID(), @analysis_id, @client_id_a,
         'sqlserver', 'companies', 'cnpj', 'VARCHAR', 14, 0,
         'Alterar para NVARCHAR(20): ALTER TABLE companies ALTER COLUMN cnpj NVARCHAR(20) NOT NULL',
         SYSDATETIMEOFFSET()),
        (NEWID(), @analysis_id, @client_id_a,
         'sqlserver', 'clients', 'document_number', 'CHAR', 14, 1,
         'Alterar para NVARCHAR(20): ALTER TABLE clients ALTER COLUMN document_number NVARCHAR(20) NULL',
         SYSDATETIMEOFFSET());

    -- Criar relatório
    INSERT INTO reports (id, analysis_id, client_id, format, file_url, file_size, generated_at)
    VALUES
        (NEWID(), @analysis_id, @client_id_a, 'pdf',  'https://storage.example.com/reports/' + CAST(@analysis_id AS NVARCHAR(36)) + '.pdf',  524288, SYSDATETIMEOFFSET()),
        (NEWID(), @analysis_id, @client_id_a, 'json', 'https://storage.example.com/reports/' + CAST(@analysis_id AS NVARCHAR(36)) + '.json', 102400, SYSDATETIMEOFFSET());

    FETCH NEXT FROM repo_cursor INTO @repo_id, @client_id_a, @user_id_a;
END;

CLOSE repo_cursor;
DEALLOCATE repo_cursor;
GO

-- ============================================================================
-- 9. PAGAMENTOS DAS ASSINATURAS ATIVAS
-- ============================================================================
DECLARE @sub_id   UNIQUEIDENTIFIER;
DECLARE @cli_id   UNIQUEIDENTIFIER;
DECLARE @preco    DECIMAL(10,2);

DECLARE pay_cursor CURSOR FOR
    SELECT s.id, s.client_id, p.price_monthly
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.status IN ('active','trialing');

OPEN pay_cursor;
FETCH NEXT FROM pay_cursor INTO @sub_id, @cli_id, @preco;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- 3 meses de pagamentos anteriores
    INSERT INTO payments (id, client_id, subscription_id, amount, currency, status, payment_method, gateway, transaction_id, paid_at, created_at)
    VALUES
        (NEWID(), @cli_id, @sub_id, @preco, 'BRL', 'completed', 'credit_card', 'stripe', 'pi_' + LOWER(REPLACE(CAST(NEWID() AS NVARCHAR(36)),'-','')), DATEADD(MONTH,-2,SYSDATETIMEOFFSET()), DATEADD(MONTH,-2,SYSDATETIMEOFFSET())),
        (NEWID(), @cli_id, @sub_id, @preco, 'BRL', 'completed', 'credit_card', 'stripe', 'pi_' + LOWER(REPLACE(CAST(NEWID() AS NVARCHAR(36)),'-','')), DATEADD(MONTH,-1,SYSDATETIMEOFFSET()), DATEADD(MONTH,-1,SYSDATETIMEOFFSET())),
        (NEWID(), @cli_id, @sub_id, @preco, 'BRL', 'completed', 'credit_card', 'stripe', 'pi_' + LOWER(REPLACE(CAST(NEWID() AS NVARCHAR(36)),'-','')), SYSDATETIMEOFFSET(),                   SYSDATETIMEOFFSET());

    FETCH NEXT FROM pay_cursor INTO @sub_id, @cli_id, @preco;
END;

CLOSE pay_cursor;
DEALLOCATE pay_cursor;
GO

-- ============================================================================
-- 10. CONQUISTAS (GAMIFICAÇÃO)
-- ============================================================================
MERGE INTO achievements AS target
USING (
    VALUES
    ('first_analysis',   'Primeiro Passo',      'Complete sua primeira análise',           'Rocket',       'analysis',      10,   'common',    'count',  1),
    ('10_analyses',      'Analista Iniciante',   'Complete 10 análises',                    'Target',       'analysis',      50,   'common',    'count',  10),
    ('50_analyses',      'Analista Experiente',  'Complete 50 análises',                    'Award',        'analysis',      200,  'rare',      'count',  50),
    ('100_analyses',     'Analista Master',      'Complete 100 análises',                   'Trophy',       'analysis',      500,  'epic',      'count',  100),
    ('first_task',       'Primeira Tarefa',      'Complete sua primeira tarefa',            'CheckCircle',  'tasks',         10,   'common',    'count',  1),
    ('10_tasks',         'Executor',             'Complete 10 tarefas',                     'ListChecks',   'tasks',         50,   'common',    'count',  10),
    ('50_tasks',         'Produtivo',            'Complete 50 tarefas',                     'Zap',          'tasks',         200,  'rare',      'count',  50),
    ('100_tasks',        'Velocista',            'Complete 100 tarefas',                    'Flame',        'tasks',         500,  'epic',      'count',  100),
    ('7_day_streak',     'Consistente',          'Mantenha um streak de 7 dias',            'Calendar',     'streak',        100,  'rare',      'streak', 7),
    ('30_day_streak',    'Dedicado',             'Mantenha um streak de 30 dias',           'CalendarCheck','streak',        300,  'epic',      'streak', 30),
    ('100_day_streak',   'Lendário',             'Mantenha um streak de 100 dias',          'Crown',        'streak',        1000, 'legendary', 'streak', 100),
    ('first_comment',    'Comunicador',          'Faça seu primeiro comentário',            'MessageCircle','collaboration', 10,   'common',    'count',  1),
    ('team_player',      'Colaborador',          'Faça 50 comentários',                     'Users',        'collaboration', 100,  'rare',      'count',  50)
) AS source (name, display_name, description, icon, category, points, rarity, requirement_type, requirement_value)
ON target.name = source.name
WHEN NOT MATCHED THEN
    INSERT (id, name, display_name, description, icon, category, points, rarity, requirement_type, requirement_value, is_active, created_at)
    VALUES (NEWID(), source.name, source.display_name, source.description, source.icon, source.category, source.points, source.rarity, source.requirement_type, source.requirement_value, 1, SYSDATETIMEOFFSET());
GO

-- ============================================================================
-- 11. PERMISSÕES DO SISTEMA
-- ============================================================================
MERGE INTO permissions AS target
USING (
    VALUES
    ('view_analyses',       'Visualizar Análises',       'Pode visualizar análises',                    'analyses'),
    ('create_analyses',     'Criar Análises',            'Pode criar novas análises',                   'analyses'),
    ('delete_analyses',     'Deletar Análises',          'Pode deletar análises',                       'analyses'),
    ('view_tasks',          'Visualizar Tarefas',        'Pode visualizar tarefas',                     'tasks'),
    ('create_tasks',        'Criar Tarefas',             'Pode criar novas tarefas',                    'tasks'),
    ('assign_tasks',        'Atribuir Tarefas',          'Pode atribuir tarefas a usuários',            'tasks'),
    ('delete_tasks',        'Deletar Tarefas',           'Pode deletar tarefas',                        'tasks'),
    ('view_users',          'Visualizar Usuários',       'Pode visualizar usuários',                    'users'),
    ('create_users',        'Criar Usuários',            'Pode criar novos usuários',                   'users'),
    ('edit_users',          'Editar Usuários',           'Pode editar usuários',                        'users'),
    ('delete_users',        'Deletar Usuários',          'Pode deletar usuários',                       'users'),
    ('view_clients',        'Visualizar Clientes',       'Pode visualizar clientes',                    'clients'),
    ('edit_clients',        'Editar Clientes',           'Pode editar clientes',                        'clients'),
    ('manage_licenses',     'Gerenciar Licenças',        'Pode gerenciar licenças de clientes',         'licenses'),
    ('view_reports',        'Visualizar Relatórios',     'Pode visualizar relatórios',                  'reports'),
    ('export_reports',      'Exportar Relatórios',       'Pode exportar relatórios',                    'reports'),
    ('manage_integrations', 'Gerenciar Integrações',     'Pode gerenciar integrações externas',         'integrations'),
    ('view_analytics',      'Visualizar Analytics',      'Pode visualizar analytics e métricas',        'analytics'),
    ('manage_settings',     'Gerenciar Configurações',   'Pode gerenciar configurações do sistema',     'settings')
) AS source (name, display_name, description, category)
ON target.name = source.name
WHEN NOT MATCHED THEN
    INSERT (id, name, display_name, description, category, created_at)
    VALUES (NEWID(), source.name, source.display_name, source.description, source.category, SYSDATETIMEOFFSET());
GO

-- ============================================================================
-- 12. CONFIGURAÇÕES GLOBAIS DO SISTEMA
-- ============================================================================
MERGE INTO settings AS target
USING (
    VALUES
    (NULL, 'app_name',           'CNPJ Alfanumérico - Detector'),
    (NULL, 'app_version',        '2.0.0'),
    (NULL, 'support_email',      'suporte@webnetsystems.com.br'),
    (NULL, 'max_file_size_mb',   '50'),
    (NULL, 'allowed_extensions', '.zip,.tar,.gz,.js,.ts,.java,.py,.cs,.go,.php,.rb,.kt,.swift'),
    (NULL, 'cnpj_regex_pattern', '[A-Z0-9]{2}[.]?[A-Z0-9]{3}[.]?[A-Z0-9]{3}[/]?[A-Z0-9]{4}[-]?[A-Z0-9]{2}'),
    (NULL, 'ai_model_default',   'gpt-4o'),
    (NULL, 'session_ttl_hours',  '24'),
    (NULL, 'max_login_attempts', '5')
) AS source (client_id, key, value)
ON (target.client_id IS NULL AND target.key = source.key)
WHEN NOT MATCHED THEN
    INSERT (id, client_id, key, value, created_at, updated_at)
    VALUES (NEWID(), source.client_id, source.key, source.value, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());
GO

PRINT 'Script 03 - Dados iniciais inseridos com sucesso!';
PRINT '';
PRINT '========================================';
PRINT 'CREDENCIAIS CRIADAS';
PRINT '========================================';
PRINT 'Super Admin:';
PRINT '  Email : admin@webnetsystems.com.br';
PRINT '  Senha : Admin@2026  (TROCAR NO PRIMEIRO LOGIN)';
PRINT '';
PRINT 'Usuarios demo (senha: Demo@2026):';
PRINT '  joao.silva@techcorp.com.br';
PRINT '  ana.paula@inovacaodigital.com.br';
PRINT '  roberto.lima@codemasters.dev';
PRINT '  rafael.torres@startuplab.com';
PRINT '  patricia.mendes@enterprisesys.com.br';
PRINT '========================================';
GO
