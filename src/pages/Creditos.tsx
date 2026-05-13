import { useEffect, useState } from "react";
import { Sparkles, Check, Zap, Infinity as InfinityIcon, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  LINK_CHECKOUT_50_CREDITOS,
  LINK_CHECKOUT_100_CREDITOS,
} from "@/components/BuyCreditsModal";

interface Pack {
  id: string;
  credits: number;
  price: string;
  pricePerCredit: string;
  link: string;
  highlight?: boolean;
  badge?: string;
  perks: string[];
}

const PACKS: Pack[] = [
  {
    id: "p50",
    credits: 50,
    price: "R$ 59,90",
    pricePerCredit: "R$ 1,20 por geração",
    link: LINK_CHECKOUT_50_CREDITOS,
    perks: [
      "50 gerações de imagem ou persona",
      "Créditos não expiram",
      "Liberação automática após pagamento",
    ],
  },
  {
    id: "p100",
    credits: 100,
    price: "R$ 99,90",
    pricePerCredit: "R$ 1,00 por geração — economize 17%",
    link: LINK_CHECKOUT_100_CREDITOS,
    highlight: true,
    badge: "Mais popular",
    perks: [
      "100 gerações de imagem ou persona",
      "Melhor custo por crédito",
      "Liberação automática após pagamento",
      "Ideal para criadores ativos",
    ],
  },
];

interface Tx {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

export default function Creditos() {
  const [paidCredits, setPaidCredits] = useState<number>(0);
  const [totalPurchased, setTotalPurchased] = useState<number>(0);
  const [totalUsed, setTotalUsed] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: usage } = await supabase.rpc("get_daily_usage", { _user_id: user.id });
        if (usage && usage[0]) {
          setPaidCredits(usage[0].paid_credits || 0);
          setIsAdmin(usage[0].is_admin || false);
        }

        const { data: credits } = await supabase
          .from("user_credits")
          .select("paid_credits, total_purchased, total_used")
          .eq("user_id", user.id)
          .maybeSingle();
        if (credits) {
          setPaidCredits(credits.paid_credits);
          setTotalPurchased(credits.total_purchased);
          setTotalUsed(credits.total_used);
        }

        const { data: tx } = await supabase
          .from("credit_transactions")
          .select("id, amount, type, description, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (tx) setTransactions(tx);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBuy = (link: string) => {
    window.open(link, "_blank");
  };

  return (
    <div className="min-h-screen bg-background" translate="no">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-tiktok-cyan font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Créditos</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            <span>Continue gerando sem esperar amanhã</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            <span>
              Você tem 5 gerações grátis por dia. Quando acabar, use créditos pagos
              para continuar criando imagens e personas sem limite diário.
            </span>
          </p>
        </div>

        {/* Saldo atual */}
        <Card className="p-6 border-border bg-gradient-to-br from-card to-secondary/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                <span>Saldo atual</span>
              </p>
              <div className="flex items-baseline gap-2">
                {isAdmin ? (
                  <>
                    <InfinityIcon className="w-8 h-8 text-tiktok-cyan" />
                    <span className="text-3xl font-bold text-foreground">Ilimitado</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-foreground">{paidCredits}</span>
                    <span className="text-sm text-muted-foreground">créditos</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                <span>Total comprado</span>
              </p>
              <div className="text-2xl font-semibold text-foreground">
                {loading ? "—" : totalPurchased}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                <span>Total usado</span>
              </p>
              <div className="text-2xl font-semibold text-foreground">
                {loading ? "—" : totalUsed}
              </div>
            </div>
          </div>
        </Card>

        {/* Packs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            <span>Escolha seu pacote</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PACKS.map((pack) => (
              <Card
                key={pack.id}
                className={
                  pack.highlight
                    ? "p-6 border-2 border-tiktok-pink bg-tiktok-pink/5 relative"
                    : "p-6 border-border"
                }
              >
                {pack.badge && (
                  <div className="absolute -top-3 left-6 bg-tiktok-pink text-white text-xs px-3 py-1 rounded-full font-semibold">
                    <span>{pack.badge}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles
                    className={
                      pack.highlight
                        ? "w-5 h-5 text-tiktok-pink"
                        : "w-5 h-5 text-tiktok-cyan"
                    }
                  />
                  <h3 className="text-lg font-semibold text-foreground">
                    <span>{pack.credits} créditos</span>
                  </h3>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold text-foreground">{pack.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  <span>{pack.pricePerCredit}</span>
                </p>

                <ul className="space-y-2 mb-6">
                  {pack.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-tiktok-cyan mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/90">{perk}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleBuy(pack.link)}
                  className={
                    pack.highlight
                      ? "w-full bg-tiktok-pink hover:bg-tiktok-pink/90 text-white"
                      : "w-full"
                  }
                  variant={pack.highlight ? "default" : "secondary"}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  <span>Comprar agora</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            <span>
              Pagamento seguro via CenterPag · Pix, cartão e boleto · Créditos liberados
              automaticamente após confirmação
            </span>
          </p>
        </div>

        {/* Como funciona */}
        <Card className="p-6 border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            <span>Como funciona</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="w-8 h-8 rounded-full bg-tiktok-cyan/10 text-tiktok-cyan flex items-center justify-center font-bold mb-2">1</div>
              <p className="font-medium text-foreground mb-1"><span>5 grátis por dia</span></p>
              <p className="text-muted-foreground"><span>Todo dia você ganha 5 gerações de imagem ou persona, sem custo.</span></p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-tiktok-cyan/10 text-tiktok-cyan flex items-center justify-center font-bold mb-2">2</div>
              <p className="font-medium text-foreground mb-1"><span>Créditos pagos não expiram</span></p>
              <p className="text-muted-foreground"><span>Quando as grátis acabarem, cada crédito pago vale 1 geração extra. Eles ficam até você usar.</span></p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-tiktok-cyan/10 text-tiktok-cyan flex items-center justify-center font-bold mb-2">3</div>
              <p className="font-medium text-foreground mb-1"><span>Reembolso automático</span></p>
              <p className="text-muted-foreground"><span>Se a IA falhar, o crédito volta pra sua conta na hora.</span></p>
            </div>
          </div>
        </Card>

        {/* Histórico */}
        {transactions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                <span>Histórico recente</span>
              </h2>
            </div>
            <Card className="border-border divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      <span>{tx.description || tx.type}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div
                    className={
                      tx.amount > 0
                        ? "text-sm font-semibold text-tiktok-cyan"
                        : "text-sm font-semibold text-muted-foreground"
                    }
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
