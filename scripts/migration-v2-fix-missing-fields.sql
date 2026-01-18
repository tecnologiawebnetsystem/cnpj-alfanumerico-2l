-- Migration V2 Fix: Adiciona campos faltantes
-- Corrige campos que podem nao ter sido criados na migration anterior

-- Adicionar campos task_created e task_id em findings (se nao existirem)
ALTER TABLE findings 
ADD COLUMN IF NOT EXISTS task_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id);

-- Adicionar campos faltantes em tasks (se nao existirem)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS code_original TEXT,
ADD COLUMN IF NOT EXISTS code_before TEXT,
ADD COLUMN IF NOT EXISTS code_after TEXT;

-- Criar indice para busca de findings por task
CREATE INDEX IF NOT EXISTS idx_findings_task_id ON findings(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_findings_task_created ON findings(task_created) WHERE task_created = true;

-- Criar indice para busca de tasks por finding
CREATE INDEX IF NOT EXISTS idx_tasks_finding_id ON tasks(finding_id) WHERE finding_id IS NOT NULL;
