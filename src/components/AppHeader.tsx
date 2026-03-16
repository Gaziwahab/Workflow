import { Moon, Sun, Bell, Search } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "User Management",
  "/workflows": "Workflows",
  "/tasks": "Tasks",
  "/reports": "Reports",
  "/history": "History",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/documents": "Documents",
};

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const location = useLocation();

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const currentRoute = routeNames[location.pathname] || "WorkSync";

  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <nav className="flex items-center gap-1.5 text-sm">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-semibold text-foreground">{currentRoute}</span>
        </nav>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Bell className="h-4 w-4" />
          {unreadCount && unreadCount > 0 ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center min-w-[18px] h-[18px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          ) : null}
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="ml-2 h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-xs font-bold">
          {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
