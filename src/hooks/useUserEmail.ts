import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserEmail = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          if (isMounted) {
            setEmail(session.user.email || null);
          }
          
          // Check if user is admin
          const { data, error } = await supabase.rpc('is_admin', {
            _user_id: session.user.id
          });
          
          if (!error && data && isMounted) {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          if (isMounted) {
            setEmail(session.user.email || null);
          }
          const { data } = await supabase.rpc('is_admin', {
            _user_id: session.user.id
          });
          if (data && isMounted) {
            setIsAdmin(true);
          } else if (isMounted) {
            setIsAdmin(false);
          }
        } else {
          if (isMounted) {
            setEmail(null);
            setIsAdmin(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { email, isAdmin, isLoading };
};
