import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, GitBranch, Users, Clock, TrendingUp, Activity } from "lucide-react";
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

export function AdminDashboard() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [tasks, workflows, users] = await Promise.all([
        supabase.from("tasks").select("status"),
        supabase.from("workflows").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const taskData = tasks.data || [];
      const completed = taskData.filter((t) => t.status === "completed").length;
      return {
        totalTasks: taskData.length,
        pending: taskData.filter((t) => t.status === "pending").length,
        inProgress: taskData.filter((t) => t.status === "in_progress").length,
        completed,
        submitted: taskData.filter((t) => t.status === "submitted").length,
        totalWorkflows: workflows.count || 0,
        totalUsers: users.count || 0,
        rate: taskData.length > 0 ? Math.round((completed / taskData.length) * 100) : 0,
      };
    },
  });

  const { data: recentTasks } = useQuery({
    queryKey: ["admin-recent-tasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id, title, status, deadline, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const statCards = [
    { label: "Total Tasks", value: stats?.totalTasks || 0, icon: CheckSquare, accent: "text-primary", bg: "bg-primary/10" },
    { label: "Workflows", value: stats?.totalWorkflows || 0, icon: GitBranch, accent: "text-info", bg: "bg-info/10" },
    { label: "Team Members", value: stats?.totalUsers || 0, icon: Users, accent: "text-success", bg: "bg-success/10" },
    { label: "Pending Review", value: stats?.submitted || 0, icon: Clock, accent: "text-warning", bg: "bg-warning/10" },
    { label: "Completion Rate", value: `${stats?.rate || 0}%`, icon: TrendingUp, accent: "text-success", bg: "bg-success/10" },
    { label: "Active Now", value: (stats?.inProgress || 0) + (stats?.submitted || 0), icon: Activity, accent: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stats?.pending || 0} pending · {stats?.inProgress || 0} in progress · {stats?.completed || 0} completed
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} variants={cardVariant} initial="hidden" animate="visible" custom={i}>
            <Card className="card-shadow card-3d h-full">
              <CardContent className="p-4">
                <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-4 w-4 ${stat.accent}`} />
                </div>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="card-shadow">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Tasks</CardTitle>
              <button onClick={() => navigate("/tasks")} className="text-xs text-primary hover:underline font-medium">View all →</button>
            </CardHeader>
            <CardContent>
              {recentTasks && recentTasks.length > 0 ? (
                <div className="space-y-1">
                  {recentTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate("/tasks")}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                          {new Date(task.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="card-shadow">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Manage Users", desc: "Add, edit roles, manage team", route: "/users", icon: Users },
                { label: "Create Workflow", desc: "Define new sequential process", route: "/workflows", icon: GitBranch },
                { label: "View Reports", desc: "Analytics & performance data", route: "/reports", icon: TrendingUp },
                { label: "Task History", desc: "Full audit trail of changes", route: "/history", icon: Activity },
              ].map((action, i) => (
                <motion.button
                  key={action.route}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  onClick={() => navigate(action.route)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all text-left group"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors shrink-0">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                  </div>
                </motion.button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
