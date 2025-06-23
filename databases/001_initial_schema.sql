-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create mfa_entries table
CREATE TABLE public.mfa_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    secret TEXT NOT NULL, -- Encrypted TOTP secret
    notes TEXT,
    share_password TEXT, -- Hashed password (nullable if open link)
    share_token TEXT UNIQUE, -- Unique opaque token for sharing
    require_password BOOLEAN NOT NULL DEFAULT false,
    embed_password_in_link BOOLEAN NOT NULL DEFAULT false,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_mfa_entries_user_id ON public.mfa_entries(user_id);
CREATE INDEX idx_mfa_entries_share_token ON public.mfa_entries(share_token);
CREATE INDEX idx_mfa_entries_token_expires_at ON public.mfa_entries(token_expires_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_mfa_entries_updated_at 
    BEFORE UPDATE ON public.mfa_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.mfa_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only access their own MFA entries
CREATE POLICY "Users can view their own MFA entries" ON public.mfa_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MFA entries" ON public.mfa_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA entries" ON public.mfa_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MFA entries" ON public.mfa_entries
    FOR DELETE USING (auth.uid() = user_id); 