import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createInteractionSchema } from "@/modules/interactions/interaction.schema";
import { interactionService } from "@/modules/interactions/interaction.service";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  const interactions = await interactionService.listInteractions(user.agencyId, {
    search: searchParams.get("search") ?? undefined,
    interactionType: (searchParams.get("interactionType") as never) ?? undefined,
    contactId: searchParams.get("contactId") ?? undefined,
    propertyId: searchParams.get("propertyId") ?? undefined,
    searchRequestId: searchParams.get("searchRequestId") ?? undefined,
    dealId: searchParams.get("dealId") ?? undefined,
    authorUserId: searchParams.get("authorUserId") ?? undefined,
  });

  return NextResponse.json({ data: interactions });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const parsed = createInteractionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await interactionService.createInteraction({
    agencyId: user.agencyId,
    authorUserId: user.id,
    input: parsed.data,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
