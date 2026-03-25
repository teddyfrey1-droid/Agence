import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createFieldSpottingSchema } from "@/modules/field-spottings/field-spotting.schema";
import { fieldSpottingService } from "@/modules/field-spottings/field-spotting.service";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const spottings = await fieldSpottingService.listFieldSpottings(user.agencyId, {
    search: searchParams.get("search") ?? undefined,
    spottingStatus: (searchParams.get("spottingStatus") as never) ?? undefined,
    arrondissement: searchParams.get("arrondissement") ?? undefined,
    assignedUserId: searchParams.get("assignedUserId") ?? undefined,
    ownerIdentified:
      searchParams.get("ownerIdentified") === null
        ? undefined
        : searchParams.get("ownerIdentified") === "true",
    ownerContacted:
      searchParams.get("ownerContacted") === null
        ? undefined
        : searchParams.get("ownerContacted") === "true",
  });

  return NextResponse.json({ data: spottings });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createFieldSpottingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await fieldSpottingService.createFieldSpotting({
    agencyId: user.agencyId,
    createdByUserId: user.id,
    input: parsed.data,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
