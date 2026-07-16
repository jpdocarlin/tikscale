import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { setGlobalAccessToken } from "@/lib/getFreshAccessToken";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Helper to resolve session and update states
    const handleSession = (currentSession: Session | null) => {
      if (!isMounted) return;
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      const token = currentSession?.access_token ?? null;
      setAccessToken(token);
      
      // Immediately update the getFreshAccessToken cache (with expiry info)
      setGlobalAccessToken(token, currentSession?.expires_at ?? null);
    };

    // Quando a aba volta ao foco, força um refresh da sessão.
    // Com o inMemoryLock no client.ts, isso é seguro: o lock serializa
    // este refresh com o autoRefreshToken do Supabase, evitando que
    // dois refreshes consumam o mesmo refresh_token simultaneamente.
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      
      console.log("[AuthContext] Aba voltou a ficar visível, revalidando sessão...");
      try {
        // refreshSession() vai pelo lock e renova o token se necessário.
        // Se o autoRefreshToken já tiver renovado, o SDK retorna a sessão
        // atualizada sem fazer outra chamada ao servidor.
        const { data } = await supabase.auth.refreshSession();
        if (data.session) {
          handleSession(data.session);
        }
      } catch (error) {
        console.error("[AuthContext] Erro ao revalidar sessão:", error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const initializeAuth = async () => {
      try {
        // Wrap getSession with a timeout of 5 seconds to prevent hanging on load
        const getSessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 5000)
        );

        const result = await Promise.race([getSessionPromise, timeoutPromise]) as any;

        if (result === null) {
          console.warn("[AuthContext] getSession timed out after 5s.");
        } else {
          handleSession(result?.data?.session ?? null);
        }
      } catch (error) {
        console.error("[AuthContext] Error getting initial session:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes, including autoRefreshToken events like TOKEN_REFRESHED
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("[AuthContext] onAuthStateChange event:", event);
      
      handleSession(currentSession);
      
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const value = {
    session,
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
