import { useState, useEffect, useRef } from "react";
import {
  Sparkles, MessageSquare, Wand2, Copy, Check, UploadCloud, Video,
  ScanFace, Shirt, X, ImagePlus, ChevronDown, User, MapPin, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getFreshAccessToken } from "@/lib/getFreshAccessToken";
import { videoProducts } from "@/data/videoProducts";
import { cn } from "@/lib/utils";
import { generateRealPrompt, analyzeVideoMovements } from "@/lib/googleAI";

// Avatar imports (same as GerarImagem)
import avatarBernardo from "@/assets/avatars/bernardo.jpg";
import avatarBrenda from "@/assets/avatars/brenda.jpg";
import avatarEduardo from "@/assets/avatars/eduardo.jpg";
import avatarFatima from "@/assets/avatars/fatima.jpg";
import avatarMarina from "@/assets/avatars/marina.jpg";
import avatarPaulo from "@/assets/avatars/paulo.jpg";
import avatarPedro from "@/assets/avatars/pedro.jpg";
import avatarSofia from "@/assets/avatars/sofia.jpg";

const PRESET_AVATARS = [
  { id: "bernardo", name: "Bernardo", avatar: avatarBernardo, description: "young Brazilian man, age 28, with purple cap, light stubble beard" },
  { id: "brenda",   name: "Brenda",   avatar: avatarBrenda,   description: "young Brazilian woman, age 25, blonde hair in bun, elegant" },
  { id: "eduardo",  name: "Eduardo",  avatar: avatarEduardo,  description: "young Black Brazilian man, age 27, athletic, confident smile" },
  { id: "fatima",   name: "Fátima",   avatar: avatarFatima,   description: "elegant older Brazilian woman, age 58, silver gray hair, sophisticated" },
  { id: "marina",   name: "Marina",   avatar: avatarMarina,   description: "young Brazilian woman, age 24, long red auburn hair, freckles" },
  { id: "paulo",    name: "Paulo",    avatar: avatarPaulo,    description: "mature Brazilian man, age 52, salt and pepper gray hair, sophisticated" },
  { id: "pedro",    name: "Pedro",    avatar: avatarPedro,    description: "young Brazilian man, age 26, curly dark hair, short beard, handsome" },
  { id: "sofia",    name: "Sofia",    avatar: avatarSofia,    description: "young Black Brazilian woman, age 26, long braided hair, elegant" },
];

const variables = {
  genero: ["mulher jovem", "homem jovem", "mulher", "homem"],
  faixaEtaria: ["de 20 e poucos anos", "de 25 anos", "de 30 anos", "adolescente"],
  roupa: [
    "vestindo moletom oversized e calça jogger",
    "vestindo top cropped e legging",
    "vestindo camiseta básica branca e jeans",
    "vestindo blazer casual sobre camiseta",
    "vestindo conjunto de treino esportivo",
    "vestindo vestido casual leve",
    "vestindo camisa social aberta sobre regata"
  ],
  movimento: [
    "girando o produto lentamente pra mostrar todos os ângulos",
    "gesticulando animadamente enquanto fala",
    "levando o produto próximo ao rosto pra mostrar detalhes",
    "caminhando casualmente enquanto segura o produto",
    "sentando e se inclinando pra frente com entusiasmo",
    "apontando pro produto com as duas mãos",
    "abrindo os braços em um gesto de surpresa"
  ],
  expressao: [
    "sorrindo genuinamente",
    "com expressão de surpresa e empolgação",
    "com olhar confiante e direto",
    "rindo naturalmente",
    "com expressão pensativa e sincera"
  ],
  cenario: [
    "em um quarto moderno e clean",
    "em uma sala iluminada com plantas ao fundo",
    "em uma cozinha minimalista",
    "em um espaço de home office organizado",
    "em um ambiente aconchegante com estante ao fundo"
  ],
  iluminacao: [
    "luz natural suave entrando pela janela",
    "hora dourada com tons quentes",
    "iluminação de estúdio suave e uniforme",
    "luz azulada de fim de tarde"
  ],
  audio: [
    "música pop animada de fundo, voz clara e envolvente",
    "sem música, apenas voz natural e próxima",
    "música lo-fi suave, tom descontraído",
    "música upbeat, voz entusiasmada"
  ],
  movimentoCamera: [
    "static camera at eye level",
    "camera slowly pushes in",
    "slow handheld movement",
    "camera slowly pans right"
  ]
};

const translations: Record<string, string> = {
  // Gênero
  "mulher jovem": "young woman",
  "homem jovem": "young man",
  "mulher": "woman",
  "homem": "man",

  // Faixa etária
  "de 25 anos": "aged 25",
  "de 30 anos": "aged 30",
  "adolescente": "teenager",

  // Roupa
  "vestindo moletom oversized e calça jogger": "wearing oversized sweatshirt and jogger pants",
  "vestindo top cropped e legging": "wearing cropped top and leggings",
  "vestindo camiseta básica branca e jeans": "wearing basic white t-shirt and jeans",
  "vestindo blazer casual sobre camiseta": "wearing casual blazer over t-shirt",
  "vestindo conjunto de treino esportivo": "wearing athletic training set",
  "vestindo vestido casual leve": "wearing light casual dress",
  "vestindo camisa social aberta sobre regata": "wearing open button-up shirt over tank top",

  // Movimento
  "girando o produto lentamente pra mostrar todos os ângulos": "slowly rotating the product to show all angles",
  "gesticulando animadamente enquanto fala": "gesturing animatedly while speaking",
  "levando o produto próximo ao rosto pra mostrar detalhes": "bringing the product close to face to show details",
  "caminhando casualmente enquanto segura o produto": "walking casually while holding the product",
  "sentando e se inclinando pra frente com entusiasmo": "sitting and leaning forward with enthusiasm",
  "apontando pro produto com as duas mãos": "pointing at the product with both hands",
  "abrindo os braços em um gesto de surpresa": "opening arms in a gesture of surprise",

  // Expressão
  "sorrindo genuinamente": "smiling genuinely",
  "com expressão de surpresa e empolgação": "with an expression of surprise and excitement",
  "com olhar confiante e direto": "with a confident and direct look",
  "rindo naturalmente": "laughing naturally",
  "com expressão pensativa e sincera": "with a thoughtful and sincere expression",

  // Cenário
  "em um quarto moderno e clean": "in a modern and clean bedroom",
  "em uma sala iluminada com plantas ao fundo": "in a well-lit living room with plants in the background",
  "em uma cozinha minimalista": "in a minimalist kitchen",
  "em um espaço de home office organizado": "in an organized home office space",
  "em um ambiente aconchegante com estante ao fundo": "in a cozy environment with a bookshelf in the background",

  // Iluminação
  "luz natural suave entrando pela janela": "soft natural light coming through the window",
  "hora dourada com tons quentes": "golden hour with warm tones",
  "iluminação de estúdio suave e uniforme": "soft and uniform studio lighting",
  "luz azulada de fim de tarde": "bluish late afternoon light",

  // Áudio
  "música pop animada de fundo, voz clara e envolvente": "upbeat pop music in the background, clear and engaging voice",
  "sem música, apenas voz natural e próxima": "no music, only close and natural voice",
  "música lo-fi suave, tom descontraído": "soft lo-fi music, relaxed tone",
  "música upbeat, voz entusiasmada": "upbeat music, enthusiastic voice"
};

const getFaixaEtariaTranslation = (faixa: string, isMale: boolean) => {
  if (faixa === "de 20 e poucos anos") {
    return isMale ? "in his early 20s" : "in her early 20s";
  }
  return translations[faixa] || faixa;
};

const PromptsReais = () => {
  const { toast } = useToast();

  // ─── Criar Prompt — persona ───────────────────────────────────────────────
  const [personaMode, setPersonaMode] = useState<"avatars" | "my-personas">("avatars");
  const [selectedAvatar, setSelectedAvatar] = useState<typeof PRESET_AVATARS[0] | null>(null);
  const [myPersonas, setMyPersonas] = useState<Array<{ id: string; name: string; image_url: string }>>([]);
  const [selectedMyPersona, setSelectedMyPersona] = useState<{ id: string; name: string; image_url: string } | null>(null);

  // ─── Criar Prompt — roupa ─────────────────────────────────────────────────
  const [createOutfitMode, setCreateOutfitMode] = useState<"catalog" | "upload">("catalog");
  const [createOutfitPreview, setCreateOutfitPreview] = useState<string | null>(null);
  const [createOutfitUrl, setCreateOutfitUrl] = useState<string | undefined>(undefined);
  const [createOutfitFile, setCreateOutfitFile] = useState<File | null>(null);
  const [showCreateCatalog, setShowCreateCatalog] = useState(false);
  const [createCatalogSearch, setCreateCatalogSearch] = useState("");
  const createOutfitRef = useRef<HTMLInputElement>(null);

  // ─── Criar Prompt — movimentos ────────────────────────────────────────────
  const [movementMode, setMovementMode] = useState<"text" | "video">("text");
  const [movementText, setMovementText] = useState("");
  const [movementVideo, setMovementVideo] = useState<File | null>(null);
  const movementVideoRef = useRef<HTMLInputElement>(null);

  // ─── Criar Prompt — cenário ───────────────────────────────────────────────
  const [scenarioText, setScenarioText] = useState("");

  // ─── Criar Prompt — output ────────────────────────────────────────────────
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // ─── Clonar Vídeo ─────────────────────────────────────────────────────────
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoContext, setVideoContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedPrompt, setAnalyzedPrompt] = useState("");
  const [copiedVideoPrompt, setCopiedVideoPrompt] = useState(false);
  
  // Plataforma & Inputs compartilhados
  const [platform, setPlatform] = useState<"veo3" | "youtube_create">("veo3");
  const [product, setProduct] = useState("");
  const [niche, setNiche] = useState("");

  // Presets & Truncamento
  const [suggestedStyle, setSuggestedStyle] = useState("");
  const [suggestedLighting, setSuggestedLighting] = useState("");
  const [isTruncated, setIsTruncated] = useState(false);

  // ─── Shared ───────────────────────────────────────────────────────────────
  const allProducts = videoProducts;
  const [remainingCounts, setRemainingCounts] = useState<number | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const fetchRemaining = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      if (user.email === "jpnogueiraz@gmail.com") { setIsAdminUser(true); return; }
      const today = new Date(); today.setUTCHours(0, 0, 0);
      const { count, error } = await supabase.from("growth_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id).eq("type", "real_prompt")
        .gte("created_at", today.toISOString());
      if (!error && count !== null) setRemainingCounts(Math.max(0, 5 - count));
      else setRemainingCounts(5);
    } catch { setRemainingCounts(5); }
  };

  useEffect(() => {
    fetchRemaining();
    // Load saved personas
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("user_personas")
        .select("id, name, image_url").order("created_at", { ascending: false });
      if (data) setMyPersonas(data as any);
    };
    load();
  }, []);

  // ─── Criar Prompt — helpers ───────────────────────────────────────────────
  const handleSelectCreateCatalogOutfit = (product: typeof allProducts[0]) => {
    const absoluteUrl = `${window.location.origin}${product.image}`;
    setCreateOutfitUrl(absoluteUrl);
    setCreateOutfitPreview(product.image);
    setCreateOutfitFile(null);
    setShowCreateCatalog(false);
    setCreateCatalogSearch("");
    toast({ title: "Roupa selecionada!", description: product.name });
  };

  const handleCreateOutfitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setCreateOutfitFile(file);
      setCreateOutfitUrl(undefined);
      const reader = new FileReader();
      reader.onload = ev => setCreateOutfitPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCreateOutfit = () => {
    setCreateOutfitFile(null);
    setCreateOutfitPreview(null);
    setCreateOutfitUrl(undefined);
    if (createOutfitRef.current) createOutfitRef.current.value = "";
  };

  const handleMovementVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setMovementVideo(e.target.files[0]);
  };

  const handleGeneratePrompt = async () => {
    const hasMovement = movementMode === "text" ? movementText.trim().length > 0 : !!movementVideo;
    if (!hasMovement) {
      toast({ title: "Campo vazio", description: "Descreva os movimentos ou envie um vídeo.", variant: "destructive" });
      return;
    }

    if (!isAdminUser && remainingCounts !== null && remainingCounts <= 0) {
      toast({ title: "Limite atingido", description: "Você atingiu o limite diário de 5 gerações na aba Prompts Reais.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      const fileToDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Convert outfit file if needed
      let finalOutfitUrl: string | undefined = createOutfitUrl;
      if (createOutfitFile && !createOutfitUrl) {
        finalOutfitUrl = await fileToDataURL(createOutfitFile);
      }

      // Build persona info
      let personaDescription: string | undefined;
      let personaImageUrl: string | undefined;
      if (selectedAvatar) {
        personaDescription = selectedAvatar.description;
      } else if (selectedMyPersona) {
        personaDescription = selectedMyPersona.name;
        personaImageUrl = selectedMyPersona.image_url;
      }

      const result = await generateRealPrompt({
        description: movementMode === "text" ? movementText.trim() : undefined,
        videoUrlOrFile: movementMode === "video" && movementVideo ? movementVideo : undefined,
        outfitImageUrl: finalOutfitUrl,
        personaDescription,
        personaImageUrl,
        scenario: scenarioText.trim() || undefined,
      });

      if (result.prompt) {
        setGeneratedPrompt(result.prompt);
        // Record usage in growth_usage
        await supabase.from("growth_usage").insert({ user_id: user.id, type: "real_prompt" });
        await fetchRemaining();
        toast({ title: "Prompt gerado!", description: "Seu prompt completo foi criado pela IA." });
      } else throw new Error("Nenhum prompt retornado");

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast({ title: "Erro ao gerar", description: msg.includes('abort') || msg.includes('Abort') ? 'Tempo limite excedido. Tente novamente.' : msg, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast({ title: "Copiado!", description: "Prompt copiado para a área de transferência." });
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Clonar Vídeo — helpers ───────────────────────────────────────────────
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedVideo(e.target.files[0]);
  };

  const handleOutfitImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedOutfitImage(file);
      setOutfitImageUrl(undefined);
      const reader = new FileReader();
      reader.onload = ev => setOutfitImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectCatalogOutfit = (product: typeof allProducts[0]) => {
    const absoluteUrl = `${window.location.origin}${product.image}`;
    setOutfitImageUrl(absoluteUrl);
    setOutfitImagePreview(product.image);
    setSelectedOutfitImage(null);
    setShowCatalog(false);
    setCatalogSearch("");
    toast({ title: "Roupa selecionada!", description: product.name });
  };

  const handleRemoveOutfit = () => {
    setSelectedOutfitImage(null);
    setOutfitImagePreview(null);
    setOutfitImageUrl(undefined);
    if (outfitInputRef.current) outfitInputRef.current.value = "";
  };

  interface Combination {
    genero: string;
    faixaEtaria: string;
    roupa: string;
    movimento: string;
    expressao: string;
    cenario: string;
    iluminacao: string;
    audio: string;
    movimentoCamera?: string;
  }

  const generateYouTubeCreate = (comb: Combination) => {
    // Uma [genero] [faixaEtaria], [roupa], [expressao], mostrando [produto] [cenario], [movimento extraído do vídeo]. [iluminacao]. Áudio: [audio].
    const rawPrompt = `Uma ${comb.genero} ${comb.faixaEtaria}, ${comb.roupa}, ${comb.expressao}, mostrando ${product.trim()} ${comb.cenario}, ${comb.movimento}. ${comb.iluminacao}. Áudio: ${comb.audio}.`;

    let finalPrompt = rawPrompt;
    let truncatedFlag = false;

    if (rawPrompt.length > 900) {
      const sub = rawPrompt.substring(0, 900);
      const lastPunct = Math.max(sub.lastIndexOf('.'), sub.lastIndexOf('!'), sub.lastIndexOf('?'));
      if (lastPunct !== -1) {
        finalPrompt = rawPrompt.substring(0, lastPunct + 1).trim();
      } else {
        const lastSpace = sub.lastIndexOf(' ');
        finalPrompt = (lastSpace !== -1 ? rawPrompt.substring(0, lastSpace).trim() : sub) + ".";
      }
      truncatedFlag = true;
    }

    // Presets
    const stylePreset = "Fotorrealista";
    const lightingPresetMap: Record<string, string> = {
      "luz natural suave entrando pela janela": "luz suave da manhã",
      "hora dourada com tons quentes": "hora dourada",
      "iluminação de estúdio suave e uniforme": "luz suave da manhã",
      "luz azulada de fim de tarde": "hora azul"
    };
    const lightingPreset = lightingPresetMap[comb.iluminacao] || "luz suave da manhã";

    setAnalyzedPrompt(finalPrompt);
    setSuggestedStyle(stylePreset);
    setSuggestedLighting(lightingPreset);
    setIsTruncated(truncatedFlag);
  };

  const generateVeo3 = (comb: Combination) => {
    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const seconds = getRandom(["6", "8"]);
    const isMale = comb.genero.includes("homem");

    const translatedGenero = translations[comb.genero] || comb.genero;
    const translatedFaixaEtaria = getFaixaEtariaTranslation(comb.faixaEtaria, isMale);
    const translatedRoupa = translations[comb.roupa] || comb.roupa;
    const translatedExpressao = translations[comb.expressao] || comb.expressao;
    const translatedCenario = translations[comb.cenario] || comb.cenario;
    const translatedIluminacao = translations[comb.iluminacao] || comb.iluminacao;
    const translatedAudio = translations[comb.audio] || comb.audio;

    // Medium shot, camera [movimentoCamera]. A [genero] [faixaEtaria], [roupa traduzida pro inglês], [expressao traduzida], [movimento extraído do vídeo, traduzido pro inglês], [cenario traduzido]. Cinematic quality, [iluminacao traduzida], natural skin tones, 9:16 vertical format, [6 ou 8, sortear] seconds. Audio: [audio traduzido].
    const finalPrompt = `Medium shot, camera ${comb.movimentoCamera}. A ${translatedGenero} ${translatedFaixaEtaria}, ${translatedRoupa}, ${translatedExpressao}, ${comb.movimento}, ${translatedCenario}. Cinematic quality, ${translatedIluminacao}, natural skin tones, 9:16 vertical format, ${seconds} seconds. Audio: ${translatedAudio}.`;

    setAnalyzedPrompt(finalPrompt);
    setSuggestedStyle("");
    setSuggestedLighting("");
    setIsTruncated(false);
  };

  const handleAnalyzeVideo = async () => {
    if (!selectedVideo) {
      toast({ title: "Nenhum vídeo", description: "Faça o upload de um vídeo primeiro.", variant: "destructive" });
      return;
    }

    if (!product.trim()) {
      toast({ title: "Produto ausente", description: "Por favor, informe o produto para gerar o prompt.", variant: "destructive" });
      return;
    }

    if (!isAdminUser && remainingCounts !== null && remainingCounts <= 0) {
      toast({ title: "Limite atingido", description: "Você atingiu o limite diário de 5 gerações na aba Prompts Reais.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setAnalyzedPrompt("");

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 20000);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      // Step 1: Extract movements from video using Vercel serverless function
      const token = await getFreshAccessToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      let videoBase64 = "";
      let videoMimeType = "";
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedVideo);
      });
      videoBase64 = await base64Promise;
      videoMimeType = selectedVideo.type;

      console.log("[analyze] Enviando vídeo para o backend...");
      const res = await fetch("/api/analyze-video-movements", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode: "movement_only",
          language: platform === "youtube_create" ? "pt" : "en",
          videoBase64,
          videoMimeType,
          context: videoContext.trim() || undefined
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao analisar o vídeo.");
      }

      const resData = await res.json();
      const extractedMovement = resData.prompt?.trim();

      if (!extractedMovement) {
        throw new Error("Não conseguimos analisar o vídeo, tente novamente.");
      }

      // Step 2 & 3: Sorteio das demais variáveis combinatórias com checagem de duplicidade (máx 10 tentativas)
      const { data: historyData } = await supabase
        .from("prompt_history")
        .select("combination")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const last5 = (historyData?.map(h => h.combination) || []) as Combination[];
      const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

      let comb: Combination = {
        genero: "",
        faixaEtaria: "",
        roupa: "",
        movimento: extractedMovement,
        expressao: "",
        cenario: "",
        iluminacao: "",
        audio: ""
      };

      let isDuplicate = true;
      let attempts = 0;

      while (isDuplicate && attempts < 10) {
        comb = {
          genero: getRandom(variables.genero),
          faixaEtaria: getRandom(variables.faixaEtaria),
          roupa: getRandom(variables.roupa),
          movimento: extractedMovement,
          expressao: getRandom(variables.expressao),
          cenario: getRandom(variables.cenario),
          iluminacao: getRandom(variables.iluminacao),
          audio: getRandom(variables.audio),
          ...(platform === "veo3" ? { movimentoCamera: getRandom(variables.movimentoCamera) } : {})
        };

        const found = last5.some(oldComb => {
          return (
            comb.genero === oldComb.genero &&
            comb.faixaEtaria === oldComb.faixaEtaria &&
            comb.roupa === oldComb.roupa &&
            comb.expressao === oldComb.expressao &&
            comb.cenario === oldComb.cenario &&
            comb.iluminacao === oldComb.iluminacao &&
            comb.audio === oldComb.audio &&
            (platform === "veo3" ? comb.movimentoCamera === oldComb.movimentoCamera : true)
          );
        });

        if (!found) {
          isDuplicate = false;
        }
        attempts++;
      }

      // Step 4: Montagem do prompt final
      if (platform === "youtube_create") {
        generateYouTubeCreate(comb);
      } else {
        generateVeo3(comb);
      }

      // Save combination to prompt_history
      const { error: insertError } = await supabase
        .from("prompt_history")
        .insert({
          user_id: user.id,
          combination: comb as any
        });

      if (insertError) {
        console.error("Erro ao salvar histórico de combinação:", insertError);
      }

      // Register usage log in growth_usage
      const { error: usageError } = await supabase
        .from("growth_usage")
        .insert({
          user_id: user.id,
          type: "real_prompt"
        });

      if (usageError) {
        console.error("Erro ao registrar uso:", usageError);
      }

      await fetchRemaining();
      toast({ title: "Prompt Gerado!", description: "Movimentos clonados e variáveis combinadas com sucesso." });

    } catch (err: any) {
      console.error(err);
      clearTimeout(timeoutId);
      const isAbort = err.name === "AbortError" || err.message?.includes("abort");
      const errorMsg = isAbort 
        ? "Não conseguimos analisar o vídeo, tente novamente (tempo limite de 20s excedido)." 
        : (err.message || "Não conseguimos analisar o vídeo, tente novamente.");
      toast({ title: "Falha na análise", description: errorMsg, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyVideoPrompt = () => {
    navigator.clipboard.writeText(analyzedPrompt);
    setCopiedVideoPrompt(true);
    toast({ title: "Copiado!", description: "Prompt copiado para a área de transferência." });
    setTimeout(() => setCopiedVideoPrompt(false), 2000);
  };

  // ─── Reusable outfit catalog block ────────────────────────────────────────
  const OutfitCatalogBlock = ({
    mode, setMode, preview, showCat, setShowCat, search, setSearch,
    inputRef, onUpload, onCatalogSelect, onRemove,
  }: {
    mode: "catalog" | "upload"; setMode: (m: "catalog" | "upload") => void;
    preview: string | null; showCat: boolean; setShowCat: (v: boolean | ((p: boolean) => boolean)) => void;
    search: string; setSearch: (s: string) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCatalogSelect: (p: typeof allProducts[0]) => void;
    onRemove: () => void;
  }) => (
    <div>
      <label className="text-sm font-medium mb-2 flex items-center gap-2">
        <Shirt className="w-4 h-4 text-tiktok-pink" />
        Roupa desejada
        <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
      </label>
      <p className="text-xs text-muted-foreground mb-3">
        Escolha uma roupa do catálogo ou faça upload — a IA vai descrever esse look no prompt.
      </p>
      <div className="flex gap-2 mb-3">
        {(["catalog", "upload"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${mode === m ? "bg-tiktok-pink/10 border-tiktok-pink/40 text-tiktok-pink" : "border-border/40 text-muted-foreground hover:border-border"}`}>
            {m === "catalog" ? "Catálogo do sistema" : "Fazer upload"}
          </button>
        ))}
      </div>
      {preview && (
        <div className="relative group rounded-2xl overflow-hidden border border-tiktok-pink/30 bg-muted/10 mb-2">
          <img src={preview} alt="Roupa" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button onClick={onRemove} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/70 backdrop-blur text-white text-xs font-medium hover:bg-red-500/90 transition-colors">
              <X className="w-3.5 h-3.5" /> Remover
            </button>
          </div>
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-tiktok-pink/80 backdrop-blur text-white text-xs font-semibold">
              <Check className="w-3 h-3" /> Roupa selecionada
            </div>
          </div>
        </div>
      )}
      {mode === "catalog" && (
        <div>
          <button onClick={() => setShowCat(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-border/60 hover:border-tiktok-pink/50 bg-muted/10 hover:bg-muted/20 transition-all text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Shirt className="w-4 h-4" />
              {preview ? "Trocar roupa do catálogo" : "Escolher roupa do catálogo"}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCat ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showCat && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="mt-3 p-3 rounded-xl bg-muted/20 border border-border/40">
                  <Input placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)}
                    className="mb-3 h-8 text-xs rounded-lg bg-background/50 border-border/50" />
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                    {allProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
                      <button key={product.id} onClick={() => onCatalogSelect(product)}
                        className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-tiktok-pink/60 transition-all bg-background/50">
                        <img src={product.image} alt={product.name} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                        <p className="text-[10px] text-center px-1 py-1 leading-tight text-muted-foreground truncate">{product.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {mode === "upload" && !preview && (
        <div className="relative group w-full h-28 rounded-2xl border-2 border-dashed border-border/60 hover:border-tiktok-pink/50 transition-colors flex flex-col items-center justify-center bg-muted/10 hover:bg-muted/20 cursor-pointer"
          onClick={() => inputRef.current?.click()}>
          <div className="w-10 h-10 rounded-full bg-tiktok-pink/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ImagePlus className="w-5 h-5 text-tiktok-pink/70" />
          </div>
          <p className="text-sm font-medium text-foreground">Clique para fazer upload</p>
          <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP</p>
        </div>
      )}
      {mode === "upload" && preview && (
        <button onClick={() => inputRef.current?.click()}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
          <ImagePlus className="w-3.5 h-3.5 inline mr-1" /> Trocar imagem
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onUpload} className="hidden" />
    </div>
  );

  // ─── Step label helper ────────────────────────────────────────────────────
  const StepBadge = ({ n, color }: { n: number; color: string }) => (
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${color}`}>{n}</span>
  );

  return (
    <div className="min-h-screen">
      <main className="p-4 md:p-6 lg:p-8 max-w-[1000px] mx-auto space-y-8">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center shadow-lg shadow-tiktok-cyan/20">
              <MessageSquare className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Prompts <span className="gradient-text">Reais</span>
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground ml-[52px]">
            Monte o prompt perfeito com persona, roupa, movimentos e cenário — ou clone movimentos de um vídeo.
          </p>
        </motion.div>

        {/* Usage notice */}
        {!isAdminUser && (
          <div className="glass-card inner-shine relative overflow-hidden p-4 text-sm w-full">
            <p className="font-semibold mb-2">⚡ Suas gerações</p>
            <div className="flex flex-wrap gap-4 text-xs">
              <span>Grátis hoje: <strong className="text-tiktok-cyan">{remainingCounts !== null ? remainingCounts : "..."}/5</strong></span>
            </div>
          </div>
        )}

        <Tabs defaultValue="criar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-1">
            <TabsTrigger value="criar" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
              <Wand2 className="w-4 h-4 mr-2" /> Criar Prompt
            </TabsTrigger>
            <TabsTrigger value="clonar" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
              <ScanFace className="w-4 h-4 mr-2" /> Clonar Vídeos
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════ TAB 1: CRIAR PROMPT ══════════════════ */}
          <TabsContent value="criar" className="focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">

              {/* ── STEP 1: PERSONA ── */}
              <Card className="glass-card inner-shine p-6 border-border/50">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <StepBadge n={1} color="bg-tiktok-cyan/20 text-tiktok-cyan" />
                  <User className="w-4 h-4 text-tiktok-cyan" />
                  Persona
                  <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                </h3>

                {/* Mode tabs */}
                <div className="flex gap-2 mb-4">
                  <button onClick={() => { setPersonaMode("avatars"); setSelectedMyPersona(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${personaMode === "avatars" ? "bg-tiktok-cyan/10 border-tiktok-cyan/40 text-tiktok-cyan" : "border-border/40 text-muted-foreground hover:border-border"}`}>
                    Avatares prontos
                  </button>
                  {myPersonas.length > 0 && (
                    <button onClick={() => { setPersonaMode("my-personas"); setSelectedAvatar(null); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${personaMode === "my-personas" ? "bg-tiktok-cyan/10 border-tiktok-cyan/40 text-tiktok-cyan" : "border-border/40 text-muted-foreground hover:border-border"}`}>
                      Minhas Personas
                    </button>
                  )}
                </div>

                {personaMode === "avatars" && (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {PRESET_AVATARS.map(av => (
                      <button key={av.id} onClick={() => setSelectedAvatar(selectedAvatar?.id === av.id ? null : av)}
                        className="text-center flex flex-col items-center gap-1">
                        <div className={cn("w-14 h-14 rounded-full overflow-hidden border-[3px] transition-all",
                          selectedAvatar?.id === av.id ? "border-tiktok-cyan ring-2 ring-tiktok-cyan/30" : "border-transparent hover:border-border")}>
                          <img src={av.avatar} alt={av.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium">{av.name}</p>
                      </button>
                    ))}
                  </div>
                )}

                {personaMode === "my-personas" && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {myPersonas.map(p => (
                      <button key={p.id} onClick={() => setSelectedMyPersona(selectedMyPersona?.id === p.id ? null : p)}
                        className="text-center flex flex-col items-center gap-1">
                        <div className={cn("w-14 h-14 rounded-full overflow-hidden border-[3px] transition-all",
                          selectedMyPersona?.id === p.id ? "border-tiktok-cyan ring-2 ring-tiktok-cyan/30" : "border-transparent hover:border-border")}>
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium truncate max-w-[56px]">{p.name}</p>
                      </button>
                    ))}
                  </div>
                )}

                {(selectedAvatar || selectedMyPersona) && (
                  <p className="mt-3 text-xs text-tiktok-cyan flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {selectedAvatar ? selectedAvatar.name : selectedMyPersona?.name} selecionada
                  </p>
                )}
              </Card>

              {/* ── STEP 2: ROUPA ── */}
              <Card className="glass-card inner-shine p-6 border-border/50">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <StepBadge n={2} color="bg-tiktok-pink/20 text-tiktok-pink" />
                  <Shirt className="w-4 h-4 text-tiktok-pink" />
                  Roupa
                  <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                </h3>
                <OutfitCatalogBlock
                  mode={createOutfitMode} setMode={setCreateOutfitMode}
                  preview={createOutfitPreview} showCat={showCreateCatalog} setShowCat={setShowCreateCatalog}
                  search={createCatalogSearch} setSearch={setCreateCatalogSearch}
                  inputRef={createOutfitRef} onUpload={handleCreateOutfitUpload}
                  onCatalogSelect={handleSelectCreateCatalogOutfit} onRemove={handleRemoveCreateOutfit}
                />
              </Card>

              {/* ── STEP 3: MOVIMENTOS ── */}
              <Card className="glass-card inner-shine p-6 border-border/50">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <StepBadge n={3} color="bg-tiktok-cyan/20 text-tiktok-cyan" />
                  <Video className="w-4 h-4 text-tiktok-cyan" />
                  Movimentos
                  <span className="text-xs text-red-400 font-normal">(obrigatório)</span>
                </h3>

                <div className="flex gap-2 mb-4">
                  <button onClick={() => setMovementMode("text")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${movementMode === "text" ? "bg-tiktok-cyan/10 border-tiktok-cyan/40 text-tiktok-cyan" : "border-border/40 text-muted-foreground hover:border-border"}`}>
                    Descrever em texto
                  </button>
                  <button onClick={() => setMovementMode("video")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${movementMode === "video" ? "bg-tiktok-cyan/10 border-tiktok-cyan/40 text-tiktok-cyan" : "border-border/40 text-muted-foreground hover:border-border"}`}>
                    Enviar vídeo para copiar
                  </button>
                </div>

                {movementMode === "text" && (
                  <Textarea
                    placeholder="Ex: A personagem sorri suavemente, vira o rosto para a direita e pisca lentamente. Depois olha direto para a câmera com expressão confiante..."
                    className="min-h-[120px] resize-none rounded-xl bg-background/50 border-border/50 focus-visible:ring-tiktok-cyan/50"
                    value={movementText} onChange={e => setMovementText(e.target.value)}
                  />
                )}

                {movementMode === "video" && (
                  <div className="relative group">
                    <input ref={movementVideoRef} type="file" accept="video/*" onChange={handleMovementVideoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full h-36 rounded-2xl border-2 border-dashed border-border/60 group-hover:border-tiktok-cyan/50 transition-colors flex flex-col items-center justify-center bg-muted/10 group-hover:bg-muted/20">
                      {movementVideo ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-tiktok-cyan/20 flex items-center justify-center mb-2">
                            <Check className="w-6 h-6 text-tiktok-cyan" />
                          </div>
                          <p className="text-sm font-medium">{movementVideo.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Clique para trocar</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium">Clique ou arraste o vídeo aqui</p>
                          <p className="text-xs text-muted-foreground mt-1">MP4, WebM até 50MB • A IA vai copiar os movimentos</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* ── STEP 4: CENÁRIO ── */}
              <Card className="glass-card inner-shine p-6 border-border/50">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <StepBadge n={4} color="bg-tiktok-pink/20 text-tiktok-pink" />
                  <MapPin className="w-4 h-4 text-tiktok-pink" />
                  Cenário real
                  <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                </h3>
                <Textarea
                  placeholder="Ex: Rua movimentada de São Paulo ao entardecer, praia com areia branca e mar azul, sala de estar moderna e minimalista..."
                  className="min-h-[90px] resize-none rounded-xl bg-background/50 border-border/50 focus-visible:ring-tiktok-pink/50"
                  value={scenarioText} onChange={e => setScenarioText(e.target.value)}
                />
              </Card>

              {/* ── GENERATE BUTTON ── */}
              <Button
                onClick={handleGeneratePrompt}
                disabled={isGenerating || (movementMode === "text" ? !movementText.trim() : !movementVideo)}
                className="w-full gap-2 rounded-xl h-13 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background btn-glow shadow-lg shadow-tiktok-pink/20 font-semibold text-base"
              >
                {isGenerating ? (
                  <><Sparkles className="w-5 h-5 animate-spin" /> {movementMode === "video" ? "A IA está analisando o vídeo e montando o prompt..." : "Criando o prompt completo..."}</>
                ) : (
                  <><Wand2 className="w-5 h-5" /> Gerar Prompt Completo</>
                )}
              </Button>

              {/* ── OUTPUT ── */}
              {generatedPrompt && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="glass-card inner-shine p-6 border-border/50 bg-gradient-to-b from-card/40 to-muted/10">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-tiktok-pink/20 flex items-center justify-center text-xs font-bold text-tiktok-pink">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                        Prompt Completo (Em Inglês)
                      </h3>
                      <p className="text-sm text-muted-foreground">Pronto para usar no Kling, Luma, Runway e outros.</p>
                    </div>
                    <div className="relative">
                      <Textarea readOnly value={generatedPrompt}
                        className="min-h-[160px] resize-none rounded-xl bg-background/80 border-tiktok-pink/30 text-foreground text-sm leading-relaxed pb-12" />
                      <Button onClick={handleCopy} variant="secondary" size="sm"
                        className="absolute bottom-3 right-3 gap-2 shadow-md hover:bg-muted/80 backdrop-blur-md">
                        {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          {/* ══════════════════ TAB 2: CLONAR VÍDEOS ══════════════════ */}
          <TabsContent value="clonar" className="focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card className="glass-card inner-shine p-6 md:p-8 max-w-2xl mx-auto border-border/50">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tiktok-cyan/10 to-tiktok-pink/10 flex items-center justify-center mx-auto mb-4 border border-border/50">
                    <Video className="w-8 h-8 text-tiktok-cyan" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Clonar Movimentos</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Faça upload de um vídeo de referência para copiar exclusivamente os movimentos, com plataforma de destino e sorteio único de vestuário e cenário.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Seletor de Plataforma */}
                  <div>
                    <label className="text-sm font-medium mb-2.5 block text-muted-foreground">
                      Plataforma de Destino
                    </label>
                    <div className="flex gap-2 p-1 bg-muted/20 border border-border/40 rounded-xl max-w-[340px]">
                      <button
                        onClick={() => {
                          setPlatform("veo3");
                          setAnalyzedPrompt("");
                        }}
                        className={cn(
                          "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300",
                          platform === "veo3"
                            ? "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background shadow-md shadow-tiktok-pink/20"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Veo 3
                      </button>
                      <button
                        onClick={() => {
                          setPlatform("youtube_create");
                          setAnalyzedPrompt("");
                        }}
                        className={cn(
                          "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300",
                          platform === "youtube_create"
                            ? "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background shadow-md shadow-tiktok-pink/20"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        YouTube Create
                      </button>
                    </div>
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Vídeo de Referência <span className="text-xs text-red-400 font-normal">(obrigatório)</span>
                    </label>
                    <div className="relative group">
                      <input type="file" accept="video/*" onChange={handleVideoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full h-36 rounded-2xl border-2 border-dashed border-border/60 group-hover:border-tiktok-cyan/50 transition-colors flex flex-col items-center justify-center bg-muted/10 group-hover:bg-muted/20">
                        {selectedVideo ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-tiktok-cyan/20 flex items-center justify-center mb-2">
                              <Check className="w-6 h-6 text-tiktok-cyan" />
                            </div>
                            <p className="text-sm font-medium text-foreground">{selectedVideo.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Clique para trocar</p>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                              <UploadCloud className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Clique ou arraste um vídeo aqui</p>
                            <p className="text-xs text-muted-foreground mt-1">MP4, WebM até 50MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inputs Compartilhados */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Produto <span className="text-xs text-red-400 font-normal">(obrigatório)</span>
                      </label>
                      <Input
                        placeholder="Ex: Clareador Dental 9D..."
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="rounded-xl bg-background/50 border-border/50 focus-visible:ring-tiktok-pink/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-muted-foreground">
                        Nicho <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                      </label>
                      <Input
                        placeholder="Ex: Beleza, Casa..."
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className="rounded-xl bg-background/50 border-border/50 focus-visible:ring-tiktok-pink/50 text-sm"
                      />
                    </div>
                  </div>

                  {/* Context */}
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      Instruções para a IA (Opcional)
                    </label>
                    <Textarea placeholder="Ex: Focar mais na expressão facial, ignorar movimentos de fundo..."
                      className="resize-none h-20 rounded-xl bg-background/50 border-border/50 focus-visible:ring-tiktok-pink/50 text-sm"
                      value={videoContext} onChange={e => setVideoContext(e.target.value)} />
                  </div>

                  {/* Submit */}
                  <Button onClick={handleAnalyzeVideo} disabled={isAnalyzing || !selectedVideo || !product.trim()}
                    className="w-full gap-2 rounded-xl h-12 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background btn-glow shadow-lg shadow-tiktok-cyan/20 font-semibold">
                    {isAnalyzing ? (
                      <><Sparkles className="w-5 h-5 animate-spin" /> A IA está analisando o vídeo e clonando movimentos...</>
                    ) : (
                      <><ScanFace className="w-5 h-5" /> Analisar Vídeo e Clonar Movimentos</>
                    )}
                  </Button>

                  {/* Output */}
                  {analyzedPrompt && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-6 border-t border-border/20 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded-full bg-tiktok-pink/20 flex items-center justify-center text-xs font-bold text-tiktok-pink">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          {platform === "youtube_create" ? "Prompt YouTube Create (Em Português)" : "Prompt Veo 3 (Em Inglês)"}
                        </h3>
                        <p className="text-xs text-muted-foreground">O prompt gerado é editável e você pode ajustá-lo abaixo.</p>
                      </div>

                      <div className="relative">
                        <Textarea 
                          value={analyzedPrompt} 
                          onChange={(e) => setAnalyzedPrompt(e.target.value)}
                          className="min-h-[160px] resize-none rounded-xl bg-background/80 border-tiktok-pink/30 text-foreground text-sm leading-relaxed pb-12" 
                        />
                        
                        {/* Contador de caracteres em tempo real */}
                        <div
                          className={cn(
                            "absolute bottom-3 left-3 text-xs font-semibold px-2 py-0.5 rounded",
                            platform === "youtube_create" && analyzedPrompt.length > 900
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : "bg-muted/40 text-muted-foreground"
                          )}
                        >
                          {analyzedPrompt.length} {platform === "youtube_create" ? "/900" : ""} caracteres {platform === "youtube_create" && analyzedPrompt.length > 900 && "(Limite excedido!)"}
                        </div>

                        <Button onClick={handleCopyVideoPrompt} variant="secondary" size="sm"
                          className="absolute bottom-3 right-3 gap-2 shadow-md hover:bg-muted/80 backdrop-blur-md">
                          {copiedVideoPrompt ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                        </Button>
                      </div>

                      {/* Presets do YouTube Create */}
                      {platform === "youtube_create" && (
                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 rounded-xl bg-muted/10 border border-border/30">
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
                              Estilo sugerido no app
                            </p>
                            <span className="text-sm font-semibold text-tiktok-cyan">
                              {suggestedStyle}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/10 border border-border/30">
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
                              Iluminação sugerida no app
                            </p>
                            <span className="text-sm font-semibold text-tiktok-pink capitalize">
                              {suggestedLighting}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Alerta de Truncamento do YouTube Create */}
                      {isTruncated && platform === "youtube_create" && (
                        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
                          ⚠️ <strong>Aviso:</strong> O prompt excedeu o limite máximo de 900 caracteres do YouTube Create e foi automaticamente truncado na última frase completa cabível para garantir a compatibilidade.
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
};

export default PromptsReais;
