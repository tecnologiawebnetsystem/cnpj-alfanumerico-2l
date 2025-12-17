-- Add azure_devops_id column to repositories table for Azure DevOps UUID support
-- This fixes the error: invalid input syntax for type bigint: "6ac6c671-9082-4444-a82b-a098a40fbbc9"

ALTER TABLE repositories 
ADD COLUMN IF NOT EXISTS azure_devops_id UUID;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_repositories_azure_devops_id ON repositories(azure_devops_id);

-- Add provider column to identify which provider the repository belongs to
ALTER TABLE repositories 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'github';

-- Add index for faster provider lookups
CREATE INDEX IF NOT EXISTS idx_repositories_provider ON repositories(provider);

COMMENT ON COLUMN repositories.azure_devops_id IS 'Azure DevOps repository UUID (different from GitHub bigint ID)';
COMMENT ON COLUMN repositories.provider IS 'Repository provider: github, gitlab, azure, etc.';
