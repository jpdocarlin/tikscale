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

  const [selectedOutfitImage, setSelectedOutfitImage] = useState<File | null>(null);
  const [outfitImagePreview, setOutfitImagePreview] = useState<string | null>(null);
  const [outfitImageUrl, setOutfitImageUrl] = useState<string | undefined>(undefined);
  const [outfitMode, setOutfitMode] = useState<"catalog" | "upload">("catalog");
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const outfitInputRef = useRef<HTMLInputElement>(null);

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

    setIsGenerating(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const accessToken = await getFreshAccessToken();
      if (!accessToken) {
        toast({ title: "Sessão expirada", description: "Faça login novamente", variant: "destructive" });
        return;
      }

      // Get user for file uploads
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      // Upload movement video if provided
      let movementVideoUrl: string | undefined;
      let movementVideoPath: string | undefined;
      if (movementMode === "video" && movementVideo) {
        movementVideoPath = `temp_videos/${user.id}/${Date.now()}_${movementVideo.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        const { error: ve } = await supabase.storage.from("personas").upload(movementVideoPath, movementVideo, { contentType: movementVideo.type });
        if (ve) throw new Error("Erro ao fazer upload do vídeo de movimentos");
        const { data: vUrl } = supabase.storage.from("personas").getPublicUrl(movementVideoPath);
        movementVideoUrl = vUrl.publicUrl;
      }

      // Upload outfit file if needed
      let finalOutfitUrl: string | undefined = createOutfitUrl;
      let outfitFilePath: string | undefined;
      if (createOutfitFile && !createOutfitUrl) {
        outfitFilePath = `temp_outfits/${user.id}/${Date.now()}_${createOutfitFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        const { error: oe } = await supabase.storage.from("personas").upload(outfitFilePath, createOutfitFile, { contentType: createOutfitFile.type });
        if (oe) throw new Error("Erro ao fazer upload da roupa");
        const { data: oUrl } = supabase.storage.from("personas").getPublicUrl(outfitFilePath);
        finalOutfitUrl = oUrl.publicUrl;
      }

      // Build persona info
      let personaDescription: string | undefined;
      let personaImageUrl: string | undefined;
      if (selectedAvatar) {
        personaDescription = selectedAvatar.description;
        // Convert avatar to base64 URL won't work server-side; pass description only
      } else if (selectedMyPersona) {
        personaDescription = selectedMyPersona.name;
        personaImageUrl = selectedMyPersona.image_url;
      }

      const abortController = new AbortController();
      const abortTimeout = window.setTimeout(() => abortController.abort(), 90_000);

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-real-prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, apikey: publishableKey },
        body: JSON.stringify({
          description: movementMode === "text" ? movementText.trim() : undefined,
          videoUrl: movementVideoUrl,
          outfitImageUrl: finalOutfitUrl,
          personaDescription,
          personaImageUrl,
          scenario: scenarioText.trim() || undefined,
        }),
        signal: abortController.signal,
      }).finally(() => window.clearTimeout(abortTimeout));

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao gerar prompt");
      }

      const data = await response.json();
      if (data.prompt) {
        setGeneratedPrompt(data.prompt);
        fetchRemaining();
        toast({ title: "Prompt gerado!", description: "Seu prompt completo foi criado pela IA." });
      } else throw new Error("Nenhum prompt retornado");

      // Cleanup temp files
      const toRemove: string[] = [];
      if (movementVideoPath) toRemove.push(movementVideoPath);
      if (outfitFilePath) toRemove.push(outfitFilePath);
      if (toRemove.length) await supabase.storage.from("personas").remove(toRemove);

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

  const handleAnalyzeVideo = async () => {
    if (!selectedVideo) {
      toast({ title: "Nenhum vídeo", description: "Faça o upload de um vídeo primeiro.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setAnalyzedPrompt("");
    try {
      const accessToken = await getFreshAccessToken();
      if (!accessToken) { toast({ title: "Sessão expirada", description: "Faça login novamente", variant: "destructive" }); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      const filePath = `temp_videos/${user.id}/${Date.now()}_${selectedVideo.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const { error: uploadError } = await supabase.storage.from("personas").upload(filePath, selectedVideo, { contentType: selectedVideo.type });
      if (uploadError) throw new Error("Erro ao fazer upload do vídeo");
      const { data: urlData } = supabase.storage.from("personas").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      let finalOutfitImageUrl: string | undefined = outfitImageUrl;
      let outfitFilePath: string | undefined;
      if (selectedOutfitImage && !outfitImageUrl) {
        outfitFilePath = `temp_outfits/${user.id}/${Date.now()}_${selectedOutfitImage.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        const { error: oe } = await supabase.storage.from("personas").upload(outfitFilePath, selectedOutfitImage, { contentType: selectedOutfitImage.type });
        if (oe) throw new Error("Erro ao fazer upload da imagem da roupa");
        const { data: od } = supabase.storage.from("personas").getPublicUrl(outfitFilePath);
        finalOutfitImageUrl = od.publicUrl;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const abortController2 = new AbortController();
      const abortTimeout2 = window.setTimeout(() => abortController2.abort(), 90_000);

      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-video-movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, apikey: publishableKey },
        body: JSON.stringify({ videoUrl: publicUrl, context: videoContext, outfitImageUrl: finalOutfitImageUrl }),
        signal: abortController2.signal,
      }).finally(() => window.clearTimeout(abortTimeout2));
      if (!response.ok) { const e = await response.json().catch(() => ({})); throw new Error(e.error || "Erro ao analisar vídeo"); }
      const data = await response.json();
      if (data.prompt) {
        setAnalyzedPrompt(data.prompt);
        fetchRemaining();
        toast({ title: "Vídeo Analisado!", description: "Os movimentos foram mapeados e o prompt em inglês foi gerado." });
      } else throw new Error("Nenhum prompt retornado");

      const toRemove = [filePath];
      if (outfitFilePath) toRemove.push(outfitFilePath);
      await supabase.storage.from("personas").remove(toRemove);
    } catch (err) {
      const msg2 = err instanceof Error ? err.message : "Erro desconhecido";
      toast({ title: "Erro na análise", description: msg2.includes('abort') || msg2.includes('Abort') ? 'Tempo limite excedido. Tente novamente.' : msg2, variant: "destructive" });
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
                    Faça upload de um vídeo e a IA irá analisar e copiar exclusivamente os movimentos do personagem central.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Video Upload */}
                  <div className="relative group">
                    <input type="file" accept="video/*" onChange={handleVideoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full h-40 rounded-2xl border-2 border-dashed border-border/60 group-hover:border-tiktok-cyan/50 transition-colors flex flex-col items-center justify-center bg-muted/10 group-hover:bg-muted/20">
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

                  {/* Outfit for Clonar */}
                  <OutfitCatalogBlock
                    mode={outfitMode} setMode={setOutfitMode}
                    preview={outfitImagePreview} showCat={showCatalog} setShowCat={setShowCatalog}
                    search={catalogSearch} setSearch={setCatalogSearch}
                    inputRef={outfitInputRef} onUpload={handleOutfitImageUpload}
                    onCatalogSelect={handleSelectCatalogOutfit} onRemove={handleRemoveOutfit}
                  />

                  {/* Context */}
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      Instruções para a IA (Opcional)
                    </label>
                    <Textarea placeholder="Ex: Focar mais na expressão facial, ignorar movimentos de fundo..."
                      className="resize-none h-24 rounded-xl bg-background/50 border-border/50 focus-visible:ring-tiktok-pink/50"
                      value={videoContext} onChange={e => setVideoContext(e.target.value)} />
                  </div>

                  {/* Submit */}
                  <Button onClick={handleAnalyzeVideo} disabled={isAnalyzing || !selectedVideo}
                    className="w-full gap-2 rounded-xl h-12 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background btn-glow shadow-lg shadow-tiktok-cyan/20 font-semibold">
                    {isAnalyzing ? (
                      <><Sparkles className="w-5 h-5 animate-spin" /> A IA está assistindo o vídeo e analisando os movimentos...</>
                    ) : (
                      <><ScanFace className="w-5 h-5" /> Analisar Vídeo e Clonar Movimentos</>
                    )}
                  </Button>

                  {/* Output */}
                  {analyzedPrompt && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-6 border-t border-border/20">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded-full bg-tiktok-pink/20 flex items-center justify-center text-xs font-bold text-tiktok-pink">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          Prompt Gerado (Em Inglês)
                        </h3>
                        <p className="text-sm text-muted-foreground">Use este prompt na IA de vídeo para replicar os movimentos.</p>
                      </div>
                      <div className="relative flex flex-col">
                        <Textarea readOnly value={analyzedPrompt}
                          className="min-h-[150px] resize-none rounded-xl bg-background/80 border-tiktok-pink/30 text-foreground text-sm leading-relaxed pb-12" />
                        <Button onClick={handleCopyVideoPrompt} variant="secondary" size="sm"
                          className="absolute bottom-3 right-3 gap-2 shadow-md hover:bg-muted/80 backdrop-blur-md">
                          {copiedVideoPrompt ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                        </Button>
                      </div>
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
