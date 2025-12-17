-- Create search_patterns table for custom CNPJ search patterns
-- This table was missing and causing the analysis to hang

CREATE TABLE IF NOT EXISTS public.search_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  pattern_type VARCHAR(50) NOT NULL DEFAULT 'cnpj_mask',
  pattern_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_patterns_user_id ON search_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_search_patterns_client_id ON search_patterns(client_id);
CREATE INDEX IF NOT EXISTS idx_search_patterns_active ON search_patterns(is_active);

-- Enable Row Level Security
ALTER TABLE search_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own patterns" ON search_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patterns" ON search_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns" ON search_patterns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patterns" ON search_patterns
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE search_patterns IS 'Custom search patterns for CNPJ detection in code analysis';
