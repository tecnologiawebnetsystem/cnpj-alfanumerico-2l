-- Create analyses table to store repository analysis results
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_name VARCHAR(255) NOT NULL,
  repository_url VARCHAR(500),
  language VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_files INTEGER DEFAULT 0,
  files_with_cnpj INTEGER DEFAULT 0,
  estimated_hours DECIMAL(10, 2)
);

-- Create findings table to store individual CNPJ occurrences
CREATE TABLE IF NOT EXISTS findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  line_number INTEGER,
  field_name VARCHAR(255),
  field_type VARCHAR(100),
  context TEXT,
  suggestion TEXT,
  is_input BOOLEAN DEFAULT false,
  is_output BOOLEAN DEFAULT false,
  is_database BOOLEAN DEFAULT false,
  is_validation BOOLEAN DEFAULT false,
  supports_cpf BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create database_findings table for database schema analysis
CREATE TABLE IF NOT EXISTS database_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  database_type VARCHAR(50),
  table_name VARCHAR(255) NOT NULL,
  column_name VARCHAR(255) NOT NULL,
  column_type VARCHAR(100),
  column_length INTEGER,
  is_nullable BOOLEAN,
  has_index BOOLEAN DEFAULT false,
  suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_findings_analysis_id ON findings(analysis_id);
CREATE INDEX IF NOT EXISTS idx_findings_file_type ON findings(file_type);
CREATE INDEX IF NOT EXISTS idx_database_findings_analysis_id ON database_findings(analysis_id);
CREATE INDEX IF NOT EXISTS idx_database_findings_table ON database_findings(table_name);
