import { useState, useMemo, useRef } from "react";
import { Sparkles, Copy, Check, Search, Filter, Loader2, Wand2, Play, Clock, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { videoProducts } from "@/data/videoProducts";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const categories = ["Todos", "Beleza", "Suplementos", "Eletrônicos", "Casa", "Moda", "Livros"];

const videoTypes = [
  { value: "review", label: "Review", emoji: "📹", description: "Testemunho pessoal" },
  { value: "trend", label: "Trend", emoji: "🔥", description: "Formato viral" },
  { value: "dica", label: "Dica", emoji: "💬", description: "Tom íntimo" },
  { value: "unboxing", label: "Unboxing", emoji: "📦", description: "1ª impressão" },
  { value: "comparacao", label: "Antes/Depois", emoji: "✨", description: "Transformação" },
];

interface GeneratedScript {
  productId: number;
  productName: string;
  videoType: string;
  script: string;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any } }
};

const Scripts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedVideoType, setSelectedVideoType] = useState("review");
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);
  const [generatedScripts, setGeneratedScripts] = useState<Map<string, GeneratedScript>>(new Map());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const scriptRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const filteredProducts = useMemo(() => {
    return videoProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleGenerate = async (productId: number, productName: string, category: string) => {
    setGeneratingFor(productId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const key = `${productId}-${selectedVideoType}`;
      let mockScript = "";
      if (selectedVideoType === "review") {
        mockScript = `Eu não acreditava quando me falaram desse ${productName}, mas olha isso! 😱 Gente, eu testei e o resultado foi surreal. Se você também sofre com isso, corre no link porque tá com desconto!`;
      } else if (selectedVideoType === "trend") {
        mockScript = `POV: Você finalmente achou o ${productName} que todo mundo tá falando no TikTok 👀✨ Não é à toa que viralizou, eu tô chocada com a qualidade!`;
      } else {
        mockScript = `Dica de amiga: pare de gastar dinheiro à toa e invista no ${productName}! Mudou a minha rotina e o melhor é que entrega super rápido. Clica no link e garante o seu! 🛍️`;
      }
      const newScript: GeneratedScript = { productId, productName, videoType: selectedVideoType, script: mockScript };
      setGeneratedScripts(prev => new Map(prev).set(key, newScript));
      setTimeout(() => {
        const ref = scriptRefs.current.get(key);
        ref?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      toast({ title: "Script gerado!", description: "Simulação de script concluída." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao gerar script", variant: "destructive" });
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copiado!", description: "Script copiado para a área de transferência" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const videoTypeLabel = (value: string) => videoTypes.find(v => v.value === value)?.label || value;

  return (
    <div className="min-h-screen">
      <main className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto">

        {/* ── HERO HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center shadow-lg shadow-tiktok-cyan/20">
              <Wand2 className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Scripts <span className="gradient-text">com IA</span>
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground ml-[52px]">Escolha produto e tipo — a IA cria o script perfeito</p>
        </motion.div>

        {/* ── VIDEO TYPE SELECTOR — pill style ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card inner-shine relative overflow-hidden p-4 md:p-5 mb-6"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tipo de vídeo</p>
          <div className="flex flex-wrap gap-2">
            {videoTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedVideoType(type.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300",
                  selectedVideoType === type.value
                    ? "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background shadow-lg shadow-tiktok-cyan/20 scale-[1.02]"
                    : "glass-card text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-base">{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── SEARCH + FILTERS ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 rounded-2xl bg-card/50 border-border/30 backdrop-blur-sm"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── PRODUCTS GRID ── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const key = `${product.id}-${selectedVideoType}`;
            const generatedScript = generatedScripts.get(key);
            const isGenerating = generatingFor === product.id;

            return (
              <motion.div key={product.id} variants={item}>
                <div className="glass-card card-gradient-border inner-shine relative overflow-hidden">
                  {/* Product header */}
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-muted/50 text-muted-foreground">{product.category}</span>
                        <span className="text-[10px] text-muted-foreground">🔥 {product.fires}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={isGenerating}
                      onClick={() => handleGenerate(product.id, product.name, product.category)}
                      className="gap-1.5 rounded-xl bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background btn-glow flex-shrink-0"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="hidden sm:inline text-xs">Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-xs">Gerar</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Generated script area */}
                  {generatedScript && (
                    <div
                      ref={el => scriptRefs.current.set(key, el)}
                      className="border-t border-border/20 p-4 bg-muted/5"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                            {videoTypeLabel(generatedScript.videoType)}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~30s
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(generatedScript.script, key)}
                          className="gap-1.5 h-7 text-xs rounded-lg hover:bg-muted/30"
                        >
                          {copiedKey === key ? (
                            <><Check className="w-3 h-3 text-tiktok-green" /> Copiado</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copiar</>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/85">{generatedScript.script}</p>
                      <div className="mt-2.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {generatedScript.script.split(/\s+/).length} palavras</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card inner-shine p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 animate-mesh opacity-30" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">Nenhum produto encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Tente buscar por outro nome ou mude a categoria
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Scripts;
