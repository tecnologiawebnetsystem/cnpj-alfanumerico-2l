-- Add project and repository fields to findings table
-- This allows tracking which Azure DevOps project and repository each finding belongs to

-- Add repository column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'findings' AND column_name = 'repository'
  ) THEN
    ALTER TABLE findings ADD COLUMN repository TEXT;
    COMMENT ON COLUMN findings.repository IS 'Name of the repository where the finding was found';
  END IF;
END $$;

-- Add project column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'findings' AND column_name = 'project'
  ) THEN
    ALTER TABLE findings ADD COLUMN project TEXT;
    COMMENT ON COLUMN findings.project IS 'Name of the Azure DevOps project where the repository belongs';
  END IF;
END $$;

-- Create index on repository for better query performance
CREATE INDEX IF NOT EXISTS idx_findings_repository ON findings(repository);

-- Create index on project for better query performance
CREATE INDEX IF NOT EXISTS idx_findings_project ON findings(project);

-- Create composite index for project + repository queries
CREATE INDEX IF NOT EXISTS idx_findings_project_repository ON findings(project, repository);

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'findings' 
  AND column_name IN ('repository', 'project')
ORDER BY column_name;
