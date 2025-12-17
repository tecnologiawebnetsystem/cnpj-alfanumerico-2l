-- ================================================
-- SCRIPT: Funções auxiliares para APIs
-- ================================================

-- Função para criar usuário com senha criptografada
CREATE OR REPLACE FUNCTION create_user_with_password(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT,
  p_client_id UUID,
  p_status TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO users (
    email,
    password_hash,
    name,
    role,
    client_id,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    p_name,
    p_role,
    p_client_id,
    p_status,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar senha do usuário
CREATE OR REPLACE FUNCTION update_user_password(
  p_user_id UUID,
  p_password TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users
  SET 
    password_hash = crypt(p_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar criação
SELECT 'Funções auxiliares criadas com sucesso!' as status;
