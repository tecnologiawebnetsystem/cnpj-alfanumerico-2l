-- Add file_extensions column to github_tokens table for filtering analysis
ALTER TABLE github_tokens 
ADD COLUMN IF NOT EXISTS file_extensions TEXT;

-- Default extensions for analysis
UPDATE github_tokens 
SET file_extensions = '.ts,.html,.js,.java,.cs,.tsx,.css,.scss,.sass,.jsx,.sql'
WHERE file_extensions IS NULL;

COMMENT ON COLUMN github_tokens.file_extensions IS 'Comma-separated list of file extensions to analyze (e.g., .ts,.html,.js)';
