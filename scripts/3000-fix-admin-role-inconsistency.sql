-- Fix inconsistent admin roles in users table
-- Convert lowercase "admin" to uppercase "ADMIN_CLIENT" for consistency

DO $$
DECLARE
  admin_count INTEGER;
  admin_client_count INTEGER;
BEGIN
  -- Count current roles
  SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
  SELECT COUNT(*) INTO admin_client_count FROM users WHERE role = 'ADMIN_CLIENT';
  
  RAISE NOTICE 'Before update: % users with role "admin", % users with role "ADMIN_CLIENT"', 
    admin_count, admin_client_count;

  -- Update lowercase "admin" to "ADMIN_CLIENT"
  UPDATE users
  SET role = 'ADMIN_CLIENT'
  WHERE role = 'admin';

  -- Count after update
  SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
  SELECT COUNT(*) INTO admin_client_count FROM users WHERE role = 'ADMIN_CLIENT';
  
  RAISE NOTICE 'After update: % users with role "admin", % users with role "ADMIN_CLIENT"', 
    admin_count, admin_client_count;
    
  RAISE NOTICE 'Role standardization completed successfully!';
END $$;
