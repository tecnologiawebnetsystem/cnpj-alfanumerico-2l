-- Migration V2: AI Analysis Enhancement
-- Adiciona campos para suporte completo a analise com IA

-- 1. Adicionar campos na tabela findings para armazenar analise da IA
ALTER TABLE findings 
ADD COLUMN IF NOT EXISTS ai_analysis TEXT,
ADD COLUMN IF NOT EXISTS ai_suggestion TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS code_context TEXT,
ADD COLUMN IF NOT EXISTS code_before_lines TEXT,
ADD COLUMN IF NOT EXISTS code_after_lines TEXT;

-- 2. Adicionar campos na tabela tasks para informacoes detalhadas
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS finding_id UUID REFERENCES findings(id),
ADD COLUMN IF NOT EXISTS repository_name TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS line_number INTEGER,
ADD COLUMN IF NOT EXISTS code_original TEXT,
ADD COLUMN IF NOT EXISTS code_suggested TEXT,
ADD COLUMN IF NOT EXISTS ai_explanation TEXT,
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2);

-- 3. Criar tabela de configuracoes de IA (mais flexivel que gemini_settings)
CREATE TABLE IF NOT EXISTS ai_provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gemini',
  api_key TEXT,
  model_name TEXT DEFAULT 'gemini-1.5-flash',
  temperature DECIMAL(2,1) DEFAULT 0.3,
  max_tokens INTEGER DEFAULT 4096,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, provider)
);

-- 4. Criar tabela para log de clonagem de repositorios
CREATE TABLE IF NOT EXISTS repository_clone_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  clone_path TEXT,
  clone_started_at TIMESTAMP WITH TIME ZONE,
  clone_completed_at TIMESTAMP WITH TIME ZONE,
  analysis_started_at TIMESTAMP WITH TIME ZONE,
  analysis_completed_at TIMESTAMP WITH TIME ZONE,
  cleanup_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  files_processed INTEGER DEFAULT 0,
  findings_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_findings_ai_analyzed ON findings(ai_analyzed_at) WHERE ai_analyzed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_finding_id ON tasks(finding_id) WHERE finding_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clone_logs_analysis ON repository_clone_logs(analysis_id);
CREATE INDEX IF NOT EXISTS idx_clone_logs_repository ON repository_clone_logs(repository_id);

-- 6. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ai_provider_settings_updated_at ON ai_provider_settings;
CREATE TRIGGER update_ai_provider_settings_updated_at
    BEFORE UPDATE ON ai_provider_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS Policies para ai_provider_settings
ALTER TABLE ai_provider_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their client ai settings" ON ai_provider_settings;
CREATE POLICY "Users can view their client ai settings" ON ai_provider_settings
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "Admins can manage their client ai settings" ON ai_provider_settings;
CREATE POLICY "Admins can manage their client ai settings" ON ai_provider_settings
  FOR ALL USING (
    client_id IN (SELECT client_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'ADMIN', 'admin_client', 'ADMIN_CLIENT'))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'SUPER_ADMIN'))
  );

-- 8. RLS Policies para repository_clone_logs
ALTER TABLE repository_clone_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view clone logs" ON repository_clone_logs;
CREATE POLICY "Users can view clone logs" ON repository_clone_logs
  FOR SELECT USING (
    repository_id IN (
      SELECT r.id FROM repositories r
      JOIN clients c ON r.client_id = c.id
      JOIN users u ON u.client_id = c.id
      WHERE u.id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'SUPER_ADMIN'))
  );
