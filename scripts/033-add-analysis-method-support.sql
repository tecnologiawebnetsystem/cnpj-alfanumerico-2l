-- Add analysis_method column to batch_analyses
ALTER TABLE batch_analyses 
ADD COLUMN IF NOT EXISTS analysis_method TEXT DEFAULT 'cloud' CHECK (analysis_method IN ('cloud', 'local'));

-- Add comment
COMMENT ON COLUMN batch_analyses.analysis_method IS 'Method used for analysis: cloud (via API) or local (via worker)';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_batch_analyses_method ON batch_analyses(analysis_method);
