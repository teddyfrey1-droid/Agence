import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateInteractionSchema } from "@/modules/interactions/interaction.schema";
import { interactionService } from "@/modules/interactions/interaction.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await context.params;
  const interaction = await interactionService.getInteractionById(user.agencyId, id);
  if (!interaction) return NextResponse.json({ error: "Interaction introuvable" }, { status: 404 });

  return NextResponse.json({ data: interaction });
}

export async function PATCH(request: NextRequest, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateInteractionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const updated = await interactionService.updateInteraction({
      agencyId: user.agencyId,
      interactionId: id,
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
