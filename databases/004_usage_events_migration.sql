-- Phase 4 Database Migration - Fix Usage Tracking
-- This migration fixes the usage tracking system by creating a proper events table
-- and maintaining backward compatibility with the existing usage_tracking table

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. CREATE USAGE_EVENTS TABLE FOR EVENT TRACKING
-- =============================================================================

-- Create the usage_events table that the API expects
CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('share_generated', 'share_accessed', 'mfa_added', 'qr_scanned')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for usage_events
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Create policies for usage_events
CREATE POLICY "Users can view their own usage events" ON public.usage_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage events" ON public.usage_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for usage_events
CREATE INDEX idx_usage_events_user_id ON public.usage_events(user_id);
CREATE INDEX idx_usage_events_action ON public.usage_events(action);
CREATE INDEX idx_usage_events_created_at ON public.usage_events(created_at);
CREATE INDEX idx_usage_events_user_action ON public.usage_events(user_id, action);
CREATE INDEX idx_usage_events_user_created ON public.usage_events(user_id, created_at);

-- =============================================================================
-- 2. CREATE FUNCTION TO SYNC EVENTS TO MONTHLY AGGREGATES
-- =============================================================================

-- Function to update monthly usage tracking when events are inserted
CREATE OR REPLACE FUNCTION sync_usage_events_to_monthly()
RETURNS TRIGGER AS $$
DECLARE
    current_month DATE;
    increment_shares INTEGER := 0;
    increment_mfa INTEGER := 0;
BEGIN
    -- Get the current month (first day of the month)
    current_month := date_trunc('month', NEW.created_at)::DATE;
    
    -- Determine what to increment based on action
    CASE NEW.action
        WHEN 'share_generated', 'share_accessed' THEN
            increment_shares := 1;
        WHEN 'mfa_added' THEN
            increment_mfa := 1;
        ELSE
            -- For other actions like 'qr_scanned', we don't increment monthly counters
            RETURN NEW;
    END CASE;
    
    -- Insert or update the monthly usage tracking
    INSERT INTO public.usage_tracking (user_id, month, shares_count, mfa_entries_count)
    VALUES (NEW.user_id, current_month, increment_shares, increment_mfa)
    ON CONFLICT (user_id, month)
    DO UPDATE SET
        shares_count = public.usage_tracking.shares_count + increment_shares,
        mfa_entries_count = public.usage_tracking.mfa_entries_count + increment_mfa,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync events to monthly aggregates
CREATE TRIGGER sync_usage_events_trigger
    AFTER INSERT ON public.usage_events
    FOR EACH ROW
    EXECUTE FUNCTION sync_usage_events_to_monthly();

-- =============================================================================
-- 3. MIGRATE EXISTING DATA (if any exists in the old format)
-- =============================================================================

-- Note: Since the existing usage_tracking table uses monthly aggregates,
-- we can't recreate individual events from it. This migration will work
-- going forward for new events.

-- =============================================================================
-- 4. ADD HELPFUL VIEWS FOR REPORTING
-- =============================================================================

-- Create a view for easy usage statistics
CREATE OR REPLACE VIEW user_usage_stats AS
SELECT 
    user_id,
    COUNT(*) FILTER (WHERE action = 'share_generated') as shares_generated_total,
    COUNT(*) FILTER (WHERE action = 'share_accessed') as shares_accessed_total,
    COUNT(*) FILTER (WHERE action = 'mfa_added') as mfa_entries_added_total,
    COUNT(*) FILTER (WHERE action = 'qr_scanned') as qr_codes_scanned_total,
    
    -- Last 30 days
    COUNT(*) FILTER (WHERE action = 'share_generated' AND created_at >= NOW() - INTERVAL '30 days') as shares_generated_30d,
    COUNT(*) FILTER (WHERE action = 'share_accessed' AND created_at >= NOW() - INTERVAL '30 days') as shares_accessed_30d,
    COUNT(*) FILTER (WHERE action = 'mfa_added' AND created_at >= NOW() - INTERVAL '30 days') as mfa_entries_added_30d,
    COUNT(*) FILTER (WHERE action = 'qr_scanned' AND created_at >= NOW() - INTERVAL '30 days') as qr_codes_scanned_30d,
    
    -- Last 7 days
    COUNT(*) FILTER (WHERE action = 'share_generated' AND created_at >= NOW() - INTERVAL '7 days') as shares_generated_7d,
    COUNT(*) FILTER (WHERE action = 'share_accessed' AND created_at >= NOW() - INTERVAL '7 days') as shares_accessed_7d,
    COUNT(*) FILTER (WHERE action = 'mfa_added' AND created_at >= NOW() - INTERVAL '7 days') as mfa_entries_added_7d,
    COUNT(*) FILTER (WHERE action = 'qr_scanned' AND created_at >= NOW() - INTERVAL '7 days') as qr_codes_scanned_7d,
    
    MAX(created_at) as last_activity
FROM public.usage_events
GROUP BY user_id;

-- =============================================================================
-- 5. GRANT APPROPRIATE PERMISSIONS
-- =============================================================================

-- Grant permissions to authenticated users for the view
GRANT SELECT ON user_usage_stats TO authenticated; 