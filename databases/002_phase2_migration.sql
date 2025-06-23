-- Phase 2 Database Migration
-- This script adds all the necessary tables and fields for Phase 2 features

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. ADD USER TIER AND PROFILE EXTENSIONS
-- =============================================================================

-- Add user tier and subscription fields to profiles (or auth.users via custom fields)
-- Note: Since we can't directly modify auth.users, we'll create a profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_tier TEXT NOT NULL DEFAULT 'free' CHECK (user_tier IN ('free', 'pro', 'enterprise')),
    display_name TEXT,
    company TEXT,
    use_case TEXT CHECK (use_case IN ('personal', 'business', 'team')),
    newsletter_consent BOOLEAN DEFAULT false,
    product_updates_consent BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    profile_setup_completed BOOLEAN DEFAULT false,
    
    -- Subscription fields
    stripe_customer_id TEXT,
    subscription_id TEXT,
    subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    
    -- Credits for referral system (Phase 4 preparation)
    available_credits DECIMAL(10,2) DEFAULT 0.00,
    total_credits_earned DECIMAL(10,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_profiles_user_tier ON public.profiles(user_tier);
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);

-- =============================================================================
-- 2. CREATE SHARED_LINKS TABLE (Enhanced Sharing)
-- =============================================================================

CREATE TABLE public.shared_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mfa_entry_id UUID NOT NULL REFERENCES public.mfa_entries(id) ON DELETE CASCADE,
    share_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    
    -- Sharing options from Phase 1
    require_password BOOLEAN NOT NULL DEFAULT false,
    share_password TEXT, -- Hashed password
    embed_password_in_link BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    created_by UUID NOT NULL REFERENCES auth.users(id),
    click_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for shared_links
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_links
CREATE POLICY "Users can view their own shared links" ON public.shared_links
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own shared links" ON public.shared_links
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own shared links" ON public.shared_links
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own shared links" ON public.shared_links
    FOR DELETE USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_shared_links_mfa_entry_id ON public.shared_links(mfa_entry_id);
CREATE INDEX idx_shared_links_share_token ON public.shared_links(share_token);
CREATE INDEX idx_shared_links_status ON public.shared_links(status);
CREATE INDEX idx_shared_links_created_by ON public.shared_links(created_by);
CREATE INDEX idx_shared_links_expires_at ON public.shared_links(expires_at);

-- Create trigger for updated_at
CREATE TRIGGER update_shared_links_updated_at 
    BEFORE UPDATE ON public.shared_links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. CREATE USAGE_TRACKING TABLE
-- =============================================================================

CREATE TABLE public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- Format: YYYY-MM-01
    shares_count INTEGER NOT NULL DEFAULT 0,
    mfa_entries_count INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per month
    UNIQUE(user_id, month)
);

-- Enable RLS for usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for usage_tracking
CREATE POLICY "Users can view their own usage tracking" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage tracking" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage tracking" ON public.usage_tracking
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_month ON public.usage_tracking(month);
CREATE INDEX idx_usage_tracking_user_month ON public.usage_tracking(user_id, month);

-- Create trigger for updated_at
CREATE TRIGGER update_usage_tracking_updated_at 
    BEFORE UPDATE ON public.usage_tracking 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. CREATE LEADS TABLE
-- =============================================================================

CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    name TEXT,
    company TEXT,
    tier_interest TEXT NOT NULL CHECK (tier_interest IN ('pro', 'enterprise', 'newsletter')),
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted')),
    
    -- Lead source tracking
    source TEXT DEFAULT 'pricing_page',
    referrer_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate leads for same email/tier combination
    UNIQUE(email, tier_interest)
);

-- Enable RLS for leads (admin-only access will be handled in application layer)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create restrictive policy (only admins should access leads)
CREATE POLICY "Restrict leads access" ON public.leads
    FOR ALL USING (false); -- This will be overridden by admin policies in Phase 3

-- Create indexes
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_tier_interest ON public.leads(tier_interest);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON public.leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. CREATE BILLING_EVENTS TABLE
-- =============================================================================

CREATE TABLE public.billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_event_id TEXT UNIQUE,
    event_type TEXT NOT NULL,
    
    -- Event data
    subscription_id TEXT,
    customer_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'usd',
    
    -- Status and metadata
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for billing_events
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- Create policies for billing_events
CREATE POLICY "Users can view their own billing events" ON public.billing_events
    FOR SELECT USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_billing_events_user_id ON public.billing_events(user_id);
CREATE INDEX idx_billing_events_stripe_event_id ON public.billing_events(stripe_event_id);
CREATE INDEX idx_billing_events_event_type ON public.billing_events(event_type);
CREATE INDEX idx_billing_events_created_at ON public.billing_events(created_at);

-- =============================================================================
-- 6. MIGRATION DATA FROM EXISTING MFA_ENTRIES TO SHARED_LINKS
-- =============================================================================

-- Migrate existing share data to the new shared_links table
INSERT INTO public.shared_links (
    mfa_entry_id,
    share_token,
    status,
    require_password,
    share_password,
    embed_password_in_link,
    expires_at,
    created_by,
    created_at,
    updated_at
)
SELECT 
    id as mfa_entry_id,
    share_token,
    'active' as status,
    require_password,
    share_password,
    embed_password_in_link,
    token_expires_at as expires_at,
    user_id as created_by,
    created_at,
    updated_at
FROM public.mfa_entries 
WHERE share_token IS NOT NULL;

-- =============================================================================
-- 7. CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to get or create current month usage tracking
CREATE OR REPLACE FUNCTION get_or_create_usage_tracking(p_user_id UUID)
RETURNS public.usage_tracking AS $$
DECLARE
    current_month DATE;
    usage_record public.usage_tracking;
BEGIN
    -- Get first day of current month
    current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    
    -- Try to get existing record
    SELECT * INTO usage_record 
    FROM public.usage_tracking 
    WHERE user_id = p_user_id AND month = current_month;
    
    -- If not found, create new record
    IF NOT FOUND THEN
        INSERT INTO public.usage_tracking (user_id, month, shares_count, mfa_entries_count)
        VALUES (p_user_id, current_month, 0, 0)
        RETURNING * INTO usage_record;
    END IF;
    
    RETURN usage_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create more shares
CREATE OR REPLACE FUNCTION can_user_create_share(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile public.profiles;
    current_usage public.usage_tracking;
    max_shares INTEGER;
BEGIN
    -- Get user profile
    SELECT * INTO user_profile FROM public.profiles WHERE id = p_user_id;
    
    -- If no profile found, assume free tier
    IF NOT FOUND THEN
        max_shares := 10;
    ELSE
        -- Set limits based on tier
        CASE user_profile.user_tier
            WHEN 'free' THEN max_shares := 10;
            WHEN 'pro' THEN max_shares := NULL; -- Unlimited
            WHEN 'enterprise' THEN max_shares := NULL; -- Unlimited
            ELSE max_shares := 10; -- Default to free
        END CASE;
    END IF;
    
    -- If unlimited, return true
    IF max_shares IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Get current month usage
    current_usage := get_or_create_usage_tracking(p_user_id);
    
    -- Check if under limit
    RETURN current_usage.shares_count < max_shares;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment share count
CREATE OR REPLACE FUNCTION increment_share_count(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    current_month DATE;
BEGIN
    current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    
    INSERT INTO public.usage_tracking (user_id, month, shares_count, mfa_entries_count)
    VALUES (p_user_id, current_month, 1, 0)
    ON CONFLICT (user_id, month)
    DO UPDATE SET 
        shares_count = usage_tracking.shares_count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
