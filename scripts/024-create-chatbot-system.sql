-- Extend ai_chat_history table with task context
ALTER TABLE ai_chat_history ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id);
ALTER TABLE ai_chat_history ADD COLUMN IF NOT EXISTS repository_id UUID REFERENCES repositories(id);
ALTER TABLE ai_chat_history ADD COLUMN IF NOT EXISTS intent CHARACTER VARYING(50);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_session ON ai_chat_history(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_client ON ai_chat_history(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created ON ai_chat_history(created_at DESC);

-- Create view for user's pending tasks summary
CREATE OR REPLACE VIEW user_pending_tasks_summary AS
SELECT 
  t.client_id,
  t.assigned_to as user_id,
  COUNT(*) FILTER (WHERE t.status = 'pendente') as pending_count,
  COUNT(*) FILTER (WHERE t.status = 'em_progresso') as in_progress_count,
  COUNT(*) FILTER (WHERE t.priority = 'alta') as high_priority_count,
  COUNT(DISTINCT t.repository_name) as repository_count,
  MIN(t.due_date) as next_due_date,
  r.name as earliest_repo_name
FROM tasks t
LEFT JOIN repositories r ON t.repository_name = r.name AND t.client_id = r.client_id
WHERE t.assigned_to IS NOT NULL
GROUP BY t.client_id, t.assigned_to, r.name;

COMMENT ON TABLE ai_chat_history IS 'Stores chatbot conversation history with task context';
COMMENT ON VIEW user_pending_tasks_summary IS 'Summary of pending tasks per user for chatbot quick responses';
