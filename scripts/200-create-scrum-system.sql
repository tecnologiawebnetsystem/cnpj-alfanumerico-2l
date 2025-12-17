-- Sistema de Gerenciamento Ágil (Scrum)
-- Adiciona suporte para Sprints, Backlog e Board Kanban

-- 1. Atualizar roles para incluir Scrum Master e Product Owner
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check
CHECK (role IN ('super_admin', 'admin', 'user', 'dev', 'scrum_master', 'product_owner'));

COMMENT ON COLUMN users.role IS 'Perfis: super_admin, admin, user, dev, scrum_master, product_owner';

-- 2. Criar tabela de Sprints
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  goal TEXT, -- Objetivo da sprint
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'review', 'retrospective', 'completed', 'cancelled')),
  velocity INTEGER DEFAULT 0, -- Story points planejados
  completed_velocity INTEGER DEFAULT 0, -- Story points completados
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_sprint_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_sprints_client ON sprints(client_id);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);

-- 3. Adicionar campos de Scrum nas tasks existentes
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS story_points INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS epic VARCHAR(255); -- Épico ao qual a task pertence
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_story TEXT; -- História de usuário
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT; -- Critérios de aceitação
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS backlog_priority INTEGER DEFAULT 0; -- Prioridade no backlog
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_backlog_priority ON tasks(backlog_priority);

-- 4. Criar tabela de Retrospectivas
CREATE TABLE IF NOT EXISTS sprint_retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  what_went_well TEXT, -- O que foi bem
  what_to_improve TEXT, -- O que melhorar
  action_items TEXT, -- Itens de ação
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_retrospectives_sprint ON sprint_retrospectives(sprint_id);
CREATE INDEX idx_retrospectives_client ON sprint_retrospectives(client_id);

-- 5. Criar tabela de Daily Standups
CREATE TABLE IF NOT EXISTS daily_standups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  what_did TEXT, -- O que fez ontem
  what_will_do TEXT, -- O que vai fazer hoje
  blockers TEXT, -- Impedimentos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sprint_id, user_id, date)
);

CREATE INDEX idx_standups_sprint ON daily_standups(sprint_id);
CREATE INDEX idx_standups_user ON daily_standups(user_id);
CREATE INDEX idx_standups_date ON daily_standups(date);

-- 6. Habilitar RLS
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_retrospectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_standups ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS
DROP POLICY IF EXISTS "Service role has full access to sprints" ON sprints;
CREATE POLICY "Service role has full access to sprints" ON sprints
FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Clients can view own sprints" ON sprints;
CREATE POLICY "Clients can view own sprints" ON sprints
FOR SELECT USING (
  client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Service role has full access to sprint_retrospectives" ON sprint_retrospectives;
CREATE POLICY "Service role has full access to sprint_retrospectives" ON sprint_retrospectives
FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Clients can view own retrospectives" ON sprint_retrospectives;
CREATE POLICY "Clients can view own retrospectives" ON sprint_retrospectives
FOR SELECT USING (
  client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Service role has full access to daily_standups" ON daily_standups;
CREATE POLICY "Service role has full access to daily_standups" ON daily_standups
FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can view own standups" ON daily_standups;
CREATE POLICY "Users can view own standups" ON daily_standups
FOR SELECT USING (
  client_id IN (
    SELECT client_id FROM users WHERE id = auth.uid()
  )
);

-- 8. Comentários
COMMENT ON TABLE sprints IS 'Sprints do Scrum - ciclos de desenvolvimento';
COMMENT ON TABLE sprint_retrospectives IS 'Retrospectivas das sprints';
COMMENT ON TABLE daily_standups IS 'Daily standups da equipe';

COMMENT ON COLUMN tasks.sprint_id IS 'Sprint à qual a task pertence';
COMMENT ON COLUMN tasks.story_points IS 'Pontos de história (complexidade)';
COMMENT ON COLUMN tasks.epic IS 'Épico ao qual a task pertence';
COMMENT ON COLUMN tasks.user_story IS 'História de usuário (Como... Eu quero... Para...)';
COMMENT ON COLUMN tasks.acceptance_criteria IS 'Critérios de aceitação da task';
COMMENT ON COLUMN tasks.backlog_priority IS 'Prioridade no backlog (menor = maior prioridade)';

-- 9. Dados de exemplo (opcional - comentado)
-- INSERT INTO sprints (client_id, name, goal, start_date, end_date, status, created_by)
-- SELECT 
--   id as client_id,
--   'Sprint 1',
--   'Implementar funcionalidades básicas do sistema',
--   CURRENT_DATE,
--   CURRENT_DATE + INTERVAL '14 days',
--   'planning',
--   (SELECT id FROM users WHERE client_id = clients.id AND role IN ('scrum_master', 'product_owner') LIMIT 1)
-- FROM clients
-- LIMIT 1;

SELECT 'Sistema Scrum/Agile criado com sucesso!' as status;
