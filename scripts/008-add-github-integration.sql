-- =====================================================
-- GITHUB INTEGRATION & MULTI-REPOSITORY ANALYSIS
-- Script para adicionar suporte a múltiplos repositórios
-- =====================================================

-- =====================================================
-- 1. TABELA DE TOKENS GITHUB
-- =====================================================
CREATE TABLE IF NOT EXISTS github_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'bearer',
  scope TEXT,
  github_username VARCHAR(255),
  github_user_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  refresh_token TEXT
);

CREATE INDEX idx_github_tokens_user_id ON github_tokens(user_id);
CREATE INDEX idx_github_tokens_client_id ON github_tokens(client_id);
CREATE UNIQUE INDEX idx_github_tokens_user_unique ON github_tokens(user_id);

-- =====================================================
-- 2. TABELA DE REPOSITÓRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(500), -- owner/repo
  url TEXT,
  description TEXT,
  language VARCHAR(100),
  default_branch VARCHAR(100) DEFAULT 'main',
  is_private BOOLEAN DEFAULT false,
  github_id BIGINT,
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  size_kb INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_analyzed_at TIMESTAMPTZ
);

CREATE INDEX idx_repositories_client_id ON repositories(client_id);
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_repositories_github_id ON repositories(github_id);
CREATE INDEX idx_repositories_full_name ON repositories(full_name);

-- =====================================================
-- 3. TABELA DE ANÁLISES EM LOTE (BATCH)
-- =====================================================
CREATE TABLE IF NOT EXISTS batch_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  total_repositories INTEGER DEFAULT 0,
  completed_repositories INTEGER DEFAULT 0,
  failed_repositories INTEGER DEFAULT 0,
  total_files INTEGER DEFAULT 0,
  total_findings INTEGER DEFAULT 0,
  estimated_hours NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_batch_analyses_client_id ON batch_analyses(client_id);
CREATE INDEX idx_batch_analyses_user_id ON batch_analyses(user_id);
CREATE INDEX idx_batch_analyses_status ON batch_analyses(status);
CREATE INDEX idx_batch_analyses_created_at ON batch_analyses(created_at DESC);

-- =====================================================
-- 4. ADICIONAR COLUNAS EM ANALYSES
-- =====================================================
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES batch_analyses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_analyses_repository_id ON analyses(repository_id);
CREATE INDEX IF NOT EXISTS idx_analyses_batch_id ON analyses(batch_id);

-- =====================================================
-- 5. TABELA DE SELEÇÃO DE REPOSITÓRIOS (HISTÓRICO)
-- =====================================================
CREATE TABLE IF NOT EXISTS repository_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batch_analyses(id) ON DELETE CASCADE,
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL
);

CREATE INDEX idx_repository_selections_batch_id ON repository_selections(batch_id);
CREATE INDEX idx_repository_selections_repository_id ON repository_selections(repository_id);

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE github_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_selections ENABLE ROW LEVEL SECURITY;

-- Políticas para GITHUB_TOKENS
CREATE POLICY "Users can view own github tokens" ON github_tokens
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to github_tokens" ON github_tokens
  FOR ALL USING (true);

-- Políticas para REPOSITORIES
CREATE POLICY "Clients can view own repositories" ON repositories
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to repositories" ON repositories
  FOR ALL USING (true);

-- Políticas para BATCH_ANALYSES
CREATE POLICY "Clients can view own batch analyses" ON batch_analyses
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to batch_analyses" ON batch_analyses
  FOR ALL USING (true);

-- Políticas para REPOSITORY_SELECTIONS
CREATE POLICY "Users can view own repository selections" ON repository_selections
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to repository_selections" ON repository_selections
  FOR ALL USING (true);

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at em github_tokens
DROP TRIGGER IF EXISTS update_github_tokens_updated_at ON github_tokens;
CREATE TRIGGER update_github_tokens_updated_at
  BEFORE UPDATE ON github_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em repositories
DROP TRIGGER IF EXISTS update_repositories_updated_at ON repositories;
CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. FUNÇÕES ÚTEIS
-- =====================================================

-- Função para atualizar estatísticas do batch quando uma análise é concluída
CREATE OR REPLACE FUNCTION update_batch_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE batch_analyses
    SET 
      completed_repositories = completed_repositories + 1,
      total_files = total_files + COALESCE(NEW.total_files, 0),
      total_findings = total_findings + COALESCE(NEW.files_with_cnpj, 0),
      estimated_hours = estimated_hours + COALESCE(NEW.estimated_hours, 0)
    WHERE id = NEW.batch_id;
    
    -- Verificar se todas as análises do batch foram concluídas
    UPDATE batch_analyses
    SET 
      status = 'completed',
      completed_at = NOW()
    WHERE id = NEW.batch_id
      AND completed_repositories + failed_repositories >= total_repositories
      AND status != 'completed';
  END IF;
  
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    UPDATE batch_analyses
    SET failed_repositories = failed_repositories + 1
    WHERE id = NEW.batch_id;
    
    -- Verificar se todas as análises do batch foram concluídas
    UPDATE batch_analyses
    SET 
      status = 'completed',
      completed_at = NOW()
    WHERE id = NEW.batch_id
      AND completed_repositories + failed_repositories >= total_repositories
      AND status != 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas do batch
DROP TRIGGER IF EXISTS update_batch_stats_on_analysis_complete ON analyses;
CREATE TRIGGER update_batch_stats_on_analysis_complete
  AFTER UPDATE ON analyses
  FOR EACH ROW
  WHEN (NEW.batch_id IS NOT NULL)
  EXECUTE FUNCTION update_batch_statistics();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
