-- Script para corrigir o trigger de atualização de estatísticas do batch
-- Remove referências a campos que não existem na tabela analyses

-- Função corrigida para atualizar estatísticas do batch quando uma análise é concluída
CREATE OR REPLACE FUNCTION update_batch_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Atualizar estatísticas do batch
    -- Removidos campos que não existem: total_files, files_with_cnpj, estimated_hours
    UPDATE batch_analyses
    SET 
      completed_repositories = completed_repositories + 1,
      progress = CASE 
        WHEN total_repositories > 0 
        THEN ROUND((completed_repositories + 1) * 100.0 / total_repositories)
        ELSE 100
      END
    WHERE id = NEW.batch_id;
    
    -- Verificar se todas as análises do batch foram concluídas
    UPDATE batch_analyses
    SET 
      status = 'completed',
      completed_at = NOW(),
      progress = 100
    WHERE id = NEW.batch_id
      AND completed_repositories + failed_repositories >= total_repositories
      AND status != 'completed';
  END IF;
  
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    UPDATE batch_analyses
    SET 
      failed_repositories = failed_repositories + 1,
      progress = CASE 
        WHEN total_repositories > 0 
        THEN ROUND((completed_repositories + failed_repositories + 1) * 100.0 / total_repositories)
        ELSE 100
      END
    WHERE id = NEW.batch_id;
    
    -- Verificar se todas as análises do batch foram concluídas
    UPDATE batch_analyses
    SET 
      status = 'completed',
      completed_at = NOW(),
      progress = 100
    WHERE id = NEW.batch_id
      AND completed_repositories + failed_repositories >= total_repositories
      AND status != 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger
DROP TRIGGER IF EXISTS update_batch_stats_on_analysis_complete ON analyses;
CREATE TRIGGER update_batch_stats_on_analysis_complete
  AFTER UPDATE ON analyses
  FOR EACH ROW
  WHEN (NEW.batch_id IS NOT NULL)
  EXECUTE FUNCTION update_batch_statistics();
