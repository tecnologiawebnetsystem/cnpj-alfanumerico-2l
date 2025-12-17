-- ============================================================
-- Script: Dados de Demonstração para Super Admin
-- Descrição: Popula o banco com dados realistas para todas as áreas
-- ============================================================

-- ============================================================
-- 1. CRIAR PLANOS (se não existirem)
-- ============================================================

INSERT INTO plans (id, name, display_name, description, price_monthly, price_quarterly, price_annual, features, limits, is_active, is_popular, sort_order, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'basic',
    'Plano Básico',
    'Ideal para pequenas empresas e startups',
    299.00,
    807.30,
    3228.00,
    '{"analyses_per_month": 10, "repositories": 5, "users": 3, "support": "email"}'::jsonb,
    '{"max_repositories": 5, "max_users": 3, "max_analyses": 10, "max_api_calls": 1000}'::jsonb,
    true,
    false,
    1,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'professional',
    'Plano Profissional',
    'Para empresas em crescimento',
    699.00,
    1887.30,
    7548.00,
    '{"analyses_per_month": 50, "repositories": 20, "users": 10, "support": "priority"}'::jsonb,
    '{"max_repositories": 20, "max_users": 10, "max_analyses": 50, "max_api_calls": 5000}'::jsonb,
    true,
    true,
    2,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'enterprise',
    'Plano Enterprise',
    'Para grandes empresas',
    1999.00,
    5397.30,
    21588.00,
    '{"analyses_per_month": -1, "repositories": -1, "users": -1, "support": "dedicated"}'::jsonb,
    '{"max_repositories": -1, "max_users": -1, "max_analyses": -1, "max_api_calls": -1}'::jsonb,
    true,
    false,
    3,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO UPDATE SET
  updated_at = NOW();

-- ============================================================
-- 2. CRIAR CLIENTES (5 empresas diferentes)
-- ============================================================

INSERT INTO clients (id, name, cnpj, email, phone, status, max_repositories, max_users, max_analyses, max_api_calls, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'TechCorp Solutions',
    '12345678000190',
    'contato@techcorp.com.br',
    '(11) 98765-4321',
    'active',
    20,
    10,
    50,
    5000,
    NOW() - INTERVAL '6 months',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Inovação Digital LTDA',
    '98765432000180',
    'contato@inovacaodigital.com.br',
    '(21) 99876-5432',
    'active',
    10,
    5,
    25,
    2500,
    NOW() - INTERVAL '4 months',
    NOW()
  ),
  (
    gen_random_uuid(),
    'CodeMasters Desenvolvimento',
    '11223344000155',
    'contato@codemasters.dev',
    '(11) 91234-5678',
    'active',
    15,
    8,
    40,
    4000,
    NOW() - INTERVAL '3 months',
    NOW()
  ),
  (
    gen_random_uuid(),
    'StartupLab Tecnologia',
    '55667788000199',
    'info@startuplab.com',
    '(47) 98123-4567',
    'trial',
    5,
    3,
    10,
    1000,
    NOW() - INTERVAL '15 days',
    NOW()
  ),
  (
    gen_random_uuid(),
    'Enterprise Systems SA',
    '22334455000166',
    'contact@enterprisesys.com.br',
    '(11) 97654-3210',
    'active',
    50,
    25,
    200,
    20000,
    NOW() - INTERVAL '1 year',
    NOW()
  )
ON CONFLICT (cnpj) DO NOTHING;

-- ============================================================
-- 3. CRIAR ASSINATURAS PARA OS CLIENTES
-- ============================================================

DO $$
DECLARE
  v_basic_plan_id UUID;
  v_professional_plan_id UUID;
  v_enterprise_plan_id UUID;
  v_client1_id UUID;
  v_client2_id UUID;
  v_client3_id UUID;
  v_client4_id UUID;
  v_client5_id UUID;
BEGIN
  -- Buscar IDs dos planos
  SELECT id INTO v_basic_plan_id FROM plans WHERE name = 'basic' LIMIT 1;
  SELECT id INTO v_professional_plan_id FROM plans WHERE name = 'professional' LIMIT 1;
  SELECT id INTO v_enterprise_plan_id FROM plans WHERE name = 'enterprise' LIMIT 1;

  -- Buscar IDs dos clientes
  SELECT id INTO v_client1_id FROM clients WHERE cnpj = '12345678000190' LIMIT 1;
  SELECT id INTO v_client2_id FROM clients WHERE cnpj = '98765432000180' LIMIT 1;
  SELECT id INTO v_client3_id FROM clients WHERE cnpj = '11223344000155' LIMIT 1;
  SELECT id INTO v_client4_id FROM clients WHERE cnpj = '55667788000199' LIMIT 1;
  SELECT id INTO v_client5_id FROM clients WHERE cnpj = '22334455000166' LIMIT 1;

  -- Criar assinaturas
  INSERT INTO subscriptions (id, client_id, plan_id, status, billing_cycle, current_period_start, current_period_end, trial_start, trial_end, created_at, updated_at)
  VALUES
    (gen_random_uuid(), v_client1_id, v_professional_plan_id, 'active', 'monthly', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', NULL, NULL, NOW() - INTERVAL '6 months', NOW()),
    (gen_random_uuid(), v_client2_id, v_basic_plan_id, 'active', 'annual', CURRENT_DATE - INTERVAL '2 months', CURRENT_DATE + INTERVAL '10 months', NULL, NULL, NOW() - INTERVAL '4 months', NOW()),
    (gen_random_uuid(), v_client3_id, v_professional_plan_id, 'active', 'quarterly', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '70 days', NULL, NULL, NOW() - INTERVAL '3 months', NOW()),
    (gen_random_uuid(), v_client4_id, v_basic_plan_id, 'trialing', 'monthly', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW()),
    (gen_random_uuid(), v_client5_id, v_enterprise_plan_id, 'active', 'annual', CURRENT_DATE - INTERVAL '3 months', CURRENT_DATE + INTERVAL '9 months', NULL, NULL, NOW() - INTERVAL '1 year', NOW())
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================
-- 4. CRIAR USUÁRIOS PARA CADA CLIENTE
-- ============================================================

DO $$
DECLARE
  v_client1_id UUID;
  v_client2_id UUID;
  v_client3_id UUID;
  v_client4_id UUID;
  v_client5_id UUID;
  v_password_hash TEXT;
BEGIN
  -- Senha padrão: Demo@2025
  v_password_hash := '$2a$10$8pQ7Z8K9Z8K9Z8K9Z8K9ZeK9Z8K9Z8K9Z8K9Z8K9Z8K9Z8K9Z8K9Zu';

  -- Buscar IDs dos clientes
  SELECT id INTO v_client1_id FROM clients WHERE cnpj = '12345678000190' LIMIT 1;
  SELECT id INTO v_client2_id FROM clients WHERE cnpj = '98765432000180' LIMIT 1;
  SELECT id INTO v_client3_id FROM clients WHERE cnpj = '11223344000155' LIMIT 1;
  SELECT id INTO v_client4_id FROM clients WHERE cnpj = '55667788000199' LIMIT 1;
  SELECT id INTO v_client5_id FROM clients WHERE cnpj = '22334455000166' LIMIT 1;

  -- TechCorp Solutions (Cliente 1)
  INSERT INTO users (id, name, email, password_hash, role, client_id, status, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'João Silva', 'joao.silva@techcorp.com.br', v_password_hash, 'ADMIN_CLIENT', v_client1_id, 'active', NOW() - INTERVAL '6 months', NOW()),
    (gen_random_uuid(), 'Maria Santos', 'maria.santos@techcorp.com.br', v_password_hash, 'DEV', v_client1_id, 'active', NOW() - INTERVAL '5 months', NOW()),
    (gen_random_uuid(), 'Pedro Costa', 'pedro.costa@techcorp.com.br', v_password_hash, 'DEV', v_client1_id, 'active', NOW() - INTERVAL '4 months', NOW())
  ON CONFLICT (email) DO NOTHING;

  -- Inovação Digital (Cliente 2)
  INSERT INTO users (id, name, email, password_hash, role, client_id, status, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'Ana Paula', 'ana.paula@inovacaodigital.com.br', v_password_hash, 'ADMIN_CLIENT', v_client2_id, 'active', NOW() - INTERVAL '4 months', NOW()),
    (gen_random_uuid(), 'Carlos Eduardo', 'carlos.eduardo@inovacaodigital.com.br', v_password_hash, 'DEV', v_client2_id, 'active', NOW() - INTERVAL '3 months', NOW())
  ON CONFLICT (email) DO NOTHING;

  -- CodeMasters (Cliente 3)
  INSERT INTO users (id, name, email, password_hash, role, client_id, status, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'Roberto Lima', 'roberto.lima@codemasters.dev', v_password_hash, 'ADMIN_CLIENT', v_client3_id, 'active', NOW() - INTERVAL '3 months', NOW()),
    (gen_random_uuid(), 'Fernanda Oliveira', 'fernanda.oliveira@codemasters.dev', v_password_hash, 'DEV', v_client3_id, 'active', NOW() - INTERVAL '2 months', NOW()),
    (gen_random_uuid(), 'Lucas Almeida', 'lucas.almeida@codemasters.dev', v_password_hash, 'DEV', v_client3_id, 'active', NOW() - INTERVAL '2 months', NOW())
  ON CONFLICT (email) DO NOTHING;

  -- StartupLab (Cliente 4)
  INSERT INTO users (id, name, email, password_hash, role, client_id, status, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'Rafael Torres', 'rafael.torres@startuplab.com', v_password_hash, 'ADMIN_CLIENT', v_client4_id, 'active', NOW() - INTERVAL '15 days', NOW())
  ON CONFLICT (email) DO NOTHING;

  -- Enterprise Systems (Cliente 5)
  INSERT INTO users (id, name, email, password_hash, role, client_id, status, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'Patricia Mendes', 'patricia.mendes@enterprisesys.com.br', v_password_hash, 'ADMIN_CLIENT', v_client5_id, 'active', NOW() - INTERVAL '1 year', NOW()),
    (gen_random_uuid(), 'Gustavo Ribeiro', 'gustavo.ribeiro@enterprisesys.com.br', v_password_hash, 'DEV', v_client5_id, 'active', NOW() - INTERVAL '11 months', NOW()),
    (gen_random_uuid(), 'Juliana Martins', 'juliana.martins@enterprisesys.com.br', v_password_hash, 'DEV', v_client5_id, 'active', NOW() - INTERVAL '10 months', NOW()),
    (gen_random_uuid(), 'Bruno Ferreira', 'bruno.ferreira@enterprisesys.com.br', v_password_hash, 'DEV', v_client5_id, 'active', NOW() - INTERVAL '9 months', NOW())
  ON CONFLICT (email) DO NOTHING;
END $$;

-- ============================================================
-- 5. CRIAR REPOSITÓRIOS PARA CADA CLIENTE
-- ============================================================

DO $$
DECLARE
  v_client1_id UUID;
  v_client2_id UUID;
  v_client3_id UUID;
  v_client4_id UUID;
  v_client5_id UUID;
  v_user_id UUID;
BEGIN
  -- Buscar IDs dos clientes
  SELECT id INTO v_client1_id FROM clients WHERE cnpj = '12345678000190' LIMIT 1;
  SELECT id INTO v_client2_id FROM clients WHERE cnpj = '98765432000180' LIMIT 1;
  SELECT id INTO v_client3_id FROM clients WHERE cnpj = '11223344000155' LIMIT 1;
  SELECT id INTO v_client4_id FROM clients WHERE cnpj = '55667788000199' LIMIT 1;
  SELECT id INTO v_client5_id FROM clients WHERE cnpj = '22334455000166' LIMIT 1;

  -- TechCorp Solutions
  SELECT id INTO v_user_id FROM users WHERE email = 'joao.silva@techcorp.com.br' LIMIT 1;
  INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, github_id, stars_count, forks_count, size_kb, created_at, updated_at, last_analyzed_at)
  VALUES
    (gen_random_uuid(), v_client1_id, v_user_id, 'api-gateway', 'techcorp/api-gateway', 'https://github.com/techcorp/api-gateway', 'Gateway principal da API', 'TypeScript', 'main', true, 123456789, 45, 12, 15680, NOW() - INTERVAL '5 months', NOW(), NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), v_client1_id, v_user_id, 'frontend-app', 'techcorp/frontend-app', 'https://github.com/techcorp/frontend-app', 'Aplicação frontend React', 'JavaScript', 'main', true, 123456790, 78, 23, 28900, NOW() - INTERVAL '4 months', NOW(), NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), v_client1_id, v_user_id, 'mobile-app', 'techcorp/mobile-app', 'https://github.com/techcorp/mobile-app', 'App mobile React Native', 'TypeScript', 'main', true, 123456791, 32, 8, 45600, NOW() - INTERVAL '3 months', NOW(), NOW() - INTERVAL '1 week')
  ON CONFLICT DO NOTHING;

  -- Inovação Digital
  SELECT id INTO v_user_id FROM users WHERE email = 'ana.paula@inovacaodigital.com.br' LIMIT 1;
  INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, github_id, stars_count, forks_count, size_kb, created_at, updated_at, last_analyzed_at)
  VALUES
    (gen_random_uuid(), v_client2_id, v_user_id, 'erp-system', 'inovacao/erp-system', 'https://github.com/inovacao/erp-system', 'Sistema ERP completo', 'Java', 'main', true, 223456789, 12, 3, 89000, NOW() - INTERVAL '3 months', NOW(), NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), v_client2_id, v_user_id, 'crm-platform', 'inovacao/crm-platform', 'https://github.com/inovacao/crm-platform', 'Plataforma CRM', 'Python', 'main', true, 223456790, 8, 2, 34500, NOW() - INTERVAL '2 months', NOW(), NOW() - INTERVAL '1 week')
  ON CONFLICT DO NOTHING;

  -- CodeMasters
  SELECT id INTO v_user_id FROM users WHERE email = 'roberto.lima@codemasters.dev' LIMIT 1;
  INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, github_id, stars_count, forks_count, size_kb, created_at, updated_at, last_analyzed_at)
  VALUES
    (gen_random_uuid(), v_client3_id, v_user_id, 'ecommerce-api', 'codemasters/ecommerce-api', 'https://github.com/codemasters/ecommerce-api', 'API de e-commerce', 'Node.js', 'main', true, 323456789, 156, 42, 67800, NOW() - INTERVAL '2 months', NOW(), NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_client3_id, v_user_id, 'payment-gateway', 'codemasters/payment-gateway', 'https://github.com/codemasters/payment-gateway', 'Gateway de pagamentos', 'Go', 'main', true, 323456790, 89, 15, 23400, NOW() - INTERVAL '2 months', NOW(), NOW() - INTERVAL '4 days')
  ON CONFLICT DO NOTHING;

  -- StartupLab
  SELECT id INTO v_user_id FROM users WHERE email = 'rafael.torres@startuplab.com' LIMIT 1;
  INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, github_id, stars_count, forks_count, size_kb, created_at, updated_at, last_analyzed_at)
  VALUES
    (gen_random_uuid(), v_client4_id, v_user_id, 'mvp-app', 'startuplab/mvp-app', 'https://github.com/startuplab/mvp-app', 'MVP da aplicação', 'TypeScript', 'main', true, 423456789, 5, 1, 12300, NOW() - INTERVAL '10 days', NOW(), NOW() - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;

  -- Enterprise Systems
  SELECT id INTO v_user_id FROM users WHERE email = 'patricia.mendes@enterprisesys.com.br' LIMIT 1;
  INSERT INTO repositories (id, client_id, user_id, name, full_name, url, description, language, default_branch, is_private, github_id, stars_count, forks_count, size_kb, created_at, updated_at, last_analyzed_at)
  VALUES
    (gen_random_uuid(), v_client5_id, v_user_id, 'core-banking', 'enterprise/core-banking', 'https://github.com/enterprise/core-banking', 'Sistema bancário core', 'Java', 'main', true, 523456789, 234, 67, 234500, NOW() - INTERVAL '10 months', NOW(), NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), v_client5_id, v_user_id, 'insurance-platform', 'enterprise/insurance-platform', 'https://github.com/enterprise/insurance-platform', 'Plataforma de seguros', 'C#', 'main', true, 523456790, 167, 45, 178900, NOW() - INTERVAL '9 months', NOW(), NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), v_client5_id, v_user_id, 'fraud-detection', 'enterprise/fraud-detection', 'https://github.com/enterprise/fraud-detection', 'Sistema de detecção de fraudes', 'Python', 'main', true, 523456791, 89, 23, 56700, NOW() - INTERVAL '8 months', NOW(), NOW() - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================
-- 6. CRIAR ANÁLISES E FINDINGS PARA OS REPOSITÓRIOS
-- ============================================================

DO $$
DECLARE
  v_repo_record RECORD;
  v_analysis_id UUID;
  v_user_id UUID;
BEGIN
  -- Para cada repositório, criar uma análise
  FOR v_repo_record IN 
    SELECT r.id as repo_id, r.client_id, r.user_id, r.name 
    FROM repositories r 
    LIMIT 15
  LOOP
    v_analysis_id := gen_random_uuid();
    
    -- Criar análise
    INSERT INTO analyses (
      id, 
      repository_id, 
      client_id, 
      user_id, 
      performed_by, 
      status, 
      started_at, 
      completed_at, 
      results,
      created_at,
      updated_at
    )
    VALUES (
      v_analysis_id,
      v_repo_record.repo_id,
      v_repo_record.client_id,
      v_repo_record.user_id,
      v_repo_record.user_id,
      'completed',
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '6 days',
      jsonb_build_object(
        'total_files', floor(random() * 100 + 50)::int,
        'total_lines', floor(random() * 10000 + 5000)::int,
        'cnpj_fields_found', floor(random() * 15 + 5)::int
      ),
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '6 days'
    );

    -- Criar findings para esta análise
    INSERT INTO findings (
      id,
      analysis_id,
      client_id,
      file_path,
      file_type,
      line_number,
      field_name,
      field_type,
      context,
      suggestion,
      is_input,
      is_output,
      is_database,
      is_validation,
      supports_cpf,
      created_at
    )
    VALUES
      (
        gen_random_uuid(),
        v_analysis_id,
        v_repo_record.client_id,
        'src/models/User.ts',
        'typescript',
        45,
        'cpf_cnpj',
        'string',
        'Campo de identificação que aceita CPF ou CNPJ',
        'Implementar validação alfanumérica para CNPJ e formatação adequada',
        true,
        false,
        true,
        true,
        true,
        NOW() - INTERVAL '6 days'
      ),
      (
        gen_random_uuid(),
        v_analysis_id,
        v_repo_record.client_id,
        'src/controllers/CompanyController.ts',
        'typescript',
        78,
        'cnpj',
        'string',
        'Campo CNPJ na criação de empresa',
        'Adicionar suporte para CNPJ alfanumérico (14 caracteres)',
        true,
        false,
        true,
        true,
        false,
        NOW() - INTERVAL '6 days'
      ),
      (
        gen_random_uuid(),
        v_analysis_id,
        v_repo_record.client_id,
        'database/migrations/001_create_companies.sql',
        'sql',
        12,
        'cnpj',
        'VARCHAR(14)',
        'Coluna CNPJ na tabela companies',
        'Expandir para VARCHAR(20) para suportar formato alfanumérico',
        false,
        false,
        true,
        false,
        false,
        NOW() - INTERVAL '6 days'
      );

    -- Criar relatório para esta análise
    INSERT INTO reports (
      id,
      analysis_id,
      client_id,
      format,
      file_url,
      file_size,
      generated_at
    )
    VALUES (
      gen_random_uuid(),
      v_analysis_id,
      v_repo_record.client_id,
      'pdf',
      'https://storage.example.com/reports/' || v_analysis_id || '.pdf',
      floor(random() * 500000 + 100000)::int,
      NOW() - INTERVAL '6 days'
    );

  END LOOP;
END $$;

-- ============================================================
-- 7. CRIAR PAGAMENTOS PARA ASSINATURAS ATIVAS
-- ============================================================

DO $$
DECLARE
  v_subscription_record RECORD;
BEGIN
  FOR v_subscription_record IN 
    SELECT s.id as sub_id, s.client_id, p.price_monthly 
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.status = 'active'
  LOOP
    -- Criar últimos 3 pagamentos
    INSERT INTO payments (id, subscription_id, client_id, amount, currency, status, payment_method, gateway, transaction_id, paid_at, created_at)
    VALUES
      (gen_random_uuid(), v_subscription_record.sub_id, v_subscription_record.client_id, v_subscription_record.price_monthly, 'BRL', 'completed', 'credit_card', 'stripe', 'pi_' || substr(md5(random()::text), 1, 24), NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months'),
      (gen_random_uuid(), v_subscription_record.sub_id, v_subscription_record.client_id, v_subscription_record.price_monthly, 'BRL', 'completed', 'credit_card', 'stripe', 'pi_' || substr(md5(random()::text), 1, 24), NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'),
      (gen_random_uuid(), v_subscription_record.sub_id, v_subscription_record.client_id, v_subscription_record.price_monthly, 'BRL', 'completed', 'credit_card', 'stripe', 'pi_' || substr(md5(random()::text), 1, 24), NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');
  END LOOP;
END $$;

-- ============================================================
-- 8. ATUALIZAR ÚLTIMA DATA DE LOGIN DOS USUÁRIOS
-- ============================================================

UPDATE users
SET last_login = NOW() - (random() * INTERVAL '7 days')
WHERE role IN ('ADMIN_CLIENT', 'DEV');

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================

SELECT 
  (SELECT COUNT(*) FROM clients) as total_clients,
  (SELECT COUNT(*) FROM users WHERE role != 'SUPER_ADMIN') as total_users,
  (SELECT COUNT(*) FROM repositories) as total_repositories,
  (SELECT COUNT(*) FROM analyses) as total_analyses,
  (SELECT COUNT(*) FROM reports) as total_reports,
  (SELECT COUNT(*) FROM subscriptions) as total_subscriptions,
  (SELECT COUNT(*) FROM payments) as total_payments;
