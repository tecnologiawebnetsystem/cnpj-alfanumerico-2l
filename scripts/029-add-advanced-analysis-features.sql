-- Script SQL para adicionar features avançadas de análise
-- Execução segura: pode rodar múltiplas vezes sem problemas

-- 1. Adicionar suporte para análise incremental (cache)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'analysis_cache' AND column_name = 'file_hashes') THEN
    ALTER TABLE analysis_cache ADD COLUMN file_hashes JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'analysis_cache' AND column_name = 'cnpj_patterns') THEN
    ALTER TABLE analysis_cache ADD COLUMN cnpj_patterns JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 2. Adicionar campos para comparação de análises
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'analysis_comparisons' AND column_name = 'findings_added') THEN
    ALTER TABLE analysis_comparisons ADD COLUMN findings_added INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'analysis_comparisons' AND column_name = 'findings_removed') THEN
    ALTER TABLE analysis_comparisons ADD COLUMN findings_removed INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'analysis_comparisons' AND column_name = 'findings_unchanged') THEN
    ALTER TABLE analysis_comparisons ADD COLUMN findings_unchanged INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Adicionar scheduler para análises automáticas  
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'scheduled_analyses' AND column_name = 'last_analysis_id') THEN
    ALTER TABLE scheduled_analyses ADD COLUMN last_analysis_id UUID REFERENCES analyses(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'scheduled_analyses' AND column_name = 'total_runs') THEN
    ALTER TABLE scheduled_analyses ADD COLUMN total_runs INTEGER DEFAULT 0;
  END IF;
END $$;

-- Removido WHERE expires_at > NOW() pois NOW() não é IMMUTABLE
-- 4. Índices para melhorar performance das novas features
CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires ON analysis_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_client_repo ON analysis_cache(client_id, repository_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_scheduled_analyses_next_run ON scheduled_analyses(next_run_at, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_analysis_comparisons_client ON analysis_comparisons(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_findings_analysis_project_repo ON findings(analysis_id, project, repository);

-- 5. Criar view para métricas agregadas de análises
CREATE OR REPLACE VIEW analysis_metrics_aggregated AS
SELECT 
  a.client_id,
  a.id as analysis_id,
  a.created_at,
  a.status,
  COUNT(DISTINCT f.id) as code_findings_count,
  COUNT(DISTINCT df.id) as db_findings_count,
  COUNT(DISTINCT f.project) as projects_count,
  COUNT(DISTINCT f.repository) as repositories_count,
  COUNT(DISTINCT f.file_path) as files_count,
  COALESCE(SUM(CASE WHEN f.field_type LIKE '%CNPJ%' THEN 1 ELSE 0 END), 0) as cnpj_findings,
  COALESCE(AVG(EXTRACT(EPOCH FROM (a.completed_at - a.created_at))), 0) as duration_seconds
FROM analyses a
LEFT JOIN findings f ON f.analysis_id = a.id
LEFT JOIN database_findings df ON df.analysis_id = a.id
WHERE a.status = 'completed'
GROUP BY a.client_id, a.id, a.created_at, a.status;

-- 6. Criar view para top repositórios com mais problemas
CREATE OR REPLACE VIEW top_problematic_repositories AS
SELECT 
  f.client_id,
  f.project,
  f.repository,
  COUNT(DISTINCT f.id) as total_findings,
  COUNT(DISTINCT f.file_path) as affected_files,
  COUNT(DISTINCT f.analysis_id) as times_analyzed,
  MAX(a.created_at) as last_analyzed_at
FROM findings f
JOIN analyses a ON a.id = f.analysis_id
WHERE f.repository IS NOT NULL
GROUP BY f.client_id, f.project, f.repository
ORDER BY total_findings DESC
LIMIT 100;

-- 7. Garantir RLS nas tabelas
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_analyses ENABLE ROW LEVEL SECURITY;

-- Policies para analysis_cache (já existem mas garantindo)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analysis_cache' AND policyname = 'clients_view_own_cache') THEN
    CREATE POLICY clients_view_own_cache ON analysis_cache FOR SELECT USING (client_id = (current_setting('app.current_client_id'::text))::uuid);
  END IF;
END $$;

-- Policies para analysis_comparisons
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analysis_comparisons' AND policyname = 'clients_view_own_comparisons') THEN
    CREATE POLICY clients_view_own_comparisons ON analysis_comparisons FOR SELECT USING (client_id = (current_setting('app.current_client_id'::text))::uuid);
  END IF;
END $$;

-- Policies para scheduled_analyses (já existem mas garantindo)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scheduled_analyses' AND policyname = 'clients_manage_own_schedules') THEN
    CREATE POLICY clients_manage_own_schedules ON scheduled_analyses FOR ALL USING (client_id = (current_setting('app.current_client_id'::text))::uuid);
  END IF;
END $$;

-- 8. Comentários nas tabelas para documentação
COMMENT ON COLUMN analysis_cache.file_hashes IS 'Hash MD5 de cada arquivo analisado para detectar mudanças';
COMMENT ON COLUMN analysis_cache.cnpj_patterns IS 'Padrões CNPJ usados nesta análise para validar se mudaram';
COMMENT ON VIEW analysis_metrics_aggregated IS 'Métricas agregadas de todas as análises completas';
COMMENT ON VIEW top_problematic_repositories IS 'Top 100 repositórios com mais findings CNPJ';

-- Verificação final
SELECT 
  'analysis_cache' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'analysis_cache'
UNION ALL
SELECT 
  'scheduled_analyses',
  COUNT(*)
FROM information_schema.columns 
WHERE table_name = 'scheduled_analyses'
UNION ALL
SELECT
  'analysis_comparisons',
  COUNT(*)
FROM information_schema.columns
WHERE table_name = 'analysis_comparisons';
