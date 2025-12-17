-- =====================================================
-- SETUP COMPLETO DE AUTENTICAÇÃO
-- =====================================================

-- 1. Habilitar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Remover funções antigas se existirem
DROP FUNCTION IF EXISTS verify_user_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS verify_user_password(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS hash_password(TEXT);
DROP FUNCTION IF EXISTS hash_password(VARCHAR);

-- 3. Criar função de verificação de senha
CREATE OR REPLACE FUNCTION verify_user_password(
  p_email VARCHAR,
  p_password VARCHAR
)
RETURNS TABLE (
  user_id UUID,
  user_email VARCHAR,
  user_name VARCHAR,
  user_role VARCHAR,
  user_status VARCHAR,
  client_id UUID,
  password_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.status,
    u.client_id,
    (u.password_hash = crypt(p_password, u.password_hash)) AS password_valid
  FROM users u
  WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar função de hash de senha
CREATE OR REPLACE FUNCTION hash_password(p_password VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN crypt(p_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Garantir permissões
GRANT EXECUTE ON FUNCTION verify_user_password(VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_user_password(VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION hash_password(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password(VARCHAR) TO service_role;

-- 6. Remover constraint problemática se existir
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 7. Adicionar constraint correta com todos os roles possíveis
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'user', 'dev', 'scrum_master', 'product_owner'));

-- 8. Deletar usuário Kleber se já existir
DELETE FROM users WHERE email = 'kleber.goncalves.1209@gmail.com';

-- 9. Criar usuário Kleber
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

-- 10. Verificar se foi criado corretamente
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

-- 11. Testar login
SELECT 
  CASE 
    WHEN crypt('Kleber@2026', password_hash) = password_hash 
    THEN 'Senha correta ✓ - Pode fazer login'
    ELSE 'Senha incorreta ✗'
  END as test_result
FROM users 
WHERE email = 'kleber.goncalves.1209@gmail.com';

-- 12. Testar função verify_user_password
SELECT * FROM verify_user_password('kleber.goncalves.1209@gmail.com', 'Kleber@2026');

-- =====================================================
-- CREDENCIAIS DE LOGIN:
-- Email: kleber.goncalves.1209@gmail.com
-- Senha: Kleber@2026
-- =====================================================
