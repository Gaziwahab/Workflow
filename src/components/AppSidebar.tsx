import {
  LayoutDashboard,
  GitBranch,
  CheckSquare,
  Users,
  Bell,
  FileText,
  BarChart3,
  History,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Users", url: "/users", icon: Users },
  { title: "Workflows", url: "/workflows", icon: GitBranch },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "History", url: "/history", icon: History },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

const managerItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Workflows", url: "/workflows", icon: GitBranch },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "History", url: "/history", icon: History },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const employeeItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role, profile, signOut } = useAuth();

  const items =
    role === "admin" ? adminItems : role === "manager" ? managerItems : employeeItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-2.5 px-3 py-4">
            <div className="h-8 w-8 rounded-xl gradient-bg flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-primary-foreground font-bold text-xs">W</span>
            </div>
            {!collapsed && (
              <span className="text-sm font-bold tracking-tight text-foreground">
                WorkSync
              </span>
            )}
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="label-text px-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, i) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-accent/50 rounded-lg transition-all duration-200"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-3 border-t border-border">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {profile?.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.full_name || profile?.email}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {role}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full py-1.5 rounded-lg hover:bg-destructive/5 px-2"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
