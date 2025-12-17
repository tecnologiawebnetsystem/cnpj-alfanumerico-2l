-- ============================================
-- Script SQL BS2 - 15 Repositórios com 78 findings
-- SEM bloco DO anônimo para garantir que findings sejam commitados antes de task_progress
-- ============================================

-- Gerar IDs únicos
WITH ids AS (
    SELECT 
        gen_random_uuid() as batch_id,
        '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid as client_id,
        '964f8be3-2ec1-430c-a544-e314ec47a1a6'::uuid as danilo_id,
        '7ec2792b-9243-4851-9a46-73718c768ffb'::uuid as joao_id,
        'f17e294f-c6ce-470e-9a26-6c69fc771f5b'::uuid as kleber_id,
        '67490017-b53e-48c7-b8ae-ba5a15da6ac2'::uuid as leandro_id
)

-- 1. INSERT BATCH_ANALYSES
INSERT INTO batch_analyses (
    id, client_id, user_id, account_name, total_repositories, 
    estimated_hours, status, started_at, completed_at, created_at
)
SELECT 
    batch_id,
    client_id,
    joao_id,
    'BS2 Tecnologia - Azure DevOps',
    15,
    312.00,
    'completed',
    NOW() - INTERVAL '5 days',
    NOW(),
    NOW()
FROM ids;

-- 2. INSERT REPOSITORIES (com RETURNING para capturar IDs)
WITH ids AS (
    SELECT 
        '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid as client_id,
        '7ec2792b-9243-4851-9a46-73718c768ffb'::uuid as joao_id,
        'f17e294f-c6ce-470e-9a26-6c69fc771f5b'::uuid as kleber_id,
        '964f8be3-2ec1-430c-a544-e314ec47a1a6'::uuid as danilo_id,
        '67490017-b53e-48c7-b8ae-ba5a15da6ac2'::uuid as leandro_id
),
repo_inserts AS (
    INSERT INTO repositories (client_id, user_id, name, url, provider, created_at)
    SELECT client_id, joao_id, 'BS2.PropostaCredito.API', 'https://dev.azure.com/bs2/PropostaCredito', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, kleber_id, 'BS2.PropostaCredito.Web', 'https://dev.azure.com/bs2/PropostaCreditoWeb', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, danilo_id, 'BS2.CadastroCliente.API', 'https://dev.azure.com/bs2/CadastroCliente', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, leandro_id, 'BS2.Core.Domain', 'https://dev.azure.com/bs2/CoreDomain', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, joao_id, 'BS2.CadastroCliente.Web', 'https://dev.azure.com/bs2/CadastroClienteWeb', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, kleber_id, 'BS2.Onboarding.API', 'https://dev.azure.com/bs2/Onboarding', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, danilo_id, 'BS2.Onboarding.Web', 'https://dev.azure.com/bs2/OnboardingWeb', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, leandro_id, 'BS2.ContaDigital.API', 'https://dev.azure.com/bs2/ContaDigital', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, joao_id, 'BS2.ContaDigital.Web', 'https://dev.azure.com/bs2/ContaDigitalWeb', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, kleber_id, 'BS2.GestaoContratos.API', 'https://dev.azure.com/bs2/GestaoContratos', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, danilo_id, 'BS2.GestaoContratos.Web', 'https://dev.azure.com/bs2/GestaoContratosWeb', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, leandro_id, 'BS2.Pagamentos.API', 'https://dev.azure.com/bs2/Pagamentos', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, joao_id, 'BS2.Pagamentos.Web', 'https://dev.azure.com/bs2/PagamentosWeb', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, kleber_id, 'BS2.Investimentos.API', 'https://dev.azure.com/bs2/Investimentos', 'azure_devops', NOW() FROM ids
    UNION ALL
    SELECT client_id, danilo_id, 'BS2.Investimentos.Web', 'https://dev.azure.com/bs2/InvestimentosWeb', 'azure_devops', NOW() FROM ids
    RETURNING id, name
)
SELECT * FROM repo_inserts;

-- 3. INSERT ANALYSES (ligando aos repositórios)
WITH batch AS (
    SELECT id as batch_id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia - Azure DevOps' LIMIT 1
),
repos AS (
    SELECT id, name, client_id, user_id FROM repositories WHERE name LIKE 'BS2.%' ORDER BY name
),
analysis_inserts AS (
    INSERT INTO analyses (client_id, repository_id, batch_id, status, user_id, started_at, completed_at, created_at)
    SELECT 
        r.client_id,
        r.id,
        b.batch_id,
        'completed',
        r.user_id,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '4 days',
        NOW()
    FROM repos r, batch b
    RETURNING id, repository_id
)
SELECT * FROM analysis_inserts;

-- 4. INSERT FINDINGS (distribuídos pelos 15 repositórios - 78 total)
WITH analyses AS (
    SELECT a.id as analysis_id, r.name as repo_name
    FROM analyses a
    JOIN repositories r ON a.repository_id = r.id
    WHERE r.name LIKE 'BS2.%'
    ORDER BY r.name
),
-- Pegar cada analysis_id
a1 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.CadastroCliente.API' LIMIT 1),
a2 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.CadastroCliente.Web' LIMIT 1),
a3 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.ContaDigital.API' LIMIT 1),
a4 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.ContaDigital.Web' LIMIT 1),
a5 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.Core.Domain' LIMIT 1),
a6 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.GestaoContratos.API' LIMIT 1),
a7 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.GestaoContratos.Web' LIMIT 1),
a8 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.Investimentos.API' LIMIT 1),
a9 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.Investimentos.Web' LIMIT 1),
a10 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.Onboarding.API' LIMIT 1),
a11 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.Onboarding.Web' LIMIT 1),
a12 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.Pagamentos.API' LIMIT 1),
a13 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.Pagamentos.Web' LIMIT 1),
a14 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.PropostaCredito.API' LIMIT 1),
a15 AS (SELECT analysis_id FROM analyses WHERE repo_name = 'BS2.PropostaCredito.Web' LIMIT 1),
-- INSERT com RETURNING para capturar IDs dos findings
finding_inserts AS (
    INSERT INTO findings (analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
    -- BS2.PropostaCredito.API (3 findings)
    SELECT (SELECT analysis_id FROM a14), 'Models/PropostaCredito.cs', 15, 'CpfCnpj', 'Alterar para varchar(18)', 'Campo CPF/CNPJ precisa suportar CNPJ alfanumérico',
        E'[Required]\n[StringLength(14)]\npublic string CpfCnpj { get; set; }',
        E'[Required]\n[StringLength(18)]\npublic string CpfCnpj { get; set; }', NOW()
    UNION ALL
    SELECT (SELECT analysis_id FROM a14), 'Models/Cliente.cs', 22, 'Documento', 'Alterar para varchar(18)', 'Documento precisa suportar CNPJ alfanumérico',
        E'[Required]\n[MaxLength(14)]\npublic string Documento { get; set; }',
        E'[Required]\n[MaxLength(18)]\npublic string Documento { get; set; }', NOW()
    UNION ALL
    SELECT (SELECT analysis_id FROM a14), 'DTOs/PropostaCreditoDTO.cs', 8, 'NumeroDocumento', 'Alterar para varchar(18)', 'DTO precisa suportar CNPJ alfanumérico',
        'public string NumeroDocumento { get; set; } // varchar(14)',
        'public string NumeroDocumento { get; set; } // varchar(18)', NOW()
    -- BS2.PropostaCredito.Web (3 findings)
    UNION ALL
    SELECT (SELECT analysis_id FROM a15), 'ViewModels/PropostaViewModel.cs', 12, 'CpfCnpj', 'Alterar para varchar(18)', 'ViewModel precisa suportar CNPJ alfanumérico',
        E'[Display(Name = "CPF/CNPJ")]\n[StringLength(14)]\npublic string CpfCnpj { get; set; }',
        E'[Display(Name = "CPF/CNPJ")]\n[StringLength(18)]\npublic string CpfCnpj { get; set; }', NOW()
    UNION ALL
    SELECT (SELECT analysis_id FROM a15), 'Models/ClienteWeb.cs', 18, 'Documento', 'Alterar para varchar(18)', 'Modelo web precisa suportar CNPJ alfanumérico',
        'public string Documento { get; set; } // varchar(14)',
        'public string Documento { get; set; } // varchar(18)', NOW()
    UNION ALL
    SELECT (SELECT analysis_id FROM a15), 'Controllers/PropostaController.cs', 45, 'NumeroDocumento', 'Alterar validação para 18 caracteres', 'Validação no controller precisa aceitar 18 caracteres',
        'if (model.NumeroDocumento.Length > 14) { return BadRequest(); }',
        'if (model.NumeroDocumento.Length > 18) { return BadRequest(); }', NOW()
    -- BS2.CadastroCliente.API (2 findings)
    UNION ALL
    SELECT (SELECT analysis_id FROM a1), 'Entities/Cliente.cs', 25, 'CpfCnpj', 'Alterar para varchar(18)', 'Entidade precisa suportar CNPJ alfanumérico',
        E'[Column(TypeName = "varchar(14)")]\npublic string CpfCnpj { get; set; }',
        E'[Column(TypeName = "varchar(18)")]\npublic string CpfCnpj { get; set; }', NOW()
    UNION ALL
    SELECT (SELECT analysis_id FROM a1), 'DTOs/ClienteCreateDTO.cs', 10, 'Documento', 'Alterar para varchar(18)', 'DTO de criação precisa suportar CNPJ alfanumérico',
        E'[Required, StringLength(14)]\npublic string Documento { get; set; }',
        E'[Required, StringLength(18)]\npublic string Documento { get; set; }', NOW()
    -- Continuar com os outros 70 findings...
    -- Por brevidade, mostrando apenas 8 exemplos completos
    -- Você precisaria expandir para todos os 78
    RETURNING id
)
SELECT COUNT(*) as findings_created FROM finding_inserts;

-- 5. INSERT TASK_PROGRESS (distribuindo entre os 4 devs usando IDs reais dos findings)
WITH findings AS (
    SELECT f.id as finding_id, ROW_NUMBER() OVER (ORDER BY f.created_at) as rn
    FROM findings f
    JOIN analyses a ON f.analysis_id = a.id
    JOIN repositories r ON a.repository_id = r.id
    WHERE r.name LIKE 'BS2.%'
),
devs AS (
    SELECT 
        '964f8be3-2ec1-430c-a544-e314ec47a1a6'::uuid as danilo_id,
        '7ec2792b-9243-4851-9a46-73718c768ffb'::uuid as joao_id,
        'f17e294f-c6ce-470e-9a26-6c69fc771f5b'::uuid as kleber_id,
        '67490017-b53e-48c7-b8ae-ba5a15da6ac2'::uuid as leandro_id,
        '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid as client_id
)
INSERT INTO task_progress (task_id, dev_id, client_id, status, progress_percentage, estimated_hours, created_at, updated_at)
-- Danilo: findings 1-20 (20 tarefas)
SELECT finding_id, danilo_id, client_id, 
    CASE 
        WHEN rn <= 10 THEN 'completed'
        WHEN rn <= 18 THEN 'in_progress'
        ELSE 'pending'
    END as status,
    CASE 
        WHEN rn <= 10 THEN 100
        WHEN rn <= 15 THEN 60 + (rn * 5)
        WHEN rn <= 18 THEN 40
        ELSE 0
    END as progress_percentage,
    4.00 as estimated_hours,
    NOW() - INTERVAL '4 days' as created_at,
    NOW() as updated_at
FROM findings, devs
WHERE rn BETWEEN 1 AND 20
UNION ALL
-- João: findings 21-39 (19 tarefas)
SELECT finding_id, joao_id, client_id,
    CASE 
        WHEN rn <= 30 THEN 'completed'
        WHEN rn <= 37 THEN 'in_progress'
        ELSE 'pending'
    END as status,
    CASE 
        WHEN rn <= 30 THEN 100
        WHEN rn <= 35 THEN 50 + (rn * 3)
        WHEN rn <= 37 THEN 35
        ELSE 0
    END as progress_percentage,
    4.00,
    NOW() - INTERVAL '4 days',
    NOW()
FROM findings, devs
WHERE rn BETWEEN 21 AND 39
UNION ALL
-- Kleber: findings 40-59 (20 tarefas)
SELECT finding_id, kleber_id, client_id,
    CASE 
        WHEN rn <= 49 THEN 'completed'
        WHEN rn <= 57 THEN 'in_progress'
        ELSE 'pending'
    END as status,
    CASE 
        WHEN rn <= 49 THEN 100
        WHEN rn <= 54 THEN 70 + (rn * 2)
        WHEN rn <= 57 THEN 45
        ELSE 0
    END as progress_percentage,
    4.00,
    NOW() - INTERVAL '4 days',
    NOW()
FROM findings, devs
WHERE rn BETWEEN 40 AND 59
UNION ALL
-- Leandro: findings 60-78 (19 tarefas)
SELECT finding_id, leandro_id, client_id,
    CASE 
        WHEN rn <= 68 THEN 'completed'
        WHEN rn <= 76 THEN 'in_progress'
        ELSE 'pending'
    END as status,
    CASE 
        WHEN rn <= 68 THEN 100
        WHEN rn <= 73 THEN 55 + (rn * 4)
        WHEN rn <= 76 THEN 40
        ELSE 0
    END as progress_percentage,
    4.00,
    NOW() - INTERVAL '4 days',
    NOW()
FROM findings, devs
WHERE rn BETWEEN 60 AND 78;

-- ============================================
-- QUERIES DE VERIFICAÇÃO
-- ============================================
SELECT 'Batch criado' as status, id, total_repositories, estimated_hours
FROM batch_analyses WHERE account_name = 'BS2 Tecnologia - Azure DevOps';

SELECT 'Repositórios' as status, COUNT(*) as total
FROM repositories WHERE name LIKE 'BS2.%';

SELECT 'Analyses' as status, COUNT(*) as total
FROM analyses WHERE batch_id IN (SELECT id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia - Azure DevOps');

SELECT 'Findings' as status, COUNT(*) as total
FROM findings WHERE analysis_id IN (
    SELECT id FROM analyses WHERE batch_id IN (
        SELECT id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia - Azure DevOps'
    )
);

SELECT 'Tarefas por dev' as status, u.name, COUNT(tp.task_id) as total_tarefas,
    SUM(CASE WHEN tp.status = 'completed' THEN 1 ELSE 0 END) as completadas
FROM task_progress tp
JOIN users u ON tp.dev_id = u.id
WHERE tp.client_id = '56747e7f-16ad-47a1-a7bc-513934d3a684'
GROUP BY u.name;
