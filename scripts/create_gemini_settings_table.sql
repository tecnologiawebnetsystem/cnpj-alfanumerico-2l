-- Create gemini_settings table
CREATE TABLE IF NOT EXISTS gemini_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  model_name TEXT NOT NULL DEFAULT 'gemini-pro',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2048,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);

-- Insert fictitious data
INSERT INTO gemini_settings (client_id, api_key, model_name, temperature, max_tokens, is_active)
VALUES 
  (
    '56747e7f-16ad-47a1-a7bc-513934d3a684', -- ACT Consultoria client_id
    'AIzaSyDEMO_KEY_1234567890abcdefghijklmnopqr',
    'gemini-1.5-pro',
    0.7,
    4096,
    true
  );

-- Verification query
SELECT * FROM gemini_settings;
