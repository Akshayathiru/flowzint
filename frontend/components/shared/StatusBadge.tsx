import { STATUS_COLORS } from "@/lib/constants";
import { ActivePool } from "@/types";

interface StatusBadgeProps {
  status: ActivePool["status"];
}

const BADGE_STYLES = {
  amber: "bg-amber-50 text-harvest-gold border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
  blue: "bg-blue-50 text-sky-blue border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
  green: "bg-green-50 text-field-green border-green-200/60 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50",
  gray: "bg-zinc-50 text-charcoal border-zinc-200/60 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800/50",
  rose: "bg-rose-50 text-alert-red border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50",
} as const;

const DOT_STYLES = {
  amber: "bg-harvest-gold",
  blue: "bg-sky-blue",
  green: "bg-field-green",
  gray: "bg-charcoal",
  rose: "bg-alert-red",
} as const;

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorName = STATUS_COLORS[status] || "gray";
  const badgeClass =
    BADGE_STYLES[colorName as keyof typeof BADGE_STYLES] || BADGE_STYLES.gray;
  const dotClass =
    DOT_STYLES[colorName as keyof typeof DOT_STYLES] || DOT_STYLES.gray;

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${dotClass}`} />
      {label}
    </span>
  );
}
