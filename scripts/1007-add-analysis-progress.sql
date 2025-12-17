-- Add progress tracking columns to analyses table
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS current_step TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS total_steps INTEGER DEFAULT 100;

-- Add progress tracking to batch_analyses table
ALTER TABLE batch_analyses ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Create index for faster progress queries
CREATE INDEX IF NOT EXISTS idx_analyses_status_progress ON analyses(status, progress);
CREATE INDEX IF NOT EXISTS idx_batch_analyses_status_progress ON batch_analyses(status, progress);

COMMENT ON COLUMN analyses.progress IS 'Progress percentage (0-100)';
COMMENT ON COLUMN analyses.current_step IS 'Current step description for user feedback';
COMMENT ON COLUMN analyses.total_steps IS 'Total number of steps in the analysis';
