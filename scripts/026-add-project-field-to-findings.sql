-- Add project column to findings table to store Azure DevOps project name
ALTER TABLE findings 
ADD COLUMN IF NOT EXISTS project VARCHAR(255);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_findings_project ON findings(project);

-- Update existing findings to extract project from repository if possible
UPDATE findings
SET project = split_part(repository, '/', 1)
WHERE project IS NULL AND repository IS NOT NULL AND repository LIKE '%/%';

-- Add comment to column
COMMENT ON COLUMN findings.project IS 'Azure DevOps project name or GitHub organization';
