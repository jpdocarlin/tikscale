import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Flame, Zap,
  ArrowUpRight, ArrowDownRight, Activity, Eye, Percent, X,
  Play, Heart, MessageCircle, Share2, Video, Trophy, Crown, Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MainTab = "metricas" | "videos";

interface VideoCreative {
  id: number;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  sales: number;
  creator: string;
  duration: string;
  rank: number;
  style: string;
}

function generateVideos(productId: number, productName: string): VideoCreative[] {
  const styles = ["UGC Review", "Unboxing", "Antes/Depois", "Rotina", "Tutorial", "POV", "ASMR", "Comparação"];
  const creators = ["@mariasales_", "@pedroafiliado", "@juliadigital", "@lucasmkt", "@anavendas", "@gustavocriat", "@camireviews", "@rafatiktok"];
  const durations = ["0:15", "0:22", "0:30", "0:18", "0:45", "1:00", "0:35", "0:28"];
  
  return Array.from({ length: 8 }, (_, i) => {
    const seed = productId * 100 + i;
    const r1 = Math.sin(seed * 9301 + 49297) * 233280;
    const r = r1 - Math.floor(r1);
    const r2 = Math.sin(seed * 5501 + 12345) * 123456;
    const rv = r2 - Math.floor(r2);
    
    const baseViews = 50000 + Math.round(r * 2000000);
    const viewDecay = Math.pow(0.6, i);
    const views = Math.round(baseViews * viewDecay);
    const likeRate = 0.04 + rv * 0.08;
    const commentRate = 0.002 + rv * 0.005;
    const shareRate = 0.005 + rv * 0.01;
    const convRate = 0.01 + rv * 0.03;
    
    return {
      id: i + 1,
      thumbnail: `https://picsum.photos/seed/${productId * 10 + i}/400/700`,
      views,
      likes: Math.round(views * likeRate),
      comments: Math.round(views * commentRate),
      shares: Math.round(views * shareRate),
      sales: Math.round(views * convRate),
      creator: creators[i % creators.length],
      duration: durations[i % durations.length],
      rank: i + 1,
      style: styles[i % styles.length],
    };
  }).sort((a, b) => b.sales - a.sales);
}

const fmtCompact = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toString();
};

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <div className="absolute top-2 left-2 bg-yellow-500 text-black rounded-full w-7 h-7 flex items-center justify-center"><Crown className="w-4 h-4" /></div>;
  if (rank === 2) return <div className="absolute top-2 left-2 bg-gray-300 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center"><Medal className="w-4 h-4" /></div>;
  if (rank === 3) return <div className="absolute top-2 left-2 bg-amber-700 text-white rounded-full w-7 h-7 flex items-center justify-center"><Trophy className="w-3.5 h-3.5" /></div>;
  return <div className="absolute top-2 left-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">#{rank}</div>;
};

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  commission: number;
  sales: number;
  rating: number;
  badge?: { text: string; type: "hot" | "scaling" | "trending" };
  image?: string;
  affiliateLink: string;
}

interface ProductSalesModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function parsePrice(price: string): number {
  return parseFloat(price.replace("R$ ", "").replace(/\./g, "").replace(",", "."));
}

type Period = "Hoje" | "7 dias" | "30 dias";

function generateData(product: Product) {
  const id = product.id;
  const base = product.sales;
  const priceNum = parsePrice(product.price);
  const isHot = product.badge?.type === "hot";
  const isScaling = product.badge?.type === "scaling";

  function makePoint(label: string, seedOffset: number, baseMultiplier: number) {
    const r1 = rand(id * 100 + seedOffset);
    const r2 = rand(id * 200 + seedOffset + 7);
    const r3 = rand(id * 300 + seedOffset + 13);
    const noise = (r1 + r2 + r3) / 3;
    const spike = r1 > 0.92 ? 1.8 : r1 < 0.08 ? 0.4 : 1;
    const trend = isHot ? 1.15 : isScaling ? 1.08 : 1.0;
    const vendas = Math.max(1, Math.round(base * baseMultiplier * noise * spike * trend));
    const viewMultiplier = 8 + r2 * 15;
    const views = Math.round(vendas * viewMultiplier);
    const receita = Math.round(vendas * priceNum * 100) / 100;
    const comissao = Math.round(vendas * product.commission * 100) / 100;
    const conversao = views > 0 ? Math.round((vendas / views) * 10000) / 100 : 0;
    return { label, vendas, views, receita, comissao, conversao };
  }

  const today = Array.from({ length: 16 }, (_, i) => {
    const hour = 8 + i;
    const hourCurve = [0.3, 0.5, 0.7, 0.9, 1.1, 0.8, 0.6, 0.7, 0.9, 1.2, 1.4, 1.3, 1.1, 0.8, 0.5, 0.3];
    return makePoint(`${hour}h`, i * 3, 0.003 * hourCurve[i]);
  });

  const week = Array.from({ length: 7 }, (_, i) => {
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const dayCurve = [0.85, 0.92, 1.0, 1.05, 1.2, 1.1, 0.75];
    return makePoint(days[i], 50 + i * 5, 0.02 * dayCurve[i]);
  });

  const month = Array.from({ length: 30 }, (_, i) => {
    const weekCycle = Math.sin((i / 7) * Math.PI * 2) * 0.2;
    const trendLine = isHot ? 0.7 + (i / 30) * 0.6 : isScaling ? 0.8 + (i / 30) * 0.4 : 0.9 + Math.sin((i / 30) * Math.PI) * 0.2;
    return makePoint(`${i + 1}`, 100 + i * 2, 0.008 * (trendLine + weekCycle));
  });

  return { today, week, month };
}

type HypeLevel = "🔥 Em Hype" | "🚀 Escalando" | "📈 Crescendo" | "😐 Estável" | "📉 Caindo";

function getHype(product: Product, data: ReturnType<typeof generateData>) {
  const w = data.week;
  const first = w.slice(0, 3).reduce((s, d) => s + d.vendas, 0);
  const second = w.slice(4).reduce((s, d) => s + d.vendas, 0);
  const trend = first > 0 ? Math.round(((second - first) / first) * 100) : 0;
  let score = 0;
  score += Math.min(40, (product.sales / 3200) * 40);
  score += Math.min(30, Math.max(0, trend) * 1.5);
  if (product.badge?.type === "hot") score += 20;
  else if (product.badge?.type === "scaling") score += 15;
  else if (product.badge?.type === "trending") score += 10;
  score += product.rating >= 4.7 ? 10 : product.rating >= 4.5 ? 5 : 0;
  score = Math.min(100, Math.round(score));

  let level: HypeLevel, color: string, desc: string, bg: string;
  if (score >= 80) { level = "🔥 Em Hype"; color = "text-red-400"; bg = "from-orange-500 to-red-500"; desc = "Alta demanda e crescimento acelerado"; }
  else if (score >= 60) { level = "🚀 Escalando"; color = "text-orange-400"; bg = "from-yellow-500 to-orange-500"; desc = "Crescendo consistentemente"; }
  else if (score >= 40) { level = "📈 Crescendo"; color = "text-tiktok-cyan"; bg = "from-tiktok-cyan to-tiktok-green"; desc = "Tendência positiva de vendas"; }
  else if (score >= 20) { level = "😐 Estável"; color = "text-muted-foreground"; bg = "from-muted-foreground/40 to-muted-foreground/20"; desc = "Sem variação significativa"; }
  else { level = "📉 Caindo"; color = "text-red-500"; bg = "from-red-500/40 to-red-500/20"; desc = "Queda nas vendas"; }

  return { score, level, color, bg, trend, desc };
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background/95 backdrop-blur-md p-3 shadow-2xl">
      <p className="font-bold text-xs mb-1.5 text-foreground">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-6 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
            <span className="text-[11px] text-muted-foreground">{e.name}</span>
          </div>
          <span className="text-[11px] font-bold tabular-nums" style={{ color: e.color }}>
            {e.name === "Vendas" ? e.value.toLocaleString("pt-BR") + " un"
              : e.name === "Views" ? e.value.toLocaleString("pt-BR")
              : e.name === "Conversão" ? e.value + "%"
              : "R$ " + e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
};

const fmt = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return v.toString();
};
const fmtR = (v: number) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v.toFixed(0)}`;

// Stat card component
const StatCard = ({ icon: Icon, color, bgColor, label, value, sub, subColor, SubIcon }: {
  icon: any; color: string; bgColor: string; label: string; value: string;
  sub?: string; subColor?: string; SubIcon?: any;
}) => (
  <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <div className={cn("p-2 rounded-lg", bgColor)}>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      {sub && SubIcon && (
        <div className={cn("flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold", subColor?.includes("green") ? "bg-tiktok-green/10" : "bg-red-500/10")}>
          <SubIcon className={cn("w-3 h-3", subColor)} />
          <span className={subColor}>{sub}</span>
        </div>
      )}
    </div>
    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-2">{label}</p>
    <p className="text-2xl font-black tabular-nums">{value}</p>
  </div>
);

export const ProductSalesModal = ({ product, open, onOpenChange }: ProductSalesModalProps) => {
  const [period, setPeriod] = useState<Period>("7 dias");
  const [mainTab, setMainTab] = useState<MainTab>("metricas");
  const data = useMemo(() => product ? generateData(product) : null, [product]);
  const hype = useMemo(() => product && data ? getHype(product, data) : null, [product, data]);

  const chart = product && data ? (period === "Hoje" ? data.today : period === "7 dias" ? data.week : data.month) : [];
  const totals = chart.reduce(
    (acc, d) => ({ vendas: acc.vendas + d.vendas, views: acc.views + d.views, receita: acc.receita + d.receita, comissao: acc.comissao + d.comissao }),
    { vendas: 0, views: 0, receita: 0, comissao: 0 }
  );
  const avgConv = totals.views > 0 ? Math.round((totals.vendas / totals.views) * 10000) / 100 : 0;
  const animKey = `${product?.id}-${period}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl p-0 overflow-y-auto bg-background border-l border-border">
        <SheetDescription className="sr-only">Dashboard de métricas do produto</SheetDescription>
        {product && data && hype ? (
          <div className="animate-fade-in">
            {/* Top bar */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
              <div className="flex items-center gap-4">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-border" />
                )}
                <div className="flex-1 min-w-0">
                  <SheetHeader className="p-0 space-y-0">
                    <SheetTitle className="text-base font-bold truncate">{product.name}</SheetTitle>
                  </SheetHeader>
                  <p className="text-xs text-muted-foreground">{product.category} • {product.price}</p>
                </div>
                {product.badge && (
                  <span className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 uppercase tracking-wide",
                    product.badge.type === "hot" && "bg-red-500/15 text-red-400",
                    product.badge.type === "scaling" && "bg-orange-500/15 text-orange-400",
                    product.badge.type === "trending" && "bg-tiktok-cyan/15 text-tiktok-cyan",
                  )}>
                    {product.badge.type === "hot" && <Flame className="w-3 h-3" />}
                    {product.badge.type === "scaling" && <Zap className="w-3 h-3" />}
                    {product.badge.type === "trending" && <TrendingUp className="w-3 h-3" />}
                    {product.badge.text}
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Main Tabs: Métricas / Vídeos */}
              <div className="flex gap-1 p-1 bg-muted rounded-xl">
                <button
                  onClick={() => setMainTab("metricas")}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                    mainTab === "metricas" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Activity className="w-4 h-4" />
                  Métricas
                </button>
                <button
                  onClick={() => setMainTab("videos")}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                    mainTab === "videos" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Video className="w-4 h-4" />
                  Criativos
                </button>
              </div>

              {mainTab === "metricas" && (
                <div className="space-y-5 animate-fade-in">
                  {/* Hype Score */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hype Score</span>
                      </div>
                      <span className={cn("text-sm font-bold", hype.color)}>{hype.level}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out", hype.bg)}
                            style={{ width: `${hype.score}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5">{hype.desc}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-black tabular-nums">{hype.score}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Period Tabs */}
                  <div className="flex gap-1 p-1 bg-muted rounded-xl">
                    {(["Hoje", "7 dias", "30 dias"] as Period[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                          period === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <StatCard icon={ShoppingCart} color="text-tiktok-cyan" bgColor="bg-tiktok-cyan/10" label="Vendas" value={totals.vendas.toLocaleString()}
                      sub={`${hype.trend >= 0 ? "+" : ""}${hype.trend}%`}
                      subColor={hype.trend >= 0 ? "text-tiktok-green" : "text-red-400"}
                      SubIcon={hype.trend >= 0 ? ArrowUpRight : ArrowDownRight}
                    />
                    <StatCard icon={Eye} color="text-tiktok-yellow" bgColor="bg-tiktok-yellow/10" label="Views" value={fmt(totals.views)} />
                    <StatCard icon={DollarSign} color="text-tiktok-green" bgColor="bg-tiktok-green/10" label="Receita" value={fmtR(totals.receita)} />
                    <StatCard icon={TrendingUp} color="text-tiktok-pink" bgColor="bg-tiktok-pink/10" label="Comissão" value={fmtR(totals.comissao)} />
                    <StatCard icon={Percent} color="text-purple-400" bgColor="bg-purple-400/10" label="Conversão" value={`${avgConv}%`} />
                  </div>

                  {/* Chart: Vendas */}
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-tiktok-cyan" />
                        Vendas
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {period === "Hoje" ? "Por hora" : period === "7 dias" ? "Últimos 7 dias" : "Últimos 30 dias"}
                      </span>
                    </div>
                    <div className="h-[220px] mt-2" key={`v-${animKey}`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chart}>
                          <CartesianGrid stroke="#e5e7eb" strokeWidth={1} />
                          <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickMargin={8} interval={period === "30 dias" ? 4 : 0} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} tickLine={{ stroke: "#d1d5db" }} />
                          <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={fmt} width={40} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} tickLine={{ stroke: "#d1d5db" }} />
                          <Tooltip content={<ChartTooltip />} />
                          <Line type="monotone" dataKey="vendas" stroke="hsl(172, 91%, 45%)" strokeWidth={3.5} name="Vendas"
                            dot={{ r: 6, fill: "hsl(172, 91%, 45%)", stroke: "#fff", strokeWidth: 3 }}
                            activeDot={{ r: 9, fill: "hsl(172, 91%, 45%)", stroke: "#fff", strokeWidth: 3 }}
                            isAnimationActive animationDuration={1800} animationEasing="ease-in-out"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart: Views */}
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Eye className="w-4 h-4 text-tiktok-yellow" />
                        Visualizações
                      </h3>
                    </div>
                    <div className="h-[200px] mt-2" key={`w-${animKey}`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chart}>
                          <CartesianGrid stroke="#e5e7eb" strokeWidth={1} />
                          <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickMargin={8} interval={period === "30 dias" ? 4 : 0} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} tickLine={{ stroke: "#d1d5db" }} />
                          <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={fmt} width={40} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} tickLine={{ stroke: "#d1d5db" }} />
                          <Tooltip content={<ChartTooltip />} />
                          <Line type="monotone" dataKey="views" stroke="hsl(48, 96%, 48%)" strokeWidth={3.5} name="Views"
                            dot={{ r: 6, fill: "hsl(48, 96%, 48%)", stroke: "#fff", strokeWidth: 3 }}
                            activeDot={{ r: 9, fill: "hsl(48, 96%, 48%)", stroke: "#fff", strokeWidth: 3 }}
                            isAnimationActive animationDuration={2000} animationEasing="ease-in-out" animationBegin={300}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart: Receita + Comissão */}
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-tiktok-green" />
                        Receita & Comissão
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(172, 91%, 45%)" }} />
                          <span className="text-[10px] text-muted-foreground">Receita</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(348, 99%, 55%)" }} />
                          <span className="text-[10px] text-muted-foreground">Comissão</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[200px] mt-2" key={`r-${animKey}`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chart}>
                          <CartesianGrid stroke="#e5e7eb" strokeWidth={1} />
                          <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickMargin={8} interval={period === "30 dias" ? 4 : 0} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} tickLine={{ stroke: "#d1d5db" }} />
                          <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={fmtR} width={55} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} tickLine={{ stroke: "#d1d5db" }} />
                          <Tooltip content={<ChartTooltip />} />
                          <Line type="monotone" dataKey="receita" stroke="hsl(172, 91%, 45%)" strokeWidth={3.5} name="Receita"
                            dot={{ r: 6, fill: "hsl(172, 91%, 45%)", stroke: "#fff", strokeWidth: 3 }}
                            activeDot={{ r: 9, fill: "hsl(172, 91%, 45%)", stroke: "#fff", strokeWidth: 3 }}
                            isAnimationActive animationDuration={1500} animationEasing="ease-in-out" animationBegin={200}
                          />
                          <Line type="monotone" dataKey="comissao" stroke="hsl(348, 99%, 55%)" strokeWidth={3.5} name="Comissão"
                            dot={{ r: 6, fill: "hsl(348, 99%, 55%)", stroke: "#fff", strokeWidth: 3 }}
                            activeDot={{ r: 9, fill: "hsl(348, 99%, 55%)", stroke: "#fff", strokeWidth: 3 }}
                            isAnimationActive animationDuration={1500} animationEasing="ease-in-out" animationBegin={500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart: Conversão */}
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Percent className="w-4 h-4 text-purple-500" />
                        Taxa de Conversão
                      </h3>
                    </div>
                    <div className="h-[180px] mt-2" key={`c-${animKey}`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chart}>
                          <CartesianGrid stroke="#e5e7eb" strokeWidth={1} />
                          <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickMargin={8} interval={period === "30 dias" ? 4 : 0} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} tickLine={{ stroke: "#d1d5db" }} />
                          <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(v) => `${v}%`} width={40} axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }} tickLine={{ stroke: "#d1d5db" }} />
                          <Tooltip content={<ChartTooltip />} />
                          <Line type="monotone" dataKey="conversao" stroke="hsl(270, 80%, 55%)" strokeWidth={3.5} name="Conversão"
                            dot={{ r: 6, fill: "hsl(270, 80%, 55%)", stroke: "#fff", strokeWidth: 3 }}
                            activeDot={{ r: 9, fill: "hsl(270, 80%, 55%)", stroke: "#fff", strokeWidth: 3 }}
                            isAnimationActive animationDuration={1600} animationEasing="ease-in-out" animationBegin={200}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {mainTab === "videos" && product && (
                <VideosTab productId={product.id} productName={product.name} />
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

const VideosTab = ({ productId, productName }: { productId: number; productName: string }) => {
  const videos = useMemo(() => generateVideos(productId, productName), [productId, productName]);
  const totalSales = videos.reduce((s, v) => s + v.sales, 0);
  const totalViews = videos.reduce((s, v) => s + v.views, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Video className="w-5 h-5 text-tiktok-cyan mx-auto mb-1" />
          <p className="text-2xl font-black">{videos.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Criativos</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Eye className="w-5 h-5 text-tiktok-yellow mx-auto mb-1" />
          <p className="text-2xl font-black">{fmtCompact(totalViews)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Views Total</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <ShoppingCart className="w-5 h-5 text-tiktok-green mx-auto mb-1" />
          <p className="text-2xl font-black">{fmtCompact(totalSales)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vendas Total</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-4 h-4 text-tiktok-yellow" />
        <h3 className="text-sm font-bold">Criativos que Mais Venderam</h3>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-3">
        {videos.map((video) => (
          <div
            key={video.id}
            className="rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/50 transition-all cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[9/16] max-h-[280px] bg-muted overflow-hidden">
              <img
                src={video.thumbnail}
                alt={`Criativo ${video.rank}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <RankBadge rank={video.rank} />
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {video.duration}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-5 h-5 text-foreground ml-0.5" />
                </div>
              </div>
              {/* Style badge */}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                {video.style}
              </div>
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">{video.creator}</span>
                <span className="text-[10px] font-bold text-tiktok-green bg-tiktok-green/10 px-2 py-0.5 rounded-full">
                  {fmtCompact(video.sales)} vendas
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtCompact(video.views)}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{fmtCompact(video.likes)}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{fmtCompact(video.comments)}</span>
                <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{fmtCompact(video.shares)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
