import {
  LayoutDashboard, TrendingUp, Users, Video, FileText, ImagePlus, Film, Wand2,
  Sparkles, LogOut, UserPen, Sun, Moon, ChevronDown, Shield, HelpCircle, Info,
  Zap, BarChart3, Search, Target, MessageSquare
} from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BottomNav } from "@/components/BottomNav";
import { CommandPalette } from "@/components/CommandPalette";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navGroups = [
  {
    label: "Análise",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Produtos", url: "/products", icon: TrendingUp, badge: "Hot" },
      { title: "Criativos", url: "/criativos", icon: Video, badge: "🔥" },
      { title: "Crescimento", url: "/crescimento", icon: Target, badge: "2K" },
    ],
  },
  {
    label: "IA & Criação",
    items: [
      { title: "Gerar Imagem", url: "/gerar-imagem", icon: ImagePlus },
      { title: "Criar Persona", url: "/criar-persona", icon: Wand2 },
      { title: "Gerar Vídeo", url: "/gerar-video", icon: Film },
      { title: "Scripts", url: "/scripts", icon: FileText, badge: "IA" },
      { title: "Prompts Reais", url: "/prompts-reais", icon: MessageSquare, badge: "Novo" },
    ],
  },
  {
    label: "Vídeo",
    items: [
      { title: "Templates Vídeo", url: "/templates-video", icon: Film, badge: "Novo" },
      { title: "Editor de Vídeo", url: "/editor-video", icon: Film, badge: "Novo" },
      { title: "Motion Transfer", url: "/motion-transfer", icon: Sparkles },
    ],
  },
  {
    label: "Monetização",
    items: [
      { title: "Afiliação", url: "/affiliation", icon: Users },
      { title: "Créditos", url: "/creditos", icon: Zap, badge: "+" },
    ],
  },
];

function AppSidebarContent() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      // Envia requisição em segundo plano (fire and forget) sem travar a interface
      supabase.auth.signOut().catch((e) => console.error("Erro ao invalidar no servidor:", e));
    } catch (e) {
      // Silencia qualquer erro inicial na chamada
    }

    // Limpeza síncrona imediata e absoluta de todos os rastros da sessão
    try {
      // 1. Limpar localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key === "userAvatar") {
          localStorage.removeItem(key);
        }
      });

      // 2. Limpar sessionStorage
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          sessionStorage.removeItem(key);
        }
      });

      // 3. Limpar cookies (inclusive com wildcard de subdomínio se houver)
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        if (cookieName.startsWith("sb-")) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          const domainParts = window.location.hostname.split('.');
          if (domainParts.length > 1) {
            const rootDomain = `.${domainParts.slice(-2).join('.')}`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
          }
        }
      });
    } catch (err) {
      console.error("Erro na limpeza local:", err);
    }

    // Redireciona IMEDIATAMENTE forçando recarga da página limpa
    window.location.href = "/auth";
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <div className="p-3 flex items-center gap-3 border-b border-border/30 h-14">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center flex-shrink-0 shadow-lg shadow-tiktok-cyan/20">
          <BarChart3 className="w-4 h-4 text-background" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-sm text-foreground leading-tight">Painel</h1>
            <span className="text-[10px] text-muted-foreground">Plataforma TikTok Shop</span>
          </div>
        )}
      </div>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 font-semibold">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link
                          to={item.url}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative",
                            isActive
                              ? "bg-primary/10 text-primary font-medium shadow-sm shadow-primary/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                          )}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                          )}
                          <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                          {!collapsed && (
                            <span className="text-base">{item.title}</span>
                          )}
                          {!collapsed && item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-tiktok-pink/20 text-tiktok-pink ml-auto">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Bottom section */}
      <div className="mt-auto border-t border-border p-3 space-y-1">
        <Link
          to="/profile/edit"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <UserPen className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Editar perfil</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </Sidebar>
  );
}

function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem("userAvatar") || "";
  });

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatarUrl(localStorage.getItem("userAvatar") || "");
    };
    window.addEventListener("avatarUpdated", handleAvatarUpdate);
    return () => window.removeEventListener("avatarUpdated", handleAvatarUpdate);
  }, []);

  const handleLogout = async () => {
    try {
      // Envia requisição em segundo plano (fire and forget) sem travar a interface
      supabase.auth.signOut().catch((e) => console.error("Erro ao invalidar no servidor:", e));
    } catch (e) {
      // Silencia qualquer erro inicial na chamada
    }

    // Limpeza síncrona imediata e absoluta de todos os rastros da sessão
    try {
      // 1. Limpar localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") || key === "userAvatar") {
          localStorage.removeItem(key);
        }
      });

      // 2. Limpar sessionStorage
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          sessionStorage.removeItem(key);
        }
      });

      // 3. Limpar cookies (inclusive com wildcard de subdomínio se houver)
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        if (cookieName.startsWith("sb-")) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          const domainParts = window.location.hostname.split('.');
          if (domainParts.length > 1) {
            const rootDomain = `.${domainParts.slice(-2).join('.')}`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
          }
        }
      });
    } catch (err) {
      console.error("Erro na limpeza local:", err);
    }

    // Redireciona IMEDIATAMENTE forçando recarga da página limpa
    window.location.href = "/auth";
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border/20 bg-background/70 backdrop-blur-2xl flex items-center px-4 gap-3">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />

      {/* ⌘K Search Badge */}
      <button
        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-muted/40 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border/50 transition-all duration-300 text-xs group"
      >
        <Search className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
        <span className="text-muted-foreground/70">Buscar...</span>
        <kbd className="ml-1.5 px-1.5 py-0.5 rounded-md bg-muted/80 border border-border/40 text-[10px] font-mono text-muted-foreground/60">⌘K</kbd>
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted/50 transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-tiktok-cyan to-tiktok-pink text-xs font-bold text-background">
                  TS
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background border-border">
            <DropdownMenuItem asChild>
              <Link to="/profile/edit" className="flex items-center gap-2 cursor-pointer">
                <UserPen className="w-4 h-4" />
                <span>Editar perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/termos-de-uso" className="flex items-center gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Termos de Uso</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/politica-de-privacidade" className="flex items-center gap-2 cursor-pointer">
                <Shield className="w-4 h-4" />
                <span>Privacidade</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/faq" className="flex items-center gap-2 cursor-pointer">
                <HelpCircle className="w-4 h-4" />
                <span>FAQ</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/sobre-nos" className="flex items-center gap-2 cursor-pointer">
                <Info className="w-4 h-4" />
                <span>Sobre Nós</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <Breadcrumbs />
          <main className="flex-1 has-bottom-nav">{children}</main>
          {/* Mini-footer — hidden on mobile to avoid overlapping bottom nav */}
          <footer className="border-t border-border/50 py-3 px-4 hidden md:block">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
              <div className="flex items-center gap-3">
                <Link to="/termos-de-uso" className="hover:text-foreground transition-colors">Termos</Link>
                <Link to="/politica-de-privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
                <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              </div>
            </div>
          </footer>
          <BottomNav />
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
