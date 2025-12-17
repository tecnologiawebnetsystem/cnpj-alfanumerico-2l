-- =====================================================
-- FUNÇÃO DE VERIFICAÇÃO DE SENHA NO POSTGRESQL (V2)
-- =====================================================
-- Corrige os tipos de retorno para corresponder ao schema da tabela users

-- Habilitar extensão pgcrypto se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remover função antiga se existir
DROP FUNCTION IF EXISTS verify_user_password(TEXT, TEXT);

-- Função para verificar senha e retornar dados do usuário
-- Usando VARCHAR em vez de TEXT para corresponder ao schema da tabela
CREATE OR REPLACE FUNCTION verify_user_password(
  p_email VARCHAR,
  p_password VARCHAR
)
RETURNS TABLE (
  user_id UUID,
  user_email VARCHAR,
  user_name VARCHAR,
  user_role VARCHAR,
  user_status VARCHAR,
  client_id UUID,
  password_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.status,
    u.client_id,
    (u.password_hash = crypt(p_password, u.password_hash)) AS password_valid
  FROM users u
  WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover função antiga se existir
DROP FUNCTION IF EXISTS hash_password(TEXT);

-- Função para criar hash de senha (para uso em reset de senha)
-- Usando VARCHAR para entrada e saída
CREATE OR REPLACE FUNCTION hash_password(p_password VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN crypt(p_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON FUNCTION verify_user_password IS 'Verifica senha do usuário e retorna dados se válida (tipos corrigidos para VARCHAR)';
COMMENT ON FUNCTION hash_password IS 'Cria hash bcrypt de uma senha (retorna VARCHAR)';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Garantir que as funções possam ser executadas via RPC
GRANT EXECUTE ON FUNCTION verify_user_password(VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_user_password(VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION hash_password(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION hash_password(VARCHAR) TO service_role;
