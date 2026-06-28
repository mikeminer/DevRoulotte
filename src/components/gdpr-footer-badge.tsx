import Link from "next/link";
import { ShieldCheck } from "lucide-react";

type GdprFooterBadgeProps = {
  className?: string;
};

export function GdprFooterBadge({ className = "" }: GdprFooterBadgeProps) {
  return (
    <Link
      href="/privacy"
      aria-label="GDPR OK: privacy e consenso cookie configurati. Non e' una certificazione legale esterna."
      title="Privacy e consenso cookie configurati. Non e' una certificazione legale esterna."
      className={`inline-flex items-center gap-1.5 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 font-bold text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/15 hover:text-white ${className}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span className="tracking-normal">GDPR OK</span>
    </Link>
  );
}
