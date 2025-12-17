-- Add account_name column to github_tokens table
ALTER TABLE github_tokens 
ADD COLUMN IF NOT EXISTS account_name VARCHAR(255);

-- Add comment
COMMENT ON COLUMN github_tokens.account_name IS 'User-friendly name for the account to differentiate multiple accounts';
