-- Cria função para verificar senha usando crypt do PostgreSQL
-- Esta função funciona tanto com senhas em texto puro quanto com hash bcrypt

CREATE OR REPLACE FUNCTION verify_password(stored_hash TEXT, input_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Se o hash não começa com $2, é texto puro (problema de segurança mas permite login)
  IF NOT (stored_hash LIKE '$2%') THEN
    RETURN stored_hash = input_password;
  END IF;
  
  -- Verifica senha com bcrypt usando crypt
  RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Testa a função
SELECT verify_password('$2a$10$mYAmNMWAqO.53n7Y1L9MDe44plkUST.PFPfPdhOVRBmSq7F.4MsWy', 'admin123') as test_bcrypt;
SELECT verify_password('Kl@1209', 'Kl@1209') as test_plaintext;
