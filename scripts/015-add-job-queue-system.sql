-- Sistema de Filas e Background Jobs
-- Permite análises robustas com retry automático e pausar/retomar

-- Tabela de jobs/trabalhos
CREATE TABLE IF NOT EXISTS job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Tipo e dados do job
  job_type VARCHAR(50) NOT NULL, -- 'analysis', 'report_generation', 'database_scan'
  job_data JSONB NOT NULL, -- Dados específicos do job
  
  -- Status e controle
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, paused, cancelled
  priority INTEGER DEFAULT 0, -- Maior = mais importante
  
  -- Tentativas e retry
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  error_details JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  -- Worker info
  worker_id VARCHAR(100), -- ID do worker que está processando
  locked_at TIMESTAMPTZ,
  locked_until TIMESTAMPTZ,
  
  -- Progresso
  progress INTEGER DEFAULT 0,
  progress_details JSONB,
  
  -- Resultado
  result JSONB
);

-- Índices para performance
CREATE INDEX idx_job_queue_status ON job_queue(status);
CREATE INDEX idx_job_queue_client_id ON job_queue(client_id);
CREATE INDEX idx_job_queue_priority ON job_queue(priority DESC, created_at ASC);
CREATE INDEX idx_job_queue_next_retry ON job_queue(next_retry_at) WHERE status = 'failed';
CREATE INDEX idx_job_queue_locked ON job_queue(locked_until) WHERE locked_until IS NOT NULL;

-- Tabela de logs de jobs
CREATE TABLE IF NOT EXISTS job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_queue(id) ON DELETE CASCADE,
  
  level VARCHAR(20) NOT NULL, -- info, warning, error, debug
  message TEXT NOT NULL,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_logs_job_id ON job_logs(job_id, created_at DESC);

-- Função para pegar próximo job disponível
CREATE OR REPLACE FUNCTION get_next_job(
  worker_id_param VARCHAR(100),
  lock_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
  job_id UUID,
  job_type VARCHAR(50),
  job_data JSONB,
  attempts INTEGER
) AS $$
DECLARE
  selected_job_id UUID;
BEGIN
  -- Seleciona o próximo job disponível e o trava
  SELECT id INTO selected_job_id
  FROM job_queue
  WHERE status IN ('pending', 'failed')
    AND (next_retry_at IS NULL OR next_retry_at <= NOW())
    AND (locked_until IS NULL OR locked_until < NOW())
    AND attempts < max_attempts
  ORDER BY priority DESC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF selected_job_id IS NOT NULL THEN
    -- Atualiza o job com lock
    UPDATE job_queue
    SET 
      status = 'processing',
      worker_id = worker_id_param,
      locked_at = NOW(),
      locked_until = NOW() + (lock_duration_minutes || ' minutes')::INTERVAL,
      started_at = CASE WHEN started_at IS NULL THEN NOW() ELSE started_at END,
      attempts = attempts + 1
    WHERE id = selected_job_id;
    
    -- Retorna os dados do job
    RETURN QUERY
    SELECT 
      jq.id,
      jq.job_type,
      jq.job_data,
      jq.attempts
    FROM job_queue jq
    WHERE jq.id = selected_job_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para completar job com sucesso
CREATE OR REPLACE FUNCTION complete_job(
  job_id_param UUID,
  result_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE job_queue
  SET 
    status = 'completed',
    completed_at = NOW(),
    result = result_param,
    progress = 100,
    locked_at = NULL,
    locked_until = NULL,
    worker_id = NULL
  WHERE id = job_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para falhar job
CREATE OR REPLACE FUNCTION fail_job(
  job_id_param UUID,
  error_message_param TEXT,
  error_details_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_attempts INTEGER;
  max_attempts_val INTEGER;
BEGIN
  SELECT attempts, max_attempts INTO current_attempts, max_attempts_val
  FROM job_queue
  WHERE id = job_id_param;
  
  -- Se ainda tem tentativas, agenda retry com backoff exponencial
  IF current_attempts < max_attempts_val THEN
    UPDATE job_queue
    SET 
      status = 'failed',
      last_error = error_message_param,
      error_details = error_details_param,
      next_retry_at = NOW() + (POWER(2, attempts) || ' minutes')::INTERVAL, -- Backoff exponencial
      locked_at = NULL,
      locked_until = NULL,
      worker_id = NULL
    WHERE id = job_id_param;
  ELSE
    -- Falhou definitivamente
    UPDATE job_queue
    SET 
      status = 'failed',
      failed_at = NOW(),
      last_error = error_message_param,
      error_details = error_details_param,
      locked_at = NULL,
      locked_until = NULL,
      worker_id = NULL
    WHERE id = job_id_param;
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para pausar job
CREATE OR REPLACE FUNCTION pause_job(job_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE job_queue
  SET 
    status = 'paused',
    locked_at = NULL,
    locked_until = NULL,
    worker_id = NULL
  WHERE id = job_id_param
    AND status IN ('pending', 'processing', 'failed');
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para retomar job
CREATE OR REPLACE FUNCTION resume_job(job_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE job_queue
  SET 
    status = 'pending',
    next_retry_at = NULL
  WHERE id = job_id_param
    AND status = 'paused';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para cancelar job
CREATE OR REPLACE FUNCTION cancel_job(job_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE job_queue
  SET 
    status = 'cancelled',
    completed_at = NOW(),
    locked_at = NULL,
    locked_until = NULL,
    worker_id = NULL
  WHERE id = job_id_param
    AND status NOT IN ('completed', 'cancelled');
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar jobs antigos completados/cancelados
CREATE OR REPLACE FUNCTION cleanup_old_jobs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM job_queue
  WHERE status IN ('completed', 'cancelled')
    AND completed_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to job_queue" ON job_queue FOR ALL USING (true);
CREATE POLICY "Clients can view own jobs" ON job_queue FOR SELECT USING (client_id = (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Service role has full access to job_logs" ON job_logs FOR ALL USING (true);
CREATE POLICY "Clients can view logs of own jobs" ON job_logs FOR SELECT USING (
  job_id IN (SELECT id FROM job_queue WHERE client_id = (SELECT client_id FROM users WHERE id = auth.uid()))
);

-- Adicionar job_id em analyses para rastreamento
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES job_queue(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_job_id ON analyses(job_id);

COMMENT ON TABLE job_queue IS 'Sistema de filas para processar análises e tarefas em background com retry automático';
COMMENT ON TABLE job_logs IS 'Logs detalhados de execução de jobs';
