import { useState, useMemo } from "react";
import { Sparkles, ShoppingBag, Copy, Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { hotProducts, scalingProducts, trendingProducts, highCommissionProducts } from "@/data/products";

const niches = [
  { id: "beleza", label: "Beleza", icon: "💄" },
  { id: "suplementos", label: "Suplementos", icon: "💪" },
  { id: "casa", label: "Casa", icon: "🏠" },
  { id: "eletronicos", label: "Eletrônicos", icon: "📱" },
  { id: "moda", label: "Moda", icon: "👗" },
  { id: "livros", label: "Livros", icon: "📚" },
];

const tips = [
  "Faça um vídeo de unboxing mostrando a qualidade",
  "Mostre o antes e depois de usar o produto",
  "Crie um tutorial de como usar no dia a dia",
  "Faça um comparativo com produtos similares",
  "Grave uma rotina usando o produto",
  "Mostre os resultados após 7 dias de uso",
  "Faça um review honesto destacando os prós",
  "Crie um ASMR com o produto",
];

interface Suggestion {
  name: string;
  reason: string;
  tip: string;
  product: {
    price: number;
    commission: number;
    affiliateLink: string;
  };
}

export const ProductSuggestions = () => {
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const allProducts = useMemo(
    () => [...hotProducts, ...scalingProducts, ...trendingProducts, ...highCommissionProducts],
    []
  );

  const suggestions: Suggestion[] = useMemo(() => {
    if (!selectedNiche) return [];

    const nicheProducts = allProducts.filter(
      (p) => p.category.toLowerCase() === selectedNiche.toLowerCase()
    );

    // Remove duplicates by name and pick up to 5
    const unique = nicheProducts.filter(
      (p, i, arr) => arr.findIndex((x) => x.name === p.name) === i
    ).slice(0, 5);

    return unique.map((p, i) => ({
      name: p.name,
      reason: `Produto popular na categoria ${p.category} com R$ ${p.commission.toFixed(2)} de comissão`,
      tip: tips[i % tips.length],
      product: {
        price: p.price,
        commission: p.commission,
        affiliateLink: p.affiliateLink,
      },
    }));
  }, [selectedNiche, allProducts]);

  const copyLink = (link: string, index: number) => {
    navigator.clipboard.writeText(link);
    setCopiedIndex(index);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-tiktok-green" />
          Sugestões de Produtos por Nicho
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Niche Selection */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {niches.map((niche) => (
            <Button
              key={niche.id}
              variant={selectedNiche === niche.id ? "default" : "outline"}
              className={`text-xs h-auto py-2 flex flex-col items-center gap-1 ${
                selectedNiche === niche.id ? "bg-tiktok-green text-black" : ""
              }`}
              onClick={() => setSelectedNiche(niche.id)}
            >
              <span className="text-lg">{niche.icon}</span>
              <span>{niche.label}</span>
            </Button>
          ))}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-card/50 border border-border/50 hover:border-tiktok-green/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="h-4 w-4 text-tiktok-green" />
                      <span className="font-medium text-sm">{suggestion.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {suggestion.reason}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-tiktok-green/10 text-tiktok-green border-tiktok-green/30">
                        💡 {suggestion.tip}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>R$ {suggestion.product.price.toFixed(2)}</span>
                      <span className="text-tiktok-green font-medium">
                        R$ {suggestion.product.commission.toFixed(2)} comissão
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyLink(suggestion.product.affiliateLink, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-tiktok-green" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a href={suggestion.product.affiliateLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {suggestions.length === 0 && !selectedNiche && (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Selecione um nicho para ver sugestões</p>
          </div>
        )}

        {/* No products for niche */}
        {suggestions.length === 0 && selectedNiche && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nenhum produto encontrado para este nicho</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
