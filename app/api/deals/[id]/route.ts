import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateDealSchema } from "@/modules/deals/deal.schema";
import { dealService } from "@/modules/deals/deal.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await context.params;
  const deal = await dealService.getDealById(user.agencyId, id);
  if (!deal) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });

  return NextResponse.json({ data: deal });
}

export async function PATCH(request: NextRequest, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateDealSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation échouée", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await dealService.updateDeal({
      agencyId: user.agencyId,
      dealId: id,
      updatedByUserId: user.id,
      input: parsed.data,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 400 },
    );
  }
}
