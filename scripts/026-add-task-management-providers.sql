-- Add support for multiple task management platforms (Jira, GitHub Issues, Linear, GitLab Issues)

-- Add columns to track external tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_task_id VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_task_url TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_provider VARCHAR(50);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_task_key VARCHAR(100);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_external_provider ON tasks(external_provider);
CREATE INDEX IF NOT EXISTS idx_tasks_external_task_id ON tasks(external_task_id);

-- Add provider field to github_tokens if not exists (already exists from script 013)
-- This will store the task management provider preference

-- Comments
COMMENT ON COLUMN tasks.external_task_id IS 'ID of the task in external system (Jira issue ID, GitHub issue number, Linear issue ID, etc)';
COMMENT ON COLUMN tasks.external_task_url IS 'Full URL to view the task in external system';
COMMENT ON COLUMN tasks.external_provider IS 'Task management provider: jira, github-issues, gitlab-issues, linear, trello, asana, azure-boards';
COMMENT ON COLUMN tasks.external_task_key IS 'Human-readable key (e.g., PROJ-123 for Jira, #456 for GitHub)';
