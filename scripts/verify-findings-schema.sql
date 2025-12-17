-- Verificar schema da tabela findings
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'findings'
ORDER BY ordinal_position;

-- Verificar se todas as colunas necessárias existem
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'findings' AND column_name = 'analysis_id') THEN '✅'
    ELSE '❌'
  END AS analysis_id,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'findings' AND column_name = 'client_id') THEN '✅'
    ELSE '❌'
  END AS client_id,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'findings' AND column_name = 'repository') THEN '✅'
    ELSE '❌'
  END AS repository,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'findings' AND column_name = 'project') THEN '✅'
    ELSE '❌'
  END AS project,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'findings' AND column_name = 'file_path') THEN '✅'
    ELSE '❌'
  END AS file_path;
