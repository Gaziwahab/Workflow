import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Mail, KeyRound, User, Sparkles, CheckCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AuthView = "login" | "signup" | "forgot";

export default function Auth() {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully");
        navigate("/dashboard");
      } else if (view === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to verify.");
      } else if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
        toast.success("Password reset link sent to your email");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -left-32 w-[300px] h-[300px] rounded-full bg-primary/6 blur-[100px]"
        />
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 p-2.5 rounded-xl bg-secondary/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all z-10 flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </motion.button>

      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2.5 rounded-xl bg-secondary/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all z-10"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2.5 mb-3"
          >
            <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-base">W</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">WorkSync</span>
          </motion.div>
          <p className="text-sm text-muted-foreground mt-1">
            {view === "login" && "Welcome back — sign in to continue"}
            {view === "signup" && "Create your account to get started"}
            {view === "forgot" && "We'll send you a reset link"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === "forgot" ? 20 : 0, y: view === "forgot" ? 0 : 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: view === "forgot" ? -20 : 0, y: view === "forgot" ? 0 : -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card-shadow-md border glass-card">
              {view !== "forgot" && (
                <CardHeader className="pb-4 pt-5 px-5">
                  <div className="flex gap-1 p-1 bg-secondary/80 rounded-xl">
                    <button
                      onClick={() => setView("login")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                        view === "login"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setView("signup")}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                        view === "signup"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </CardHeader>
              )}

              <CardContent className={view === "forgot" ? "p-6" : "px-5 pb-5"}>
                {view === "forgot" && resetSent ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setView("login"); setResetSent(false); }}
                    >
                      <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Sign In
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {view === "forgot" && (
                      <div className="text-center mb-2">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <Mail className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Forgot Password?</h3>
                        <p className="text-xs text-muted-foreground mt-1">Enter your email and we'll send a reset link</p>
                      </div>
                    )}

                    {view === "signup" && (
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your name"
                          required
                          className="h-11"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="h-11"
                      />
                    </div>

                    {view !== "forgot" && (
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5 text-muted-foreground" /> Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="h-11"
                        />
                      </div>
                    )}

                    {view === "login" && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setView("forgot")}
                          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 gradient-bg border-0 text-primary-foreground font-semibold hover:opacity-90 transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {view === "login" && "Sign In"}
                          {view === "signup" && "Create Account"}
                          {view === "forgot" && "Send Reset Link"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {view === "forgot" && (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setView("login")}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                        >
                          <ArrowLeft className="h-3 w-3" /> Back to Sign In
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
        >
          <Sparkles className="h-3 w-3" />
          Sequential workflow management for teams
        </motion.div>
      </motion.div>
    </div>
  );
}
