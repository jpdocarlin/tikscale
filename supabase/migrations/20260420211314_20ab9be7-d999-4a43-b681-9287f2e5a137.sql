
DROP FUNCTION IF EXISTS public.get_daily_usage(uuid);

CREATE FUNCTION public.get_daily_usage(_user_id uuid)
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
    _email text;
BEGIN
    _is_admin := public.is_admin(_user_id);
    SELECT email INTO _email FROM auth.users WHERE id = _user_id;

    IF _is_admin THEN
        _scripts_limit := 999;
        _images_limit := 999;
        _personas_limit := 999;
    ELSIF _email = 'joaoluansanttos@gmail.com' THEN
        _scripts_limit := 10;
        _images_limit := 10;
        _personas_limit := 2;
    ELSE
        _scripts_limit := 3;
        _images_limit := 10;
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
