import { notFound } from "next/navigation";
import { buildKpis, listInitiatives } from "@/lib/dashboard";
import { RoleKey } from "@/lib/types";
import { WORKSPACE_CONFIG } from "@/lib/workspace-config";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { InitiativeTable } from "@/components/dashboard/initiative-table";

type PageProps = {
  params: { role: string };
  searchParams: { q?: string };
};

function isRole(role: string): role is RoleKey {
  return role in WORKSPACE_CONFIG;
}

export default function WorkspacePage({ params, searchParams }: PageProps) {
  if (!isRole(params.role)) notFound();
  const config = WORKSPACE_CONFIG[params.role];
  const query = searchParams.q ?? "";
  const initiatives = listInitiatives(config.role, query);
  const kpis = buildKpis(config.role, initiatives);

  return (
    <WorkspaceShell role={config.role} title={config.title} subtitle={config.subtitle} query={query}>
      <div className="space-y-4">
        <KpiStrip kpis={kpis} />
        <InitiativeTable initiatives={initiatives} emptyMessage={config.emptyMessage} />
      </div>
    </WorkspaceShell>
  );
}
