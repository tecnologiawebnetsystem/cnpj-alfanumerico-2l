-- ============================================================================
-- COMPLETE FEATURE SYSTEM DATABASE SCHEMA
-- Implements all 59 features for CNPJ Alfanumérico System
-- ============================================================================

-- ============================================================================
-- 1. NOTIFICATIONS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'task_assigned', 'license_expiring', 'analysis_complete', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT, -- URL to navigate when clicked
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    category VARCHAR(50), -- 'task', 'license', 'analysis', 'system', etc.
    metadata JSONB, -- Additional data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_client_id ON notifications(client_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- 2. GAMIFICATION SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50), -- Icon name from lucide-react
    category VARCHAR(50), -- 'analysis', 'tasks', 'collaboration', 'streak', etc.
    points INTEGER DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    requirement_type VARCHAR(50), -- 'count', 'streak', 'speed', 'quality', etc.
    requirement_value INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0, -- For tracking progress towards achievement
    metadata JSONB, -- Additional data about how it was earned
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    tasks_completed INTEGER DEFAULT 0,
    analyses_completed INTEGER DEFAULT 0,
    comments_made INTEGER DEFAULT 0,
    achievements_earned INTEGER DEFAULT 0,
    rank VARCHAR(50) DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
    metric VARCHAR(50) NOT NULL, -- 'points', 'tasks', 'analyses', 'speed', etc.
    value NUMERIC NOT NULL,
    rank INTEGER,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period, metric, period_start)
);

CREATE INDEX idx_leaderboard_period ON leaderboard(period, metric, value DESC);
CREATE INDEX idx_leaderboard_client ON leaderboard(client_id, period);

-- ============================================================================
-- 3. COLLABORATION SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'task', 'analysis', 'finding', etc.
    entity_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threaded comments
    content TEXT NOT NULL,
    mentions UUID[], -- Array of user IDs mentioned
    attachments JSONB, -- Array of attachment URLs
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'assigned', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'task', 'analysis', 'user', 'client', etc.
    entity_id UUID,
    entity_name VARCHAR(255),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_client ON activity_logs(client_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- 4. INTEGRATIONS SYSTEM (Extended)
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- 'slack', 'jira', 'trello', 'gitlab', etc.
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL, -- Configuration specific to integration type
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, integration_type, name)
);

CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_triggered_at ON webhook_logs(triggered_at DESC);

-- ============================================================================
-- 5. PLANS AND MONETIZATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_monthly NUMERIC(10, 2),
    price_quarterly NUMERIC(10, 2),
    price_annual NUMERIC(10, 2),
    features JSONB, -- Array of features
    limits JSONB, -- max_users, max_analyses, max_repositories, etc.
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'suspended'
    billing_cycle VARCHAR(20), -- 'monthly', 'quarterly', 'annual'
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    trial_start DATE,
    trial_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_method VARCHAR(50), -- 'credit_card', 'boleto', 'pix', etc.
    transaction_id VARCHAR(255),
    gateway VARCHAR(50), -- 'stripe', 'mercadopago', etc.
    gateway_response JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    max_uses INTEGER,
    times_used INTEGER DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    applies_to_plans UUID[], -- Array of plan IDs, null = all plans
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    discount_amount NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. AFFILIATES PROGRAM
-- ============================================================================

CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    commission_rate NUMERIC(5, 2) DEFAULT 10.00, -- Percentage
    total_referrals INTEGER DEFAULT 0,
    total_earnings NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'inactive'
    payment_info JSONB, -- Bank account, PIX, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    commission_amount NUMERIC(10, 2),
    commission_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. SECURITY FEATURES
-- ============================================================================

CREATE TABLE IF NOT EXISTS two_factor_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    secret VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    backup_codes TEXT[], -- Array of backup codes
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email, created_at DESC);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, created_at DESC);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- 'analyses', 'tasks', 'users', 'settings', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL, -- 'super_admin', 'admin', 'dev', 'user'
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- ============================================================================
-- 8. AI FEATURES
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    database_finding_id UUID REFERENCES database_findings(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50), -- 'code_fix', 'migration_script', 'validation', etc.
    original_code TEXT,
    suggested_code TEXT,
    explanation TEXT,
    confidence_score NUMERIC(3, 2), -- 0.00 to 1.00
    model_used VARCHAR(100), -- 'gpt-4', 'claude-3', etc.
    tokens_used INTEGER,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'modified'
    applied_by UUID REFERENCES users(id) ON DELETE SET NULL,
    applied_at TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_suggestions_finding ON ai_suggestions(finding_id);
CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);

CREATE TABLE IF NOT EXISTS ai_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB, -- Model, tokens, context, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_session ON ai_chat_history(session_id, created_at);

-- ============================================================================
-- 9. SCHEDULED ANALYSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'cron'
    schedule_config JSONB, -- Day of week, time, cron expression, etc.
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_status VARCHAR(50), -- 'success', 'failed', 'running'
    last_error TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_analyses_next_run ON scheduled_analyses(next_run_at) WHERE is_active = TRUE;

-- ============================================================================
-- 10. HELP AND DOCUMENTATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS help_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(100), -- 'getting-started', 'features', 'troubleshooting', etc.
    tags TEXT[],
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    search_vector tsvector, -- For full-text search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_help_articles_slug ON help_articles(slug);
CREATE INDEX idx_help_articles_category ON help_articles(category);
CREATE INDEX idx_help_articles_search ON help_articles USING gin(search_vector);

CREATE TABLE IF NOT EXISTS help_article_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES help_articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_helpful BOOLEAN NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. SHARED LINKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS shared_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'analysis', 'report', 'finding', etc.
    entity_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255), -- Optional password protection
    expires_at TIMESTAMP WITH TIME ZONE,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_shared_links_entity ON shared_links(entity_type, entity_id);

-- ============================================================================
-- 12. ANALYTICS AND METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'button_click', 'feature_used', etc.
    event_name VARCHAR(255) NOT NULL,
    properties JSONB,
    session_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_client ON analytics_events(client_id, created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats based on the action
    IF TG_TABLE_NAME = 'tasks' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE user_stats 
        SET tasks_completed = tasks_completed + 1,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE user_id = NEW.assigned_to;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task completion
DROP TRIGGER IF EXISTS trigger_update_user_stats_on_task ON tasks;
CREATE TRIGGER trigger_update_user_stats_on_task
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_streak INTEGER := 0;
    v_last_date DATE;
    v_current_date DATE := CURRENT_DATE;
BEGIN
    SELECT last_activity_date INTO v_last_date
    FROM user_stats
    WHERE user_id = p_user_id;
    
    IF v_last_date IS NULL THEN
        RETURN 0;
    END IF;
    
    -- If last activity was yesterday, increment streak
    IF v_last_date = v_current_date - INTERVAL '1 day' THEN
        SELECT current_streak INTO v_streak
        FROM user_stats
        WHERE user_id = p_user_id;
        
        RETURN v_streak + 1;
    -- If last activity was today, keep current streak
    ELSIF v_last_date = v_current_date THEN
        SELECT current_streak INTO v_streak
        FROM user_stats
        WHERE user_id = p_user_id;
        
        RETURN v_streak;
    -- Otherwise, reset streak
    ELSE
        RETURN 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_stats RECORD;
    v_achievement RECORD;
BEGIN
    -- Get user stats
    SELECT * INTO v_stats FROM user_stats WHERE user_id = p_user_id;
    
    -- Check each achievement
    FOR v_achievement IN SELECT * FROM achievements WHERE is_active = TRUE LOOP
        -- Check if user already has this achievement
        IF NOT EXISTS (
            SELECT 1 FROM user_achievements 
            WHERE user_id = p_user_id AND achievement_id = v_achievement.id
        ) THEN
            -- Check if requirements are met
            IF v_achievement.requirement_type = 'tasks_completed' AND 
               v_stats.tasks_completed >= v_achievement.requirement_value THEN
                INSERT INTO user_achievements (user_id, achievement_id)
                VALUES (p_user_id, v_achievement.id);
                
                -- Update total achievements
                UPDATE user_stats 
                SET achievements_earned = achievements_earned + 1,
                    total_points = total_points + v_achievement.points
                WHERE user_id = p_user_id;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Service role has full access, users can view own data)
-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role has full access to notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');

-- Achievements (public read, service role write)
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Service role has full access to achievements" ON achievements FOR ALL USING (auth.role() = 'service_role');

-- User Achievements
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role has full access to user_achievements" ON user_achievements FOR ALL USING (auth.role() = 'service_role');

-- User Stats
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role has full access to user_stats" ON user_stats FOR ALL USING (auth.role() = 'service_role');

-- Comments
CREATE POLICY "Users can view comments in their client" ON comments FOR SELECT USING (
    client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Service role has full access to comments" ON comments FOR ALL USING (auth.role() = 'service_role');

-- Activity Logs
CREATE POLICY "Users can view activity logs in their client" ON activity_logs FOR SELECT USING (
    client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Service role has full access to activity_logs" ON activity_logs FOR ALL USING (auth.role() = 'service_role');

-- Plans (public read)
CREATE POLICY "Anyone can view active plans" ON plans FOR SELECT USING (is_active = true);
CREATE POLICY "Service role has full access to plans" ON plans FOR ALL USING (auth.role() = 'service_role');

-- Subscriptions
CREATE POLICY "Clients can view own subscriptions" ON subscriptions FOR SELECT USING (
    client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Service role has full access to subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'service_role');

-- Payments
CREATE POLICY "Clients can view own payments" ON payments FOR SELECT USING (
    client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Service role has full access to payments" ON payments FOR ALL USING (auth.role() = 'service_role');

-- AI Suggestions
CREATE POLICY "Clients can view own ai_suggestions" ON ai_suggestions FOR SELECT USING (
    client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Service role has full access to ai_suggestions" ON ai_suggestions FOR ALL USING (auth.role() = 'service_role');

-- Scheduled Analyses
CREATE POLICY "Clients can view own scheduled_analyses" ON scheduled_analyses FOR SELECT USING (
    client_id IN (SELECT client_id FROM users WHERE id = auth.uid())
);
CREATE POLICY "Service role has full access to scheduled_analyses" ON scheduled_analyses FOR ALL USING (auth.role() = 'service_role');

-- Help Articles (public read for published)
CREATE POLICY "Anyone can view published help articles" ON help_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Service role has full access to help_articles" ON help_articles FOR ALL USING (auth.role() = 'service_role');

-- Shared Links (public read with token)
CREATE POLICY "Anyone can view shared links with valid token" ON shared_links FOR SELECT USING (is_active = true);
CREATE POLICY "Service role has full access to shared_links" ON shared_links FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- SEED DATA - Default Achievements
-- ============================================================================

INSERT INTO achievements (name, display_name, description, icon, category, points, rarity, requirement_type, requirement_value) VALUES
('first_analysis', 'Primeiro Passo', 'Complete sua primeira análise', 'Rocket', 'analysis', 10, 'common', 'count', 1),
('10_analyses', 'Analista Iniciante', 'Complete 10 análises', 'Target', 'analysis', 50, 'common', 'count', 10),
('50_analyses', 'Analista Experiente', 'Complete 50 análises', 'Award', 'analysis', 200, 'rare', 'count', 50),
('100_analyses', 'Analista Master', 'Complete 100 análises', 'Trophy', 'analysis', 500, 'epic', 'count', 100),
('first_task', 'Primeira Tarefa', 'Complete sua primeira tarefa', 'CheckCircle', 'tasks', 10, 'common', 'count', 1),
('10_tasks', 'Executor', 'Complete 10 tarefas', 'ListChecks', 'tasks', 50, 'common', 'count', 10),
('50_tasks', 'Produtivo', 'Complete 50 tarefas', 'Zap', 'tasks', 200, 'rare', 'count', 50),
('100_tasks', 'Velocista', 'Complete 100 tarefas', 'Flame', 'tasks', 500, 'epic', 'count', 100),
('7_day_streak', 'Consistente', 'Mantenha um streak de 7 dias', 'Calendar', 'streak', 100, 'rare', 'streak', 7),
('30_day_streak', 'Dedicado', 'Mantenha um streak de 30 dias', 'CalendarCheck', 'streak', 300, 'epic', 'streak', 30),
('100_day_streak', 'Lendário', 'Mantenha um streak de 100 dias', 'Crown', 'streak', 1000, 'legendary', 'streak', 100),
('first_comment', 'Comunicador', 'Faça seu primeiro comentário', 'MessageCircle', 'collaboration', 10, 'common', 'count', 1),
('team_player', 'Colaborador', 'Faça 50 comentários', 'Users', 'collaboration', 100, 'rare', 'count', 50)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA - Default Plans
-- ============================================================================

INSERT INTO plans (name, display_name, description, price_monthly, price_quarterly, price_annual, features, limits, is_active, is_popular, sort_order) VALUES
('free', 'Gratuito', 'Para testar o sistema', 0, 0, 0, 
 '["1 usuário", "5 análises/mês", "Suporte por email"]'::jsonb,
 '{"max_users": 1, "max_analyses": 5, "max_repositories": 3}'::jsonb,
 true, false, 1),
('basic', 'Básico', 'Para pequenas equipes', 99.90, 269.70, 959.40,
 '["Até 5 usuários", "50 análises/mês", "Suporte prioritário", "Relatórios PDF"]'::jsonb,
 '{"max_users": 5, "max_analyses": 50, "max_repositories": 20}'::jsonb,
 true, false, 2),
('pro', 'Profissional', 'Para equipes em crescimento', 299.90, 809.70, 2879.40,
 '["Até 20 usuários", "Análises ilimitadas", "Suporte 24/7", "API Access", "Integrações", "IA Suggestions"]'::jsonb,
 '{"max_users": 20, "max_analyses": -1, "max_repositories": -1}'::jsonb,
 true, true, 3),
('enterprise', 'Enterprise', 'Para grandes empresas', 999.90, 2699.70, 9599.40,
 '["Usuários ilimitados", "Análises ilimitadas", "Suporte dedicado", "SLA garantido", "Customizações", "Treinamento"]'::jsonb,
 '{"max_users": -1, "max_analyses": -1, "max_repositories": -1}'::jsonb,
 true, false, 4)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA - Default Permissions
-- ============================================================================

INSERT INTO permissions (name, display_name, description, category) VALUES
('view_analyses', 'Visualizar Análises', 'Pode visualizar análises', 'analyses'),
('create_analyses', 'Criar Análises', 'Pode criar novas análises', 'analyses'),
('delete_analyses', 'Deletar Análises', 'Pode deletar análises', 'analyses'),
('view_tasks', 'Visualizar Tarefas', 'Pode visualizar tarefas', 'tasks'),
('create_tasks', 'Criar Tarefas', 'Pode criar novas tarefas', 'tasks'),
('assign_tasks', 'Atribuir Tarefas', 'Pode atribuir tarefas a usuários', 'tasks'),
('delete_tasks', 'Deletar Tarefas', 'Pode deletar tarefas', 'tasks'),
('view_users', 'Visualizar Usuários', 'Pode visualizar usuários', 'users'),
('create_users', 'Criar Usuários', 'Pode criar novos usuários', 'users'),
('edit_users', 'Editar Usuários', 'Pode editar usuários', 'users'),
('delete_users', 'Deletar Usuários', 'Pode deletar usuários', 'users'),
('view_clients', 'Visualizar Clientes', 'Pode visualizar clientes', 'clients'),
('edit_clients', 'Editar Clientes', 'Pode editar clientes', 'clients'),
('manage_licenses', 'Gerenciar Licenças', 'Pode gerenciar licenças de clientes', 'licenses'),
('view_reports', 'Visualizar Relatórios', 'Pode visualizar relatórios', 'reports'),
('export_reports', 'Exportar Relatórios', 'Pode exportar relatórios', 'reports'),
('manage_integrations', 'Gerenciar Integrações', 'Pode gerenciar integrações', 'integrations'),
('view_analytics', 'Visualizar Analytics', 'Pode visualizar analytics', 'analytics'),
('manage_settings', 'Gerenciar Configurações', 'Pode gerenciar configurações do sistema', 'settings')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================

COMMENT ON TABLE notifications IS 'Sistema de notificações em tempo real';
COMMENT ON TABLE achievements IS 'Conquistas disponíveis no sistema de gamificação';
COMMENT ON TABLE user_achievements IS 'Conquistas ganhas pelos usuários';
COMMENT ON TABLE user_stats IS 'Estatísticas e progresso dos usuários';
COMMENT ON TABLE leaderboard IS 'Ranking de usuários por diferentes métricas';
COMMENT ON TABLE comments IS 'Comentários em tarefas, análises e outros itens';
COMMENT ON TABLE activity_logs IS 'Logs de auditoria de todas as ações no sistema';
COMMENT ON TABLE integration_configs IS 'Configurações de integrações externas (Slack, Jira, etc)';
COMMENT ON TABLE webhook_logs IS 'Logs de execução de webhooks';
COMMENT ON TABLE plans IS 'Planos de assinatura disponíveis';
COMMENT ON TABLE subscriptions IS 'Assinaturas ativas dos clientes';
COMMENT ON TABLE payments IS 'Histórico de pagamentos';
COMMENT ON TABLE coupons IS 'Cupons de desconto';
COMMENT ON TABLE affiliates IS 'Programa de afiliados';
COMMENT ON TABLE two_factor_auth IS 'Autenticação de dois fatores';
COMMENT ON TABLE ai_suggestions IS 'Sugestões geradas por IA para correções';
COMMENT ON TABLE scheduled_analyses IS 'Análises agendadas para execução automática';
COMMENT ON TABLE help_articles IS 'Artigos da central de ajuda';
COMMENT ON TABLE shared_links IS 'Links compartilháveis para análises e relatórios';
COMMENT ON TABLE analytics_events IS 'Eventos de analytics para métricas de uso';
