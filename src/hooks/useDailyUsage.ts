import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Wraps a promise with a timeout to prevent infinite hangs */
function withTimeout<T>(promise: any, ms: number, label = 'RPC'): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms)
    ),
  ]);
}

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
  const { user, isLoading: authLoading } = useAuth();
  const [usage, setUsage] = useState<DailyUsage>({ ...DEFAULT_STATE, isLoading: true });

  const fetchUsage = useCallback(async () => {
    if (authLoading) return;
    
    if (!user) {
      setUsage({ ...DEFAULT_STATE, isLoading: false });
      return;
    }

    try {
      const { data, error } = await withTimeout<any>(
        supabase.rpc('get_daily_usage', { _user_id: user.id }),
        5000,
        'get_daily_usage'
      );

      if (error) {
        console.error("Error fetching daily usage:", error);
        setUsage({ ...DEFAULT_STATE, isLoading: false });
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
        setUsage({ ...DEFAULT_STATE, isLoading: false });
      }
    } catch (error) {
      console.error("Error in useDailyUsage:", error);
      setUsage({ ...DEFAULT_STATE, isLoading: false });
    }
  }, [user, authLoading]);

  const incrementUsage = useCallback(async (type: 'scripts' | 'images' | 'personas'): Promise<IncrementResult> => {
    if (!user) {
      return { allowed: true, usedPaid: false };
    }

    try {
      const { data, error } = await withTimeout<any>(
        supabase.rpc('increment_usage', { _user_id: user.id, _type: type }),
        5000,
        'increment_usage'
      );

      if (error) {
        console.error("Error incrementing usage:", error);
        // Fail-open: permite uso se RPC falhar
        return { allowed: true, usedPaid: false };
      }

      fetchUsage();
      
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
  }, [user, fetchUsage]);

  const refundCredit = useCallback(async (type: 'scripts' | 'images' | 'personas', usedPaid: boolean) => {
    if (!user) return;

    try {
      await withTimeout<any>(
        supabase.rpc('refund_credit', { _user_id: user.id, _type: type, _used_paid: usedPaid }),
        5000,
        'refund_credit'
      );
      fetchUsage();
    } catch (error) {
      console.error("Error refunding credit:", error);
    }
  }, [user, fetchUsage]);

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
