-- Add is_on_premise field to github_tokens table
-- This field indicates whether the Azure DevOps URL is on-premise or cloud

ALTER TABLE github_tokens 
ADD COLUMN IF NOT EXISTS is_on_premise BOOLEAN DEFAULT false;

-- Add base_url field to store custom on-premise URLs
ALTER TABLE github_tokens 
ADD COLUMN IF NOT EXISTS base_url TEXT;

-- Comment for documentation
COMMENT ON COLUMN github_tokens.is_on_premise IS 'Indicates if the Azure DevOps is on-premise (true) or cloud (false)';
COMMENT ON COLUMN github_tokens.base_url IS 'Custom base URL for on-premise Azure DevOps servers (e.g., https://devops.bs2.com)';
