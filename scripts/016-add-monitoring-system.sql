-- Sistema de Monitoramento e Logs Estruturados
-- Dashboard em tempo real e alertas

-- Tabela de métricas do sistema
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de métrica
  metric_type VARCHAR(50) NOT NULL, -- 'analysis_duration', 'api_response_time', 'queue_size', 'error_rate'
  metric_name VARCHAR(100) NOT NULL,
  
  -- Valores
  value NUMERIC NOT NULL,
  unit VARCHAR(20), -- 'ms', 'count', 'percentage', 'bytes'
  
  -- Contexto
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50), -- 'analysis', 'job', 'api_call'
  entity_id UUID,
  
  -- Metadados
  tags JSONB, -- { "environment": "production", "region": "us-east-1" }
  metadata JSONB,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX idx_system_metrics_type ON system_metrics(metric_type, recorded_at DESC);
CREATE INDEX idx_system_metrics_client ON system_metrics(client_id, recorded_at DESC);
CREATE INDEX idx_system_metrics_tags ON system_metrics USING GIN(tags);

-- Tabela de alertas
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo e severidade
  alert_type VARCHAR(50) NOT NULL, -- 'high_error_rate', 'slow_analysis', 'queue_overflow', 'system_failure'
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'critical'
  
  -- Mensagem
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Contexto
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  entity_type VARCHAR(50),
  entity_id UUID,
  
  -- Metadados e ação sugerida
  metadata JSONB,
  suggested_action TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, acknowledged, resolved, ignored
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_monitoring_alerts_status ON monitoring_alerts(status, severity, created_at DESC);
CREATE INDEX idx_monitoring_alerts_client ON monitoring_alerts(client_id, status);
CREATE INDEX idx_monitoring_alerts_type ON monitoring_alerts(alert_type, created_at DESC);

-- Tabela de logs estruturados (substitui console.log)
CREATE TABLE IF NOT EXISTS structured_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Nível e categoria
  level VARCHAR(20) NOT NULL, -- debug, info, warn, error, fatal
  category VARCHAR(50) NOT NULL, -- api, analysis, queue, auth, database
  
  -- Mensagem
  message TEXT NOT NULL,
  
  -- Contexto
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Request context
  request_id VARCHAR(100),
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  
  -- Rastreamento
  trace_id VARCHAR(100), -- Para correlacionar logs relacionados
  span_id VARCHAR(100), -- Para tracing distribuído
  parent_span_id VARCHAR(100),
  
  -- Dados estruturados
  data JSONB,
  error_stack TEXT,
  
  -- Performance
  duration_ms INTEGER,
  
  -- Timestamp
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX idx_structured_logs_level ON structured_logs(level, logged_at DESC);
CREATE INDEX idx_structured_logs_category ON structured_logs(category, logged_at DESC);
CREATE INDEX idx_structured_logs_client ON structured_logs(client_id, logged_at DESC);
CREATE INDEX idx_structured_logs_trace ON structured_logs(trace_id, logged_at);
CREATE INDEX idx_structured_logs_data ON structured_logs USING GIN(data);

-- View para dashboard de métricas em tempo real
CREATE OR REPLACE VIEW realtime_metrics_dashboard AS
SELECT 
  metric_type,
  metric_name,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  COUNT(*) as sample_count,
  MAX(recorded_at) as last_recorded
FROM system_metrics
WHERE recorded_at > NOW() - INTERVAL '1 hour'
GROUP BY metric_type, metric_name;

-- View para análises com problemas
CREATE OR REPLACE VIEW problematic_analyses AS
SELECT 
  a.id,
  a.status,
  a.error_message,
  a.created_at,
  a.completed_at,
  EXTRACT(EPOCH FROM (COALESCE(a.completed_at, NOW()) - a.started_at)) as duration_seconds,
  c.name as client_name,
  u.name as user_name,
  COUNT(f.id) as findings_count
FROM analyses a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN findings f ON a.id = f.analysis_id
WHERE a.status IN ('failed', 'processing')
  OR (a.status = 'processing' AND a.started_at < NOW() - INTERVAL '2 hours')
GROUP BY a.id, a.status, a.error_message, a.created_at, a.completed_at, a.started_at, c.name, u.name;

-- View para estatísticas de jobs
CREATE OR REPLACE VIEW job_queue_stats AS
SELECT 
  status,
  job_type,
  COUNT(*) as count,
  AVG(attempts) as avg_attempts,
  MIN(created_at) as oldest_job,
  MAX(created_at) as newest_job
FROM job_queue
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status, job_type;

-- Função para registrar métrica
CREATE OR REPLACE FUNCTION record_metric(
  metric_type_param VARCHAR(50),
  metric_name_param VARCHAR(100),
  value_param NUMERIC,
  unit_param VARCHAR(20) DEFAULT NULL,
  client_id_param UUID DEFAULT NULL,
  tags_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO system_metrics (metric_type, metric_name, value, unit, client_id, tags)
  VALUES (metric_type_param, metric_name_param, value_param, unit_param, client_id_param, tags_param)
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$ LANGUAGE plpgsql;

-- Função para criar alerta
CREATE OR REPLACE FUNCTION create_alert(
  alert_type_param VARCHAR(50),
  severity_param VARCHAR(20),
  title_param VARCHAR(255),
  message_param TEXT,
  client_id_param UUID DEFAULT NULL,
  metadata_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO monitoring_alerts (alert_type, severity, title, message, client_id, metadata)
  VALUES (alert_type_param, severity_param, title_param, message_param, client_id_param, metadata_param)
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar logs antigos (executar via cron)
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE (
  logs_deleted INTEGER,
  metrics_deleted INTEGER
) AS $$
DECLARE
  logs_count INTEGER;
  metrics_count INTEGER;
BEGIN
  -- Deletar logs antigos
  DELETE FROM structured_logs WHERE logged_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  GET DIAGNOSTICS logs_count = ROW_COUNT;
  
  -- Deletar métricas antigas
  DELETE FROM system_metrics WHERE recorded_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  GET DIAGNOSTICS metrics_count = ROW_COUNT;
  
  RETURN QUERY SELECT logs_count, metrics_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE structured_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to system_metrics" ON system_metrics FOR ALL USING (true);
CREATE POLICY "Clients can view own metrics" ON system_metrics FOR SELECT USING (client_id = (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Service role has full access to monitoring_alerts" ON monitoring_alerts FOR ALL USING (true);
CREATE POLICY "Clients can view own alerts" ON monitoring_alerts FOR SELECT USING (client_id = (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Service role has full access to structured_logs" ON structured_logs FOR ALL USING (true);
CREATE POLICY "Super admins can view all logs" ON structured_logs FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'super_admin');

COMMENT ON TABLE system_metrics IS 'Métricas de performance e uso do sistema';
COMMENT ON TABLE monitoring_alerts IS 'Alertas gerados pelo sistema de monitoramento';
COMMENT ON TABLE structured_logs IS 'Logs estruturados para debugging e auditoria';
