
-- Index for user_progress lookups by user
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress (user_id);

-- Index for daily_usage lookups by user + date
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON public.daily_usage (user_id, usage_date);

-- Index for user_personas lookups by user
CREATE INDEX IF NOT EXISTS idx_user_personas_user_id ON public.user_personas (user_id);

-- Index for user_stats lookups by user
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats (user_id);
