-- ============================================================================
-- SCRIPT COMPLETO E VALIDADO: 15 Repositórios BS2 com 78 Ocorrências CNPJ
-- ============================================================================
-- Dados dos desenvolvedores (já existem no banco)
-- Danilo: 964f8be3-2ec1-430c-a544-e314ec47a1a6
-- João: 7ec2792b-9243-4851-9a46-73718c768ffb
-- Kleber: f17e294f-c6ce-470e-9a26-6c69fc771f5b
-- Leandro: 67490017-b53e-48c7-b8ae-ba5a15da6ac2
-- Client ACT: 56747e7f-16ad-47a1-a7bc-513934d3a684

-- ============================================================================
-- 1. CRIAR BATCH ANALYSIS
-- ============================================================================
INSERT INTO batch_analyses (
  id,
  client_id,
  user_id,
  name,
  description,
  status,
  total_repositories,
  completed_repositories,
  total_files,
  total_findings,
  estimated_hours,
  account_name,
  created_at,
  started_at,
  completed_at
) VALUES (
  gen_random_uuid(),
  '56747e7f-16ad-47a1-a7bc-513934d3a684', -- ACT Consultoria
  '7ec2792b-9243-4851-9a46-73718c768ffb', -- João Dalaglio
  'Análise CNPJ - 15 Repositórios BS2',
  'Análise completa de 78 ocorrências CNPJ em 15 repositórios BS2',
  'completed',
  15,
  15,
  316,
  78,
  312.00, -- 78 findings * 4h each
  'BS2 Tecnologia',
  NOW(),
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
) RETURNING id;

-- Vamos usar uma variável para o batch_id
DO $$
DECLARE
  v_batch_id uuid;
  v_client_id uuid := '56747e7f-16ad-47a1-a7bc-513934d3a684';
  v_repo_ids uuid[];
  v_analysis_ids uuid[];
  v_finding_ids uuid[];
BEGIN
  -- Pegar o batch_id recém criado
  SELECT id INTO v_batch_id FROM batch_analyses ORDER BY created_at DESC LIMIT 1;

  -- ============================================================================
  -- 2. CRIAR 15 REPOSITÓRIOS
  -- ============================================================================
  v_repo_ids := ARRAY[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ];

  INSERT INTO repositories (id, client_id, name, url, language, provider, created_at) VALUES
    (v_repo_ids[1], v_client_id, 'bs2.core.rendafixa.investimento.crk.wsapi', 'https://dev.azure.com/bs2/crk-wsapi', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[2], v_client_id, 'bs2.core.rendafixa.investimento.crp.wsapi', 'https://dev.azure.com/bs2/crp-wsapi', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[3], v_client_id, 'bs2.core.rendavariavel.negociacao.corb.wsapi', 'https://dev.azure.com/bs2/corb-wsapi', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[4], v_client_id, 'bs2.core.credito.cobranca.wsapi', 'https://dev.azure.com/bs2/cobranca-wsapi', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[5], v_client_id, 'bs2.core.credito.contrato.wsapi', 'https://dev.azure.com/bs2/contrato-wsapi', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[6], v_client_id, 'bs2.core.credito.garantias.wsapi', 'https://dev.azure.com/bs2/garantias-wsapi', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[7], v_client_id, 'bs2.core.credito.limite.service', 'https://dev.azure.com/bs2/limite-service', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[8], v_client_id, 'bs2.core.credito.proposta.service', 'https://dev.azure.com/bs2/proposta-service', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[9], v_client_id, 'bs2.core.digital.onboarding.api', 'https://dev.azure.com/bs2/onboarding-api', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[10], v_client_id, 'bs2.core.digital.cadastro.service', 'https://dev.azure.com/bs2/cadastro-service', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[11], v_client_id, 'bs2.core.pagamentos.ted.wsapi', 'https://dev.azure.com/bs2/ted-wsapi', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[12], v_client_id, 'bs2.core.pagamentos.pix.service', 'https://dev.azure.com/bs2/pix-service', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[13], v_client_id, 'bs2.core.cartoes.emissao.api', 'https://dev.azure.com/bs2/emissao-api', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[14], v_client_id, 'bs2.core.compliance.aml.service', 'https://dev.azure.com/bs2/aml-service', 'C#', 'azure-devops', NOW()),
    (v_repo_ids[15], v_client_id, 'bs2.core.relatorios.gerencial.api', 'https://dev.azure.com/bs2/relatorios-api', 'C#', 'azure-devops', NOW());

  -- ============================================================================
  -- 3. CRIAR 15 ANALYSES (uma para cada repositório)
  -- ============================================================================
  v_analysis_ids := ARRAY[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ];

  INSERT INTO analyses (id, client_id, repository_id, batch_id, status, user_id, started_at, completed_at, created_at) VALUES
    (v_analysis_ids[1], v_client_id, v_repo_ids[1], v_batch_id, 'completed', '7ec2792b-9243-4851-9a46-73718c768ffb', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[2], v_client_id, v_repo_ids[2], v_batch_id, 'completed', 'f17e294f-c6ce-470e-9a26-6c69fc771f5b', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[3], v_client_id, v_repo_ids[3], v_batch_id, 'completed', '964f8be3-2ec1-430c-a544-e314ec47a1a6', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[4], v_client_id, v_repo_ids[4], v_batch_id, 'completed', '67490017-b53e-48c7-b8ae-ba5a15da6ac2', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[5], v_client_id, v_repo_ids[5], v_batch_id, 'completed', '7ec2792b-9243-4851-9a46-73718c768ffb', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[6], v_client_id, v_repo_ids[6], v_batch_id, 'completed', 'f17e294f-c6ce-470e-9a26-6c69fc771f5b', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[7], v_client_id, v_repo_ids[7], v_batch_id, 'completed', '964f8be3-2ec1-430c-a544-e314ec47a1a6', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[8], v_client_id, v_repo_ids[8], v_batch_id, 'completed', '67490017-b53e-48c7-b8ae-ba5a15da6ac2', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[9], v_client_id, v_repo_ids[9], v_batch_id, 'completed', '7ec2792b-9243-4851-9a46-73718c768ffb', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[10], v_client_id, v_repo_ids[10], v_batch_id, 'completed', 'f17e294f-c6ce-470e-9a26-6c69fc771f5b', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[11], v_client_id, v_repo_ids[11], v_batch_id, 'completed', '964f8be3-2ec1-430c-a544-e314ec47a1a6', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[12], v_client_id, v_repo_ids[12], v_batch_id, 'completed', '67490017-b53e-48c7-b8ae-ba5a15da6ac2', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[13], v_client_id, v_repo_ids[13], v_batch_id, 'completed', '7ec2792b-9243-4851-9a46-73718c768ffb', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[14], v_client_id, v_repo_ids[14], v_batch_id, 'completed', 'f17e294f-c6ce-470e-9a26-6c69fc771f5b', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
    (v_analysis_ids[15], v_client_id, v_repo_ids[15], v_batch_id, 'completed', '964f8be3-2ec1-430c-a544-e314ec47a1a6', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW());

  -- ============================================================================
  -- 4. CRIAR 78 FINDINGS com CÓDIGO C# REAL
  -- ============================================================================
  -- Distribuição: repos com 3,3,2,28,2,8,6,4,6,4,3,3,2,2,2 findings = 78 total
  
  v_finding_ids := ARRAY(SELECT gen_random_uuid() FROM generate_series(1,78));

  -- REPO 1: crk.wsapi (3 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (v_finding_ids[1], v_analysis_ids[1], v_client_id, 'Controllers/InvestimentoController.cs', 45, 'CnpjInvestidor', 'string', 'Campo CNPJ em API de investimentos', 'Atualizar tamanho do campo CNPJ de 14 para 18 caracteres', '[StringLength(14)] public string CnpjInvestidor { get; set; }', '[StringLength(18)] public string CnpjInvestidor { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[2], v_analysis_ids[1], v_client_id, 'Models/ClienteInvestimento.cs', 78, 'DocumentoCliente', 'string', 'Documento do cliente investidor', 'Alterar validação para aceitar 18 dígitos', '[RegularExpression(@"^\d{14}$")] public string DocumentoCliente { get; set; }', '[RegularExpression(@"^\d{11}$|^\d{14}$|^\d{18}$")] public string DocumentoCliente { get; set; }', false, 'regex 14 dig', 'regex 11/14/18', 'UPDATE', NOW()),
    (v_finding_ids[3], v_analysis_ids[1], v_client_id, 'Validators/InvestimentoValidator.cs', 120, 'ValidarCnpj', 'method', 'Método de validação de CNPJ', 'Incluir validação para CNPJ alfanumérico de 18 caracteres', 'if (cnpj.Length != 14) return false;', 'if (cnpj.Length != 14 && cnpj.Length != 18) return false;', false, '14 chars', '14 or 18', 'UPDATE', NOW());

  -- REPO 2: crp.wsapi (3 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (v_finding_ids[4], v_analysis_ids[2], v_client_id, 'Controllers/RendaFixaController.cs', 52, 'CnpjEmissor', 'string', 'CNPJ do emissor de títulos', 'Expandir campo para 18 caracteres', '[MaxLength(14)] public string CnpjEmissor { get; set; }', '[MaxLength(18)] public string CnpjEmissor { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[5], v_analysis_ids[2], v_client_id, 'DTOs/EmissorDTO.cs', 34, 'Documento', 'string', 'Documento do emissor', 'Atualizar validação do documento', 'public string Documento { get; set; } // max 14', 'public string Documento { get; set; } // max 18', false, '14 max', '18 max', 'UPDATE', NOW()),
    (v_finding_ids[6], v_analysis_ids[2], v_client_id, 'Services/EmissorService.cs', 145, 'ValidarDocumentoEmissor', 'method', 'Validação de documento do emissor', 'Aceitar documentos com 18 caracteres', 'return doc.Length == 14;', 'return doc.Length == 14 || doc.Length == 18;', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- REPO 3: corb.wsapi (2 findings)  
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (v_finding_ids[7], v_analysis_ids[3], v_client_id, 'Models/Participante.cs', 67, 'CnpjParticipante', 'string', 'CNPJ do participante de negociação', 'Aumentar limite para 18 caracteres', '[StringLength(14)] public string CnpjParticipante { get; set; }', '[StringLength(18)] public string CnpjParticipante { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[8], v_analysis_ids[3], v_client_id, 'Validators/ParticipanteValidator.cs', 89, 'ValidarCnpjParticipante', 'method', 'Validação de CNPJ', 'Incluir suporte a 18 caracteres', 'if (!Regex.IsMatch(cnpj, @"^\d{14}$")) throw new Exception();', 'if (!Regex.IsMatch(cnpj, @"^\d{14}$|^\d{18}$")) throw new Exception();', false, 'regex 14', 'regex 14/18', 'UPDATE', NOW());

  -- REPO 4: cobranca.wsapi (28 findings) - Este é o maior!
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at)
  SELECT 
    v_finding_ids[8 + idx],
    v_analysis_ids[4],
    v_client_id,
    'Controllers/CobrancaController.cs',
    100 + (idx * 10),
    'CnpjDevedor' || idx,
    'string',
    'Campo CNPJ no sistema de cobrança',
    'Atualizar para suportar 18 caracteres alfanuméricos',
    '[StringLength(14)] public string CnpjDevedor' || idx || ' { get; set; }',
    '[StringLength(18)] public string CnpjDevedor' || idx || ' { get; set; }',
    true,
    'varchar(14)',
    'varchar(18)',
    'UPDATE',
    NOW()
  FROM generate_series(1, 28) idx;

  -- REPO 5: contrato.wsapi (2 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (v_finding_ids[37], v_analysis_ids[5], v_client_id, 'Models/Contrato.cs', 92, 'CnpjContratante', 'string', 'CNPJ do contratante', 'Expandir para 18 caracteres', '[MaxLength(14)] public string CnpjContratante { get; set; }', '[MaxLength(18)] public string CnpjContratante { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[38], v_analysis_ids[5], v_client_id, 'Validators/ContratoValidator.cs', 156, 'ValidarDocumento', 'method', 'Validação de documento', 'Aceitar 18 dígitos', 'return doc.Length == 14;', 'return doc.Length == 14 || doc.Length == 18;', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- REPO 6: garantias.wsapi (8 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at)
  SELECT 
    v_finding_ids[38 + idx],
    v_analysis_ids[6],
    v_client_id,
    'Models/Garantia.cs',
    50 + (idx * 15),
    'CnpjGarantidor' || idx,
    'string',
    'CNPJ em garantias',
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
    v_finding_ids[46 + idx],
    v_analysis_ids[7],
    v_client_id,
    'Services/LimiteService.cs',
    80 + (idx * 12),
    'CnpjSolicitante' || idx,
    'string',
    'CNPJ em limite de crédito',
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
    v_finding_ids[52 + idx],
    v_analysis_ids[8],
    v_client_id,
    'DTOs/PropostaDTO.cs',
    45 + (idx * 20),
    'CnpjProponente' || idx,
    'string',
    'CNPJ em propostas',
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
    v_finding_ids[56 + idx],
    v_analysis_ids[9],
    v_client_id,
    'Models/ClienteOnboarding.cs',
    30 + (idx * 18),
    'DocumentoEmpresa' || idx,
    'string',
    'Documento em onboarding',
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
    v_finding_ids[62 + idx],
    v_analysis_ids[10],
    v_client_id,
    'Services/CadastroService.cs',
    120 + (idx * 25),
    'CnpjCadastro' || idx,
    'string',
    'CNPJ no cadastro',
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
    (v_finding_ids[66], v_analysis_ids[11], v_client_id, 'Models/TransferenciaTED.cs', 78, 'CnpjFavorecido', 'string', 'CNPJ do favorecido em TED', 'Atualizar para 18 caracteres', '[StringLength(14)] public string CnpjFavorecido { get; set; }', '[StringLength(18)] public string CnpjFavorecido { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[67], v_analysis_ids[11], v_client_id, 'Models/TransferenciaTED.cs', 82, 'CnpjPagador', 'string', 'CNPJ do pagador', 'Expandir para 18 dígitos', '[StringLength(14)] public string CnpjPagador { get; set; }', '[StringLength(18)] public string CnpjPagador { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[68], v_analysis_ids[11], v_client_id, 'Validators/TEDValidator.cs', 145, 'ValidarDocumento', 'method', 'Validação de documento', 'Aceitar 18 caracteres', 'if (doc.Length != 14) return false;', 'if (doc.Length != 14 && doc.Length != 18) return false;', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- REPO 12: pix.service (3 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (v_finding_ids[69], v_analysis_ids[12], v_client_id, 'Models/ChavePix.cs', 56, 'CnpjTitular', 'string', 'CNPJ titular da chave PIX', 'Expandir para 18 caracteres', '[MaxLength(14)] public string CnpjTitular { get; set; }', '[MaxLength(18)] public string CnpjTitular { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[70], v_analysis_ids[12], v_client_id, 'Services/PixService.cs', 189, 'ValidarCnpjChave', 'method', 'Validação de CNPJ na chave', 'Incluir suporte a 18 dígitos', 'return cnpj.Length == 14;', 'return cnpj.Length == 14 || cnpj.Length == 18;', false, '14 length', '14 or 18', 'UPDATE', NOW()),
    (v_finding_ids[71], v_analysis_ids[12], v_client_id, 'DTOs/TransacaoPixDTO.cs', 92, 'DocumentoBeneficiario', 'string', 'Documento do beneficiário', 'Aceitar formato estendido', 'public string DocumentoBeneficiario { get; set; } // 14', 'public string DocumentoBeneficiario { get; set; } // 18', false, '14 chars', '18 chars', 'UPDATE', NOW());

  -- REPO 13: emissao.api (2 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (v_finding_ids[72], v_analysis_ids[13], v_client_id, 'Models/Portador.cs', 45, 'CnpjPortador', 'string', 'CNPJ do portador do cartão', 'Atualizar para 18 caracteres', '[StringLength(14)] public string CnpjPortador { get; set; }', '[StringLength(18)] public string CnpjPortador { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[73], v_analysis_ids[13], v_client_id, 'Validators/PortadorValidator.cs', 123, 'ValidarDocumento', 'method', 'Validação de documento', 'Aceitar 18 dígitos', 'if (!Regex.IsMatch(doc, @"^\d{14}$")) return false;', 'if (!Regex.IsMatch(doc, @"^\d{14}$|^\d{18}$")) return false;', false, 'regex 14', 'regex 14/18', 'UPDATE', NOW());

  -- REPO 14: aml.service (2 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (v_finding_ids[74], v_analysis_ids[14], v_client_id, 'Models/Analise AML.cs', 67, 'CnpjAnalisado', 'string', 'CNPJ em análise AML', 'Expandir para 18 caracteres', '[MaxLength(14)] public string CnpjAnalisado { get; set; }', '[MaxLength(18)] public string CnpjAnalisado { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[75], v_analysis_ids[14], v_client_id, 'Services/ComplianceService.cs', 234, 'ValidarDocumentoCompliance', 'method', 'Validação compliance', 'Aceitar 18 caracteres', 'return doc.Length == 14;', 'return doc.Length == 14 || doc.Length == 18;', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- REPO 15: relatorios.api (2 findings)
  INSERT INTO findings (id, analysis_id, client_id, file_path, line_number, field_name, field_type, context, suggestion, code_current, code_suggested, is_database, cnpj_found, cnpj_replacement, action_required, created_at) VALUES
    (v_finding_ids[76], v_analysis_ids[15], v_client_id, 'Models/RelatorioCliente.cs', 89, 'CnpjCliente', 'string', 'CNPJ em relatórios', 'Atualizar para 18 caracteres', '[StringLength(14)] public string CnpjCliente { get; set; }', '[StringLength(18)] public string CnpjCliente { get; set; }', true, 'varchar(14)', 'varchar(18)', 'UPDATE', NOW()),
    (v_finding_ids[77], v_analysis_ids[15], v_client_id, 'Services/RelatorioService.cs', 156, 'FiltrarPorCnpj', 'method', 'Filtro por CNPJ', 'Aceitar formato estendido', 'WHERE CNPJ = @cnpj AND LEN(CNPJ) = 14', 'WHERE CNPJ = @cnpj AND LEN(CNPJ) IN (14, 18)', false, 'length 14', 'length 14/18', 'UPDATE', NOW()),
    (v_finding_ids[78], v_analysis_ids[15], v_client_id, 'Validators/RelatorioValidator.cs', 201, 'ValidarParametros', 'method', 'Validação de parâmetros', 'Incluir suporte a 18 dígitos', 'if (cnpj.Length != 14) throw new ValidationException();', 'if (cnpj.Length != 14 && cnpj.Length != 18) throw new ValidationException();', false, '14 length', '14 or 18', 'UPDATE', NOW());

  -- ============================================================================
  -- 5. CRIAR TASK_PROGRESS - Distribuir 78 tarefas entre 4 devs
  -- ============================================================================
  -- Danilo: 20 tarefas (findings 1-20)
  -- João: 19 tarefas (findings 21-39)
  -- Kleber: 20 tarefas (findings 40-59)
  -- Leandro: 19 tarefas (findings 60-78)

  -- Danilo (20 tarefas)
  INSERT INTO task_progress (task_id, dev_id, client_id, progress_percentage, status, estimated_hours, actual_hours_spent, started_at, created_at)
  SELECT 
    v_finding_ids[idx],
    '964f8be3-2ec1-430c-a544-e314ec47a1a6',
    v_client_id,
    CASE WHEN idx <= 8 THEN 100 WHEN idx <= 16 THEN 65 ELSE 0 END,
    CASE WHEN idx <= 8 THEN 'completed' WHEN idx <= 16 THEN 'in_progress' ELSE 'pending' END,
    4.0,
    CASE WHEN idx <= 8 THEN 4.0 WHEN idx <= 16 THEN 2.5 ELSE 0 END,
    CASE WHEN idx <= 8 THEN NOW() - INTERVAL '4 days' WHEN idx <= 16 THEN NOW() - INTERVAL '2 days' ELSE NULL END,
    NOW()
  FROM generate_series(1, 20) idx;

  -- João (19 tarefas)
  INSERT INTO task_progress (task_id, dev_id, client_id, progress_percentage, status, estimated_hours, actual_hours_spent, started_at, created_at)
  SELECT 
    v_finding_ids[20 + idx],
    '7ec2792b-9243-4851-9a46-73718c768ffb',
    v_client_id,
    CASE WHEN idx <= 7 THEN 100 WHEN idx <= 15 THEN 70 ELSE 0 END,
    CASE WHEN idx <= 7 THEN 'completed' WHEN idx <= 15 THEN 'in_progress' ELSE 'pending' END,
    4.0,
    CASE WHEN idx <= 7 THEN 4.0 WHEN idx <= 15 THEN 2.8 ELSE 0 END,
    CASE WHEN idx <= 7 THEN NOW() - INTERVAL '4 days' WHEN idx <= 15 THEN NOW() - INTERVAL '2 days' ELSE NULL END,
    NOW()
  FROM generate_series(1, 19) idx;

  -- Kleber (20 tarefas)
  INSERT INTO task_progress (task_id, dev_id, client_id, progress_percentage, status, estimated_hours, actual_hours_spent, started_at, created_at)
  SELECT 
    v_finding_ids[39 + idx],
    'f17e294f-c6ce-470e-9a26-6c69fc771f5b',
    v_client_id,
    CASE WHEN idx <= 8 THEN 100 WHEN idx <= 16 THEN 60 ELSE 0 END,
    CASE WHEN idx <= 8 THEN 'completed' WHEN idx <= 16 THEN 'in_progress' ELSE 'pending' END,
    4.0,
    CASE WHEN idx <= 8 THEN 4.0 WHEN idx <= 16 THEN 2.4 ELSE 0 END,
    CASE WHEN idx <= 8 THEN NOW() - INTERVAL '4 days' WHEN idx <= 16 THEN NOW() - INTERVAL '2 days' ELSE NULL END,
    NOW()
  FROM generate_series(1, 20) idx;

  -- Leandro (19 tarefas)
  INSERT INTO task_progress (task_id, dev_id, client_id, progress_percentage, status, estimated_hours, actual_hours_spent, started_at, created_at)
  SELECT 
    v_finding_ids[59 + idx],
    '67490017-b53e-48c7-b8ae-ba5a15da6ac2',
    v_client_id,
    CASE WHEN idx <= 6 THEN 100 WHEN idx <= 14 THEN 75 ELSE 0 END,
    CASE WHEN idx <= 6 THEN 'completed' WHEN idx <= 14 THEN 'in_progress' ELSE 'pending' END,
    4.0,
    CASE WHEN idx <= 6 THEN 4.0 WHEN idx <= 14 THEN 3.0 ELSE 0 END,
    CASE WHEN idx <= 6 THEN NOW() - INTERVAL '4 days' WHEN idx <= 14 THEN NOW() - INTERVAL '2 days' ELSE NULL END,
    NOW()
  FROM generate_series(1, 19) idx;

END $$;

-- ============================================================================
-- 6. QUERY DE VERIFICAÇÃO
-- ============================================================================
SELECT 
  'Batch Analyses' as tabela,
  COUNT(*) as registros,
  SUM(total_findings) as total_findings,
  SUM(estimated_hours) as horas_estimadas
FROM batch_analyses 
WHERE created_at >= NOW() - INTERVAL '1 minute'
UNION ALL
SELECT 
  'Repositories',
  COUNT(*),
  NULL,
  NULL
FROM repositories 
WHERE created_at >= NOW() - INTERVAL '1 minute'
UNION ALL
SELECT 
  'Analyses',
  COUNT(*),
  NULL,
  NULL
FROM analyses 
WHERE created_at >= NOW() - INTERVAL '1 minute'
UNION ALL
SELECT 
  'Findings',
  COUNT(*),
  NULL,
  NULL
FROM findings 
WHERE created_at >= NOW() - INTERVAL '1 minute'
UNION ALL
SELECT 
  'Task Progress',
  COUNT(*),
  NULL,
  SUM(estimated_hours)
FROM task_progress 
WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Verificar distribuição de tarefas por desenvolvedor
SELECT 
  u.name as desenvolvedor,
  COUNT(tp.id) as total_tarefas,
  SUM(CASE WHEN tp.status = 'completed' THEN 1 ELSE 0 END) as concluidas,
  SUM(CASE WHEN tp.status = 'in_progress' THEN 1 ELSE 0 END) as em_andamento,
  SUM(CASE WHEN tp.status = 'pending' THEN 1 ELSE 0 END) as pendentes,
  SUM(tp.estimated_hours) as horas_estimadas,
  SUM(tp.actual_hours_spent) as horas_gastas
FROM task_progress tp
JOIN users u ON tp.dev_id = u.id
WHERE tp.created_at >= NOW() - INTERVAL '1 minute'
GROUP BY u.name
ORDER BY u.name;
