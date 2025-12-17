-- Adiciona funções de criptografia para integrações usando pgcrypto
-- Isso elimina a necessidade de criptografar no código JavaScript

-- Habilita a extensão pgcrypto se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para criptografar texto
-- Usa uma chave fixa para simplificar (em produção, use uma chave mais segura)
CREATE OR REPLACE FUNCTION encrypt_text(text_to_encrypt TEXT)
RETURNS TEXT AS $$
BEGIN
  IF text_to_encrypt IS NULL OR text_to_encrypt = '' THEN
    RETURN NULL;
  END IF;
  
  -- Usa AES com uma chave derivada
  -- Em produção, você pode usar uma chave mais segura armazenada de forma segura
  RETURN encode(
    pgp_sym_encrypt(
      text_to_encrypt,
      'v0-integration-encryption-key-change-in-production'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para descriptografar texto
CREATE OR REPLACE FUNCTION decrypt_text(encrypted_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF encrypted_text IS NULL OR encrypted_text = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN pgp_sym_decrypt(
      decode(encrypted_text, 'base64'),
      'v0-integration-encryption-key-change-in-production'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Se falhar ao descriptografar, retorna NULL
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualiza a tabela integrations para usar criptografia automática via triggers
-- Trigger para criptografar antes de inserir
CREATE OR REPLACE FUNCTION encrypt_integration_credentials()
RETURNS TRIGGER AS $$
BEGIN
  -- Criptografa os campos sensíveis se não estiverem vazios
  IF NEW.client_secret IS NOT NULL AND NEW.client_secret != '' THEN
    NEW.client_secret = encrypt_text(NEW.client_secret);
  END IF;
  
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' THEN
    NEW.access_token = encrypt_text(NEW.access_token);
  END IF;
  
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token != '' THEN
    NEW.refresh_token = encrypt_text(NEW.refresh_token);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove trigger antigo se existir
DROP TRIGGER IF EXISTS encrypt_integration_credentials_trigger ON integrations;

-- Cria trigger para criptografar antes de inserir ou atualizar
CREATE TRIGGER encrypt_integration_credentials_trigger
  BEFORE INSERT OR UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_integration_credentials();

-- Função helper para buscar integração com credenciais descriptografadas
CREATE OR REPLACE FUNCTION get_integration_with_decrypted_credentials(integration_id UUID)
RETURNS TABLE (
  id UUID,
  client_id UUID,
  user_id UUID,
  provider_id UUID,
  name VARCHAR,
  description TEXT,
  client_id_value TEXT,
  client_secret_decrypted TEXT,
  access_token_decrypted TEXT,
  refresh_token_decrypted TEXT,
  base_url TEXT,
  organization TEXT,
  status VARCHAR,
  last_tested_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.client_id,
    i.user_id,
    i.provider_id,
    i.name,
    i.description,
    i.client_id_value,
    decrypt_text(i.client_secret) as client_secret_decrypted,
    decrypt_text(i.access_token) as access_token_decrypted,
    decrypt_text(i.refresh_token) as refresh_token_decrypted,
    i.base_url,
    i.organization,
    i.status,
    i.last_tested_at,
    i.last_error,
    i.created_at,
    i.updated_at
  FROM integrations i
  WHERE i.id = integration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Concede permissões
GRANT EXECUTE ON FUNCTION encrypt_text(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrypt_text(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_integration_with_decrypted_credentials(UUID) TO authenticated;

-- Comentários
COMMENT ON FUNCTION encrypt_text IS 'Criptografa texto usando pgcrypto';
COMMENT ON FUNCTION decrypt_text IS 'Descriptografa texto criptografado com pgcrypto';
COMMENT ON FUNCTION get_integration_with_decrypted_credentials IS 'Busca integração com credenciais descriptografadas';
