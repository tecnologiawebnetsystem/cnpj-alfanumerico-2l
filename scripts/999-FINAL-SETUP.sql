-- ============================================
-- SCRIPT FINAL E DEFINITIVO - CORRIGIDO
-- Execute APENAS este script
-- ============================================

-- 1. Criar extensão pgcrypto se não existir
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Adicionar constraints UNIQUE se não existirem
DO $$ 
BEGIN
    -- Adicionar UNIQUE constraint no email da tabela users
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;

    -- Adicionar UNIQUE constraint no cnpj da tabela clients
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'clients_cnpj_unique'
    ) THEN
        ALTER TABLE clients ADD CONSTRAINT clients_cnpj_unique UNIQUE (cnpj);
    END IF;
END $$;

-- 3. Criar função de hash de senha
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar função de verificação de senha
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar ou atualizar Super Admin
INSERT INTO users (
  id,
  email,
  name,
  password_hash,
  role,
  status,
  client_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'superadmin@gmail.com',
  'Super Admin',
  hash_password('123@123'),
  'super_admin',
  'active',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  password_hash = hash_password('123@123'),
  role = 'super_admin',
  status = 'active',
  updated_at = NOW();

-- 6. Criar cliente Aegis Technology se não existir
INSERT INTO clients (
  id,
  name,
  cnpj,
  email,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Aegis Technology',
  '08673551011128',
  'kleber.goncalves.1209@gmail.com',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (cnpj)
DO UPDATE SET
  name = 'Aegis Technology',
  email = 'kleber.goncalves.1209@gmail.com',
  status = 'active',
  updated_at = NOW();

-- 7. Criar ou atualizar usuário Kleber como admin do cliente
DO $$
DECLARE
  v_client_id UUID;
BEGIN
  -- Buscar ID do cliente Aegis Technology
  SELECT id INTO v_client_id 
  FROM clients 
  WHERE cnpj = '08673551011128';

  -- Inserir ou atualizar Kleber
  INSERT INTO users (
    id,
    email,
    name,
    password_hash,
    role,
    status,
    client_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'kleber.goncalves.1209@gmail.com',
    'Kleber Gonçalves',
    hash_password('Kleber@2026'),
    'admin',
    'active',
    v_client_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (email)
  DO UPDATE SET
    password_hash = hash_password('Kleber@2026'),
    role = 'admin',
    status = 'active',
    client_id = v_client_id,
    updated_at = NOW();
END $$;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Credenciais criadas:
-- Super Admin: superadmin@gmail.com / 123@123
-- Admin Kleber: kleber.goncalves.1209@gmail.com / Kleber@2026
-- Cliente: Aegis Technology
-- ============================================
