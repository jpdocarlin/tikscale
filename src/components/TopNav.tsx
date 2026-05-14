import { LayoutDashboard, TrendingUp, Users, Eye, Video, Settings, Sparkles, Search, ChevronDown, LogOut, UserPen, Menu, X, FileText, Shield, HelpCircle, Info, LogIn, Sun, Moon, ImagePlus, Film, Wand2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}
const NavItem = ({
  icon,
  label,
  to,
  badge,
  badgeColor,
  onClick
}: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return <Link to={to} onClick={onClick} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
      {icon}
      <span className="font-medium text-sm">{label}</span>
      {badge && <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-semibold", badgeColor || "bg-tiktok-pink/20 text-tiktok-pink")}>
          {badge}
        </span>}
    </Link>;
};
const MobileNavItem = ({
  icon,
  label,
  to,
  badge,
  badgeColor,
  onClick
}: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return <Link to={to} onClick={onClick} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
      {icon}
      <span className="font-medium">{label}</span>
      {badge && <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-semibold ml-auto", badgeColor || "bg-tiktok-pink/20 text-tiktok-pink")}>
          {badge}
        </span>}
    </Link>;
};
export const TopNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    theme,
    toggleTheme
  } = useTheme();
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
          // Caso o domínio tenha subdomínio como .tikiaa.site
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
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  return <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4 md:gap-6">
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-background border-border">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-background" />
                </div>
                <div className="text-left">
                  <h1 className="font-bold text-lg text-foreground leading-tight">Painel</h1>
                  <span className="text-[10px] text-muted-foreground">Plataforma TikTok Shop</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-4 gap-1">
              <MobileNavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" to="/" onClick={closeMobileMenu} />
              <MobileNavItem icon={<TrendingUp className="w-5 h-5" />} label="Produtos" to="/products" badge="Hot" onClick={closeMobileMenu} />
              <MobileNavItem icon={<Video className="w-5 h-5" />} label="Criativos" to="/criativos" badge="🔥" onClick={closeMobileMenu} />
              <MobileNavItem icon={<Users className="w-5 h-5" />} label="Afiliação" to="/affiliation" onClick={closeMobileMenu} />
              
              
              <MobileNavItem icon={<ImagePlus className="w-5 h-5" />} label="Gerar Imagem" to="/gerar-imagem" onClick={closeMobileMenu} />
              <MobileNavItem icon={<Wand2 className="w-5 h-5" />} label="Criar Persona" to="/criar-persona" onClick={closeMobileMenu} />
              <MobileNavItem icon={<Film className="w-5 h-5" />} label="Gerar Vídeo" to="/gerar-video" onClick={closeMobileMenu} />
              <MobileNavItem icon={<FileText className="w-5 h-5" />} label="Scripts" to="/scripts" badge="IA" badgeColor="bg-tiktok-pink/20 text-tiktok-pink" onClick={closeMobileMenu} />
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <Link to="/profile/edit" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <UserPen className="w-5 h-5" />
                <span className="font-medium">Editar perfil</span>
              </Link>
              <button onClick={() => {
              handleLogout();
              closeMobileMenu();
            }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors w-full">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mr-2 md:mr-4">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-background" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-foreground leading-tight">Painel
          </h1>
            <span className="text-[10px] text-muted-foreground">Plataforma TikTok Shop</span>
          </div>
        </Link>

        {/* Main Navigation - Desktop Only */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" to="/" />
          <NavItem icon={<TrendingUp className="w-4 h-4" />} label="Produtos" to="/products" badge="Hot" />
          <NavItem icon={<Video className="w-4 h-4" />} label="Criativos" to="/criativos" badge="🔥" />
          <NavItem icon={<Users className="w-4 h-4" />} label="Afiliação" to="/affiliation" />
          
          
          <NavItem icon={<ImagePlus className="w-4 h-4" />} label="Gerar Imagem" to="/gerar-imagem" />
          <NavItem icon={<Wand2 className="w-4 h-4" />} label="Criar Persona" to="/criar-persona" />
          <NavItem icon={<Film className="w-4 h-4" />} label="Gerar Vídeo" to="/gerar-video" />
          <NavItem icon={<FileText className="w-4 h-4" />} label="Scripts" to="/scripts" badge="IA" badgeColor="bg-tiktok-pink/20 text-tiktok-pink" />
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* Search - Desktop Only */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar..." className="w-48 pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300" title={theme === "dark" ? "Modo claro" : "Modo escuro"}>
            {theme === "dark" ? <Sun className="w-5 h-5 transition-transform hover:rotate-45" /> : <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />}
          </button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-2 md:pr-3 py-1 rounded-xl hover:bg-muted/50 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-tiktok-cyan to-tiktok-pink text-xs font-bold text-background">
                    JS
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
      </div>
    </header>;
};