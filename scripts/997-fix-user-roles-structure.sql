-- Script para corrigir a estrutura de roles (alçadas)
-- Estrutura de permissões:
-- 1. super_admin - Controle total do sistema, gerencia clientes
-- 2. admin - Admin dentro do seu cliente específico  
-- 3. user - Usuário normal dentro do cliente
-- 4. dev - Desenvolvedor (role especial)

-- Verificar constraint atual
DO $$
BEGIN
  -- Remove constraint antiga se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_role_check' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;
END $$;

-- Adicionar nova constraint com todos os roles
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('super_admin', 'admin', 'user', 'dev', 'scrum_master', 'product_owner'));

-- Comentários explicativos
COMMENT ON COLUMN users.role IS 'Role do usuário: super_admin (controle total), admin (admin de cliente), user (usuário de cliente), dev (desenvolvedor)';

-- Verificar se existe um super admin
DO $$
BEGIN
  -- Se não existir nenhum super_admin, promover o primeiro admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin') THEN
    UPDATE users 
    SET role = 'super_admin', 
        client_id = NULL
    WHERE email = 'admin@aegis.com'
    OR id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1);
    
    RAISE NOTICE 'Super admin criado/promovido com sucesso';
  END IF;
END $$;

-- Confirmar estrutura
SELECT 
  'Usuários por role:' as info,
  role,
  COUNT(*) as total
FROM users
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'user' THEN 3
    WHEN 'dev' THEN 4
    ELSE 5
  END;
