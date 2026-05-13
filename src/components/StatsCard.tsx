import { memo } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { motion } from "framer-motion";

interface StatsCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  change: number;
  delay?: number;
  accentColor?: string;
}

export const StatsCard = memo(({ icon, iconBg, label, value, change, delay = 0, accentColor }: StatsCardProps) => {
  const isPositive = change >= 0;
  const animatedValue = useAnimatedCounter(value, 1500, delay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-card card-gradient-border inner-shine p-4 md:p-6 hover-glow group relative overflow-hidden",
      )}
    >
      {/* Ambient accent glow — stronger on hover */}
      {accentColor && (
        <>
          <div
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.07] blur-3xl transition-all duration-700 group-hover:opacity-[0.18] group-hover:scale-125"
            style={{ background: accentColor }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full opacity-[0.03] blur-2xl transition-all duration-700 group-hover:opacity-[0.08]"
            style={{ background: accentColor }}
          />
        </>
      )}

      <div className="relative z-[2]">
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm",
            iconBg
          )}>
            {icon}
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
            isPositive
              ? "text-tiktok-green bg-tiktok-green/10"
              : "text-tiktok-pink bg-tiktok-pink/10"
          )}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{isPositive ? "+" : ""}{change}%</span>
          </div>
        </div>
        <div className="mt-4 md:mt-5">
          <p className="text-muted-foreground text-[11px] md:text-xs uppercase tracking-wider font-medium">{label}</p>
          <p className="text-xl md:text-3xl font-extrabold mt-1.5 tabular-nums tracking-tight">{animatedValue}</p>
        </div>
      </div>
    </motion.div>
  );
});

StatsCard.displayName = "StatsCard";
