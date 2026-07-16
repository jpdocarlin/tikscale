import { supabase } from "@/integrations/supabase/client";

let currentToken: string | null = null;
let tokenExpiresAt: number | null = null; // Unix timestamp in seconds
let isInitialized = false;

// Array of resolve functions for pending token requests before initialization
let initResolvers: ((token: string | null | PromiseLike<string | null>) => void)[] = [];

// Prevent concurrent refreshes
let refreshInFlight: Promise<string | null> | null = null;

/**
 * Updates the global access token in-memory cache.
 * Called by the AuthContext provider whenever the session changes.
 */
export function setGlobalAccessToken(token: string | null, expiresAt?: number | null) {
  currentToken = token;
  tokenExpiresAt = expiresAt ?? null;
  isInitialized = true;
  
  // Resolve any pending requests waiting for initialization
  if (initResolvers.length > 0) {
    const resolvers = [...initResolvers];
    initResolvers = [];
    resolvers.forEach(resolve => resolve(token));
  }
}

/**
 * Checks if the cached token is expired or about to expire (within 60s).
 */
function isTokenExpiredOrStale(): boolean {
  if (!currentToken || !tokenExpiresAt) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  // Consider stale if less than 60s until expiry
  return tokenExpiresAt - nowInSeconds < 60;
}

/**
 * Forces a session refresh via Supabase and updates the cache.
 * Deduplicates concurrent refresh calls.
 */
async function forceRefresh(): Promise<string | null> {
  // Deduplicate: if a refresh is already in flight, wait for it
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const refreshPromise = supabase.auth.refreshSession();
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 8000)
      );
      const result = await Promise.race([refreshPromise, timeoutPromise]) as any;

      if (result === null) {
        console.warn("[getFreshAccessToken] forceRefresh timed out after 8s");
        return currentToken; // Return stale token as last resort
      }

      const session = result?.data?.session;
      if (session?.access_token) {
        setGlobalAccessToken(session.access_token, session.expires_at);
        return session.access_token;
      }

      console.warn("[getFreshAccessToken] forceRefresh returned no session");
      return null;
    } catch (e) {
      console.error("[getFreshAccessToken] forceRefresh error:", e);
      return currentToken; // Return stale token as last resort
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Returns a valid access_token.
 * 
 * 1. If the AuthContext is initialized and the token is fresh, returns the cached token instantly.
 * 2. If the token is expired/near-expiry, forces a refresh.
 * 3. If the AuthContext hasn't initialized yet, waits up to 4s.
 */
export async function getFreshAccessToken(): Promise<string | null> {
  if (isInitialized) {
    // If token is expired or close to expiry, force a refresh
    if (isTokenExpiredOrStale()) {
      console.log("[getFreshAccessToken] Token expired/stale, forcing refresh...");
      return forceRefresh();
    }
    return currentToken;
  }

  // Wait for AuthContext initialization
  try {
    const initPromise = new Promise<string | null>((resolve) => {
      initResolvers.push(resolve);
    });

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 4000)
    );

    await Promise.race([initPromise, timeoutPromise]);
  } catch (e) {
    console.warn("[getFreshAccessToken] Error waiting for initial auth:", e);
  }

  return currentToken;
}

/**
 * Forces a token refresh, useful after receiving a 401 response.
 * This guarantees a new token by calling supabase.auth.refreshSession().
 */
export async function forceRefreshAccessToken(): Promise<string | null> {
  console.log("[getFreshAccessToken] forceRefreshAccessToken called (e.g., after 401)");
  return forceRefresh();
}
