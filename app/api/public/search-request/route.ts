import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  createInboundInteraction,
  createInboundTask,
  getFallbackInboundUser,
  getPrimaryAgency,
  upsertInboundContact,
} from "@/lib/inbound";
import { matchService } from "@/modules/matches/match.service";
import { publicSearchLeadSchema } from "@/modules/public-leads/public-lead.schema";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = publicSearchLeadSchema.safeParse(body);
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
    source: "website-search-request",
    contactTypePrimary: "PROSPECT",
    notesSummary: input.activity
      ? `Demande web — activité : ${input.activity}`
      : "Demande web reçue depuis le site.",
  });
  const searchRequest = await prisma.searchRequest.create({
    data: {
      agencyId: agency.id,
      contactId: contact.id,
      assignedUserId: fallbackUser.id,
      title: `Recherche ${input.activity || "local commercial"} - ${input.fullName}`,
      requestType: "LOCATION",
      status: "NEW",
      priority: "MEDIUM",
      urgencyLevel: "MEDIUM",
      source: "website",
      targetArrondissements: input.targetArrondissements,
      budgetMax: input.budgetMax || undefined,
      areaMin: input.areaMin || undefined,
      extractionRequired: input.extractionRequired ?? null,
      allowedActivities: input.activity ? [input.activity] : [],
      qualificationScore: 30,
    },
  });
  await createInboundInteraction({
    agencyId: agency.id,
    authorUserId: fallbackUser.id,
    contactId: contact.id,
    summary: created
      ? "Nouvelle demande de recherche depuis le site"
      : "Nouvelle demande de recherche rattachée à un contact existant",
    details: [
      input.activity ? `Activité : ${input.activity}` : null,
      input.targetArrondissements.length
        ? `Zones : ${input.targetArrondissements.join(", ")}`
        : null,
      input.budgetMax ? `Budget max : ${input.budgetMax}` : null,
      input.areaMin ? `Surface min : ${input.areaMin}` : null,
      input.extractionRequired === true
        ? "Extraction : obligatoire"
        : input.extractionRequired === false
          ? "Extraction : non obligatoire"
          : "Extraction : non précisée",
    ]
      .filter(Boolean)
      .join("\n"),
  });
  await createInboundTask({
    agencyId: agency.id,
    assignedUserId: fallbackUser.id,
    createdByUserId: fallbackUser.id,
    contactId: contact.id,
    searchRequestId: searchRequest.id,
    title: `Qualifier la demande de ${contact.fullName}`,
    description:
      "Demande entrante reçue depuis le site. Appeler ou répondre rapidement pour qualification.",
  });
 await matchService.recomputeForSearchRequest(agency.id, searchRequest.id);
  return NextResponse.json({
    success: true,
    data: {
      contactId: contact.id,
      searchRequestId: searchRequest.id,
    },
  });
}
