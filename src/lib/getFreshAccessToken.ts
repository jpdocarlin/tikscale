import { supabase } from "@/integrations/supabase/client";

/**
 * Obtém um access_token fresco com timeout de 3 segundos
 * para evitar travamentos infinitos do supabase.auth.refreshSession()
 */
export async function getFreshAccessToken(): Promise<string | null> {
  try {
    const refreshPromise = supabase.auth.refreshSession();
    
    // Timeout manual de 3 segundos para o refreshSession
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Refresh Timeout")), 3000);
    });

    const refreshResult = await Promise.race([refreshPromise, timeoutPromise]) as any;

    if (!refreshResult.error && refreshResult?.data?.session?.access_token) {
      return refreshResult.data.session.access_token;
    }
  } catch (e) {
    console.warn("[getFreshAccessToken] refreshSession falhou ou deu timeout:", e);
  }

  // 2. Fallback: usa o token cacheado
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.access_token) {
      return sessionData.session.access_token;
    }
  } catch (e) {
    console.warn("[getFreshAccessToken] getSession failed:", e);
  }

  return null;
}
