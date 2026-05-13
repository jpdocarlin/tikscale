import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Play, Pause, Scissors, Type, Download, Trash2, Plus, Volume2, VolumeX, Music, Move, Image as ImageIcon, Video, SkipBack, SkipForward, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface VideoClip {
  id: string;
  file: File;
  url: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  name: string;
  volume: number;
  isMuted: boolean;
}

type TextStylePreset = "tiktok-classic" | "tiktok-box" | "tiktok-yellow" | "custom";
type TextAlign = "left" | "center" | "right";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  preset: TextStylePreset;
  color: string;
  bgColor: string;
  align: TextAlign;
  startTime: number;
  endTime: number;
}

interface AudioTrack {
  id: string;
  file: File;
  url: string;
  name: string;
  volume: number;
  startTime: number;
}

const EditorVideo = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Core State
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);

  // Timeline & Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalTime, setGlobalTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Selection
  const [selectedType, setSelectedType] = useState<"clip" | "text" | "audio" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);

  // Timeline Dragging
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Hidden video elements for rendering each clip
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const stateRef = useRef({ clips, audioTracks, textOverlays, globalTime, isPlaying });
  useEffect(() => {
    stateRef.current = { clips, audioTracks, textOverlays, globalTime, isPlaying };
  }, [clips, audioTracks, textOverlays, globalTime, isPlaying]);

  // Active clip logic
  const totalDuration = clips.reduce((acc, c) => acc + (c.trimEnd - c.trimStart), 0);
  
  // Find which clip is active based on globalTime
  let currentAccumulated = 0;
  let activeClipId: string | null = null;
  let localTimeForActiveClip = 0;

  for (const clip of clips) {
    const duration = clip.trimEnd - clip.trimStart;
    if (globalTime >= currentAccumulated && globalTime <= currentAccumulated + duration) {
      activeClipId = clip.id;
      localTimeForActiveClip = clip.trimStart + (globalTime - currentAccumulated);
      break;
    }
    currentAccumulated += duration;
  }
  
  // File Upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("video/")) {
        toast({ title: "Inválido", description: "Apenas vídeos.", variant: "destructive" });
        return;
      }

      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.muted = true; // prevent double audio playing natively
      video.onloadedmetadata = () => {
        const clip: VideoClip = {
          id: crypto.randomUUID(),
          file, url, duration: video.duration, trimStart: 0, trimEnd: video.duration, name: file.name, volume: 1, isMuted: false
        };
        setClips((prev) => [...prev, clip]);
        videoRefs.current.set(clip.id, video);
      };
    });
    e.target.value = "";
  }, [toast]);

  // Extract Audio Logic
  const extractAudioFromVideo = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new AudioContext();
    let audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataLength = audioBuffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    const arrayB = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayB);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, "RIFF"); view.setUint32(4, 36 + dataLength, true); writeString(8, "WAVE"); writeString(12, "fmt ");
    view.setUint32(16, 16, true); view.setUint16(20, format, true); view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true); writeString(36, "data"); view.setUint32(40, dataLength, true);

    const channels: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) channels.push(audioBuffer.getChannelData(c));
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = Math.max(-1, Math.min(1, channels[c][i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, sample, true); offset += 2;
      }
    }
    const blob = new Blob([arrayB], { type: "audio/wav" });
    audioCtx.close();
    return { blob, url: URL.createObjectURL(blob) };
  };

  const handleAudioUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      let trackUrl = "";
      let trackName = file.name;
      if (isVideo) {
        toast({ title: "Extraindo áudio", description: "Processando o vídeo..." });
        try {
          const res = await extractAudioFromVideo(file);
          trackUrl = res.url; trackName = `Audio de ${file.name}`;
        } catch { continue; }
      } else {
        trackUrl = URL.createObjectURL(file);
      }
      const track: AudioTrack = { id: crypto.randomUUID(), file, url: trackUrl, name: trackName, volume: 1, startTime: 0 };
      setAudioTracks(prev => [...prev, track]);
    }
    e.target.value = "";
  }, [toast]);

  // Audio Sync Engine
  useEffect(() => {
    // Manage Audio elements
    audioTracks.forEach(t => {
      if (!audioRefs.current.has(t.id)) {
        const audio = new Audio(t.url);
        audioRefs.current.set(t.id, audio);
      }
    });
  }, [audioTracks]);

  // Playback Loop
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const state = stateRef.current;
      const tDuration = state.clips.reduce((acc, c) => acc + (c.trimEnd - c.trimStart), 0);
      
      if (state.isPlaying) {
        const delta = (time - lastTime) / 1000;
        setGlobalTime(prev => {
          let next = prev + delta;
          if (next >= tDuration) {
            setIsPlaying(false);
            next = 0;
          }
          return next;
        });
      }
      lastTime = time;

      // Find active clip safely in ref
      let cAcc = 0;
      let aClipId: string | null = null;
      let localT = 0;

      for (const clip of state.clips) {
        const duration = clip.trimEnd - clip.trimStart;
        if (state.globalTime >= cAcc && state.globalTime < cAcc + duration) {
          aClipId = clip.id;
          localT = clip.trimStart + (state.globalTime - cAcc);
          break;
        }
        cAcc += duration;
      }

      // Update video and audio native elements
      if (aClipId && videoRefs.current.has(aClipId)) {
        const v = videoRefs.current.get(aClipId)!;
        const clip = state.clips.find(c => c.id === aClipId);
        if (clip) {
          if (Math.abs(v.currentTime - localT) > 0.25) {
             v.currentTime = localT;
          }
          if (state.isPlaying && v.paused) v.play().catch(()=>{});
          if (!state.isPlaying && !v.paused) v.pause();
          v.volume = clip.isMuted ? 0 : clip.volume;
        }
      }

      // Sync Audio tracks
      state.audioTracks.forEach(track => {
        const a = audioRefs.current.get(track.id);
        if (a) {
          const trackLocalTime = state.globalTime - track.startTime;
          if (trackLocalTime >= 0 && trackLocalTime <= a.duration) {
            if (Math.abs(a.currentTime - trackLocalTime) > 0.25) a.currentTime = trackLocalTime;
            if (state.isPlaying && a.paused) a.play().catch(()=>{});
            if (!state.isPlaying && !a.paused) a.pause();
            a.volume = track.volume;
          } else {
            a.pause();
          }
        }
      });

      // Render Canvas
      renderCanvas(state.textOverlays, state.globalTime, aClipId);
      animFrame = requestAnimationFrame(loop);
    };
    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, []); // Run once!

  const renderCanvas = (currentOverlays: TextOverlay[], cTime: number, activeVideoId: string | null) => {
    if (!canvasRef.current || !activeVideoId) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const video = videoRefs.current.get(activeVideoId);
    if (!video) return;

    canvasRef.current.width = video.videoWidth || 640;
    canvasRef.current.height = video.videoHeight || 360;
    
    // Draw Video
    try { ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height); } catch(e){}

    // Draw Text Overlays
    currentOverlays.forEach(ov => {
      if (cTime >= ov.startTime && cTime <= ov.endTime) {
        ctx.textAlign = ov.align;
        const x = (ov.x / 100) * canvasRef.current.width;
        const baseY = (ov.y / 100) * canvasRef.current.height;
        const lines = ov.text.split("\n");
        const lineHeight = ov.fontSize * 1.3;

        // Presets Logic
        if (ov.preset === "tiktok-classic") {
          ctx.font = `bold ${ov.fontSize}px 'Proxima Nova', sans-serif`;
          ctx.fillStyle = "white";
          ctx.lineWidth = ov.fontSize * 0.15;
          ctx.strokeStyle = "black";
          lines.forEach((line, i) => {
            const y = baseY + i * lineHeight;
            ctx.strokeText(line, x, y);
            ctx.fillText(line, x, y);
          });
        } else if (ov.preset === "tiktok-box") {
          ctx.font = `bold ${ov.fontSize}px 'Proxima Nova', sans-serif`;
          const padding = 10;
          let maxWidth = 0;
          lines.forEach(line => maxWidth = Math.max(maxWidth, ctx.measureText(line).width));
          
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          const bgX = ov.align === "center" ? x - maxWidth/2 - padding : ov.align === "right" ? x - maxWidth - padding : x - padding;
          const bgY = baseY - ov.fontSize;
          ctx.beginPath();
          ctx.roundRect(bgX, bgY, maxWidth + padding * 2, lines.length * lineHeight + padding, 8);
          ctx.fill();

          ctx.fillStyle = "white";
          lines.forEach((line, i) => ctx.fillText(line, x, baseY + i * lineHeight));
        } else if (ov.preset === "tiktok-yellow") {
          ctx.font = `900 ${ov.fontSize}px 'Proxima Nova', sans-serif`;
          ctx.fillStyle = "#FFD700"; // Yellow
          ctx.lineWidth = ov.fontSize * 0.12;
          ctx.strokeStyle = "black";
          lines.forEach((line, i) => {
            const y = baseY + i * lineHeight;
            ctx.strokeText(line, x, y);
            ctx.fillText(line, x, y);
          });
        }
      }
    });
  };

  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    let closestId = null;
    let closestDist = 10;
    textOverlays.forEach(ov => {
      if (globalTime >= ov.startTime && globalTime <= ov.endTime) {
        const d = Math.sqrt((ov.x - xPct)**2 + (ov.y - yPct)**2);
        if (d < closestDist) { closestId = ov.id; closestDist = d; }
      }
    });
    if (closestId) {
      setDraggingTextId(closestId);
      setSelectedId(closestId);
      setSelectedType("text");
    } else {
      setSelectedId(null); setSelectedType(null);
    }
  };

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    if (!draggingTextId || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setTextOverlays(prev => prev.map(o => o.id === draggingTextId ? { ...o, x: xPct, y: yPct } : o));
  };

  const addTextOverlay = (preset: TextStylePreset) => {
    const t: TextOverlay = {
      id: crypto.randomUUID(), text: "Novo Texto", x: 50, y: 50, fontSize: 40, preset, color: "#fff", bgColor: "transparent", align: "center", startTime: globalTime, endTime: Math.min(globalTime + 3, totalDuration || 5)
    };
    setTextOverlays(prev => [...prev, t]);
    setSelectedType("text");
    setSelectedId(t.id);
  };

  const handleSplitClip = () => {
    if (selectedType !== "clip" || !selectedId) return;
    
    // Encontrar o clipe atual
    const clipIndex = clips.findIndex(c => c.id === selectedId);
    if (clipIndex === -1) return;
    
    const clip = clips[clipIndex];
    
    // Calcular tempo local no clipe com base no globalTime
    let cAcc = 0;
    for (let i = 0; i < clipIndex; i++) {
      cAcc += (clips[i].trimEnd - clips[i].trimStart);
    }
    
    const localPlayheadTime = clip.trimStart + (globalTime - cAcc);
    
    // Se o playhead não estiver em cima deste clipe, não faz nada
    if (globalTime < cAcc || globalTime > cAcc + (clip.trimEnd - clip.trimStart)) {
      toast({ title: "Erro", description: "Mova a agulha de tempo para cima do vídeo que deseja cortar.", variant: "destructive" });
      return;
    }

    // Se estiver muito nas pontas, não divide
    if (localPlayheadTime - clip.trimStart < 0.2 || clip.trimEnd - localPlayheadTime < 0.2) {
       toast({ title: "Inválido", description: "Você não pode cortar exatamente na ponta do vídeo.", variant: "destructive" });
       return;
    }

    // Criar os dois pedaços
    const clip1 = { ...clip, trimEnd: localPlayheadTime };
    const clip2 = { ...clip, id: crypto.randomUUID(), trimStart: localPlayheadTime };
    
    // Duplicar o elemento de vídeo no cache
    const videoElement = document.createElement("video");
    videoElement.src = clip2.url;
    videoElement.muted = true;
    videoRefs.current.set(clip2.id, videoElement);

    const newClips = [...clips];
    newClips.splice(clipIndex, 1, clip1, clip2);
    setClips(newClips);
    toast({ title: "Vídeo dividido!", description: "O clipe foi cortado em duas partes." });
  };

  const selectedClip = clips.find(c => c.id === selectedId);
  const selectedText = textOverlays.find(t => t.id === selectedId);
  const selectedAudio = audioTracks.find(a => a.id === selectedId);

  // --- Timeline Drag Logic ---
  const updateTimeFromMouse = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!timelineRef.current || totalDuration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    setGlobalTime(percentage * totalDuration);
  }, [totalDuration]);

  const handleTimelineMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDraggingTimeline(true);
    setIsPlaying(false); // pause while dragging
    updateTimeFromMouse(e);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDraggingTimeline) {
      updateTimeFromMouse(e);
    }
  };

  const handleTimelineMouseUp = () => {
    setIsDraggingTimeline(false);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60); const s = Math.floor(sec % 60); const ms = Math.floor((sec % 1) * 10);
    return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 shrink-0 bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><SkipBack className="w-4 h-4" /></Button>
          <h1 className="font-semibold text-sm">Projeto Editor TikTok</h1>
        </div>
        <Button onClick={() => {}} disabled={isExporting} className="gap-2 h-8 rounded-full bg-tiktok-pink hover:bg-tiktok-pink/90 text-white">
          <Download className="w-4 h-4" /> Exportar
        </Button>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar (Assets) */}
        <aside className="w-16 border-r border-border/50 bg-card/30 flex flex-col items-center py-4 gap-4">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl" onClick={() => fileInputRef.current?.click()}><Video className="w-5 h-5 text-muted-foreground" /></Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl" onClick={() => audioInputRef.current?.click()}><Music className="w-5 h-5 text-muted-foreground" /></Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl" onClick={() => addTextOverlay("tiktok-classic")}><Type className="w-5 h-5 text-muted-foreground" /></Button>
          <input ref={fileInputRef} type="file" accept="video/*" multiple onChange={handleFileUpload} className="hidden" />
          <input ref={audioInputRef} type="file" accept="audio/*, video/*" multiple onChange={handleAudioUpload} className="hidden" />
        </aside>

        {/* Center Canvas Preview */}
        <div className="flex-1 flex flex-col bg-black/95 relative items-center justify-center p-4">
          <div 
            ref={previewContainerRef}
            className="relative aspect-[9/16] h-full max-h-[70vh] bg-black shadow-2xl overflow-hidden cursor-crosshair border border-white/10"
            onMouseDown={handlePreviewMouseDown}
            onMouseMove={handlePreviewMouseMove}
            onMouseUp={() => setDraggingTextId(null)}
            onMouseLeave={() => setDraggingTextId(null)}
          >
            {clips.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
                <Video className="w-12 h-12 mb-2" />
                <p className="text-sm">Adicione vídeos</p>
              </div>
            ) : (
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
            )}
          </div>
          
          {/* Player Controls */}
          <div className="absolute bottom-6 bg-background/80 backdrop-blur-md px-6 py-2 rounded-full border border-border/50 flex items-center gap-4">
            <span className="text-xs font-mono w-16 text-right">{formatTime(globalTime)}</span>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-white text-black hover:bg-white/90 hover:text-black" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
            </Button>
            <span className="text-xs font-mono w-16">{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Right Properties Panel */}
        <aside className="w-72 border-l border-border/50 bg-card p-4 overflow-y-auto hidden md:block">
          {selectedType === "clip" && selectedClip ? (
            <div className="space-y-6">
              <h3 className="font-bold border-b pb-2">Vídeo</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Volume</label>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setClips(c => c.map(x => x.id === selectedId ? {...x, isMuted: !x.isMuted} : x))}>
                      {selectedClip.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Slider value={[selectedClip.volume]} max={2} step={0.1} onValueChange={v => setClips(c => c.map(x => x.id === selectedId ? {...x, volume: v[0]} : x))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Corte (Ajuste nas pontas)</label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span>Início</span><span>{formatTime(selectedClip.trimStart)}</span></div>
                    <Slider value={[selectedClip.trimStart]} max={selectedClip.duration} step={0.1} onValueChange={v => setClips(c => c.map(x => x.id === selectedId ? {...x, trimStart: Math.min(v[0], selectedClip.trimEnd - 0.5)} : x))} />
                    <div className="flex justify-between text-xs mt-2"><span>Fim</span><span>{formatTime(selectedClip.trimEnd)}</span></div>
                    <Slider value={[selectedClip.trimEnd]} max={selectedClip.duration} step={0.1} onValueChange={v => setClips(c => c.map(x => x.id === selectedId ? {...x, trimEnd: Math.max(v[0], selectedClip.trimStart + 0.5)} : x))} />
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <Button variant="secondary" className="w-full mb-2 bg-tiktok-cyan/10 hover:bg-tiktok-cyan/20 text-tiktok-cyan" onClick={handleSplitClip}>
                    <Scissors className="w-4 h-4 mr-2" /> Dividir (Cortar ao Meio)
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={() => {
                    setClips(c => c.filter(x => x.id !== selectedId)); setSelectedId(null);
                  }}><Trash2 className="w-4 h-4 mr-2" /> Deletar Vídeo</Button>
                </div>
              </div>
            </div>
          ) : selectedType === "text" && selectedText ? (
            <div className="space-y-6">
              <h3 className="font-bold border-b pb-2">Legenda (TikTok)</h3>
              <Textarea value={selectedText.text} onChange={e => setTextOverlays(o => o.map(x => x.id === selectedId ? {...x, text: e.target.value} : x))} className="min-h-[100px] resize-none" />
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block">Estilo Automático</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={selectedText.preset === "tiktok-classic" ? "default" : "outline"} className="text-xs h-8" onClick={() => setTextOverlays(o => o.map(x => x.id === selectedId ? {...x, preset: "tiktok-classic"} : x))}>Clássico</Button>
                  <Button variant={selectedText.preset === "tiktok-box" ? "default" : "outline"} className="text-xs h-8" onClick={() => setTextOverlays(o => o.map(x => x.id === selectedId ? {...x, preset: "tiktok-box"} : x))}>Fundo Preto</Button>
                  <Button variant={selectedText.preset === "tiktok-yellow" ? "default" : "outline"} className="text-xs h-8" onClick={() => setTextOverlays(o => o.map(x => x.id === selectedId ? {...x, preset: "tiktok-yellow"} : x))}>Amarelo</Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Tamanho da Fonte</label>
                <Slider value={[selectedText.fontSize]} max={100} min={10} step={1} onValueChange={v => setTextOverlays(o => o.map(x => x.id === selectedId ? {...x, fontSize: v[0]} : x))} />
              </div>
              
              <Button variant="destructive" className="w-full" onClick={() => {
                setTextOverlays(c => c.filter(x => x.id !== selectedId)); setSelectedId(null);
              }}><Trash2 className="w-4 h-4 mr-2" /> Apagar Texto</Button>
            </div>
          ) : selectedType === "audio" && selectedAudio ? (
             <div className="space-y-6">
              <h3 className="font-bold border-b pb-2">Música / Áudio</h3>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Volume</label>
                <Slider value={[selectedAudio.volume]} max={2} step={0.1} onValueChange={v => setAudioTracks(a => a.map(x => x.id === selectedId ? {...x, volume: v[0]} : x))} />
              </div>
              <Button variant="destructive" className="w-full mt-4" onClick={() => {
                setAudioTracks(c => c.filter(x => x.id !== selectedId)); setSelectedId(null);
              }}><Trash2 className="w-4 h-4 mr-2" /> Deletar Áudio</Button>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center opacity-50">
              <Move className="w-10 h-10 mb-2" />
              <p className="text-sm">Selecione um elemento na timeline ou no preview para editar.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Bottom Timeline */}
      <div className="h-64 border-t border-border/50 bg-card/80 backdrop-blur flex flex-col shrink-0">
        <div className="h-8 border-b border-border/30 flex items-center px-4 gap-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground">Timeline</span>
        </div>
        
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 relative select-none">
          <div 
            ref={timelineRef}
            className="min-w-full h-full relative cursor-text" 
            style={{ width: `${Math.max(totalDuration * 20, 100)}%` }}
            onMouseDown={handleTimelineMouseDown}
            onMouseMove={handleTimelineMouseMove}
            onMouseUp={handleTimelineMouseUp}
            onMouseLeave={handleTimelineMouseUp}
            onTouchStart={handleTimelineMouseDown}
            onTouchMove={handleTimelineMouseMove}
            onTouchEnd={handleTimelineMouseUp}
          >
            {/* Playhead */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 pointer-events-none" style={{ left: `${totalDuration ? (globalTime / totalDuration) * 100 : 0}%` }}>
               <div className="absolute -top-3 -left-2.5 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-transparent border-t-red-500" />
            </div>

            {/* Video Track */}
            <div className="absolute top-4 left-0 right-0 h-14 bg-black/20 rounded-md border border-white/5 flex overflow-hidden">
               {clips.map(clip => {
                 const w = ((clip.trimEnd - clip.trimStart) / totalDuration) * 100;
                 return (
                   <div key={clip.id} onClick={() => {setSelectedType("clip"); setSelectedId(clip.id);}} className={cn("h-full border-r border-black/50 relative overflow-hidden group cursor-pointer", selectedId === clip.id ? "ring-2 ring-primary z-10" : "hover:bg-white/5")} style={{ width: `${w}%` }}>
                     <img src={clip.url} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                     <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay" />
                     <span className="relative z-10 text-[10px] font-bold p-1 truncate text-white shadow-black drop-shadow-md">{clip.name}</span>
                   </div>
                 );
               })}
            </div>

            {/* Text Track */}
            <div className="absolute top-20 left-0 right-0 h-8 bg-black/10 rounded-md border border-white/5 flex">
               {textOverlays.map(ov => {
                 const left = (ov.startTime / totalDuration) * 100;
                 const w = ((ov.endTime - ov.startTime) / totalDuration) * 100;
                 return (
                   <div key={ov.id} onClick={() => {setSelectedType("text"); setSelectedId(ov.id);}} className={cn("absolute h-full rounded-md bg-tiktok-pink/80 border border-tiktok-pink flex items-center px-2 cursor-pointer truncate text-[10px] text-white font-medium", selectedId === ov.id ? "ring-2 ring-white z-10" : "opacity-90")} style={{ left: `${left}%`, width: `${w}%` }}>
                     <Type className="w-3 h-3 mr-1" /> {ov.text}
                   </div>
                 );
               })}
            </div>

            {/* Audio Track */}
            <div className="absolute top-30 left-0 right-0 h-8 bg-black/10 rounded-md border border-white/5 flex mt-10">
               {audioTracks.map(track => {
                 const left = (track.startTime / totalDuration) * 100;
                 // Since we don't extract duration easily here, assume full width for mock
                 const w = 100; 
                 return (
                   <div key={track.id} onClick={() => {setSelectedType("audio"); setSelectedId(track.id);}} className={cn("absolute h-full rounded-md bg-tiktok-green/70 border border-tiktok-green flex items-center px-2 cursor-pointer truncate text-[10px] text-black font-semibold", selectedId === track.id ? "ring-2 ring-white z-10" : "opacity-90")} style={{ left: `${left}%`, width: `${w}%` }}>
                     <Music className="w-3 h-3 mr-1" /> {track.name}
                   </div>
                 );
               })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorVideo;
