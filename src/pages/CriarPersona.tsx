import { useState, useRef, useEffect, useCallback } from "react";
import { Footer } from "@/components/Footer";
import { PersonaBuilder, PersonaConfig, personaToDescription, defaultPersona } from "@/components/PersonaBuilder";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Plus, Download, Loader2, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getFreshAccessToken } from "@/lib/getFreshAccessToken";
import { resizeImage } from "@/lib/imageUtils";
import { useDailyUsage } from "@/hooks/useDailyUsage";
import { BuyCreditsModal } from "@/components/BuyCreditsModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generatePersonaImage } from "@/lib/googleAI";

interface SavedPersona {
  id: string;
  imageUrl: string;
  name: string;
  createdAt: string;
}

type CreationMode = "builder" | "photo";

const CriarPersona = () => {
  const [personaConfig, setPersonaConfig] = useState<PersonaConfig>(defaultPersona);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [savedPersonas, setSavedPersonas] = useState<SavedPersona[]>([]);
  const [selectedSavedPersona, setSelectedSavedPersona] = useState<SavedPersona | null>(null);
  const [creationMode, setCreationMode] = useState<CreationMode>("builder");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveFailed, setAutoSaveFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { personasRemaining, paidCredits, isAdmin, incrementUsage, refundCredit } = useDailyUsage();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const isMountedRef = useRef(true);

  // Load saved personas from Supabase on mount
  useEffect(() => {
    isMountedRef.current = true;
    const loadPersonas = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_personas")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setSavedPersonas(data.map((p: any) => ({
          id: p.id,
          imageUrl: p.image_url,
          name: p.name,
          createdAt: p.created_at,
        })));
      }
    };
    loadPersonas();
    return () => { isMountedRef.current = false; };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const resized = await resizeImage(file, 800, 800);
      setReferenceImage(resized);
      setReferencePreview(resized);
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao processar a foto", variant: "destructive" });
    }
  };

  const urlToBlob = async (imageUrl: string): Promise<Blob> => {
    if (imageUrl.startsWith("data:")) {
      const arr = imageUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
    // Try direct fetch first (works for data: URLs and same-origin)
    try {
      const res = await fetch(imageUrl);
      if (res.ok) return await res.blob();
    } catch (e) {
      console.warn("Direct fetch failed, falling back to canvas:", e);
    }
    // Fallback: load via <img> + canvas (handles CORS-tainted remote URLs only if crossOrigin set)
    return await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponível"));
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob falhou")), "image/png");
      };
      img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      img.src = imageUrl;
    });
  };

  const savePersonaToSupabase = async (imageUrl: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const blob = await urlToBlob(imageUrl);
    const timestamp = Date.now();
    const filePath = `${user.id}/${timestamp}.png`;

    const { error: uploadError } = await supabase.storage
      .from("personas")
      .upload(filePath, blob, { contentType: "image/png" });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Erro ao salvar imagem");
    }

    const { data: urlData } = supabase.storage
      .from("personas")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    const personaNumber = savedPersonas.length + 1;
    const personaName = `Persona ${personaNumber}`;

    const { data: insertData, error: insertError } = await supabase
      .from("user_personas")
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        name: personaName,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Erro ao salvar persona");
    }

    return {
      id: insertData.id,
      imageUrl: publicUrl,
      name: personaName,
      createdAt: insertData.created_at,
    } as SavedPersona;
  };

  const handleManualSave = async () => {
    if (!generatedImage) return;
    setIsSaving(true);
    try {
      const saved = await savePersonaToSupabase(generatedImage);
      if (saved) {
        setSavedPersonas(prev => [saved, ...prev]);
        setAutoSaveFailed(false);
        toast({ title: "Persona salva!", description: "Disponível em Minhas Personas" });
      }
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;

    if (!isAdmin && personasRemaining <= 0 && paidCredits <= 0) {
      setShowBuyModal(true);
      return;
    }

    if (creationMode === "photo" && !referenceImage) {
      toast({ title: "Envie uma foto", description: "Selecione uma imagem de referência", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setSelectedSavedPersona(null);
    setAutoSaveFailed(false);

    let usedPaidForThisGen = false;

    try {
    // Reserva crédito ANTES da chamada
    if (!isAdmin) {
      const incResult = await incrementUsage('personas');
      if (!incResult.allowed) {
        if (incResult.reason === 'no_credits') {
          setShowBuyModal(true);
        } else {
          toast({ title: "Limite atingido", description: "Sem gerações disponíveis.", variant: "destructive" });
        }
        return;
      }
      usedPaidForThisGen = incResult.usedPaid;
    }
      const description = creationMode === "photo" ? undefined : personaToDescription(personaConfig);
      const referenceImageUrl = creationMode === "photo" ? (referenceImage || undefined) : undefined;

      console.log('[CriarPersona] handleGenerate → chegou até o fetch. mode:', creationMode);
      console.log('[CriarPersona] description:', description?.substring(0, 60));

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 90_000);

      let data: any = null;
      try {
        data = await generatePersonaImage(description || "", referenceImageUrl, abortController.signal);
      } catch (genErr: any) {
        if (genErr.name === 'AbortError') {
          throw new Error("A conexão com a IA demorou muito. Tente novamente.");
        }
        throw genErr;
      } finally {
        clearTimeout(timeoutId);
      }

      if (data && data.imageUrl) {
        // 1. Baixa a imagem IMEDIATAMENTE e converte em data URL local
        // (assim a imagem nunca "some" mesmo se o link da IA expirar ou der CORS)
        let localDataUrl = data.imageUrl;
        try {
          const blob = await urlToBlob(data.imageUrl);
          localDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Falha ao ler imagem"));
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn("Não consegui baixar localmente, usando URL original:", e);
        }

        // Removed isMountedRef check that could prevent state updates in strict mode
        setGeneratedImage(localDataUrl);
        setIsGenerating(false); // Remove o loading imediatamente para o usuário não ficar esperando o upload

        // 2. Tenta salvar no Supabase em paralelo (não bloqueia o usuário ver/baixar)
        let savedOk = false;
        try {
          const saved = await savePersonaToSupabase(localDataUrl);
          if (saved) {
            setSavedPersonas(prev => [saved, ...prev]);
            savedOk = true;
          }
        } catch (saveErr) {
          console.error("Failed to persist persona:", saveErr);
        }

        if (!savedOk) {
          setAutoSaveFailed(true);
          toast({
            title: "Persona gerada!",
            description: "Não conseguimos salvar online. Use Baixar para guardar no seu dispositivo.",
          });
        } else {
          toast({ title: "Persona gerada!", description: "Salva em Minhas Personas" });
        }

        return; // Success - exit the function entirely
      } else {
        throw new Error("Nenhuma imagem gerada");
      }
    } catch (err) {
      // Devolve o crédito reservado em caso de falha
      if (!isAdmin) {
        await refundCredit('personas', usedPaidForThisGen);
      }
      toast({ title: "Erro ao gerar", description: `${err instanceof Error ? err.message : "Erro desconhecido"} (crédito devolvido)`, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [personaConfig, isAdmin, personasRemaining, paidCredits, isGenerating, savedPersonas, toast, incrementUsage, refundCredit, creationMode, referenceImage]);

  const handleDownload = async () => {
    const imageUrl = selectedSavedPersona?.imageUrl || generatedImage;
    if (!imageUrl) return;
    try {
      const blob = await urlToBlob(imageUrl);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `persona-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (e) {
      // Fallback: abre em nova aba pra usuário salvar manualmente (importante no mobile)
      window.open(imageUrl, "_blank");
      toast({
        title: "Download direto não funcionou",
        description: "Pressione e segure a imagem aberta para salvar no seu dispositivo.",
      });
    }
  };

  const handleDeletePersona = async (id: string) => {
    // Delete from Supabase
    await supabase.from("user_personas").delete().eq("id", id);
    setSavedPersonas(prev => prev.filter(p => p.id !== id));
    if (selectedSavedPersona?.id === id) {
      setSelectedSavedPersona(null);
    }
  };

  const displayImage = selectedSavedPersona?.imageUrl || generatedImage;

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center shadow-lg shadow-tiktok-cyan/20">
            <Wand2 className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Criar <span className="gradient-text">Persona</span></h1>
            <p className="text-sm text-muted-foreground">Monte e gere seu personagem virtual para imagens UGC</p>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left strip - Saved personas */}
          <div className="flex flex-col gap-3 w-16 flex-shrink-0">
            <button
              onClick={() => {
                setSelectedSavedPersona(null);
                setGeneratedImage(null);
              }}
              className="w-14 h-14 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 flex items-center justify-center transition-all"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
            <span className="text-[10px] text-muted-foreground text-center -mt-1">Criar nova</span>

            {savedPersonas.map((persona) => (
              <div key={persona.id} className="relative group">
                <button
                  onClick={() => {
                    setSelectedSavedPersona(persona);
                    setGeneratedImage(null);
                  }}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedSavedPersona?.id === persona.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  <img src={persona.imageUrl} alt={persona.name} className="w-full h-full object-cover" />
                </button>
                <button
                  onClick={() => handleDeletePersona(persona.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Center - Image preview */}
          <div className="flex-1 flex flex-col items-center">
            <Card className="w-full max-w-lg aspect-[9/16] bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden flex items-center justify-center relative">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Gerando persona...</p>
                  <p className="text-xs text-muted-foreground">Isso pode levar até 30 segundos</p>
                </div>
              ) : displayImage ? (
                <>
                  <img
                    src={displayImage}
                    alt="Persona gerada"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    {generatedImage && !selectedSavedPersona && autoSaveFailed && (
                      <Button
                        onClick={handleManualSave}
                        size="sm"
                        disabled={isSaving}
                        className="gap-2 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-white"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Salvar em Minhas Personas
                      </Button>
                    )}
                    <Button onClick={handleDownload} size="sm" variant="secondary" className="gap-2">
                      <Download className="w-4 h-4" />
                      Baixar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground px-6 text-center">
                  <Wand2 className="w-12 h-12 opacity-30" />
                  <p className="text-sm">Configure sua persona e clique em <strong>Gerar Persona</strong></p>
                </div>
              )}
            </Card>
          </div>

          {/* Right - Mode selector + Builder/Upload + Generate button */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-4">
            {/* Mode tabs */}
            <Tabs value={creationMode} onValueChange={(v) => setCreationMode(v as CreationMode)}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="builder" className="gap-2 text-xs">
                  <Wand2 className="w-3.5 h-3.5" />
                  Criar do Zero
                </TabsTrigger>
                <TabsTrigger value="photo" className="gap-2 text-xs">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Usar Foto
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {creationMode === "builder" ? (
              <>
                <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 overflow-y-auto max-h-[70vh]">
                  <PersonaBuilder persona={personaConfig} onChange={setPersonaConfig} />
                </Card>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Descrição:</p>
                  <p className="text-xs text-foreground leading-relaxed">{personaToDescription(personaConfig)}</p>
                </div>
              </>
            ) : (
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 flex flex-col items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                {referencePreview ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="w-40 h-52 rounded-xl overflow-hidden border-2 border-tiktok-pink/50">
                      <img src={referencePreview} alt="Referência" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      A IA vai gerar um corpo inteiro mantendo o rosto e características desta pessoa
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Trocar foto
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border/50 hover:border-tiktok-pink/50 flex flex-col items-center justify-center gap-3 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-tiktok-pink/10 transition-colors">
                      <Upload className="w-7 h-7 text-muted-foreground group-hover:text-tiktok-pink transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Enviar foto de referência</p>
                      <p className="text-xs text-muted-foreground mt-1">A IA cria a persona igual à foto</p>
                    </div>
                  </button>
                )}
              </Card>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (creationMode === "photo" && !referenceImage)}
              className="w-full gap-2 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-white"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  {creationMode === "photo" ? "Gerar a Partir da Foto" : "Gerar Persona"}
                </>
              )}
            </Button>

            {!isAdmin && (
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>Grátis hoje: <strong className="text-tiktok-cyan">{personasRemaining}/2</strong> · Créditos pagos: <strong className="text-tiktok-pink">{paidCredits}</strong></p>
                {personasRemaining <= 0 && paidCredits <= 0 && (
                  <button onClick={() => setShowBuyModal(true)} className="underline text-tiktok-pink hover:text-tiktok-pink/80">
                    Comprar créditos
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BuyCreditsModal open={showBuyModal} onOpenChange={setShowBuyModal} />
    </div>
  );
};

export default CriarPersona;
