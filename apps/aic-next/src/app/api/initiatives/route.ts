import { NextRequest, NextResponse } from "next/server";
import { listInitiatives } from "@/lib/dashboard";
import { RoleKey } from "@/lib/types";
import { WORKSPACE_CONFIG } from "@/lib/workspace-config";

function isRole(role: string): role is RoleKey {
  return role in WORKSPACE_CONFIG;
}

export function GET(request: NextRequest) {
  const roleParam = request.nextUrl.searchParams.get("role") || "initiative_submitter";
  const query = request.nextUrl.searchParams.get("q") || "";
  if (!isRole(roleParam)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const data = listInitiatives(roleParam, query);
  return NextResponse.json({ items: data });
}
