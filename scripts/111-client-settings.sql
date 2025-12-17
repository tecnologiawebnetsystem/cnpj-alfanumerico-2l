-- Tabela para armazenar configurações específicas de cada cliente
CREATE TABLE IF NOT EXISTS client_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  category TEXT NOT NULL, -- 'email', 'whatsapp', 'webhooks', 'ai', 'general'
  label TEXT NOT NULL,
  description TEXT,
  is_secret BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, key)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_client_settings_client_id ON client_settings(client_id);
CREATE INDEX IF NOT EXISTS idx_client_settings_category ON client_settings(category);

-- RLS
ALTER TABLE client_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Clients can view own settings"
  ON client_settings FOR SELECT
  USING (client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage own client settings"
  ON client_settings FOR ALL
  USING (
    client_id IN (
      SELECT client_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Inserir configurações padrão para clientes existentes
INSERT INTO client_settings (client_id, key, value, category, label, description, is_secret, is_required)
SELECT 
  id as client_id,
  'resend_api_key',
  NULL,
  'email',
  'Resend API Key',
  'Chave de API do Resend para envio de emails',
  true,
  false
FROM clients
ON CONFLICT (client_id, key) DO NOTHING;

INSERT INTO client_settings (client_id, key, value, category, label, description, is_secret, is_required)
SELECT 
  id as client_id,
  'app_url',
  NULL,
  'general',
  'URL da Aplicação',
  'URL base da sua aplicação (ex: https://meuapp.com)',
  false,
  false
FROM clients
ON CONFLICT (client_id, key) DO NOTHING;

INSERT INTO client_settings (client_id, key, value, category, label, description, is_secret, is_required)
SELECT 
  id as client_id,
  'whatsapp_api_key',
  NULL,
  'whatsapp',
  'WhatsApp API Key',
  'Chave de API para integração com WhatsApp',
  true,
  false
FROM clients
ON CONFLICT (client_id, key) DO NOTHING;

INSERT INTO client_settings (client_id, key, value, category, label, description, is_secret, is_required)
SELECT 
  id as client_id,
  'whatsapp_phone',
  NULL,
  'whatsapp',
  'Número WhatsApp',
  'Número de telefone do WhatsApp Business',
  false,
  false
FROM clients
ON CONFLICT (client_id, key) DO NOTHING;
