-- API Clients Table
CREATE TABLE IF NOT EXISTS api_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  plan VARCHAR(50) DEFAULT 'free', -- free, basic, pro, enterprise
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES api_clients(id) ON DELETE CASCADE,
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  rate_limit INTEGER DEFAULT 100, -- requests per hour
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add client_id column to existing analyses table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analyses' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE analyses ADD COLUMN client_id UUID REFERENCES api_clients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Analyses Table (updated)
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_name VARCHAR(255) NOT NULL,
  repository_type VARCHAR(50) NOT NULL, -- zip, github
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  language VARCHAR(100),
  total_files INTEGER DEFAULT 0,
  files_analyzed INTEGER DEFAULT 0,
  cnpj_occurrences INTEGER DEFAULT 0,
  database_fields INTEGER DEFAULT 0,
  estimated_hours DECIMAL(10,2) DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Findings Table (code occurrences)
CREATE TABLE IF NOT EXISTS findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  line_number INTEGER NOT NULL,
  code_snippet TEXT,
  field_name VARCHAR(255),
  field_type VARCHAR(100), -- cnpj_only, cpf_cnpj, document
  confidence VARCHAR(50), -- high, medium, low
  suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Database Findings Table
CREATE TABLE IF NOT EXISTS database_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  database_type VARCHAR(100), -- mysql, postgresql, sqlserver, oracle
  table_name VARCHAR(255) NOT NULL,
  column_name VARCHAR(255) NOT NULL,
  column_type VARCHAR(100),
  max_length INTEGER,
  is_nullable BOOLEAN,
  suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- pdf, json, excel
  file_url TEXT,
  file_size INTEGER,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Logs Table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES api_clients(id) ON DELETE SET NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time INTEGER, -- milliseconds
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks Table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES api_clients(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT ARRAY['analysis.completed'], -- array of event types
  is_active BOOLEAN DEFAULT true,
  secret VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_api_keys_client_id ON api_keys(client_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_analyses_client_id ON analyses(client_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_findings_analysis_id ON findings(analysis_id);
CREATE INDEX IF NOT EXISTS idx_database_findings_analysis_id ON database_findings(analysis_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_client_id ON usage_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- Enable RLS with permissive policies for API access
ALTER TABLE api_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist before creating new ones
DROP POLICY IF EXISTS "Allow service role full access to api_clients" ON api_clients;
DROP POLICY IF EXISTS "Allow service role full access to api_keys" ON api_keys;
DROP POLICY IF EXISTS "Allow service role full access to analyses" ON analyses;
DROP POLICY IF EXISTS "Allow service role full access to findings" ON findings;
DROP POLICY IF EXISTS "Allow service role full access to database_findings" ON database_findings;
DROP POLICY IF EXISTS "Allow service role full access to reports" ON reports;
DROP POLICY IF EXISTS "Allow service role full access to webhooks" ON webhooks;

CREATE POLICY "Allow service role full access to api_clients" ON api_clients FOR ALL USING (true);
CREATE POLICY "Allow service role full access to api_keys" ON api_keys FOR ALL USING (true);
CREATE POLICY "Allow service role full access to analyses" ON analyses FOR ALL USING (true);
CREATE POLICY "Allow service role full access to findings" ON findings FOR ALL USING (true);
CREATE POLICY "Allow service role full access to database_findings" ON database_findings FOR ALL USING (true);
CREATE POLICY "Allow service role full access to reports" ON reports FOR ALL USING (true);
CREATE POLICY "Allow service role full access to webhooks" ON webhooks FOR ALL USING (true);
