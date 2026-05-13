CREATE OR REPLACE FUNCTION public.increment_usage(_user_id uuid, _type text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    _is_admin boolean;
    _current_count integer;
    _daily_limit integer;
    _paid_credits integer;
BEGIN
    _is_admin := public.is_admin(_user_id);
    IF _is_admin THEN
        RETURN jsonb_build_object('allowed', true, 'used_paid', false);
    END IF;
    
    IF _type = 'scripts' THEN
        _daily_limit := 10;
        SELECT COALESCE(scripts_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
        
        IF COALESCE(_current_count, 0) >= _daily_limit THEN
            RETURN jsonb_build_object('allowed', false, 'reason', 'daily_limit', 'used_paid', false);
        END IF;
        
        INSERT INTO public.daily_usage (user_id, usage_date, scripts_count)
        VALUES (_user_id, CURRENT_DATE, 1)
        ON CONFLICT (user_id, usage_date)
        DO UPDATE SET scripts_count = daily_usage.scripts_count + 1, updated_at = now();
        
        RETURN jsonb_build_object('allowed', true, 'used_paid', false);
    END IF;
    
    IF _type = 'personas' THEN
        _daily_limit := 2;
        SELECT COALESCE(personas_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
    ELSE
        -- Covers images
        _daily_limit := 10;
        SELECT COALESCE(images_count, 0) INTO _current_count
        FROM public.daily_usage
        WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
    END IF;
    
    IF COALESCE(_current_count, 0) < _daily_limit THEN
        INSERT INTO public.daily_usage (user_id, usage_date, scripts_count, images_count, personas_count)
        VALUES (
            _user_id, CURRENT_DATE, 0,
            CASE WHEN _type = 'images' THEN 1 ELSE 0 END,
            CASE WHEN _type = 'personas' THEN 1 ELSE 0 END
        )
        ON CONFLICT (user_id, usage_date)
        DO UPDATE SET
            images_count = CASE WHEN _type = 'images' THEN daily_usage.images_count + 1 ELSE daily_usage.images_count END,
            personas_count = CASE WHEN _type = 'personas' THEN daily_usage.personas_count + 1 ELSE daily_usage.personas_count END,
            updated_at = now();
        
        RETURN jsonb_build_object('allowed', true, 'used_paid', false);
    END IF;
    
    SELECT COALESCE(paid_credits, 0) INTO _paid_credits
    FROM public.user_credits WHERE user_id = _user_id;
    
    IF COALESCE(_paid_credits, 0) <= 0 THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'no_credits', 'used_paid', false);
    END IF;
    
    UPDATE public.user_credits
    SET paid_credits = paid_credits - 1,
        total_used = total_used + 1,
        updated_at = now()
    WHERE user_id = _user_id;
    
    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (_user_id, -1, 'usage', 'Geração de ' || _type);
    
    RETURN jsonb_build_object('allowed', true, 'used_paid', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_daily_usage(_user_id uuid)
 RETURNS TABLE(scripts_remaining integer, images_remaining integer, personas_remaining integer, paid_credits integer, is_admin boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    _is_admin boolean;
    _scripts_count integer;
    _images_count integer;
    _personas_count integer;
    _paid integer;
BEGIN
    _is_admin := public.is_admin(_user_id);

    SELECT COALESCE(du.scripts_count, 0), COALESCE(du.images_count, 0), COALESCE(du.personas_count, 0)
    INTO _scripts_count, _images_count, _personas_count
    FROM public.daily_usage du
    WHERE du.user_id = _user_id AND du.usage_date = CURRENT_DATE;

    IF NOT FOUND THEN
        _scripts_count := 0; _images_count := 0; _personas_count := 0;
    END IF;

    SELECT COALESCE(uc.paid_credits, 0) INTO _paid
    FROM public.user_credits uc WHERE uc.user_id = _user_id;
    IF _paid IS NULL THEN _paid := 0; END IF;

    IF _is_admin THEN
        RETURN QUERY SELECT 999, 999, 999, 999, true;
    ELSE
        RETURN QUERY SELECT 
            GREATEST(0, 10 - _scripts_count)::integer,
            GREATEST(0, 10 - _images_count)::integer,
            GREATEST(0, 2 - _personas_count)::integer,
            _paid,
            false;
    END IF;
END;
$function$;
