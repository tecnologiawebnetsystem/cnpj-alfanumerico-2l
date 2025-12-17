-- Create a PostgreSQL function to verify passwords using crypt
-- This allows us to verify bcrypt passwords directly in the database

CREATE OR REPLACE FUNCTION verify_user_password(p_email TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_password_hash TEXT;
  v_is_valid BOOLEAN;
BEGIN
  -- Get the password hash for the user
  SELECT password_hash INTO v_password_hash
  FROM users
  WHERE email = p_email
  LIMIT 1;
  
  -- If user not found, return false
  IF v_password_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if password hash starts with $2 (bcrypt)
  IF v_password_hash LIKE '$2%' THEN
    -- Use crypt to verify bcrypt password
    v_is_valid := (crypt(p_password, v_password_hash) = v_password_hash);
  ELSE
    -- Plain text password (security issue, but allow for migration)
    v_is_valid := (p_password = v_password_hash);
  END IF;
  
  RETURN v_is_valid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_user_password(TEXT, TEXT) TO authenticated, anon, service_role;
