import { STATUS_COLORS } from "@/lib/constants";
import { ActivePool } from "@/types";

interface StatusBadgeProps {
  status: ActivePool["status"];
}

const BADGE_STYLES = {
  blue: "bg-sky-blue/10 text-sky-blue border-sky-blue/20",
  gold: "bg-harvest-gold/10 text-harvest-gold border-harvest-gold/20",
  green: "bg-field-green/10 text-field-green border-field-green/20",
  gray: "bg-gray-100 text-gray-500 border-gray-200",
} as const;

const DOT_STYLES = {
  blue: "bg-sky-blue",
  gold: "bg-harvest-gold",
  green: "bg-field-green",
  gray: "bg-gray-400",
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 ${badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${dotClass}`} />
      {label}
    </span>
  );
}
