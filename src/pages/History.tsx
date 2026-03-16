import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { History, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const { data: history } = useQuery({
    queryKey: ["all-history"],
    queryFn: async () => {
      const { data: historyData } = await supabase
        .from("task_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!historyData || historyData.length === 0) return [];
      const taskIds = [...new Set(historyData.map((h) => h.task_id))];
      const { data: tasks } = await supabase.from("tasks").select("id, title").in("id", taskIds);
      const taskMap = Object.fromEntries((tasks || []).map((t) => [t.id, t]));
      const userIds = [...new Set(historyData.map((h) => h.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
      return historyData.map((h) => ({ ...h, task: taskMap[h.task_id] || null, profile: profileMap[h.user_id] || null }));
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Workflow History</h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable audit trail of all task changes</p>
        </motion.div>

        <div className="space-y-2">
          {history?.map((h: any, i: number) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="card-shadow hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <History className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{h.task?.title || "—"}</p>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{h.action.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {h.old_value && <StatusBadge status={h.old_value} />}
                      {h.old_value && h.new_value && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      {h.new_value && <StatusBadge status={h.new_value} />}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium">{h.profile?.full_name || h.profile?.email || "—"}</p>
                    <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
                      {new Date(h.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {(!history || history.length === 0) && (
            <div className="text-center py-16">
              <History className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No history records yet</p>
              <p className="text-xs text-muted-foreground mt-1">Changes will appear here as tasks progress</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
