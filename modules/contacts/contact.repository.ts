import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ContactListFilters } from "./contact.types";

type DbClient = PrismaClient | Prisma.TransactionClient;

function buildWhereClause(
  agencyId: string,
  filters: ContactListFilters = {},
): Prisma.ContactWhereInput {
  const search = filters.search?.trim();

  return {
    agencyId,
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { activitySector: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.contactTypePrimary
      ? { contactTypePrimary: filters.contactTypePrimary }
      : {}),
    ...(filters.priorityLevel ? { priorityLevel: filters.priorityLevel } : {}),
    ...(filters.relationshipStage
      ? { relationshipStage: filters.relationshipStage }
      : {}),
    ...(filters.ownerUserId ? { ownerUserId: filters.ownerUserId } : {}),
  };
}

const includeRelations = {
  ownerUser: { select: { id: true, fullName: true } },
} as const;

export const contactRepository = {
  async create(db: DbClient, data: Prisma.ContactCreateInput) {
    return db.contact.create({ data, include: includeRelations });
  },

  async update(db: DbClient, contactId: string, _agencyId: string, data: Prisma.ContactUpdateInput) {
    return db.contact.update({ where: { id: contactId }, data, include: includeRelations });
  },

  async findById(db: DbClient, contactId: string, agencyId: string) {
    return db.contact.findFirst({
      where: { id: contactId, agencyId },
      include: includeRelations,
    });
  },

  async findMany(agencyId: string, filters: ContactListFilters = {}) {
    return prisma.contact.findMany({
      where: buildWhereClause(agencyId, filters),
      orderBy: { updatedAt: "desc" },
      include: {
        ownerUser: { select: { id: true, fullName: true } },
        _count: { select: { searchRequests: true, deals: true } },
      },
      take: 100,
    });
  },
};
