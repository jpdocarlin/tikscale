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
BEGIN
    _is_admin := public.is_admin(_user_id);
    IF _is_admin THEN
        RETURN true;
    END IF;
    
    IF _type = 'scripts' THEN
        _daily_limit := 3;
        SELECT COALESCE(scripts_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
    ELSIF _type = 'personas' THEN
        _daily_limit := 2;
        SELECT COALESCE(personas_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
    ELSE
        _daily_limit := 5;
        SELECT COALESCE(images_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
    END IF;
    
    IF COALESCE(_current_count, 0) >= _daily_limit THEN
        RETURN false;
    END IF;
    
    INSERT INTO public.daily_usage (user_id, usage_date, scripts_count, images_count, personas_count)
    VALUES (
        _user_id, 
        CURRENT_DATE, 
        CASE WHEN _type = 'scripts' THEN 1 ELSE 0 END,
        CASE WHEN _type = 'images' THEN 1 ELSE 0 END,
        CASE WHEN _type = 'personas' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET
        scripts_count = CASE WHEN _type = 'scripts' THEN daily_usage.scripts_count + 1 ELSE daily_usage.scripts_count END,
        images_count = CASE WHEN _type = 'images' THEN daily_usage.images_count + 1 ELSE daily_usage.images_count END,
        personas_count = CASE WHEN _type = 'personas' THEN daily_usage.personas_count + 1 ELSE daily_usage.personas_count END,
        updated_at = now();
    
    RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_daily_usage(_user_id uuid)
 RETURNS TABLE(scripts_remaining integer, images_remaining integer, personas_remaining integer, is_admin boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    _is_admin boolean;
    _scripts_count integer;
    _images_count integer;
    _personas_count integer;
    _images_limit integer;
    _personas_limit integer;
    _scripts_limit integer;
BEGIN
    _is_admin := public.is_admin(_user_id);

    IF _is_admin THEN
        _scripts_limit := 999;
        _images_limit := 999;
        _personas_limit := 999;
    ELSE
        _scripts_limit := 3;
        _images_limit := 5;
        _personas_limit := 2;
    END IF;

    SELECT COALESCE(du.scripts_count, 0), COALESCE(du.images_count, 0), COALESCE(du.personas_count, 0)
    INTO _scripts_count, _images_count, _personas_count
    FROM public.daily_usage du
    WHERE du.user_id = _user_id AND du.usage_date = CURRENT_DATE;

    IF NOT FOUND THEN
        _scripts_count := 0;
        _images_count := 0;
        _personas_count := 0;
    END IF;

    IF _is_admin THEN
        RETURN QUERY SELECT 999::integer, 999::integer, 999::integer, true;
    ELSE
        RETURN QUERY SELECT 
            GREATEST(0, _scripts_limit - _scripts_count)::integer,
            GREATEST(0, _images_limit - _images_count)::integer,
            GREATEST(0, _personas_limit - _personas_count)::integer,
            false;
    END IF;
END;
$function$;