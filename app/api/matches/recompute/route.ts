import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { matchService } from "@/modules/matches/match.service";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const propertyId = typeof body.propertyId === "string" ? body.propertyId : undefined;
  const searchRequestId = typeof body.searchRequestId === "string" ? body.searchRequestId : undefined;

  try {
    if (propertyId) {
      await matchService.recomputeForProperty(user.agencyId, propertyId);
      return NextResponse.json({ success: true, scope: "property", propertyId });
    }

    if (searchRequestId) {
      await matchService.recomputeForSearchRequest(user.agencyId, searchRequestId);
      return NextResponse.json({ success: true, scope: "searchRequest", searchRequestId });
    }

    const result = await matchService.recomputeAll(user.agencyId);
    return NextResponse.json({ success: true, scope: "all", result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 400 },
    );
  }
}
