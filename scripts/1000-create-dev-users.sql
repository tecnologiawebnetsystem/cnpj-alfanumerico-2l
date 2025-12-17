-- Script para criar 2 usuários desenvolvedores de teste
-- Execute este script para testar o layout do perfil DEV

-- Buscar o ID do cliente Aegis Technology
DO $$
DECLARE
  v_client_id uuid;
BEGIN
  -- Pegar o client_id do Aegis Technology
  SELECT id INTO v_client_id FROM clients WHERE name = 'Aegis Technology' LIMIT 1;
  
  -- Se não existir, criar o cliente
  IF v_client_id IS NULL THEN
    INSERT INTO clients (id, name, cnpj, email, status)
    VALUES (
      gen_random_uuid(),
      'Aegis Technology',
      '12345678000199',
      'contato@aegistech.com',
      'active'
    )
    RETURNING id INTO v_client_id;
  END IF;

  -- Criar Desenvolvedor 1: Carlos Silva
  INSERT INTO users (id, name, email, password_hash, role, client_id, status, created_at)
  VALUES (
    gen_random_uuid(),
    'Carlos Silva',
    'carlos.silva@aegistech.com',
    crypt('Dev@1234', gen_salt('bf')),
    'dev',
    v_client_id,
    'active',
    now()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    name = 'Carlos Silva',
    password_hash = crypt('Dev@1234', gen_salt('bf')),
    role = 'dev',
    client_id = v_client_id,
    status = 'active',
    updated_at = now();

  -- Criar Desenvolvedor 2: Ana Santos
  INSERT INTO users (id, name, email, password_hash, role, client_id, status, created_at)
  VALUES (
    gen_random_uuid(),
    'Ana Santos',
    'ana.santos@aegistech.com',
    crypt('Dev@1234', gen_salt('bf')),
    'dev',
    v_client_id,
    'active',
    now()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    name = 'Ana Santos',
    password_hash = crypt('Dev@1234', gen_salt('bf')),
    role = 'dev',
    client_id = v_client_id,
    status = 'active',
    updated_at = now();

  RAISE NOTICE 'Desenvolvedores criados com sucesso!';
  RAISE NOTICE 'Dev 1: carlos.silva@aegistech.com / Dev@1234';
  RAISE NOTICE 'Dev 2: ana.santos@aegistech.com / Dev@1234';
END $$;
