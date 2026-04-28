import { INITIATIVES } from "@/lib/mock-data";
import { DashboardKpi, Initiative, RoleKey } from "@/lib/types";

function roleScopedInitiatives(role: RoleKey): Initiative[] {
  switch (role) {
    case "strategy_reviewer":
      return INITIATIVES.filter(
        (x) => x.status === "Submitted" || x.status === "Gatekeeper Review"
      );
    case "investment_committee":
      return INITIATIVES.filter(
        (x) => x.status === "Awaiting CXO Approval" || x.status === "Approved"
      );
    case "initiative_submitter":
    case "platform_admin":
    default:
      return INITIATIVES;
  }
}

export function listInitiatives(role: RoleKey, query?: string): Initiative[] {
  const base = roleScopedInitiatives(role);
  const q = (query || "").trim().toLowerCase();
  if (!q) return base;

  return base.filter((x) => {
    const haystack = [
      x.id,
      x.title,
      x.sponsor,
      x.domain,
      x.status,
      x.stage,
      x.markets.join(" ")
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function buildKpis(role: RoleKey, initiatives: Initiative[]): DashboardKpi[] {
  const avgShark = initiatives.filter((x) => typeof x.sharkScore === "number");
  const avgSharkScore =
    avgShark.length > 0
      ? Math.round(avgShark.reduce((sum, x) => sum + (x.sharkScore || 0), 0) / avgShark.length)
      : 0;

  const awaitingStrategy = initiatives.filter(
    (x) => x.status === "Submitted" || x.status === "Gatekeeper Review"
  ).length;
  const awaitingCxo = initiatives.filter((x) => x.status === "Awaiting CXO Approval").length;

  const roleCard =
    role === "strategy_reviewer"
      ? { label: "Awaiting strategy review", value: String(awaitingStrategy), delta: "Queue for scoring" }
      : role === "investment_committee"
        ? { label: "Awaiting CXO vote", value: String(awaitingCxo), delta: "Needs quorum decision" }
        : { label: "Active initiatives", value: String(initiatives.length), delta: "Live portfolio view" };

  return [
    roleCard,
    {
      label: "Approved initiatives",
      value: String(initiatives.filter((x) => x.status === "Approved").length),
      delta: "Capital released"
    },
    {
      label: "Avg shark score",
      value: avgSharkScore ? String(avgSharkScore) : "NA",
      delta: "Auto-computed from reviews"
    },
    {
      label: "Markets covered",
      value: String(new Set(initiatives.flatMap((x) => x.markets)).size),
      delta: "MENA footprint"
    }
  ];
}
