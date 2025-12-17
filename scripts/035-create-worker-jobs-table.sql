-- Worker Jobs Table
-- Stores individual repository analysis jobs for the local worker

CREATE TABLE IF NOT EXISTS worker_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES batch_analyses(id) ON DELETE CASCADE,
  worker_id TEXT,
  
  -- Repository info
  repository_id TEXT NOT NULL,
  repository_name TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  project_name TEXT,
  
  -- Job status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Results
  findings_count INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_worker_jobs_status ON worker_jobs(status) WHERE status = 'pending';
CREATE INDEX idx_worker_jobs_batch ON worker_jobs(batch_id);
CREATE INDEX idx_worker_jobs_worker ON worker_jobs(worker_id);

-- RLS Policies
ALTER TABLE worker_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on worker_jobs"
  ON worker_jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE worker_jobs IS 'Queue de jobs para o worker local processar';
