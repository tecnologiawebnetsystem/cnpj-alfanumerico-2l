-- Add error tracking columns to analyses table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'analyses' AND column_name = 'error_message') THEN
    ALTER TABLE analyses ADD COLUMN error_message TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'analyses' AND column_name = 'error_details') THEN
    ALTER TABLE analyses ADD COLUMN error_details JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'analyses' AND column_name = 'retry_count') THEN
    ALTER TABLE analyses ADD COLUMN retry_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add error tracking to batch_analyses
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'batch_analyses' AND column_name = 'error_log') THEN
    ALTER TABLE batch_analyses ADD COLUMN error_log JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'batch_analyses' AND column_name = 'current_step') THEN
    ALTER TABLE batch_analyses ADD COLUMN current_step TEXT;
  END IF;
END $$;

-- Create index for error queries
CREATE INDEX IF NOT EXISTS idx_analyses_error_message ON analyses(error_message) WHERE error_message IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_status_error ON analyses(status, error_message) WHERE status = 'failed';

SELECT 'Error logging columns added successfully' AS result;
