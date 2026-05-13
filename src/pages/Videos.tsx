import { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, Zap, Film, Copy, Check, ExternalLink, Loader2, User, AlertCircle, RefreshCw, WifiOff, Clock, CreditCard, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VideoPrompt {
  title: string;
  prompt: string;
  style: string;
}

interface ErrorInfo {
  message: string;
  type: "auth" | "rate_limit" | "credits" | "network" | "timeout" | "unknown";
}

const aiTools = [
  { name: "Gerador de Vídeo IA", url: "https://www.heygen.com", desc: "Cria vídeos com avatares realistas falando seu script", free: true },
  { name: "Templates de Vídeo", url: "https://www.heygen.com/video-templates", desc: "Templates prontos para vídeos de vendas e marketing", free: true },
];

const getErrorIcon = (type: ErrorInfo["type"]) => {
  switch (type) {
    case "auth": return ShieldX;
    case "rate_limit": return Clock;
    case "credits": return CreditCard;
    case "network": return WifiOff;
    case "timeout": return Clock;
    default: return AlertCircle;
  }
};

const getErrorTitle = (type: ErrorInfo["type"]) => {
  switch (type) {
    case "auth": return "Sessão expirada";
    case "rate_limit": return "Muitas requisições";
    case "credits": return "Créditos insuficientes";
    case "network": return "Problema de conexão";
    case "timeout": return "Tempo esgotado";
    default: return "Erro ao gerar";
  }
};

const parseError = (errMsg: string): ErrorInfo => {
  const lowerMsg = errMsg.toLowerCase();
  
  if (lowerMsg.includes("401") || lowerMsg.includes("unauthorized") || lowerMsg.includes("não autorizado") || lowerMsg.includes("sessão")) {
    return { message: "Sua sessão expirou. Faça login novamente para continuar.", type: "auth" };
  }
  if (lowerMsg.includes("429") || lowerMsg.includes("rate") || lowerMsg.includes("limite") || lowerMsg.includes("muitas")) {
    return { message: "Você fez muitas requisições. Aguarde 30 segundos e tente novamente.", type: "rate_limit" };
  }
  if (lowerMsg.includes("402") || lowerMsg.includes("crédito") || lowerMsg.includes("credit")) {
    return { message: "Créditos do sistema esgotados. Entre em contato com o suporte.", type: "credits" };
  }
  if (lowerMsg.includes("failed to fetch") || lowerMsg.includes("network") || lowerMsg.includes("conexão")) {
    return { message: "Problema de conexão com a internet. Verifique sua rede e tente novamente.", type: "network" };
  }
  if (lowerMsg.includes("timeout") || lowerMsg.includes("tempo") || lowerMsg.includes("esgotado") || lowerMsg.includes("aborted")) {
    return { message: "A requisição demorou demais. Tente novamente em alguns segundos.", type: "timeout" };
  }
  
  return { message: errMsg || "Erro desconhecido. Tente novamente.", type: "unknown" };
};

const Videos = () => {
  const { toast } = useToast();
  const [productDescription, setProductDescription] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Countdown timer for rate limit
  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => setRetryCountdown(retryCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [retryCountdown]);

  const generatePrompts = useCallback(async () => {
    if (!productDescription.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, descreva o produto ou serviço",
        variant: "destructive",
      });
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setErrorInfo(null);
    setIsLoading(true);
    setPrompts([]);

    // Create new abort controller with 60s timeout (increased for reliability)
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, 60000);

    try {
      // Get fresh session
      console.log("[Videos] Getting session...");
      let session = null;
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("[Videos] Session error:", sessionError);
        }
        session = sessionData?.session;
      } catch (sessionEx) {
        console.error("[Videos] Session fetch exception:", sessionEx);
      }
      
      if (!session) {
        clearTimeout(timeoutId);
        setErrorInfo({ message: "Sua sessão expirou. Faça login novamente.", type: "auth" });
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente para continuar",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("[Videos] Session OK, user:", session.user.id);

      // Retry logic
      const maxAttempts = 3;
      let lastError: Error | null = null;
      let data: any = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Tempo esgotado. Tente novamente.");
        }

        console.log(`[Videos] Attempt ${attempt}/${maxAttempts}`);
        
        try {
          const result = await supabase.functions.invoke("generate-video-prompts", {
            body: { 
              productDescription, 
              extraInstructions: extraInstructions.trim() || undefined 
            },
          });

          console.log(`[Videos] Attempt ${attempt} result:`, { 
            hasData: !!result.data, 
            hasError: !!result.error,
            errorMsg: result.error?.message
          });

          if (result.error) {
            const errMsg = result.error.message || "";
            const parsedError = parseError(errMsg);
            
            // Non-retryable errors
            if (parsedError.type === "auth" || parsedError.type === "credits") {
              throw new Error(parsedError.message);
            }

            // Rate limit: set countdown and throw
            if (parsedError.type === "rate_limit") {
              setRetryCountdown(30);
              throw new Error(parsedError.message);
            }

            // Retryable errors
            const isRetryable = parsedError.type === "network" || parsedError.type === "timeout" || parsedError.type === "unknown";

            if (isRetryable && attempt < maxAttempts) {
              console.log(`[Videos] Retryable error, waiting ${attempt * 2}s...`);
              await sleep(attempt * 2000);
              continue;
            }

            throw new Error(parsedError.message);
          }

          if (result.data?.error) {
            throw new Error(result.data.error);
          }

          if (result.data?.prompts && Array.isArray(result.data.prompts) && result.data.prompts.length > 0) {
            data = result.data;
            break;
          } else {
            console.error("[Videos] Invalid response structure:", result.data);
            if (attempt < maxAttempts) {
              await sleep(attempt * 1500);
              continue;
            }
            throw new Error("Resposta inválida. Tente novamente.");
          }
        } catch (err) {
          lastError = err instanceof Error ? err : new Error("Erro desconhecido");
          
          // Check if aborted
          if (lastError.name === "AbortError" || abortControllerRef.current?.signal.aborted) {
            throw new Error("Tempo esgotado. Tente novamente.");
          }

          // If it's a final error (not retryable or last attempt), throw
          if (attempt === maxAttempts) {
            throw lastError;
          }
          
          console.log(`[Videos] Error on attempt ${attempt}:`, lastError.message);
          await sleep(attempt * 1500);
        }
      }

      clearTimeout(timeoutId);

      if (data?.prompts) {
        console.log("[Videos] Success! Generated", data.prompts.length, "scripts");
        setPrompts(data.prompts);
        toast({
          title: "Scripts gerados!",
          description: `${data.prompts.length} scripts prontos para usar`,
        });
      } else if (lastError) {
        throw lastError;
      }

    } catch (error) {
      clearTimeout(timeoutId);
      console.error("[Videos] Final error:", error);
      const msg = error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.";
      const parsed = parseError(msg);
      setErrorInfo(parsed);
      toast({
        title: getErrorTitle(parsed.type),
        description: parsed.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [productDescription, extraInstructions, toast]);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copiado!",
        description: "Prompt copiado para a área de transferência",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    if (retryCountdown > 0) return;
    setErrorInfo(null);
    generatePrompts();
  };

  const handleLogin = () => {
    window.location.href = "/auth";
  };

  const ErrorIcon = errorInfo ? getErrorIcon(errorInfo.type) : AlertCircle;

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-tiktok-cyan/20 to-tiktok-pink/20 border border-tiktok-pink/30 mb-4 sm:mb-6">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tiktok-pink" />
            <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
              Estilo UGC Realista
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-tiktok-cyan via-white to-tiktok-pink bg-clip-text text-transparent">
              Gerador de Scripts
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
            Descreva seu produto e crie scripts para vídeos com pessoas reais falando sobre ele
          </p>
        </div>

        {/* Generator Section */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <Card className="p-4 sm:p-6 bg-card/50 border-border/50 backdrop-blur-sm">
            <div className="space-y-4 sm:space-y-5">
              {/* Error Alert with specific messaging */}
              {errorInfo && (
                <Alert variant="destructive" className="border-destructive/50">
                  <ErrorIcon className="h-4 w-4" />
                  <AlertTitle>{getErrorTitle(errorInfo.type)}</AlertTitle>
                  <AlertDescription className="flex flex-col gap-3">
                    <span>{errorInfo.message}</span>
                    <div className="flex gap-2 flex-wrap">
                      {errorInfo.type === "auth" ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleLogin}
                          className="w-fit gap-2"
                        >
                          <ShieldX className="h-4 w-4" />
                          Fazer login
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRetry}
                          disabled={retryCountdown > 0}
                          className="w-fit gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          {retryCountdown > 0 ? `Aguarde ${retryCountdown}s` : "Tentar novamente"}
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <label className="text-sm sm:text-base font-medium text-foreground mb-2 block">
                  Descreva seu produto ou serviço
                </label>
                <Textarea
                  placeholder="Ex: Shampoo antiqueda com biotina e vitaminas, ajuda a fortalecer e fazer o cabelo crescer mais rápido..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="min-h-[100px] sm:min-h-[120px] bg-background/50 border-border/50 resize-none text-base"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Inclua: nome do produto, benefícios principais, público-alvo e diferenciais
                </p>
              </div>
              
              <div>
                <label className="text-sm sm:text-base font-medium text-foreground mb-2 block">
                  Personalizações extras <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Textarea
                  placeholder="Ex: Quero uma mulher de 30 anos falando, cenário de banheiro moderno..."
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  className="min-h-[70px] sm:min-h-[80px] bg-background/50 border-border/50 resize-none text-base"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Descreva: quem vai falar, cenário, tom de voz, estilo específico
                </p>
              </div>
              
              <Button
                onClick={generatePrompts}
                disabled={isLoading || retryCountdown > 0}
                className="w-full h-12 sm:h-11 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-white font-semibold text-base sm:text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                    Gerando scripts...
                  </>
                ) : retryCountdown > 0 ? (
                  <>
                    <Clock className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                    Aguarde {retryCountdown}s
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                    Gerar Scripts de Vídeo
                  </>
                )}
              </Button>

              {/* Loading indicator inline */}
              {isLoading && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Isso pode levar até 30 segundos...
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Generated Prompts */}
        {prompts.length > 0 && (
          <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-foreground">
              Seus Scripts Prontos
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {prompts.map((prompt, index) => (
                <Card
                  key={index}
                  className="p-4 sm:p-5 bg-card/50 border-border/50 backdrop-blur-sm hover:border-tiktok-pink/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-tiktok-cyan/20 text-tiktok-cyan font-medium">
                          {prompt.style}
                        </span>
                        <h3 className="font-semibold text-sm sm:text-base text-foreground">{prompt.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed bg-background/30 p-3 rounded-lg whitespace-pre-wrap">
                        {prompt.prompt}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(prompt.prompt, index)}
                      className="w-full sm:w-auto h-11 sm:h-10 shrink-0 border-border/50 hover:border-tiktok-pink hover:text-tiktok-pink gap-2"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="sm:hidden">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="sm:hidden">Copiar Script</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Tools Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-foreground">
            Crie o Vídeo com IA
          </h2>
          <p className="text-center text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6 px-2">
            Copie o script e use uma dessas ferramentas para gerar seu vídeo:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {aiTools.map((tool, index) => (
              <a
                key={index}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 sm:p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-tiktok-pink/50 transition-all active:scale-[0.98] sm:hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-tiktok-pink transition-colors">
                        {tool.name}
                      </h3>
                      {tool.free ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tiktok-green/20 text-tiktok-green font-medium">
                          GRÁTIS
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tiktok-pink/20 text-tiktok-pink font-medium">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{tool.desc}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-tiktok-pink transition-colors shrink-0 ml-2" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-16">
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-tiktok-cyan/20 flex items-center justify-center">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-tiktok-cyan" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-foreground">Estilo Pessoa Real</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Scripts que parecem depoimentos genuínos, não propagandas
            </p>
          </div>
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-tiktok-pink/20 flex items-center justify-center">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-tiktok-pink" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-foreground">3 Variações</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Receba múltiplos estilos para testar e encontrar o que converte mais
            </p>
          </div>
          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-tiktok-green/20 flex items-center justify-center">
              <Film className="w-5 h-5 sm:w-6 sm:h-6 text-tiktok-green" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-foreground">Pronto para Gravar</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Copie e use direto em ferramentas de IA ou grave você mesmo
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Videos;
