import { Video, Star, Wand2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const GerarVideo = () => {
  const handleOpenLeonardo = () => {
    window.open("https://app.leonardo.ai/auth/login", "_blank");
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Quero o acesso gratuito do Leonardo AI");
    window.open(`https://wa.me/5511991177213?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl px-4 py-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-background" />
          </div>
          <h1 className="text-3xl font-bold mb-3">
            <span translate="no">Gerar Vídeo com{" "}</span>
            <span className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">IA</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Como assinante, você tem acesso gratuito ao <span className="text-tiktok-cyan font-medium">Leonardo AI</span> — a ferramenta de geração de vídeo com IA mais avançada do mercado, normalmente pago.
          </p>
        </div>

        {/* Benefit Card */}
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-card to-card/50 border-tiktok-cyan/30 mb-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-tiktok-pink" />
            </div>

            <h2 className="text-xl font-semibold mb-2">Seu benefício exclusivo</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Seu plano inclui acesso ao <span className="text-tiktok-cyan font-medium">Leonardo AI</span>. Use para gerar vídeos realistas com IA a partir dos seus scripts — sem pagar nada a mais.
            </p>

            <Button
              size="lg"
              onClick={handleOpenLeonardo}
              className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background font-semibold px-8 py-6 text-lg gap-3"
            >
              <Wand2 className="w-5 h-5" />
              Acessar Leonardo AI Gratuitamente
            </Button>
          </div>
        </Card>

        {/* WhatsApp CTA */}
        <Card className="p-5 bg-card/30 border-green-500/30 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Ainda não recebeu seu acesso?</p>
              <p className="text-xs text-muted-foreground">Chame no WhatsApp para receber seu acesso gratuito ao Leonardo AI</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsApp}
              className="border-green-500/40 text-green-400 hover:bg-green-500/10 shrink-0 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chamar
            </Button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-5 bg-card/30 border-border/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-tiktok-cyan/20 flex items-center justify-center text-xs font-bold text-tiktok-cyan">?</span>
            Como funciona
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">1</span>
              Clique no botão acima — seu acesso já está liberado como benefício do seu plano
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">2</span>
              Faça login com sua conta (é grátis)
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">3</span>
              Peça para gerar um vídeo com o script do seu produto
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">4</span>
              Baixe o vídeo e publique no TikTok!
            </li>
          </ol>
        </Card>
      </main>
    </div>
  );
};

export default GerarVideo;
