-- IP Whitelist table for admin access control
CREATE TABLE IF NOT EXISTS ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ip_whitelist_client ON ip_whitelist(client_id);
CREATE INDEX idx_ip_whitelist_active ON ip_whitelist(is_active);

-- RLS for ip_whitelist
ALTER TABLE ip_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage IP whitelist for their client"
  ON ip_whitelist FOR ALL
  USING (
    client_id IN (
      SELECT client_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Add 2FA columns if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[];

-- Password history table (prevent reuse)
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_password_history_user ON password_history(user_id);
CREATE INDEX idx_password_history_created ON password_history(created_at DESC);

-- Function to check password history
CREATE OR REPLACE FUNCTION check_password_history(
  p_user_id UUID,
  p_new_hash TEXT,
  p_history_count INT DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM password_history
  WHERE user_id = p_user_id
    AND password_hash = p_new_hash
  ORDER BY created_at DESC
  LIMIT p_history_count;
  
  RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Account lockout table
CREATE TABLE IF NOT EXISTS account_lockouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  locked_until TIMESTAMPTZ NOT NULL,
  reason TEXT,
  locked_by UUID REFERENCES users(id),
  UNIQUE(user_id)
);

CREATE INDEX idx_account_lockouts_user ON account_lockouts(user_id);
CREATE INDEX idx_account_lockouts_until ON account_lockouts(locked_until);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_locked_until TIMESTAMPTZ;
BEGIN
  SELECT locked_until
  INTO v_locked_until
  FROM account_lockouts
  WHERE user_id = p_user_id
    AND locked_until > NOW();
  
  RETURN v_locked_until IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security audit log enhancements
ALTER TABLE security_logs ADD COLUMN IF NOT EXISTS severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE security_logs ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);

-- Compliance: Data retention policy (LGPD)
COMMENT ON TABLE security_logs IS 'Retention: 12 months for compliance';
COMMENT ON TABLE password_history IS 'Retention: 24 months as per security policy';

-- Create function to automatically clean old logs (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_logs
  WHERE created_at < NOW() - INTERVAL '12 months';
  
  DELETE FROM password_history
  WHERE created_at < NOW() - INTERVAL '24 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
