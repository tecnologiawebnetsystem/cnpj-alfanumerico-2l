-- Remove license fields and triggers that are causing conflicts
-- This must be executed BEFORE creating developers

-- Drop triggers that reference license fields
DROP TRIGGER IF EXISTS trigger_update_license_timestamp ON clients;

-- Drop functions that reference license fields
DROP FUNCTION IF EXISTS is_license_active(UUID);
DROP FUNCTION IF EXISTS update_license_timestamp();
DROP FUNCTION IF EXISTS check_expired_licenses();

-- Remove license columns from clients table
ALTER TABLE clients 
DROP COLUMN IF EXISTS license_active,
DROP COLUMN IF EXISTS license_end,
DROP COLUMN IF EXISTS license_start,
DROP COLUMN IF EXISTS license_type;

-- Remove license-related indexes
DROP INDEX IF EXISTS idx_clients_license_active;
DROP INDEX IF EXISTS idx_clients_license_end;

COMMENT ON TABLE clients IS 'Tabela de clientes sem sistema de licenciamento';
