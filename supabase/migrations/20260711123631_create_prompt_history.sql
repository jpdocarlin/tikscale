-- Create table to track generated prompt history combinations for uniqueness
CREATE TABLE IF NOT EXISTS public.prompt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    combination JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast retrieval of user's recent generations
CREATE INDEX IF NOT EXISTS prompt_history_user_id_created_at_idx ON public.prompt_history (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own prompt history logs
CREATE POLICY "Users can insert their own prompt history" 
ON public.prompt_history FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own prompt history logs
CREATE POLICY "Users can view their own prompt history" 
ON public.prompt_history FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);
