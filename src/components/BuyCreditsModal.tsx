import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock } from "lucide-react";

// TODO: substituir pelos links reais de checkout (PerfectPay/etc)
export const LINK_CHECKOUT_50_CREDITOS = "https://checkout.centerpag.com/pay/PPU38CQB2MS";
export const LINK_CHECKOUT_100_CREDITOS = "https://checkout.centerpag.com/pay/PPU38CQB2N0";

interface BuyCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BuyCreditsModal = ({ open, onOpenChange }: BuyCreditsModalProps) => {
  const handleBuy = (link: string) => {
    if (link.startsWith("LINK_")) {
      window.alert("Link de checkout em breve. Fale com o suporte para liberar créditos manualmente.");
      return;
    }
    window.open(link, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border" translate="no">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            <span>Você usou suas gerações de hoje</span>
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground pt-2">
            <span>Quer continuar gerando agora sem esperar amanhã?</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <button
            onClick={() => handleBuy(LINK_CHECKOUT_50_CREDITOS)}
            className="w-full p-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-tiktok-cyan" />
                  <span>Comprar 50 créditos</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1"><span>50 gerações extras</span></p>
              </div>
              <div className="text-xl font-bold"><span>R$ 59,90</span></div>
            </div>
          </button>

          <button
            onClick={() => handleBuy(LINK_CHECKOUT_100_CREDITOS)}
            className="w-full p-4 rounded-lg border-2 border-tiktok-pink bg-tiktok-pink/10 hover:bg-tiktok-pink/20 transition-all text-left relative"
          >
            <div className="absolute -top-2 right-4 bg-tiktok-pink text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              <span>Mais popular</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-tiktok-pink" />
                  <span>Comprar 100 créditos</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1"><span>100 gerações extras</span></p>
              </div>
              <div className="text-xl font-bold"><span>R$ 99,90</span></div>
            </div>
          </button>

          <Button
            variant="ghost"
            className="w-full mt-2"
            onClick={() => onOpenChange(false)}
          >
            <Clock className="w-4 h-4 mr-2" />
            <span>Voltar amanhã grátis</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
