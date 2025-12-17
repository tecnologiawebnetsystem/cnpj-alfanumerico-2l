-- Atualizar o estimated_hours do batch para refletir o total real
UPDATE batch_analyses
SET estimated_hours = 152.00
WHERE id = '9e38943b-597d-4cd0-88d9-ba63f6e7a1f4';

-- Adicionar coluna account_name se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batch_analyses' AND column_name = 'account_name') THEN
    ALTER TABLE batch_analyses ADD COLUMN account_name VARCHAR(255);
  END IF;
END $$;

-- Atualizar account_name para BS2 Tecnologia
UPDATE batch_analyses
SET account_name = 'BS2 Tecnologia'
WHERE id = '9e38943b-597d-4cd0-88d9-ba63f6e7a1f4';
