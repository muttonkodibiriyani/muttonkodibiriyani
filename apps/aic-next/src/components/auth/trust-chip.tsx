import type { LucideIcon } from "lucide-react";

interface TrustChipProps {
  icon: LucideIcon;
  label: string;
  tone?: "hero" | "panel";
}

export function TrustChip({ icon: Icon, label, tone = "hero" }: TrustChipProps) {
  const palette =
    tone === "panel"
      ? "border-slate-200 bg-white text-slate-600"
      : "border-white/10 bg-white/5 text-slate-200";
  const iconTone = tone === "panel" ? "text-blue-600" : "text-blue-300";
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs backdrop-blur ${palette}`}>
      <Icon className={`h-3.5 w-3.5 ${iconTone}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
