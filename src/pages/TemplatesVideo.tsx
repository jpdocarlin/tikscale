import { useState, useRef, useEffect, useCallback } from "react";
import { Copy, Check, Film, Play, Pause, Search, X, Sparkles, Zap, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface VideoTemplate {
  id: number;
  title: string;
  description: string;
  prompt: string;
  videoUrl: string;
  movementLabel: string;
  thumbTime: number;
  category: string;
}

const templates: VideoTemplate[] = [
  {
    id: 1,
    title: "Espelho Confiante",
    description: "Jovem confiante usando o produto em frente ao espelho",
    movementLabel: "↻ 360°",
    category: "Rotação",
    thumbTime: 3,
    prompt: `Realistic vertical TikTok video, 4K, static camera, only the character moves.\n\nYoung Brazilian woman wearing [PRODUTO] standing in front of a full-length mirror.\n\nNatural soft lighting, minimal bedroom background.\n\nMovement sequence:\n\n1. Starts facing the mirror, hands on waist\n\n2. Slowly rotates body 180 degrees showing the back of the outfit\n\n3. Turns back to face camera\n\n4. Looks directly at camera with confident smile\n\nHyper-realistic skin texture, fluid natural movement, no camera shake.`,
    videoUrl: "/templates/template_1.mp4",
  },
  {
    id: 2,
    title: "Casual Natural",
    description: "Jovem gravando vídeo casual para TikTok",
    movementLabel: "→ Caminhando",
    category: "Casual",
    thumbTime: 2,
    prompt: `Realistic vertical TikTok video, 4K, static camera, only the character moves.\n\nYoung Brazilian woman wearing [PRODUTO] sitting casually, warm indoor lighting.\n\nMovement sequence:\n\n1. Looks at camera with relaxed natural smile\n\n2. Gently tucks hair behind ear with one hand\n\n3. Shifts body slightly to the side\n\n4. Returns to center, smiles at camera\n\nHyper-realistic skin texture, fluid natural movement, no camera shake.`,
    videoUrl: "/templates/template_2.mp4",
  },
  {
    id: 3,
    title: "Estética Premium",
    description: "Mulher estilosa em ambiente minimalista",
    movementLabel: "✦ Detalhes",
    category: "Premium",
    thumbTime: 4,
    prompt: `Realistic vertical TikTok video, 4K, static camera, only the character moves.\n\nStylish Brazilian woman wearing [PRODUTO], clean white minimalist background, soft studio lighting.\n\nMovement sequence:\n\n1. Stands still facing camera, hands relaxed at sides\n\n2. Takes two slow steps forward toward camera\n\n3. Stops, adjusts outfit slightly with both hands\n\n4. Looks up at camera with confident expression\n\nHyper-realistic skin texture, fluid elegant movement, no camera shake.`,
    videoUrl: "/templates/template_3.mp4",
  },
  {
    id: 4,
    title: "Toque Sensual",
    description: "Jovem com toque sensual mostrando o look",
    movementLabel: "↩ Costas/Frente",
    category: "Sensual",
    thumbTime: 3.5,
    prompt: `Realistic vertical TikTok video, 4K, static camera, only the character moves.\n\nYoung Brazilian woman wearing [PRODUTO], warm indoor lighting, casual setting.\n\nMovement sequence:\n\n1. Faces camera with subtle confident smile\n\n2. Turns body slightly to the right side, showing outfit profile\n\n3. Gently runs hand down the fabric of the outfit\n\n4. Slowly turns back to face camera, smiles\n\nHyper-realistic skin texture, fluid natural movement, no camera shake.`,
    videoUrl: "/templates/template_4.mp4",
  },
  {
    id: 5,
    title: "Corpo em Forma",
    description: "Mulher em forma mostrando o look",
    movementLabel: "⟳ Transição",
    category: "Fitness",
    thumbTime: 2.5,
    prompt: `Realistic vertical TikTok video, 4K, static camera, only the character moves.\n\nFit Brazilian woman wearing [PRODUTO], clean light background, soft natural lighting.\n\nMovement sequence:\n\n1. Starts facing camera, confident posture\n\n2. Slowly turns to show back of outfit, hands gently touching waist\n\n3. Moves hips naturally side to side once\n\n4. Turns back to face camera with active confident smile\n\nHyper-realistic skin texture, fluid natural movement, no camera shake.`,
    videoUrl: "/templates/template_5.mp4",
  },
  {
    id: 6,
    title: "Look do Dia",
    description: "Mulher mostrando o look do dia com vibe casual",
    movementLabel: "◎ Close up",
    category: "Casual",
    thumbTime: 3,
    prompt: `Realistic vertical TikTok video, 4K, static camera, only the character moves.\n\nBrazilian woman wearing [PRODUTO], natural window lighting, casual indoor setting.\n\nMovement sequence:\n\n1. Faces camera smiling naturally\n\n2. Reaches right hand to adjust neckline of outfit\n\n3. Sways body gently left then right\n\n4. Drops hand, looks at camera with casual influencer smile\n\nHyper-realistic skin texture, fluid natural movement, no camera shake.`,
    videoUrl: "/templates/template_6.mp4",
  },
  {
    id: 7,
    title: "Revelação Corpo Inteiro",
    description: "Jovem caminhando para trás revelando o look completo",
    movementLabel: "↦ Afastando",
    category: "Revelação",
    thumbTime: 3,
    prompt: `Realistic vertical TikTok video, 4K, static camera fixed on a surface, only the character moves.\n\nYoung Brazilian woman wearing [PRODUTO], indoor setting with natural light.\n\nMovement sequence:\n\n1. Starts very close to camera, face and upper body filling the frame\n\n2. Slowly walks backwards away from camera\n\n3. Stops when full body is visible head to toe\n\n4. Pauses, looks at camera with confident smile\n\n5. Slightly adjusts outfit with one hand\n\nThe camera never moves. Only the character moves away from it, revealing the full outfit gradually.\n\nHyper-realistic skin texture, fluid natural movement, no camera shake, depth of field effect as she walks back.`,
    videoUrl: "/templates/template_7.mp4",
  },
  {
    id: 8,
    title: "Entrada Lateral",
    description: "Jovem entrando em cena lateralmente com vibe tranquila e confiante",
    movementLabel: "← Lateral",
    category: "Entrada",
    thumbTime: 3,
    prompt: `Realistic vertical TikTok video, 4K, static camera on tripod, only the character moves.\n\nYoung Brazilian woman wearing [PRODUCT], near a door or hallway.\n\nMovement sequence:\n\n1. Enters the scene laterally, naturally\n\n2. Pauses, looks at her clothes\n\n3. Looks at the camera as if to say "okay, I look good"\n\n4. Tosses her hair back once and walks towards the door\n\nEnergy: slow, but still cute.\n\nWithout putting anything in her hand, she puts her hand on her pants and walks away backwards at the end of the video.\n\nHyper-realistic skin texture, fluid and natural movement, no camera shake.`,
    videoUrl: "/templates/template_8.mp4",
  },
  {
    id: 9,
    title: "Noite Especial",
    description: "Jovem se arrumando e revelando o look completo com empolgação",
    movementLabel: "⟳ Twirl",
    category: "Festa",
    thumbTime: 3,
    prompt: `Realistic vertical TikTok video, 4K, static camera propped on dresser, only the character moves.\n\nYoung Brazilian woman wearing [PRODUTO].\n\nMovement sequence:\n\n1. Stands up, smooths out outfit with hands\n\n2. Steps back to see full look in mirror\n\n3. Turns to camera with excited expression\n\n4. Does a quick twirl showing the outfit\n\nEnergy: getting ready for a night out.\n\nHyper-realistic skin texture, fluid natural movement, no camera shake.`,
    videoUrl: "/templates/template_9.mp4",
  },
];

const ALL_CATEGORIES = ["Todos", ...Array.from(new Set(templates.map((t) => t.category)))];

// ── Prompt Modal ──────────────────────────────────────────────────────────────
const PromptModal = ({
  template,
  onClose,
}: {
  template: VideoTemplate;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    toast.success("Prompt copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden animate-slide-up"
        style={{
          background: "linear-gradient(145deg, hsl(228,16%,8%/0.98) 0%, hsl(228,16%,6%/0.98) 100%)",
          border: "1px solid hsl(172,91%,55%/0.25)",
          boxShadow: "0 0 60px hsl(172,91%,55%/0.12), 0 40px 80px -20px hsl(228,30%,2%/0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between p-5 border-b border-border/30">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70 mb-1">Prompt — Template {template.id}</p>
            <h2 className="text-base font-bold">{template.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* prompt body */}
        <div className="p-5">
          <div
            className="rounded-xl p-4 text-xs leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap max-h-72 overflow-y-auto"
            style={{ background: "hsl(228,18%,4%)", border: "1px solid hsl(228,14%,16%)" }}
          >
            {template.prompt}
          </div>
        </div>

        {/* footer */}
        <div className="px-5 pb-5 flex gap-3">
          <Button
            onClick={copy}
            className="flex-1 btn-glow"
            style={{
              background: copied
                ? "hsl(152,69%,53%)"
                : "linear-gradient(135deg, hsl(172,91%,55%) 0%, hsl(265,85%,62%) 100%)",
              color: "hsl(228,18%,3%)",
              fontWeight: 700,
            }}
          >
            {copied ? (
              <><Check className="w-4 h-4 mr-2" />Copiado!</>
            ) : (
              <><Copy className="w-4 h-4 mr-2" />Copiar Prompt</>
            )}
          </Button>
          <Button variant="outline" onClick={onClose} className="border-border/40 hover:bg-muted/30">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Template Card ─────────────────────────────────────────────────────────────
const TemplateCard = ({
  template,
  index,
  onOpenModal,
}: {
  template: VideoTemplate;
  index: number;
  onOpenModal: (t: VideoTemplate) => void;
}) => {
  const [isFullPlay, setIsFullPlay] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const startPreviewLoop = useCallback(() => {
    const v = videoRef.current;
    if (!v || isFullPlay) return;
    const start = template.thumbTime;
    v.currentTime = start;
    v.play().catch(() => {});
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = window.setInterval(() => {
      if (v.currentTime >= start + 2 || v.paused) {
        if (!isFullPlay) { v.currentTime = start; v.play().catch(() => {}); }
      }
    }, 100);
  }, [template.thumbTime, isFullPlay]);

  useEffect(() => {
    if (isLoaded && !isFullPlay) startPreviewLoop();
    return () => { if (loopRef.current) clearInterval(loopRef.current); };
  }, [isLoaded, isFullPlay, startPreviewLoop]);

  const handleClick = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isFullPlay) { v.pause(); setIsFullPlay(false); }
    else {
      if (loopRef.current) clearInterval(loopRef.current);
      v.currentTime = 0;
      v.play().catch(() => {});
      setIsFullPlay(true);
    }
  };

  const quickCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    toast.success("Prompt copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden card-gradient-border hover-glow inner-shine"
      style={{
        background: "linear-gradient(145deg, hsl(228,16%,7%/0.95) 0%, hsl(228,16%,5%/0.95) 100%)",
        border: "1px solid hsl(228,14%,15%)",
        animation: `fade-in 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 60}ms both`,
      }}
    >
      {/* Video section */}
      <div
        ref={containerRef}
        className="aspect-[9/16] max-h-[300px] bg-black relative cursor-pointer overflow-hidden"
        onClick={handleClick}
      >
        {isVisible ? (
          <video
            ref={videoRef}
            src={template.videoUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            muted
            playsInline
            preload="metadata"
            onLoadedData={() => setIsLoaded(true)}
            onEnded={() => setIsFullPlay(false)}
          />
        ) : (
          <div className="w-full h-full animate-shimmer" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* Play/Pause overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isFullPlay ? "opacity-0 group-hover:opacity-100" : "opacity-0"}`}>
          <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
            <Pause className="w-5 h-5 text-white" />
          </div>
        </div>

        {!isFullPlay && !isLoaded && isVisible && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span
            className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider"
            style={{ background: "hsl(172,91%,55%/0.15)", border: "1px solid hsl(172,91%,55%/0.3)", color: "hsl(172,91%,65%)" }}
          >
            Grok
          </span>
        </div>

        {/* Movement label */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white/90">
            {template.movementLabel}
          </span>
          {!isFullPlay && isLoaded && (
            <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] text-white/60 animate-pulse">
              tap para ver
            </span>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate">{template.title}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{template.description}</p>
          </div>
          <Badge
            className="flex-shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded-lg"
            style={{ background: "hsl(265,85%,62%/0.15)", border: "1px solid hsl(265,85%,62%/0.3)", color: "hsl(265,85%,75%)" }}
          >
            {template.category}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={quickCopy}
            size="sm"
            className="flex-1 h-8 text-xs font-semibold transition-all duration-300"
            style={{
              background: copied
                ? "hsl(152,69%,53%/0.2)"
                : "hsl(172,91%,55%/0.12)",
              border: `1px solid ${copied ? "hsl(152,69%,53%/0.4)" : "hsl(172,91%,55%/0.3)"}`,
              color: copied ? "hsl(152,69%,65%)" : "hsl(172,91%,60%)",
            }}
          >
            {copied ? <><Check className="w-3 h-3 mr-1.5" />Copiado!</> : <><Copy className="w-3 h-3 mr-1.5" />Copiar</>}
          </Button>
          <Button
            onClick={() => onOpenModal(template)}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-border/40 hover:bg-muted/30 hover:border-primary/30 flex-shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const TemplatesVideo = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [modalTemplate, setModalTemplate] = useState<VideoTemplate | null>(null);

  const filtered = templates.filter((t) => {
    const matchCat = activeCategory === "Todos" || t.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 100% at 50% -20%, hsl(172,91%,55%/0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 90% 50%, hsl(265,85%,62%/0.05) 0%, transparent 50%)",
          }}
        />
        <div className="relative p-5 md:p-8 lg:p-10">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(172,91%,55%/0.15)", border: "1px solid hsl(172,91%,55%/0.3)" }}
            >
              <Film className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">Templates</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            <span className="gradient-text">Templates de Vídeo</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Escolha um template, copie o prompt e gere seu vídeo diretamente no Grok com um clique.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            {[
              { icon: Sparkles, label: `${templates.length} templates`, color: "hsl(172,91%,55%)" },
              { icon: Zap, label: "Grok AI", color: "hsl(265,85%,62%)" },
              { icon: ChevronRight, label: "Pronto para usar", color: "hsl(43,96%,62%)" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 space-y-5">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-9 rounded-xl text-sm bg-muted/30 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-muted/40 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 flex-nowrap">
            {ALL_CATEGORIES.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="flex-shrink-0 px-3 h-9 rounded-xl text-xs font-semibold transition-all duration-300"
                  style={{
                    background: active ? "hsl(172,91%,55%/0.18)" : "hsl(228,14%,10%)",
                    border: `1px solid ${active ? "hsl(172,91%,55%/0.4)" : "hsl(228,14%,18%)"}`,
                    color: active ? "hsl(172,91%,60%)" : "hsl(220,10%,50%)",
                    boxShadow: active ? "0 0 20px hsl(172,91%,55%/0.1)" : "none",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        {(search || activeCategory !== "Todos") && (
          <p className="text-xs text-muted-foreground">
            {filtered.length} template{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {filtered.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={i}
                onOpenModal={setModalTemplate}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "hsl(228,14%,10%)", border: "1px solid hsl(228,14%,18%)" }}
            >
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Nenhum template encontrado</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tente outro termo ou categoria</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("Todos"); }}
              className="mt-4 text-xs text-primary hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalTemplate && (
        <PromptModal template={modalTemplate} onClose={() => setModalTemplate(null)} />
      )}
    </div>
  );
};

export default TemplatesVideo;
