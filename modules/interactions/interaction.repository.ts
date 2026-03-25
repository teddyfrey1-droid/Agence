import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { InteractionListFilters } from "./interaction.types";

type DbClient = PrismaClient | Prisma.TransactionClient;

function buildWhereClause(agencyId: string, filters: InteractionListFilters = {}): Prisma.InteractionWhereInput {
  const search = filters.search?.trim();

  return {
    agencyId,
    ...(search
      ? {
          OR: [
            { summary: { contains: search, mode: "insensitive" } },
            { details: { contains: search, mode: "insensitive" } },
            { nextStep: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.interactionType ? { interactionType: filters.interactionType } : {}),
    ...(filters.contactId ? { contactId: filters.contactId } : {}),
    ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
    ...(filters.searchRequestId ? { searchRequestId: filters.searchRequestId } : {}),
    ...(filters.dealId ? { dealId: filters.dealId } : {}),
    ...(filters.authorUserId ? { authorUserId: filters.authorUserId } : {}),
  };
}

const includeRelations = {
  authorUser: { select: { id: true, fullName: true } },
  contact: { select: { id: true, fullName: true } },
  property: { select: { id: true, internalTitle: true } },
  searchRequest: { select: { id: true, title: true } },
  deal: { select: { id: true, title: true } },
} as const;

export const interactionRepository = {
  async create(db: DbClient, data: Prisma.InteractionCreateInput) {
    return db.interaction.create({
      data,
      include: includeRelations,
    });
  },

  async update(db: DbClient, interactionId: string, data: Prisma.InteractionUpdateInput) {
    return db.interaction.update({
      where: { id: interactionId },
      data,
      include: includeRelations,
    });
  },

  async findById(db: DbClient, interactionId: string, agencyId: string) {
    return db.interaction.findFirst({
      where: { id: interactionId, agencyId },
      include: includeRelations,
    });
  },

  async findMany(agencyId: string, filters: InteractionListFilters = {}) {
    return prisma.interaction.findMany({
      where: buildWhereClause(agencyId, filters),
      orderBy: { happenedAt: "desc" },
      include: includeRelations,
      take: 100,
    });
  },
};
