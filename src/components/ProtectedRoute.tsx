import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if auth loading is done and user is NOT authenticated
    if (!isLoading && !isAuthenticated) {
      navigate("/auth", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show a loading state while checking the session
  if (isLoading) {
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