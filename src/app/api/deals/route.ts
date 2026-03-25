import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createDealSchema } from "@/modules/deals/deal.schema";
import { dealService } from "@/modules/deals/deal.service";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const deals = await dealService.listDeals(user.agencyId, {
    search: searchParams.get("search") ?? undefined,
    stage: (searchParams.get("stage") as never) ?? undefined,
    status: (searchParams.get("status") as never) ?? undefined,
    type: (searchParams.get("type") as never) ?? undefined,
    priorityLevel: (searchParams.get("priorityLevel") as never) ?? undefined,
    assignedUserId: searchParams.get("assignedUserId") ?? undefined,
  });

  return NextResponse.json({ data: deals });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const parsed = createDealSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation échouée", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await dealService.createDeal({
    agencyId: user.agencyId,
    createdByUserId: user.id,
    input: parsed.data,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
