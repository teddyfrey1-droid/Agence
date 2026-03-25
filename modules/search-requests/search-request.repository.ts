import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

function buildWhereClause(
  agencyId: string,
  filters: Record<string, unknown> = {},
): Prisma.SearchRequestWhereInput {
  const search = typeof filters.search === "string" ? filters.search.trim() : undefined;

  return {
    agencyId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { contact: { fullName: { contains: search, mode: "insensitive" } } },
            { source: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status as never } : {}),
    ...(filters.requestType ? { requestType: filters.requestType as never } : {}),
    ...(filters.priority ? { priority: filters.priority as never } : {}),
    ...(filters.urgencyLevel ? { urgencyLevel: filters.urgencyLevel as never } : {}),
    ...(filters.arrondissement
      ? { targetArrondissements: { has: filters.arrondissement as string } }
      : {}),
    ...(filters.assignedUserId ? { assignedUserId: filters.assignedUserId as string } : {}),
    ...(typeof filters.extractionRequired === "boolean"
      ? { extractionRequired: filters.extractionRequired }
      : {}),
  };
}

const includeRelations = {
  contact: { select: { id: true, fullName: true, email: true, phone: true } },
  assignedUser: { select: { id: true, fullName: true } },
} as const;

export const searchRequestRepository = {
  create(db: DbClient, data: Prisma.SearchRequestCreateInput) {
    return db.searchRequest.create({ data, include: includeRelations });
  },

  update(
    db: DbClient,
    searchRequestId: string,
    _agencyId: string,
    data: Prisma.SearchRequestUpdateInput,
  ) {
    return db.searchRequest.update({
      where: { id: searchRequestId },
      data,
      include: includeRelations,
    });
  },

  findById(db: DbClient, searchRequestId: string, agencyId: string) {
    return db.searchRequest.findFirst({
      where: { id: searchRequestId, agencyId },
      include: includeRelations,
    });
  },

  findMany(agencyId: string, filters: Record<string, unknown> = {}) {
    return prisma.searchRequest.findMany({
      where: buildWhereClause(agencyId, filters),
      orderBy: { updatedAt: "desc" },
      include: {
        contact: { select: { id: true, fullName: true } },
        assignedUser: { select: { id: true, fullName: true } },
      },
      take: 100,
    });
  },
};
