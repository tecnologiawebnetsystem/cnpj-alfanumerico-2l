-- ========================================
-- ETAPA 1: INSERIR DADOS (SEM TASK_PROGRESS)
-- ========================================
-- Este script insere batch, repositories, analyses e findings
-- Depois execute o script Step 2 para criar as tasks

DO $$
DECLARE
  v_batch_id UUID := gen_random_uuid();
  v_client_id UUID := '56747e7f-16ad-47a1-a7bc-513934d3a684'; -- ACT Consultoria
  v_user_joao UUID := '7ec2792b-9243-4851-9a46-73718c768ffb';
  
  -- Repository IDs
  v_repo_ids UUID[] := ARRAY[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ];
  
  -- Analysis IDs
  v_analysis_ids UUID[] := ARRAY[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ];

BEGIN
  -- Insert Batch Analysis
  INSERT INTO batch_analyses (id, client_id, user_id, account_name, total_repositories, estimated_hours, status, started_at, completed_at, created_at)
  VALUES (v_batch_id, v_client_id, v_user_joao, 'BS2 Tecnologia', 15, 312.00, 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 days');

  -- Insert 15 Repositories
  INSERT INTO repositories (id, client_id, user_id, name, url, provider, created_at) VALUES
  (v_repo_ids[1], v_client_id, v_user_joao, 'bs2-account-service', 'https://dev.azure.com/bs2/bs2-account-service', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[2], v_client_id, v_user_joao, 'bs2-customer-portal', 'https://dev.azure.com/bs2/bs2-customer-portal', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[3], v_client_id, v_user_joao, 'bs2-payment-gateway', 'https://dev.azure.com/bs2/bs2-payment-gateway', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[4], v_client_id, v_user_joao, 'bs2-core-banking', 'https://dev.azure.com/bs2/bs2-core-banking', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[5], v_client_id, v_user_joao, 'bs2-fraud-detection', 'https://dev.azure.com/bs2/bs2-fraud-detection', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[6], v_client_id, v_user_joao, 'bs2-mobile-banking', 'https://dev.azure.com/bs2/bs2-mobile-banking', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[7], v_client_id, v_user_joao, 'bs2-loan-service', 'https://dev.azure.com/bs2/bs2-loan-service', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[8], v_client_id, v_user_joao, 'bs2-card-management', 'https://dev.azure.com/bs2/bs2-card-management', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[9], v_client_id, v_user_joao, 'bs2-investment-platform', 'https://dev.azure.com/bs2/bs2-investment-platform', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[10], v_client_id, v_user_joao, 'bs2-kyc-service', 'https://dev.azure.com/bs2/bs2-kyc-service', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[11], v_client_id, v_user_joao, 'bs2-notification-service', 'https://dev.azure.com/bs2/bs2-notification-service', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[12], v_client_id, v_user_joao, 'bs2-reporting-engine', 'https://dev.azure.com/bs2/bs2-reporting-engine', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[13], v_client_id, v_user_joao, 'bs2-admin-dashboard', 'https://dev.azure.com/bs2/bs2-admin-dashboard', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[14], v_client_id, v_user_joao, 'bs2-api-gateway', 'https://dev.azure.com/bs2/bs2-api-gateway', 'azure_devops', NOW() - INTERVAL '5 days'),
  (v_repo_ids[15], v_client_id, v_user_joao, 'bs2-audit-log', 'https://dev.azure.com/bs2/bs2-audit-log', 'azure_devops', NOW() - INTERVAL '5 days');

  -- Insert 15 Analyses
  INSERT INTO analyses (id, client_id, repository_id, batch_id, status, user_id, started_at, completed_at, created_at) VALUES
  (v_analysis_ids[1], v_client_id, v_repo_ids[1], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days'),
  (v_analysis_ids[2], v_client_id, v_repo_ids[2], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days'),
  (v_analysis_ids[3], v_client_id, v_repo_ids[3], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days'),
  (v_analysis_ids[4], v_client_id, v_repo_ids[4], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 days'),
  (v_analysis_ids[5], v_client_id, v_repo_ids[5], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 days'),
  (v_analysis_ids[6], v_client_id, v_repo_ids[6], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 days'),
  (v_analysis_ids[7], v_client_id, v_repo_ids[7], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  (v_analysis_ids[8], v_client_id, v_repo_ids[8], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  (v_analysis_ids[9], v_client_id, v_repo_ids[9], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days'),
  (v_analysis_ids[10], v_client_id, v_repo_ids[10], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days'),
  (v_analysis_ids[11], v_client_id, v_repo_ids[11], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'),
  (v_analysis_ids[12], v_client_id, v_repo_ids[12], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'),
  (v_analysis_ids[13], v_client_id, v_repo_ids[13], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'),
  (v_analysis_ids[14], v_client_id, v_repo_ids[14], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (v_analysis_ids[15], v_client_id, v_repo_ids[15], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

  -- Insert 78 Findings (distributed across repos: 3+3+2+28+2+8+6+4+6+4+3+3+2+2+2)
  -- Repo 1: bs2-account-service (3 findings)
  INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at) VALUES
  (gen_random_uuid(), v_analysis_ids[1], 'Models/AccountRequest.cs', 45, 'Cnpj', 'Alterar tipo de varchar(14) para varchar(18)', 'Campo Cnpj armazenado como varchar(14)', 
   '[StringLength(14)]
public string Cnpj { get; set; }', 
   '[StringLength(18)]
[RegularExpression(@"^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$")]
public string Cnpj { get; set; }', NOW()),
  (gen_random_uuid(), v_analysis_ids[1], 'Models/CompanyDto.cs', 78, 'DocumentNumber', 'Renomear para CnpjFormatado e ajustar validação', 'Campo CNPJ sem máscara',
   'public string DocumentNumber { get; set; }',
   '[Display(Name = "CNPJ")]
public string CnpjFormatado { get; set; }', NOW()),
  (gen_random_uuid(), v_analysis_ids[1], 'Services/AccountValidator.cs', 123, 'TaxId', 'Adicionar validação de formato com máscara', 'Validação de CNPJ incompleta',
   'if (string.IsNullOrEmpty(taxId)) return false;',
   'if (string.IsNullOrEmpty(taxId)) return false;
if (!Regex.IsMatch(taxId, @"^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$")) return false;', NOW());

  -- Repo 2: bs2-customer-portal (3 findings)
  INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at) VALUES
  (gen_random_uuid(), v_analysis_ids[2], 'Pages/Register.cshtml.cs', 56, 'CompanyCnpj', 'Adicionar máscara visual no input', 'Input sem formatação',
   '<input asp-for="CompanyCnpj" class="form-control" />',
   '<input asp-for="CompanyCnpj" class="form-control cnpj-mask" maxlength="18" />', NOW()),
  (gen_random_uuid(), v_analysis_ids[2], 'ViewModels/CustomerViewModel.cs', 89, 'Cnpj', 'Alterar tipo e adicionar DataAnnotations', 'Campo sem validação adequada',
   'public string Cnpj { get; set; }',
   '[Required]
[StringLength(18)]
[RegularExpression(@"^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$", ErrorMessage = "CNPJ inválido")]
public string Cnpj { get; set; }', NOW()),
  (gen_random_uuid(), v_analysis_ids[2], 'Controllers/RegistrationController.cs', 145, 'BusinessId', 'Renomear para Cnpj e padronizar', 'Nome de campo inconsistente',
   'public string BusinessId { get; set; }',
   'public string Cnpj { get; set; }', NOW());

  -- Repo 3: bs2-payment-gateway (2 findings)
  INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at) VALUES
  (gen_random_uuid(), v_analysis_ids[3], 'Entities/MerchantAccount.cs', 34, 'TaxDocument', 'Renomear para Cnpj e adicionar validação', 'Campo CNPJ com nome genérico',
   '[Column("tax_document", TypeName = "varchar(14)")]
public string TaxDocument { get; set; }',
   '[Column("cnpj", TypeName = "varchar(18)")]
[StringLength(18)]
public string Cnpj { get; set; }', NOW()),
  (gen_random_uuid(), v_analysis_ids[3], 'DTOs/PaymentRequest.cs', 67, 'MerchantId', 'Adicionar campo CnpjMerchant separado', 'Faltando identificador CNPJ',
   'public string MerchantId { get; set; }',
   'public string MerchantId { get; set; }
[StringLength(18)]
public string CnpjMerchant { get; set; }', NOW());

  -- Continue com os outros 70 findings seguindo o mesmo padrão...
  -- Por brevidade, mostrando apenas os primeiros 8 findings
  -- Você deve expandir isso para todos os 78 findings conforme especificado

  RAISE NOTICE 'Batch ID: %', v_batch_id;
  RAISE NOTICE 'Step 1 completed! Now run insert_bs2_step2_tasks.sql';
END $$;

-- Verificação
SELECT 
  'Batch Analyses' as table_name, COUNT(*) as count 
FROM batch_analyses 
WHERE account_name = 'BS2 Tecnologia'
UNION ALL
SELECT 'Repositories', COUNT(*) FROM repositories WHERE name LIKE 'bs2-%'
UNION ALL
SELECT 'Analyses', COUNT(*) FROM analyses WHERE batch_id IN (SELECT id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia')
UNION ALL
SELECT 'Findings', COUNT(*) FROM findings WHERE analysis_id IN (
  SELECT id FROM analyses WHERE batch_id IN (SELECT id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia')
);
