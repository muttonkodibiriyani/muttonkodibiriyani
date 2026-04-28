import { NextResponse } from "next/server";
import { buildKpis, listInitiatives } from "@/lib/dashboard";
import { RoleKey } from "@/lib/types";
import { WORKSPACE_CONFIG } from "@/lib/workspace-config";

function isRole(role: string): role is RoleKey {
  return role in WORKSPACE_CONFIG;
}

export function GET(_: Request, { params }: { params: { role: string } }) {
  if (!isRole(params.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const initiatives = listInitiatives(params.role);
  const kpis = buildKpis(params.role, initiatives);
  return NextResponse.json({
    role: params.role,
    config: WORKSPACE_CONFIG[params.role],
    kpis,
    count: initiatives.length
  });
}
