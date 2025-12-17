-- =====================================================
-- SISTEMA DE LICENCIAMENTO
-- =====================================================

-- Adicionar campos de licença na tabela clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS license_start DATE,
ADD COLUMN IF NOT EXISTS license_end DATE,
ADD COLUMN IF NOT EXISTS license_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'monthly' CHECK (license_type IN ('monthly', 'quarterly', 'annual', 'perpetual')),
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS max_repositories INTEGER DEFAULT 10;

-- Criar índice para verificação rápida de licenças
CREATE INDEX IF NOT EXISTS idx_clients_license_active ON clients(license_active);
CREATE INDEX IF NOT EXISTS idx_clients_license_end ON clients(license_end);

-- Função para verificar se licença está ativa
CREATE OR REPLACE FUNCTION is_license_active(client_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  client_record RECORD;
BEGIN
  SELECT license_active, license_end INTO client_record
  FROM clients
  WHERE id = client_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Verifica se está ativa E se não expirou
  IF client_record.license_active = false THEN
    RETURN false;
  END IF;
  
  IF client_record.license_end IS NOT NULL AND client_record.license_end < CURRENT_DATE THEN
    -- Desativa automaticamente se expirou
    UPDATE clients SET license_active = false WHERE id = client_uuid;
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para desativar licenças expiradas (executar diariamente via cron)
CREATE OR REPLACE FUNCTION deactivate_expired_licenses()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE clients 
  SET license_active = false
  WHERE license_active = true 
    AND license_end IS NOT NULL 
    AND license_end < CURRENT_DATE;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at quando licença muda
CREATE OR REPLACE FUNCTION update_license_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.license_active != OLD.license_active) OR 
     (NEW.license_start != OLD.license_start) OR 
     (NEW.license_end != OLD.license_end) THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_license_timestamp ON clients;
CREATE TRIGGER trigger_update_license_timestamp
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_license_timestamp();

-- Comentários
COMMENT ON COLUMN clients.license_start IS 'Data de início da licença';
COMMENT ON COLUMN clients.license_end IS 'Data de término da licença (NULL = sem expiração)';
COMMENT ON COLUMN clients.license_active IS 'Se a licença está ativa (pode ser desativada manualmente)';
COMMENT ON COLUMN clients.license_type IS 'Tipo de licença: monthly, quarterly, annual, perpetual';
COMMENT ON COLUMN clients.auto_renew IS 'Se a licença renova automaticamente';
COMMENT ON COLUMN clients.max_users IS 'Número máximo de usuários permitidos';
COMMENT ON COLUMN clients.max_repositories IS 'Número máximo de repositórios permitidos';
