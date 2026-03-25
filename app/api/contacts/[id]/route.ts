import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateContactSchema } from "@/modules/contacts/contact.schema";
import { contactService } from "@/modules/contacts/contact.service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: Context) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await context.params;
  const contact = await contactService.getContactById(user.agencyId, id);

  if (!contact) {
    return NextResponse.json({ error: "Contact introuvable" }, { status: 404 });
  }

  return NextResponse.json({ data: contact });
}

export async function PATCH(request: NextRequest, context: Context) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation échouée", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const updated = await contactService.updateContact({
      agencyId: user.agencyId,
      contactId: id,
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
