-- Add PR tracking columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS code_current TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS code_suggested TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS code_context_before TEXT[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS code_context_after TEXT[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS file_language VARCHAR(50);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pr_url TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pr_number INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pr_branch VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pr_status VARCHAR(50) CHECK (pr_status IN ('open', 'merged', 'closed', 'draft'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS applied_by UUID REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS apply_method VARCHAR(50) CHECK (apply_method IN ('pull_request', 'direct_commit', 'manual'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_pr_status ON tasks(pr_status) WHERE pr_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_applied_by ON tasks(applied_by);
CREATE INDEX IF NOT EXISTS idx_tasks_file_path ON tasks(file_path);

-- Comments
COMMENT ON COLUMN tasks.code_current IS 'Current code snippet with the issue';
COMMENT ON COLUMN tasks.code_suggested IS 'Suggested fixed code snippet';
COMMENT ON COLUMN tasks.code_context_before IS 'Lines of code before the issue (for context)';
COMMENT ON COLUMN tasks.code_context_after IS 'Lines of code after the issue (for context)';
COMMENT ON COLUMN tasks.file_language IS 'Programming language of the file (typescript, javascript, sql, etc)';
COMMENT ON COLUMN tasks.pr_url IS 'URL of the created Pull Request';
COMMENT ON COLUMN tasks.pr_number IS 'Pull Request number';
COMMENT ON COLUMN tasks.pr_branch IS 'Git branch name where the fix was applied';
COMMENT ON COLUMN tasks.pr_status IS 'Status of the Pull Request';
COMMENT ON COLUMN tasks.applied_at IS 'Timestamp when the fix was applied';
COMMENT ON COLUMN tasks.applied_by IS 'User who applied the fix';
COMMENT ON COLUMN tasks.apply_method IS 'Method used to apply the fix';
