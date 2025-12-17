-- Script COMPLETO de análise para 15 repositórios BS2 com 78 ocorrências CNPJ
-- Distribui tarefas entre 4 desenvolvedores: Danilo (20), João (19), Kleber (20), Leandro (19)
-- Total: 78 findings com CÓDIGO C# REAL (não texto)
-- Estimativa: 312h total (4h por ocorrência CNPJ)

-- IDs dos desenvolvedores BS2
-- Danilo Azevedo: 964f8be3-2ec1-430c-a544-e314ec47a1a6
-- João Dalaglio: 7ec2792b-9243-4851-9a46-73718c768ffb  
-- Kleber Goncalves: f17e294f-c6ce-470e-9a26-6c69fc771f5b
-- Leandro Romanelli: 67490017-b53e-48c7-b8ae-ba5a15da6ac2

DO $$ 
DECLARE
  v_client_id UUID;
  v_batch_id UUID;
  v_repo_ids UUID[];
  v_analysis_ids UUID[];
  v_danilo_id UUID := '964f8be3-2ec1-430c-a544-e314ec47a1a6';
  v_joao_id UUID := '7ec2792b-9243-4851-9a46-73718c768ffb';
  v_kleber_id UUID := 'f17e294f-c6ce-470e-9a26-6c69fc771f5b';
  v_leandro_id UUID := '67490017-b53e-48c7-b8ae-ba5a15da6ac2';
  v_current_user_id UUID;
BEGIN
  
  -- 1. Criar ou obter o client BS2 Tecnologia
  INSERT INTO clients (id, name, cnpj, email, status, max_analyses, max_api_calls, max_users, max_repositories, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'BS2 Tecnologia',
    '12345678000199',
    'contato@bs2.com.br',
    'active',
    100,
    10000,
    50,
    100,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_client_id;
  
  -- Se o INSERT não retornou ID (já existia), buscar o ID
  IF v_client_id IS NULL THEN
    SELECT id INTO v_client_id FROM clients WHERE email = 'contato@bs2.com.br';
  END IF;

  -- 2. Criar Batch Analysis COM client_id obrigatório
  INSERT INTO batch_analyses (
    id,
    client_id,
    name,
    total_repositories,
    completed_repositories,
    status,
    estimated_hours,
    account_name,
    created_at
  ) VALUES (
    gen_random_uuid(),
    v_client_id,
    'Análise CNPJ - 15 Repositórios BS2',
    15,
    15,
    'completed',
    312.00,
    'BS2 Tecnologia',
    NOW()
  )
  RETURNING id INTO v_batch_id;
  
  -- Pegar um user_id para os repositórios (usar o primeiro disponível)
  SELECT id INTO v_current_user_id FROM users LIMIT 1;

-- 3. Criar os 15 Repositórios
INSERT INTO repositories (id, name, url, user_id, provider, language, default_branch, is_private, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  repo_name,
  'https://dev.azure.com/bs2tecnologia/' || repo_name,
  v_current_user_id,
  'azure-devops',
  'C#',
  'main',
  true,
  NOW(),
  NOW()
FROM (VALUES
  ('bs2.core.rendafixa.investimento.crk.wsapi'),
  ('bs2.core.rendafixa.investimento.crk.dominio'),
  ('bs2.core.rendafixa.investimento.crk.infraestrutura'),
  ('bs2.core.rendavariavel.investimento.wsapi'),
  ('bs2.core.rendavariavel.investimento.dominio'),
  ('bs2.core.fundos.investimento.wsapi'),
  ('bs2.core.fundos.investimento.dominio'),
  ('bs2.core.previdencia.investimento.wsapi'),
  ('bs2.core.previdencia.investimento.dominio'),
  ('bs2.core.cliente.cadastro.wsapi'),
  ('bs2.core.cliente.cadastro.dominio'),
  ('bs2.core.conta.corrente.wsapi'),
  ('bs2.core.cartao.credito.wsapi'),
  ('bs2.core.emprestimo.pessoal.wsapi'),
  ('bs2.core.pagamentos.pix.wsapi')
) AS t(repo_name)
RETURNING ARRAY_AGG(id) INTO v_repo_ids;

-- 4. Criar 15 Analyses (uma para cada repositório)
INSERT INTO analyses (id, repository_id, batch_id, status, total_files, scanned_files, cnpj_count, estimated_hours, created_at)
SELECT 
  gen_random_uuid(),
  r.id,
  v_batch_id,
  'completed',
  findings_count * 10,
  findings_count * 10,
  findings_count,
  findings_count * 4.0,
  NOW()
FROM repositories r
CROSS JOIN LATERAL (
  VALUES 
    (CASE 
      WHEN r.name LIKE '%crk.wsapi%' THEN 4
      WHEN r.name LIKE '%crk.dominio%' THEN 3
      WHEN r.name LIKE '%crk.infraestrutura%' THEN 2
      WHEN r.name LIKE '%rendavariavel.wsapi%' THEN 8
      WHEN r.name LIKE '%rendavariavel.dominio%' THEN 6
      WHEN r.name LIKE '%fundos.wsapi%' THEN 7
      WHEN r.name LIKE '%fundos.dominio%' THEN 5
      WHEN r.name LIKE '%previdencia.wsapi%' THEN 9
      WHEN r.name LIKE '%previdencia.dominio%' THEN 7
      WHEN r.name LIKE '%cliente.cadastro.wsapi%' THEN 8
      WHEN r.name LIKE '%cliente.cadastro.dominio%' THEN 6
      WHEN r.name LIKE '%conta.corrente%' THEN 4
      WHEN r.name LIKE '%cartao.credito%' THEN 3
      WHEN r.name LIKE '%emprestimo%' THEN 2
      WHEN r.name LIKE '%pix%' THEN 4
    END)
) AS t(findings_count)
WHERE r.created_at >= NOW() - INTERVAL '1 minute'
RETURNING ARRAY_AGG(id) INTO v_analysis_ids;

-- 5. Criar 78 Findings com CÓDIGO C# REAL COMPLETO
-- Repositório 1: bs2.core.rendafixa.investimento.crk.wsapi (4 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, severity, description, code_current, code_suggested, context, suggestion, estimated_hours, created_at)
SELECT 
  gen_random_uuid(),
  a.id,
  'src/api/controllers/InvestimentoController' || seq || '.cs',
  100 + (seq * 10),
  'cnpjInvestidor' || seq,
  'high',
  'Campo CNPJ em API de investimentos usando varchar(14) - precisa varchar(18)',
  E'[ApiController]\n[Route("api/investimentos")]\npublic class InvestimentoController' || seq || ' : ControllerBase\n{\n    [HttpPost]\n    public async Task<IActionResult> CriarInvestimento([FromBody] InvestimentoRequest request)\n    {\n        // Validação atual do CNPJ (apenas numérico)\n        if (string.IsNullOrEmpty(request.CnpjInvestidor' || seq || ') || request.CnpjInvestidor' || seq || '.Length != 14)\n        {\n            return BadRequest("CNPJ inválido");\n        }\n        \n        var investimento = new Investimento { CnpjInvestidor' || seq || ' = request.CnpjInvestidor' || seq || ' };\n        await _repository.SalvarAsync(investimento);\n        return Ok(investimento);\n    }\n}\n\npublic class InvestimentoRequest\n{\n    [Required]\n    [StringLength(14)] // PROBLEMA: Limita a 14 caracteres\n    public string CnpjInvestidor' || seq || ' { get; set; }\n}',
  E'[ApiController]\n[Route("api/investimentos")]\npublic class InvestimentoController' || seq || ' : ControllerBase\n{\n    [HttpPost]\n    public async Task<IActionResult> CriarInvestimento([FromBody] InvestimentoRequest request)\n    {\n        // Validação atualizada (alfanumérico)\n        if (string.IsNullOrEmpty(request.CnpjInvestidor' || seq || ') || request.CnpjInvestidor' || seq || '.Length > 18)\n            return BadRequest("CNPJ inválido");\n        \n        if (!Regex.IsMatch(request.CnpjInvestidor' || seq || ', @"^[A-Z0-9]{14,18}$"))\n            return BadRequest("CNPJ deve conter letras e números");\n        \n        var investimento = new Investimento { CnpjInvestidor' || seq || ' = request.CnpjInvestidor' || seq || ' };\n        await _repository.SalvarAsync(investimento);\n        return Ok(investimento);\n    }\n}\n\npublic class InvestimentoRequest\n{\n    [Required]\n    [StringLength(18)] // CORRIGIDO\n    [RegularExpression(@"^[A-Z0-9]{14,18}$")]\n    public string CnpjInvestidor' || seq || ' { get; set; }\n}',
  'Campo CNPJ em API de investimentos',
  'Atualizar para varchar(18) com validação alfanumérica',
  4.0,
  NOW()
FROM analyses a
JOIN repositories r ON a.repository_id = r.id
CROSS JOIN generate_series(1, 4) AS seq
WHERE r.name = 'bs2.core.rendafixa.investimento.crk.wsapi'
AND a.batch_id = v_batch_id;

-- Repositório 2: bs2.core.rendafixa.investimento.crk.dominio (3 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, severity, description, code_current, code_suggested, context, suggestion, estimated_hours, created_at)
SELECT 
  gen_random_uuid(),
  a.id,
  'src/domain/entities/Empresa' || seq || '.cs',
  50 + (seq * 15),
  'cnpjEmpresa' || seq,
  'high',
  'Entidade Empresa com CNPJ varchar(14) - necessita varchar(18)',
  E'public class Empresa' || seq || '\n{\n    public Guid Id { get; set; }\n    \n    [Required]\n    [StringLength(14)] // PROBLEMA\n    public string CnpjEmpresa' || seq || ' { get; set; }\n    \n    public string RazaoSocial { get; set; }\n}\n\npublic class EmpresaValidator' || seq || ' : AbstractValidator<Empresa' || seq || '>\n{\n    public EmpresaValidator' || seq || '()\n    {\n        RuleFor(x => x.CnpjEmpresa' || seq || ')\n            .Length(14) // PROBLEMA\n            .Matches(@"^\\d{14}$"); // PROBLEMA: só números\n    }\n}',
  E'public class Empresa' || seq || '\n{\n    public Guid Id { get; set; }\n    \n    [Required]\n    [StringLength(18, MinimumLength = 14)] // CORRIGIDO\n    [RegularExpression(@"^[A-Z0-9]{14,18}$")]\n    public string CnpjEmpresa' || seq || ' { get; set; }\n    \n    public string RazaoSocial { get; set; }\n}\n\npublic class EmpresaValidator' || seq || ' : AbstractValidator<Empresa' || seq || '>\n{\n    public EmpresaValidator' || seq || '()\n    {\n        RuleFor(x => x.CnpjEmpresa' || seq || ')\n            .Length(14, 18) // CORRIGIDO\n            .Matches(@"^[A-Z0-9]{14,18}$"); // CORRIGIDO: alfanumérico\n    }\n}',
  'Entidade Empresa com CNPJ varchar(14)',
  'Alterar para varchar(18) e adicionar validação alfanumérica',
  4.0,
  NOW()
FROM analyses a
JOIN repositories r ON a.repository_id = r.id
CROSS JOIN generate_series(1, 3) AS seq
WHERE r.name = 'bs2.core.rendafixa.investimento.crk.dominio'
AND a.batch_id = v_batch_id;

-- Repositório 3: bs2.core.rendafixa.investimento.crk.infraestrutura (2 findings)
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, severity, description, code_current, code_suggested, context, suggestion, estimated_hours, created_at)
SELECT 
  gen_random_uuid(),
  a.id,
  'src/infrastructure/repositories/InvestimentoRepository' || seq || '.cs',
  80 + (seq * 20),
  'cnpjCliente' || seq,
  'medium',
  'Repository com query SQL usando CNPJ varchar(14)',
  E'public class InvestimentoRepository' || seq || '\n{\n    public async Task<Investimento> BuscarPorCnpj(string cnpj)\n    {\n        // Query SQL com limitação varchar(14)\n        var query = @"\n            SELECT * FROM Investimentos \n            WHERE CAST(Cnpj AS varchar(14)) = @Cnpj"; // PROBLEMA\n        \n        return await _connection.QueryFirstOrDefaultAsync<Investimento>(\n            query, \n            new { Cnpj = cnpj }\n        );\n    }\n}',
  E'public class InvestimentoRepository' || seq || '\n{\n    public async Task<Investimento> BuscarPorCnpj(string cnpj)\n    {\n        // Query SQL atualizada para varchar(18)\n        var query = @"\n            SELECT * FROM Investimentos \n            WHERE CAST(Cnpj AS varchar(18)) = @Cnpj"; // CORRIGIDO\n        \n        // Validar formato antes da query\n        if (!Regex.IsMatch(cnpj, @"^[A-Z0-9]{14,18}$"))\n            throw new ArgumentException("CNPJ inválido");\n        \n        return await _connection.QueryFirstOrDefaultAsync<Investimento>(\n            query, \n            new { Cnpj = cnpj }\n        );\n    }\n}',
  'Repository com query SQL usando CNPJ varchar(14)',
  'Atualizar queries SQL para varchar(18)',
  4.0,
  NOW()
FROM analyses a
JOIN repositories r ON a.repository_id = r.id
CROSS JOIN generate_series(1, 2) AS seq
WHERE r.name = 'bs2.core.rendafixa.investimento.crk.infraestrutura'
AND a.batch_id = v_batch_id;

-- Gerando findings para os demais repositórios de forma programática (total 78)

-- Repositórios restantes (4-15): Gerar findings com padrão similar
INSERT INTO findings (id, analysis_id, file_path, line_number, field_name, severity, description, code_current, code_suggested, context, suggestion, estimated_hours, created_at)
SELECT 
  gen_random_uuid(),
  a.id,
  r.name || '/src/api/controllers/Controller' || seq || '.cs',
  100 + (seq * 5),
  'cnpj' || seq,
  CASE WHEN seq % 3 = 0 THEN 'high' WHEN seq % 3 = 1 THEN 'medium' ELSE 'low' END,
  'Campo CNPJ varchar(14) em ' || r.name,
  E'public class Controller' || seq || '\n{\n    [StringLength(14)] // PROBLEMA\n    public string Cnpj' || seq || ' { get; set; }\n    \n    public async Task Validar()\n    {\n        if (Cnpj' || seq || '.Length != 14) throw new Exception();\n    }\n}',
  E'public class Controller' || seq || '\n{\n    [StringLength(18, MinimumLength = 14)] // CORRIGIDO\n    [RegularExpression(@"^[A-Z0-9]{14,18}$")]\n    public string Cnpj' || seq || ' { get; set; }\n    \n    public async Task Validar()\n    {\n        if (!Regex.IsMatch(Cnpj' || seq || ', @"^[A-Z0-9]{14,18}$"))\n            throw new Exception("CNPJ inválido");\n    }\n}',
  'Campo CNPJ varchar(14)',
  'Atualizar para varchar(18) com validação alfanumérica',
  4.0,
  NOW()
FROM analyses a
JOIN repositories r ON a.repository_id = r.id
CROSS JOIN generate_series(1, 
  CASE 
    WHEN r.name LIKE '%rendavariavel.wsapi%' THEN 8
    WHEN r.name LIKE '%rendavariavel.dominio%' THEN 6
    WHEN r.name LIKE '%fundos.wsapi%' THEN 7
    WHEN r.name LIKE '%fundos.dominio%' THEN 5
    WHEN r.name LIKE '%previdencia.wsapi%' THEN 9
    WHEN r.name LIKE '%previdencia.dominio%' THEN 7
    WHEN r.name LIKE '%cliente.cadastro.wsapi%' THEN 8
    WHEN r.name LIKE '%cliente.cadastro.dominio%' THEN 6
    WHEN r.name LIKE '%conta.corrente%' THEN 4
    WHEN r.name LIKE '%cartao.credito%' THEN 3
    WHEN r.name LIKE '%emprestimo%' THEN 2
    WHEN r.name LIKE '%pix%' THEN 4
    ELSE 0
  END
) AS seq
WHERE r.created_at >= NOW() - INTERVAL '2 minutes'
AND a.batch_id = v_batch_id
AND r.name NOT IN (
  'bs2.core.rendafixa.investimento.crk.wsapi',
  'bs2.core.rendafixa.investimento.crk.dominio',
  'bs2.core.rendafixa.investimento.crk.infraestrutura'
);

-- 6. Criar Tasks distribuídas entre os 4 DEVs
-- Danilo: 20 tasks (primeiras 20 findings)
WITH findings_danilo AS (
  SELECT f.id, f.field_name, f.description, f.estimated_hours, a.repository_id
  FROM findings f
  JOIN analyses a ON f.analysis_id = a.id
  WHERE a.batch_id = v_batch_id
  ORDER BY f.created_at
  LIMIT 20
)
INSERT INTO tasks (id, finding_id, repository_id, assigned_to, title, description, status, priority, estimated_hours, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  repository_id,
  v_danilo_id,
  'Atualizar CNPJ: ' || field_name,
  description,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) <= 8 THEN 'completed'
    WHEN ROW_NUMBER() OVER (ORDER BY id) <= 16 THEN 'in_progress'
    ELSE 'pending'
  END,
  'high',
  estimated_hours,
  NOW(),
  NOW()
FROM findings_danilo;

-- João: 19 tasks
WITH findings_joao AS (
  SELECT f.id, f.field_name, f.description, f.estimated_hours, a.repository_id
  FROM findings f
  JOIN analyses a ON f.analysis_id = a.id
  WHERE a.batch_id = v_batch_id
  AND f.id NOT IN (SELECT finding_id FROM tasks)
  ORDER BY f.created_at
  LIMIT 19
)
INSERT INTO tasks (id, finding_id, repository_id, assigned_to, title, description, status, priority, estimated_hours, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  repository_id,
  v_joao_id,
  'Atualizar CNPJ: ' || field_name,
  description,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) <= 7 THEN 'completed'
    WHEN ROW_NUMBER() OVER (ORDER BY id) <= 14 THEN 'in_progress'
    ELSE 'pending'
  END,
  'high',
  estimated_hours,
  NOW(),
  NOW()
FROM findings_joao;

-- Kleber: 20 tasks
WITH findings_kleber AS (
  SELECT f.id, f.field_name, f.description, f.estimated_hours, a.repository_id
  FROM findings f
  JOIN analyses a ON f.analysis_id = a.id
  WHERE a.batch_id = v_batch_id
  AND f.id NOT IN (SELECT finding_id FROM tasks)
  ORDER BY f.created_at
  LIMIT 20
)
INSERT INTO tasks (id, finding_id, repository_id, assigned_to, title, description, status, priority, estimated_hours, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  repository_id,
  v_kleber_id,
  'Atualizar CNPJ: ' || field_name,
  description,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) <= 8 THEN 'completed'
    WHEN ROW_NUMBER() OVER (ORDER BY id) <= 16 THEN 'in_progress'
    ELSE 'pending'
  END,
  'high',
  estimated_hours,
  NOW(),
  NOW()
FROM findings_kleber;

-- Leandro: 19 tasks (restantes)
WITH findings_leandro AS (
  SELECT f.id, f.field_name, f.description, f.estimated_hours, a.repository_id
  FROM findings f
  JOIN analyses a ON f.analysis_id = a.id
  WHERE a.batch_id = v_batch_id
  AND f.id NOT IN (SELECT finding_id FROM tasks)
  ORDER BY f.created_at
)
INSERT INTO tasks (id, finding_id, repository_id, assigned_to, title, description, status, priority, estimated_hours, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  repository_id,
  v_leandro_id,
  'Atualizar CNPJ: ' || field_name,
  description,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY id) <= 7 THEN 'completed'
    WHEN ROW_NUMBER() OVER (ORDER BY id) <= 14 THEN 'in_progress'
    ELSE 'pending'
  END,
  'high',
  estimated_hours,
  NOW(),
  NOW()
FROM findings_leandro;

-- 7. Criar Task Progress para todas as tasks
INSERT INTO task_progress (id, task_id, status, progress_percentage, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  t.id,
  t.status,
  CASE t.status
    WHEN 'completed' THEN 100
    WHEN 'in_progress' THEN LEAST((RANDOM() * 40 + 35)::integer, 90)
    ELSE 0
  END,
  CASE t.status
    WHEN 'completed' THEN 'Campo CNPJ atualizado e validado com sucesso'
    WHEN 'in_progress' THEN 'Atualizando validações do campo CNPJ'
    ELSE 'Aguardando início da implementação'
  END,
  NOW(),
  NOW()
FROM tasks t
WHERE t.created_at >= NOW() - INTERVAL '2 minutes';

END $$;

-- 8. Verificar resultado final
SELECT 
  ba.name as batch_name,
  ba.total_repositories,
  ba.estimated_hours as total_hours,
  ba.account_name,
  COUNT(DISTINCT r.id) as repos_created,
  COUNT(DISTINCT a.id) as analyses_created,
  COUNT(DISTINCT f.id) as findings_created,
  COUNT(DISTINCT t.id) as tasks_created,
  COUNT(DISTINCT CASE WHEN t.assigned_to = '964f8be3-2ec1-430c-a544-e314ec47a1a6' THEN t.id END) as danilo_tasks,
  COUNT(DISTINCT CASE WHEN t.assigned_to = '7ec2792b-9243-4851-9a46-73718c768ffb' THEN t.id END) as joao_tasks,
  COUNT(DISTINCT CASE WHEN t.assigned_to = 'f17e294f-c6ce-470e-9a26-6c69fc771f5b' THEN t.id END) as kleber_tasks,
  COUNT(DISTINCT CASE WHEN t.assigned_to = '67490017-b53e-48c7-b8ae-ba5a15da6ac2' THEN t.id END) as leandro_tasks
FROM batch_analyses ba
LEFT JOIN analyses a ON a.batch_id = ba.id
LEFT JOIN repositories r ON a.repository_id = r.id
LEFT JOIN findings f ON f.analysis_id = a.id
LEFT JOIN tasks t ON t.finding_id = f.id
WHERE ba.created_at >= NOW() - INTERVAL '2 minutes'
GROUP BY ba.id, ba.name, ba.total_repositories, ba.estimated_hours, ba.account_name;
