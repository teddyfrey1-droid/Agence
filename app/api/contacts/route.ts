import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createContactSchema } from "@/modules/contacts/contact.schema";
import { contactService } from "@/modules/contacts/contact.service";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const contacts = await contactService.listContacts(user.agencyId, {
    search: searchParams.get("search") ?? undefined,
    contactTypePrimary: (searchParams.get("contactTypePrimary") as never) ?? undefined,
    priorityLevel: (searchParams.get("priorityLevel") as never) ?? undefined,
    relationshipStage: (searchParams.get("relationshipStage") as never) ?? undefined,
    ownerUserId: searchParams.get("ownerUserId") ?? undefined,
  });

  return NextResponse.json({ data: contacts });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await contactService.createContact({
    agencyId: user.agencyId,
    createdByUserId: user.id,
    input: parsed.data,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
