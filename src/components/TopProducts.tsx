import { memo } from "react";
import amandaProfile from "@/assets/amanda-doshop-profile.jpeg";

export const TopProducts = memo(() => {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex flex-col items-center text-center">
        {/* Profile Photo */}
        <div className="relative mb-4">
          <img 
            src={amandaProfile} 
            alt="amanda_doshop" 
            className="w-28 h-28 rounded-full object-cover object-top"
            loading="lazy"
          />
        </div>

        {/* Username */}
        <h3 className="text-xl font-bold flex items-center gap-1">
          @amanda_doshop
        </h3>
        <p className="text-sm text-muted-foreground mb-4">TikTok Shop • Creator</p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">6.235</p>
            <p className="text-xs text-muted-foreground">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">155</p>
            <p className="text-xs text-muted-foreground">Seguindo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">45K</p>
            <p className="text-xs text-muted-foreground">Curtidas</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full" />

        {/* Engagement Stats */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border w-full" />
      </div>
    </div>
  );
});

TopProducts.displayName = "TopProducts";