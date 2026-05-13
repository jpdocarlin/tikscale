import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Video, Sparkles, User, ImagePlus, FileText, Wand2, Film, X } from "lucide-react";
import { cn } from "@/lib/utils";

const mainItems = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/products", icon: TrendingUp, label: "Produtos" },
  { href: "__ai__", icon: Sparkles, label: "IA" },
  { href: "/criativos", icon: Video, label: "Criativos" },
  { href: "/profile/edit", icon: User, label: "Perfil" },
];

const aiActions = [
  { href: "/gerar-imagem", icon: ImagePlus, label: "Gerar Imagem", color: "text-tiktok-cyan" },
  { href: "/scripts", icon: FileText, label: "Scripts", color: "text-tiktok-pink" },
  { href: "/criar-persona", icon: Wand2, label: "Persona", color: "text-tiktok-purple" },
  { href: "/gerar-video", icon: Film, label: "Gerar Vídeo", color: "text-tiktok-yellow" },
];

export function BottomNav() {
  const location = useLocation();
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const hiddenPaths = ["/auth", "/reset-password", "/influencer"];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <>
      {aiMenuOpen && (
        <div className="fixed inset-0 z-[90] md:hidden" onClick={() => setAiMenuOpen(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 grid grid-cols-2 gap-3 p-4 animate-slide-up">
            {aiActions.map((a) => (
              <Link key={a.href} to={a.href} onClick={() => setAiMenuOpen(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/95 border border-border/50 backdrop-blur-xl">
                <div className={cn("w-10 h-10 rounded-xl bg-muted flex items-center justify-center", a.color)}>
                  <a.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-[80] md:hidden">
        <div className="h-16 bg-background/90 backdrop-blur-xl border-t border-border/50 flex items-center justify-around px-2">
          {mainItems.map((item) => {
            if (item.href === "__ai__") {
              return (
                <button key="ai" onClick={() => setAiMenuOpen(!aiMenuOpen)}
                  className={cn("w-14 h-14 -translate-y-4 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-tiktok-cyan to-tiktok-pink transition-all", aiMenuOpen && "rotate-45 scale-95")}>
                  {aiMenuOpen ? <X className="w-6 h-6 text-background" /> : <Sparkles className="w-6 h-6 text-background" />}
                </button>
              );
            }
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} className="flex flex-col items-center gap-0.5 py-1 px-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary animate-dot-pulse" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
