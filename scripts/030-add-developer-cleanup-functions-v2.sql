-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS get_developer_tasks_preview(UUID);
DROP FUNCTION IF EXISTS cleanup_developer_tasks(UUID);

-- Função para obter preview das tarefas de um desenvolvedor
CREATE FUNCTION get_developer_tasks_preview(dev_id UUID)
RETURNS TABLE (
  tasks_count BIGINT,
  completed_count BIGINT,
  in_progress_count BIGINT,
  pending_count BIGINT,
  task_progress_count BIGINT,
  task_history_count BIGINT,
  comments_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT t.id) as tasks_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'in_progress') as in_progress_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending') as pending_count,
    (SELECT COUNT(*) FROM task_progress WHERE dev_id = get_developer_tasks_preview.dev_id) as task_progress_count,
    (SELECT COUNT(*) FROM task_history th WHERE th.task_id IN (SELECT id FROM tasks WHERE assigned_to = get_developer_tasks_preview.dev_id)) as task_history_count,
    (SELECT COUNT(*) FROM comments c WHERE c.entity_type = 'task' AND c.entity_id IN (SELECT id FROM tasks WHERE assigned_to = get_developer_tasks_preview.dev_id)) as comments_count
  FROM tasks t
  WHERE t.assigned_to = dev_id;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar todas as tarefas de um desenvolvedor
CREATE FUNCTION cleanup_developer_tasks(dev_id UUID)
RETURNS void AS $$
BEGIN
  -- Delete task_progress records first (foreign key constraint)
  DELETE FROM task_progress
  WHERE task_progress.dev_id = cleanup_developer_tasks.dev_id;

  -- Delete task_history records
  DELETE FROM task_history
  WHERE task_id IN (
    SELECT id FROM tasks WHERE assigned_to = cleanup_developer_tasks.dev_id
  );

  -- Delete comments on tasks
  DELETE FROM comments
  WHERE entity_type = 'task' 
    AND entity_id IN (
      SELECT id FROM tasks WHERE assigned_to = cleanup_developer_tasks.dev_id
    );

  -- Delete the tasks themselves
  DELETE FROM tasks
  WHERE assigned_to = cleanup_developer_tasks.dev_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_developer_tasks_preview(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_developer_tasks(UUID) TO authenticated;
