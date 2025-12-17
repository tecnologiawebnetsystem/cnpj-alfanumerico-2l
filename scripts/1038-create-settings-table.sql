-- Criar tabela de configurações globais por cliente
CREATE TABLE IF NOT EXISTS client_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, setting_key)
);

-- Criar índice para buscas rápidas
CREATE INDEX idx_client_settings_client_id ON client_settings(client_id);
CREATE INDEX idx_client_settings_key ON client_settings(client_id, setting_key);

-- Inserir configurações padrão para campos CNPJ (lista separada por vírgula)
-- Esses são os campos que o sistema vai buscar em arquivos de código
INSERT INTO client_settings (client_id, setting_key, setting_value)
SELECT DISTINCT client_id, 'cnpj_field_names', 'cnpj,CNPJ,Cnpj,cnpjField,cnpjValue,documentNumber,cpfCnpj,taxId,companyDocument'
FROM clients
ON CONFLICT (client_id, setting_key) DO NOTHING;

-- Inserir configurações padrão para extensões de arquivo
INSERT INTO client_settings (client_id, setting_key, setting_value)
SELECT DISTINCT client_id, 'file_extensions', '.ts,.tsx,.js,.jsx,.java,.cs,.sql,.py,.html,.css,.scss,.sass'
FROM clients
ON CONFLICT (client_id, setting_key) DO NOTHING;

-- Comentários
COMMENT ON TABLE client_settings IS 'Configurações personalizáveis por cliente';
COMMENT ON COLUMN client_settings.setting_key IS 'Chave da configuração (ex: cnpj_field_names, file_extensions)';
COMMENT ON COLUMN client_settings.setting_value IS 'Valor da configuração (texto livre, pode ser lista separada por vírgula)';
