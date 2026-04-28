export type RoleKey =
  | "initiative_submitter"
  | "strategy_reviewer"
  | "investment_committee"
  | "platform_admin";

export type InitiativeStatus =
  | "Draft"
  | "Submitted"
  | "Gatekeeper Review"
  | "Awaiting CXO Approval"
  | "Approved"
  | "Rejected"
  | "Closed";

export interface Initiative {
  id: string;
  title: string;
  sponsor: string;
  domain: string;
  markets: string[];
  status: InitiativeStatus;
  stage: string;
  gatekeeperScore: number | null;
  sharkScore: number | null;
  cxoAverageScore: number | null;
  updatedAt: string;
}

export interface DashboardKpi {
  label: string;
  value: string;
  delta: string;
}

export interface WorkspaceConfig {
  role: RoleKey;
  title: string;
  subtitle: string;
  emptyMessage: string;
}
