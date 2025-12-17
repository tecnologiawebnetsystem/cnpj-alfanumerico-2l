-- Script 027: Suporte para Múltiplas Contas Azure DevOps
-- Descrição: Permite que clientes tenham várias organizações e projetos do Azure DevOps

-- Adicionar coluna project na tabela integrations (que já existe)
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS project VARCHAR(255);

-- Adicionar coluna integration_id na tabela repositories para vincular repositório a integração específica
ALTER TABLE repositories
ADD COLUMN IF NOT EXISTS integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_repositories_integration_id
ON repositories(integration_id);

-- Criar índice único para evitar duplicação de org+projeto por cliente
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_azure_org_project_per_client
ON integrations(client_id, provider_id, organization, project)
WHERE project IS NOT NULL;

-- Adicionar comentários explicativos
COMMENT ON COLUMN integrations.project IS 'Nome do projeto no Azure DevOps (permite múltiplos projetos por organização)';
COMMENT ON COLUMN repositories.integration_id IS 'ID da integração específica (org+projeto Azure DevOps) usada para este repositório';

-- View para facilitar consultas de repositórios com integrações
CREATE OR REPLACE VIEW repositories_with_integrations AS
SELECT 
  r.id as repository_id,
  r.name as repository_name,
  r.full_name,
  r.provider as repo_provider,
  r.client_id,
  i.id as integration_id,
  i.name as integration_name,
  i.organization as azure_organization,
  i.project as azure_project,
  i.base_url,
  i.status as integration_status,
  ip.display_name as provider_display_name
FROM repositories r
LEFT JOIN integrations i ON r.integration_id = i.id
LEFT JOIN integration_providers ip ON i.provider_id = ip.id;

COMMENT ON VIEW repositories_with_integrations IS 'View que mostra repositórios vinculados a suas integrações Azure DevOps específicas';
