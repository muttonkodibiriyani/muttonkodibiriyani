import { Bell } from "lucide-react";

export function Topbar({ name, roleLabel }: { name: string; roleLabel: string }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-end gap-3 px-6">
        <div className="hidden rounded-xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 md:block">
          FY26 · Q2 Review Cycle
        </div>
        <button type="button" className="rounded-xl border p-2" aria-label="Open notifications">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border px-3 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm text-white">
            {name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-slate-500">{roleLabel}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
