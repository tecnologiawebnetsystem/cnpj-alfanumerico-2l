-- Fix plain text password for kleber.goncalves.1209@gmail.com
-- Convert password "Kl@1209" to bcrypt hash

UPDATE users
SET 
  password_hash = crypt('Kl@1209', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'kleber.goncalves.1209@gmail.com';

-- Verify the update
SELECT 
  email, 
  role,
  LEFT(password_hash, 10) as password_hash_prefix,
  LENGTH(password_hash) as hash_length,
  updated_at
FROM users 
WHERE email = 'kleber.goncalves.1209@gmail.com';
