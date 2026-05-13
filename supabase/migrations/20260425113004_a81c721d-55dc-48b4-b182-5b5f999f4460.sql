-- Drop existing functions to allow return type change
DROP FUNCTION IF EXISTS public.increment_usage(uuid, text);
DROP FUNCTION IF EXISTS public.get_daily_usage(uuid);

-- 1. user_credits table (paid credits, do not reset)
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  paid_credits integer NOT NULL DEFAULT 0,
  total_purchased integer NOT NULL DEFAULT 0,
  total_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
  ON public.user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all credits"
  ON public.user_credits FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update credits"
  ON public.user_credits FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert credits"
  ON public.user_credits FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. credit_transactions log
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'admin_adjustment')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id, created_at DESC);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions"
  ON public.credit_transactions FOR SELECT USING (public.is_admin(auth.uid()));

-- 3. increment_usage now returns jsonb {allowed, used_paid, reason}
CREATE FUNCTION public.increment_usage(_user_id uuid, _type text)
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
        _daily_limit := 3;
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
        _daily_limit := 5;
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

-- 4. get_daily_usage now also returns paid_credits
CREATE FUNCTION public.get_daily_usage(_user_id uuid)
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
            GREATEST(0, 3 - _scripts_count)::integer,
            GREATEST(0, 5 - _images_count)::integer,
            GREATEST(0, 2 - _personas_count)::integer,
            _paid,
            false;
    END IF;
END;
$function$;

-- 5. Refund function
CREATE OR REPLACE FUNCTION public.refund_credit(_user_id uuid, _type text, _used_paid boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF public.is_admin(_user_id) THEN RETURN true; END IF;
    
    IF _used_paid THEN
        UPDATE public.user_credits
        SET paid_credits = paid_credits + 1,
            total_used = GREATEST(0, total_used - 1),
            updated_at = now()
        WHERE user_id = _user_id;
        
        INSERT INTO public.credit_transactions (user_id, amount, type, description)
        VALUES (_user_id, 1, 'refund', 'Reembolso por falha em ' || _type);
    ELSE
        IF _type = 'scripts' THEN
            UPDATE public.daily_usage SET scripts_count = GREATEST(0, scripts_count - 1)
            WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
        ELSIF _type = 'personas' THEN
            UPDATE public.daily_usage SET personas_count = GREATEST(0, personas_count - 1)
            WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
        ELSE
            UPDATE public.daily_usage SET images_count = GREATEST(0, images_count - 1)
            WHERE user_id = _user_id AND usage_date = CURRENT_DATE;
        END IF;
    END IF;
    
    RETURN true;
END;
$function$;

-- 6. Admin function to add paid credits
CREATE OR REPLACE FUNCTION public.add_paid_credits(_user_id uuid, _amount integer, _description text DEFAULT 'Compra de créditos')
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    _new_balance integer;
BEGIN
    IF NOT public.is_admin(auth.uid()) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Não autorizado');
    END IF;
    
    IF _amount <= 0 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Quantidade inválida');
    END IF;
    
    INSERT INTO public.user_credits (user_id, paid_credits, total_purchased)
    VALUES (_user_id, _amount, _amount)
    ON CONFLICT (user_id)
    DO UPDATE SET
        paid_credits = user_credits.paid_credits + _amount,
        total_purchased = user_credits.total_purchased + _amount,
        updated_at = now()
    RETURNING paid_credits INTO _new_balance;
    
    INSERT INTO public.credit_transactions (user_id, amount, type, description)
    VALUES (_user_id, _amount, 'admin_adjustment', _description);
    
    RETURN jsonb_build_object('ok', true, 'new_balance', _new_balance);
END;
$function$;