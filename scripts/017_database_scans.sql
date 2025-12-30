-- Tabela para armazenar scans de bancos de dados SQL Server/Oracle
CREATE TABLE IF NOT EXISTS database_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  database_type TEXT NOT NULL CHECK (database_type IN ('sqlserver', 'oracle')),
  connection_string_hash TEXT NOT NULL,
  schemas_scanned TEXT[] DEFAULT '{}',
  findings_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX idx_database_scans_user_id ON database_scans(user_id);
CREATE INDEX idx_database_scans_status ON database_scans(status);
CREATE INDEX idx_database_scans_created_at ON database_scans(created_at DESC);

-- RLS Policies
ALTER TABLE database_scans ENABLE ROW LEVEL SECURITY;

-- Admin vê todos os scans do seu cliente
CREATE POLICY "admin_view_all_scans" ON database_scans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u1
      JOIN users u2 ON u1.client_id = u2.client_id
      WHERE u1.id = auth.uid() 
        AND u1.role = 'admin'
        AND u2.id = database_scans.user_id
    )
  );

-- Usuário vê apenas seus próprios scans
CREATE POLICY "user_view_own_scans" ON database_scans
  FOR SELECT
  USING (user_id = auth.uid());

-- Usuário pode criar seus próprios scans
CREATE POLICY "user_create_scans" ON database_scans
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Usuário pode atualizar seus próprios scans
CREATE POLICY "user_update_own_scans" ON database_scans
  FOR UPDATE
  USING (user_id = auth.uid());

COMMENT ON TABLE database_scans IS 'Armazena resultados de scans de CNPJs em bancos SQL Server e Oracle';
