import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DealListFilters } from "./deal.types";

type DbClient = PrismaClient | Prisma.TransactionClient;

function buildWhereClause(agencyId: string, filters: DealListFilters = {}): Prisma.DealWhereInput {
  const search = filters.search?.trim();

  return {
    agencyId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { contact: { fullName: { contains: search, mode: "insensitive" } } },
            { property: { internalTitle: { contains: search, mode: "insensitive" } } },
            { searchRequest: { title: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(filters.stage ? { stage: filters.stage } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.priorityLevel ? { priorityLevel: filters.priorityLevel } : {}),
    ...(filters.assignedUserId ? { assignedUserId: filters.assignedUserId } : {}),
  };
}

const includeRelations = {
  contact: { select: { id: true, fullName: true, email: true, phone: true } },
  property: {
    select: {
      id: true,
      internalTitle: true,
      arrondissement: true,
      monthlyRent: true,
      totalArea: true,
    },
  },
  searchRequest: { select: { id: true, title: true, status: true } },
  assignedUser: { select: { id: true, fullName: true } },
  createdByUser: { select: { id: true, fullName: true } },
} as const;

export const dealRepository = {
  async create(db: DbClient, data: Prisma.DealCreateInput) {
    return db.deal.create({ data, include: includeRelations });
  },

  async update(db: DbClient, dealId: string, _agencyId: string, data: Prisma.DealUpdateInput) {
    return db.deal.update({ where: { id: dealId }, data, include: includeRelations });
  },

  async findById(db: DbClient, dealId: string, agencyId: string) {
    return db.deal.findFirst({
      where: { id: dealId, agencyId },
      include: includeRelations,
    });
  },

  async findMany(agencyId: string, filters: DealListFilters = {}) {
    return prisma.deal.findMany({
      where: buildWhereClause(agencyId, filters),
      orderBy: { updatedAt: "desc" },
      include: {
        contact: { select: { id: true, fullName: true } },
        property: { select: { id: true, internalTitle: true } },
        searchRequest: { select: { id: true, title: true } },
        assignedUser: { select: { id: true, fullName: true } },
      },
      take: 100,
    });
  },
};
