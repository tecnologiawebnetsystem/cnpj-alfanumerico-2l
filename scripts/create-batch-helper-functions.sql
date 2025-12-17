-- Helper function to create batch analysis
CREATE OR REPLACE FUNCTION create_batch_analysis(
  p_id UUID,
  p_client_id UUID,
  p_user_id UUID,
  p_total_repos INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO batch_analyses (
    id,
    client_id,
    user_id,
    status,
    total_repositories,
    completed_repositories,
    total_files,
    total_findings,
    progress,
    started_at,
    created_at
  ) VALUES (
    p_id,
    p_client_id,
    p_user_id,
    'in_progress',
    p_total_repos,
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to update batch progress
CREATE OR REPLACE FUNCTION update_batch_progress(
  p_batch_id UUID,
  p_completed INTEGER,
  p_progress INTEGER,
  p_total_files INTEGER,
  p_total_findings INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE batch_analyses
  SET 
    completed_repositories = p_completed,
    progress = p_progress,
    total_files = p_total_files,
    total_findings = p_total_findings
  WHERE id = p_batch_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to complete batch analysis
CREATE OR REPLACE FUNCTION complete_batch_analysis(
  p_batch_id UUID,
  p_total_files INTEGER,
  p_total_findings INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE batch_analyses
  SET 
    status = 'completed',
    progress = 100,
    completed_at = NOW(),
    total_files = p_total_files,
    total_findings = p_total_findings
  WHERE id = p_batch_id;
END;
$$ LANGUAGE plpgsql;
