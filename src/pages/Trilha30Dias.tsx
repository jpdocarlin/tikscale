import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle2, Circle, Target, TrendingUp, ListChecks } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface OnboardingTask {
  id: string;
  week: number;
  order: number;
  title: string;
  description: string;
  badge_label: string;
  badge_type: string;
}

interface UserProgress {
  id: string;
  task_id: string;
  completed_at: string;
}

const WEEK_TITLES: Record<number, string> = {
  1: "Semana 1 — entender o terreno",
  2: "Semana 2 — criar e publicar",
  3: "Semana 3 — analisar e ajustar",
  4: "Semana 4 — escalar",
};

const BADGE_COLORS: Record<string, string> = {
  tool: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  meta: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  win: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function Trilha30Dias() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const completedIds = new Set(progress.map((p) => p.task_id));
  const completedCount = completedIds.size;
  const totalCount = tasks.length || 14;
  const percent = Math.round((completedCount / totalCount) * 100);

  const { user, isLoading: authLoading } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [tasksRes, progressRes] = await Promise.all([
        supabase.from("onboarding_tasks").select("*").order("week").order("order"),
        supabase.from("user_progress").select("*").eq("user_id", user.id),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      if (progressRes.data) setProgress(progressRes.data);
    } catch {
      // fail-open
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [fetchData, authLoading]);

  const toggleTask = async (taskId: string) => {
    if (toggling) return;
    setToggling(taskId);

    try {
      if (!user) return;

      const existing = progress.find((p) => p.task_id === taskId);

      if (existing) {
        const { error } = await supabase.from("user_progress").delete().eq("id", existing.id);
        if (error) throw error;
        setProgress((prev) => prev.filter((p) => p.id !== existing.id));
      } else {
        const { data, error } = await supabase
          .from("user_progress")
          .insert({ user_id: user.id, task_id: taskId })
          .select()
          .single();
        if (error) throw error;
        if (data) setProgress((prev) => [...prev, data]);
      }
    } catch {
      toast({ title: "Não foi possível salvar. Tente novamente.", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const grouped = tasks.reduce<Record<number, OnboardingTask[]>>((acc, t) => {
    (acc[t.week] ||= []).push(t);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando trilha...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Trilha 30 Dias</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {completedCount} de {totalCount} tarefas concluídas
        </p>
      </div>

      {/* Progress bar */}
      <Progress value={percent} className="h-3" />

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
          <ListChecks className="w-5 h-5 mx-auto text-green-400" />
          <p className="text-2xl font-bold text-foreground">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Tarefas feitas</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
          <TrendingUp className="w-5 h-5 mx-auto text-primary" />
          <p className="text-2xl font-bold text-foreground">{percent}%</p>
          <p className="text-xs text-muted-foreground">Completo</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
          <Target className="w-5 h-5 mx-auto text-yellow-400" />
          <p className="text-2xl font-bold text-foreground">{totalCount - completedCount}</p>
          <p className="text-xs text-muted-foreground">Restantes</p>
        </div>
      </div>

      {/* Weeks */}
      {[1, 2, 3, 4].map((week) => (
        <div key={week} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {WEEK_TITLES[week]}
          </h2>
          <div className="space-y-2">
            {(grouped[week] || []).map((task) => {
              const done = completedIds.has(task.id);
              const isToggling = toggling === task.id;

              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  disabled={isToggling}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    done
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-card border-border hover:bg-muted/50"
                  }`}
                >
                  {/* Check circle */}
                  <div className="pt-0.5 flex-shrink-0">
                    {isToggling ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : done ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${BADGE_COLORS[task.badge_type] || BADGE_COLORS.tool}`}>
                        {task.badge_label}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${done ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                      {task.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
