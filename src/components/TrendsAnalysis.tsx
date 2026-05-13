import { useState, useMemo } from "react";
import { TrendingUp, Flame, Zap, Eye, Target, Copy, Check, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { videoProducts, type VideoProduct } from "@/data/videoProducts";

interface RadarProduct {
  name: string;
  category: string;
  price: number;
  commission: number;
  growth: number;
  videoCount: number;
  competitionLevel: "baixa" | "média" | "alta";
  image: string;
}

const competitionColor = {
  baixa: "text-green-400 bg-green-500/20 border-green-500/30",
  média: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  alta: "text-red-400 bg-red-500/20 border-red-500/30",
};

const RadarCard = ({ product }: { product: RadarProduct }) => {
  const [copied, setCopied] = useState(false);

  const copyName = () => {
    navigator.clipboard.writeText(product.name);
    setCopied(true);
    toast.success("Nome copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all">
      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{product.name}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${competitionColor[product.competitionLevel]}`}>
            {product.competitionLevel === "baixa" ? "🟢" : product.competitionLevel === "média" ? "🟡" : "🔴"} {product.competitionLevel}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>{product.category}</span>
          <span>R$ {product.price.toFixed(2)}</span>
          <span className="text-primary font-medium">
            R$ {product.commission.toFixed(2)} comissão
          </span>
          <span className="flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3 text-green-400" />
            +{product.growth}%
          </span>
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" />
            {product.videoCount} vídeos
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyName}>
        {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

// Derive radar data from videoProducts
function deriveRadarProduct(p: VideoProduct): RadarProduct {
  const commissionRate = 0.15;
  const commission = Math.round(p.price * commissionRate * 100) / 100;
  const growth = Math.round(p.fires * 1.8 + Math.random() * 20);
  const videoCount = Math.round(p.fires * 12 + Math.random() * 200);
  const competitionLevel: RadarProduct["competitionLevel"] =
    p.fires >= 40 ? "alta" : p.fires >= 25 ? "média" : "baixa";

  return {
    name: p.name,
    category: p.category,
    price: p.price,
    commission,
    growth,
    videoCount,
    competitionLevel,
    image: p.image,
  };
}

export const TrendsAnalysis = () => {
  const radarData = useMemo(() => {
    const all = videoProducts.map(deriveRadarProduct);

    // Crescimento (24h) — highest growth
    const crescimento = [...all].sort((a, b) => b.growth - a.growth).slice(0, 8);

    // Virais — most videos
    const virais = [...all].sort((a, b) => b.videoCount - a.videoCount).slice(0, 8);

    // Melhor Comissão — highest commission
    const comissao = [...all].sort((a, b) => b.commission - a.commission).slice(0, 8);

    // Pouca Concorrência — low competition first, then by growth
    const oportunidade = [...all]
      .filter((p) => p.competitionLevel === "baixa" || p.competitionLevel === "média")
      .sort((a, b) => {
        const order = { baixa: 0, média: 1, alta: 2 };
        return order[a.competitionLevel] - order[b.competitionLevel] || b.growth - a.growth;
      })
      .slice(0, 8);

    return { crescimento, virais, comissao, oportunidade };
  }, []);

  const tabs = [
    { key: "crescimento" as const, label: "Cresceram", icon: <Flame className="h-3 w-3" /> },
    { key: "virais" as const, label: "Virais", icon: <Zap className="h-3 w-3" /> },
    { key: "comissao" as const, label: "Comissão", icon: <TrendingUp className="h-3 w-3" /> },
    { key: "oportunidade" as const, label: "Oportunidade", icon: <Target className="h-3 w-3" /> },
  ];

  return (
    <Card className="bg-card/95 border-border/50 lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Radar de Produtos
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {videoProducts.length} produtos
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">Produtos da ferramenta • Copie o nome para pesquisar</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="crescimento" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="text-xs flex items-center gap-1">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-2 max-h-[350px] overflow-y-auto">
              {radarData[tab.key].map((product, i) => (
                <RadarCard key={i} product={product} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
