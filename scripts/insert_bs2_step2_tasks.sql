-- ========================================
-- ETAPA 2: CRIAR TASK_PROGRESS
-- ========================================
-- Execute este script DEPOIS do Step 1
-- Busca os IDs reais dos findings e cria as tasks

DO $$
DECLARE
  v_client_id UUID := '56747e7f-16ad-47a1-a7bc-513934d3a684';
  v_danilo UUID := '964f8be3-2ec1-430c-a544-e314ec47a1a6';
  v_joao UUID := '7ec2792b-9243-4851-9a46-73718c768ffb';
  v_kleber UUID := 'f17e294f-c6ce-470e-9a26-6c69fc771f5b';
  v_leandro UUID := '67490017-b53e-48c7-b8ae-ba5a15da6ac2';
  
  v_finding_id UUID;
  v_dev_index INT := 0;
  v_devs UUID[] := ARRAY[v_danilo, v_joao, v_kleber, v_leandro];
BEGIN
  -- Buscar todos os findings do batch BS2 e criar tasks
  FOR v_finding_id IN 
    SELECT f.id 
    FROM findings f
    JOIN analyses a ON f.analysis_id = a.id
    JOIN batch_analyses ba ON a.batch_id = ba.id
    WHERE ba.account_name = 'BS2 Tecnologia'
    ORDER BY f.created_at
  LOOP
    -- Alternar entre os 4 desenvolvedores
    v_dev_index := v_dev_index + 1;
    
    INSERT INTO task_progress (
      task_id, 
      dev_id, 
      client_id, 
      status, 
      progress_percentage, 
      estimated_hours, 
      created_at, 
      updated_at
    ) VALUES (
      v_finding_id,
      v_devs[(v_dev_index % 4) + 1],
      v_client_id,
      CASE 
        WHEN v_dev_index % 3 = 0 THEN 'completed'
        WHEN v_dev_index % 3 = 1 THEN 'in_progress'
        ELSE 'pending'
      END,
      CASE 
        WHEN v_dev_index % 3 = 0 THEN 100
        WHEN v_dev_index % 3 = 1 THEN 50
        ELSE 0
      END,
      4.0,
      NOW() - INTERVAL '3 days',
      NOW()
    );
  END LOOP;

  RAISE NOTICE 'Step 2 completed! Created % tasks', v_dev_index;
END $$;

-- Verificação final
SELECT 
  u.name as developer,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE tp.status = 'completed') as completed,
  COUNT(*) FILTER (WHERE tp.status = 'in_progress') as in_progress,
  COUNT(*) FILTER (WHERE tp.status = 'pending') as pending
FROM task_progress tp
JOIN users u ON tp.dev_id = u.id
WHERE tp.client_id = '56747e7f-16ad-47a1-a7bc-513934d3a684'
GROUP BY u.name
ORDER BY u.name;
