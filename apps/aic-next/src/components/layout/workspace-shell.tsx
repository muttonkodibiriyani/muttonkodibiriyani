import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { RoleKey } from "@/lib/types";
import { WORKSPACE_ORDER } from "@/lib/workspace-config";

interface WorkspaceShellProps {
  role: RoleKey;
  title: string;
  subtitle: string;
  query: string;
  children: ReactNode;
}

const LABELS: Record<RoleKey, string> = {
  initiative_submitter: "Initiator",
  strategy_reviewer: "Strategy Reviewer",
  investment_committee: "CXO Council",
  platform_admin: "Platform Admin"
};

export function WorkspaceShell({ role, title, subtitle, query, children }: WorkspaceShellProps) {
  return (
    <main className="min-h-screen bg-aic-bg p-6 md:p-8">
      <header className="mb-5 rounded-2xl border border-aic-border bg-aic-surface p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          {WORKSPACE_ORDER.map((key) => (
            <Link
              key={key}
              href={`/workspace/${key}`}
              className={`rounded-full border px-3 py-1 ${
                key === role
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-aic-border bg-white text-aic-muted"
              }`}
            >
              {LABELS[key]}
            </Link>
          ))}
        </div>
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-aic-muted">Dynamic role workspace</p>
            <h1 className="mt-1 text-2xl font-semibold text-aic-text">{title}</h1>
            <p className="mt-1 text-sm text-aic-muted">{subtitle}</p>
          </div>
          <form className="mt-4 flex items-center gap-2 rounded-xl border border-aic-border bg-white px-3 py-2 md:mt-0 md:w-[360px]">
            <Search className="h-4 w-4 text-aic-muted" />
            <input
              name="q"
              defaultValue={query}
              className="w-full border-none bg-transparent text-sm outline-none"
              placeholder="Search initiatives, sponsors, domains..."
            />
            <button className="rounded-md border border-aic-border px-2 py-1 text-xs">Go</button>
          </form>
        </div>
      </header>
      {children}
    </main>
  );
}
