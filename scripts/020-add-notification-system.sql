-- Notification System
-- Sistema completo de notificações: email, in-app e webhooks

-- Removendo tabelas existentes para garantir estrutura limpa
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Tabela de notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de preferências de notificação
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  email_on_analysis_complete BOOLEAN DEFAULT true,
  email_on_job_failed BOOLEAN DEFAULT true,
  email_on_alert BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  webhook_enabled BOOLEAN DEFAULT false,
  webhook_url TEXT,
  webhook_events TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs de webhook
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_webhook_logs_user ON webhook_logs(user_id);
CREATE INDEX idx_webhook_logs_event ON webhook_logs(event_type);

-- Função para marcar notificações como lidas
CREATE OR REPLACE FUNCTION mark_notifications_as_read(
  p_user_id UUID,
  p_notification_ids UUID[]
) RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = NOW()
  WHERE user_id = p_user_id
    AND id = ANY(p_notification_ids);
END;
$$ LANGUAGE plpgsql;

-- Função para limpar notificações antigas
CREATE OR REPLACE FUNCTION cleanup_old_notifications() RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE read = true
    AND read_at < NOW() - INTERVAL '30 days';
    
  DELETE FROM webhook_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
