import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const typeIcons: Record<string, any> = {
  task_assigned: Send,
  task_submitted: Info,
  task_approved: CheckCircle,
  task_rejected: XCircle,
  task_completed: CheckCircle,
};

const typeColors: Record<string, string> = {
  task_assigned: "text-info bg-info/10",
  task_submitted: "text-warning bg-warning/10",
  task_approved: "text-success bg-success/10",
  task_rejected: "text-destructive bg-destructive/10",
  task_completed: "text-success bg-success/10",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user!.id).eq("is_read", false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </motion.div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()} className="gap-1.5">
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {notifications?.map((n, i) => {
              const IconComponent = typeIcons[n.type] || Bell;
              const colorClass = typeColors[n.type] || "text-muted-foreground bg-muted";
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={`card-shadow cursor-pointer transition-all duration-200 hover:shadow-md ${
                      !n.is_read ? "border-primary/20 bg-primary/[0.03]" : ""
                    }`}
                    onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                          {!n.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground font-mono tabular-nums mt-1.5">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {(!notifications || notifications.length === 0) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">You'll see updates when tasks change</p>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
