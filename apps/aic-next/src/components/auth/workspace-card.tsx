import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface WorkspaceCardProps {
  title: string;
  name: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  onClick?: () => void;
}

export function WorkspaceCard({
  title,
  name,
  description,
  icon: Icon,
  accent,
  onClick
}: WorkspaceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${title} workspace`}
      className="group flex min-h-11 w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 hover:-translate-y-px hover:border-slate-300 hover:shadow-sm"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} ring-1 ring-slate-200`}
      >
        <Icon className="h-4.5 w-4.5 text-slate-700" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</div>
        <div className="truncate text-[15px] font-semibold tracking-tight text-slate-900">{name}</div>
        <div className="mt-0.5 text-xs leading-5 text-slate-500">{description}</div>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
    </button>
  );
}
