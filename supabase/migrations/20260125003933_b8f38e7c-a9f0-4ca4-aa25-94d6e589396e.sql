-- Create table to track daily usage limits
CREATE TABLE public.daily_usage (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    usage_date date NOT NULL DEFAULT CURRENT_DATE,
    scripts_count integer NOT NULL DEFAULT 0,
    images_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, usage_date)
);

-- Enable RLS
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own usage"
ON public.daily_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.daily_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.daily_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_daily_usage_updated_at
BEFORE UPDATE ON public.daily_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user is admin (by email)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
      AND email = 'dudu@gmail.com'
  )
$$;

-- Function to get remaining daily usage
CREATE OR REPLACE FUNCTION public.get_daily_usage(_user_id uuid)
RETURNS TABLE(scripts_remaining integer, images_remaining integer, is_admin boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _is_admin boolean;
    _scripts_count integer;
    _images_count integer;
    _daily_limit integer := 5;
BEGIN
    -- Check if admin
    _is_admin := public.is_admin(_user_id);
    
    -- Get today's usage
    SELECT COALESCE(du.scripts_count, 0), COALESCE(du.images_count, 0)
    INTO _scripts_count, _images_count
    FROM public.daily_usage du
    WHERE du.user_id = _user_id AND du.usage_date = CURRENT_DATE;
    
    -- If no record exists, counts are 0
    IF NOT FOUND THEN
        _scripts_count := 0;
        _images_count := 0;
    END IF;
    
    -- Return remaining (unlimited for admin)
    IF _is_admin THEN
        RETURN QUERY SELECT 999::integer, 999::integer, true;
    ELSE
        RETURN QUERY SELECT 
            GREATEST(0, _daily_limit - _scripts_count)::integer,
            GREATEST(0, _daily_limit - _images_count)::integer,
            false;
    END IF;
END;
$$;

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(_user_id uuid, _type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _is_admin boolean;
    _current_count integer;
    _daily_limit integer := 5;
BEGIN
    -- Check if admin (unlimited)
    _is_admin := public.is_admin(_user_id);
    IF _is_admin THEN
        RETURN true;
    END IF;
    
    -- Get current count
    IF _type = 'scripts' THEN
        SELECT COALESCE(scripts_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
    ELSE
        SELECT COALESCE(images_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
    END IF;
    
    -- Check limit
    IF COALESCE(_current_count, 0) >= _daily_limit THEN
        RETURN false;
    END IF;
    
    -- Upsert usage record
    INSERT INTO public.daily_usage (user_id, usage_date, scripts_count, images_count)
    VALUES (
        _user_id, 
        CURRENT_DATE, 
        CASE WHEN _type = 'scripts' THEN 1 ELSE 0 END,
        CASE WHEN _type = 'images' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET
        scripts_count = CASE WHEN _type = 'scripts' THEN daily_usage.scripts_count + 1 ELSE daily_usage.scripts_count END,
        images_count = CASE WHEN _type = 'images' THEN daily_usage.images_count + 1 ELSE daily_usage.images_count END,
        updated_at = now();
    
    RETURN true;
END;
$$;