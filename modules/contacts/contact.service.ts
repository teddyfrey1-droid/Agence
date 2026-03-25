import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateContactInput, UpdateContactInput } from "./contact.schema";
import { contactRepository } from "./contact.repository";

function normalizeNullable(value?: string | null) {
  return value === undefined ? undefined : value;
}

export const contactService = {
  async createContact(params: {
    agencyId: string;
    createdByUserId: string;
    input: CreateContactInput;
  }) {
    const { agencyId, createdByUserId, input } = params;

    return prisma.$transaction(async (tx) => {
      const created = await contactRepository.create(tx, {
        agency: { connect: { id: agencyId } },
        ...(input.ownerUserId
          ? { ownerUser: { connect: { id: input.ownerUserId } } }
          : {}),
        fullName: input.fullName,
        firstName: normalizeNullable(input.firstName),
        lastName: normalizeNullable(input.lastName),
        email: normalizeNullable(input.email),
        phone: normalizeNullable(input.phone),
        whatsappPhone: normalizeNullable(input.whatsappPhone),
        preferredContactMethod: normalizeNullable(input.preferredContactMethod),
        source: normalizeNullable(input.source),
        contactTypePrimary: input.contactTypePrimary,
        activitySector: normalizeNullable(input.activitySector),
        priorityLevel: input.priorityLevel,
        relationshipStage: input.relationshipStage,
        notesSummary: normalizeNullable(input.notesSummary),
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: createdByUserId,
          actionType: "CREATED",
          entityType: "Contact",
          entityId: created.id,
          afterJson: created as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.statusHistory.create({
        data: {
          agencyId,
          entityType: "Contact",
          entityId: created.id,
          newStatus: created.relationshipStage,
          changedByUserId: createdByUserId,
        },
      });

      return created;
    });
  },

  async updateContact(params: {
    agencyId: string;
    contactId: string;
    updatedByUserId: string;
    input: UpdateContactInput;
  }) {
    const { agencyId, contactId, updatedByUserId, input } = params;

    const existing = await contactRepository.findById(prisma, contactId, agencyId);

    if (!existing) {
      throw new Error("Contact introuvable");
    }

    return prisma.$transaction(async (tx) => {
      const updated = await contactRepository.update(tx, contactId, agencyId, {
        ...(input.ownerUserId !== undefined
          ? input.ownerUserId
            ? { ownerUser: { connect: { id: input.ownerUserId } } }
            : { ownerUser: { disconnect: true } }
          : {}),
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.whatsappPhone !== undefined ? { whatsappPhone: input.whatsappPhone } : {}),
        ...(input.preferredContactMethod !== undefined
          ? { preferredContactMethod: input.preferredContactMethod }
          : {}),
        ...(input.source !== undefined ? { source: input.source } : {}),
        ...(input.contactTypePrimary !== undefined
          ? { contactTypePrimary: input.contactTypePrimary }
          : {}),
        ...(input.activitySector !== undefined ? { activitySector: input.activitySector } : {}),
        ...(input.priorityLevel !== undefined ? { priorityLevel: input.priorityLevel } : {}),
        ...(input.relationshipStage !== undefined
          ? { relationshipStage: input.relationshipStage }
          : {}),
        ...(input.notesSummary !== undefined ? { notesSummary: input.notesSummary } : {}),
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: updatedByUserId,
          actionType: "UPDATED",
          entityType: "Contact",
          entityId: updated.id,
          beforeJson: existing as unknown as Prisma.InputJsonValue,
          afterJson: updated as unknown as Prisma.InputJsonValue,
        },
      });

      if (input.relationshipStage && input.relationshipStage !== existing.relationshipStage) {
        await tx.statusHistory.create({
          data: {
            agencyId,
            entityType: "Contact",
            entityId: updated.id,
            oldStatus: existing.relationshipStage,
            newStatus: input.relationshipStage,
            changedByUserId: updatedByUserId,
          },
        });
      }

      return updated;
    });
  },

  async listContacts(agencyId: string, filters: Parameters<typeof contactRepository.findMany>[1]) {
    return contactRepository.findMany(agencyId, filters);
  },

  async getContactById(agencyId: string, contactId: string) {
    return contactRepository.findById(prisma, contactId, agencyId);
  },
};
