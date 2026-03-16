import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, Send, ThumbsUp, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["manager-stats", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("status");
      const tasks = data || [];
      return {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === "pending").length,
        submitted: tasks.filter((t) => t.status === "submitted").length,
        completed: tasks.filter((t) => t.status === "completed").length,
      };
    },
    enabled: !!user,
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id, title, status, deadline, created_at")
        .eq("status", "submitted")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
    enabled: !!user,
  });

  const statCards = [
    { label: "Total Tasks", value: stats?.total || 0, icon: CheckSquare, accent: "text-primary", bg: "bg-primary/10" },
    { label: "Pending", value: stats?.pending || 0, icon: Clock, accent: "text-warning", bg: "bg-warning/10" },
    { label: "Awaiting Review", value: stats?.submitted || 0, icon: Send, accent: "text-info", bg: "bg-info/10" },
    { label: "Completed", value: stats?.completed || 0, icon: ThumbsUp, accent: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Team Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stats?.submitted || 0} tasks awaiting your review
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} variants={cardVariant} initial="hidden" animate="visible" custom={i}>
            <Card className="card-shadow card-3d">
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.accent}`} />
                </div>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="card-shadow">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Pending Approvals</CardTitle>
            <button onClick={() => navigate("/tasks")} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent>
            {pendingApprovals && pendingApprovals.length > 0 ? (
              <div className="space-y-1">
                {pendingApprovals.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/tasks")}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                        Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <ThumbsUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All caught up — no pending approvals</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
