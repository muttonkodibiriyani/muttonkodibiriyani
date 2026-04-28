import Link from "next/link";
import type { ReactNode } from "react";
import { RoleKey } from "@/lib/types";
import { WORKSPACE_ORDER } from "@/lib/workspace-config";

interface WorkspaceShellProps {
  role: RoleKey;
  title: string;
  subtitle: string;
  children: ReactNode;
}

const LABELS: Record<RoleKey, string> = {
  initiative_submitter: "Initiator",
  strategy_reviewer: "Strategy Reviewer",
  investment_committee: "CXO Council",
  platform_admin: "Platform Admin"
};

export function WorkspaceShell({ role, title, subtitle, children }: WorkspaceShellProps) {
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
        <div>
          <div>
            <p className="text-xs uppercase tracking-wider text-aic-muted">Dynamic role workspace</p>
            <h1 className="mt-1 text-2xl font-semibold text-aic-text">{title}</h1>
            <p className="mt-1 text-sm text-aic-muted">{subtitle}</p>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
