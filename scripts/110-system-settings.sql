-- Sistema de Configurações (sem precisar de variáveis de ambiente)

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT NOT NULL, -- 'email', 'whatsapp', 'integrations', 'general', 'ai'
  label TEXT NOT NULL,
  description TEXT,
  is_secret BOOLEAN DEFAULT false, -- se true, valor é criptografado
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- RLS Policies (apenas Super Admin pode ver/editar)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super Admin can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super Admin can insert system settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Inserir configurações padrão
INSERT INTO system_settings (key, value, category, label, description, is_secret, is_required) VALUES
  -- Email
  ('email_provider', 'resend', 'email', 'Provedor de Email', 'Provedor usado para envio de emails (resend, sendgrid, smtp)', false, false),
  ('resend_api_key', '', 'email', 'Resend API Key', 'Chave de API do Resend para envio de emails', true, false),
  ('email_from_address', 'noreply@cnpj-analyzer.com', 'email', 'Email Remetente', 'Endereço de email usado como remetente', false, false),
  ('email_from_name', 'CNPJ Analyzer', 'email', 'Nome Remetente', 'Nome exibido como remetente dos emails', false, false),
  
  -- WhatsApp
  ('whatsapp_enabled', 'false', 'whatsapp', 'WhatsApp Habilitado', 'Habilitar notificações via WhatsApp', false, false),
  ('whatsapp_api_url', '', 'whatsapp', 'WhatsApp API URL', 'URL da API do WhatsApp (Evolution API, Baileys, etc)', false, false),
  ('whatsapp_api_key', '', 'whatsapp', 'WhatsApp API Key', 'Chave de autenticação da API do WhatsApp', true, false),
  ('whatsapp_instance', '', 'whatsapp', 'WhatsApp Instance', 'Nome da instância do WhatsApp', false, false),
  
  -- Integrações
  ('slack_enabled', 'false', 'integrations', 'Slack Habilitado', 'Habilitar integração com Slack', false, false),
  ('slack_webhook_url', '', 'integrations', 'Slack Webhook URL', 'URL do webhook do Slack para notificações', true, false),
  ('jira_enabled', 'false', 'integrations', 'Jira Habilitado', 'Habilitar integração com Jira', false, false),
  ('jira_url', '', 'integrations', 'Jira URL', 'URL da instância do Jira', false, false),
  ('jira_api_token', '', 'integrations', 'Jira API Token', 'Token de API do Jira', true, false),
  
  -- IA
  ('ai_enabled', 'true', 'ai', 'IA Habilitada', 'Habilitar recursos de Inteligência Artificial', false, false),
  ('ai_provider', 'openai', 'ai', 'Provedor de IA', 'Provedor de IA (openai, anthropic, groq)', false, false),
  ('openai_api_key', '', 'ai', 'OpenAI API Key', 'Chave de API da OpenAI', true, false),
  ('ai_model', 'gpt-4', 'ai', 'Modelo de IA', 'Modelo de IA a ser usado', false, false),
  
  -- Geral
  ('app_name', 'CNPJ Analyzer', 'general', 'Nome da Aplicação', 'Nome exibido na aplicação', false, false),
  ('app_url', 'http://localhost:3000', 'general', 'URL da Aplicação', 'URL base da aplicação', false, true),
  ('support_email', 'suporte@cnpj-analyzer.com', 'general', 'Email de Suporte', 'Email para contato de suporte', false, false),
  ('support_whatsapp', '+5511999999999', 'general', 'WhatsApp de Suporte', 'Número do WhatsApp para suporte', false, false),
  ('max_file_size_mb', '10', 'general', 'Tamanho Máximo de Arquivo (MB)', 'Tamanho máximo permitido para upload de arquivos', false, false),
  ('session_timeout_minutes', '60', 'general', 'Timeout de Sessão (minutos)', 'Tempo de inatividade antes de deslogar automaticamente', false, false)
ON CONFLICT (key) DO NOTHING;

-- Função para buscar configuração (com cache)
CREATE OR REPLACE FUNCTION get_setting(setting_key TEXT)
RETURNS TEXT AS $$
DECLARE
  setting_value TEXT;
BEGIN
  SELECT value INTO setting_value
  FROM system_settings
  WHERE key = setting_key;
  
  RETURN setting_value;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função para atualizar configuração
CREATE OR REPLACE FUNCTION update_setting(setting_key TEXT, setting_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE system_settings
  SET value = setting_value, updated_at = NOW()
  WHERE key = setting_key;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE system_settings IS 'Configurações do sistema gerenciadas pela interface (sem precisar de variáveis de ambiente)';
