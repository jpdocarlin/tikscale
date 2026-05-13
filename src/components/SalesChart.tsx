import { useState, useMemo, memo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

// Dados para cada período - vendas e comissão (~17% das vendas)
const chartDataByPeriod = {
  "Hoje": {
    title: "Vendas de Hoje",
    subtitle: "Por hora",
    goal: 5000,
    data: [
      { label: "8h", vendas: 320, comissao: 54, anterior: 280 },
      { label: "10h", vendas: 580, comissao: 99, anterior: 510 },
      { label: "12h", vendas: 890, comissao: 151, anterior: 750 },
      { label: "14h", vendas: 1120, comissao: 190, anterior: 980 },
      { label: "16h", vendas: 780, comissao: 133, anterior: 820 },
      { label: "18h", vendas: 650, comissao: 111, anterior: 600 },
      { label: "20h", vendas: 636, comissao: 108, anterior: 550 },
    ],
  },
  "7 dias": {
    title: "Vendas da Semana",
    subtitle: "Últimos 7 dias",
    goal: 30000,
    data: [
      { label: "Seg", vendas: 3200, comissao: 544, anterior: 2800 },
      { label: "Ter", vendas: 3850, comissao: 655, anterior: 3400 },
      { label: "Qua", vendas: 4100, comissao: 697, anterior: 3700 },
      { label: "Qui", vendas: 4520, comissao: 768, anterior: 4100 },
      { label: "Sex", vendas: 5200, comissao: 884, anterior: 4600 },
      { label: "Sáb", vendas: 4350, comissao: 740, anterior: 3900 },
      { label: "Dom", vendas: 3230, comissao: 549, anterior: 3000 },
    ],
  },
  "30 dias": {
    title: "Vendas do Mês",
    subtitle: "Últimos 30 dias",
    goal: 100000,
    data: [
      { label: "Sem 1", vendas: 21500, comissao: 3655, anterior: 18500 },
      { label: "Sem 2", vendas: 24800, comissao: 4216, anterior: 21200 },
      { label: "Sem 3", vendas: 26200, comissao: 4454, anterior: 23800 },
      { label: "Sem 4", vendas: 26260, comissao: 4464, anterior: 24000 },
    ],
  },
  "90 dias": {
    title: "Vendas do Trimestre",
    subtitle: "Últimos 90 dias",
    goal: 300000,
    data: [
      { label: "Mês 1", vendas: 78400, comissao: 13328, anterior: 65000 },
      { label: "Mês 2", vendas: 95600, comissao: 16252, anterior: 78000 },
      { label: "Mês 3", vendas: 113340, comissao: 19268, anterior: 92000 },
    ],
  },
};

const emptyData = [
  { label: "1", vendas: 0, comissao: 0, anterior: 0 },
  { label: "2", vendas: 0, comissao: 0, anterior: 0 },
  { label: "3", vendas: 0, comissao: 0, anterior: 0 },
  { label: "4", vendas: 0, comissao: 0, anterior: 0 },
  { label: "5", vendas: 0, comissao: 0, anterior: 0 },
  { label: "6", vendas: 0, comissao: 0, anterior: 0 },
  { label: "7", vendas: 0, comissao: 0, anterior: 0 },
];

interface SalesChartProps {
  isAdmin?: boolean;
  activeFilter?: string;
}

// Premium tooltip
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const vendas = payload.find((p: any) => p.dataKey === "vendas")?.value || 0;
    const anterior = payload.find((p: any) => p.dataKey === "anterior")?.value || 0;
    const diff = anterior > 0 ? ((vendas - anterior) / anterior * 100).toFixed(1) : "0";
    const isPositive = Number(diff) >= 0;

    return (
      <div className="glass-card p-4 border border-border min-w-[180px]">
        <p className="text-sm font-semibold mb-3 text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">R$ {entry.value.toLocaleString()}</span>
          </div>
        ))}
        {anterior > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive ? "text-tiktok-green" : "text-tiktok-pink"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{isPositive ? "+" : ""}{diff}% vs período anterior</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = "CustomTooltip";

export const SalesChart = memo(({ isAdmin = false, activeFilter = "Hoje" }: SalesChartProps) => {
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [showPrevious, setShowPrevious] = useState(true);
  
  const periodData = chartDataByPeriod[activeFilter as keyof typeof chartDataByPeriod] || chartDataByPeriod["Hoje"];
  const data = isAdmin ? periodData.data : emptyData;

  // Memoize expensive calculations
  const { formatYAxis } = useMemo(() => {
    const max = Math.max(...data.map(d => d.vendas));
    const formatter = (v: number) => {
      if (max >= 10000) return `R$${(v/1000).toFixed(0)}k`;
      return `R$${v}`;
    };
    return { maxValue: max, formatYAxis: formatter };
  }, [data]);

  const totalVendas = useMemo(() => data.reduce((s, d) => s + d.vendas, 0), [data]);
  const totalAnterior = useMemo(() => data.reduce((s, d) => s + (d.anterior || 0), 0), [data]);
  const growthPct = totalAnterior > 0 ? ((totalVendas - totalAnterior) / totalAnterior * 100).toFixed(1) : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card card-gradient-border inner-shine relative overflow-hidden p-5 md:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{periodData.title}</h3>
            {isAdmin && Number(growthPct) !== 0 && (
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                Number(growthPct) >= 0 ? "bg-tiktok-green/10 text-tiktok-green" : "bg-tiktok-pink/10 text-tiktok-pink"
              )}>
                {Number(growthPct) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Number(growthPct) >= 0 ? "+" : ""}{growthPct}%
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{periodData.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPrevious(!showPrevious)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium transition-all border",
              showPrevious
                ? "bg-muted/80 text-foreground border-border"
                : "bg-transparent text-muted-foreground border-transparent hover:border-border"
            )}
          >
            Anterior
          </button>
          <button
            onClick={() => setChartType("area")}
            className={cn(
              "px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all",
              chartType === "area" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            Área
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={cn(
              "px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all",
              chartType === "bar" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            Barras
          </button>
        </div>
      </div>

      <div className="h-[250px] md:h-[300px] -ml-4 md:ml-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(172, 91%, 55%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(172, 91%, 55%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorComissao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(348, 99%, 58%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(348, 99%, 58%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 12% 16% / 0.6)" />
              <XAxis dataKey="label" stroke="hsl(0 0% 40%)" fontSize={12} tickMargin={8} />
              <YAxis stroke="hsl(0 0% 40%)" fontSize={10} tickFormatter={formatYAxis} width={55} />
              <Tooltip content={<CustomTooltip />} />
              {isAdmin && (
                <ReferenceLine
                  y={periodData.goal}
                  stroke="hsl(45, 93%, 58%)"
                  strokeDasharray="6 4"
                  strokeOpacity={0.5}
                  label={{ value: "Meta", position: "insideTopRight", fill: "hsl(45, 93%, 58%)", fontSize: 10 }}
                />
              )}
              {showPrevious && (
                <Area
                  type="monotone"
                  dataKey="anterior"
                  stroke="hsl(0 0% 40%)"
                  fillOpacity={0}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  name="Anterior"
                  isAnimationActive={false}
                />
              )}
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="hsl(172, 91%, 55%)"
                fillOpacity={1}
                fill="url(#colorVendas)"
                strokeWidth={2}
                name="Vendas"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="comissao"
                stroke="hsl(348, 99%, 58%)"
                fillOpacity={1}
                fill="url(#colorComissao)"
                strokeWidth={2}
                name="Comissão"
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 12% 16% / 0.6)" />
              <XAxis dataKey="label" stroke="hsl(0 0% 40%)" fontSize={12} tickMargin={8} />
              <YAxis stroke="hsl(0 0% 40%)" fontSize={10} tickFormatter={formatYAxis} width={55} />
              <Tooltip content={<CustomTooltip />} />
              {isAdmin && (
                <ReferenceLine
                  y={periodData.goal}
                  stroke="hsl(45, 93%, 58%)"
                  strokeDasharray="6 4"
                  strokeOpacity={0.5}
                />
              )}
              {showPrevious && (
                <Bar dataKey="anterior" fill="hsl(0 0% 25%)" radius={[4, 4, 0, 0]} name="Anterior" isAnimationActive={false} />
              )}
              <Bar dataKey="vendas" fill="hsl(172, 91%, 55%)" radius={[4, 4, 0, 0]} name="Vendas" isAnimationActive={false} />
              <Bar dataKey="comissao" fill="hsl(348, 99%, 58%)" radius={[4, 4, 0, 0]} name="Comissão" isAnimationActive={false} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-tiktok-cyan" />
          <span className="text-sm text-muted-foreground">Vendas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-tiktok-pink" />
          <span className="text-sm text-muted-foreground">Comissão</span>
        </div>
        {showPrevious && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-muted-foreground" />
            <span className="text-sm text-muted-foreground">Anterior</span>
          </div>
        )}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-tiktok-yellow" />
            <span className="text-sm text-muted-foreground">Meta</span>
          </div>
        )}
      </div>
    </motion.div>
  );
});

SalesChart.displayName = "SalesChart";
