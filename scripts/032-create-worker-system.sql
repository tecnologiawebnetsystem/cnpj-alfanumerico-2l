-- Create workers tracking table
CREATE TABLE IF NOT EXISTS workers (
  worker_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active', -- active, stopped, error
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  machine_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analysis errors table
CREATE TABLE IF NOT EXISTS analysis_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES batch_analyses(id) ON DELETE CASCADE,
  repository_name TEXT,
  error_message TEXT,
  error_stack TEXT,
  worker_id TEXT REFERENCES workers(worker_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add worker_id to batch_analyses
ALTER TABLE batch_analyses 
ADD COLUMN IF NOT EXISTS worker_id TEXT REFERENCES workers(worker_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workers_status ON workers(status);
CREATE INDEX IF NOT EXISTS idx_workers_heartbeat ON workers(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_analysis_errors_analysis ON analysis_errors(analysis_id);

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow service role full access)
CREATE POLICY "Service role full access on workers" ON workers
  FOR ALL USING (true);

CREATE POLICY "Service role full access on analysis_errors" ON analysis_errors
  FOR ALL USING (true);

COMMENT ON TABLE workers IS 'Tracks active local workers processing analyses';
COMMENT ON TABLE analysis_errors IS 'Logs errors that occur during repository analysis';
