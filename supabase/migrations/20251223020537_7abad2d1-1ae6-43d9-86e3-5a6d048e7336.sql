-- Create table for post history
CREATE TABLE public.post_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  content_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for posting goals
CREATE TABLE public.posting_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  weekly_goal INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.post_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posting_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_history
CREATE POLICY "Users can view their own post history"
ON public.post_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own post history"
ON public.post_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post history"
ON public.post_history
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for posting_goals
CREATE POLICY "Users can view their own posting goals"
ON public.posting_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posting goals"
ON public.posting_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posting goals"
ON public.posting_goals
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updating updated_at on posting_goals
CREATE TRIGGER update_posting_goals_updated_at
BEFORE UPDATE ON public.posting_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();