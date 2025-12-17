-- Adicionar coluna progress em batch_analyses para rastreamento preciso
ALTER TABLE batch_analyses ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Atualizar batches existentes com progresso calculado
UPDATE batch_analyses 
SET progress = CASE 
  WHEN status = 'completed' THEN 100
  WHEN status = 'failed' THEN 0
  ELSE LEAST(GREATEST(ROUND((completed_repositories::DECIMAL / NULLIF(total_repositories, 0)) * 100), 0), 100)
END
WHERE progress IS NULL OR progress = 0;

COMMENT ON COLUMN batch_analyses.progress IS 'Progresso da análise em lote (0-100)';
