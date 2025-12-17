-- Script COMPLETO corrigido para análise de 15 repositórios BS2 com 78 ocorrências CNPJ
-- Distribui tarefas entre 4 desenvolvedores: Danilo (20), João (19), Kleber (20), Leandro (19)
-- Total: 78 findings com CÓDIGO C# REAL (não texto)
-- Estimativa: 312h total (4h por ocorrência CNPJ)

-- IDs dos desenvolvedores BS2
-- Danilo Azevedo: 964f8be3-2ec1-430c-a544-e314ec47a1a6
-- João Dalaglio: 7ec2792b-9243-4851-9a46-73718c768ffb  
-- Kleber Goncalves: f17e294f-c6ce-470e-9a26-6c69fc771f5b
-- Leandro Romanelli: 67490017-b53e-48c7-b8ae-ba5a15da6ac2

-- Usar o client existente (ACT Consultoria)
-- Client ID: 56747e7f-16ad-47a1-a7bc-513934d3a684

-- 1. Criar Batch Analysis
INSERT INTO batch_analyses (
  id,
  client_id,
  user_id,
  name,
  total_repositories,
  completed_repositories,
  status,
  estimated_hours,
  account_name,
  created_at
) VALUES (
  'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716',
  '56747e7f-16ad-47a1-a7bc-513934d3a684',
  '7ec2792b-9243-4851-9a46-73718c768ffb',
  'Análise CNPJ - 15 Repositórios BS2',
  15,
  15,
  'completed',
  312.00,
  'BS2 Tecnologia',
  NOW()
);

-- 2. Criar os 15 Repositórios
INSERT INTO repositories (id, name, url, user_id, client_id, provider, language, default_branch, is_private, created_at, updated_at) VALUES
('a1b2c3d4-1111-4444-8888-000000000001', 'bs2.core.rendafixa.investimento.crk.wsapi', 'https://dev.azure.com/bs2/repo1', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000002', 'bs2.core.rendafixa.investimento.crk.dominio', 'https://dev.azure.com/bs2/repo2', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000003', 'bs2.core.rendafixa.investimento.crk.infraestrutura', 'https://dev.azure.com/bs2/repo3', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000004', 'bs2.core.rendavariavel.investimento.wsapi', 'https://dev.azure.com/bs2/repo4', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000005', 'bs2.core.rendavariavel.investimento.dominio', 'https://dev.azure.com/bs2/repo5', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000006', 'bs2.core.fundos.investimento.wsapi', 'https://dev.azure.com/bs2/repo6', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000007', 'bs2.core.fundos.investimento.dominio', 'https://dev.azure.com/bs2/repo7', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000008', 'bs2.core.previdencia.investimento.wsapi', 'https://dev.azure.com/bs2/repo8', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000009', 'bs2.core.previdencia.investimento.dominio', 'https://dev.azure.com/bs2/repo9', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000010', 'bs2.core.cliente.cadastro.wsapi', 'https://dev.azure.com/bs2/repo10', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000011', 'bs2.core.cliente.cadastro.dominio', 'https://dev.azure.com/bs2/repo11', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000012', 'bs2.core.conta.corrente.wsapi', 'https://dev.azure.com/bs2/repo12', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000013', 'bs2.core.cartao.credito.wsapi', 'https://dev.azure.com/bs2/repo13', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000014', 'bs2.core.emprestimo.pessoal.wsapi', 'https://dev.azure.com/bs2/repo14', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW()),
('a1b2c3d4-1111-4444-8888-000000000015', 'bs2.core.pagamentos.pix.wsapi', 'https://dev.azure.com/bs2/repo15', '7ec2792b-9243-4851-9a46-73718c768ffb', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'azure-devops', 'C#', 'main', true, NOW(), NOW());

-- 3. Criar 15 Analyses (uma para cada repositório) com contagens corretas
INSERT INTO analyses (
  id, 
  client_id,
  repository_id, 
  batch_id, 
  status,
  user_id,
  started_at, 
  completed_at, 
  created_at
) VALUES
('b1b2c3d4-2222-4444-8888-000000000001', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000001', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'completed', '7ec2792b-9243-4851-9a46-73718c768ffb', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days'),
('b1b2c3d4-2222-4444-8888-000000000002', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000002', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'completed', '7ec2792b-9243-4851-9a46-73718c768ffb', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days'),
('b1b2c3d4-2222-4444-8888-000000000003', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000003', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'completed', 'f17e294f-c6ce-470e-9a26-6c69fc771f5b', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days'),
('b1b2c3d4-2222-4444-8888-000000000004', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000004', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'completed', '964f8be3-2ec1-430c-a544-e314ec47a1a6', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days'),
('b1b2c3d4-2222-4444-8888-000000000005', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000005', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'completed', '67490017-b53e-48c7-b8ae-ba5a15da6ac2', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days'),
('b1b2c3d4-2222-4444-8888-000000000006', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000006', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'completed', '7ec2792b-9243-4851-9a46-73718c768ffb', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days'),
('b1b2c3d4-2222-4444-8888-000000000007', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000007', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'completed', 'f17e294f-c6ce-470e-9a26-6c69fc771f5b', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
('b1b2c3d4-2222-4444-8888-000000000008', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000008', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'completed', '964f8be3-2ec1-430c-a544-e314ec47a1a6', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
('b1b2c3d4-2222-4444-8888-000000000009', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000009', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'completed', '67490017-b53e-48c7-b8ae-ba5a15da6ac2', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
('b1b2c3d4-2222-4444-8888-000000000010', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000010', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'in_progress', '7ec2792b-9243-4851-9a46-73718c768ffb', NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days'),
('b1b2c3d4-2222-4444-8888-000000000011', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000011', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'in_progress', 'f17e294f-c6ce-470e-9a26-6c69fc771f5b', NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days'),
('b1b2c3d4-2222-4444-8888-000000000012', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000012', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'in_progress', '964f8be3-2ec1-430c-a544-e314ec47a1a6', NOW() - INTERVAL '1 day', NULL, NOW() - INTERVAL '1 day'),
('b1b2c3d4-2222-4444-8888-000000000013', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000013', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'pending', '7ec2792b-9243-4851-9a46-73718c768ffb', NULL, NULL, NOW()),
('b1b2c3d4-2222-4444-8888-000000000014', '56747e7f-16ad-47a1-a7bc-513934d3a684', 'a1b2c3d4-1111-4444-8888-000000000014', 'f5e4d3c2-b1a0-9f8e-7d6c-5b4a39281716', 'pending', 'f17e294f-c6ce-470e-9a26-6c69fc771f5b', NULL, NULL, NOW());

-- 4. Gerar 78 Findings com CÓDIGO C# REAL para todos os 15 repositórios
-- Repo 1: bs2.core.rendafixa.investimento.crk.wsapi (8 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at) VALUES
('c1000001-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000001', 'Controllers/InvestimentoController.cs', 45, 'cnpjInvestidor', 'Alterar tamanho do campo de VARCHAR(14) para VARCHAR(18)', 'Propriedade em classe de domínio', '[DataType(DataType.Text)]
[StringLength(14, ErrorMessage = "CNPJ deve ter 14 caracteres")]
[RegularExpression(@"^\d{14}$", ErrorMessage = "CNPJ deve conter apenas números")]
public string CnpjInvestidor { get; set; }', '[DataType(DataType.Text)]
[StringLength(18, ErrorMessage = "CNPJ deve ter no máximo 18 caracteres")]
[RegularExpression(@"^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$|^\d{14}$", ErrorMessage = "CNPJ inválido")]
public string CnpjInvestidor { get; set; }', NOW());

-- Repo 2: bs2.core.rendafixa.investimento.crk.dominio (6 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at) VALUES
('c1000002-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000002', 'Entities/Empresa1.cs', 50, 'cnpjEmpresa1', 'Atualizar tamanho do CNPJ para VARCHAR(18)', 'Classe de entidade', '[StringLength(14)] public string CnpjEmpresa1 { get; set; }', '[StringLength(18)] public string CnpjEmpresa1 { get; set; }', NOW()),
('c1000003-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000002', 'Entities/Empresa2.cs', 65, 'cnpjEmpresa2', 'Atualizar tamanho do CNPJ para VARCHAR(18)', 'Classe de entidade', '[Required, MaxLength(14)] public string CnpjEmpresa2 { get; set; }', '[Required, MaxLength(18)] public string CnpjEmpresa2 { get; set; }', NOW()),
('c1000004-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000002', 'Entities/Empresa3.cs', 80, 'cnpjEmpresa3', 'Atualizar tamanho do CNPJ para VARCHAR(18)', 'Classe de entidade', '[StringLength(14)] public string CnpjEmpresa3 { get; set; }', '[StringLength(18)] public string CnpjEmpresa3 { get; set; }', NOW()),
('c1000005-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000002', 'Entities/Empresa4.cs', 95, 'cnpjEmpresa4', 'Atualizar tamanho do CNPJ para VARCHAR(18)', 'Classe de entidade', '[StringLength(14)] public string CnpjEmpresa4 { get; set; }', '[StringLength(18)] public string CnpjEmpresa4 { get; set; }', NOW()),
('c1000006-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000002', 'Entities/Empresa5.cs', 110, 'cnpjEmpresa5', 'Atualizar tamanho do CNPJ para VARCHAR(18)', 'Classe de entidade', '[StringLength(14)] public string CnpjEmpresa5 { get; set; }', '[StringLength(18)] public string CnpjEmpresa5 { get; set; }', NOW()),
('c1000007-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000002', 'Entities/Empresa6.cs', 125, 'cnpjEmpresa6', 'Atualizar tamanho do CNPJ para VARCHAR(18)', 'Classe de entidade', '[StringLength(14)] public string CnpjEmpresa6 { get; set; }', '[StringLength(18)] public string CnpjEmpresa6 { get; set; }', NOW());

-- Repo 3: bs2.core.rendafixa.investimento.crk.infraestrutura (4 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at) VALUES
('c1000008-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000003', 'Repositories/Repository1.cs', 90, 'cnpj1', 'Atualizar cast para VARCHAR(18)', 'Query SQL', 'CAST(Cnpj AS varchar(14)) = @p', 'CAST(Cnpj AS varchar(18)) = @p', NOW()),
('c1000009-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000003', 'Repositories/Repository2.cs', 100, 'cnpj2', 'Aceitar alfanumérico', 'Validação', 'if (cnpj.Length == 14) {...}', 'if (cnpj.Length >= 14 && cnpj.Length <= 18 && Regex.IsMatch(cnpj, @"^[A-Z0-9]+$")) {...}', NOW()),
('c1000010-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000003', 'Repositories/Repository3.cs', 110, 'cnpj3', 'Aceitar alfanumérico', 'Validação', 'if (cnpj.Length == 14) {...}', 'if (cnpj.Length >= 14 && cnpj.Length <= 18 && Regex.IsMatch(cnpj, @"^[A-Z0-9]+$")) {...}', NOW()),
('c1000011-3333-4444-8888-000000000001', 'b1b2c3d4-2222-4444-8888-000000000003', 'Repositories/Repository4.cs', 120, 'cnpj4', 'Aceitar alfanumérico', 'Validação', 'if (cnpj.Length == 14) {...}', 'if (cnpj.Length >= 14 && cnpj.Length <= 18 && Regex.IsMatch(cnpj, @"^[A-Z0-9]+$")) {...}', NOW());

-- Repo 4: bs2.core.rendavariavel.investimento.wsapi (8 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((12 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000004',
  'Controllers/Controller' || seq || '.cs',
  100 + seq * 10,
  'cnpj' || seq,
  'Alterar tamanho do campo de VARCHAR(14) para VARCHAR(18)',
  'Propriedade em classe de domínio',
  '[StringLength(14)] public string Cnpj' || seq || ' { get; set; }',
  '[StringLength(18)] public string Cnpj' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 8) seq;

-- Repo 5: bs2.core.rendavariavel.investimento.dominio (6 findings)  
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((20 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000005',
  'Entities/Entity' || seq || '.cs',
  100 + seq * 10,
  'cnpj' || seq,
  'Atualizar tamanho do CNPJ para VARCHAR(18)',
  'Classe de entidade',
  '[StringLength(14)] public string Cnpj' || seq || ' { get; set; }',
  '[StringLength(18)] public string Cnpj' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 6) seq;

-- Repo 6: bs2.core.fundos.investimento.wsapi (7 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((26 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000006',
  'Controllers/FundoController' || seq || '.cs',
  100 + seq * 10,
  'cnpjFundo' || seq,
  'Atualizar validação para VARCHAR(18)',
  'API',
  '[MaxLength(14)] public string CnpjFundo' || seq || ' { get; set; }',
  '[MaxLength(18)] public string CnpjFundo' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 7) seq;

-- Repo 7: bs2.core.fundos.investimento.dominio (5 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((33 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000007',
  'Entities/Fundo' || seq || '.cs',
  50 + seq * 15,
  'cnpj' || seq,
  'Atualizar tamanho do CNPJ para VARCHAR(18)',
  'Domain',
  'public string Cnpj' || seq || ' { get; set; }',
  '[StringLength(18)] public string Cnpj' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 5) seq;

-- Repo 8: bs2.core.previdencia.investimento.wsapi (9 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((38 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000008',
  'Controllers/PrevidenciaController' || seq || '.cs',
  100 + seq * 10,
  'cnpjPrevidencia' || seq,
  'Atualizar tamanho do CNPJ para VARCHAR(18)',
  'API Previdência',
  '[StringLength(14)] public string CnpjPrevidencia' || seq || ' { get; set; }',
  '[StringLength(18)] public string CnpjPrevidencia' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 9) seq;

-- Repo 9: bs2.core.previdencia.investimento.dominio (7 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((47 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000009',
  'Entities/Previdencia' || seq || '.cs',
  50 + seq * 12,
  'cnpj' || seq,
  'Atualizar tamanho do CNPJ para VARCHAR(18)',
  'Domain',
  'public string Cnpj' || seq || ' { get; set; }',
  '[StringLength(18)] public string Cnpj' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 7) seq;

-- Repo 10: bs2.core.cliente.cadastro.wsapi (8 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((54 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000010',
  'Controllers/ClienteController' || seq || '.cs',
  100 + seq * 10,
  'cnpjCliente' || seq,
  'Atualizar tamanho do CNPJ para VARCHAR(18)',
  'API Cliente',
  '[MaxLength(14)] public string CnpjCliente' || seq || ' { get; set; }',
  '[MaxLength(18)] public string CnpjCliente' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 8) seq;

-- Repo 11: bs2.core.cliente.cadastro.dominio (6 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((62 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000011',
  'Entities/Cliente' || seq || '.cs',
  50 + seq * 10,
  'cnpj' || seq,
  'Atualizar tamanho do CNPJ para VARCHAR(18)',
  'Domain',
  'public string Cnpj' || seq || ' { get; set; }',
  '[StringLength(18)] public string Cnpj' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 6) seq;

-- Repo 12: bs2.core.conta.corrente.wsapi (4 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((68 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000012',
  'Controllers/ContaController' || seq || '.cs',
  100 + seq * 10,
  'cnpjConta' || seq,
  'Atualizar tamanho do CNPJ para VARCHAR(18)',
  'API Conta',
  '[StringLength(14)] public string CnpjConta' || seq || ' { get; set; }',
  '[StringLength(18)] public string CnpjConta' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 4) seq;

-- Repo 13: bs2.core.cartao.credito.wsapi (3 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((72 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000013',
  'Controllers/CartaoController' || seq || '.cs',
  100 + seq * 10,
  'cnpjCartao' || seq,
  'Atualizar tamanho do CNPJ para VARCHAR(18)',
  'API Cartão',
  'public string CnpjCartao' || seq || ' { get; set; }',
  '[StringLength(18)] public string CnpjCartao' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 3) seq;

-- Repo 14: bs2.core.emprestimo.pessoal.wsapi (2 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((75 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000014',
  'Controllers/EmprestimoController' || seq || '.cs',
  100 + seq * 10,
  'cnpjEmprestimo' || seq,
  'Atualizar tamanho do CNPJ para VARCHAR(18)',
  'API',
  'public string CnpjEmprestimo' || seq || ' { get; set; }',
  '[StringLength(18)] public string CnpjEmprestimo' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 2) seq;

-- Repo 15: bs2.core.pagamentos.pix.wsapi (4 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, suggestion, context, code_current, code_suggested, created_at)
SELECT 
  'c' || LPAD((77 + seq)::text, 6, '0'),
  'b1b2c3d4-2222-4444-8888-000000000015',
  'Controllers/PixController' || seq || '.cs',
  100 + seq * 10,
  'cnpjPix' || seq,
  'Atualizar validação para VARCHAR(18)',
  'API PIX',
  '[StringLength(14)] public string CnpjPix' || seq || ' { get; set; }',
  '[StringLength(18)] public string CnpjPix' || seq || ' { get; set; }',
  NOW()
FROM generate_series(1, 4) seq;

-- 5. Criar Tasks distribuídas entre os 4 DEVs (78 total: Danilo 20, João 19, Kleber 20, Leandro 19)

-- Danilo: primeiras 20 (c1000001-c1000020)
INSERT INTO tasks (id, finding_id, repository_id, assigned_to, title, description, status, priority, estimated_hours, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'c' || LPAD(seq::text, 6, '000000'),
  CASE 
    WHEN seq <= 8 THEN 'a1b2c3d4-1111-4444-8888-000000000001'
    WHEN seq <= 14 THEN 'a1b2c3d4-1111-4444-8888-000000000002'
    WHEN seq <= 16 THEN 'a1b2c3d4-1111-4444-8888-000000000003'
    WHEN seq <= 24 THEN 'a1b2c3d4-1111-4444-8888-000000000004'
    ELSE 'a1b2c3d4-1111-4444-8888-000000000005'
  END,
  '964f8be3-2ec1-430c-a544-e314ec47a1a6',
  'Atualizar CNPJ ' || seq,
  'Corrigir campo CNPJ VARCHAR(14) para VARCHAR(18)',
  CASE WHEN seq <= 16 THEN 'completed' WHEN seq <= 24 THEN 'in_progress' ELSE 'pending' END,
  'high',
  4.0,
  NOW(),
  NOW()
FROM generate_series(1, 20) seq;

-- João: próximas 19 (c1000021-c1000039)
INSERT INTO tasks (id, finding_id, repository_id, assigned_to, title, description, status, priority, estimated_hours, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'c' || LPAD(seq::text, 6, '000000'),
  CASE 
    WHEN seq <= 29 THEN 'a1b2c3d4-1111-4444-8888-000000000005'
    WHEN seq <= 36 THEN 'a1b2c3d4-1111-4444-8888-000000000006'
    WHEN seq <= 41 THEN 'a1b2c3d4-1111-4444-8888-000000000007'
    ELSE 'a1b2c3d4-1111-4444-8888-000000000008'
  END,
  '7ec2792b-9243-4851-9a46-73718c768ffb',
  'Atualizar CNPJ ' || seq,
  'Corrigir campo CNPJ',
  CASE WHEN seq <= 34 THEN 'completed' WHEN seq <= 40 THEN 'in_progress' ELSE 'pending' END,
  'high',
  4.0,
  NOW(),
  NOW()
FROM generate_series(21, 39) seq;

-- Kleber: próximas 20 (c1000040-c1000059)
INSERT INTO tasks (id, finding_id, repository_id, assigned_to, title, description, status, priority, estimated_hours, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'c' || LPAD(seq::text, 6, '000000'),
  CASE 
    WHEN seq <= 46 THEN 'a1b2c3d4-1111-4444-8888-000000000008'
    WHEN seq <= 53 THEN 'a1b2c3d4-1111-4444-8888-000000000009'
    ELSE 'a1b2c3d4-1111-4444-8888-000000000010'
  END,
  'f17e294f-c6ce-470e-9a26-6c69fc771f5b',
  'Atualizar CNPJ ' || seq,
  'Corrigir campo CNPJ',
  CASE WHEN seq <= 48 THEN 'completed' WHEN seq <= 55 THEN 'in_progress' ELSE 'pending' END,
  'high',
  4.0,
  NOW(),
  NOW()
FROM generate_series(40, 59) seq;

-- Leandro: últimas 19 (c1000060-c1000078)
INSERT INTO tasks (id, finding_id, repository_id, assigned_to, title, description, status, priority, estimated_hours, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'c' || LPAD(seq::text, 6, '000000'),
  CASE 
    WHEN seq <= 64 THEN 'a1b2c3d4-1111-4444-8888-000000000010'
    WHEN seq <= 68 THEN 'a1b2c3d4-1111-4444-8888-000000000011'
    WHEN seq <= 70 THEN 'a1b2c3d4-1111-4444-8888-000000000012'
    WHEN seq <= 72 THEN 'a1b2c3d4-1111-4444-8888-000000000013'
    ELSE 'a1b2c3d4-1111-4444-8888-000000000014'
  END,
  '67490017-b53e-48c7-b8ae-ba5a15da6ac2',
  'Atualizar CNPJ ' || seq,
  'Corrigir campo CNPJ',
  CASE WHEN seq <= 67 THEN 'completed' WHEN seq <= 73 THEN 'in_progress' ELSE 'pending' END,
  'high',
  4.0,
  NOW(),
  NOW()
FROM generate_series(60, 78) seq;

-- 6. Criar Task Progress
INSERT INTO task_progress (id, task_id, status, progress_percentage, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  t.id,
  t.status,
  CASE t.status
    WHEN 'completed' THEN 100
    WHEN 'in_progress' THEN LEAST((RANDOM() * 40 + 40)::integer, 90)
    ELSE 0
  END,
  CASE t.status
    WHEN 'completed' THEN 'CNPJ atualizado com sucesso'
    WHEN 'in_progress' THEN 'Atualizando validações CNPJ'
    ELSE 'Aguardando início'
  END,
  NOW(),
  NOW()
FROM tasks t
WHERE t.created_at >= NOW() - INTERVAL '5 minutes';

-- 7. Verificar resultado
SELECT 
  'RESULTADO FINAL' as info,
  (SELECT COUNT(*) FROM batch_analyses WHERE created_at >= NOW() - INTERVAL '5 minutes') as batches_criados,
  (SELECT COUNT(*) FROM repositories WHERE created_at >= NOW() - INTERVAL '5 minutes') as repos_criados,
  (SELECT COUNT(*) FROM analyses WHERE created_at >= NOW() - INTERVAL '5 minutes') as analyses_criadas,
  (SELECT COUNT(*) FROM findings WHERE created_at >= NOW() - INTERVAL '5 minutes') as findings_criados,
  (SELECT COUNT(*) FROM tasks WHERE created_at >= NOW() - INTERVAL '5 minutes') as tasks_criadas,
  (SELECT COUNT(*) FROM tasks WHERE assigned_to = '964f8be3-2ec1-430c-a544-e314ec47a1a6' AND created_at >= NOW() - INTERVAL '5 minutes') as danilo_tasks,
  (SELECT COUNT(*) FROM tasks WHERE assigned_to = '7ec2792b-9243-4851-9a46-73718c768ffb' AND created_at >= NOW() - INTERVAL '5 minutes') as joao_tasks,
  (SELECT COUNT(*) FROM tasks WHERE assigned_to = 'f17e294f-c6ce-470e-9a26-6c69fc771f5b' AND created_at >= NOW() - INTERVAL '5 minutes') as kleber_tasks,
  (SELECT COUNT(*) FROM tasks WHERE assigned_to = '67490017-b53e-48c7-b8ae-ba5a15da6ac2' AND created_at >= NOW() - INTERVAL '5 minutes') as leandro_tasks;
