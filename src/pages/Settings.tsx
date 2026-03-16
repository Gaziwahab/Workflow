import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { User, Shield, Palette, Moon, Sun, Monitor, Save, KeyRound } from "lucide-react";

export default function SettingsPage() {
  const { profile, user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile, security, and preferences</p>
        </motion.div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-14 w-14 rounded-2xl gradient-bg flex items-center justify-center text-primary-foreground text-xl font-bold shadow-md">
                  {profile?.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold">{profile?.full_name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary mt-0.5">
                    <Shield className="h-3 w-3" /> {role}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email || ""} disabled className="h-11 opacity-60" />
              </div>
              <Button onClick={handleSave} disabled={loading} size="sm" className="gradient-bg border-0 text-primary-foreground gap-1.5">
                <Save className="h-3.5 w-3.5" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-warning" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="h-11"
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={passwordLoading} variant="outline" size="sm" className="gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> Update Password
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-info" /> Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <button
                  onClick={() => theme !== "light" && toggleTheme()}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                  }`}
                >
                  <Sun className={`h-5 w-5 mx-auto mb-2 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-xs font-semibold">Light</p>
                </button>
                <button
                  onClick={() => theme !== "dark" && toggleTheme()}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                  }`}
                >
                  <Moon className={`h-5 w-5 mx-auto mb-2 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-xs font-semibold">Dark</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
