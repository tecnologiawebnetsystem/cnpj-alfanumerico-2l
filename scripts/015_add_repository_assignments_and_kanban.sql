-- Adiciona sistema de atribuição de repositórios e board Kanban

-- Tabela de atribuições de repositórios
CREATE TABLE IF NOT EXISTS repository_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  repository_url TEXT NOT NULL,
  repository_name TEXT NOT NULL,
  repository_type TEXT NOT NULL, -- 'github', 'gitlab', 'azure', 'database'
  assigned_developer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'assigned', 'in_progress', 'completed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas Kanban derivadas dos findings
CREATE TABLE IF NOT EXISTS kanban_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES repository_assignments(id) ON DELETE CASCADE,
  finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  line_number INTEGER,
  severity TEXT, -- 'critical', 'high', 'medium', 'low'
  ai_solution TEXT, -- Solução sugerida pela IA
  status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'done'
  priority INTEGER DEFAULT 0,
  moved_to_in_progress_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de análises de banco de dados
CREATE TABLE IF NOT EXISTS database_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  database_type TEXT NOT NULL, -- 'sqlserver', 'oracle', 'postgresql', 'mysql'
  connection_string TEXT NOT NULL, -- Encrypted
  database_name TEXT,
  schema_name TEXT,
  total_tables_scanned INTEGER DEFAULT 0,
  total_cnpj_found INTEGER DEFAULT 0,
  findings JSONB, -- Array de { table, column, row_count, sample_data }
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_repository_assignments_client ON repository_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_repository_assignments_developer ON repository_assignments(assigned_developer_id);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_developer ON kanban_tasks(developer_id);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_status ON kanban_tasks(status);
CREATE INDEX IF NOT EXISTS idx_database_analyses_client ON database_analyses(client_id);

-- RLS Policies
ALTER TABLE repository_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage their repository assignments"
  ON repository_assignments FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Developers can view their assigned tasks"
  ON kanban_tasks FOR SELECT
  USING (developer_id = auth.uid());

CREATE POLICY "Developers can update their tasks"
  ON kanban_tasks FOR UPDATE
  USING (developer_id = auth.uid());

CREATE POLICY "Clients can manage their database analyses"
  ON database_analyses FOR ALL
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
