import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/lib/utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          5000,
          'ProtectedRoute.getSession'
        );
        
        if (isMounted) {
          if (session) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Auth check error (timeout ou falha):", error);
        if (isMounted) setIsAuthenticated(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        } else if (session) {
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Only redirect if we definitely know they are not authenticated
    if (isAuthenticated === false) {
      navigate("/auth", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  // Show a loading state while checking the session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, render the children
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;