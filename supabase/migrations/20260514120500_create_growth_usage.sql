-- Create table to track growth usage limits
CREATE TABLE IF NOT EXISTS public.growth_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'image' or 'script'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast daily count lookups
CREATE INDEX IF NOT EXISTS growth_usage_user_created_at_idx ON public.growth_usage (user_id, created_at);

-- Enable RLS
ALTER TABLE public.growth_usage ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own usage logs
CREATE POLICY "Users can insert their own growth usage logs" 
ON public.growth_usage FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own usage logs
CREATE POLICY "Users can view their own growth usage logs" 
ON public.growth_usage FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);
