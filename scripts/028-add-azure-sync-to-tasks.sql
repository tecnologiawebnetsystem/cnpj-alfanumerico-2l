-- Add Azure DevOps sync fields to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS azure_work_item_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS azure_work_item_url TEXT;

-- Add Azure organization and project to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS azure_organization VARCHAR(255),
ADD COLUMN IF NOT EXISTS azure_project VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_azure_work_item ON tasks(azure_work_item_id);

-- Verification
SELECT 
  'tasks' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'tasks' 
  AND column_name IN ('azure_work_item_id', 'azure_work_item_url')
ORDER BY column_name;
