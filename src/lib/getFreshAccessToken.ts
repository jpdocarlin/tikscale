import { supabase } from "@/integrations/supabase/client";

/**
 * Obtém um access_token fresco para uso em chamadas de API.
 *
 * `supabase.auth.getSession()` retorna a sessão cacheada do localStorage,
 * cujo JWT pode estar expirado. Isso causa falhas 401 nas Edge Functions e
 * obriga o usuário a dar refresh na página antes de gerar imagens.
 *
 * A solução é sempre tentar `refreshSession()` primeiro para obter um token
 * novo, e só usar o cache como fallback.
 */
export async function getFreshAccessToken(): Promise<string | null> {
  // 1. Tenta obter um token fresco via refresh
  try {
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession();

    if (!refreshError && refreshData?.session?.access_token) {
      return refreshData.session.access_token;
    }
  } catch (e) {
    console.warn("[getFreshAccessToken] refreshSession failed:", e);
  }

  // 2. Fallback: usa o token cacheado (pode funcionar se o refresh falhou
  //    por razões de rede, mas o token ainda estiver válido)
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
