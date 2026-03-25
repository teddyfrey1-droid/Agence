import { NextRequest, NextResponse } from "next/server";

import {
  createInboundInteraction,
  createInboundTask,
  getFallbackInboundUser,
  getPrimaryAgency,
  upsertInboundContact,
} from "@/lib/inbound";
import { publicContactLeadSchema } from "@/modules/public-leads/public-lead.schema";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = publicContactLeadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Informations invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  if (input.company) {
    return NextResponse.json({ success: true, spamProtected: true });
  }

  const agency = await getPrimaryAgency();
  if (!agency) {
    return NextResponse.json({ error: "Agence introuvable" }, { status: 404 });
  }

  const fallbackUser = await getFallbackInboundUser(agency.id);
  if (!fallbackUser) {
    return NextResponse.json(
      { error: "Aucun utilisateur de référence trouvé" },
      { status: 400 },
    );
  }

  const { contact, created } = await upsertInboundContact({
    agencyId: agency.id,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    source: "website-contact",
    contactTypePrimary: "PROSPECT",
    notesSummary: input.message.slice(0, 500),
  });

  await createInboundInteraction({
    agencyId: agency.id,
    authorUserId: fallbackUser.id,
    contactId: contact.id,
    summary: created
      ? "Nouveau message entrant depuis le site"
      : "Nouveau message site rattaché à un contact existant",
    details: input.message,
  });

  await createInboundTask({
    agencyId: agency.id,
    assignedUserId: fallbackUser.id,
    createdByUserId: fallbackUser.id,
    contactId: contact.id,
    title: `Répondre au message de ${contact.fullName}`,
    description: "Message entrant reçu depuis le site. Répondre ou rappeler rapidement.",
  });

  return NextResponse.json({ success: true, data: { contactId: contact.id } });
}
