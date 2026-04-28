import { AppShell } from "@/components/shell/app-shell";
import { KpiCard } from "@/components/cards/kpi-card";
import { ScrollText, Settings2, ShieldCheck, Users } from "lucide-react";

export default function AdminPage() {
  return (
    <AppShell role="Platform_Admin" userName="Khalid Al-Mansouri">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Control Center</h1>
          <p className="page-subtitle">Govern users, permissions, audit logs, policy, and integrations.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Users" value="148" icon={<Users size={18} />} />
        <KpiCard label="Privileged roles" value="12" icon={<ShieldCheck size={18} />} />
        <KpiCard label="Audit events" value="24.8K" icon={<ScrollText size={18} />} />
        <KpiCard label="Policies" value="9" icon={<Settings2 size={18} />} />
      </div>
      <div className="mt-6 card p-5">
        <h2 className="text-lg font-semibold">Users & Access</h2>
        <p className="mt-1 text-sm text-slate-500">Split-view table/drawer pattern can be attached here next.</p>
      </div>
    </AppShell>
  );
}
