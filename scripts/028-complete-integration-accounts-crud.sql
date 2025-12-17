-- Add project column to integrations table to support multiple projects per organization
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS project TEXT;

-- Add integration_id to repositories to link each repo to a specific integration account
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS integration_id UUID REFERENCES integrations(id);

-- Add default_integration_id to users for dev-specific project assignment
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_integration_id UUID REFERENCES integrations(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_repositories_integration_id ON repositories(integration_id);
CREATE INDEX IF NOT EXISTS idx_users_default_integration ON users(default_integration_id);
CREATE INDEX IF NOT EXISTS idx_integrations_project ON integrations(project);

-- Add external_task fields to tasks if they don't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_task_id VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_task_url TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_provider VARCHAR(50);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_task_key VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_tasks_external_provider ON tasks(external_provider);
CREATE INDEX IF NOT EXISTS idx_tasks_external_task_id ON tasks(external_task_id);

-- Create view to see repositories with their integration details
CREATE OR REPLACE VIEW repositories_with_integrations AS
SELECT 
  r.id AS repository_id,
  r.name AS repository_name,
  r.full_name,
  r.provider AS repo_provider,
  r.client_id,
  i.id AS integration_id,
  i.name AS integration_name,
  i.organization AS azure_organization,
  i.project AS azure_project,
  i.base_url,
  i.status AS integration_status,
  ip.display_name AS provider_display_name
FROM repositories r
LEFT JOIN integrations i ON r.integration_id = i.id
LEFT JOIN integration_providers ip ON i.provider_id = ip.id;

-- Create view for user default integrations
CREATE OR REPLACE VIEW users_with_default_integration AS
SELECT 
  u.id AS user_id,
  u.name AS user_name,
  u.email,
  u.role,
  u.client_id,
  i.id AS default_integration_id,
  i.name AS default_integration_name,
  i.organization,
  i.project,
  ip.display_name AS provider_name
FROM users u
LEFT JOIN integrations i ON u.default_integration_id = i.id
LEFT JOIN integration_providers ip ON i.provider_id = ip.id;

COMMENT ON COLUMN integrations.project IS 'Project name for Azure DevOps, GitHub, etc.';
COMMENT ON COLUMN repositories.integration_id IS 'Links repository to specific integration account';
COMMENT ON COLUMN users.default_integration_id IS 'Default integration for developer tasks';
