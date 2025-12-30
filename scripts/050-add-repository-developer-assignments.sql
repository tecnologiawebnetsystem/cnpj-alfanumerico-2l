-- Nova tabela: Atribuição de Desenvolvedores aos Repositórios
CREATE TABLE IF NOT EXISTS repository_developer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(repository_id, developer_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_repo_dev_assignments_repo ON repository_developer_assignments(repository_id);
CREATE INDEX IF NOT EXISTS idx_repo_dev_assignments_dev ON repository_developer_assignments(developer_id);
CREATE INDEX IF NOT EXISTS idx_repo_dev_assignments_client ON repository_developer_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_repo_dev_assignments_status ON repository_developer_assignments(status);

-- Adicionar colunas na tabela tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repository_developer_assignment_id UUID REFERENCES repository_developer_assignments(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS auto_assigned_on_creation BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repository_name VARCHAR(500);

-- Índice
CREATE INDEX IF NOT EXISTS idx_tasks_repo_dev_assignment ON tasks(repository_developer_assignment_id);

-- RLS Policies
ALTER TABLE repository_developer_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view own repository assignments" ON repository_developer_assignments;
DROP POLICY IF EXISTS "Service role has full access to repository_assignments" ON repository_developer_assignments;

CREATE POLICY "Clients can view own repository assignments" ON repository_developer_assignments
  FOR SELECT USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Service role has full access to repository_assignments" ON repository_developer_assignments
  FOR ALL USING (auth.role() = 'service_role');

-- Function para auto-atribuir tarefas ao criar
CREATE OR REPLACE FUNCTION auto_assign_task_to_developer()
RETURNS TRIGGER AS $$
DECLARE
  v_assignment_id UUID;
  v_developer_id UUID;
  v_repository_id UUID;
BEGIN
  -- Se a task tem analysis_id, buscar o repository_id da análise
  IF NEW.analysis_id IS NOT NULL THEN
    SELECT repository_id INTO v_repository_id
    FROM analyses
    WHERE id = NEW.analysis_id;
    
    -- Buscar assignment ativo para esse repositório
    SELECT id, developer_id INTO v_assignment_id, v_developer_id
    FROM repository_developer_assignments
    WHERE repository_id = v_repository_id
      AND status = 'active'
      AND client_id = NEW.client_id
    LIMIT 1;
    
    -- Se encontrou assignment, auto-atribuir
    IF v_assignment_id IS NOT NULL THEN
      NEW.repository_developer_assignment_id := v_assignment_id;
      NEW.assigned_to := v_developer_id;
      NEW.auto_assigned_on_creation := true;
      NEW.assigned_by := NEW.created_by;
      NEW.assignment_date := NOW();
      
      -- Log no histórico
      INSERT INTO task_history (task_id, user_id, action, new_value, comment)
      VALUES (NEW.id, v_developer_id, 'auto_assigned_on_create', v_developer_id::TEXT, 'Auto-atribuído via repository assignment');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_task ON tasks;
CREATE TRIGGER trigger_auto_assign_task
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_task_to_developer();

-- Comentários
COMMENT ON TABLE repository_developer_assignments IS 'Atribuições de desenvolvedores aos repositórios';
COMMENT ON COLUMN tasks.repository_developer_assignment_id IS 'Referência para o assignment de repositório';
COMMENT ON COLUMN tasks.auto_generated IS 'Indica se a tarefa foi gerada automaticamente da análise';
COMMENT ON COLUMN tasks.auto_assigned_on_creation IS 'Indica se foi auto-atribuída na criação';
