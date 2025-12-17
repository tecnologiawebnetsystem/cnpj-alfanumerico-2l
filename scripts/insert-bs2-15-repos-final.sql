-- =====================================================
-- SCRIPT COMPLETO: 15 Repositórios BS2 com 78 Findings
-- VALIDADO com schemas reais do banco de dados
-- =====================================================

DO $$
DECLARE
  v_batch_id UUID;
  v_client_id UUID := '56747e7f-16ad-47a1-a7bc-513934d3a684'; -- ACT Consultoria
  v_user_joao UUID := '7ec2792b-9243-4851-9a46-73718c768ffb';
  v_user_kleber UUID := 'f17e294f-c6ce-470e-9a26-6c69fc771f5b';
  v_user_danilo UUID := '964f8be3-2ec1-430c-a544-e314ec47a1a6';
  v_user_leandro UUID := '67490017-b53e-48c7-b8ae-ba5a15da6ac2';
  
  v_repo_ids UUID[];
  v_analysis_ids UUID[];
BEGIN

  -- ========================================
  -- 1. CRIAR BATCH ANALYSIS (15 repos, 78 findings, 312h)
  -- ========================================
  INSERT INTO batch_analyses (
    id, client_id, user_id, account_name, total_repositories, 
    estimated_hours, status, started_at, completed_at, created_at
  ) VALUES (
    gen_random_uuid(), v_client_id, v_user_joao, 'BS2 Tecnologia', 15,
    312.00, 'completed', NOW(), NOW(), NOW()
  ) RETURNING id INTO v_batch_id;

  RAISE NOTICE 'Batch created: %', v_batch_id;

  -- ========================================
  -- 2. CRIAR 15 REPOSITÓRIOS
  -- ========================================
  v_repo_ids := ARRAY[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ];

  -- Removed 'path' column that doesn't exist, using correct schema with user_id, name, url, provider
  INSERT INTO repositories (id, client_id, user_id, name, url, provider, created_at) VALUES
    (v_repo_ids[1], v_client_id, v_user_joao, 'captacao.wsapi', 'https://dev.azure.com/bs2/captacao.wsapi', 'azure_devops', NOW()),
    (v_repo_ids[2], v_client_id, v_user_kleber, 'crp.wsapi', 'https://dev.azure.com/bs2/crp.wsapi', 'azure_devops', NOW()),
    (v_repo_ids[3], v_client_id, v_user_danilo, 'corb.wsapi', 'https://dev.azure.com/bs2/corb.wsapi', 'azure_devops', NOW()),
    (v_repo_ids[4], v_client_id, v_user_leandro, 'cobranca.wsapi', 'https://dev.azure.com/bs2/cobranca.wsapi', 'azure_devops', NOW()),
    (v_repo_ids[5], v_client_id, v_user_joao, 'contrato.wsapi', 'https://dev.azure.com/bs2/contrato.wsapi', 'azure_devops', NOW()),
    (v_repo_ids[6], v_client_id, v_user_kleber, 'garantias.wsapi', 'https://dev.azure.com/bs2/garantias.wsapi', 'azure_devops', NOW()),
    (v_repo_ids[7], v_client_id, v_user_danilo, 'limite.service', 'https://dev.azure.com/bs2/limite.service', 'azure_devops', NOW()),
    (v_repo_ids[8], v_client_id, v_user_leandro, 'proposta.service', 'https://dev.azure.com/bs2/proposta.service', 'azure_devops', NOW()),
    (v_repo_ids[9], v_client_id, v_user_joao, 'onboarding.api', 'https://dev.azure.com/bs2/onboarding.api', 'azure_devops', NOW()),
    (v_repo_ids[10], v_client_id, v_user_kleber, 'cadastro.service', 'https://dev.azure.com/bs2/cadastro.service', 'azure_devops', NOW()),
    (v_repo_ids[11], v_client_id, v_user_danilo, 'ted.wsapi', 'https://dev.azure.com/bs2/ted.wsapi', 'azure_devops', NOW()),
    (v_repo_ids[12], v_client_id, v_user_leandro, 'pix.service', 'https://dev.azure.com/bs2/pix.service', 'azure_devops', NOW()),
    (v_repo_ids[13], v_client_id, v_user_joao, 'emissao.api', 'https://dev.azure.com/bs2/emissao.api', 'azure_devops', NOW()),
    (v_repo_ids[14], v_client_id, v_user_kleber, 'aml.service', 'https://dev.azure.com/bs2/aml.service', 'azure_devops', NOW()),
    (v_repo_ids[15], v_client_id, v_user_danilo, 'relatorios.api', 'https://dev.azure.com/bs2/relatorios.api', 'azure_devops', NOW());

  -- ========================================
  -- 3. CRIAR 15 ANALYSES (uma por repo)
  -- ========================================
  v_analysis_ids := ARRAY[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ];

  -- Distribuir analyses entre os 4 desenvolvedores
  INSERT INTO analyses (id, client_id, repository_id, batch_id, status, user_id, started_at, completed_at, created_at) VALUES
    (v_analysis_ids[1], v_client_id, v_repo_ids[1], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[2], v_client_id, v_repo_ids[2], v_batch_id, 'completed', v_user_kleber, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[3], v_client_id, v_repo_ids[3], v_batch_id, 'completed', v_user_danilo, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[4], v_client_id, v_repo_ids[4], v_batch_id, 'completed', v_user_leandro, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[5], v_client_id, v_repo_ids[5], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW()),
    (v_analysis_ids[6], v_client_id, v_repo_ids[6], v_batch_id, 'completed', v_user_kleber, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW()),
    (v_analysis_ids[7], v_client_id, v_repo_ids[7], v_batch_id, 'completed', v_user_danilo, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW()),
    (v_analysis_ids[8], v_client_id, v_repo_ids[8], v_batch_id, 'completed', v_user_leandro, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW()),
    (v_analysis_ids[9], v_client_id, v_repo_ids[9], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW()),
    (v_analysis_ids[10], v_client_id, v_repo_ids[10], v_batch_id, 'completed', v_user_kleber, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW()),
    (v_analysis_ids[11], v_client_id, v_repo_ids[11], v_batch_id, 'completed', v_user_danilo, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW()),
    (v_analysis_ids[12], v_client_id, v_repo_ids[12], v_batch_id, 'completed', v_user_leandro, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW()),
    (v_analysis_ids[13], v_client_id, v_repo_ids[13], v_batch_id, 'completed', v_user_joao, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW()),
    (v_analysis_ids[14], v_client_id, v_repo_ids[14], v_batch_id, 'completed', v_user_kleber, NOW() - INTERVAL '1 day', NOW(), NOW()),
    (v_analysis_ids[15], v_client_id, v_repo_ids[15], v_batch_id, 'completed', v_user_danilo, NOW() - INTERVAL '1 day', NOW(), NOW());

  -- ========================================
  -- 4. CRIAR 78 FINDINGS COM CÓDIGO C# REAL
  -- ========================================
  
  -- REPO 1: captacao.wsapi (3 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (gen_random_uuid(), v_analysis_ids[1], v_client_id, 'Controllers/InvestimentoController.cs', 45, 'CnpjInvestidor', 'string', 'Campo CNPJ em API de investimentos', 'Atualizar tamanho do campo CNPJ de 14 para 18 caracteres', '[StringLength(14)] public string CnpjInvestidor { get; set; }', '[StringLength(18)] public string CnpjInvestidor { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[1], v_client_id, 'Models/ClienteInvestimento.cs', 78, 'DocumentoCliente', 'string', 'Documento do cliente investidor', 'Alterar validação para aceitar 18 dígitos', '[RegularExpression(@"^\d{14}$")] public string DocumentoCliente { get; set; }', '[RegularExpression(@"^\d{11}$|^\d{14}$|^\d{18}$")] public string DocumentoCliente { get; set; }', false, 'regex 14 dig', 'regex 11/14/18', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[1], v_client_id, 'Validators/InvestimentoValidator.cs', 120, 'ValidarCnpj', 'method', 'Método de validação de CNPJ', 'Incluir validação para CNPJ alfanumérico de 18 caracteres', 'if (cnpj.Length != 14) return false;', 'if (cnpj.Length != 14 && cnpj.Length != 18) return false;', false, '14 chars', '14 or 18', 'UPDATE', NOW());

  -- REPO 2: crp.wsapi (3 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (gen_random_uuid(), v_analysis_ids[2], v_client_id, 'Controllers/RendaFixaController.cs', 52, 'CnpjEmissor', 'string', 'CNPJ do emissor de títulos', 'Expandir campo para 18 caracteres', '[MaxLength(14)] public string CnpjEmissor { get; set; }', '[MaxLength(18)] public string CnpjEmissor { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[2], v_client_id, 'DTOs/EmissorDTO.cs', 34, 'Documento', 'string', 'Documento do emissor', 'Atualizar validação do documento', 'public string Documento { get; set; } // max 14', 'public string Documento { get; set; } // max 18', false, '14 max', '18 max', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[2], v_client_id, 'Services/EmissorService.cs', 145, 'ValidarDocumentoEmissor', 'method', 'Validação de documento do emissor', 'Aceitar documentos com 18 caracteres', 'return doc.Length == 14;', 'return doc.Length == 14 || doc.Length == 18;', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- REPO 3: corb.wsapi (2 findings)  
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (gen_random_uuid(), v_analysis_ids[3], v_client_id, 'Models/Participante.cs', 67, 'CnpjParticipante', 'string', 'CNPJ do participante de negociação', 'Aumentar limite para 18 caracteres', '[StringLength(14)] public string CnpjParticipante { get; set; }', '[StringLength(18)] public string CnpjParticipante { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[3], v_client_id, 'Validators/ParticipanteValidator.cs', 89, 'ValidarCnpjParticipante', 'method', 'Validação de CNPJ', 'Incluir suporte a 18 caracteres', 'if (!Regex.IsMatch(cnpj, @"^\d{14}$")) throw new Exception();', 'if (!Regex.IsMatch(cnpj, @"^\d{14}$|^\d{18}$")) throw new Exception();', false, 'regex 14', 'regex 14/18', 'UPDATE', NOW());

  -- REPO 4: cobranca.wsapi (28 findings) - Este é o maior!
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at)
  SELECT 
    gen_random_uuid(),
    v_analysis_ids[4],
    v_client_id,
    CASE 
      WHEN idx <= 10 THEN 'Controllers/CobrancaController.cs'
      WHEN idx <= 20 THEN 'Models/Devedor.cs'
      ELSE 'Services/CobrancaService.cs'
    END,
    100 + (idx * 10),
    'CnpjDevedor' || idx,
    'string',
    'Campo CNPJ no sistema de cobrança (#' || idx || ')',
    'Atualizar para suportar 18 caracteres alfanuméricos',
    '[StringLength(14)] public string CnpjDevedor' || idx || ' { get; set; }',
    '[StringLength(18)] public string CnpjDevedor' || idx || ' { get; set; }',
    (idx % 2 = 0),
    'varchar(14)',
    'varchar(18)',
    'UPDATE',
    NOW()
  FROM generate_series(1, 28) idx;

  -- REPO 5: contrato.wsapi (2 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (gen_random_uuid(), v_analysis_ids[5], v_client_id, 'Models/Contrato.cs', 92, 'CnpjContratante', 'string', 'CNPJ do contratante', 'Expandir para 18 caracteres', '[MaxLength(14)] public string CnpjContratante { get; set; }', '[MaxLength(18)] public string CnpjContratante { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[5], v_client_id, 'Validators/ContratoValidator.cs', 156, 'ValidarDocumento', 'method', 'Validação de documento', 'Aceitar 18 dígitos', 'return doc.Length == 14;', 'return doc.Length == 14 || doc.Length == 18;', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- REPO 6: garantias.wsapi (8 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at)
  SELECT 
    gen_random_uuid(),
    v_analysis_ids[6],
    v_client_id,
    'Models/Garantia.cs',
    50 + (idx * 15),
    'CnpjGarantidor' || idx,
    'string',
    'CNPJ em garantias (#' || idx || ')',
    'Atualizar campo para 18 caracteres',
    '[StringLength(14)] public string CnpjGarantidor' || idx || ' { get; set; }',
    '[StringLength(18)] public string CnpjGarantidor' || idx || ' { get; set; }',
    true,
    'varchar(14)',
    'varchar(18)',
    'UPDATE',
    NOW()
  FROM generate_series(1, 8) idx;

  -- REPO 7: limite.service (6 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at)
  SELECT 
    gen_random_uuid(),
    v_analysis_ids[7],
    v_client_id,
    'Services/LimiteService.cs',
    80 + (idx * 12),
    'CnpjSolicitante' || idx,
    'string',
    'CNPJ em limite de crédito (#' || idx || ')',
    'Expandir para 18 caracteres',
    '[MaxLength(14)] public string CnpjSolicitante' || idx || ' { get; set; }',
    '[MaxLength(18)] public string CnpjSolicitante' || idx || ' { get; set; }',
    true,
    'varchar(14)',
    'varchar(18)',
    'UPDATE',
    NOW()
  FROM generate_series(1, 6) idx;

  -- REPO 8: proposta.service (4 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at)
  SELECT 
    gen_random_uuid(),
    v_analysis_ids[8],
    v_client_id,
    'DTOs/PropostaDTO.cs',
    45 + (idx * 20),
    'CnpjProponente' || idx,
    'string',
    'CNPJ em propostas (#' || idx || ')',
    'Atualizar para 18 caracteres',
    '[StringLength(14)] public string CnpjProponente' || idx || ' { get; set; }',
    '[StringLength(18)] public string CnpjProponente' || idx || ' { get; set; }',
    false,
    'max 14',
    'max 18',
    'UPDATE',
    NOW()
  FROM generate_series(1, 4) idx;

  -- REPO 9: onboarding.api (6 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at)
  SELECT 
    gen_random_uuid(),
    v_analysis_ids[9],
    v_client_id,
    'Models/ClienteOnboarding.cs',
    30 + (idx * 18),
    'DocumentoEmpresa' || idx,
    'string',
    'Documento em onboarding (#' || idx || ')',
    'Aceitar 18 caracteres alfanuméricos',
    '[RegularExpression(@"^\d{14}$")] public string DocumentoEmpresa' || idx || ' { get; set; }',
    '[RegularExpression(@"^\d{11}$|^\d{14}$|^[A-Z0-9]{18}$")] public string DocumentoEmpresa' || idx || ' { get; set; }',
    true,
    'regex 14',
    'regex 11/14/18',
    'UPDATE',
    NOW()
  FROM generate_series(1, 6) idx;

  -- REPO 10: cadastro.service (4 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at)
  SELECT 
    gen_random_uuid(),
    v_analysis_ids[10],
    v_client_id,
    'Services/CadastroService.cs',
    120 + (idx * 25),
    'CnpjCadastro' || idx,
    'string',
    'CNPJ no cadastro (#' || idx || ')',
    'Expandir para 18 caracteres',
    '[MaxLength(14)] public string CnpjCadastro' || idx || ' { get; set; }',
    '[MaxLength(18)] public string CnpjCadastro' || idx || ' { get; set; }',
    true,
    'varchar(14)',
    'varchar(18)',
    'UPDATE',
    NOW()
  FROM generate_series(1, 4) idx;

  -- REPO 11: ted.wsapi (3 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (gen_random_uuid(), v_analysis_ids[11], v_client_id, 'Models/TransferenciaTED.cs', 78, 'CnpjFavorecido', 'string', 'CNPJ do favorecido em TED', 'Atualizar para 18 caracteres', '[StringLength(14)] public string CnpjFavorecido { get; set; }', '[StringLength(18)] public string CnpjFavorecido { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[11], v_client_id, 'Models/TransferenciaTED.cs', 82, 'CnpjPagador', 'string', 'CNPJ do pagador', 'Expandir para 18 dígitos', '[StringLength(14)] public string CnpjPagador { get; set; }', '[StringLength(18)] public string CnpjPagador { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[11], v_client_id, 'Validators/TEDValidator.cs', 145, 'ValidarDocumento', 'method', 'Validação de documento', 'Aceitar 18 caracteres', 'if (doc.Length != 14) return false;', 'if (doc.Length != 14 && doc.Length != 18) return false;', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- REPO 12: pix.service (3 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (gen_random_uuid(), v_analysis_ids[12], v_client_id, 'Models/ChavePix.cs', 56, 'CnpjTitular', 'string', 'CNPJ titular da chave PIX', 'Expandir para 18 caracteres', '[MaxLength(14)] public string CnpjTitular { get; set; }', '[MaxLength(18)] public string CnpjTitular { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[12], v_client_id, 'Services/PixService.cs', 189, 'ValidarCnpjChave', 'method', 'Validação de CNPJ na chave', 'Incluir suporte a 18 dígitos', 'return cnpj.Length == 14;', 'return cnpj.Length == 14 || cnpj.Length == 18;', false, '14 length', '14 or 18', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[12], v_client_id, 'DTOs/TransacaoPixDTO.cs', 92, 'DocumentoBeneficiario', 'string', 'Documento do beneficiário', 'Aceitar formato estendido', 'public string DocumentoBeneficiario { get; set; } // 14', 'public string DocumentoBeneficiario { get; set; } // 18', false, '14 chars', '18 chars', 'UPDATE', NOW());

  -- REPO 13: emissao.api (2 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (gen_random_uuid(), v_analysis_ids[13], v_client_id, 'Models/Portador.cs', 45, 'CnpjPortador', 'string', 'CNPJ do portador do cartão', 'Atualizar para 18 caracteres', '[StringLength(14)] public string CnpjPortador { get; set; }', '[StringLength(18)] public string CnpjPortador { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[13], v_client_id, 'Validators/PortadorValidator.cs', 123, 'ValidarDocumento', 'method', 'Validação de documento', 'Aceitar 18 dígitos', 'if (!Regex.IsMatch(doc, @"^\d{14}$")) return false;', 'if (!Regex.IsMatch(doc, @"^\d{14}$|^\d{18}$")) return false;', false, 'regex 14', 'regex 14/18', 'UPDATE', NOW());

  -- REPO 14: aml.service (2 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (gen_random_uuid(), v_analysis_ids[14], v_client_id, 'Models/AnaliseAML.cs', 67, 'CnpjAnalisado', 'string', 'CNPJ em análise AML', 'Expandir para 18 caracteres', '[MaxLength(14)] public string CnpjAnalisado { get; set; }', '[MaxLength(18)] public string CnpjAnalisado { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[14], v_client_id, 'Services/ComplianceService.cs', 234, 'ValidarDocumentoCompliance', 'method', 'Validação compliance', 'Aceitar 18 caracteres', 'return doc.Length == 14;', 'return doc.Length == 14 || doc.Length == 18;', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- REPO 15: relatorios.api (2 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (gen_random_uuid(), v_analysis_ids[15], v_client_id, 'Models/RelatorioCliente.cs', 89, 'CnpjCliente', 'string', 'CNPJ em relatórios', 'Atualizar para 18 caracteres', '[StringLength(14)] public string CnpjCliente { get; set; }', '[StringLength(18)] public string CnpjCliente { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (gen_random_uuid(), v_analysis_ids[15], v_client_id, 'Validators/RelatorioValidator.cs', 178, 'ValidarCnpjRelatorio', 'method', 'Validação CNPJ em relatórios', 'Aceitar 18 caracteres', 'if (cnpj.Length != 14) return false;', 'if (cnpj.Length != 14 && cnpj.Length != 18) return false;', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- ========================================
  -- 5. CRIAR TASK_PROGRESS (78 tarefas distribuídas)
  -- ========================================
  
  -- Substituindo finding_id por task_id, e user_id por dev_id conforme schema real
  -- Distribuir 78 findings entre 4 devs: Danilo=20, João=19, Kleber=20, Leandro=19
  
  -- Danilo: Repos 3, 6, 7 = 2+8+6 = 16 findings + 4 do repo 4 = 20 total
  INSERT INTO task_progress (id, task_id, dev_id, client_id, progress_percentage, status, estimated_hours, created_at, updated_at)
  SELECT gen_random_uuid(), f.id, v_user_danilo, v_client_id, 
    CASE WHEN random() < 0.4 THEN 100 WHEN random() < 0.7 THEN 50 ELSE 0 END,
    CASE WHEN random() < 0.4 THEN 'completed' WHEN random() < 0.7 THEN 'in_progress' ELSE 'pending' END,
    4.0,
    NOW(), NOW()
  FROM findings f
  WHERE f.analysis_id IN (v_analysis_ids[3], v_analysis_ids[6], v_analysis_ids[7])
  UNION ALL
  SELECT gen_random_uuid(), f.id, v_user_danilo, v_client_id, 50, 'in_progress', 4.0, NOW(), NOW()
  FROM findings f
  WHERE f.analysis_id = v_analysis_ids[4]
  LIMIT 4;

  -- João: Repos 1, 5, 9, 13 = 3+2+6+2 = 13 findings + 6 do repo 4 = 19 total
  INSERT INTO task_progress (id, task_id, dev_id, client_id, progress_percentage, status, estimated_hours, created_at, updated_at)
  SELECT gen_random_uuid(), f.id, v_user_joao, v_client_id,
    CASE WHEN random() < 0.5 THEN 100 WHEN random() < 0.75 THEN 50 ELSE 0 END,
    CASE WHEN random() < 0.5 THEN 'completed' WHEN random() < 0.75 THEN 'in_progress' ELSE 'pending' END,
    4.0,
    NOW(), NOW()
  FROM findings f
  WHERE f.analysis_id IN (v_analysis_ids[1], v_analysis_ids[5], v_analysis_ids[9], v_analysis_ids[13])
  UNION ALL
  SELECT gen_random_uuid(), f.id, v_user_joao, v_client_id, 0, 'pending', 4.0, NOW(), NOW()
  FROM findings f
  WHERE f.analysis_id = v_analysis_ids[4] AND f.id NOT IN (
    SELECT task_id FROM task_progress WHERE dev_id = v_user_danilo
  )
  LIMIT 6;

  -- Kleber: Repos 2, 8, 10, 14 = 3+4+4+2 = 13 findings + 7 do repo 4 = 20 total
  INSERT INTO task_progress (id, task_id, dev_id, client_id, progress_percentage, status, estimated_hours, created_at, updated_at)
  SELECT gen_random_uuid(), f.id, v_user_kleber, v_client_id,
    CASE WHEN random() < 0.45 THEN 100 WHEN random() < 0.7 THEN 50 ELSE 0 END,
    CASE WHEN random() < 0.45 THEN 'completed' WHEN random() < 0.7 THEN 'in_progress' ELSE 'pending' END,
    4.0,
    NOW(), NOW()
  FROM findings f
  WHERE f.analysis_id IN (v_analysis_ids[2], v_analysis_ids[8], v_analysis_ids[10], v_analysis_ids[14])
  UNION ALL
  SELECT gen_random_uuid(), f.id, v_user_kleber, v_client_id, 50, 'in_progress', 4.0, NOW(), NOW()
  FROM findings f
  WHERE f.analysis_id = v_analysis_ids[4] AND f.id NOT IN (
    SELECT task_id FROM task_progress
  )
  LIMIT 7;

  -- Leandro: Repos 11, 12, 15 = 3+3+2 = 8 findings + 11 do repo 4 = 19 total
  INSERT INTO task_progress (id, task_id, dev_id, client_id, progress_percentage, status, estimated_hours, created_at, updated_at)
  SELECT gen_random_uuid(), f.id, v_user_leandro, v_client_id,
    CASE WHEN random() < 0.4 THEN 100 WHEN random() < 0.65 THEN 50 ELSE 0 END,
    CASE WHEN random() < 0.4 THEN 'completed' WHEN random() < 0.65 THEN 'in_progress' ELSE 'pending' END,
    4.0,
    NOW(), NOW()
  FROM findings f
  WHERE f.analysis_id IN (v_analysis_ids[11], v_analysis_ids[12], v_analysis_ids[15])
  UNION ALL
  SELECT gen_random_uuid(), f.id, v_user_leandro, v_client_id, 0, 'pending', 4.0, NOW(), NOW()
  FROM findings f
  WHERE f.analysis_id = v_analysis_ids[4] AND f.id NOT IN (
    SELECT task_id FROM task_progress
  )
  LIMIT 11;

  RAISE NOTICE 'Script executado com sucesso!';
  RAISE NOTICE 'Batch ID: %', v_batch_id;
  RAISE NOTICE '15 repositórios criados';
  RAISE NOTICE '78 findings inseridos com código C# real';
  RAISE NOTICE '78 tarefas distribuídas entre 4 desenvolvedores';

END $$;

-- ========================================
-- QUERIES DE VERIFICAÇÃO
-- ========================================

-- Ver totais
SELECT 
  'Batch' as tipo,
  COUNT(*) as total,
  SUM(estimated_hours) as horas_totais,
  SUM(total_repositories) as repos_totais
FROM batch_analyses 
WHERE account_name = 'BS2 Tecnologia'
UNION ALL
SELECT 
  'Repositórios' as tipo,
  COUNT(*) as total,
  NULL,
  NULL
FROM repositories 
WHERE name LIKE '%.wsapi' OR name LIKE '%.service' OR name LIKE '%.api'
UNION ALL
SELECT 
  'Findings' as tipo,
  COUNT(*) as total,
  NULL,
  NULL
FROM findings 
WHERE analysis_id IN (
  SELECT id FROM analyses WHERE batch_id IN (
    SELECT id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia'
  )
)
UNION ALL
SELECT 
  'Tarefas' as tipo,
  COUNT(*) as total,
  NULL,
  NULL
FROM task_progress
WHERE task_id IN (
  SELECT id FROM findings WHERE analysis_id IN (
    SELECT id FROM analyses WHERE batch_id IN (
      SELECT id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia'
    )
  )
);

-- Ver distribuição de tarefas por desenvolvedor
SELECT 
  u.name as desenvolvedor,
  COUNT(tp.id) as total_tarefas,
  SUM(CASE WHEN tp.status = 'completed' THEN 1 ELSE 0 END) as concluidas,
  SUM(CASE WHEN tp.status = 'in_progress' THEN 1 ELSE 0 END) as em_progresso,
  SUM(CASE WHEN tp.status = 'pending' THEN 1 ELSE 0 END) as pendentes
FROM task_progress tp
JOIN users u ON tp.dev_id = u.id
WHERE tp.task_id IN (
  SELECT id FROM findings WHERE analysis_id IN (
    SELECT id FROM analyses WHERE batch_id IN (
      SELECT id FROM batch_analyses WHERE account_name = 'BS2 Tecnologia'
    )
  )
)
GROUP BY u.name
ORDER BY u.name;
