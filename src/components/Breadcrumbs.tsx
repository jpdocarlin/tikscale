import { Link, useLocation } from "react-router-dom";
import { ChevronRight, LayoutDashboard } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Produtos",
  "/criativos": "Criativos",
  "/scripts": "Scripts",
  "/gerar-imagem": "Gerar Imagem",
  "/criar-persona": "Criar Persona",
  "/gerar-video": "Gerar Vídeo",
  "/templates-video": "Templates Vídeo",
  "/editor-video": "Editor de Vídeo",
  "/motion-transfer": "Motion Transfer",
  "/affiliation": "Afiliação",
  "/creditos": "Créditos",
  "/crescimento": "Crescimento",
  "/profile/edit": "Editar Perfil",
  "/termos-de-uso": "Termos de Uso",
  "/politica-de-privacidade": "Privacidade",
  "/faq": "FAQ",
  "/sobre-nos": "Sobre Nós",
};

export function Breadcrumbs() {
  const location = useLocation();

  // Don't show on dashboard
  if (location.pathname === "/") return null;

  const label = routeLabels[location.pathname];
  if (!label) return null;

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 text-xs text-muted-foreground">
      <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <LayoutDashboard className="w-3 h-3" />
        <span>Home</span>
      </Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-foreground font-medium">{label}</span>
    </div>
  );
}
