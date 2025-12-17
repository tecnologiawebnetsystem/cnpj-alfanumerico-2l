-- Script para recriar o usuário Super Admin
-- Execute este script para restaurar o acesso de super administrador

-- Primeiro, verifica se já existe e remove (caso tenha sido deletado parcialmente)
DELETE FROM users WHERE email = 'superadmin@gmail.com';

-- Cria o usuário Super Admin com senha criptografada
INSERT INTO users (
  id,
  email,
  password_hash,
  role,
  name,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'superadmin@gmail.com',
  crypt('admin123', gen_salt('bf')),  -- Criptografa a senha "admin123" com bcrypt
  'super_admin',
  'Super Administrador',
  'active',
  now(),
  now()
);

-- Verificação: Mostra o usuário criado (sem mostrar a senha completa)
SELECT 
  id,
  email,
  role,
  name,
  status,
  substring(password_hash, 1, 10) || '...' as password_hash_preview,
  length(password_hash) as hash_length,
  created_at
FROM users 
WHERE email = 'superadmin@gmail.com';

-- Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE 'Super Admin recriado com sucesso!';
  RAISE NOTICE 'Email: superadmin@gmail.com';
  RAISE NOTICE 'Senha: admin123';
END $$;
