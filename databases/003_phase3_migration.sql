-- Phase 3 Database Migration - Admin Features & Business Intelligence
-- Run this migration after Phase 2 migration (002_phase2_migration.sql)

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_id UUID, -- Can reference users, leads, or other entities
  target_type TEXT, -- 'user', 'lead', 'system', etc.
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for admin_actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_id ON admin_actions(target_id);

-- Enhance leads table with additional management fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS revenue_attributed DECIMAL(10,2) DEFAULT 0.00;

-- Create system_metrics table for monitoring
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,4),
  metric_type TEXT, -- 'counter', 'gauge', 'histogram'
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for system_metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON system_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);

-- Create user_sessions table for activity tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  pages_visited INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON user_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_user_sessions_end ON user_sessions(session_end);

-- Create feature_usage table for tracking feature adoption
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  first_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for feature_usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_last_used ON feature_usage(last_used_at);

-- Create revenue_events table for financial tracking
CREATE TABLE IF NOT EXISTS revenue_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'subscription', 'upgrade', 'downgrade', 'churn'
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  subscription_plan TEXT,
  billing_period TEXT, -- 'monthly', 'yearly'
  payment_method TEXT,
  transaction_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for revenue_events
CREATE INDEX IF NOT EXISTS idx_revenue_events_user_id ON revenue_events(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_type ON revenue_events(event_type);
CREATE INDEX IF NOT EXISTS idx_revenue_events_created_at ON revenue_events(created_at);
CREATE INDEX IF NOT EXISTS idx_revenue_events_amount ON revenue_events(amount);

-- Create system_alerts table for monitoring
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'performance', 'security', 'business'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT, -- Component or system that generated the alert
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for system_alerts
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_acknowledged ON system_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at);

-- Row Level Security (RLS) policies for admin tables

-- Admin actions - only admins can read their own actions and all actions
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all admin actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can insert admin actions" ON admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
    AND admin_id = auth.uid()
  );

-- System metrics - only admins can read
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view system metrics" ON system_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert metrics" ON system_metrics
  FOR INSERT WITH CHECK (true); -- Allow system to insert metrics

-- User sessions - only admins can view all, users can view their own
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can manage sessions" ON user_sessions
  FOR ALL WITH CHECK (true);

-- Feature usage - similar to user sessions
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feature usage" ON feature_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all feature usage" ON feature_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can manage feature usage" ON feature_usage
  FOR ALL WITH CHECK (true);

-- Revenue events - only admins can read
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all revenue events" ON revenue_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert revenue events" ON revenue_events
  FOR INSERT WITH CHECK (true);

-- System alerts - only admins can manage
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage system alerts" ON system_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Helper functions for analytics

-- Function to get user growth statistics
CREATE OR REPLACE FUNCTION get_user_growth_stats(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  new_users BIGINT,
  total_users BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE date_series AS (
    SELECT start_date::DATE as date
    UNION ALL
    SELECT (date + INTERVAL '1 day')::DATE
    FROM date_series
    WHERE date < end_date
  ),
  daily_signups AS (
    SELECT 
      DATE(created_at) as signup_date,
      COUNT(*) as new_users
    FROM profiles
    WHERE DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.date,
    COALESCE(dsu.new_users, 0) as new_users,
    (
      SELECT COUNT(*)::BIGINT 
      FROM profiles 
      WHERE DATE(created_at) <= ds.date
    ) as total_users
  FROM date_series ds
  LEFT JOIN daily_signups dsu ON ds.date = dsu.signup_date
  ORDER BY ds.date;
END;
$$;

-- Function to get revenue metrics
CREATE OR REPLACE FUNCTION get_revenue_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  daily_revenue DECIMAL(10,2),
  monthly_recurring_revenue DECIMAL(10,2),
  new_subscriptions BIGINT,
  churned_subscriptions BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE date_series AS (
    SELECT start_date::DATE as date
    UNION ALL
    SELECT (date + INTERVAL '1 day')::DATE
    FROM date_series
    WHERE date < end_date
  ),
  daily_revenue AS (
    SELECT 
      DATE(created_at) as revenue_date,
      SUM(amount) as daily_amount,
      COUNT(CASE WHEN event_type = 'subscription' THEN 1 END) as new_subs,
      COUNT(CASE WHEN event_type = 'churn' THEN 1 END) as churned_subs
    FROM revenue_events
    WHERE DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.date,
    COALESCE(dr.daily_amount, 0) as daily_revenue,
    -- Calculate MRR as sum of active monthly subscriptions
    COALESCE((
      SELECT SUM(amount) 
      FROM revenue_events re
      WHERE re.event_type = 'subscription' 
      AND re.billing_period = 'monthly'
      AND DATE(re.created_at) <= ds.date
      AND NOT EXISTS (
        SELECT 1 FROM revenue_events re2
        WHERE re2.user_id = re.user_id 
        AND re2.event_type = 'churn'
        AND re2.created_at > re.created_at
        AND DATE(re2.created_at) <= ds.date
      )
    ), 0) as monthly_recurring_revenue,
    COALESCE(dr.new_subs, 0) as new_subscriptions,
    COALESCE(dr.churned_subs, 0) as churned_subscriptions
  FROM date_series ds
  LEFT JOIN daily_revenue dr ON ds.date = dr.revenue_date
  ORDER BY ds.date;
END;
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_old_value TEXT DEFAULT NULL,
  p_new_value TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO admin_actions (
    admin_id, action_type, target_id, target_type,
    old_value, new_value, description, metadata
  ) VALUES (
    p_admin_id, p_action_type, p_target_id, p_target_type,
    p_old_value, p_new_value, p_description, p_metadata
  ) RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$;

-- Create initial admin user (commented out - should be done manually)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@sharemfa.com';

COMMENT ON TABLE admin_actions IS 'Audit log for all administrative actions';
COMMENT ON TABLE system_metrics IS 'System performance and business metrics';
COMMENT ON TABLE user_sessions IS 'User session tracking for analytics';
COMMENT ON TABLE feature_usage IS 'Feature adoption and usage patterns';
COMMENT ON TABLE revenue_events IS 'Financial events and revenue tracking';
COMMENT ON TABLE system_alerts IS 'System monitoring and alerting';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
