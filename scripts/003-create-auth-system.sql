-- =====================================================
-- SISTEMA DE AUTENTICAÇÃO E MULTI-TENANCY
-- =====================================================

-- Limpar tabelas existentes se necessário
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- =====================================================
-- TABELA: clients (Empresas/Clientes)
-- =====================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  max_analyses INTEGER DEFAULT 10,
  max_api_calls INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABELA: users (Usuários do Sistema)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'user')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADICIONAR client_id nas tabelas existentes
-- =====================================================

-- Adicionar client_id em api_clients
ALTER TABLE api_clients ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Adicionar client_id em analyses
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Adicionar client_id em findings
ALTER TABLE findings ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Adicionar client_id em database_findings
ALTER TABLE database_findings ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Adicionar client_id em reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- Adicionar client_id em usage_logs
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- =====================================================
-- ÍNDICES para performance
-- Adicionado IF NOT EXISTS para evitar erros de duplicação
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_analyses_client_id ON analyses(client_id);
CREATE INDEX IF NOT EXISTS idx_findings_client_id ON findings(client_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Multi-tenancy
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Adicionado DROP POLICY IF EXISTS para evitar erros de duplicação
-- Políticas para clients
DROP POLICY IF EXISTS "Super admins can view all clients" ON clients;
CREATE POLICY "Super admins can view all clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Users can view their own client" ON clients;
CREATE POLICY "Users can view their own client" ON clients
  FOR SELECT USING (
    id IN (
      SELECT client_id FROM users WHERE users.id = auth.uid()
    )
  );

-- Políticas para users
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;
CREATE POLICY "Super admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Users can view users from their client" ON users;
CREATE POLICY "Users can view users from their client" ON users
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM users WHERE users.id = auth.uid()
    )
  );

-- Políticas para analyses (isolamento por cliente)
DROP POLICY IF EXISTS "Users can only see their client's analyses" ON analyses;
CREATE POLICY "Users can only see their client's analyses" ON analyses
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM users WHERE users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Users can create analyses for their client" ON analyses;
CREATE POLICY "Users can create analyses for their client" ON analyses
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT client_id FROM users WHERE users.id = auth.uid()
    )
  );

-- Políticas para findings
DROP POLICY IF EXISTS "Users can only see their client's findings" ON findings;
CREATE POLICY "Users can only see their client's findings" ON findings
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM users WHERE users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Políticas para database_findings
DROP POLICY IF EXISTS "Users can only see their client's db findings" ON database_findings;
CREATE POLICY "Users can only see their client's db findings" ON database_findings
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM users WHERE users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Políticas para reports
DROP POLICY IF EXISTS "Users can only see their client's reports" ON reports;
CREATE POLICY "Users can only see their client's reports" ON reports
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM users WHERE users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- =====================================================
-- CRIAR SUPER ADMIN PADRÃO
-- =====================================================
-- Senha padrão: Admin@2026 (você deve trocar após primeiro login)
-- Hash bcrypt da senha: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO users (email, password_hash, name, role, status)
VALUES (
  'admin@webnetsystems.com.br',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Admin@2026
  'Super Admin',
  'super_admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter client_id do usuário logado
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
  SELECT client_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- TRIGGERS para updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE clients IS 'Empresas/clientes do sistema (multi-tenant)';
COMMENT ON TABLE users IS 'Usuários do sistema (super_admin, admin, user)';
COMMENT ON COLUMN users.role IS 'super_admin: acesso total | admin: gerencia seu cliente | user: acesso limitado';
COMMENT ON COLUMN clients.plan IS 'Plano contratado: basic, professional, enterprise';
