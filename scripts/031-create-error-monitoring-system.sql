-- Create comprehensive error monitoring and logging system
-- This captures ALL types of errors: API, rendering, timeout, database, etc.

-- Create system_errors table to store all application errors
CREATE TABLE IF NOT EXISTS system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Error details
  error_type VARCHAR(100) NOT NULL, -- 'api', 'rendering', 'timeout', 'database', 'network', 'validation', 'unknown'
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_code VARCHAR(50),
  
  -- Context information
  page_url TEXT,
  component_name VARCHAR(255),
  file_path TEXT,
  line_number INTEGER,
  column_number INTEGER,
  
  -- Request context (for API errors)
  http_method VARCHAR(10),
  http_status INTEGER,
  request_url TEXT,
  request_body JSONB,
  response_body JSONB,
  
  -- User context
  user_agent TEXT,
  ip_address INET,
  browser VARCHAR(100),
  os VARCHAR(100),
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'acknowledged', 'investigating', 'resolved', 'ignored'
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  
  -- Timestamps
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_errors_client ON system_errors(client_id);
CREATE INDEX IF NOT EXISTS idx_system_errors_user ON system_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_system_errors_type ON system_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_system_errors_status ON system_errors(status);
CREATE INDEX IF NOT EXISTS idx_system_errors_severity ON system_errors(severity);
CREATE INDEX IF NOT EXISTS idx_system_errors_occurred ON system_errors(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_errors_page_url ON system_errors(page_url);

-- Create view for error statistics
CREATE OR REPLACE VIEW error_statistics AS
SELECT 
  error_type,
  severity,
  status,
  COUNT(*) as error_count,
  COUNT(DISTINCT client_id) as affected_clients,
  COUNT(DISTINCT user_id) as affected_users,
  COUNT(DISTINCT page_url) as affected_pages,
  MIN(occurred_at) as first_occurrence,
  MAX(occurred_at) as last_occurrence,
  AVG(CASE WHEN resolved_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (resolved_at - occurred_at)) / 3600 
    ELSE NULL END) as avg_resolution_hours
FROM system_errors
GROUP BY error_type, severity, status;

-- Create view for recent critical errors
CREATE OR REPLACE VIEW recent_critical_errors AS
SELECT 
  e.id,
  e.error_type,
  e.error_message,
  e.page_url,
  e.component_name,
  e.occurred_at,
  e.severity,
  e.status,
  c.name as client_name,
  u.name as user_name,
  u.email as user_email
FROM system_errors e
LEFT JOIN clients c ON e.client_id = c.id
LEFT JOIN users u ON e.user_id = u.id
WHERE e.severity IN ('high', 'critical')
  AND e.occurred_at > NOW() - INTERVAL '24 hours'
ORDER BY e.occurred_at DESC;

-- Enable RLS
ALTER TABLE system_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Only super_admin can view all errors
CREATE POLICY super_admin_view_all_errors ON system_errors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Policy: Service role has full access
CREATE POLICY service_role_full_access_errors ON system_errors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_system_errors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_errors_updated_at
  BEFORE UPDATE ON system_errors
  FOR EACH ROW
  EXECUTE FUNCTION update_system_errors_updated_at();

-- Grant permissions
GRANT SELECT ON error_statistics TO authenticated;
GRANT SELECT ON recent_critical_errors TO authenticated;

COMMENT ON TABLE system_errors IS 'Comprehensive error logging table capturing all application errors';
COMMENT ON COLUMN system_errors.error_type IS 'Type of error: api, rendering, timeout, database, network, validation, unknown';
COMMENT ON COLUMN system_errors.severity IS 'Error severity: low, medium, high, critical';
COMMENT ON COLUMN system_errors.status IS 'Error resolution status: new, acknowledged, investigating, resolved, ignored';
