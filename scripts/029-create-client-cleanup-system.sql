-- Create comprehensive client cleanup system for Super Admin
-- This allows full cleanup of all client data in cascata

-- Function to clean ALL client data
CREATE OR REPLACE FUNCTION cleanup_client_data(p_client_id UUID)
RETURNS JSON AS $$
DECLARE
  v_counts JSON;
  v_analyses_count INT;
  v_tasks_count INT;
  v_findings_count INT;
  v_repositories_count INT;
  v_users_count INT;
  v_reports_count INT;
  v_logs_count INT;
BEGIN
  -- Count before deletion
  SELECT COUNT(*) INTO v_analyses_count FROM analyses WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO v_tasks_count FROM tasks WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO v_findings_count FROM findings WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO v_repositories_count FROM repositories WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO v_users_count FROM users WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO v_reports_count FROM reports WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO v_logs_count FROM activity_logs WHERE client_id = p_client_id;

  -- Delete in correct order (respecting foreign keys)
  
  -- 1. Delete task-related data
  DELETE FROM task_history WHERE task_id IN (SELECT id FROM tasks WHERE client_id = p_client_id);
  DELETE FROM task_progress WHERE client_id = p_client_id;
  DELETE FROM dev_alerts WHERE client_id = p_client_id;
  DELETE FROM dev_daily_metrics WHERE client_id = p_client_id;
  
  -- 2. Delete tasks
  DELETE FROM tasks WHERE client_id = p_client_id;
  
  -- 3. Delete analysis-related data
  DELETE FROM findings WHERE client_id = p_client_id;
  DELETE FROM database_findings WHERE client_id = p_client_id;
  DELETE FROM findings_compressed WHERE analysis_id IN (SELECT id FROM analyses WHERE client_id = p_client_id);
  DELETE FROM analysis_cache WHERE client_id = p_client_id;
  DELETE FROM analysis_metrics_history WHERE analysis_id IN (SELECT id FROM analyses WHERE client_id = p_client_id);
  DELETE FROM repository_selections WHERE analysis_id IN (SELECT id FROM analyses WHERE client_id = p_client_id);
  DELETE FROM job_logs WHERE job_id IN (SELECT id FROM job_queue WHERE client_id = p_client_id);
  DELETE FROM job_queue WHERE client_id = p_client_id;
  
  -- 4. Delete analyses and batches
  DELETE FROM batch_analyses WHERE client_id = p_client_id;
  DELETE FROM analyses WHERE client_id = p_client_id;
  DELETE FROM database_analyses WHERE client_id = p_client_id;
  
  -- 5. Delete reports
  DELETE FROM reports WHERE client_id = p_client_id;
  DELETE FROM report_templates WHERE client_id = p_client_id;
  DELETE FROM analysis_comparisons WHERE client_id = p_client_id;
  
  -- 6. Delete integrations and connections
  DELETE FROM integration_test_logs WHERE integration_id IN (SELECT id FROM integrations WHERE client_id = p_client_id);
  DELETE FROM integration_configs WHERE client_id = p_client_id;
  DELETE FROM integrations WHERE client_id = p_client_id;
  DELETE FROM database_connections WHERE client_id = p_client_id;
  DELETE FROM github_tokens WHERE client_id = p_client_id;
  
  -- 7. Delete repositories
  DELETE FROM analyzed_files WHERE repository_id IN (SELECT id FROM repositories WHERE client_id = p_client_id);
  DELETE FROM scheduled_analyses WHERE client_id = p_client_id;
  DELETE FROM repositories WHERE client_id = p_client_id;
  
  -- 8. Delete comments, notifications, and activity
  DELETE FROM comments WHERE client_id = p_client_id;
  DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE client_id = p_client_id);
  DELETE FROM activity_logs WHERE client_id = p_client_id;
  DELETE FROM analytics_events WHERE client_id = p_client_id;
  DELETE FROM structured_logs WHERE client_id = p_client_id;
  DELETE FROM system_metrics WHERE client_id = p_client_id;
  
  -- 9. Delete monitoring and alerts
  DELETE FROM monitoring_alerts WHERE client_id = p_client_id;
  DELETE FROM admin_dev_notifications WHERE client_id = p_client_id;
  
  -- 10. Delete AI and chatbot data
  DELETE FROM ai_suggestions WHERE client_id = p_client_id;
  DELETE FROM ai_chat_history WHERE client_id = p_client_id;
  
  -- 11. Delete scrum and sprint data
  DELETE FROM daily_standups WHERE client_id = p_client_id;
  DELETE FROM sprint_retrospectives WHERE client_id = p_client_id;
  DELETE FROM sprints WHERE client_id = p_client_id;
  
  -- 12. Delete billing and subscription data
  DELETE FROM api_keys WHERE client_id = p_client_id;
  DELETE FROM usage_logs WHERE client_id = p_client_id;
  DELETE FROM coupon_usage WHERE client_id = p_client_id;
  DELETE FROM payments WHERE client_id = p_client_id;
  DELETE FROM affiliate_referrals WHERE client_id = p_client_id;
  DELETE FROM subscriptions WHERE client_id = p_client_id;
  
  -- 13. Delete webhooks
  DELETE FROM webhook_logs WHERE user_id IN (SELECT id FROM users WHERE client_id = p_client_id);
  DELETE FROM webhooks WHERE client_id = p_client_id;
  
  -- 14. Delete shared links
  DELETE FROM shared_links WHERE client_id = p_client_id;
  
  -- 15. Delete project estimates
  DELETE FROM project_estimates WHERE client_id = p_client_id;
  
  -- 16. Delete user-related data
  DELETE FROM user_achievements WHERE user_id IN (SELECT id FROM users WHERE client_id = p_client_id);
  DELETE FROM user_stats WHERE user_id IN (SELECT id FROM users WHERE client_id = p_client_id);
  DELETE FROM two_factor_auth WHERE user_id IN (SELECT id FROM users WHERE client_id = p_client_id);
  DELETE FROM notification_preferences WHERE user_id IN (SELECT id FROM users WHERE client_id = p_client_id);
  DELETE FROM leaderboard WHERE client_id = p_client_id;
  DELETE FROM login_attempts WHERE email IN (SELECT email FROM users WHERE client_id = p_client_id);
  
  -- 17. Delete users
  DELETE FROM users WHERE client_id = p_client_id;
  
  -- 18. Delete client settings
  DELETE FROM client_settings WHERE client_id = p_client_id;
  
  -- Build result JSON
  v_counts := json_build_object(
    'analyses_deleted', v_analyses_count,
    'tasks_deleted', v_tasks_count,
    'findings_deleted', v_findings_count,
    'repositories_deleted', v_repositories_count,
    'users_deleted', v_users_count,
    'reports_deleted', v_reports_count,
    'logs_deleted', v_logs_count,
    'cleanup_timestamp', NOW()
  );
  
  RETURN v_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service role only
REVOKE ALL ON FUNCTION cleanup_client_data(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cleanup_client_data(UUID) TO service_role;

COMMENT ON FUNCTION cleanup_client_data IS 'Deletes ALL data for a specific client in proper cascade order. Only accessible by Super Admin.';
