import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import {
  LayoutDashboard, TrendingUp, Video, FileText, ImagePlus, Film,
  Wand2, Sparkles, Users, Zap, Search, CornerDownLeft, ArrowUp,
  ArrowDown, X, BarChart3
} from "lucide-react";

const pages = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, section: "Páginas" },
  { name: "Produtos", href: "/products", icon: TrendingUp, section: "Páginas" },
  { name: "Criativos", href: "/criativos", icon: Video, section: "Páginas" },
  { name: "Scripts IA", href: "/scripts", icon: FileText, section: "Páginas" },
  { name: "Gerar Imagem", href: "/gerar-imagem", icon: ImagePlus, section: "Páginas" },
  { name: "Criar Persona", href: "/criar-persona", icon: Wand2, section: "Páginas" },
  { name: "Gerar Vídeo", href: "/gerar-video", icon: Film, section: "Páginas" },
  { name: "Templates Vídeo", href: "/templates-video", icon: Film, section: "Páginas" },
  { name: "Editor de Vídeo", href: "/editor-video", icon: Film, section: "Páginas" },
  { name: "Motion Transfer", href: "/motion-transfer", icon: Sparkles, section: "Páginas" },
  { name: "Afiliação", href: "/affiliation", icon: Users, section: "Páginas" },
  { name: "Créditos", href: "/creditos", icon: Zap, section: "Páginas" },
  { name: "Crescimento 2K", href: "/crescimento", icon: BarChart3, section: "Páginas" },
];

const quickActions = [
  { name: "Gerar imagem com IA", href: "/gerar-imagem", icon: ImagePlus, section: "Ações Rápidas" },
  { name: "Criar novo script", href: "/scripts", icon: FileText, section: "Ações Rápidas" },
  { name: "Criar persona IA", href: "/criar-persona", icon: Wand2, section: "Ações Rápidas" },
  { name: "Ver produtos trending", href: "/products", icon: TrendingUp, section: "Ações Rápidas" },
];

const allItems = [...pages, ...quickActions];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="relative flex items-start justify-center pt-[20vh]">
        <div className="w-full max-w-lg mx-4 animate-slide-up">
          <Command
            className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            shouldFilter={true}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Command.Input
                ref={inputRef}
                value={search}
                onValueChange={setSearch}
                placeholder="Buscar páginas, ações..."
                className="flex-1 h-12 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
              />
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <Command.List className="max-h-[300px] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                Nenhum resultado encontrado.
              </Command.Empty>

              {/* Páginas */}
              <Command.Group
                heading="Páginas"
                className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground/60 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3"
              >
                {pages.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={item.name}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer text-foreground/80 hover:bg-muted/50 data-[selected=true]:bg-muted/80 data-[selected=true]:text-foreground transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{item.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Ações Rápidas */}
              <Command.Group
                heading="Ações Rápidas"
                className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground/60 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3"
              >
                {quickActions.map((item) => (
                  <Command.Item
                    key={`action-${item.href}`}
                    value={item.name}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer text-foreground/80 hover:bg-muted/50 data-[selected=true]:bg-muted/80 data-[selected=true]:text-foreground transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>{item.name}</span>
                    <Sparkles className="w-3 h-3 text-tiktok-pink/50 ml-auto" />
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>

            {/* Footer hints */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                <span>navegar</span>
              </div>
              <div className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                <span>selecionar</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">esc</span>
                <span>fechar</span>
              </div>
            </div>
          </Command>
        </div>
      </div>
    </div>
  );
}
