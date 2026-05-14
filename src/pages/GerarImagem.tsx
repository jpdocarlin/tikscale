import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Package, User, Sliders, Home, Camera, Sun, Dumbbell, 
  UtensilsCrossed, MoreHorizontal, Smartphone, Square, RectangleVertical,
  RectangleHorizontal, Upload, Hand, Check, Loader2, Download, RefreshCw,
  Lightbulb, Shirt, Briefcase, Trophy, Star, Heart, Search, ImageIcon, Wand2,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import { sortedProducts, productCategories, VideoProduct } from "@/data/videoProducts";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { BuyCreditsModal } from "@/components/BuyCreditsModal";

// Import avatars
import avatarBernardo from "@/assets/avatars/bernardo.jpg";
import avatarBrenda from "@/assets/avatars/brenda.jpg";
import avatarEduardo from "@/assets/avatars/eduardo.jpg";
import avatarFatima from "@/assets/avatars/fatima.jpg";
import avatarMarina from "@/assets/avatars/marina.jpg";
import avatarPaulo from "@/assets/avatars/paulo.jpg";
import avatarPedro from "@/assets/avatars/pedro.jpg";
import avatarSofia from "@/assets/avatars/sofia.jpg";

// Pose preview images
import poseFrontal from "@/assets/poses/pose-frontal.jpg";
import poseSelfie from "@/assets/poses/pose-selfie.jpg";
import poseMaos from "@/assets/poses/pose-maos.jpg";
import poseVestindo from "@/assets/poses/pose-vestindo.jpg";

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
  { id: "frontal", name: "De Frente", description: "Mostrando o produto de frente para a câmera", icon: User, image: poseFrontal },
  { id: "selfie", name: "Selfie", description: "Estilo selfie segurando o produto", icon: Smartphone, image: poseSelfie },
  { id: "hands", name: "Mãos", description: "Apenas as mãos segurando o produto (1ª pessoa)", icon: Hand, image: poseMaos },
  { id: "wearing", name: "Vestindo", description: "Produto no corpo (vestido, camisa, etc.)", icon: Shirt, image: poseVestindo },
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
  'Pose "Vestindo" para roupas, vestidos e acessórios',
  "Use descrições personalizadas para detalhes específicos",
];

const GerarImagem = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { imagesRemaining, paidCredits, isAdmin, incrementUsage, refundCredit, refreshUsage } = useDailyUsage();
  const [showBuyModal, setShowBuyModal] = useState(false);
  
  // Selection states
  const [productTab, setProductTab] = useState<"viral" | "upload">("viral");
  const [selectedProduct, setSelectedProduct] = useState<VideoProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [influencerTab, setInfluencerTab] = useState<"avatars" | "my-personas" | "upload">("avatars");
  const [selectedInfluencer, setSelectedInfluencer] = useState<typeof influencers[0] | null>(null);
  const [myPersonas, setMyPersonas] = useState<Array<{ id: string; name: string; image_url: string }>>([]);
  const [selectedMyPersona, setSelectedMyPersona] = useState<{ id: string; name: string; image_url: string } | null>(null);
  
  const [selectedPose, setSelectedPose] = useState("frontal");
  const [customPose, setCustomPose] = useState("");
  const [selectedEnvironment, setSelectedEnvironment] = useState("casa");
  const [customEnvironment, setCustomEnvironment] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("casual");
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>(["realismo-detalhamento"]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("9:16");
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  // Upload states
  const [uploadedProductImage, setUploadedProductImage] = useState<string | null>(null);
  const [uploadedProductName, setUploadedProductName] = useState("");
  const [uploadedInfluencerImage, setUploadedInfluencerImage] = useState<string | null>(null);
  const [uploadedScenarioImage, setUploadedScenarioImage] = useState<string | null>(null);
  
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const influencerFileInputRef = useRef<HTMLInputElement>(null);
  const scenarioFileInputRef = useRef<HTMLInputElement>(null);
  
  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDisplayError, setImageDisplayError] = useState<string | null>(null);
  
  const imageErrorShownRef = useRef(false);
  const isMountedRef = useRef(true);
  const activeRequestControllerRef = useRef<AbortController | null>(null);
  const generationIdRef = useRef(0);

  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedProductImage(event.target?.result as string);
      // Clear viral product selection when uploading
      setSelectedProduct(null);
    };
    reader.readAsDataURL(file);
  };

  const handleInfluencerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedInfluencerImage(event.target?.result as string);
      // Clear avatar selection when uploading
      setSelectedInfluencer(null);
    };
    reader.readAsDataURL(file);
  };

  const clearProductUpload = () => {
    setUploadedProductImage(null);
    setUploadedProductName("");
    if (productFileInputRef.current) {
      productFileInputRef.current.value = "";
    }
  };

  const clearInfluencerUpload = () => {
    setUploadedInfluencerImage(null);
    if (influencerFileInputRef.current) {
      influencerFileInputRef.current.value = "";
    }
  };

  const handleScenarioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo 10MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedScenarioImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearScenarioUpload = () => {
    setUploadedScenarioImage(null);
    if (scenarioFileInputRef.current) {
      scenarioFileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    // Load user's saved personas
    const loadMyPersonas = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_personas")
        .select("id, name, image_url")
        .order("created_at", { ascending: false });
      if (data) setMyPersonas(data as any);
    };
    loadMyPersonas();
    return () => {
      isMountedRef.current = false;
      activeRequestControllerRef.current?.abort();
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = sortedProducts;
    // Quando há busca, ignora categoria para procurar em todo o catálogo
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    } else if (selectedCategory !== "Todos") {
      result = result.filter(p => p.category === selectedCategory);
    }
    return result;
  }, [selectedCategory, searchQuery]);

  const toggleEnhancement = (id: string) => {
    setSelectedEnhancements(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

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
    if (isGenerating) return;

    // Validate product selection
    const hasViralProduct = productTab === "viral" && selectedProduct;
    const hasUploadedProduct = productTab === "upload" && uploadedProductImage;

    if (!hasViralProduct && !hasUploadedProduct) {
      toast({ title: "Selecione um produto", description: "Escolha um produto viral ou faça upload de uma imagem", variant: "destructive" });
      return;
    }

    // Validate influencer selection
    const hasAvatar = influencerTab === "avatars" && selectedInfluencer;
    const hasUploadedInfluencer = influencerTab === "upload" && uploadedInfluencerImage;
    const hasMyPersona = influencerTab === "my-personas" && selectedMyPersona;

    if (!hasAvatar && !hasUploadedInfluencer && !hasMyPersona) {
      toast({ title: "Selecione um influencer", description: "Escolha um avatar, persona salva ou faça upload da sua foto", variant: "destructive" });
      return;
    }

    // Check daily limit BEFORE generating
    if (!isAdmin && imagesRemaining <= 0 && paidCredits <= 0) {
      setShowBuyModal(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setImageDisplayError(null);
    imageErrorShownRef.current = false;

    // Reserve credit BEFORE the API call
    const incResult = await incrementUsage('images');
    if (!incResult.allowed) {
      setIsGenerating(false);
      if (incResult.reason === 'no_credits') {
        setShowBuyModal(true);
      } else {
        toast({ title: "Limite diário atingido", description: "Você usou todas as 5 gerações de hoje. Volte amanhã!", variant: "destructive" });
      }
      return;
    }
    const usedPaidForThisGen = incResult.usedPaid;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      if (!supabaseUrl || !publishableKey) throw new Error("Configuração ausente");

      const { data: sessionData } = await supabase.auth.getSession();
      let accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        accessToken = refreshData?.session?.access_token || undefined;
      }
      if (!accessToken) {
        toast({ title: "Sessão expirada", description: "Faça login novamente", variant: "destructive" });
        await refundCredit('images', usedPaidForThisGen);
        setIsGenerating(false);
        return;
      }

      // Build influencer description
      let influencerDescription = "";
      if (hasAvatar && selectedInfluencer) {
        influencerDescription = selectedInfluencer.description;
      } else if (hasMyPersona && selectedMyPersona) {
        influencerDescription = `persona salva: ${selectedMyPersona.name}`;
      }

      // Build product info
      const productName = productTab === "upload" ? uploadedProductName : selectedProduct?.name;

      const body: any = {
        productName: productName || "produto",
        influencer: {
          name: hasMyPersona && selectedMyPersona ? selectedMyPersona.name : (selectedInfluencer?.name || ""),
          description: influencerDescription,
        },
        pose: selectedPose,
        customPose,
        environment: selectedEnvironment,
        customEnvironment,
        style: selectedStyle,
        enhancements: selectedEnhancements,
        aspectRatio: selectedAspectRatio,
        additionalInfo,
      };

      if (productTab === "upload" && uploadedProductImage) {
        body.productImageUrl = uploadedProductImage;
      } else if (productTab === "viral" && selectedProduct?.image) {
        // Convert local product image to base64 so the server can access it
        try {
          const productBase64 = await imageToBase64(selectedProduct.image);
          body.productImageUrl = productBase64;
        } catch (e) {
          console.warn("Failed to convert product image to base64, sending URL:", e);
          body.productImageUrl = selectedProduct.image;
        }
      }

      if (hasUploadedInfluencer && uploadedInfluencerImage) {
        body.influencer.imageUrl = uploadedInfluencerImage;
      } else if (hasMyPersona && selectedMyPersona) {
        body.influencer.imageUrl = selectedMyPersona.image_url;
      } else if (hasAvatar && selectedInfluencer) {
        // Convert local avatar image to base64 so the server can access it
        try {
          const avatarBase64 = await imageToBase64(selectedInfluencer.avatar);
          body.influencer.imageUrl = avatarBase64;
        } catch (e) {
          console.warn("Failed to convert avatar to base64:", e);
          body.influencer.imageUrl = selectedInfluencer.avatar;
        }
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-ugc-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: publishableKey,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429) {
        toast({ title: "Muitas requisições", description: "Aguarde 30 segundos e tente novamente", variant: "destructive" });
        await refundCredit('images', usedPaidForThisGen);
        setIsGenerating(false);
        return;
      }
      if (response.status === 402) {
        toast({ title: "Limite de créditos", description: "Tente mais tarde", variant: "destructive" });
        await refundCredit('images', usedPaidForThisGen);
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao gerar imagem");

      if (data.imageUrl) {
        // Apply frontend crop if the backend returned a square but we requested 9:16 or 16:9
        const applyCrop = (base64Img: string, targetRatio: string): Promise<string> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const [wStr, hStr] = targetRatio.split(':');
              const ratioW = parseInt(wStr) || 1;
              const ratioH = parseInt(hStr) || 1;
              const targetRatioNum = ratioW / ratioH;
              const currentRatioNum = img.width / img.height;
              
              if (Math.abs(targetRatioNum - currentRatioNum) < 0.05) {
                resolve(base64Img);
                return;
              }
      
              let sx = 0, sy = 0, sw = img.width, sh = img.height;
      
              if (currentRatioNum > targetRatioNum) {
                sw = img.height * targetRatioNum;
                sx = (img.width - sw) / 2;
              } else {
                sh = img.width / targetRatioNum;
                sy = (img.height - sh) / 2;
              }
      
              const canvas = document.createElement('canvas');
              canvas.width = sw;
              canvas.height = sh;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
              } else {
                resolve(base64Img);
              }
            };
            img.onerror = () => resolve(base64Img);
            img.src = base64Img;
          });
        };

        const finalImage = await applyCrop(data.imageUrl, selectedAspectRatio);
        setGeneratedImage(finalImage);
        toast({ title: "Imagem gerada!", description: usedPaidForThisGen ? "1 crédito pago utilizado." : "Geração gratuita utilizada." });
      } else {
        throw new Error("Nenhuma imagem retornada");
      }
    } catch (err) {
      // Return the reserved credit on failure
      await refundCredit('images', usedPaidForThisGen);
      toast({
        title: "Erro ao gerar imagem",
        description: `${err instanceof Error ? err.message : "Erro desconhecido"} (crédito devolvido)`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      await refreshUsage();
    }
  }, [
    productTab, selectedProduct, uploadedProductImage, uploadedProductName,
    influencerTab, selectedInfluencer, selectedMyPersona, uploadedInfluencerImage,
    selectedPose, customPose, selectedEnvironment, customEnvironment,
    selectedStyle, selectedEnhancements, selectedAspectRatio, additionalInfo,
    isGenerating, isAdmin, imagesRemaining, paidCredits,
    incrementUsage, refundCredit, refreshUsage, toast,
  ]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    const name = productTab === "upload" ? uploadedProductName : selectedProduct?.name;
    link.download = `ugc-${name || "image"}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen" translate="no">
      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center shadow-lg shadow-tiktok-cyan/20">
            <ImageIcon className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Gerar Imagem <span className="gradient-text">UGC</span></h1>
            <p className="text-muted-foreground text-sm">Crie imagens ultra-realistas de influencers com produtos</p>
          </div>
        </div>
        {/* Update Notice */}
        {!isAdmin && (
          <div className="mb-6 glass-card inner-shine relative overflow-hidden p-4 text-sm">
            <p className="font-semibold mb-2">⚡ Suas gerações</p>
            <div className="flex flex-wrap gap-4 text-xs">
              <span>Grátis hoje: <strong className="text-tiktok-cyan">{imagesRemaining}/10</strong></span>
              <span>Créditos pagos: <strong className="text-tiktok-pink">{paidCredits}</strong></span>
            </div>
            {imagesRemaining <= 0 && paidCredits <= 0 && (
              <button
                onClick={() => setShowBuyModal(true)}
                className="mt-3 text-xs font-semibold text-tiktok-pink hover:text-tiktok-pink/80 transition-colors"
              >
                Comprar créditos para continuar →
              </button>
            )}
          </div>
        )}

        <div className="glass-card inner-shine relative overflow-hidden mb-6 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-tiktok-cyan/15 flex items-center justify-center">
              <Package className="w-4 h-4 text-tiktok-cyan" />
            </div>
            <h2 className="text-lg font-bold">1. Escolha o Produto</h2>
          </div>

          <div className="flex flex-col gap-2 mb-4 w-fit">
            <Button
              variant={productTab === "viral" ? "default" : "outline"}
              onClick={() => setProductTab("viral")}
              className={cn("gap-2 justify-start", productTab === "viral" && "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90")}
            >
              <Package className="w-4 h-4" />
              Produtos Virais
            </Button>
            <Button
              variant={productTab === "upload" ? "default" : "outline"}
              onClick={() => setProductTab("upload")}
              className="gap-2 justify-start"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>

          {productTab === "viral" && (
            <>
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

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-1">
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
                      <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      {selectedProduct?.id === product.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-tiktok-cyan flex items-center justify-center">
                          <Check className="w-4 h-4 text-background" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-tiktok-pink font-semibold">R$ {product.price.toFixed(0)}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">🔥 {product.fires}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">{filteredProducts.length} produtos disponíveis</p>
            </>
          )}

          {productTab === "upload" && (
            <div className="space-y-4">
              <input
                ref={productFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProductUpload}
                className="hidden"
              />
              
              {!uploadedProductImage ? (
                <div 
                  onClick={() => productFileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-tiktok-cyan/50 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para fazer upload da imagem do produto</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG ou WebP</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <img 
                      src={uploadedProductImage} 
                      alt="Produto" 
                      className="w-full h-full object-cover rounded-lg border-2 border-tiktok-cyan"
                    />
                    <button
                      onClick={clearProductUpload}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90"
                    >
                      ✕
                    </button>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nome do Produto</label>
                    <Input
                      placeholder="Ex: Sérum Vitamina C"
                      value={uploadedProductName}
                      onChange={(e) => setUploadedProductName(e.target.value)}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Choose Influencer */}
        <div className="glass-card inner-shine relative overflow-hidden mb-6 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-tiktok-pink/15 flex items-center justify-center">
              <User className="w-4 h-4 text-tiktok-pink" />
            </div>
            <h2 className="text-lg font-bold">2. Escolha o Influencer</h2>
          </div>

          <div className="flex flex-col gap-2 mb-4 w-fit">
            <Button
              variant={influencerTab === "avatars" ? "default" : "outline"}
              onClick={() => { setInfluencerTab("avatars"); setSelectedMyPersona(null); }}
              className={cn("gap-1 text-xs sm:text-sm justify-start", influencerTab === "avatars" && "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90")}
            >
              <User className="w-4 h-4" />
              Prontos
            </Button>
            {myPersonas.length > 0 && (
              <Button
                variant={influencerTab === "my-personas" ? "default" : "outline"}
                onClick={() => { setInfluencerTab("my-personas"); setSelectedInfluencer(null); }}
                className={cn("gap-1 text-xs sm:text-sm justify-start", influencerTab === "my-personas" && "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90")}
              >
                <Wand2 className="w-4 h-4" />
                Minhas Personas
              </Button>
            )}
            <Button
              variant={influencerTab === "upload" ? "default" : "outline"}
              onClick={() => { setInfluencerTab("upload"); setSelectedMyPersona(null); }}
              className="gap-1 text-xs sm:text-sm justify-start"
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
                    <img src={influencer.avatar} alt={influencer.name} className="w-full h-full object-cover pointer-events-none" />
                  </div>
                  <p className="text-xs mt-2 font-medium pointer-events-none">{influencer.name}</p>
                </button>
              ))}
            </div>
          )}

          {influencerTab === "my-personas" && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {myPersonas.map((persona) => (
                <button
                  type="button"
                  key={persona.id}
                  onClick={() => { setSelectedMyPersona(persona); setSelectedInfluencer(null); }}
                  className="cursor-pointer text-center bg-transparent border-none p-0"
                >
                  <div
                    className={cn(
                      "w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden border-[3px] transition-all pointer-events-none",
                      selectedMyPersona?.id === persona.id
                        ? "border-tiktok-pink ring-2 ring-tiktok-pink/30"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img src={persona.image_url} alt={persona.name} className="w-full h-full object-cover pointer-events-none" />
                  </div>
                  <p className="text-xs mt-2 font-medium pointer-events-none">{persona.name}</p>
                </button>
              ))}
            </div>
          )}

          {influencerTab === "upload" && (
            <div className="space-y-4">
              <input
                ref={influencerFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInfluencerUpload}
                className="hidden"
              />
              
              {!uploadedInfluencerImage ? (
                <div 
                  onClick={() => influencerFileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-tiktok-pink/50 transition-colors"
                >
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para fazer upload da sua foto</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Foto frontal com rosto visível</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="relative w-24 h-24">
                    <img 
                      src={uploadedInfluencerImage} 
                      alt="Avatar" 
                      className="w-full h-full object-cover rounded-full border-[3px] border-tiktok-pink"
                    />
                    <button
                      onClick={clearInfluencerUpload}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Configure Image */}
        <div className="glass-card inner-shine relative overflow-hidden mb-6 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-tiktok-cyan/15 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-tiktok-cyan" />
            </div>
            <h2 className="text-lg font-bold">3. Configure a Imagem</h2>
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
                    "cursor-pointer rounded-xl overflow-hidden border-2 transition-all group",
                    selectedPose === pose.id ? "border-tiktok-cyan ring-2 ring-tiktok-cyan/30" : "border-border/50 hover:border-border"
                  )}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={pose.image} 
                      alt={pose.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {selectedPose === pose.id && (
                      <div className="absolute inset-0 bg-tiktok-cyan/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-tiktok-cyan flex items-center justify-center">
                          <Check className="w-5 h-5 text-background" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-center bg-card">
                    <p className="text-sm font-medium">{pose.name}</p>
                    <p className="text-xs text-muted-foreground">{pose.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Pose */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground mb-2 block">✏️ Descrever pose personalizada (opcional)</label>
            <Textarea
              placeholder="Ex: Segurando o produto na altura do ombro com sorriso natural..."
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
                    selectedEnvironment === env.id ? "border-tiktok-cyan bg-tiktok-cyan/10" : "border-border/50 hover:border-border"
                  )}
                >
                  <env.icon className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">{env.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Upload - only when "Cenário Real" selected */}
          {selectedEnvironment === "cenario-real" && (
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">📷 Foto do cenário real</label>
              <p className="text-xs text-muted-foreground mb-3">Envie uma foto do ambiente onde sua personagem vai aparecer</p>
              <input
                ref={scenarioFileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleScenarioUpload}
                className="hidden"
              />
              {!uploadedScenarioImage ? (
                <div
                  onClick={() => scenarioFileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-tiktok-cyan/50 transition-colors"
                >
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para enviar foto do cenário</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">JPG ou PNG, até 10MB</p>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={uploadedScenarioImage}
                    alt="Cenário"
                    className="w-48 h-32 object-cover rounded-lg border-2 border-tiktok-cyan"
                  />
                  <button
                    onClick={clearScenarioUpload}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Custom Environment */}
          {selectedEnvironment !== "cenario-real" && (
            <div className="mb-6">
              <label className="text-sm text-muted-foreground mb-2 block">✏️ Descrever cenário personalizado (opcional)</label>
              <Textarea
                placeholder="Ex: Sala de estar com luz de janela, plantas ao fundo..."
                value={customEnvironment}
                onChange={(e) => setCustomEnvironment(e.target.value)}
                className="min-h-[60px] bg-background/50 border-border/50 resize-none"
              />
            </div>
          )}

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
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {enhancements.map((enhancement) => (
                <div
                  key={enhancement.id}
                  onClick={() => toggleEnhancement(enhancement.id)}
                  className={cn(
                    "cursor-pointer rounded-lg p-3 border-2 transition-all flex items-center gap-2",
                    selectedEnhancements.includes(enhancement.id) ? "border-tiktok-pink bg-tiktok-pink/10" : "border-border/50 hover:border-border"
                  )}
                >
                  <span>{enhancement.emoji}</span>
                  <span className="text-sm font-medium">{enhancement.name}</span>
                  {selectedEnhancements.includes(enhancement.id) && <Check className="w-4 h-4 text-tiktok-pink ml-auto" />}
                </div>
              ))}
            </div>
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
                    selectedAspectRatio === ratio.id ? "border-tiktok-cyan bg-tiktok-cyan/10" : "border-border/50 hover:border-border"
                  )}
                >
                  <ratio.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className={cn("text-sm font-medium", selectedAspectRatio === ratio.id && "text-tiktok-cyan")}>{ratio.name}</p>
                  <p className="text-xs text-muted-foreground">{ratio.ratio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground mb-2 block">ℹ️ Informações Adicionais (opcional)</label>
            <Textarea
              placeholder="Ex: Usar iluminação suave, mostrar textura do produto..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-[80px] bg-background/50 border-border/50 resize-none"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (productTab === "viral" ? !selectedProduct : !uploadedProductImage) || (influencerTab === "avatars" ? !selectedInfluencer : influencerTab === "my-personas" ? !selectedMyPersona : !uploadedInfluencerImage)}
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
        </div>

        {/* Generated Image Preview */}
        {generatedImage && (
          <div className="glass-card inner-shine card-gradient-border relative overflow-hidden mb-6 p-6">
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <h3 className="font-bold text-xl mb-2">✨ Imagem Gerada!</h3>
                <p className="text-muted-foreground text-sm">Baixe a imagem ou use para criar um vídeo</p>
              </div>

              <div className="w-full max-w-md">
                <img
                  key={generatedImage}
                  src={generatedImage}
                  alt="Generated UGC"
                  className="w-full rounded-lg shadow-lg"
                  onError={() => {
                    if (imageErrorShownRef.current) return;
                    imageErrorShownRef.current = true;
                    setImageDisplayError("Erro ao exibir imagem. Tente baixar ou gerar novamente.");
                  }}
                />
                {imageDisplayError && <p className="mt-3 text-sm text-destructive text-center">{imageDisplayError}</p>}
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="w-4 h-4" />
                  Baixar Imagem
                </Button>

                <Button variant="ghost" onClick={() => { imageErrorShownRef.current = false; setGeneratedImage(null); }} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Gerar Outra
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="glass-card inner-shine relative overflow-hidden p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold">Dicas para melhores resultados</h3>
          </div>
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-tiktok-pink">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <BuyCreditsModal open={showBuyModal} onOpenChange={setShowBuyModal} />
    </div>
  );
};

export default GerarImagem;
