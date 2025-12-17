-- Add columns to findings table for storing detailed code context
ALTER TABLE findings
ADD COLUMN IF NOT EXISTS code_before TEXT[], -- Lines before the CNPJ
ADD COLUMN IF NOT EXISTS code_current TEXT,   -- Current line with CNPJ
ADD COLUMN IF NOT EXISTS code_after TEXT[],   -- Lines after the CNPJ
ADD COLUMN IF NOT EXISTS code_suggested TEXT, -- Suggested corrected line
ADD COLUMN IF NOT EXISTS cnpj_found TEXT,     -- Actual CNPJ value found
ADD COLUMN IF NOT EXISTS cnpj_replacement TEXT, -- Suggested replacement
ADD COLUMN IF NOT EXISTS action_required TEXT DEFAULT 'UPDATE', -- UPDATE or NONE
ADD COLUMN IF NOT EXISTS observation TEXT;    -- Additional notes

-- Add columns to tasks table for Azure DevOps integration
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS azure_devops_id TEXT, -- Work Item ID in Azure DevOps
ADD COLUMN IF NOT EXISTS azure_synced_at TIMESTAMP WITH TIME ZONE, -- Last sync timestamp
ADD COLUMN IF NOT EXISTS azure_work_item_url TEXT, -- Direct link to Work Item
ADD COLUMN IF NOT EXISTS repository_name TEXT, -- Repository name
ADD COLUMN IF NOT EXISTS file_path TEXT,       -- File path for this task
ADD COLUMN IF NOT EXISTS line_number INTEGER,  -- Line number
ADD COLUMN IF NOT EXISTS language TEXT,        -- Programming language
ADD COLUMN IF NOT EXISTS code_before TEXT[],   -- Code context before
ADD COLUMN IF NOT EXISTS code_current TEXT,    -- Current code line
ADD COLUMN IF NOT EXISTS code_after TEXT[],    -- Code context after
ADD COLUMN IF NOT EXISTS code_suggested TEXT,  -- Suggested fix
ADD COLUMN IF NOT EXISTS checklist JSONB;      -- Checklist items

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_findings_action ON findings(action_required);
CREATE INDEX IF NOT EXISTS idx_tasks_azure_id ON tasks(azure_devops_id);
CREATE INDEX IF NOT EXISTS idx_tasks_analysis_id ON tasks(analysis_id);

COMMENT ON COLUMN findings.code_before IS 'Array of code lines before the CNPJ occurrence (context)';
COMMENT ON COLUMN findings.code_current IS 'The actual line containing the CNPJ';
COMMENT ON COLUMN findings.code_after IS 'Array of code lines after the CNPJ occurrence (context)';
COMMENT ON COLUMN findings.code_suggested IS 'Suggested corrected version of the line';
COMMENT ON COLUMN findings.action_required IS 'UPDATE if changes needed, NONE if no action required';
COMMENT ON COLUMN findings.observation IS 'Additional notes about why action is or is not required';

COMMENT ON COLUMN tasks.azure_devops_id IS 'Azure DevOps Work Item ID for synchronization';
COMMENT ON COLUMN tasks.code_before IS 'Code context for developers to understand the change';
COMMENT ON COLUMN tasks.code_current IS 'Current code that needs to be changed';
COMMENT ON COLUMN tasks.code_suggested IS 'Suggested fixed code';
