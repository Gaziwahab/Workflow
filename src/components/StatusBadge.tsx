import { cn } from "@/lib/utils";
import { Circle, Clock, Send, CheckCircle, XCircle, Trophy } from "lucide-react";

const statusConfig: Record<string, { style: string; icon: any; label: string }> = {
  pending: { style: "status-pending", icon: Circle, label: "Pending" },
  in_progress: { style: "status-in-progress", icon: Clock, label: "In Progress" },
  submitted: { style: "status-submitted", icon: Send, label: "Submitted" },
  approved: { style: "status-approved", icon: CheckCircle, label: "Approved" },
  rejected: { style: "status-rejected", icon: XCircle, label: "Rejected" },
  completed: { style: "status-completed", icon: Trophy, label: "Completed" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold",
        config.style
      )}
    >
      <IconComponent className="h-3 w-3" />
      {config.label}
    </span>
  );
}
