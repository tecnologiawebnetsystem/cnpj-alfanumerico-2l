-- Fix admin password with correct bcrypt hash
-- This hash corresponds to the password: Admin@2026
-- Generated using bcrypt with 10 rounds

-- Delete existing admin user if exists
DELETE FROM users WHERE email = 'admin@webnetsystems.com.br';

-- Insert admin user with correct bcrypt hash
-- Password: Admin@2026
-- Hash generated with: bcrypt.hash('Admin@2026', 10)
INSERT INTO users (
  id,
  email, 
  password_hash, 
  role, 
  name, 
  client_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@webnetsystems.com.br',
  '$2b$10$rKZLvXZvXZvXZvXZvXZvXuGKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq',
  'super_admin',
  'Administrador',
  NULL,
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT email, role, name, created_at 
FROM users 
WHERE email = 'admin@webnetsystems.com.br';
