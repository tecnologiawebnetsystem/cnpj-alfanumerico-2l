-- Sistema de Cache e Otimização de Performance

-- Tabela de cache de análises
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Chave do cache (hash do repositório + branch + último commit)
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  
  -- Dados do repositório
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  branch VARCHAR(100) DEFAULT 'main',
  last_commit_sha VARCHAR(100),
  
  -- Resultado em cache
  findings JSONB,
  tasks JSONB,
  statistics JSONB,
  
  -- Metadados
  file_count INTEGER,
  total_size_kb INTEGER,
  analysis_duration_ms INTEGER,
  
  -- Client
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ
);

CREATE INDEX idx_analysis_cache_key ON analysis_cache(cache_key);
CREATE INDEX idx_analysis_cache_repo ON analysis_cache(repository_id);
CREATE INDEX idx_analysis_cache_expires ON analysis_cache(expires_at);

-- Tabela de arquivos já analisados (para análise incremental)
CREATE TABLE IF NOT EXISTS analyzed_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_hash VARCHAR(64) NOT NULL, -- SHA-256 do conteúdo
  
  -- Resultado da análise deste arquivo
  has_cnpj BOOLEAN DEFAULT false,
  findings JSONB,
  
  -- Timestamps
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índice composto para lookup rápido
  UNIQUE(repository_id, file_path, file_hash)
);

CREATE INDEX idx_analyzed_files_repo ON analyzed_files(repository_id);
CREATE INDEX idx_analyzed_files_hash ON analyzed_files(file_hash);

-- Tabela de findings comprimidos (para economizar espaço)
CREATE TABLE IF NOT EXISTS findings_compressed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  
  -- Dados comprimidos
  compressed_data BYTEA NOT NULL,
  compression_type VARCHAR(20) DEFAULT 'gzip', -- gzip, zstd
  original_size INTEGER,
  compressed_size INTEGER,
  
  -- Metadados
  finding_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_findings_compressed_analysis ON findings_compressed(analysis_id);

-- Função para verificar cache
CREATE OR REPLACE FUNCTION check_analysis_cache(
  repository_url_param TEXT,
  branch_param VARCHAR(100),
  commit_sha_param VARCHAR(100)
)
RETURNS TABLE (
  cache_id UUID,
  findings JSONB,
  tasks JSONB,
  statistics JSONB,
  age_minutes INTEGER
) AS $$
DECLARE
  cache_key_val VARCHAR(255);
BEGIN
  -- Gerar chave do cache
  cache_key_val := MD5(repository_url_param || ':' || branch_param || ':' || commit_sha_param);
  
  -- Buscar no cache
  RETURN QUERY
  SELECT 
    ac.id,
    ac.findings,
    ac.tasks,
    ac.statistics,
    EXTRACT(EPOCH FROM (NOW() - ac.created_at))::INTEGER / 60 as age_minutes
  FROM analysis_cache ac
  WHERE ac.cache_key = cache_key_val
    AND ac.expires_at > NOW();
  
  -- Incrementar contador de hits
  UPDATE analysis_cache
  SET 
    hit_count = hit_count + 1,
    last_hit_at = NOW()
  WHERE cache_key = cache_key_val;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar no cache
CREATE OR REPLACE FUNCTION save_to_cache(
  repository_url_param TEXT,
  repository_id_param UUID,
  branch_param VARCHAR(100),
  commit_sha_param VARCHAR(100),
  findings_param JSONB,
  tasks_param JSONB,
  statistics_param JSONB,
  file_count_param INTEGER,
  total_size_kb_param INTEGER,
  analysis_duration_ms_param INTEGER,
  client_id_param UUID,
  ttl_hours INTEGER DEFAULT 24
)
RETURNS UUID AS $$
DECLARE
  cache_key_val VARCHAR(255);
  cache_id UUID;
BEGIN
  cache_key_val := MD5(repository_url_param || ':' || branch_param || ':' || commit_sha_param);
  
  INSERT INTO analysis_cache (
    cache_key,
    repository_id,
    repository_url,
    branch,
    last_commit_sha,
    findings,
    tasks,
    statistics,
    file_count,
    total_size_kb,
    analysis_duration_ms,
    client_id,
    expires_at
  ) VALUES (
    cache_key_val,
    repository_id_param,
    repository_url_param,
    branch_param,
    commit_sha_param,
    findings_param,
    tasks_param,
    statistics_param,
    file_count_param,
    total_size_kb_param,
    analysis_duration_ms_param,
    client_id_param,
    NOW() + (ttl_hours || ' hours')::INTERVAL
  )
  ON CONFLICT (cache_key) 
  DO UPDATE SET
    findings = findings_param,
    tasks = tasks_param,
    statistics = statistics_param,
    expires_at = NOW() + (ttl_hours || ' hours')::INTERVAL,
    last_commit_sha = commit_sha_param
  RETURNING id INTO cache_id;
  
  RETURN cache_id;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analysis_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- View para estatísticas de cache
CREATE OR REPLACE VIEW cache_statistics AS
SELECT 
  COUNT(*) as total_entries,
  SUM(hit_count) as total_hits,
  AVG(hit_count) as avg_hits_per_entry,
  COUNT(*) FILTER (WHERE expires_at > NOW()) as active_entries,
  COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_entries,
  SUM(file_count) as total_files_cached,
  AVG(analysis_duration_ms) as avg_analysis_duration_ms,
  SUM(analysis_duration_ms * hit_count) as total_time_saved_ms
FROM analysis_cache;

-- RLS
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzed_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings_compressed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to analysis_cache" ON analysis_cache FOR ALL USING (true);
CREATE POLICY "Clients can view own cache" ON analysis_cache FOR SELECT USING (client_id = (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Service role has full access to analyzed_files" ON analyzed_files FOR ALL USING (true);
CREATE POLICY "Service role has full access to findings_compressed" ON findings_compressed FOR ALL USING (true);

COMMENT ON TABLE analysis_cache IS 'Cache de resultados de análises para evitar reprocessamento';
COMMENT ON TABLE analyzed_files IS 'Registro de arquivos já analisados para análise incremental';
COMMENT ON TABLE findings_compressed IS 'Findings comprimidos para economizar espaço';
