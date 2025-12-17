-- Rastreamento de uso de contas para analytics

-- Adicionar colunas para rastrear uso
ALTER TABLE github_tokens ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
ALTER TABLE github_tokens ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE github_tokens ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Índice para buscar contas ativas
CREATE INDEX IF NOT EXISTS idx_github_tokens_active ON github_tokens(is_active, user_id);

-- Função para registrar uso de conta
CREATE OR REPLACE FUNCTION record_account_usage(account_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE github_tokens
  SET 
    last_used_at = NOW(),
    usage_count = usage_count + 1
  WHERE id = account_id_param;
END;
$$ LANGUAGE plpgsql;

-- View para estatísticas de uso de contas
-- Removed reference to non-existent organization column
CREATE OR REPLACE VIEW account_usage_stats AS
SELECT 
  gt.id,
  gt.provider,
  gt.account_name,
  gt.usage_count,
  gt.last_used_at,
  gt.created_at,
  u.name as user_name,
  c.name as client_name,
  COUNT(DISTINCT a.id) as total_analyses,
  COUNT(DISTINCT r.id) as total_repositories
FROM github_tokens gt
LEFT JOIN users u ON gt.user_id = u.id
LEFT JOIN clients c ON gt.client_id = c.id
LEFT JOIN analyses a ON a.user_id = gt.user_id
LEFT JOIN repositories r ON r.user_id = gt.user_id
WHERE gt.is_active = true
GROUP BY gt.id, gt.provider, gt.account_name, gt.usage_count, 
         gt.last_used_at, gt.created_at, u.name, c.name;

COMMENT ON VIEW account_usage_stats IS 'Estatísticas de uso de contas conectadas';
