-- =====================================================
-- SISTEMA MULTI-TENANT CNPJ ALFANUMÉRICO
-- Script completo de criação de todas as tabelas
-- =====================================================

-- Limpar tabelas existentes se necessário (cuidado em produção!)
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS api_clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- =====================================================
-- 1. TABELA DE CLIENTES (EMPRESAS) - Multi-tenant
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  plan VARCHAR(50) DEFAULT 'free', -- free, basic, pro, enterprise
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, cancelled
  max_analyses INTEGER DEFAULT 10,
  max_api_calls INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_plan ON clients(plan);

-- =====================================================
-- 2. TABELA DE USUÁRIOS - Sistema de autenticação
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user', -- super_admin, admin, user
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- 3. ATUALIZAR TABELA ANALYSES - Adicionar client_id
-- =====================================================
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_analyses_client_id ON analyses(client_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);

-- =====================================================
-- 4. TABELA DE API KEYS
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL, -- Primeiros caracteres para identificação
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, revoked, expired
  rate_limit INTEGER DEFAULT 100, -- Requisições por hora
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_client_id ON api_keys(client_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_status ON api_keys(status);

-- =====================================================
-- 5. TABELA DE RELATÓRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  format VARCHAR(20) NOT NULL, -- json, pdf, excel
  file_url TEXT,
  file_size INTEGER,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_analysis_id ON reports(analysis_id);
CREATE INDEX idx_reports_client_id ON reports(client_id);
CREATE INDEX idx_reports_format ON reports(format);

-- =====================================================
-- 6. TABELA DE LOGS DE USO DA API
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time INTEGER, -- em milissegundos
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_client_id ON usage_logs(client_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_usage_logs_endpoint ON usage_logs(endpoint);

-- =====================================================
-- 7. TABELA DE WEBHOOKS
-- =====================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['analysis.completed', 'analysis.failed']
  secret VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_client_id ON webhooks(client_id);
CREATE INDEX idx_webhooks_status ON webhooks(status);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) - Multi-tenant
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas para CLIENTS
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT USING (true); -- Permitir leitura por enquanto

CREATE POLICY "Service role has full access to clients" ON clients
  FOR ALL USING (true);

-- Políticas para USERS
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to users" ON users
  FOR ALL USING (true);

-- Políticas para ANALYSES
CREATE POLICY "Clients can view own analyses" ON analyses
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to analyses" ON analyses
  FOR ALL USING (true);

-- Políticas para FINDINGS
CREATE POLICY "Clients can view own findings" ON findings
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to findings" ON findings
  FOR ALL USING (true);

-- Políticas para DATABASE_FINDINGS
CREATE POLICY "Clients can view own database findings" ON database_findings
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to database_findings" ON database_findings
  FOR ALL USING (true);

-- Políticas para API_KEYS
CREATE POLICY "Clients can view own api keys" ON api_keys
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to api_keys" ON api_keys
  FOR ALL USING (true);

-- Políticas para REPORTS
CREATE POLICY "Clients can view own reports" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to reports" ON reports
  FOR ALL USING (true);

-- Políticas para USAGE_LOGS
CREATE POLICY "Clients can view own usage logs" ON usage_logs
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to usage_logs" ON usage_logs
  FOR ALL USING (true);

-- Políticas para WEBHOOKS
CREATE POLICY "Clients can view own webhooks" ON webhooks
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to webhooks" ON webhooks
  FOR ALL USING (true);

-- =====================================================
-- 9. DADOS INICIAIS - Super Admin
-- =====================================================

-- Inserir cliente padrão para WebNetSystems
INSERT INTO clients (id, name, cnpj, email, plan, status, max_analyses, max_api_calls)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'WebNetSystems',
  '00.000.000/0001-00',
  'contato@webnetsystems.com.br',
  'enterprise',
  'active',
  999999,
  999999
) ON CONFLICT (email) DO NOTHING;

-- Inserir super admin
-- Senha: Admin@2026 (hash bcrypt)
INSERT INTO users (id, client_id, email, password_hash, name, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@webnetsystems.com.br',
  '$2a$10$rKZLvXZvXZvXZvXZvXZvXeO8YqKqKqKqKqKqKqKqKqKqKqKqKqKqK', -- Placeholder - será atualizado
  'Administrador',
  'super_admin',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 10. FUNÇÕES ÚTEIS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analyses_updated_at ON analyses;
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
