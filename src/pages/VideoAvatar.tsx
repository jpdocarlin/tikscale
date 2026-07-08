import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Video, Sparkles, Loader2, Download, RefreshCw, 
  FileText, Check, AlertCircle, Clock, Upload, ImageIcon, X, User, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getFreshAccessToken } from "@/lib/getFreshAccessToken";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VideoJob {
  videoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';
  videoUrl?: string;
  thumbnailUrl?: string;
  startTime?: number;
}

interface HeyGenAvatar {
  id: string;
  name: string;
  gender?: string;
  previewUrl: string;
  previewVideoUrl?: string;
}

type AvatarMode = 'photo' | 'avatar';

const aspectRatioOptions = [
  { id: '9:16', name: 'Vertical (9:16)', description: 'TikTok, Reels, Stories' },
  { id: '16:9', name: 'Horizontal (16:9)', description: 'YouTube, Sites' },
  { id: '1:1', name: 'Quadrado (1:1)', description: 'Feed Instagram' },
];

const voiceOptions = [
  { id: 'female', name: 'Voz Feminina', description: 'Natália - Português BR' },
  { id: 'male', name: 'Voz Masculina', description: 'Lucas - Português BR' },
];

const VideoAvatar = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  
  // Avatar mode state
  const [avatarMode, setAvatarMode] = useState<AvatarMode>('photo');
  const [availableAvatars, setAvailableAvatars] = useState<HeyGenAvatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);
  
  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  
  // Selection states - pre-fill script from navigation state
  const [script, setScript] = useState(() => {
    const navState = location.state as { script?: string } | null;
    return navState?.script || "";
  });
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [voiceGender, setVoiceGender] = useState("female");
  
  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJob, setCurrentJob] = useState<VideoJob | null>(null);
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  const MAX_WAIT_TIME = 15 * 60 * 1000; // 15 minutes max

  // Get access token helper
  const getAccessToken = getFreshAccessToken;

  // Load available avatars when switching to avatar mode
  const loadAvatars = useCallback(async () => {
    if (availableAvatars.length > 0) return; // Already loaded
    
    setIsLoadingAvatars(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/heygen-video?action=list-avatars`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableAvatars(data.avatars || []);
        console.log(`[VideoAvatar] Loaded ${data.avatars?.length || 0} avatars`);
      }
    } catch (error) {
      console.error('[VideoAvatar] Failed to load avatars:', error);
    } finally {
      setIsLoadingAvatars(false);
    }
  }, [availableAvatars.length]);

  // Load avatars when mode changes to 'avatar'
  useEffect(() => {
    if (avatarMode === 'avatar') {
      loadAvatars();
    }
  }, [avatarMode, loadAvatars]);

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPhotoUrl(base64);
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
    setPhotoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Poll for video status with timeout
  const checkVideoStatus = useCallback(async (videoId: string, startTime: number) => {
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    // Check if timeout exceeded
    const elapsed = Date.now() - startTime;
    setElapsedTime(elapsed);
    
    if (elapsed > MAX_WAIT_TIME) {
      console.log(`[VideoAvatar] Timeout exceeded after ${elapsed}ms`);
      setCurrentJob(prev => prev ? { ...prev, status: 'timeout' } : null);
      
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
      
      toast({
        title: "Tempo limite excedido ⏱️",
        description: "A geração está demorando mais que o esperado. Tente novamente com um script mais curto.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/heygen-video?action=status&videoId=${videoId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check status');
      }

      const data = await response.json();
      console.log(`[VideoAvatar] Video status: ${data.status}, elapsed: ${Math.round(elapsed/1000)}s`);

      if (data.status === 'completed' && data.videoUrl) {
        setCurrentJob({
          videoId,
          status: 'completed',
          videoUrl: data.videoUrl,
          thumbnailUrl: data.thumbnailUrl,
          startTime,
        });
        
        // Stop polling
        if (pollInterval) {
          clearInterval(pollInterval);
          setPollInterval(null);
        }
        
        toast({
          title: "Vídeo pronto! 🎬",
          description: "Seu vídeo foi gerado com sucesso",
        });
      } else if (data.status === 'failed') {
        setCurrentJob({ videoId, status: 'failed', startTime });
        
        if (pollInterval) {
          clearInterval(pollInterval);
          setPollInterval(null);
        }
        
        toast({
          title: "Erro na geração",
          description: data.error || "O vídeo não pôde ser gerado. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setCurrentJob(prev => prev ? { ...prev, status: 'processing' } : { videoId, status: 'processing', startTime });
      }
    } catch (error) {
      console.error('[VideoAvatar] Status check error:', error);
    }
  }, [pollInterval, toast, MAX_WAIT_TIME]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const handleGenerate = async () => {
    if (!script.trim()) {
      toast({
        title: "Script obrigatório",
        description: "Digite o texto que o avatar vai falar",
        variant: "destructive",
      });
      return;
    }

    // Validate based on mode
    if (avatarMode === 'photo' && !photoUrl) {
      toast({
        title: "Foto obrigatória",
        description: "Faça upload de uma foto para usar como avatar",
        variant: "destructive",
      });
      return;
    }

    if (avatarMode === 'avatar' && !selectedAvatarId) {
      toast({
        title: "Avatar obrigatório",
        description: "Selecione um avatar para gerar o vídeo",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setCurrentJob(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }

      // Build request body based on mode
      const requestBody: any = {
        script: script.trim(),
        aspectRatio,
        voiceGender,
        avatarType: avatarMode === 'photo' ? 'talking_photo' : 'avatar',
      };

      if (avatarMode === 'photo') {
        requestBody.photoUrl = photoUrl;
      } else {
        requestBody.avatarId = selectedAvatarId;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/heygen-video?action=generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const data = await response.json();
      console.log(`[VideoAvatar] Video job started: ${data.videoId}`);

      const startTime = Date.now();
      setElapsedTime(0);
      
      setCurrentJob({
        videoId: data.videoId,
        status: 'pending',
        startTime,
      });

      toast({
        title: "Geração iniciada! ⏳",
        description: "Seu vídeo está sendo processado. Pode levar até 15 minutos.",
      });

      // Start polling for status - check every 5 seconds for faster feedback
      const interval = setInterval(() => {
        checkVideoStatus(data.videoId, startTime);
      }, 5000); // Check every 5 seconds
      
      setPollInterval(interval);
      
      // Initial check after 5 seconds
      setTimeout(() => checkVideoStatus(data.videoId, startTime), 5000);

    } catch (error) {
      console.error('[VideoAvatar] Generation error:', error);
      toast({
        title: "Erro ao gerar vídeo",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (currentJob?.videoUrl) {
      window.open(currentJob.videoUrl, '_blank');
    }
  };

  const handleReset = () => {
    setCurrentJob(null);
    setScript("");
    setPhotoUrl("");
    setPhotoPreview("");
    setSelectedAvatarId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  const selectedAvatar = availableAvatars.find(a => a.id === selectedAvatarId);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center">
              <Video className="w-5 h-5 text-background" />
            </div>
            <h1 className="text-2xl font-bold">Vídeo Avatar</h1>
          </div>
          <p className="text-muted-foreground">
            Crie vídeos com sua foto ou avatares profissionais com corpo animado
          </p>
        </div>

        {/* Avatar Mode Selection */}
        <Card className="mb-6 p-4 sm:p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold">1. Tipo de Avatar</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAvatarMode('photo')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                avatarMode === 'photo'
                  ? "border-tiktok-pink bg-tiktok-pink/10"
                  : "border-border hover:border-tiktok-pink/50"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <ImageIcon className={cn("w-5 h-5", avatarMode === 'photo' ? "text-tiktok-pink" : "text-muted-foreground")} />
                <span className="font-medium">Minha Foto</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Use sua própria foto (animação de cabeça)
              </p>
            </button>

            <button
              onClick={() => setAvatarMode('avatar')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                avatarMode === 'avatar'
                  ? "border-tiktok-cyan bg-tiktok-cyan/10"
                  : "border-border hover:border-tiktok-cyan/50"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <User className={cn("w-5 h-5", avatarMode === 'avatar' ? "text-tiktok-cyan" : "text-muted-foreground")} />
                <span className="font-medium">Avatar Profissional</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Avatares com corpo inteiro animado
              </p>
            </button>
          </div>
        </Card>

        {/* Step 2: Photo or Avatar Selection */}
        {avatarMode === 'photo' ? (
          <Card className="mb-6 p-4 sm:p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-tiktok-pink/20 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-tiktok-pink" />
              </div>
              <h2 className="text-lg font-semibold">2. Sua Foto</h2>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={photoPreview}
                  alt="Foto avatar"
                  className="w-full h-full object-cover rounded-xl border-2 border-tiktok-pink"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center rounded-b-xl">
                  <Check className="w-3 h-3 inline mr-1" />
                  Foto selecionada
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-border rounded-xl hover:border-tiktok-pink/50 transition-colors flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Clique para fazer upload</p>
                  <p className="text-sm text-muted-foreground">JPG ou PNG, máx 10MB</p>
                </div>
              </button>
            )}

            <p className="text-xs text-muted-foreground mt-4 text-center">
              💡 Dica: Use uma foto frontal com boa iluminação para melhores resultados
            </p>
          </Card>
        ) : (
          <Card className="mb-6 p-4 sm:p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-tiktok-cyan/20 flex items-center justify-center">
                <User className="w-4 h-4 text-tiktok-cyan" />
              </div>
              <h2 className="text-lg font-semibold">2. Escolha um Avatar</h2>
            </div>

            {isLoadingAvatars ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-tiktok-cyan" />
                <span className="ml-3 text-muted-foreground">Carregando avatares...</span>
              </div>
            ) : availableAvatars.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum avatar disponível</p>
                <p className="text-sm">Tente usar a opção "Minha Foto"</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {availableAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={cn(
                        "relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4]",
                        selectedAvatarId === avatar.id
                          ? "border-tiktok-cyan ring-2 ring-tiktok-cyan/50"
                          : "border-border hover:border-tiktok-cyan/50"
                      )}
                    >
                      <img
                        src={avatar.previewUrl}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedAvatarId === avatar.id && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-tiktok-cyan rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-background" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white truncate">{avatar.name}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedAvatar && (
                  <div className="mt-4 p-3 bg-tiktok-cyan/10 border border-tiktok-cyan/30 rounded-xl flex items-center gap-3">
                    <img
                      src={selectedAvatar.previewUrl}
                      alt={selectedAvatar.name}
                      className="w-12 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-tiktok-cyan">{selectedAvatar.name}</p>
                      <p className="text-xs text-muted-foreground">Avatar com corpo inteiro animado</p>
                    </div>
                  </div>
                )}
              </>
            )}

            <p className="text-xs text-muted-foreground mt-4 text-center">
              ✨ Avatares profissionais têm animação de corpo inteiro para vídeos mais realistas
            </p>
          </Card>
        )}

        {/* Step 3: Script */}
        <Card className="mb-6 p-4 sm:p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-tiktok-cyan/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-tiktok-cyan" />
            </div>
            <h2 className="text-lg font-semibold">3. Escreva o Script</h2>
          </div>
          
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Digite o texto que o avatar vai falar... Ex: Olá! Você precisa conhecer esse produto incrível que está mudando a vida de milhares de pessoas..."
            className="min-h-[150px] resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">
              💡 Limite de ~1000 caracteres para vídeos de até 30 segundos
            </p>
            <p className="text-xs text-muted-foreground">
              {script.length}/1000
            </p>
          </div>
        </Card>

        {/* Step 4: Settings */}
        <Card className="mb-6 p-4 sm:p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Video className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold">4. Configurações do Vídeo</h2>
          </div>

          <div className="space-y-4">
            {/* Aspect Ratio */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Formato
              </label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatioOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name} - {option.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Voz (Português BR)
              </label>
              <Select value={voiceGender} onValueChange={setVoiceGender}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name} - {option.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Duração máxima: 30 segundos</span>
            </div>
          </div>
        </Card>

        {/* Generate Button */}
        <Card className="mb-6 p-4 sm:p-6 bg-card/50 border-border/50">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !script.trim() || (avatarMode === 'photo' ? !photoUrl : !selectedAvatarId) || currentJob?.status === 'processing'}
            className="w-full h-12 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink hover:opacity-90 text-background font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Iniciando geração...
              </>
            ) : currentJob?.status === 'processing' || currentJob?.status === 'pending' ? (
              <>
                <Clock className="w-5 h-5 mr-2 animate-pulse" />
                Processando vídeo...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {avatarMode === 'photo' ? 'Gerar Vídeo com Minha Foto' : 'Gerar Vídeo com Avatar'}
              </>
            )}
          </Button>

          {/* Processing Status */}
          {(currentJob?.status === 'pending' || currentJob?.status === 'processing') && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                <div className="flex-1">
                  <p className="font-medium text-amber-200">Gerando seu vídeo...</p>
                  <p className="text-sm text-amber-300/70">
                    Tempo: {Math.floor(elapsedTime / 60000)}:{String(Math.floor((elapsedTime % 60000) / 1000)).padStart(2, '0')} / 10:00 máximo
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeout */}
          {currentJob?.status === 'timeout' && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Tempo limite excedido</p>
                  <p className="text-sm text-muted-foreground">A geração demorou mais de 10 minutos. Tente novamente com um script mais curto.</p>
                </div>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm" className="mt-3">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Success */}
          {currentJob?.status === 'completed' && currentJob.videoUrl && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Check className="w-5 h-5 text-emerald-500" />
                <p className="font-medium text-emerald-200">Vídeo pronto!</p>
              </div>
              
              <div className="space-y-4">
                {/* Video Player */}
                <div className={cn(
                  "relative w-full mx-auto overflow-hidden rounded-lg bg-black",
                  aspectRatio === '9:16' && "max-w-[280px]",
                  aspectRatio === '16:9' && "max-w-full",
                  aspectRatio === '1:1' && "max-w-[320px]"
                )}>
                  <div className={cn(
                    "relative w-full",
                    aspectRatio === '9:16' && "aspect-[9/16]",
                    aspectRatio === '16:9' && "aspect-video",
                    aspectRatio === '1:1' && "aspect-square"
                  )}>
                    <video
                      src={currentJob.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDownload}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Vídeo
                  </Button>
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Criar Novo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {currentJob?.status === 'failed' && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="font-medium text-red-200">Erro na geração</p>
              </div>
              <Button 
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          )}
        </Card>

        {/* Tips */}
        <Card className="p-4 bg-gradient-to-br from-tiktok-cyan/10 to-tiktok-pink/10 border-border/30">
          <h3 className="font-semibold mb-3">💡 Dicas para melhores resultados:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-tiktok-cyan">•</span>
              Use uma foto frontal com o rosto bem visível
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tiktok-pink">•</span>
              Boa iluminação é essencial para resultados realistas
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Evite fotos com óculos escuros ou muita sombra no rosto
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tiktok-cyan">•</span>
              Scripts mais curtos (até 500 caracteres) geram vídeos mais rápidos
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
};

export default VideoAvatar;
