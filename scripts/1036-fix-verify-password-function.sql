-- Remove existing function first
DROP FUNCTION IF EXISTS verify_password(text, text);

-- Create the password verification function
-- This function checks if a password matches a hash (bcrypt) or plain text
CREATE OR REPLACE FUNCTION verify_password(
  input_password text,
  stored_hash text
) RETURNS boolean AS $$
BEGIN
  -- If stored_hash starts with $2a$ or $2b$, it's a bcrypt hash
  IF stored_hash LIKE '$2a$%' OR stored_hash LIKE '$2b$%' THEN
    -- Use crypt to verify bcrypt password
    RETURN crypt(input_password, stored_hash) = stored_hash;
  ELSE
    -- For plain text passwords (temporary - should be migrated to bcrypt)
    RETURN input_password = stored_hash;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_password(text, text) TO anon;

-- Test the function
SELECT 
  'Function test' as test,
  verify_password('admin123', '$2a$10$mYAmNMWAqO.53n7Y1L9MDe44plkUST.PFPfPdhOVRBmSq7F.4MsWy') as bcrypt_test,
  verify_password('Kl@1209', 'Kl@1209') as plaintext_test;
