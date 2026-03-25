import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FieldSpottingListFilters } from "./field-spotting.types";

type DbClient = PrismaClient | Prisma.TransactionClient;

function buildWhereClause(
  agencyId: string,
  filters: FieldSpottingListFilters = {},
): Prisma.FieldSpottingWhereInput {
  const search = filters.search?.trim();

  return {
    agencyId,
    ...(search
      ? {
          OR: [
            { addressText: { contains: search, mode: "insensitive" } },
            { quickNote: { contains: search, mode: "insensitive" } },
            { neighborhood: { contains: search, mode: "insensitive" } },
            { arrondissement: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.spottingStatus ? { spottingStatus: filters.spottingStatus } : {}),
    ...(filters.arrondissement ? { arrondissement: filters.arrondissement } : {}),
    ...(filters.assignedUserId ? { assignedUserId: filters.assignedUserId } : {}),
    ...(typeof filters.ownerIdentified === "boolean"
      ? { ownerIdentified: filters.ownerIdentified }
      : {}),
    ...(typeof filters.ownerContacted === "boolean"
      ? { ownerContacted: filters.ownerContacted }
      : {}),
  };
}

const includeRelations = {
  createdByUser: { select: { id: true, fullName: true } },
  assignedUser: { select: { id: true, fullName: true } },
  ownerContact: { select: { id: true, fullName: true, email: true, phone: true } },
} as const;

export const fieldSpottingRepository = {
  async create(db: DbClient, data: Prisma.FieldSpottingCreateInput) {
    return db.fieldSpotting.create({ data, include: includeRelations });
  },

  async update(
    db: DbClient,
    spottingId: string,
    _agencyId: string,
    data: Prisma.FieldSpottingUpdateInput,
  ) {
    return db.fieldSpotting.update({ where: { id: spottingId }, data, include: includeRelations });
  },

  async findById(db: DbClient, spottingId: string, agencyId: string) {
    return db.fieldSpotting.findFirst({
      where: { id: spottingId, agencyId },
      include: includeRelations,
    });
  },

  async findMany(agencyId: string, filters: FieldSpottingListFilters = {}) {
    return prisma.fieldSpotting.findMany({
      where: buildWhereClause(agencyId, filters),
      orderBy: { updatedAt: "desc" },
      include: { assignedUser: { select: { id: true, fullName: true } } },
      take: 100,
    });
  },
};
