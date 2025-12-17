-- ================================================
-- SCRIPT: Corrigir Roles de Usuários
-- ================================================

-- 1. Primeiro vamos ver qual é a constraint atual
SELECT
  conname,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
  AND conname = 'users_role_check';

-- 2. Remover a constraint antiga
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 3. Adicionar nova constraint com as 3 roles necessárias
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'dev', 'client_admin', 'user'));

-- 4. Criar ou atualizar Super Admin
INSERT INTO users (
  email,
  password_hash,
  name,
  role,
  client_id,
  status,
  created_at,
  updated_at
) VALUES (
  'superadmin@gmail.com',
  crypt('123@123', gen_salt('bf')),
  'Super Admin',
  'super_admin',
  NULL,
  'active',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = crypt('123@123', gen_salt('bf')),
  role = 'super_admin',
  client_id = NULL,
  status = 'active',
  updated_at = NOW();

-- 5. Atualizar Kleber para admin
UPDATE users 
SET 
  role = 'admin',
  password_hash = crypt('Kleber@2026', gen_salt('bf')),
  status = 'active',
  updated_at = NOW()
WHERE email = 'kleber.goncalves.1209@gmail.com';

-- 6. Criar DEVs de exemplo no cliente Aegis
INSERT INTO users (
  email,
  password_hash,
  name,
  role,
  client_id,
  status,
  created_at,
  updated_at
) 
SELECT
  'dev1@aegistech.com.br',
  crypt('Dev@123', gen_salt('bf')),
  'João Silva (DEV)',
  'dev',
  c.id,
  'active',
  NOW(),
  NOW()
FROM clients c
WHERE c.name = 'Aegis Technology'
ON CONFLICT (email) DO UPDATE SET
  role = 'dev',
  password_hash = crypt('Dev@123', gen_salt('bf')),
  status = 'active',
  updated_at = NOW();

INSERT INTO users (
  email,
  password_hash,
  name,
  role,
  client_id,
  status,
  created_at,
  updated_at
) 
SELECT
  'dev2@aegistech.com.br',
  crypt('Dev@123', gen_salt('bf')),
  'Maria Santos (DEV)',
  'dev',
  c.id,
  'active',
  NOW(),
  NOW()
FROM clients c
WHERE c.name = 'Aegis Technology'
ON CONFLICT (email) DO UPDATE SET
  role = 'dev',
  password_hash = crypt('Dev@123', gen_salt('bf')),
  status = 'active',
  updated_at = NOW();

-- 7. Verificar criação
SELECT 
  u.email,
  u.name,
  u.role,
  COALESCE(c.name, 'Sistema Global (Super Admin)') as cliente,
  u.status
FROM users u
LEFT JOIN clients c ON u.client_id = c.id
WHERE u.email IN (
  'superadmin@gmail.com',
  'kleber.goncalves.1209@gmail.com',
  'dev1@aegistech.com.br',
  'dev2@aegistech.com.br'
)
ORDER BY 
  CASE u.role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'dev' THEN 3
    ELSE 4
  END;
