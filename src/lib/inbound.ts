import { ContactType, RelationshipStage, UserStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getPrimaryAgency() {
  return prisma.agency.findFirst({
    where: { slug: "premium-retail-paris" },
  });
}

export async function getFallbackInboundUser(agencyId: string) {
  return prisma.user.findFirst({
    where: {
      agencyId,
      status: UserStatus.ACTIVE,
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function findInboundContact(params: {
  agencyId: string;
  email?: string | null;
  phone?: string | null;
}) {
  const { agencyId, email, phone } = params;

  const orFilters = [] as Array<{ email?: string; phone?: string }>;
  if (email) orFilters.push({ email });
  if (phone) orFilters.push({ phone });

  if (orFilters.length === 0) return null;

  return prisma.contact.findFirst({
    where: {
      agencyId,
      OR: orFilters,
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function upsertInboundContact(params: {
  agencyId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  source: string;
  contactTypePrimary: ContactType;
  notesSummary?: string | null;
}) {
  const { agencyId, fullName, email, phone, source, contactTypePrimary, notesSummary } = params;

  const normalizedEmail = email?.trim().toLowerCase() || null;
  const normalizedPhone = phone?.trim() || null;
  const trimmedName = fullName.trim();
  const trimmedNote = notesSummary?.trim() || null;

  const existing = await findInboundContact({
    agencyId,
    email: normalizedEmail,
    phone: normalizedPhone,
  });

  if (!existing) {
    const created = await prisma.contact.create({
      data: {
        agencyId,
        fullName: trimmedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        source,
        relationshipStage: RelationshipStage.ACTIVE,
        contactTypePrimary,
        notesSummary: trimmedNote,
      },
    });

    return { contact: created, created: true };
  }

  const mergedNotes = [existing.notesSummary, trimmedNote]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .join("\n\n")
    .trim();

  const updated = await prisma.contact.update({
    where: { id: existing.id },
    data: {
      fullName: existing.fullName || trimmedName,
      email: existing.email || normalizedEmail,
      phone: existing.phone || normalizedPhone,
      relationshipStage: RelationshipStage.ACTIVE,
      source: existing.source || source,
      notesSummary: mergedNotes || null,
    },
  });

  return { contact: updated, created: false };
}

export async function createInboundTask(params: {
  agencyId: string;
  assignedUserId: string;
  createdByUserId: string;
  contactId?: string;
  searchRequestId?: string;
  fieldSpottingId?: string;
  title: string;
  description?: string;
}) {
  const { agencyId, assignedUserId, createdByUserId, contactId, searchRequestId, fieldSpottingId, title, description } = params;

  return prisma.task.create({
    data: {
      agencyId,
      assignedUserId,
      createdByUserId,
      taskType: "RELANCE",
      status: "TODO",
      priority: "HIGH",
      dueAt: new Date(),
      title,
      description,
      ...(contactId ? { contactId } : {}),
      ...(searchRequestId ? { searchRequestId } : {}),
      ...(fieldSpottingId ? { fieldSpottingId } : {}),
    },
  });
}

export async function createInboundInteraction(params: {
  agencyId: string;
  authorUserId: string;
  contactId?: string;
  searchRequestId?: string;
  summary: string;
  details?: string;
}) {
  const { agencyId, authorUserId, contactId, searchRequestId, summary, details } = params;

  return prisma.interaction.create({
    data: {
      agencyId,
      authorUserId,
      interactionType: "EMAIL",
      happenedAt: new Date(),
      summary,
      details: details || null,
      nextStep: "Prendre contact avec le prospect.",
      ...(contactId ? { contactId } : {}),
      ...(searchRequestId ? { searchRequestId } : {}),
    },
  });
}
