import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  createInboundInteraction,
  createInboundTask,
  getFallbackInboundUser,
  getPrimaryAgency,
  upsertInboundContact,
} from "@/lib/inbound";
import { publicPropertySubmissionSchema } from "@/modules/public-leads/public-lead.schema";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = publicPropertySubmissionSchema.safeParse(body);

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
    source: "website-property-submission",
    contactTypePrimary: "PROPRIETAIRE",
    notesSummary: input.notes ? input.notes.slice(0, 500) : `Bien proposé : ${input.addressText}`,
  });

  const spotting = await prisma.fieldSpotting.create({
    data: {
      agencyId: agency.id,
      createdByUserId: fallbackUser.id,
      assignedUserId: fallbackUser.id,
      spottingStatus: "TO_REVIEW",
      photoCoverUrl: input.photoCoverUrl || null,
      addressText: input.addressText,
      quickNote: [
        input.surface ? `Surface : ${input.surface}` : null,
        input.rentOrPrice ? `Valeur indiquée : ${input.rentOrPrice}` : null,
        input.notes || null,
      ]
        .filter(Boolean)
        .join("\n"),
      ownerContactId: contact.id,
      ownerIdentified: true,
      potentialType: "owner_inbound_submission",
    },
  });

  await createInboundInteraction({
    agencyId: agency.id,
    authorUserId: fallbackUser.id,
    contactId: contact.id,
    summary: created
      ? "Nouvelle proposition de bien depuis le site"
      : "Nouvelle proposition de bien rattachée à un contact existant",
    details: [
      `Adresse : ${input.addressText}`,
      input.surface ? `Surface : ${input.surface}` : null,
      input.rentOrPrice ? `Valeur indiquée : ${input.rentOrPrice}` : null,
      input.notes || null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  await createInboundTask({
    agencyId: agency.id,
    assignedUserId: fallbackUser.id,
    createdByUserId: fallbackUser.id,
    contactId: contact.id,
    fieldSpottingId: spotting.id,
    title: `Qualifier le bien proposé par ${contact.fullName}`,
    description:
      "Proposition de bien reçue depuis le site. Vérifier l’adresse, rappeler le propriétaire et compléter les informations.",
  });

  return NextResponse.json({
    success: true,
    data: {
      contactId: contact.id,
      fieldSpottingId: spotting.id,
    },
  });
}
