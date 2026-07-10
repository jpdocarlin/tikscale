import { supabase } from "@/integrations/supabase/client";

/**
 * Obtém um access_token válido.
 *
 * Estratégia (da mais rápida para a mais lenta):
 * 1. getSession() — usa o cache local do Supabase, instantâneo
 * 2. Se o token estiver prestes a expirar (<60s), tenta refreshSession() com timeout
 * 3. Se refreshSession() falhar/timeout, retorna o token cacheado mesmo assim
 *    (tokens JWT duram 1 hora — alguns segundos a menos não importam)
 */
export async function getFreshAccessToken(): Promise<string | null> {
  // 1. Pega a sessão cacheada primeiro — rápido, sem rede
  try {
    const { data: sessionData, error } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (error || !session) {
      console.warn("[getFreshAccessToken] Sem sessão ativa.");
      return null;
    }

    const token = session.access_token;
    const expiresAt = session.expires_at; // Unix timestamp em segundos

    // Se o token ainda tem mais de 60 segundos de vida, usa diretamente
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (expiresAt && expiresAt - nowInSeconds > 60) {
      return token;
    }

    // 2. Token próximo de expirar — tenta refresh com timeout de 5s
    console.log("[getFreshAccessToken] Token próximo de expirar, tentando refresh...");
    try {
      const refreshPromise = supabase.auth.refreshSession();
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 5000)
      );

      const result = await Promise.race([refreshPromise, timeoutPromise]) as any;

      if (result?.data?.session?.access_token) {
        return result.data.session.access_token;
      }
    } catch (e) {
      console.warn("[getFreshAccessToken] refresh falhou, usando token atual:", e);
    }

    // 3. Refresh falhou mas token atual ainda pode ser válido — usa mesmo assim
    return token;
  } catch (e) {
    console.warn("[getFreshAccessToken] getSession falhou:", e);
    return null;
  }
}
