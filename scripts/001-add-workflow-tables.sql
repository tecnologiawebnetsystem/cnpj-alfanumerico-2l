-- Adicionar campo role na tabela users (se ainda não existir)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'dev';

-- Atualizar constraint de role para aceitar 'dev'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'user', 'dev'));

-- Criar índice para role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Tabela de conexões de banco de dados
CREATE TABLE IF NOT EXISTS database_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  database_type VARCHAR(50) NOT NULL, -- 'mysql', 'postgresql', 'oracle', 'sqlserver', 'mongodb'
  host VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL,
  database_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password_encrypted TEXT NOT NULL, -- Senha criptografada
  ssl_enabled BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'error'
  last_tested_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Índices para database_connections
CREATE INDEX IF NOT EXISTS idx_db_connections_client ON database_connections(client_id);
CREATE INDEX IF NOT EXISTS idx_db_connections_status ON database_connections(status);

-- Tabela de análises de banco de dados
CREATE TABLE IF NOT EXISTS database_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES database_connections(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  total_tables INTEGER DEFAULT 0,
  total_columns INTEGER DEFAULT 0,
  total_procedures INTEGER DEFAULT 0,
  total_functions INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_packages INTEGER DEFAULT 0,
  cnpj_fields_found INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Índices para database_analyses
CREATE INDEX IF NOT EXISTS idx_db_analyses_client ON database_analyses(client_id);
CREATE INDEX IF NOT EXISTS idx_db_analyses_connection ON database_analyses(connection_id);
CREATE INDEX IF NOT EXISTS idx_db_analyses_status ON database_analyses(status);

-- Tabela de tarefas (tasks)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  database_analysis_id UUID REFERENCES database_analyses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL, -- 'code', 'database', 'validation', 'testing'
  file_path VARCHAR(1000),
  table_name VARCHAR(255),
  priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'awaiting_qa', 'completed', 'blocked'
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  estimated_hours NUMERIC(10, 2),
  actual_hours NUMERIC(10, 2),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para tasks
CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_analysis ON tasks(analysis_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Tabela de histórico de tarefas
CREATE TABLE IF NOT EXISTS task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'created', 'assigned', 'status_changed', 'updated', 'commented'
  old_value TEXT,
  new_value TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para task_history
CREATE INDEX IF NOT EXISTS idx_task_history_task ON task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_user ON task_history(user_id);

-- Tabela de estimativas de projeto
CREATE TABLE IF NOT EXISTS project_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  total_devs INTEGER NOT NULL DEFAULT 1,
  total_estimated_hours NUMERIC(10, 2),
  hours_per_dev NUMERIC(10, 2),
  start_date DATE,
  estimated_end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Índices para project_estimates
CREATE INDEX IF NOT EXISTS idx_project_estimates_client ON project_estimates(client_id);
CREATE INDEX IF NOT EXISTS idx_project_estimates_analysis ON project_estimates(analysis_id);

-- Habilitar RLS (Row Level Security) nas novas tabelas
ALTER TABLE database_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_estimates ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes antes de recriar para evitar erros de duplicação

-- Políticas RLS para database_connections
DROP POLICY IF EXISTS "Clients can view own database connections" ON database_connections;
DROP POLICY IF EXISTS "Service role has full access to database_connections" ON database_connections;

CREATE POLICY "Clients can view own database connections" ON database_connections
  FOR SELECT USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Service role has full access to database_connections" ON database_connections
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas RLS para database_analyses
DROP POLICY IF EXISTS "Clients can view own database analyses" ON database_analyses;
DROP POLICY IF EXISTS "Service role has full access to database_analyses" ON database_analyses;

CREATE POLICY "Clients can view own database analyses" ON database_analyses
  FOR SELECT USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Service role has full access to database_analyses" ON database_analyses
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas RLS para tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Service role has full access to tasks" ON tasks;

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Service role has full access to tasks" ON tasks
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas RLS para task_history
DROP POLICY IF EXISTS "Users can view task history" ON task_history;
DROP POLICY IF EXISTS "Service role has full access to task_history" ON task_history;

CREATE POLICY "Users can view task history" ON task_history
  FOR SELECT USING (
    task_id IN (SELECT id FROM tasks WHERE assigned_to = auth.uid() OR client_id IN (SELECT client_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Service role has full access to task_history" ON task_history
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas RLS para project_estimates
DROP POLICY IF EXISTS "Clients can view own project estimates" ON project_estimates;
DROP POLICY IF EXISTS "Service role has full access to project_estimates" ON project_estimates;

CREATE POLICY "Clients can view own project estimates" ON project_estimates
  FOR SELECT USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Service role has full access to project_estimates" ON project_estimates
  FOR ALL USING (auth.role() = 'service_role');
