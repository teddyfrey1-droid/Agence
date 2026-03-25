import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

function buildWhereClause(
  agencyId: string,
  filters: Record<string, unknown> = {},
): Prisma.PropertyWhereInput {
  const search = typeof filters.search === "string" ? filters.search.trim() : undefined;

  return {
    agencyId,
    ...(search
      ? {
          OR: [
            { internalTitle: { contains: search, mode: "insensitive" } },
            { propertyReference: { contains: search, mode: "insensitive" } },
            { addressLine1: { contains: search, mode: "insensitive" } },
            { neighborhood: { contains: search, mode: "insensitive" } },
            { arrondissement: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.arrondissement ? { arrondissement: filters.arrondissement as string } : {}),
    ...(filters.neighborhood ? { neighborhood: filters.neighborhood as string } : {}),
    ...(filters.assetType ? { assetType: filters.assetType as never } : {}),
    ...(filters.status ? { status: filters.status as never } : {}),
    ...(filters.confidentialityLevel
      ? { confidentialityLevel: filters.confidentialityLevel as never }
      : {}),
    ...(typeof filters.extractionAvailable === "boolean"
      ? { extractionAvailable: filters.extractionAvailable }
      : {}),
    ...(filters.assignedUserId ? { assignedUserId: filters.assignedUserId as string } : {}),
  };
}

const includeRelations = {
  assignedUser: { select: { id: true, fullName: true } },
  createdByUser: { select: { id: true, fullName: true } },
} as const;

export const propertyRepository = {
  create(db: DbClient, data: Prisma.PropertyCreateInput) {
    return db.property.create({ data, include: includeRelations });
  },

  update(db: DbClient, propertyId: string, _agencyId: string, data: Prisma.PropertyUpdateInput) {
    return db.property.update({
      where: { id: propertyId },
      data,
      include: includeRelations,
    });
  },

  findById(db: DbClient, propertyId: string, agencyId: string) {
    return db.property.findFirst({
      where: { id: propertyId, agencyId },
      include: includeRelations,
    });
  },

  findMany(agencyId: string, filters: Record<string, unknown> = {}) {
    return prisma.property.findMany({
      where: buildWhereClause(agencyId, filters),
      orderBy: { updatedAt: "desc" },
      include: { assignedUser: { select: { id: true, fullName: true } } },
      take: 100,
    });
  },
};
