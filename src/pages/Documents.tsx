import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, File, Image, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const getFileIcon = (type: string | null) => {
  if (!type) return File;
  if (type.includes("image")) return Image;
  if (type.includes("spreadsheet") || type.includes("excel")) return FileSpreadsheet;
  if (type.includes("pdf")) return FileText;
  return File;
};

const formatSize = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DocumentsPage() {
  const { user } = useAuth();

  const { data: documents } = useQuery({
    queryKey: ["my-documents", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("task_documents")
        .select("*, tasks(title)")
        .eq("uploaded_by", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handleDownload = async (doc: any) => {
    const { data } = await supabase.storage.from("task-documents").createSignedUrl(doc.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Failed to generate download link");
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">{documents?.length || 0} files uploaded</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents?.map((doc: any, i: number) => {
            const IconComponent = getFileIcon(doc.file_type);
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className="card-shadow card-3d cursor-pointer group"
                  onClick={() => handleDownload(doc)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          Task: {doc.tasks?.title || "—"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-muted-foreground font-mono">{formatSize(doc.file_size)}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        {(!documents || documents.length === 0) && (
          <div className="text-center py-16">
            <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload files through your task details</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
