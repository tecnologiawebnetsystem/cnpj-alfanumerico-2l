-- Create audit_logs table for tracking all actions in the system
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_id ON audit_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_created ON audit_logs(client_id, created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see audit logs from their client
CREATE POLICY "Users can view their client audit logs" ON audit_logs
  FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM users WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy: System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE audit_logs IS 'Stores audit trail of all actions performed in the system';
COMMENT ON COLUMN audit_logs.action IS 'Action performed: create, update, delete, export, analyze, login, etc.';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected: task, repository, user, analysis, etc.';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID(s) of the affected entity';
COMMENT ON COLUMN audit_logs.details IS 'Additional details about the action in JSON format';
