import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserEmail = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (authLoading) return;

    const checkAdmin = async () => {
      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', {
          _user_id: user.id
        });
        
        if (!error && data && isMounted) {
          setIsAdmin(true);
        } else if (isMounted) {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  return { 
    email: user?.email || null, 
    isAdmin, 
    isLoading: authLoading || isLoading 
  };
};
