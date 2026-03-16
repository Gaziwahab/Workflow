import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Plus, GitBranch, Trash2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkflowsPage() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([{ name: "", description: "" }]);

  const { data: workflows } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const { data } = await supabase
        .from("workflows")
        .select("*, workflow_steps(*)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: wf, error } = await supabase
        .from("workflows")
        .insert({ name, description, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      const stepsToInsert = steps
        .filter((s) => s.name.trim())
        .map((s, i) => ({ workflow_id: wf.id, step_order: i + 1, name: s.name, description: s.description }));
      if (stepsToInsert.length > 0) {
        const { error: stepsError } = await supabase.from("workflow_steps").insert(stepsToInsert);
        if (stepsError) throw stepsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow created");
      setOpen(false);
      setName(""); setDescription(""); setSteps([{ name: "", description: "" }]);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workflows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow deleted");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
            <p className="text-sm text-muted-foreground mt-1">{workflows?.length || 0} workflows defined</p>
          </motion.div>
          {role === "admin" && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="gradient-bg border-0 text-primary-foreground gap-1.5">
                  <Plus className="h-4 w-4" /> New Workflow
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Create Workflow</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label>Workflow Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Code Review Pipeline" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the workflow..." />
                  </div>
                  <div className="space-y-3">
                    <Label>Steps</Label>
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {i + 1}
                        </div>
                        <Input
                          value={step.name}
                          onChange={(e) => {
                            const ns = [...steps]; ns[i].name = e.target.value; setSteps(ns);
                          }}
                          placeholder="Step name"
                          className="flex-1 h-9"
                        />
                        {steps.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setSteps(steps.filter((_, j) => j !== i))}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setSteps([...steps, { name: "", description: "" }])}>
                      <Plus className="h-3 w-3 mr-1" /> Add Step
                    </Button>
                  </div>
                  <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !name.trim()} className="w-full gradient-bg border-0 text-primary-foreground">
                    Create Workflow
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows?.map((wf, i) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-shadow card-3d">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <GitBranch className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-bold">{wf.name}</h3>
                    </div>
                    {role === "admin" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(wf.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {wf.description && <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{wf.description}</p>}
                  <div className="space-y-1.5 mb-3">
                    {(wf.workflow_steps as any[])
                      ?.sort((a: any, b: any) => a.step_order - b.step_order)
                      .map((step: any, si: number) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-primary" />
                            </div>
                            {si < (wf.workflow_steps as any[]).length - 1 && (
                              <div className="w-px h-3 bg-border" />
                            )}
                          </div>
                          <span className="text-xs font-medium">{step.name}</span>
                        </div>
                      ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    Created {new Date(wf.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {(!workflows || workflows.length === 0) && (
            <div className="col-span-full text-center py-16">
              <GitBranch className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No workflows created yet</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
