-- Remove any triggers that reference old fields
DO $$ 
BEGIN
    -- Drop triggers if they exist
    DROP TRIGGER IF EXISTS check_client_license ON clients;
    DROP TRIGGER IF EXISTS validate_client_license ON clients;
    DROP TRIGGER IF EXISTS update_client_license ON clients;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Create 4 developers and 56 tasks (14 for each)

-- First, ensure we have the Aegis Technology client
INSERT INTO clients (id, name, cnpj, email, phone, status, max_users, max_repositories, max_analyses, max_api_calls, created_at, updated_at)
VALUES (
  '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid,
  'Aegis Technology',
  '12345678000190',
  'contato@aegistech.com',
  '(11) 98765-4321',
  'active',
  50,
  100,
  1000,
  10000,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Create 4 Developers
INSERT INTO users (id, name, email, password_hash, role, client_id, status, created_at, updated_at)
VALUES 
  -- DEV 1: Carlos Silva
  ('d1111111-1111-1111-1111-111111111111'::uuid, 'Carlos Silva', 'carlos.silva@aegistech.com', crypt('Dev@1234', gen_salt('bf')), 'DEV', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'active', NOW(), NOW()),
  -- DEV 2: Ana Santos
  ('d2222222-2222-2222-2222-222222222222'::uuid, 'Ana Santos', 'ana.santos@aegistech.com', crypt('Dev@1234', gen_salt('bf')), 'DEV', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'active', NOW(), NOW()),
  -- DEV 3: Bruno Costa
  ('d3333333-3333-3333-3333-333333333333'::uuid, 'Bruno Costa', 'bruno.costa@aegistech.com', crypt('Dev@1234', gen_salt('bf')), 'DEV', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'active', NOW(), NOW()),
  -- DEV 4: Mariana Oliveira
  ('d4444444-4444-4444-4444-444444444444'::uuid, 'Mariana Oliveira', 'mariana.oliveira@aegistech.com', crypt('Dev@1234', gen_salt('bf')), 'DEV', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'active', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Create 14 tasks for Carlos Silva (DEV 1)
INSERT INTO tasks (id, title, description, status, priority, client_id, assigned_to, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Implementar validação de CNPJ no formulário de cadastro', 'Adicionar validação de CNPJ alfanumérico com máscara e verificação de dígitos', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Corrigir bug no campo CNPJ da tela de clientes', 'O campo aceita letras em posições incorretas', 'in_progress', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar componente de input CNPJ reutilizável', 'Desenvolver componente React para input de CNPJ com validação', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar testes unitários para validação de CNPJ', 'Cobrir todos os casos de uso da validação', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar API de consulta de CNPJ na Receita Federal', 'Integrar com API pública para validar CNPJ', 'in_progress', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Atualizar documentação técnica do módulo CNPJ', 'Documentar formato alfanumérico e regras de validação', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Otimizar performance da validação de CNPJ em lote', 'Melhorar algoritmo para validar múltiplos CNPJs simultaneamente', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar cache para consultas de CNPJ', 'Reduzir chamadas à API externa usando Redis', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar tela de relatório de CNPJs inválidos', 'Dashboard para visualizar CNPJs que falharam na validação', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar logs detalhados de validação', 'Registrar todas as tentativas de validação para auditoria', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar retry automático para API de CNPJ', 'Adicionar mecanismo de retry em caso de falha', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Migrar CNPJs antigos para novo formato', 'Script de migração de dados do formato numérico para alfanumérico', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar webhook para notificar validações de CNPJ', 'Enviar notificação quando CNPJ for validado ou rejeitado', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar suporte a CNPJ internacional', 'Implementar validação para CNPJs de empresas estrangeiras', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, NOW(), NOW());

-- Create 14 tasks for Ana Santos (DEV 2)
INSERT INTO tasks (id, title, description, status, priority, client_id, assigned_to, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Desenvolver interface de busca de empresas por CNPJ', 'Tela para buscar empresas usando CNPJ alfanumérico', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar filtros avançados na listagem de CNPJs', 'Adicionar filtros por status, data, tipo', 'in_progress', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar modal de detalhes do CNPJ', 'Exibir informações completas ao clicar em um CNPJ', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar paginação na listagem de CNPJs', 'Implementar paginação server-side', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar export de CNPJs para Excel', 'Permitir download da listagem em formato XLSX', 'in_progress', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar gráficos de análise de CNPJs', 'Dashboard com estatísticas de CNPJs validados', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar modo dark theme na aplicação', 'Implementar tema escuro em todas as páginas', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Otimizar carregamento da listagem de CNPJs', 'Implementar lazy loading e virtualização', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar histórico de alterações de CNPJ', 'Registrar todas as modificações feitas em CNPJs', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar busca inteligente com autocomplete', 'Sugestões de CNPJs enquanto usuário digita', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar notificações toast de sucesso/erro', 'Feedback visual para ações do usuário', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar breadcrumbs de navegação', 'Melhorar UX com navegação hierárquica', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar drag and drop para organizar CNPJs', 'Permitir reorganização manual da lista', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar tour guiado para novos usuários', 'Onboarding interativo explicando funcionalidades', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, NOW(), NOW());

-- Create 14 tasks for Bruno Costa (DEV 3)
INSERT INTO tasks (id, title, description, status, priority, client_id, assigned_to, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Configurar pipeline CI/CD para o projeto', 'Automatizar testes e deploy usando GitHub Actions', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar testes E2E com Playwright', 'Cobrir fluxos principais da aplicação', 'in_progress', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Configurar monitoramento com Sentry', 'Rastrear erros em produção', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar rate limiting nas APIs', 'Proteger endpoints contra abuso', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar autenticação JWT', 'Implementar sistema de tokens para APIs', 'in_progress', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Configurar backup automático do banco', 'Agendar backups diários do PostgreSQL', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar middleware de logging', 'Registrar todas as requisições HTTP', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar documentação Swagger das APIs', 'Documentar todos os endpoints', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Otimizar queries do banco de dados', 'Adicionar índices e otimizar consultas lentas', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar health check endpoints', 'Verificar saúde da aplicação e dependências', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Configurar SSL/TLS em produção', 'Garantir comunicação segura', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar sistema de filas com Bull', 'Processar tarefas assíncronas', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar compressão gzip nas respostas', 'Reduzir tamanho dos payloads', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar versionamento de APIs', 'Criar v1, v2 dos endpoints', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd3333333-3333-3333-3333-333333333333'::uuid, NOW(), NOW());

-- Create 14 tasks for Mariana Oliveira (DEV 4)
INSERT INTO tasks (id, title, description, status, priority, client_id, assigned_to, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Implementar sistema de permissões granulares', 'Controle de acesso baseado em roles', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar tela de gerenciamento de usuários', 'CRUD completo de usuários do sistema', 'in_progress', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar recuperação de senha por email', 'Fluxo completo de reset de senha', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar autenticação de dois fatores (2FA)', 'Aumentar segurança com TOTP', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar logs de auditoria de ações críticas', 'Registrar operações sensíveis', 'in_progress', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar bloqueio de conta após tentativas falhas', 'Prevenir ataques de força bruta', 'pending', 'high', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar sessões múltiplas por usuário', 'Permitir login em vários dispositivos', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar notificações de login suspeito', 'Alertar usuário sobre acessos incomuns', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar política de senhas fortes', 'Validar complexidade das senhas', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar expiração de sessões', 'Logout automático após inatividade', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar relatório de acessos por usuário', 'Dashboard de atividades de login', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Implementar SSO com Google e Microsoft', 'Login social via OAuth', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Adicionar wizard de onboarding para novos usuários', 'Guia inicial de configuração', 'pending', 'low', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW()),
  (gen_random_uuid(), 'Criar sistema de convites por email', 'Convidar novos usuários para a plataforma', 'pending', 'medium', '56747e7f-16ad-47a1-a7bc-513934d3a684'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, NOW(), NOW());
