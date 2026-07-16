import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { TimeFilter } from "@/components/TimeFilter";
import { StatsCard } from "@/components/StatsCard";
import { SalesChart } from "@/components/SalesChart";
import { TrendsAnalysis } from "@/components/TrendsAnalysis";
import { DollarSign, ShoppingCart, TrendingUp, Sparkles, FileText, Video, ArrowRight, Rocket } from "lucide-react";
import { useUserEmail } from "@/hooks/useUserEmail";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

// Memoized icon components to prevent re-renders
const DollarIcon = memo(() => <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-tiktok-green" />);
const CartIcon = memo(() => <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-tiktok-cyan" />);
const TrendingIcon = memo(() => <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-tiktok-pink" />);
DollarIcon.displayName = "DollarIcon";
CartIcon.displayName = "CartIcon";
TrendingIcon.displayName = "TrendingIcon";

// Quick action cards
const quickActions = [
  { title: "Produtos Virais", desc: "Descubra o que mais vende agora", icon: Rocket, to: "/products", color: "text-tiktok-cyan", bg: "bg-tiktok-cyan/10", glow: "shadow-tiktok-cyan/10" },
  { title: "Gerar com IA", desc: "Imagens, scripts e vídeos", icon: Sparkles, to: "/gerar-imagem", color: "text-tiktok-pink", bg: "bg-tiktok-pink/10", glow: "shadow-tiktok-pink/10" },
  { title: "Scripts", desc: "Roteiros otimizados para vídeo", icon: FileText, to: "/scripts", color: "text-tiktok-purple", bg: "bg-tiktok-purple/10", glow: "shadow-tiktok-purple/10" },
  { title: "Criativos", desc: "Inspire-se nos melhores", icon: Video, to: "/criativos", color: "text-tiktok-yellow", bg: "bg-tiktok-yellow/10", glow: "shadow-tiktok-yellow/10" },
];

// Dados baseados no período
const initialStatsData = {
  "Hoje": { gmv: "R$ 3,9K", itensVendidos: "77", comissao: "R$ 544", baseComissao: "R$ 4,1K", gmvChange: 12.5, itensChange: 8.3, comissaoChange: 14.2, baseChange: 10.1 },
  "7 dias": { gmv: "R$ 36,8K", itensVendidos: "1.052", comissao: "R$ 13,0K", baseComissao: "R$ 39,2K", gmvChange: 18.7, itensChange: 15.2, comissaoChange: 19.4, baseChange: 16.8 },
  "30 dias": { gmv: "R$ 157,7K", itensVendidos: "4,5K", comissao: "R$ 55,7K", baseComissao: "R$ 168,0K", gmvChange: 23.5, itensChange: 21.4, comissaoChange: 24.1, baseChange: 22.3 },
  "90 dias": { gmv: "R$ 473,1K", itensVendidos: "13,5K", comissao: "R$ 167,1K", baseComissao: "R$ 504,0K", gmvChange: 31.2, itensChange: 28.6, comissaoChange: 32.5, baseChange: 29.8 },
};

// Removido animations framer-motion para performance

const Index = () => {
  const { isAdmin } = useUserEmail();
  const [activeFilter, setActiveFilter] = useState("Hoje");

  const baseStats = initialStatsData[activeFilter as keyof typeof initialStatsData];

  const currentStats = baseStats;

  // Get greeting based on time
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-500">
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">

        {/* ── QUICK ACTIONS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {quickActions.map((a, i) => (
            <Link
              key={a.to}
              to={a.to}
              className="group glass-card card-gradient-border inner-shine relative overflow-hidden p-4 md:p-5 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative z-[2]">
                <div className={`w-10 h-10 rounded-2xl ${a.bg} flex items-center justify-center mb-3`}>
                  <a.icon className={`w-5 h-5 ${a.color}`} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-0.5">{a.title}</h3>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{a.desc}</p>
              </div>
              <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* ── TIME FILTER ── */}
        <TimeFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* ── BENTO GRID: Stats + Chart ── */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          {/* GMV — spans 2 cols */}
          <div className="col-span-2">
            <StatsCard icon={<DollarIcon />} iconBg="bg-tiktok-green/15" label="GMV Atribuído" value={isAdmin ? currentStats.gmv : "R$ 0"} change={isAdmin ? currentStats.gmvChange : 0} delay={0} accentColor="hsl(152, 69%, 53%)" />
          </div>

          {/* Items — 2 cols */}
          <div className="col-span-1 lg:col-span-2">
            <StatsCard icon={<CartIcon />} iconBg="bg-tiktok-cyan/15" label="Itens vendidos" value={isAdmin ? currentStats.itensVendidos : "0"} change={isAdmin ? currentStats.itensChange : 0} delay={0} accentColor="hsl(172, 91%, 55%)" />
          </div>

          {/* Commission — 2 cols */}
          <div className="col-span-1 lg:col-span-2">
            <StatsCard icon={<TrendingIcon />} iconBg="bg-tiktok-pink/15" label="Comissão estimada" value={isAdmin ? currentStats.comissao : "R$ 0"} change={isAdmin ? currentStats.comissaoChange : 0} delay={0} accentColor="hsl(348, 99%, 58%)" />
          </div>
        </div>

        {/* ── CHART ── */}
        <div className="mb-8">
          <SalesChart isAdmin={isAdmin} activeFilter={activeFilter} />
        </div>

        {/* ── TRENDS RADAR ── */}
        <div className="mb-8">
          <TrendsAnalysis />
        </div>

      </main>
    </div>
  );
};

export default Index;
