import type { ReactNode } from "react";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { Topbar } from "@/components/shell/topbar";
import { UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  Initiative_Submitter: "Initiative Submitter",
  Strategy_Reviewer: "Strategy Reviewer",
  Investment_Committee: "Investment Committee",
  Platform_Admin: "Platform Admin"
};

export function AppShell({
  role,
  userName,
  children
}: {
  role: UserRole;
  userName: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={userName} roleLabel={ROLE_LABEL[role]} />
        <main className="page-wrap">{children}</main>
      </div>
    </div>
  );
}
