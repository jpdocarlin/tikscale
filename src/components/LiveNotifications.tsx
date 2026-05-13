import { useEffect, useState, useCallback, useRef, memo, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Flame, Star, Zap, DollarSign, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserEmail } from "@/hooks/useUserEmail";
import { useConfetti } from "@/hooks/useConfetti";
import { 
  hotProducts, 
  scalingProducts, 
  trendingProducts, 
  highCommissionProducts,
  allSaleProducts,
  getRandomProduct,
  type NotificationProduct 
} from "@/data/products";

interface Notification {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  type: "hot" | "scaling" | "trending" | "opportunity" | "sale";
  product?: NotificationProduct;
  onClick?: () => void;
}

interface LiveNotificationsProps {
  onSale?: (saleValue: number, commissionValue: number) => void;
}

// Memoized notification item with forwardRef to prevent React DOM errors
const NotificationItem = memo(
  forwardRef<HTMLDivElement, { notification: Notification }>(({ notification }, ref) => (
    <div
      ref={ref}
      onClick={notification.onClick}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md",
        "bg-card/95 border border-border/50",
        "animate-slide-in-notification min-w-[280px] max-w-[340px]",
        "pointer-events-auto cursor-pointer hover:scale-105 transition-transform",
        notification.type === "sale" && "ring-2 ring-tiktok-green/50"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br shrink-0",
          notification.color,
          notification.type === "sale" && "animate-pulse-glow"
        )}
      >
        {notification.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
    </div>
  ))
);

NotificationItem.displayName = "NotificationItem";

export const LiveNotifications = memo(({ onSale }: LiveNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const { isAdmin } = useUserEmail();
  const { fireSaleConfetti } = useConfetti();
  
  // Use refs to track timers for cleanup
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isUnmountedRef = useRef(false);

  const handleProductClick = useCallback((product: NotificationProduct) => {
    if (product.affiliateLink) {
      window.open(product.affiliateLink, "_blank");
    } else {
      navigate("/products");
    }
  }, [navigate]);

  const addNotification = useCallback((type: "general" | "sale") => {
    if (isUnmountedRef.current) return;
    
    let notification: Notification;

    if (type === "sale") {
      const product = getRandomProduct(allSaleProducts);
      notification = {
        id: Date.now(),
        icon: <Zap className="w-5 h-5" />,
        title: "Venda Realizada! 💰",
        description: `${product.name} - +R$ ${product.commission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        color: "from-purple-500 to-pink-500",
        type: "sale",
        product,
        onClick: () => handleProductClick(product),
      };

      // Fire confetti only once (simplified)
      fireSaleConfetti();

      if (onSale) {
        onSale(product.price, product.commission);
      }
    } else {
      const notificationType = Math.floor(Math.random() * 4);

      switch (notificationType) {
        case 0: {
          const product = getRandomProduct(hotProducts);
          notification = {
            id: Date.now(),
            icon: <Flame className="w-5 h-5" />,
            title: "Produto em Alta! 🔥",
            description: `${product.name} - R$ ${product.commission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de comissão`,
            color: "from-orange-500 to-red-500",
            type: "hot",
            product,
            onClick: () => handleProductClick(product),
          };
          break;
        }
        case 1: {
          const product = getRandomProduct(scalingProducts);
          notification = {
            id: Date.now(),
            icon: <TrendingUp className="w-5 h-5" />,
            title: "Escalando Agora! 📈",
            description: `${product.name} está subindo rápido`,
            color: "from-green-500 to-emerald-500",
            type: "scaling",
            product,
            onClick: () => handleProductClick(product),
          };
          break;
        }
        case 2: {
          const product = getRandomProduct(trendingProducts);
          notification = {
            id: Date.now(),
            icon: <Star className="w-5 h-5" />,
            title: "Tendência TikTok! ⭐",
            description: `${product.name} em alta no TikTok`,
            color: "from-yellow-500 to-amber-500",
            type: "trending",
            product,
            onClick: () => handleProductClick(product),
          };
          break;
        }
        default: {
          const product = getRandomProduct(highCommissionProducts);
          notification = {
            id: Date.now(),
            icon: <DollarSign className="w-5 h-5" />,
            title: "Oportunidade! 💎",
            description: `${product.name} - ${((product.commission / product.price) * 100).toFixed(0)}% de comissão`,
            color: "from-tiktok-cyan to-tiktok-green",
            type: "opportunity",
            product,
            onClick: () => handleProductClick(product),
          };
          break;
        }
      }
    }

    setNotifications((prev) => [...prev.slice(-2), notification]);

    // Remove notification after 5 seconds
    const removeTimer = setTimeout(() => {
      if (!isUnmountedRef.current) {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }
    }, 5000);
    
    timersRef.current.push(removeTimer);
  }, [handleProductClick, fireSaleConfetti, onSale]);

  useEffect(() => {
    isUnmountedRef.current = false;
    
    // Only show sale notifications for admin users
    let saleInterval: ReturnType<typeof setTimeout> | undefined;
    let initialSaleTimeout: ReturnType<typeof setTimeout> | undefined;
    
    if (isAdmin) {
      initialSaleTimeout = setTimeout(() => {
        addNotification("sale");
      }, 45000);
      timersRef.current.push(initialSaleTimeout);
      
      saleInterval = setInterval(() => {
        addNotification("sale");
      }, 300000);
    }

    return () => {
      isUnmountedRef.current = true;
      if (initialSaleTimeout) clearTimeout(initialSaleTimeout);
      if (saleInterval) clearInterval(saleInterval);
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, [isAdmin, addNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
});

LiveNotifications.displayName = "LiveNotifications";
