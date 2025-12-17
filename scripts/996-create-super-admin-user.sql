-- Criar usuário super admin fixo
-- Este usuário tem controle total do sistema

DO $$
DECLARE
  v_user_id UUID;
  v_hashed_password TEXT;
BEGIN
  -- Gerar hash bcrypt para a senha "Admin@2026"
  v_hashed_password := crypt('Admin@2026', gen_salt('bf', 10));

  -- Verificar se já existe
  SELECT id INTO v_user_id
  FROM users
  WHERE email = 'admin@aegis.com';

  IF v_user_id IS NULL THEN
    -- Criar novo super admin
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
      'admin@aegis.com',
      v_hashed_password,
      'Super Administrator',
      'super_admin',
      NULL, -- Super admin não tem client_id
      'active',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_user_id;

    RAISE NOTICE 'Super admin criado com sucesso! ID: %', v_user_id;
  ELSE
    -- Atualizar existente para super_admin
    UPDATE users
    SET 
      role = 'super_admin',
      client_id = NULL,
      password_hash = v_hashed_password,
      name = 'Super Administrator',
      status = 'active',
      updated_at = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE 'Usuário existente promovido a super admin! ID: %', v_user_id;
  END IF;
END $$;

-- Verificar resultado
SELECT 
  id,
  email,
  name,
  role,
  client_id,
  status,
  created_at
FROM users
WHERE email = 'admin@aegis.com';
