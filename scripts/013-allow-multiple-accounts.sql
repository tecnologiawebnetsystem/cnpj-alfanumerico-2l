-- Remove the unique constraint that limits one token per user
-- This allows users to have multiple GitHub/GitLab/Azure accounts
DROP INDEX IF EXISTS idx_github_tokens_user_unique;

-- Create a new unique constraint that allows multiple tokens per user
-- but ensures uniqueness by (user_id + account_name)
CREATE UNIQUE INDEX IF NOT EXISTS idx_github_tokens_user_account_unique 
ON github_tokens(user_id, COALESCE(account_name, 'default'));

-- Add provider column if it doesn't exist (to support GitHub, GitLab, Azure DevOps)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'github_tokens' AND column_name = 'provider'
  ) THEN
    ALTER TABLE github_tokens 
    ADD COLUMN provider VARCHAR(50) DEFAULT 'github' NOT NULL;
    
    CREATE INDEX idx_github_tokens_provider ON github_tokens(provider);
  END IF;
END $$;

-- Update existing tokens to infer provider from scope
UPDATE github_tokens 
SET provider = CASE 
  WHEN scope = 'gitlab' THEN 'gitlab'
  WHEN scope != 'repo' AND scope != 'gitlab' THEN 'azure'
  ELSE 'github'
END
WHERE provider IS NULL OR provider = '';

-- Add comment explaining the new structure
COMMENT ON COLUMN github_tokens.provider IS 'Repository provider: github, gitlab, azure, bitbucket';
COMMENT ON COLUMN github_tokens.account_name IS 'User-friendly name to differentiate multiple accounts of the same provider';
COMMENT ON INDEX idx_github_tokens_user_account_unique IS 'Allows multiple accounts per user with unique account names';
