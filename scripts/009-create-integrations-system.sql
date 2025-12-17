-- Script 009: Sistema de Gerenciamento de Integrações
-- Criado em: 2025
-- Descrição: Cria tabelas para gerenciar integrações com provedores de repositórios (GitHub, GitLab, Azure DevOps)

-- Tabela de provedores de integração
CREATE TABLE IF NOT EXISTS integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE, -- github, gitlab, azure_devops
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50), -- nome do ícone lucide-react
  is_enabled BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'active', -- active, development, deprecated
  documentation_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de integrações configuradas pelos clientes
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES integration_providers(id) ON DELETE RESTRICT,
  
  -- Informações básicas
  name VARCHAR(255) NOT NULL, -- nome amigável dado pelo usuário
  description TEXT,
  
  -- Credenciais OAuth (criptografadas no nível da aplicação)
  oauth_client_id TEXT,
  oauth_client_secret TEXT, -- será criptografado
  access_token TEXT, -- será criptografado
  refresh_token TEXT, -- será criptografado
  token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Configurações específicas do provedor
  base_url TEXT, -- Para GitLab self-hosted ou Azure DevOps
  organization TEXT, -- Para Azure DevOps
  username TEXT, -- Para autenticação básica
  
  -- Status e monitoramento
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, error, testing
  is_default BOOLEAN DEFAULT false, -- integração padrão para o cliente
  last_tested_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_integration_name_per_client UNIQUE(client_id, name)
);

-- Tabela de logs de teste de integração
CREATE TABLE IF NOT EXISTS integration_test_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  tested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL, -- success, error
  response_time INTEGER, -- em milissegundos
  error_message TEXT,
  tested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_integrations_client_id ON integrations(client_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider_id ON integrations(provider_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_is_default ON integrations(client_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_integration_test_logs_integration_id ON integration_test_logs(integration_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- Trigger para garantir apenas uma integração padrão por cliente
CREATE OR REPLACE FUNCTION ensure_single_default_integration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE integrations 
    SET is_default = false 
    WHERE client_id = NEW.client_id 
      AND provider_id = NEW.provider_id
      AND id != NEW.id 
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_integration
  BEFORE INSERT OR UPDATE ON integrations
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_integration();

-- Inserir provedores padrão
INSERT INTO integration_providers (name, display_name, description, icon_name, status, documentation_url) VALUES
  ('github', 'GitHub', 'Integração com repositórios do GitHub', 'Github', 'active', 'https://docs.github.com/en/developers/apps/building-oauth-apps'),
  ('gitlab', 'GitLab', 'Integração com repositórios do GitLab (em desenvolvimento)', 'GitBranch', 'development', 'https://docs.gitlab.com/ee/api/oauth2.html'),
  ('azure_devops', 'Azure DevOps', 'Integração com repositórios do Azure DevOps (em desenvolvimento)', 'Cloud', 'development', 'https://learn.microsoft.com/en-us/azure/devops/integrate/')
ON CONFLICT (name) DO NOTHING;

-- RLS (Row Level Security) Policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_test_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Clientes podem ver suas próprias integrações
CREATE POLICY "Clients can view own integrations" ON integrations
  FOR SELECT
  USING (client_id IN (
    SELECT id FROM clients WHERE id = current_setting('app.current_client_id', true)::uuid
  ));

-- Policy: Clientes podem criar suas próprias integrações
CREATE POLICY "Clients can create own integrations" ON integrations
  FOR INSERT
  WITH CHECK (client_id IN (
    SELECT id FROM clients WHERE id = current_setting('app.current_client_id', true)::uuid
  ));

-- Policy: Clientes podem atualizar suas próprias integrações
CREATE POLICY "Clients can update own integrations" ON integrations
  FOR UPDATE
  USING (client_id IN (
    SELECT id FROM clients WHERE id = current_setting('app.current_client_id', true)::uuid
  ));

-- Policy: Clientes podem deletar suas próprias integrações
CREATE POLICY "Clients can delete own integrations" ON integrations
  FOR DELETE
  USING (client_id IN (
    SELECT id FROM clients WHERE id = current_setting('app.current_client_id', true)::uuid
  ));

-- Policy: Service role tem acesso total
CREATE POLICY "Service role has full access to integrations" ON integrations
  FOR ALL
  USING (true);

-- Policy: Clientes podem ver logs de teste de suas integrações
CREATE POLICY "Clients can view own integration test logs" ON integration_test_logs
  FOR SELECT
  USING (integration_id IN (
    SELECT id FROM integrations WHERE client_id = current_setting('app.current_client_id', true)::uuid
  ));

-- Policy: Service role tem acesso total aos logs
CREATE POLICY "Service role has full access to integration_test_logs" ON integration_test_logs
  FOR ALL
  USING (true);

-- Comentários nas tabelas
COMMENT ON TABLE integration_providers IS 'Provedores de integração disponíveis (GitHub, GitLab, Azure DevOps)';
COMMENT ON TABLE integrations IS 'Integrações configuradas pelos clientes com provedores de repositórios';
COMMENT ON TABLE integration_test_logs IS 'Logs de testes de conexão das integrações';

COMMENT ON COLUMN integrations.oauth_client_id IS 'Client ID do OAuth App (público)';
COMMENT ON COLUMN integrations.oauth_client_secret IS 'Client Secret do OAuth App (criptografado na aplicação)';
COMMENT ON COLUMN integrations.access_token IS 'Token de acesso OAuth (criptografado na aplicação)';
COMMENT ON COLUMN integrations.is_default IS 'Define se esta é a integração padrão para o provedor';
