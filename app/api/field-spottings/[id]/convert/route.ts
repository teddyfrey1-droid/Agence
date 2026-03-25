import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fieldSpottingService } from "@/modules/field-spottings/field-spotting.service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: Context) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const data = await fieldSpottingService.convertFieldSpottingToProperty({
      agencyId: user.agencyId,
      fieldSpottingId: id,
      userId: user.id,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 400 },
    );
  }
}
