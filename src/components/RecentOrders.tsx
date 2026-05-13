import { memo } from "react";
import { MoreHorizontal, CheckCircle, Truck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  customer: string;
  product: string;
  value: string;
  commission: string;
  status: "delivered" | "shipped" | "pending";
}

const orders: Order[] = [
  {
    id: "#TS-8521",
    customer: "Maria Santos",
    product: "Fone Bluetooth TWS",
    value: "R$ 89,90",
    commission: "R$ 17,98",
    status: "delivered",
  },
  {
    id: "#TS-8520",
    customer: "Carlos Lima",
    product: "Ring Light 26cm",
    value: "R$ 129,90",
    commission: "R$ 25,98",
    status: "shipped",
  },
  {
    id: "#TS-8519",
    customer: "Ana Oliveira",
    product: "Smartwatch D20",
    value: "R$ 49,90",
    commission: "R$ 9,98",
    status: "pending",
  },
  {
    id: "#TS-8518",
    customer: "Pedro Costa",
    product: "Microfone Lapela",
    value: "R$ 39,90",
    commission: "R$ 7,98",
    status: "delivered",
  },
  {
    id: "#TS-8517",
    customer: "Julia Mendes",
    product: "LED Strip RGB 5m",
    value: "R$ 59,90",
    commission: "R$ 11,98",
    status: "shipped",
  },
];

const statusConfig = {
  delivered: {
    label: "Entregue",
    icon: CheckCircle,
    className: "text-tiktok-green",
  },
  shipped: {
    label: "Enviado",
    icon: Truck,
    className: "text-tiktok-cyan",
  },
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "text-tiktok-yellow",
  },
};

// Mobile Card View - memoized
const OrderCard = memo(({ order }: { order: Order }) => {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  
  return (
    <div className="p-4 border-b border-border/50 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium">{order.id}</p>
          <p className="text-sm text-muted-foreground">{order.customer}</p>
        </div>
        <div className={cn("flex items-center gap-1.5 text-sm", status.className)}>
          <StatusIcon className="w-4 h-4" />
          <span>{status.label}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{order.product}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm">{order.value}</span>
        <span className="text-sm text-tiktok-cyan font-medium">{order.commission}</span>
      </div>
    </div>
  );
});

OrderCard.displayName = "OrderCard";

// Table row - memoized
const OrderRow = memo(({ order }: { order: Order }) => {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-4 text-sm font-medium">{order.id}</td>
      <td className="py-4 text-sm">{order.customer}</td>
      <td className="py-4 text-sm text-muted-foreground">{order.product}</td>
      <td className="py-4 text-sm">{order.value}</td>
      <td className="py-4 text-sm text-tiktok-cyan font-medium">{order.commission}</td>
      <td className="py-4">
        <div className={cn("flex items-center gap-1.5 text-sm", status.className)}>
          <StatusIcon className="w-4 h-4" />
          <span>{status.label}</span>
        </div>
      </td>
      <td className="py-4">
        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});

OrderRow.displayName = "OrderRow";

interface RecentOrdersProps {
  isAdmin?: boolean;
}

export const RecentOrders = memo(({ isAdmin = false }: RecentOrdersProps) => {
  const displayOrders = isAdmin ? orders : [];

  return (
    <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-lg font-semibold">Pedidos Recentes</h3>
          <p className="text-sm text-muted-foreground">Últimas 24 horas</p>
        </div>
        <button className="text-sm text-primary hover:underline font-medium">
          Ver todos
        </button>
      </div>

      {displayOrders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum pedido recente</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">Pedido</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Produto</th>
                  <th className="pb-3 font-medium">Valor</th>
                  <th className="pb-3 font-medium">Comissão</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden -mx-4 -mb-4">
            {displayOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

RecentOrders.displayName = "RecentOrders";
