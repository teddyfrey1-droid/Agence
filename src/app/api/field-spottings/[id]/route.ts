import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateFieldSpottingSchema } from "@/modules/field-spottings/field-spotting.schema";
import { fieldSpottingService } from "@/modules/field-spottings/field-spotting.service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: Context) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await context.params;
  const spotting = await fieldSpottingService.getFieldSpottingById(user.agencyId, id);

  if (!spotting) {
    return NextResponse.json({ error: "Repérage introuvable" }, { status: 404 });
  }

  return NextResponse.json({ data: spotting });
}

export async function PATCH(request: NextRequest, context: Context) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateFieldSpottingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const updated = await fieldSpottingService.updateFieldSpotting({
      agencyId: user.agencyId,
      fieldSpottingId: id,
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
