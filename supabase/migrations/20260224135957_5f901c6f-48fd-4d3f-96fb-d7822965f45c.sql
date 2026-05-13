
CREATE OR REPLACE FUNCTION public.get_daily_usage(_user_id uuid)
 RETURNS TABLE(scripts_remaining integer, images_remaining integer, is_admin boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    _is_admin boolean;
    _scripts_count integer;
    _images_count integer;
    _daily_limit integer;
    _email text;
BEGIN
    _is_admin := public.is_admin(_user_id);
    
    SELECT email INTO _email FROM auth.users WHERE id = _user_id;
    
    IF _is_admin THEN
        _daily_limit := 999;
    ELSIF _email = 'joaoluansanttos@gmail.com' THEN
        _daily_limit := 10;
    ELSE
        _daily_limit := 3;
    END IF;
    
    SELECT COALESCE(du.scripts_count, 0), COALESCE(du.images_count, 0)
    INTO _scripts_count, _images_count
    FROM public.daily_usage du
    WHERE du.user_id = _user_id AND du.usage_date = CURRENT_DATE;
    
    IF NOT FOUND THEN
        _scripts_count := 0;
        _images_count := 0;
    END IF;
    
    IF _is_admin THEN
        RETURN QUERY SELECT 999::integer, 999::integer, true;
    ELSE
        RETURN QUERY SELECT 
            GREATEST(0, _daily_limit - _scripts_count)::integer,
            GREATEST(0, _daily_limit - _images_count)::integer,
            false;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_usage(_user_id uuid, _type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    _is_admin boolean;
    _current_count integer;
    _daily_limit integer;
    _email text;
BEGIN
    _is_admin := public.is_admin(_user_id);
    IF _is_admin THEN
        RETURN true;
    END IF;
    
    SELECT email INTO _email FROM auth.users WHERE id = _user_id;
    
    IF _email = 'joaoluansanttos@gmail.com' THEN
        _daily_limit := 10;
    ELSE
        _daily_limit := 3;
    END IF;
    
    IF _type = 'scripts' THEN
        SELECT COALESCE(scripts_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
    ELSE
        SELECT COALESCE(images_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
    END IF;
    
    IF COALESCE(_current_count, 0) >= _daily_limit THEN
        RETURN false;
    END IF;
    
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
$function$;
