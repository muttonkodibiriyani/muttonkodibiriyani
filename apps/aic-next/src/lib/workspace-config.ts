import { RoleKey, WorkspaceConfig } from "@/lib/types";

export const WORKSPACE_CONFIG: Record<RoleKey, WorkspaceConfig> = {
  initiative_submitter: {
    role: "initiative_submitter",
    title: "Initiator Workspace",
    subtitle: "Create, track, and close initiatives with full transparency.",
    emptyMessage: "No initiatives found for your current filters."
  },
  strategy_reviewer: {
    role: "strategy_reviewer",
    title: "Strategy Review Workspace",
    subtitle: "Prioritize queue, validate business case quality, and score confidently.",
    emptyMessage: "No initiatives pending strategy review."
  },
  investment_committee: {
    role: "investment_committee",
    title: "CXO Council Workspace",
    subtitle: "Review shark and council evidence before final investment decisions.",
    emptyMessage: "No initiatives are waiting for CXO vote."
  },
  platform_admin: {
    role: "platform_admin",
    title: "Platform Admin Workspace",
    subtitle: "Oversee governance throughput and policy adherence.",
    emptyMessage: "No initiatives available."
  }
};

export const WORKSPACE_ORDER: RoleKey[] = [
  "initiative_submitter",
  "strategy_reviewer",
  "investment_committee",
  "platform_admin"
];
