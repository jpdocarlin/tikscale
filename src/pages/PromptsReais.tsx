import { useState } from "react";
import { Sparkles, MessageSquare, Wand2, Copy, Check, UploadCloud, Video, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const PromptsReais = () => {
  const { toast } = useToast();
  
  // States for "Criar Prompt"
  const [description, setDescription] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // States for "Clonar Vídeo"
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoContext, setVideoContext] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGeneratePrompt = async () => {
    if (!description.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, descreva como a personagem deve se mexer.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

      const { data: sessionData } = await supabase.auth.getSession();
      let accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        accessToken = refreshData?.session?.access_token || undefined;
      }
      if (!accessToken) {
        toast({ title: "Sessão expirada", description: "Faça login novamente", variant: "destructive" });
        setIsGenerating(false);
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-real-prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: publishableKey,
        },
        body: JSON.stringify({ description: description.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao gerar prompt");
      }

      const data = await response.json();
      if (data.prompt) {
        setGeneratedPrompt(data.prompt);
        toast({
          title: "Prompt gerado!",
          description: "Seu prompt em inglês foi criado com sucesso pela IA."
        });
      } else {
        throw new Error("Nenhum prompt retornado");
      }
    } catch (err) {
      toast({
        title: "Erro ao gerar",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Prompt copiado para a área de transferência."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideo(e.target.files[0]);
    }
  };

  const handleAnalyzeVideo = () => {
    if (!selectedVideo) {
      toast({
        title: "Nenhum vídeo",
        description: "Faça o upload de um vídeo primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    // Simulating API call
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Vídeo Analisado!",
        description: "Os movimentos da personagem foram mapeados com sucesso."
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen">
      <main className="p-4 md:p-6 lg:p-8 max-w-[1000px] mx-auto space-y-8">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
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
            Descreva movimentos em português e gere o prompt perfeito ou clone movimentos de um vídeo.
          </p>
        </motion.div>

        {/* TABS CONTEXT */}
        <Tabs defaultValue="criar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-1">
            <TabsTrigger value="criar" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
              <Wand2 className="w-4 h-4 mr-2" />
              Criar Prompt
            </TabsTrigger>
            <TabsTrigger value="clonar" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
              <ScanFace className="w-4 h-4 mr-2" />
              Clonar Vídeos
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CRIAR PROMPT */}
          <TabsContent value="criar" className="focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Input Section */}
              <Card className="glass-card inner-shine p-6 flex flex-col h-full border-border/50">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-tiktok-cyan/20 flex items-center justify-center text-xs font-bold text-tiktok-cyan">1</span>
                    Descreva o Movimento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Diga em português o que a personagem deve fazer.
                  </p>
                </div>
                <Textarea 
                  placeholder="Ex: A personagem deve sorrir suavemente, virar o rosto para a direita e piscar lentamente..."
                  className="min-h-[150px] resize-none mb-4 rounded-xl bg-background/50 border-border/50 focus-visible:ring-tiktok-cyan/50"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="mt-auto pt-4 border-t border-border/20">
                  <Button 
                    onClick={handleGeneratePrompt}
                    disabled={isGenerating || !description.trim()}
                    className="w-full gap-2 rounded-xl bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background btn-glow shadow-lg shadow-tiktok-pink/20"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Criando a mágica...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Gerar Prompt Perfeito
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Output Section */}
              <Card className="glass-card inner-shine p-6 flex flex-col h-full border-border/50 bg-gradient-to-b from-card/40 to-muted/10">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-tiktok-pink/20 flex items-center justify-center text-xs font-bold text-tiktok-pink">2</span>
                      Resultado em Inglês
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Pronto para usar na sua IA favorita.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex-1 flex flex-col">
                  {generatedPrompt ? (
                    <>
                      <Textarea 
                        readOnly
                        value={generatedPrompt}
                        className="flex-1 min-h-[150px] resize-none rounded-xl bg-background/80 border-tiktok-pink/30 text-foreground text-sm leading-relaxed"
                      />
                      <Button 
                        onClick={handleCopy}
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-3 right-3 gap-2 shadow-md hover:bg-muted/80 backdrop-blur-md"
                      >
                        {copied ? (
                          <><Check className="w-3.5 h-3.5 text-green-500" /> Copiado!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copiar</>
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="flex-1 min-h-[150px] rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                      <Wand2 className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm font-medium">O prompt aparecerá aqui</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* TAB 2: CLONAR VÍDEOS */}
          <TabsContent value="clonar" className="focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
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
                  {/* Upload Area */}
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
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

                  {/* Context Input Area */}
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      Instruções para a IA (Opcional)
                    </label>
                    <Textarea 
                      placeholder="Ex: Focar mais na expressão facial, ignorar movimentos de fundo..."
                      className="resize-none h-24 rounded-xl bg-background/50 border-border/50 focus-visible:ring-tiktok-pink/50"
                      value={videoContext}
                      onChange={(e) => setVideoContext(e.target.value)}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    onClick={handleAnalyzeVideo}
                    disabled={isAnalyzing || !selectedVideo}
                    className="w-full gap-2 rounded-xl h-12 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background btn-glow shadow-lg shadow-tiktok-cyan/20 font-semibold"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Analisando movimentos...
                      </>
                    ) : (
                      <>
                        <ScanFace className="w-5 h-5" />
                        Analisar Vídeo e Clonar Movimentos
                      </>
                    )}
                  </Button>
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
