-- Advanced Reports System
-- Adiciona comparação de análises, templates customizáveis e histórico

-- Tabela para templates de relatórios customizáveis
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sections JSONB NOT NULL, -- Array de seções: ["summary", "findings", "tasks", "charts"]
  filters JSONB, -- Filtros aplicados: {"severity": ["high"], "status": ["open"]}
  format VARCHAR(50) DEFAULT 'pdf', -- pdf, excel, json, html
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para comparação de análises
CREATE TABLE IF NOT EXISTS analysis_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  base_analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  compare_analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  diff_summary JSONB, -- Resumo das diferenças
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para histórico de métricas de análises
CREATE TABLE IF NOT EXISTS analysis_metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_findings INTEGER DEFAULT 0,
  high_severity_count INTEGER DEFAULT 0,
  medium_severity_count INTEGER DEFAULT 0,
  low_severity_count INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  files_analyzed INTEGER DEFAULT 0,
  cnpj_found INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_report_templates_client ON report_templates(client_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_user ON report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_comparisons_base ON analysis_comparisons(base_analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_comparisons_compare ON analysis_comparisons(compare_analysis_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_analysis ON analysis_metrics_history(analysis_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_date ON analysis_metrics_history(metric_date);

-- View para evolução de métricas ao longo do tempo
CREATE OR REPLACE VIEW analysis_evolution AS
SELECT 
  r.id as repository_id,
  r.name as repository_name,
  r.client_id,
  date_trunc('day', a.created_at) as analysis_date,
  COUNT(DISTINCT a.id) as total_analyses,
  AVG((a.results->>'total_findings')::int) as avg_findings,
  AVG((a.results->>'high_severity')::int) as avg_high_severity,
  SUM((a.results->>'files_with_cnpj')::int) as total_cnpj_files
FROM repositories r
JOIN analyses a ON a.repository_id = r.id
WHERE a.status = 'completed'
GROUP BY r.id, r.name, r.client_id, date_trunc('day', a.created_at)
ORDER BY analysis_date DESC;

-- Função para calcular diff entre análises
CREATE OR REPLACE FUNCTION calculate_analysis_diff(
  base_id UUID,
  compare_id UUID
) RETURNS JSONB AS $$
DECLARE
  base_data JSONB;
  compare_data JSONB;
  diff_result JSONB;
BEGIN
  -- Buscar dados das duas análises
  SELECT results INTO base_data FROM analyses WHERE id = base_id;
  SELECT results INTO compare_data FROM analyses WHERE id = compare_id;
  
  -- Calcular diferenças
  diff_result := jsonb_build_object(
    'findings_diff', (compare_data->>'total_findings')::int - (base_data->>'total_findings')::int,
    'high_severity_diff', (compare_data->>'high_severity')::int - (base_data->>'high_severity')::int,
    'tasks_diff', (compare_data->>'total_tasks')::int - (base_data->>'total_tasks')::int,
    'cnpj_diff', (compare_data->>'files_with_cnpj')::int - (base_data->>'files_with_cnpj')::int,
    'base_data', base_data,
    'compare_data', compare_data
  );
  
  RETURN diff_result;
END;
$$ LANGUAGE plpgsql;
