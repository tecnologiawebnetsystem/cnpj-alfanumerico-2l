-- Hotfix: Simplificar schema do banco de dados
-- Remove necessidade de plano e simplifica roles de usuários

-- 1. Atualizar tabela clients: adicionar valor padrão para plan
ALTER TABLE clients 
ALTER COLUMN plan SET DEFAULT 'standard';

-- Atualizar clientes existentes sem plano
UPDATE clients 
SET plan = 'standard' 
WHERE plan IS NULL OR plan = '';

-- 2. Remover constraint antigo de role se existir
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- 3. Adicionar novo constraint com apenas 2 roles: super_admin e user
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'user'));

-- 4. Atualizar usuários existentes com roles antigos para 'user'
UPDATE users 
SET role = 'user' 
WHERE role NOT IN ('super_admin', 'user');

-- 5. Comentários nas tabelas para documentação
COMMENT ON COLUMN clients.plan IS 'Plano do cliente (padrão: standard). Todos os clientes usam o mesmo plano.';
COMMENT ON COLUMN users.role IS 'Perfil do usuário: super_admin (administrador do sistema) ou user (usuário normal do cliente)';

-- 6. Atualizar índices se necessário
DROP INDEX IF EXISTS idx_users_role;
CREATE INDEX idx_users_role ON users(role) WHERE role = 'super_admin';

-- Verificar alterações
SELECT 'Clientes atualizados:' as info, COUNT(*) as total FROM clients WHERE plan = 'standard';
SELECT 'Usuários super_admin:' as info, COUNT(*) as total FROM users WHERE role = 'super_admin';
SELECT 'Usuários normais:' as info, COUNT(*) as total FROM users WHERE role = 'user';
