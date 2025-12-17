-- Verificar se o super admin existe
SELECT id, email, name, role, status FROM users WHERE email = 'superadmin@gmail.com';

-- Se não existir, criar o super admin
INSERT INTO users (email, password_hash, name, role, status, client_id)
VALUES (
  'superadmin@gmail.com',
  crypt('123@123', gen_salt('bf')),
  'Super Admin',
  'super_admin',
  'active',
  NULL
)
ON CONFLICT (email) DO UPDATE
SET
  role = 'super_admin',
  status = 'active',
  password_hash = crypt('123@123', gen_salt('bf'));

-- Verificar resultado
SELECT id, email, name, role, status, client_id FROM users WHERE email = 'superadmin@gmail.com';
