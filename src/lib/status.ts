export type DecisionStatus = "pending" | "overdue" | "resolved";

export function computeStatus(deadlineDate: Date | null, status: string): DecisionStatus {
  if (status === "resolved") return "resolved";
  if (!deadlineDate) return "pending";

  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const dl = new Date(deadlineDate);
  dl.setHours(23, 59, 59, 999);

  if (dl.getTime() < now.getTime()) return "overdue";
  return "pending";
}

export function formatDate(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function daysUntil(d: Date | null): number | null {
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dl = new Date(d);
  dl.setHours(0, 0, 0, 0);
  return Math.round((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const STATUS_META: Record<
  DecisionStatus,
  { label: string; dot: string; badge: string; ring: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    ring: "border-l-amber-400",
  },
  overdue: {
    label: "Overdue",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    ring: "border-l-rose-500",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ring: "border-l-emerald-500",
  },
};
