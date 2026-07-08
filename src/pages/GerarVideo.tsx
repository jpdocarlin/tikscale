import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserEmail } from "@/hooks/useUserEmail";
import { Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const GerarVideo = () => {
  const { isAdmin, isLoading } = useUserEmail();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      window.location.href = "https://labs.google/fx/pt/tools/flow";
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center pb-24">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center mb-6 animate-pulse">
        <Video className="w-8 h-8 text-background" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Redirecionando...</h1>
      <p className="text-muted-foreground mb-6">
        Aguarde enquanto preparamos o seu ambiente de criação.
      </p>

      {!isLoading && (
        <Button 
          onClick={() => window.location.href = "https://labs.google/fx/pt/tools/flow"}
          className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background"
        >
          Clique aqui se não for redirecionado <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
};

export default GerarVideo;
