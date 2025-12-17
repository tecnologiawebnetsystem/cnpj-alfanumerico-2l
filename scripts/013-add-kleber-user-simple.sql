-- =====================================================
-- ADICIONAR USUÁRIO KLEBER
-- Script simples e direto
-- =====================================================

-- Remover constraint problemática se existir
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Adicionar constraint correta
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'user'));

-- Deletar usuário se já existir (para poder recriar)
DELETE FROM users WHERE email = 'kleber.goncalves.1209@gmail.com';

-- Inserir usuário Kleber como super_admin (sem client_id)
-- Senha: Kleber@2026
-- Gerando hash bcrypt usando crypt()
INSERT INTO users (
  email,
  password_hash,
  name,
  role,
  status,
  client_id
)
VALUES (
  'kleber.goncalves.1209@gmail.com',
  crypt('Kleber@2026', gen_salt('bf', 10)),
  'Kleber Gonçalves',
  'super_admin',
  'active',
  NULL
);

-- Verificar se foi criado
SELECT 
  email,
  name,
  role,
  status,
  created_at,
  CASE 
    WHEN password_hash LIKE '$2%' THEN 'Hash bcrypt válido ✓'
    ELSE 'Hash inválido ✗'
  END as password_status
FROM users 
WHERE email = 'kleber.goncalves.1209@gmail.com';

-- Testar login
SELECT 
  CASE 
    WHEN crypt('Kleber@2026', password_hash) = password_hash 
    THEN 'Senha correta ✓ - Pode fazer login'
    ELSE 'Senha incorreta ✗'
  END as test_result
FROM users 
WHERE email = 'kleber.goncalves.1209@gmail.com';

-- =====================================================
-- CREDENCIAIS DE LOGIN:
-- Email: kleber.goncalves.1209@gmail.com
-- Senha: Kleber@2026
-- =====================================================
