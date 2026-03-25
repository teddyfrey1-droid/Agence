import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateInteractionInput, UpdateInteractionInput } from "./interaction.schema";
import { interactionRepository } from "./interaction.repository";

function relationConnectDisconnect(inputValue: string | null | undefined, relationName: string) {
  if (inputValue === undefined) return {};
  if (inputValue) return { [relationName]: { connect: { id: inputValue } } };
  return { [relationName]: { disconnect: true } };
}

export const interactionService = {
  async createInteraction(params: {
    agencyId: string;
    authorUserId: string;
    input: CreateInteractionInput;
  }) {
    const { agencyId, authorUserId, input } = params;

    return prisma.$transaction(async (tx) => {
      const created = await interactionRepository.create(tx, {
        agency: { connect: { id: agencyId } },
        authorUser: { connect: { id: authorUserId } },
        ...(input.contactId ? { contact: { connect: { id: input.contactId } } } : {}),
        ...(input.propertyId ? { property: { connect: { id: input.propertyId } } } : {}),
        ...(input.searchRequestId ? { searchRequest: { connect: { id: input.searchRequestId } } } : {}),
        ...(input.dealId ? { deal: { connect: { id: input.dealId } } } : {}),
        summary: input.summary,
        details: input.details,
        interactionType: input.interactionType,
        happenedAt: input.happenedAt ?? new Date(),
        sentiment: input.sentiment,
        nextStep: input.nextStep,
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: authorUserId,
          actionType: "CREATED",
          entityType: "Interaction",
          entityId: created.id,
          afterJson: created as unknown as Prisma.InputJsonValue,
        },
      });

      return created;
    });
  },

  async updateInteraction(params: {
    agencyId: string;
    interactionId: string;
    updatedByUserId: string;
    input: UpdateInteractionInput;
  }) {
    const { agencyId, interactionId, updatedByUserId, input } = params;
    const existing = await interactionRepository.findById(prisma, interactionId, agencyId);
    if (!existing) throw new Error("Interaction introuvable");

    return prisma.$transaction(async (tx) => {
      const updated = await interactionRepository.update(tx, interactionId, {
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.details !== undefined ? { details: input.details } : {}),
        ...(input.interactionType !== undefined ? { interactionType: input.interactionType } : {}),
        ...(input.happenedAt !== undefined ? { happenedAt: input.happenedAt } : {}),
        ...(input.sentiment !== undefined ? { sentiment: input.sentiment } : {}),
        ...(input.nextStep !== undefined ? { nextStep: input.nextStep } : {}),
        ...relationConnectDisconnect(input.contactId, "contact"),
        ...relationConnectDisconnect(input.propertyId, "property"),
        ...relationConnectDisconnect(input.searchRequestId, "searchRequest"),
        ...relationConnectDisconnect(input.dealId, "deal"),
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: updatedByUserId,
          actionType: "UPDATED",
          entityType: "Interaction",
          entityId: updated.id,
          beforeJson: existing as unknown as Prisma.InputJsonValue,
          afterJson: updated as unknown as Prisma.InputJsonValue,
        },
      });

      return updated;
    });
  },

  async listInteractions(agencyId: string, filters: Parameters<typeof interactionRepository.findMany>[1]) {
    return interactionRepository.findMany(agencyId, filters);
  },

  async getInteractionById(agencyId: string, interactionId: string) {
    return interactionRepository.findById(prisma, interactionId, agencyId);
  },
};
