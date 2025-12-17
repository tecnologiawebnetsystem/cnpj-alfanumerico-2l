-- Sistema completo de monitoramento de performance de desenvolvedores
-- Tabela para rastrear progresso de tarefas
CREATE TABLE IF NOT EXISTS task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  dev_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Progresso reportado
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, blocked, completed
  
  -- Tempo estimado vs real
  estimated_hours NUMERIC(10,2),
  actual_hours_spent NUMERIC(10,2) DEFAULT 0,
  
  -- Datas importantes
  started_at TIMESTAMP WITH TIME ZONE,
  expected_completion_date TIMESTAMP WITH TIME ZONE,
  actual_completion_date TIMESTAMP WITH TIME ZONE,
  last_progress_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Alertas e bloqueios
  is_delayed BOOLEAN DEFAULT FALSE,
  delay_days INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  
  -- Notes do desenvolvedor
  progress_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para métricas diárias de DEVs
CREATE TABLE IF NOT EXISTS dev_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  
  -- Métricas de tarefas
  tasks_assigned INTEGER DEFAULT 0,
  tasks_started INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_blocked INTEGER DEFAULT 0,
  tasks_delayed INTEGER DEFAULT 0,
  
  -- Métricas de tempo
  total_hours_logged NUMERIC(10,2) DEFAULT 0,
  avg_task_completion_hours NUMERIC(10,2),
  
  -- Métricas de qualidade
  avg_progress_update_frequency_hours NUMERIC(10,2),
  
tasks_on_time INTEGER DEFAULT 0,
  tasks_late INTEGER DEFAULT 0,
  
  -- Performance score (0-100)
  performance_score NUMERIC(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(dev_id, metric_date)
);

-- Tabela para alertas de DEVs
CREATE TABLE IF NOT EXISTS dev_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  
  alert_type VARCHAR(100) NOT NULL, -- no_progress_update, task_delayed, task_blocked, low_performance, missed_deadline
  severity VARCHAR(20) NOT NULL DEFAULT 'warning', -- info, warning, critical
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Status do alerta
  status VARCHAR(20) DEFAULT 'active', -- active, acknowledged, resolved
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para notificações de admin sobre DEVs
CREATE TABLE IF NOT EXISTS admin_dev_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dev_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  notification_type VARCHAR(100) NOT NULL, -- dev_delayed, no_progress_report, low_performance, task_blocked
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Link para detalhes
  link_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_task_progress_task_id ON task_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_dev_id ON task_progress(dev_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_client_id ON task_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_status ON task_progress(status);
CREATE INDEX IF NOT EXISTS idx_task_progress_is_delayed ON task_progress(is_delayed);

CREATE INDEX IF NOT EXISTS idx_dev_daily_metrics_dev_id ON dev_daily_metrics(dev_id);
CREATE INDEX IF NOT EXISTS idx_dev_daily_metrics_date ON dev_daily_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_dev_daily_metrics_client_id ON dev_daily_metrics(client_id);

CREATE INDEX IF NOT EXISTS idx_dev_alerts_dev_id ON dev_alerts(dev_id);
CREATE INDEX IF NOT EXISTS idx_dev_alerts_client_id ON dev_alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_dev_alerts_status ON dev_alerts(status);
CREATE INDEX IF NOT EXISTS idx_dev_alerts_severity ON dev_alerts(severity);

CREATE INDEX IF NOT EXISTS idx_admin_dev_notifications_admin_id ON admin_dev_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_dev_notifications_dev_id ON admin_dev_notifications(dev_id);
CREATE INDEX IF NOT EXISTS idx_admin_dev_notifications_is_read ON admin_dev_notifications(is_read);

-- VIEW: Dashboard de performance de DEVs
CREATE OR REPLACE VIEW dev_performance_dashboard AS
SELECT 
  u.id as dev_id,
  u.name as dev_name,
  u.email as dev_email,
  u.client_id,
  c.name as client_name,
  
  -- Tarefas
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'pendente' OR t.status = 'pending' THEN t.id END) as tasks_pending,
  COUNT(DISTINCT CASE WHEN t.status = 'em_progresso' OR t.status = 'in_progress' THEN t.id END) as tasks_in_progress,
  COUNT(DISTINCT CASE WHEN t.status = 'concluido' OR t.status = 'completed' THEN t.id END) as tasks_completed,
  COUNT(DISTINCT CASE WHEN t.status = 'bloqueada' OR t.status = 'blocked' THEN t.id END) as tasks_blocked,
  
  -- Progresso
  AVG(tp.progress_percentage) as avg_progress,
  SUM(tp.actual_hours_spent) as total_hours_spent,
  
  -- Alertas
  COUNT(DISTINCT CASE WHEN da.status = 'active' AND da.severity = 'critical' THEN da.id END) as critical_alerts,
  COUNT(DISTINCT CASE WHEN da.status = 'active' AND da.severity = 'warning' THEN da.id END) as warning_alerts,
  
  -- Performance
  COUNT(DISTINCT CASE WHEN tp.is_delayed = TRUE THEN tp.id END) as delayed_tasks,
  COUNT(DISTINCT CASE WHEN tp.is_blocked = TRUE THEN tp.id END) as blocked_tasks,
  
  -- Última atividade
  MAX(tp.last_progress_update) as last_progress_update,
  MAX(t.updated_at) as last_task_update,
  
  -- Performance score (média dos últimos 7 dias)
  (
    SELECT AVG(performance_score)
    FROM dev_daily_metrics ddm
    WHERE ddm.dev_id = u.id
    AND ddm.metric_date >= CURRENT_DATE - INTERVAL '7 days'
  ) as performance_score_7d
  
FROM users u
INNER JOIN clients c ON u.client_id = c.id
LEFT JOIN tasks t ON t.assigned_to = u.id
LEFT JOIN task_progress tp ON tp.task_id = t.id
LEFT JOIN dev_alerts da ON da.dev_id = u.id
WHERE u.role = 'dev'
GROUP BY u.id, u.name, u.email, u.client_id, c.name;

-- VIEW: Tarefas atrasadas por DEV
CREATE OR REPLACE VIEW dev_delayed_tasks AS
SELECT 
  u.id as dev_id,
  u.name as dev_name,
  t.id as task_id,
  t.title as task_title,
  t.priority,
  t.status,
  tp.progress_percentage,
  tp.expected_completion_date,
  tp.delay_days,
  tp.is_blocked,
  tp.blocked_reason,
  tp.last_progress_update,
  r.name as repository_name
FROM users u
INNER JOIN tasks t ON t.assigned_to = u.id
INNER JOIN task_progress tp ON tp.task_id = t.id
LEFT JOIN analyses a ON a.id = t.analysis_id
LEFT JOIN repositories r ON r.id = a.repository_id
WHERE u.role = 'dev'
AND tp.is_delayed = TRUE
AND t.status NOT IN ('concluido', 'completed')
ORDER BY tp.delay_days DESC, t.priority DESC;

-- VIEW: DEVs sem atualização de progresso
CREATE OR REPLACE VIEW devs_no_progress_update AS
SELECT 
  u.id as dev_id,
  u.name as dev_name,
  u.email,
  u.client_id,
  c.name as client_name,
  COUNT(DISTINCT t.id) as active_tasks,
  MAX(tp.last_progress_update) as last_progress_update,
  EXTRACT(DAY FROM (NOW() - MAX(tp.last_progress_update))) as days_since_last_update
FROM users u
INNER JOIN clients c ON u.client_id = c.id
INNER JOIN tasks t ON t.assigned_to = u.id
LEFT JOIN task_progress tp ON tp.task_id = t.id
WHERE u.role = 'dev'
AND t.status IN ('pendente', 'pending', 'em_progresso', 'in_progress')
GROUP BY u.id, u.name, u.email, u.client_id, c.name
HAVING MAX(tp.last_progress_update) < NOW() - INTERVAL '24 hours'
OR MAX(tp.last_progress_update) IS NULL
ORDER BY days_since_last_update DESC;

-- Função para calcular performance score
CREATE OR REPLACE FUNCTION calculate_dev_performance_score(p_dev_id UUID, p_date DATE)
RETURNS NUMERIC AS $$
DECLARE
  v_score NUMERIC := 100;
  v_tasks_completed INTEGER;
  v_tasks_delayed INTEGER;
  v_tasks_blocked INTEGER;
  v_avg_progress_frequency NUMERIC;
BEGIN
  -- Get metrics
  SELECT 
    tasks_completed,
    tasks_delayed,
    tasks_blocked,
    avg_progress_update_frequency_hours
  INTO 
    v_tasks_completed,
    v_tasks_delayed,
    v_tasks_blocked,
    v_avg_progress_frequency
  FROM dev_daily_metrics
  WHERE dev_id = p_dev_id AND metric_date = p_date;
  
  -- Penalidades
  -- Tarefas atrasadas: -10 pontos cada
  v_score := v_score - (COALESCE(v_tasks_delayed, 0) * 10);
  
  -- Tarefas bloqueadas: -5 pontos cada
  v_score := v_score - (COALESCE(v_tasks_blocked, 0) * 5);
  
  -- Frequência baixa de atualização (> 24h): -20 pontos
  IF v_avg_progress_frequency > 24 THEN
    v_score := v_score - 20;
  END IF;
  
  -- Bônus por tarefas completadas: +5 pontos cada
  v_score := v_score + (COALESCE(v_tasks_completed, 0) * 5);
  
  -- Limitar score entre 0 e 100
  IF v_score < 0 THEN
    v_score := 0;
  ELSIF v_score > 100 THEN
    v_score := 100;
  END IF;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar métricas diárias automaticamente
CREATE OR REPLACE FUNCTION update_dev_daily_metrics()
RETURNS void AS $$
BEGIN
  INSERT INTO dev_daily_metrics (
    dev_id,
    client_id,
    metric_date,
    tasks_assigned,
    tasks_started,
    tasks_completed,
    tasks_blocked,
    tasks_delayed,
    total_hours_logged,
    tasks_on_time,
    tasks_late
  )
  SELECT 
    u.id as dev_id,
    u.client_id,
    CURRENT_DATE as metric_date,
    COUNT(DISTINCT t.id) as tasks_assigned,
    COUNT(DISTINCT CASE WHEN tp.status = 'in_progress' THEN t.id END) as tasks_started,
    COUNT(DISTINCT CASE WHEN tp.status = 'completed' AND DATE(tp.actual_completion_date) = CURRENT_DATE THEN t.id END) as tasks_completed,
    COUNT(DISTINCT CASE WHEN tp.is_blocked = TRUE THEN t.id END) as tasks_blocked,
    COUNT(DISTINCT CASE WHEN tp.is_delayed = TRUE THEN t.id END) as tasks_delayed,
    SUM(tp.actual_hours_spent) as total_hours_logged,
    COUNT(DISTINCT CASE WHEN tp.status = 'completed' AND tp.actual_completion_date <= tp.expected_completion_date THEN t.id END) as tasks_on_time,
    COUNT(DISTINCT CASE WHEN tp.status = 'completed' AND tp.actual_completion_date > tp.expected_completion_date THEN t.id END) as tasks_late
  FROM users u
  LEFT JOIN tasks t ON t.assigned_to = u.id
  LEFT JOIN task_progress tp ON tp.task_id = t.id
  WHERE u.role = 'dev'
  GROUP BY u.id, u.client_id
  ON CONFLICT (dev_id, metric_date) 
  DO UPDATE SET
    tasks_assigned = EXCLUDED.tasks_assigned,
    tasks_started = EXCLUDED.tasks_started,
    tasks_completed = EXCLUDED.tasks_completed,
    tasks_blocked = EXCLUDED.tasks_blocked,
    tasks_delayed = EXCLUDED.tasks_delayed,
    total_hours_logged = EXCLUDED.total_hours_logged,
    tasks_on_time = EXCLUDED.tasks_on_time,
    tasks_late = EXCLUDED.tasks_late;
    
  -- Atualizar performance score
  UPDATE dev_daily_metrics
  SET performance_score = calculate_dev_performance_score(dev_id, metric_date)
  WHERE metric_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar task_progress automaticamente quando tarefa é criada
CREATE OR REPLACE FUNCTION create_task_progress_on_task_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_progress (
    task_id,
    dev_id,
    client_id,
    status,
    progress_percentage,
    estimated_hours
  )
  VALUES (
    NEW.id,
    NEW.assigned_to,
    NEW.client_id,
    COALESCE(NEW.status, 'pending'),
    0,
    3.0 -- Default: 3 horas por tarefa
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_task_progress
AFTER INSERT ON tasks
FOR EACH ROW
WHEN (NEW.assigned_to IS NOT NULL)
EXECUTE FUNCTION create_task_progress_on_task_creation();

-- RLS Policies
ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_dev_notifications ENABLE ROW LEVEL SECURITY;

-- DEVs podem ver e atualizar seu próprio progresso
CREATE POLICY devs_view_own_progress ON task_progress
  FOR SELECT USING (dev_id = auth.uid());
  
CREATE POLICY devs_update_own_progress ON task_progress
  FOR UPDATE USING (dev_id = auth.uid());

-- Service role tem acesso total
CREATE POLICY service_role_task_progress ON task_progress
  FOR ALL USING (true);

CREATE POLICY service_role_dev_metrics ON dev_daily_metrics
  FOR ALL USING (true);

CREATE POLICY service_role_dev_alerts ON dev_alerts
  FOR ALL USING (true);

CREATE POLICY service_role_admin_notifications ON admin_dev_notifications
  FOR ALL USING (true);
