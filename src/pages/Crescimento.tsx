import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Play, ChevronRight, Lock, TrendingUp, Eye, Flame, X, ExternalLink, Clock, Heart, Share2, Wand2, ImagePlus, FileText, Sparkles, Copy, Check, Video, ScanFace, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getFreshAccessToken, forceRefreshAccessToken } from "@/lib/getFreshAccessToken";
import { useAuth } from "@/contexts/AuthContext";
// ── Topic data ──
const topics = [
  {
    id: "religioso",
    emoji: "🙏",
    title: "Religioso",
    subtitle: "Conteúdo de fé e reflexão",
    description: "Vídeos com mensagens bíblicas, reflexões e áudios virais de pregadores. Engajamento altíssimo — o público compartilha muito.",
    color: "from-amber-500 to-orange-600",
    colorLight: "bg-amber-500/10 text-amber-400",
    accentHsl: "hsla(38, 92%, 50%, 0.15)",
    thumbnail: "/crescimento/religioso.png",
    stats: { avgViews: "50K+", shareRate: "18%", growthDays: "7-14 dias" },
    tips: [
      "Use áudios de pregadores famosos que já viralizaram",
      "Adicione legendas grandes e centralizadas",
      "Poste entre 18h-21h para maior alcance",
      "Coloque imagens impactantes de fundo (natureza, céu)",
    ],
    videos: [
      { id: 1, title: "Exemplo Religioso 1", views: "127K", likes: "14.2K", duration: "0:31", thumbnail: "🌅", image: "/crescimento/religioso_1.jpg", description: "Áudio viral de reflexão cristã e paisagens.", url: "https://www.tiktok.com/@verdadeiro.cristo/video/7470675968756043013" },
      { id: 2, title: "Exemplo Religioso 2", views: "89K", likes: "9.8K", duration: "0:22", thumbnail: "✝️", image: "/crescimento/religioso_2.jpg", description: "Mensagem bíblica com música suave.", url: "https://www.tiktok.com/@cristaocomfe4/video/7600806658427899156" },
      { id: 3, title: "Exemplo Religioso 3", views: "203K", likes: "22.1K", duration: "0:45", thumbnail: "🕊️", image: "/crescimento/religioso_3.jpg", description: "Oração e palavras de fé em alta.", url: "https://www.tiktok.com/@jesusallvadorr/video/7516467822873087274" },
    ],
  },
  {
    id: "frutas",
    emoji: "🍊",
    title: "Frutas Falantes",
    subtitle: "Humor com IA e criatividade",
    description: "Frutas com rosto animado conversando entre si usando IA. Formato viral no TikTok — fácil de produzir e vicia o público.",
    color: "from-green-500 to-emerald-600",
    colorLight: "bg-green-500/10 text-green-400",
    accentHsl: "hsla(142, 76%, 48%, 0.15)",
    thumbnail: "/crescimento/frutas.png",
    stats: { avgViews: "80K+", shareRate: "22%", growthDays: "5-10 dias" },
    tips: [
      "Use IA para gerar os rostos nas frutas (ex: Viggle, D-ID)",
      "Crie diálogos engraçados e polêmicos entre as frutas",
      "Formato curto (15-25s) funciona melhor",
      "Poste 3x por dia nos primeiros 7 dias",
    ],
    videos: [
      { id: 1, title: "Frutas Falantes 1", views: "245K", likes: "28.3K", duration: "0:18", thumbnail: "🍊", image: "/crescimento/frutas_1.jpg", description: "Exemplo viral clássico de frutas interagindo com voz de IA.", url: "https://www.tiktok.com/@princiipedasalvacao/video/7601501128341376276" },
      { id: 2, title: "Frutas Falantes 2", views: "189K", likes: "21.7K", duration: "0:22", thumbnail: "🍌", image: "/crescimento/frutas_2.jpg", description: "Situação bem humorada gerada por inteligência artificial.", url: "https://www.tiktok.com/@curiosidadesmqcuriosas/video/7595441886618258706" },
      { id: 3, title: "Frutas Falantes 3", views: "312K", likes: "36.4K", duration: "0:15", thumbnail: "🍓", image: "/crescimento/frutas_3.jpg", description: "Fofoca e humor entre frutas que retém o público.", url: "https://www.tiktok.com/@aisatisf/video/7596368556225203474" },
    ],
  },
  {
    id: "roca",
    emoji: "👩‍🌾",
    title: "Mulher da roça",
    subtitle: "Lifestyle rural viral",
    description: "Compilações de vídeos no estilo vida na roça. Formato autêntico, que conecta com o público e engaja muito rápido.",
    color: "from-pink-500 to-rose-600",
    colorLight: "bg-pink-500/10 text-pink-400",
    accentHsl: "hsla(348, 99%, 58%, 0.15)",
    thumbnail: "/crescimento/mulheres.png",
    stats: { avgViews: "120K+", shareRate: "15%", growthDays: "3-7 dias" },
    tips: [
      "Use áudios rústicos ou músicas sertanejas em alta",
      "Mostre a rotina de forma simples e autêntica",
      "Thumbnail atraente mas focada no lifestyle rural",
      "Poste 2-4x por dia para crescimento acelerado",
    ],
    videos: [
      { id: 1, title: "Exemplo Roça 1", views: "456K", likes: "52.3K", duration: "0:12", thumbnail: "🌾", image: "/crescimento/roca_1.jpg", description: "Estilo de vida rural que atrai muita visualização.", url: "https://www.tiktok.com/@lilidaroca/video/7618725298351230229" },
      { id: 2, title: "Exemplo Roça 2", views: "321K", likes: "38.7K", duration: "0:15", thumbnail: "🐴", image: "/crescimento/roca_2.jpg", description: "Acompanhando a rotina no campo com música sertaneja.", url: "https://www.tiktok.com/@ellevenshopby/video/7618707257047403792" },
      { id: 3, title: "Exemplo Roça 3", views: "234K", likes: "27.1K", duration: "0:20", thumbnail: "🌻", image: "/crescimento/roca_3.jpg", description: "Simplicidade e carisma que retém a audiência.", url: "https://www.tiktok.com/@bellanaroca/video/7612381845505740052" },
    ],
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } },
};

const Crescimento = () => {
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const activeTopic = topics.find((t) => t.id === selectedTopic);

  // States for "Clone os Vídeos"
  const [cloneTopic, setCloneTopic] = useState<string>("religioso");
  const [cloneSubOption, setCloneSubOption] = useState<string>("");
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  const [generatedPhotoUrl, setGeneratedPhotoUrl] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedVideoPrompt, setGeneratedVideoPrompt] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [remainingCounts, setRemainingCounts] = useState<number | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const { user, isLoading: authLoading } = useAuth();

  const fetchRemaining = async () => {
    try {
      if (!user) return;

      if (user.email === 'jpnogueiraz@gmail.com') {
        setIsAdminUser(true);
        return;
      }

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("growth_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("type", "image")
        .gte("created_at", today.toISOString());

      if (!error && count !== null) {
        setRemainingCounts(Math.max(0, 5 - count));
      } else {
        setRemainingCounts(5);
      }
    } catch (e) {
      setRemainingCounts(5);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchRemaining();
    }
  }, [user, authLoading]);

  const getSubOptions = () => {
    if (cloneTopic === "frutas") return ["Maçã", "Laranja", "Morango", "Banana", "Abacaxi", "Melancia"];
    if (cloneTopic === "roca") return ["Loira", "Morena", "Ruiva"];
    return []; // Religioso is always just "Jesus"
  };

  const handleGeneratePhoto = async () => {
    if (cloneTopic !== "religioso" && !cloneSubOption) {
      toast({ title: "Selecione uma opção", description: "Escolha uma variação antes de gerar a foto.", variant: "destructive" });
      return;
    }
    setIsGeneratingPhoto(true);
    setGeneratedPhotoUrl(null);
    setGeneratedVideoPrompt(null);
    setGeneratedScript(null);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      let accessToken = await getFreshAccessToken();
      if (!accessToken) {
        toast({ title: "Sessão expirada", description: "Faça login novamente", variant: "destructive" });
        setIsGeneratingPhoto(false);
        return;
      }

      // Retry loop for resilience against stale tokens
      const maxRetries = 3;
      let lastError = "";

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 15_000);
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/generate-growth-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              apikey: publishableKey,
            },
            body: JSON.stringify({ topic: cloneTopic, subOption: cloneSubOption, timestamp: Date.now() }),
            signal: abortController.signal,
          });

          if (response.status === 401) {
            console.log(`[Crescimento] 401 on attempt ${attempt}, refreshing session...`);
            const freshToken = await forceRefreshAccessToken();
            if (freshToken) accessToken = freshToken;
            lastError = "Sessão expirada";
            if (attempt === maxRetries) throw new Error(lastError);
            continue;
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Falha ao gerar foto");
          }
          const data = await response.json();
          if (data.imageUrl) {
            setGeneratedPhotoUrl(data.imageUrl);
            fetchRemaining();
            toast({ title: "Foto gerada!", description: "A imagem para o seu vídeo está pronta." });
          } else throw new Error("Imagem não recebida");
          return; // Success - exit
        } catch (retryErr: any) {
          console.error(`[Crescimento] Attempt ${attempt} failed:`, retryErr);
          lastError = retryErr.name === 'AbortError' ? "Tempo limite excedido pela IA." : (retryErr.message || "Erro desconhecido");
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 1000 * attempt));
          }
        } finally {
          clearTimeout(timeoutId);
        }
      }

      // All retries failed
      toast({ title: "Erro", description: lastError || "Ocorreu um problema ao gerar a foto.", variant: "destructive" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Ocorreu um problema ao gerar a foto.", variant: "destructive" });
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  const buildVideoPromptFallback = (topic: string, subOption: string): string => {
    const translationMap: Record<string, string> = {
      "Maçã": "apple", "Laranja": "orange", "Morango": "strawberry", 
      "Banana": "banana", "Abacaxi": "pineapple", "Melancia": "watermelon",
      "Loira": "blonde", "Morena": "brunette", "Ruiva": "redhead",
    };
    const subEn = translationMap[subOption] || subOption || "";

    if (topic === "frutas") {
      return `Cinematic 10-second video of a stylized 3D Pixar-style animated ${subEn || "fruit"} character with expressive human-like eyes and mouth integrated seamlessly into the fruit skin. The character is wearing a sports headband, looking directly into the camera while talking with energetic facial expressions. Studio lighting, bright colorful background, 10-second video duration.`;
    } else if (topic === "roca") {
      return `Ultra-realistic 10-second video of an authentic young Brazilian country woman with ${subEn || "brunette"} hair working on a rustic rural farm. She is wearing traditional countryside clothes, looking towards the camera and speaking with natural, friendly hand gestures. Warm golden hour sunlight, authentic farm landscape background, 10-second video duration.`;
    } else if (topic === "religioso") {
      return `Cinematic 10-second video portrait of Jesus Christ looking compassionately towards the viewer. Gentle hand movement, serene and sacred facial expression, warm glowing celestial divine light, soft ambient atmosphere, smooth slow motion, 10-second video duration.`;
    }
    return `Cinematic 10-second video of ${topic} (${subOption}), high quality, 10-second video duration.`;
  };

  const cleanSpeechScript = (text: string): string => {
    let cleaned = text
      .replace(/["""«»'']/g, "")
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/^(Narração:|Frase:|Exemplo:|Script:|Texto:|Fala:)\s*/i, "")
      .trim();
    
    if (cleaned && !/[.!?]$/.test(cleaned)) {
      cleaned += ".";
    }
    return cleaned;
  };

  const getFallbackScript = (topic: string, subOption: string): string => {
    if (topic === "frutas") {
      const fruta = subOption || "fruta";
      return `Oi! Eu sou a ${fruta}! Sou rica em vitaminas pra fortalecer o seu corpo e te dar muita energia o dia todo. Que tal começar a manhã comigo?`;
    } else if (topic === "roca") {
      return `O pessoal da cidade acha que vida na roça é calma, mas a gente trabalha antes do sol nascer! E quer saber? Não troco essa paz por nada nesse mundo!`;
    } else if (topic === "religioso") {
      return `Se a sua caminhada está difícil, não perca a fé. Deus está preparando vitórias gigantescas para o momento certo na sua vida. Acredite e descanse.`;
    }
    return `Vídeo incrível de 10 segundos com mensagem positiva e transformadora para abençoar o seu dia.`;
  };

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15_000);
    try {
      let videoPrompt = "";
      let speechScript = "";

      const { data, error } = await supabase.functions.invoke("generate-growth-script", {
        body: { topic: cloneTopic, subOption: cloneSubOption },
        signal: abortController.signal,
      });

      if (!error && data) {
        videoPrompt = data?.videoPrompt?.trim() || "";
        speechScript = cleanSpeechScript(data?.speechScript || data?.script || "");
      }

      if (!videoPrompt) {
        videoPrompt = buildVideoPromptFallback(cloneTopic, cloneSubOption);
      }

      if (!speechScript) {
        speechScript = getFallbackScript(cloneTopic, cloneSubOption);
      }

      setGeneratedVideoPrompt(videoPrompt);
      setGeneratedScript(speechScript);
      toast({ title: "Prompts gerados!", description: "O prompt do vídeo (10s) e a fala do vídeo (10s) foram gerados perfeitamente." });
    } catch (err: any) {
      console.error("Erro ao gerar fala via Edge Function:", err);
      const videoPrompt = buildVideoPromptFallback(cloneTopic, cloneSubOption);
      const speechScript = getFallbackScript(cloneTopic, cloneSubOption);
      setGeneratedVideoPrompt(videoPrompt);
      setGeneratedScript(speechScript);
      toast({ title: "Prompts gerados!", description: "Prompt do vídeo (10s) e fala do vídeo (10s) prontos para uso." });
    } finally {
      clearTimeout(timeoutId);
      setIsGeneratingScript(false);
    }
  };

  const handleCopyPrompt = () => {
    if (generatedVideoPrompt) {
      navigator.clipboard.writeText(generatedVideoPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleCopyScript = () => {
    if (generatedScript) {
      navigator.clipboard.writeText(generatedScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto">
        
        <Tabs defaultValue="estrategia" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-1 mx-auto">
            <TabsTrigger value="estrategia" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
              <TrendingUp className="w-4 h-4 mr-2" />
              Estratégia
            </TabsTrigger>
            <TabsTrigger value="clonar" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
              <ScanFace className="w-4 h-4 mr-2" />
              Clone os Vídeos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estrategia" className="focus-visible:outline-none">
            {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl glass-card inner-shine p-6 md:p-8 lg:p-10 mb-8"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-tiktok-pink/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-tiktok-cyan/6 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-tiktok-green animate-dot-pulse" />
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Estratégia de crescimento</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
              Bata <span className="gradient-text">2 mil seguidores</span> rápido
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              Escolha um dos 3 nichos abaixo, siga a estratégia e alcance os 2K seguidores necessários para começar a vender no TikTok Shop.
            </p>

            {/* Progress indicator */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">Meta: 2.000 seguidores</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">3 a 14 dias</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs">3-4 posts/dia</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── TOPIC CARDS ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8"
        >
          {topics.map((topic) => (
            <motion.div key={topic.id} variants={fadeUp} className="h-full">
              <button
                onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                className={cn(
                  "w-full h-full text-left glass-card card-gradient-border inner-shine relative overflow-hidden p-5 md:p-6 transition-all duration-500 group",
                  selectedTopic === topic.id && "ring-2 ring-primary/50"
                )}
              >
                {/* Ambient glow - removed heavy blur on hover for performance */}
                <div className="relative z-[2]">
                  {/* Thumbnail */}
                  <div className="w-full h-36 rounded-2xl overflow-hidden mb-4 -mx-0">
                    <img
                      src={topic.thumbnail}
                      alt={topic.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{topic.emoji}</span>
                      <h3 className="text-lg font-bold">{topic.title}</h3>
                    </div>
                    <div className={cn("p-1.5 rounded-xl transition-all", selectedTopic === topic.id ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground")}>
                      <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", selectedTopic === topic.id && "rotate-90")} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{topic.subtitle}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-xl bg-muted/30">
                      <p className="text-xs font-bold text-foreground">{topic.stats.avgViews}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Views médio</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-muted/30">
                      <p className="text-xs font-bold text-foreground">{topic.stats.shareRate}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Compartilha</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-muted/30">
                      <p className="text-xs font-bold text-foreground">{topic.stats.growthDays}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Pra 2K</p>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* ── EXPANDED TOPIC DETAIL ── */}
        <AnimatePresence mode="wait">
          {activeTopic && (
            <motion.div
              key={activeTopic.id}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Description + Tips */}
              <div className="glass-card relative overflow-hidden p-6 md:p-8 mb-6 border border-border/40">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ background: activeTopic.accentHsl }} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{activeTopic.emoji}</span>
                      <div>
                        <h2 className="text-xl font-bold">{activeTopic.title}</h2>
                        <p className="text-xs text-muted-foreground">{activeTopic.subtitle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTopic(null)}
                      className="p-2 rounded-xl hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-foreground/80 leading-relaxed mb-6">{activeTopic.description}</p>

                  {/* Tips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeTopic.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/20">
                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-gradient-to-br", activeTopic.color, "text-white")}>
                          {i + 1}
                        </div>
                        <p className="text-xs text-foreground/70 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Videos Grid */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Exemplos de vídeos que vamos criar</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-semibold">{activeTopic.videos.length} vídeos</span>
                </div>

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {activeTopic.videos.map((video: any) => (
                    <motion.div key={video.id} variants={fadeUp}>
                      <div 
                        className="glass-card card-gradient-border inner-shine relative overflow-hidden group cursor-pointer"
                        onClick={() => video.url && window.open(video.url, "_blank")}
                      >
                        <div className={cn("h-40 flex items-center justify-center text-6xl relative bg-muted/20")}>
                          <div className="absolute inset-0 bg-background/30 z-20 pointer-events-none" />
                          {video.image ? (
                            <img 
                              src={video.image} 
                              alt={video.title} 
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover z-10" 
                            />
                          ) : (
                            <span className="relative z-10 text-5xl">{video.thumbnail}</span>
                          )}

                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                          </div>

                          {/* Duration badge */}
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] text-white font-medium">
                            {video.duration}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h4 className="font-semibold text-sm mb-1.5 line-clamp-1">{video.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">{video.description}</p>

                          {/* Stats */}
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {video.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {video.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA BOTTOM ── */}
        {!selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card inner-shine relative overflow-hidden p-6 md:p-8 text-center"
          >
            <div className="absolute inset-0 bg-muted/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center mx-auto mb-4 shadow-lg shadow-tiktok-cyan/20">
                <Target className="w-7 h-7 text-background" />
              </div>
              <h3 className="text-lg font-bold mb-2">Escolha um nicho acima para começar</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Cada nicho tem uma estratégia específica. Clique em um dos cards e veja os vídeos de exemplo que vamos criar para você.
              </p>
            </div>
          </motion.div>
        )}
          </TabsContent>

          <TabsContent value="clonar" className="focus-visible:outline-none mt-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
              
              {/* Daily usage notice */}
              {!isAdminUser && (
                <div className="md:col-span-2 mb-2 glass-card inner-shine relative overflow-hidden p-4 text-sm w-full">
                  <p className="font-semibold mb-2">⚡ Suas gerações</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span>Grátis hoje: <strong className="text-tiktok-cyan">{remainingCounts !== null ? remainingCounts : "..."}/5</strong></span>
                  </div>
                </div>
              )}
              
              {/* Controls Column */}
              <Card className="glass-card inner-shine p-6 border-border/50 flex flex-col h-full">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <ScanFace className="w-5 h-5 text-tiktok-cyan" />
                    Configurar Vídeo
                  </h2>
                  <p className="text-sm text-muted-foreground">Escolha o nicho e os detalhes para a IA clonar o estilo visual.</p>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <label className="text-sm font-semibold mb-3 block text-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">1</span>
                      Qual é o Nicho?
                    </label>
                    <div className="flex flex-col gap-2">
                      {topics.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setCloneTopic(t.id); setCloneSubOption(""); }}
                          className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all", cloneTopic === t.id ? "bg-primary/10 border-primary text-primary font-medium" : "bg-card/50 border-border/40 hover:bg-muted/50 text-muted-foreground")}
                        >
                          <span className="text-xl">{t.emoji}</span>
                          {t.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {cloneTopic !== "religioso" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <label className="text-sm font-semibold mb-3 block text-foreground flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-tiktok-pink/20 flex items-center justify-center text-[10px] text-tiktok-pink">2</span>
                        Escolha o Estilo ({cloneTopic === "frutas" ? "Fruta" : "Cabelo"})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getSubOptions().map(opt => (
                          <button
                            key={opt}
                            onClick={() => setCloneSubOption(opt)}
                            className={cn("px-4 py-2.5 rounded-xl text-sm font-medium border transition-all", cloneSubOption === opt ? "bg-tiktok-pink/10 border-tiktok-pink text-tiktok-pink" : "bg-card/30 border-border/30 hover:bg-muted/50 text-muted-foreground")}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {cloneTopic === "religioso" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-muted/20 border border-border/30">
                      <p className="text-sm text-muted-foreground text-center">Para o nicho Religioso, a IA irá gerar imagens focadas na figura de Jesus ou ambientes divinos automaticamente.</p>
                    </motion.div>
                  )}
                </div>

                <Button 
                  onClick={handleGeneratePhoto}
                  disabled={isGeneratingPhoto || (cloneTopic !== "religioso" && !cloneSubOption)}
                  className="w-full gap-2 rounded-xl h-12 mt-8 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background font-semibold shadow-lg shadow-tiktok-cyan/20"
                >
                  {isGeneratingPhoto ? <><Sparkles className="w-5 h-5 animate-spin" /> Gerando a foto...</> : <><ImagePlus className="w-5 h-5" /> Gerar Foto</>}
                </Button>
              </Card>

              {/* Result Column */}
              <div className="space-y-6 flex flex-col h-full">
                <Card className="glass-card inner-shine p-6 border-border/50 flex flex-col items-center justify-center min-h-[380px] bg-gradient-to-b from-card/40 to-muted/10">
                  {isGeneratingPhoto ? (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-tiktok-cyan border-t-transparent animate-spin mx-auto mb-6 shadow-lg shadow-tiktok-cyan/20" />
                      <p className="text-sm font-medium animate-pulse text-muted-foreground">A IA está renderizando a imagem...</p>
                    </div>
                  ) : generatedPhotoUrl ? (
                    <div className="w-full h-full flex flex-col">
                      <div className="relative w-full flex-1 min-h-[280px] max-w-[260px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/50 mb-6">
                        <img src={generatedPhotoUrl} alt="Generated" className="w-full h-full object-cover" />
                      </div>
                      <Button 
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript || (generatedScript !== null && generatedVideoPrompt !== null)}
                        className="w-full gap-2 rounded-xl h-12 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-semibold mt-auto"
                      >
                        {isGeneratingScript ? (
                          <><Sparkles className="w-4 h-4 animate-spin" /> Gerando Prompt e Fala (10s)...</>
                        ) : (
                          <><FileText className="w-4 h-4" /> Gerar Prompts do Vídeo (10s)</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground opacity-60">
                      <div className="w-20 h-20 rounded-[2rem] bg-muted/50 flex items-center justify-center mx-auto mb-4 border border-border/40">
                        <ImagePlus className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-sm font-medium">A foto gerada aparecerá aqui.</p>
                      <p className="text-xs mt-1 max-w-[200px] mx-auto">Selecione o nicho e clique em gerar para ver o resultado.</p>
                    </div>
                  )}
                </Card>

                <AnimatePresence>
                  {(generatedVideoPrompt || generatedScript) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                      {generatedVideoPrompt && (
                        <Card className="glass-card inner-shine p-5 border-tiktok-cyan/30 relative shadow-lg shadow-tiktok-cyan/5">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-tiktok-cyan">
                              <Video className="w-4 h-4" />
                              Prompt do Vídeo (10 segundos)
                            </h3>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-tiktok-cyan/10 text-tiktok-cyan font-semibold border border-tiktok-cyan/20">
                              Inglês • 10s Video
                            </span>
                          </div>
                          <Textarea
                            readOnly
                            value={generatedVideoPrompt}
                            className="min-h-[90px] resize-none rounded-xl bg-background/80 border-tiktok-cyan/30 text-xs leading-relaxed text-foreground/90 p-3 pr-10"
                          />
                          <Button onClick={handleCopyPrompt} variant="secondary" size="icon" className="absolute bottom-4 right-4 h-8 w-8 rounded-lg shadow-sm hover:bg-background/80">
                            {copiedPrompt ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                          </Button>
                        </Card>
                      )}

                      {generatedScript && (
                        <Card className="glass-card inner-shine p-5 border-tiktok-pink/30 relative shadow-lg shadow-tiktok-pink/5">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-tiktok-pink">
                              <MessageSquare className="w-4 h-4" />
                              Fala do Vídeo (10 segundos)
                            </h3>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-tiktok-pink/10 text-tiktok-pink font-semibold border border-tiktok-pink/20">
                              Português • ~25 palavras
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90 bg-muted/20 p-4 rounded-xl border border-border/30 pr-12 font-medium">
                            "{generatedScript}"
                          </p>
                          <Button onClick={handleCopyScript} variant="secondary" size="icon" className="absolute top-12 right-4 h-8 w-8 rounded-lg shadow-sm hover:bg-background/80">
                            {copiedScript ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                          </Button>
                        </Card>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
};

export default Crescimento;
