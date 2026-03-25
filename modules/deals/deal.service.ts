import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateDealInput, UpdateDealInput } from "./deal.schema";
import { dealRepository } from "./deal.repository";

function toDecimal(value?: string) {
  if (value === undefined) return undefined;
  return value === null ? null : new Prisma.Decimal(value);
}

function inferProbability(input: { stage?: string; probabilityPercent?: number | null }) {
  if (input.probabilityPercent !== undefined && input.probabilityPercent !== null) {
    return input.probabilityPercent;
  }

  switch (input.stage) {
    case "NOUVEAU":
      return 10;
    case "QUALIFICATION":
      return 20;
    case "RECHERCHE_ACTIVE":
      return 30;
    case "BIENS_PROPOSES":
      return 45;
    case "VISITE_PLANIFIEE":
      return 55;
    case "VISITE_REALISEE":
      return 65;
    case "NEGOCIATION":
      return 75;
    case "OFFRE":
      return 85;
    case "SIGNATURE":
      return 95;
    case "SIGNE":
      return 100;
    case "PERDU":
      return 0;
    default:
      return 25;
  }
}

export const dealService = {
  async createDeal(params: { agencyId: string; createdByUserId: string; input: CreateDealInput }) {
    const { agencyId, createdByUserId, input } = params;

    return prisma.$transaction(async (tx) => {
      const created = await dealRepository.create(tx, {
        agency: { connect: { id: agencyId } },
        createdByUser: { connect: { id: createdByUserId } },
        ...(input.assignedUserId ? { assignedUser: { connect: { id: input.assignedUserId } } } : {}),
        ...(input.contactId ? { contact: { connect: { id: input.contactId } } } : {}),
        ...(input.propertyId ? { property: { connect: { id: input.propertyId } } } : {}),
        ...(input.searchRequestId ? { searchRequest: { connect: { id: input.searchRequestId } } } : {}),
        title: input.title,
        type: input.type,
        status: input.status,
        stage: input.stage,
        priorityLevel: input.priorityLevel,
        estimatedValue: toDecimal(input.estimatedValue),
        estimatedFees: toDecimal(input.estimatedFees),
        probabilityPercent: inferProbability({ stage: input.stage, probabilityPercent: input.probabilityPercent ?? null }),
        expectedCloseDate: input.expectedCloseDate,
        originSource: input.originSource,
        lostReason: input.lostReason,
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: createdByUserId,
          actionType: "CREATED",
          entityType: "Deal",
          entityId: created.id,
          afterJson: created as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.statusHistory.create({
        data: {
          agencyId,
          entityType: "DealStage",
          entityId: created.id,
          newStatus: created.stage,
          changedByUserId: createdByUserId,
        },
      });

      return created;
    });
  },

  async updateDeal(params: { agencyId: string; dealId: string; updatedByUserId: string; input: UpdateDealInput }) {
    const { agencyId, dealId, updatedByUserId, input } = params;

    const existing = await dealRepository.findById(prisma, dealId, agencyId);
    if (!existing) throw new Error("Dossier introuvable");

    return prisma.$transaction(async (tx) => {
      const updated = await dealRepository.update(tx, dealId, agencyId, {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.stage !== undefined ? { stage: input.stage } : {}),
        ...(input.priorityLevel !== undefined ? { priorityLevel: input.priorityLevel } : {}),
        ...(input.estimatedValue !== undefined ? { estimatedValue: toDecimal(input.estimatedValue) } : {}),
        ...(input.estimatedFees !== undefined ? { estimatedFees: toDecimal(input.estimatedFees) } : {}),
        ...(input.probabilityPercent !== undefined || input.stage !== undefined
          ? { probabilityPercent: inferProbability({ stage: input.stage ?? existing.stage, probabilityPercent: input.probabilityPercent ?? undefined }) }
          : {}),
        ...(input.expectedCloseDate !== undefined ? { expectedCloseDate: input.expectedCloseDate } : {}),
        ...(input.originSource !== undefined ? { originSource: input.originSource } : {}),
        ...(input.lostReason !== undefined ? { lostReason: input.lostReason } : {}),
        ...(input.assignedUserId !== undefined
          ? input.assignedUserId
            ? { assignedUser: { connect: { id: input.assignedUserId } } }
            : { assignedUser: { disconnect: true } }
          : {}),
        ...(input.contactId !== undefined
          ? input.contactId
            ? { contact: { connect: { id: input.contactId } } }
            : { contact: { disconnect: true } }
          : {}),
        ...(input.propertyId !== undefined
          ? input.propertyId
            ? { property: { connect: { id: input.propertyId } } }
            : { property: { disconnect: true } }
          : {}),
        ...(input.searchRequestId !== undefined
          ? input.searchRequestId
            ? { searchRequest: { connect: { id: input.searchRequestId } } }
            : { searchRequest: { disconnect: true } }
          : {}),
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: updatedByUserId,
          actionType: "UPDATED",
          entityType: "Deal",
          entityId: updated.id,
          beforeJson: existing as unknown as Prisma.InputJsonValue,
          afterJson: updated as unknown as Prisma.InputJsonValue,
        },
      });

      if (input.stage && input.stage !== existing.stage) {
        await tx.statusHistory.create({
          data: {
            agencyId,
            entityType: "DealStage",
            entityId: updated.id,
            oldStatus: existing.stage,
            newStatus: input.stage,
            changedByUserId: updatedByUserId,
          },
        });
      }

      return updated;
    });
  },

  async listDeals(agencyId: string, filters: Parameters<typeof dealRepository.findMany>[1]) {
    return dealRepository.findMany(agencyId, filters);
  },

  async getDealById(agencyId: string, dealId: string) {
    return dealRepository.findById(prisma, dealId, agencyId);
  },
};
