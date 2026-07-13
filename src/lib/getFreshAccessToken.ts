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
  try {
    // 1. Tenta obter a sessão em cache — COM timeout, pra nunca travar pra sempre
    let session: any = null;
    try {
      const getSessionPromise = supabase.auth.getSession();
      const getSessionTimeout = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 5000)
      );
      const sessionResult = await Promise.race([getSessionPromise, getSessionTimeout]) as any;

      if (sessionResult === null) {
        console.warn("[getFreshAccessToken] getSession() travou (timeout de 5s). Tentando refresh direto...");
      } else {
        session = sessionResult?.data?.session ?? null;
      }
    } catch (e) {
      console.warn("[getFreshAccessToken] getSession falhou:", e);
    }

    if (session?.access_token) {
      const token = session.access_token;
      const expiresAt = session.expires_at;
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (expiresAt && expiresAt - nowInSeconds > 60) {
        return token;
      }
    }

    console.log("[getFreshAccessToken] Sessão ausente, expirada ou próxima do vencimento. Tentando atualizar...");
    try {
      const refreshPromise = supabase.auth.refreshSession();
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 8000)
      );
      const result = await Promise.race([refreshPromise, timeoutPromise]) as any;
      if (result?.data?.session?.access_token) {
        return result.data.session.access_token;
      }
    } catch (e) {
      console.warn("[getFreshAccessToken] refresh falhou:", e);
    }

    if (session?.access_token) {
      console.warn("[getFreshAccessToken] Usando token antigo como fallback.");
      return session.access_token;
    }

    console.warn("[getFreshAccessToken] Sem sessão ativa.");
    return null;
  } catch (e) {
    console.warn("[getFreshAccessToken] getSession falhou:", e);
    return null;
  }
}
