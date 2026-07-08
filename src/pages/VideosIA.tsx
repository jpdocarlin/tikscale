import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Package, User, Sliders, Home, Camera, Sun, Dumbbell, 
  UtensilsCrossed, MoreHorizontal, Smartphone, Square, RectangleVertical,
  RectangleHorizontal, Upload, Hand, Check, Loader2, Download, RefreshCw,
  Lightbulb, Shirt, Briefcase, Trophy, Star, Heart, Search, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getFreshAccessToken } from "@/lib/getFreshAccessToken";
import { sortedProducts, productCategories, VideoProduct } from "@/data/videoProducts";

// Import avatars
import avatarBernardo from "@/assets/avatars/bernardo.jpg";
import avatarBrenda from "@/assets/avatars/brenda.jpg";
import avatarEduardo from "@/assets/avatars/eduardo.jpg";
import avatarFatima from "@/assets/avatars/fatima.jpg";
import avatarMarina from "@/assets/avatars/marina.jpg";
import avatarPaulo from "@/assets/avatars/paulo.jpg";
import avatarPedro from "@/assets/avatars/pedro.jpg";
import avatarSofia from "@/assets/avatars/sofia.jpg";

const influencers = [
  { id: "bernardo", name: "Bernardo", avatar: avatarBernardo, description: "young Brazilian man, age 28, with purple cap, light stubble beard" },
  { id: "brenda", name: "Brenda", avatar: avatarBrenda, description: "young Brazilian woman, age 25, blonde hair in bun, elegant" },
  { id: "eduardo", name: "Eduardo", avatar: avatarEduardo, description: "young Black Brazilian man, age 27, athletic, confident smile" },
  { id: "fatima", name: "Fátima", avatar: avatarFatima, description: "elegant older Brazilian woman, age 58, silver gray hair, sophisticated" },
  { id: "marina", name: "Marina", avatar: avatarMarina, description: "young Brazilian woman, age 24, long red auburn hair, freckles" },
  { id: "paulo", name: "Paulo", avatar: avatarPaulo, description: "mature Brazilian man, age 52, salt and pepper gray hair, sophisticated" },
  { id: "pedro", name: "Pedro", avatar: avatarPedro, description: "young Brazilian man, age 26, curly dark hair, short beard, handsome" },
  { id: "sofia", name: "Sofia", avatar: avatarSofia, description: "young Black Brazilian woman, age 26, long braided hair, elegant" },
];

const poses = [
  { id: "frontal", name: "De Frente", description: "Mostrando o produto de frente para a câmera", icon: User },
  { id: "selfie", name: "Selfie", description: "Estilo selfie segurando o produto", icon: Smartphone },
  { id: "hands", name: "Mãos", description: "Apenas as mãos segurando o produto (1ª pessoa)", icon: Hand },
];

const environments = [
  { id: "casa", name: "Casa", icon: Home },
  { id: "estudio", name: "Estúdio", icon: Camera },
  { id: "ar-livre", name: "Ao ar livre", icon: Sun },
  { id: "academia", name: "Academia", icon: Dumbbell },
  { id: "cozinha", name: "Cozinha", icon: UtensilsCrossed },
  { id: "outros", name: "Outros", icon: MoreHorizontal },
];

const styles = [
  { id: "casual", name: "Casual", icon: Shirt, emoji: "👕" },
  { id: "profissional", name: "Profissional", icon: Briefcase, emoji: "💼" },
  { id: "esportivo", name: "Esportivo", icon: Trophy, emoji: "🏃" },
  { id: "glamouroso", name: "Glamouroso", icon: Star, emoji: "✨" },
  { id: "minimalista", name: "Minimalista", icon: Heart, emoji: "🖤" },
];

const enhancements = [
  { id: "pele-realista", name: "Pele Ultra Realista", emoji: "💅" },
  { id: "iluminacao-natural", name: "Iluminação Natural", emoji: "☀️" },
  { id: "realismo-detalhamento", name: "Realismo e Detalhamento", emoji: "🔍" },
  { id: "cores-vibrantes", name: "Cores Vibrantes", emoji: "🎨" },
  { id: "profundidade-campo", name: "Profundidade de Campo", emoji: "📸" },
  { id: "maos-perfeitas", name: "Mãos Perfeitas", emoji: "👐" },
];

const aspectRatios = [
  { id: "9:16", name: "Vertical", ratio: "9:16", description: "TikTok, Reels, Stories", icon: Smartphone },
  { id: "1:1", name: "Quadrado", ratio: "1:1", description: "Feed Instagram", icon: Square },
  { id: "3:4", name: "Retrato", ratio: "3:4", description: "Pinterest, Posts", icon: RectangleVertical },
  { id: "16:9", name: "Horizontal", ratio: "16:9", description: "YouTube, Thumbnails", icon: RectangleHorizontal },
];

const tips = [
  "Escolha um avatar que combine com seu público",
  'Pose "Selfie" ideal para beleza e tech',
  'Pose "Mãos" para close-ups de produtos',
  "Use descrições personalizadas para detalhes específicos",
];

const VideosIA = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Selection states
  const [productTab, setProductTab] = useState<"viral" | "upload">("viral");
  const [selectedProduct, setSelectedProduct] = useState<VideoProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [influencerTab, setInfluencerTab] = useState<"avatars" | "upload">("avatars");
  const [selectedInfluencer, setSelectedInfluencer] = useState<typeof influencers[0] | null>(null);
  const [selectedPose, setSelectedPose] = useState("frontal");
  const [customPose, setCustomPose] = useState("");
  const [selectedEnvironment, setSelectedEnvironment] = useState("casa");
  const [customEnvironment, setCustomEnvironment] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("casual");
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>(["realismo-detalhamento"]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("9:16");
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDisplayError, setImageDisplayError] = useState<string | null>(null);
  
  // Prevent duplicate error toasts on image load failure
  const imageErrorShownRef = useRef(false);

  // Async safety: prevent state updates after unmount / stale generations
  const isMountedRef = useRef(true);
  const activeRequestControllerRef = useRef<AbortController | null>(null);
  const generationIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      activeRequestControllerRef.current?.abort();
    };
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = sortedProducts;
    
    if (selectedCategory !== "Todos") {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }
    
    return result;
  }, [selectedCategory, searchQuery]);

  const toggleEnhancement = (id: string) => {
    setSelectedEnhancements(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  // Helper function to convert image to base64
  const imageToBase64 = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg", 0.9);
        resolve(base64);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageUrl;
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedProduct) {
      toast({
        title: "Selecione um produto",
        description: "Escolha um produto para gerar a imagem",
        variant: "destructive",
      });
      return;
    }

    if (!selectedInfluencer) {
      toast({
        title: "Selecione um influencer",
        description: "Escolha um avatar para a imagem",
        variant: "destructive",
      });
      return;
    }

    const generationId = ++generationIdRef.current;
    setIsGenerating(true);
    setGeneratedImage(null);
    setImageDisplayError(null);
    imageErrorShownRef.current = false;

    const safe = (fn: () => void) => {
      if (!isMountedRef.current) return;
      if (generationIdRef.current !== generationId) return;
      fn();
    };

    // Retry logic for mobile resilience
    const maxRetries = 3;
    let lastError: string = "";

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[VideosIA] Attempt ${attempt}/${maxRetries}`);

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
        const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
        if (!supabaseUrl || !publishableKey) {
          throw new Error(
            "Configuração do backend ausente. Recarregue a página (Ctrl+F5) e tente novamente."
          );
        }
        const functionUrl = `${supabaseUrl}/functions/v1/generate-ugc-image`;
        console.log("[VideosIA] Function URL:", functionUrl);
        
        const accessToken = await getFreshAccessToken();

        if (!accessToken) {
          toast({
            title: "Sessão expirada",
            description: "Faça login novamente",
            variant: "destructive",
          });
          safe(() => setIsGenerating(false));
          return;
        }

        // Convert product image to base64
        let productImageBase64: string | undefined;
        try {
          productImageBase64 = await imageToBase64(selectedProduct.image);
          console.log("[VideosIA] Product image converted to base64");
        } catch (imgError) {
          console.warn("[VideosIA] Could not convert product image to base64:", imgError);
        }

        // Call function with explicit token + timeout
        const controller = new AbortController();
        activeRequestControllerRef.current = controller;
        const timeoutId = window.setTimeout(() => controller.abort(), 120_000);

        const payload = {
          productName: selectedProduct.name,
          productImageUrl: productImageBase64,
          influencer: {
            name: selectedInfluencer.name,
            description: selectedInfluencer.description,
          },
          pose: selectedPose,
          customPose: customPose.trim() || undefined,
          environment: selectedEnvironment,
          customEnvironment: customEnvironment.trim() || undefined,
          style: selectedStyle,
          enhancements: selectedEnhancements,
          aspectRatio: selectedAspectRatio,
          additionalInfo: additionalInfo.trim() || undefined,
        };

        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: publishableKey,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }).finally(() => {
          window.clearTimeout(timeoutId);
          // Only clear if it's still the same controller
          if (activeRequestControllerRef.current === controller) {
            activeRequestControllerRef.current = null;
          }
        });

        // Handle specific error codes
        if (response.status === 401) {
          console.log("[VideosIA] 401 - will refresh and retry");
          lastError = "Sessão inválida";
          if (attempt === maxRetries) throw new Error(lastError);
          continue;
        }

        if (response.status === 429) {
          toast({
            title: "Muitas requisições",
            description: "Aguarde 30 segundos e tente novamente",
            variant: "destructive",
          });
          safe(() => setIsGenerating(false));
          return;
        }

        if (response.status === 402) {
          // Log full response for debugging
          const errorBody = await response.text();
          console.error("[VideosIA] 402 Error body:", errorBody);
          toast({
            title: "Erro de créditos",
            description: "Erro 402 - verifique os logs do console para mais detalhes",
            variant: "destructive",
          });
          safe(() => setIsGenerating(false));
          return;
        }

        // Read response robustly (sometimes platforms return HTML/text on errors)
        const contentType = response.headers.get("content-type") || "";
        const rawText = await response.text();
        console.log("[VideosIA] Response status:", response.status, "content-type:", contentType);

        if (!response.ok) {
          let message = `Erro ${response.status}`;
          try {
            const maybeJson = rawText ? JSON.parse(rawText) : null;
            message = maybeJson?.error || maybeJson?.message || message;
          } catch {
            // Keep message fallback
            if (rawText?.trim()) message = `${message}: ${rawText.slice(0, 160)}`;
          }
          throw new Error(message);
        }

        let data: any = null;
        try {
          data = rawText ? JSON.parse(rawText) : null;
        } catch (parseError) {
          console.error("[VideosIA] Failed to parse JSON response:", parseError);
          console.error("[VideosIA] Raw response (first 300 chars):", rawText?.slice(0, 300));
          throw new Error("Resposta inválida do servidor (não é JSON)");
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        if (data?.imageUrl) {
          console.log("[VideosIA] Image URL received, length:", data.imageUrl.length, "starts with:", data.imageUrl.substring(0, 50));
          // Reset error flag before setting new image
          imageErrorShownRef.current = false;
          safe(() => setGeneratedImage(data.imageUrl));
          toast({
            title: "Imagem gerada!",
            description: "Sua imagem UGC está pronta",
          });
          safe(() => setIsGenerating(false));
          return; // Success!
        } else {
          console.error("[VideosIA] No imageUrl in response:", JSON.stringify(data));
          throw new Error("Nenhuma imagem gerada");
        }
      } catch (err) {
        console.error(`[VideosIA] Attempt ${attempt} failed:`, err);
        lastError = err instanceof Error ? err.message : "Erro desconhecido";
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    }

    // All retries failed
    toast({
      title: "Erro ao gerar",
      description: lastError,
      variant: "destructive",
    });
    safe(() => setIsGenerating(false));
  }, [selectedProduct, selectedInfluencer, selectedPose, customPose, selectedEnvironment, customEnvironment, selectedStyle, selectedEnhancements, selectedAspectRatio, additionalInfo, toast]);

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `ugc-${selectedProduct?.name || "image"}-${Date.now()}.png`;
    // Avoid touching document.body (can conflict with portal-based UIs)
    link.rel = "noopener";
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="min-h-screen bg-background" translate="no">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Influencer <span className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">IA</span>
            </h1>
            <p className="text-muted-foreground text-sm">Crie imagens e vídeos UGC ultra-realistas</p>
          </div>
        </div>

        {/* Step 1: Choose Product */}
        <Card className="mb-6 p-4 sm:p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-tiktok-cyan/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-tiktok-cyan" />
            </div>
            <h2 className="text-lg font-semibold">1. Escolha o Produto</h2>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant={productTab === "viral" ? "default" : "outline"}
              onClick={() => setProductTab("viral")}
              className={cn(
                "flex-1 gap-2",
                productTab === "viral" && "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90"
              )}
            >
              <Package className="w-4 h-4" />
              Produtos Virais
            </Button>
            <Button
              variant={productTab === "upload" ? "default" : "outline"}
              onClick={() => setProductTab("upload")}
              className="flex-1 gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>

          {productTab === "viral" && (
            <>
              {/* Search and Categories */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {productCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        selectedCategory === cat
                          ? "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={cn(
                      "cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                      selectedProduct?.id === product.id
                        ? "border-tiktok-cyan ring-2 ring-tiktok-cyan/30"
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    <div className="aspect-square bg-muted/30 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedProduct?.id === product.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-tiktok-cyan flex items-center justify-center">
                          <Check className="w-4 h-4 text-background" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-tiktok-pink font-semibold">
                          R$ {product.price.toFixed(0)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          🔥 {product.fires}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Nenhum produto encontrado
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                {filteredProducts.length} produtos disponíveis
              </p>
            </>
          )}

          {productTab === "upload" && (
            <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Arraste uma imagem ou clique para fazer upload</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Em breve</p>
            </div>
          )}
        </Card>

        {/* Step 2: Choose Influencer */}
        <Card className="mb-6 p-4 sm:p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-tiktok-pink/20 flex items-center justify-center">
              <User className="w-4 h-4 text-tiktok-pink" />
            </div>
            <h2 className="text-lg font-semibold">2. Escolha o Influencer</h2>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant={influencerTab === "avatars" ? "default" : "outline"}
              onClick={() => setInfluencerTab("avatars")}
              className={cn(
                "flex-1 gap-2",
                influencerTab === "avatars" && "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90"
              )}
            >
              <User className="w-4 h-4" />
              Avatares Prontos
            </Button>
            <Button
              variant={influencerTab === "upload" ? "default" : "outline"}
              onClick={() => setInfluencerTab("upload")}
              className="flex-1 gap-2"
            >
              <Camera className="w-4 h-4" />
              Upload
            </Button>
          </div>

          {influencerTab === "avatars" && (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
              {influencers.map((influencer) => (
                <button
                  type="button"
                  key={influencer.id}
                  onClick={() => setSelectedInfluencer(influencer)}
                  className="cursor-pointer text-center bg-transparent border-none p-0"
                >
                  <div
                    className={cn(
                      "w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden border-[3px] transition-all pointer-events-none",
                      selectedInfluencer?.id === influencer.id
                        ? "border-tiktok-pink ring-2 ring-tiktok-pink/30"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img
                      src={influencer.avatar}
                      alt={influencer.name}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                  <p className="text-xs mt-2 font-medium pointer-events-none">{influencer.name}</p>
                </button>
              ))}
            </div>
          )}

          {influencerTab === "upload" && (
            <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Faça upload do seu próprio avatar</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Em breve</p>
            </div>
          )}
        </Card>

        {/* Step 3: Configure Image */}
        <Card className="mb-6 p-4 sm:p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-tiktok-cyan/20 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-tiktok-cyan" />
            </div>
            <h2 className="text-lg font-semibold">3. Configure a Imagem</h2>
          </div>

          {/* Pose */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">Pose</label>
            <div className="grid grid-cols-3 gap-3">
              {poses.map((pose) => (
                <div
                  key={pose.id}
                  onClick={() => setSelectedPose(pose.id)}
                  className={cn(
                    "cursor-pointer rounded-lg p-4 text-center border-2 transition-all",
                    selectedPose === pose.id
                      ? "border-tiktok-cyan bg-tiktok-cyan/10"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-2">
                    <pose.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{pose.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pose.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Pose */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
              ✏️ Descrever pose personalizada (opcional)
            </label>
            <Textarea
              placeholder="Ex: Segurando o produto na altura do ombro com sorriso natural, olhando ligeiramente para o lado..."
              value={customPose}
              onChange={(e) => setCustomPose(e.target.value)}
              className="min-h-[60px] bg-background/50 border-border/50 resize-none"
            />
          </div>

          {/* Environment */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">Ambiente</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {environments.map((env) => (
                <div
                  key={env.id}
                  onClick={() => setSelectedEnvironment(env.id)}
                  className={cn(
                    "cursor-pointer rounded-lg p-3 text-center border-2 transition-all",
                    selectedEnvironment === env.id
                      ? "border-tiktok-cyan bg-tiktok-cyan/10"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <env.icon className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">{env.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Environment */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
              ✏️ Descrever cenário personalizado (opcional)
            </label>
            <Textarea
              placeholder="Ex: Sala de estar com luz de janela, plantas ao fundo e sofá bege, ambiente aconchegante..."
              value={customEnvironment}
              onChange={(e) => setCustomEnvironment(e.target.value)}
              className="min-h-[60px] bg-background/50 border-border/50 resize-none"
            />
          </div>

          {/* Style */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">Estilo do Influencer</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    selectedStyle === style.id
                      ? "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                  )}
                >
                  {style.emoji} {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Enhancements */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-1 block flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-tiktok-pink" />
              Melhorias na Imagem
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {enhancements.map((enhancement) => (
                <div
                  key={enhancement.id}
                  onClick={() => toggleEnhancement(enhancement.id)}
                  className={cn(
                    "cursor-pointer rounded-lg p-3 border-2 transition-all flex items-center gap-2",
                    selectedEnhancements.includes(enhancement.id)
                      ? "border-tiktok-pink bg-tiktok-pink/10"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <span>{enhancement.emoji}</span>
                  <span className="text-sm font-medium">{enhancement.name}</span>
                  {selectedEnhancements.includes(enhancement.id) && (
                    <Check className="w-4 h-4 text-tiktok-pink ml-auto" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              💡 Selecione os boosts para imagens mais assertivas e realistas
            </p>
          </div>

          {/* Aspect Ratio */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">Formato da Imagem</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {aspectRatios.map((ratio) => (
                <div
                  key={ratio.id}
                  onClick={() => setSelectedAspectRatio(ratio.id)}
                  className={cn(
                    "cursor-pointer rounded-lg p-4 text-center border-2 transition-all",
                    selectedAspectRatio === ratio.id
                      ? "border-tiktok-cyan bg-tiktok-cyan/10"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <ratio.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className={cn(
                    "text-sm font-medium",
                    selectedAspectRatio === ratio.id && "text-tiktok-cyan"
                  )}>{ratio.name}</p>
                  <p className="text-xs text-muted-foreground">{ratio.ratio}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ratio.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
              ℹ️ Informações Adicionais (opcional)
            </label>
            <Textarea
              placeholder="Ex: Usar iluminação suave, mostrar textura do produto, focar na embalagem, expressão animada..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-[80px] bg-background/50 border-border/50 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Adicione instruções extras para personalizar a geração da imagem
            </p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedProduct || !selectedInfluencer}
            className="w-full h-12 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Gerando imagem...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                <span>Gerar Imagem</span>
              </>
            )}
          </Button>
        </Card>

        {/* Generated Image Preview - Always rendered, visibility controlled by CSS to prevent DOM thrashing */}
        <Card 
          className={cn(
            "mb-6 p-6 bg-card/50 border-border/50 transition-all duration-300",
            generatedImage ? "opacity-100 scale-100" : "hidden"
          )}
        >
          {generatedImage && (
            <div className="flex flex-col items-center gap-6">
              {/* Grok CTA */}
              <div className="w-full max-w-lg text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center">
                    <Video className="w-5 h-5 text-background" />
                  </div>
                  <h3 className="font-bold text-xl"><span>Transforme em Vídeo!</span></h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  <span>Agora use a imagem abaixo na IA de Vídeo para criar seu vídeo UGC animado</span>
                </p>
                <button
                  onClick={() => navigate("/video-avatar")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background font-semibold hover:opacity-90 transition-opacity"
                >
                  <Video className="w-5 h-5" />
                  <span>Criar Vídeo com Avatar IA</span>
                </button>
              </div>

              {/* Divider */}
              <div className="w-full max-w-lg border-t border-border/50" />

              {/* Image with error handling - uses ref to prevent duplicate toasts */}
              <div className="w-full max-w-md">
                <p className="text-sm text-muted-foreground text-center mb-3"><span>Imagem Gerada:</span></p>
                <div className="relative">
                  <img
                    key={generatedImage}
                    src={generatedImage} 
                    alt="Generated UGC" 
                    className="w-full rounded-lg shadow-lg"
                    onError={(e) => {
                      // Prevent multiple error toasts and infinite re-render loop
                      if (imageErrorShownRef.current) return;
                      imageErrorShownRef.current = true;
                      
                      console.error("[VideosIA] Error loading generated image");
                      setImageDisplayError(
                        "A imagem foi gerada, mas houve um erro ao exibir. Tente baixar ou gerar novamente."
                      );
                      // Stop repeated error events without forcing DOM changes elsewhere
                      (e.target as HTMLImageElement).onerror = null;
                    }}
                  />
                </div>
                {imageDisplayError && (
                  <p className="mt-3 text-sm text-destructive text-center">
                    {imageDisplayError}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="w-4 h-4" />
                  <span>Baixar Imagem</span>
                </Button>
                <Button variant="outline" onClick={() => {
                  imageErrorShownRef.current = false;
                  setGeneratedImage(null);
                }} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Gerar Outra</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Tips */}
        <Card className="p-4 sm:p-6 bg-card/30 border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Dicas para melhores resultados</h3>
          </div>
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-tiktok-pink">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </div>
  );
};

export default VideosIA;
