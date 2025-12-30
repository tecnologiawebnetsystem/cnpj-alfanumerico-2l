-- Tabela de atribuições de repositórios
CREATE TABLE IF NOT EXISTS repository_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(repository_id, client_id)
);

-- Tabela de tasks do board Kanban
CREATE TABLE IF NOT EXISTS kanban_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  finding_id UUID REFERENCES findings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  position INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_repository_assignments_repo ON repository_assignments(repository_id);
CREATE INDEX IF NOT EXISTS idx_repository_assignments_dev ON repository_assignments(developer_id);
CREATE INDEX IF NOT EXISTS idx_repository_assignments_client ON repository_assignments(client_id);

CREATE INDEX IF NOT EXISTS idx_kanban_tasks_dev ON kanban_tasks(developer_id);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_repo ON kanban_tasks(repository_id);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_status ON kanban_tasks(status);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_finding ON kanban_tasks(finding_id);

-- RLS Policies para repository_assignments
ALTER TABLE repository_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignments from their client"
  ON repository_assignments FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage assignments"
  ON repository_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND client_id = repository_assignments.client_id
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies para kanban_tasks
ALTER TABLE kanban_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can view their own tasks"
  ON kanban_tasks FOR SELECT
  USING (
    developer_id = auth.uid()
    OR
    client_id IN (
      SELECT client_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Developers can update their own tasks"
  ON kanban_tasks FOR UPDATE
  USING (developer_id = auth.uid());

CREATE POLICY "Admins can manage all tasks from their client"
  ON kanban_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND client_id = kanban_tasks.client_id
      AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_kanban_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Atualizar timestamps baseado no status
  IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
    NEW.started_at = NOW();
  END IF;
  
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_kanban_tasks_updated_at
  BEFORE UPDATE ON kanban_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_kanban_tasks_updated_at();
