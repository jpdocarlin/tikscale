import { cn } from "@/lib/utils";

const filters = ["Hoje", "7 dias", "30 dias", "90 dias"];

interface TimeFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const TimeFilter = ({ activeFilter, onFilterChange }: TimeFilterProps) => {
  return (
    <div className="flex items-center gap-1.5 mb-6 p-1 rounded-2xl bg-muted/30 w-fit">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 whitespace-nowrap",
            activeFilter === filter
              ? "bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-background shadow-lg shadow-tiktok-cyan/15"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};
