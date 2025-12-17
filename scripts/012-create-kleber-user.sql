-- =====================================================
-- CRIAR/ATUALIZAR USUÁRIO KLEBER COM SENHA VÁLIDA
-- =====================================================
-- Este script cria ou atualiza o usuário kleber.goncalves.1209@gmail.com
-- com uma senha válida em formato bcrypt

-- Garantir que a extensão pgcrypto está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Deletar usuário existente se houver (para garantir dados limpos)
DELETE FROM users WHERE email = 'kleber.goncalves.1209@gmail.com';

-- Criar usuário com senha: Kleber@2026
-- O hash será gerado automaticamente pela função crypt()
INSERT INTO users (
  id,
  email,
  password_hash,
  name,
  role,
  status,
  client_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'kleber.goncalves.1209@gmail.com',
  crypt('Kleber@2026', gen_salt('bf', 10)), -- Gera hash bcrypt da senha
  'Kleber Gonçalves',
  'admin',
  'active',
  NULL, -- Sem cliente associado por enquanto
  NOW(),
  NOW()
);

-- Verificar se o usuário foi criado corretamente
SELECT 
  email, 
  name, 
  role, 
  status,
  created_at,
  -- Verificar se o hash começa com $2a$ ou $2b$ (formato bcrypt válido)
  CASE 
    WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' THEN 'Hash bcrypt válido'
    ELSE 'Hash inválido!'
  END as hash_status
FROM users 
WHERE email = 'kleber.goncalves.1209@gmail.com';

-- Testar a verificação de senha
SELECT 
  email,
  name,
  (password_hash = crypt('Kleber@2026', password_hash)) as senha_correta
FROM users
WHERE email = 'kleber.goncalves.1209@gmail.com';

-- =====================================================
-- INFORMAÇÕES DE LOGIN
-- =====================================================
-- Email: kleber.goncalves.1209@gmail.com
-- Senha: Kleber@2026
-- =====================================================
