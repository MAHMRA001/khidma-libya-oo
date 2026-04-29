import { BadgeCheck, Clock, XCircle } from "lucide-react";
import useLanguage from "../../hooks/useLanguage";

export default function VerificationBadge({ status, showLabel = true }) {
  const { t } = useLanguage();

  const config = {
    verified: {
      icon: BadgeCheck,
      label: t.verified,
      className: "text-primary bg-primary/10",
    },
    pending: {
      icon: Clock,
      label: t.pending,
      className: "text-yellow-600 bg-yellow-50",
    },
    rejected: {
      icon: XCircle,
      label: t.rejected,
      className: "text-destructive bg-destructive/10",
    },
  };

  const c = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.className}`}>
      <c.icon className="w-3.5 h-3.5" />
      {showLabel && c.label}
    </span>
  );
}