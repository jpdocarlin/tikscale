import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DailyUsage {
  scriptsRemaining: number;
  imagesRemaining: number;
  personasRemaining: number;
  paidCredits: number;
  isAdmin: boolean;
  isLoading: boolean;
}

export interface IncrementResult {
  allowed: boolean;
  usedPaid: boolean;
  reason?: 'daily_limit' | 'no_credits';
}

const DEFAULT_STATE: DailyUsage = {
  scriptsRemaining: 10,
  imagesRemaining: 10,
  personasRemaining: 2,
  paidCredits: 0,
  isAdmin: false,
  isLoading: false,
};

export const useDailyUsage = () => {
  const [usage, setUsage] = useState<DailyUsage>({ ...DEFAULT_STATE, isLoading: true });

  const fetchUsage = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.refreshSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setUsage({ ...DEFAULT_STATE });
        return;
      }

      const { data, error } = await supabase.rpc('get_daily_usage', {
        _user_id: user.id
      });

      if (error) {
        console.error("Error fetching daily usage:", error);
        setUsage({ ...DEFAULT_STATE });
        return;
      }

      if (data && data.length > 0) {
        const row = data[0] as any;
        setUsage({
          scriptsRemaining: row.scripts_remaining ?? 3,
          imagesRemaining: row.images_remaining ?? 5,
          personasRemaining: row.personas_remaining ?? 2,
          paidCredits: row.paid_credits ?? 0,
          isAdmin: row.is_admin ?? false,
          isLoading: false,
        });
      } else {
        setUsage({ ...DEFAULT_STATE });
      }
    } catch (error) {
      console.error("Error in useDailyUsage:", error);
      setUsage({ ...DEFAULT_STATE });
    }
  }, []);

  const incrementUsage = useCallback(async (type: 'scripts' | 'images' | 'personas'): Promise<IncrementResult> => {
    try {
      const { data: sessionData } = await supabase.auth.refreshSession();
      const user = sessionData?.session?.user;
      
      if (!user) {
        return { allowed: true, usedPaid: false };
      }

      const { data, error } = await supabase.rpc('increment_usage', {
        _user_id: user.id,
        _type: type
      });

      if (error) {
        console.error("Error incrementing usage:", error);
        // Fail-open: permite uso se RPC falhar
        return { allowed: true, usedPaid: false };
      }

      await fetchUsage();
      
      const result = data as any;
      return {
        allowed: result?.allowed ?? true,
        usedPaid: result?.used_paid ?? false,
        reason: result?.reason,
      };
    } catch (error) {
      console.error("Error in incrementUsage:", error);
      return { allowed: true, usedPaid: false };
    }
  }, [fetchUsage]);

  const refundCredit = useCallback(async (type: 'scripts' | 'images' | 'personas', usedPaid: boolean) => {
    try {
      const { data: sessionData } = await supabase.auth.refreshSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      await supabase.rpc('refund_credit', {
        _user_id: user.id,
        _type: type,
        _used_paid: usedPaid,
      });
      await fetchUsage();
    } catch (error) {
      console.error("Error refunding credit:", error);
    }
  }, [fetchUsage]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    ...usage,
    refreshUsage: fetchUsage,
    incrementUsage,
    refundCredit,
  };
};
