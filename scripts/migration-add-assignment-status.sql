-- Adiciona campo de status na tabela repository_assignments
-- Status: pendente, desenvolvimento, finalizado

ALTER TABLE repository_assignments 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente';

-- Criar indice para busca por status
CREATE INDEX IF NOT EXISTS idx_repository_assignments_status 
ON repository_assignments(status);

-- Atualizar registros existentes para ter status padrao
UPDATE repository_assignments 
SET status = 'pendente' 
WHERE status IS NULL;
