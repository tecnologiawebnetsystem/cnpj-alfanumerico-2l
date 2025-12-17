-- Drop existing objects if they exist
DROP INDEX IF EXISTS idx_client_settings_client_id;
DROP INDEX IF EXISTS idx_client_settings_lookup;
DROP TABLE IF EXISTS client_settings CASCADE;

-- Create client_settings table
CREATE TABLE client_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, setting_key)
);

-- Create indexes
CREATE INDEX idx_client_settings_client_id ON client_settings(client_id);
CREATE INDEX idx_client_settings_lookup ON client_settings(client_id, setting_key);

-- Insert default CNPJ field names configuration for all existing clients
INSERT INTO client_settings (client_id, setting_key, setting_value)
SELECT 
  id as client_id,
  'cnpj_field_names' as setting_key,
  '["cnpj", "documentNumber", "taxId", "registrationNumber", "companyId", "document", "doc", "cpfCnpj"]' as setting_value
FROM clients
ON CONFLICT (client_id, setting_key) DO NOTHING;

-- Insert default file extensions configuration for all existing clients
INSERT INTO client_settings (client_id, setting_key, setting_value)
SELECT 
  id as client_id,
  'file_extensions' as setting_key,
  '[".sql", ".java", ".ts", ".tsx", ".js", ".jsx", ".py", ".cs", ".php", ".rb", ".go", ".kt", ".swift"]' as setting_value
FROM clients
ON CONFLICT (client_id, setting_key) DO NOTHING;

-- Verification query
SELECT 
  c.name as client_name,
  cs.setting_key,
  cs.setting_value
FROM client_settings cs
JOIN clients c ON c.id = cs.client_id
ORDER BY c.name, cs.setting_key;
