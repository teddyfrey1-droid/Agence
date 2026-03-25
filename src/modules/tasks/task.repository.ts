import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { TaskListFilters } from "./task.types";

type DbClient = PrismaClient | Prisma.TransactionClient;

function buildWhereClause(agencyId: string, filters: TaskListFilters = {}): Prisma.TaskWhereInput {
  const search = filters.search?.trim();

  return {
    agencyId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.taskType ? { taskType: filters.taskType } : {}),
    ...(filters.assignedUserId ? { assignedUserId: filters.assignedUserId } : {}),
    ...(filters.overdueOnly
      ? {
          dueAt: { lt: new Date() },
          status: { not: "DONE" },
        }
      : {}),
  };
}

export const taskRepository = {
  async create(db: DbClient, data: Prisma.TaskCreateInput) {
    return db.task.create({
      data,
      include: {
        assignedUser: { select: { id: true, fullName: true } },
        createdByUser: { select: { id: true, fullName: true } },
        contact: { select: { id: true, fullName: true } },
        property: { select: { id: true, internalTitle: true } },
        searchRequest: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
        fieldSpotting: { select: { id: true, addressText: true } },
      },
    });
  },

  async update(db: DbClient, taskId: string, data: Prisma.TaskUpdateInput) {
    return db.task.update({
      where: { id: taskId },
      data,
      include: {
        assignedUser: { select: { id: true, fullName: true } },
        createdByUser: { select: { id: true, fullName: true } },
        contact: { select: { id: true, fullName: true } },
        property: { select: { id: true, internalTitle: true } },
        searchRequest: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
        fieldSpotting: { select: { id: true, addressText: true } },
      },
    });
  },

  async findById(db: DbClient, taskId: string, agencyId: string) {
    return db.task.findFirst({
      where: { id: taskId, agencyId },
      include: {
        assignedUser: { select: { id: true, fullName: true } },
        createdByUser: { select: { id: true, fullName: true } },
        contact: { select: { id: true, fullName: true } },
        property: { select: { id: true, internalTitle: true } },
        searchRequest: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
        fieldSpotting: { select: { id: true, addressText: true } },
      },
    });
  },

  async findMany(agencyId: string, filters: TaskListFilters = {}) {
    return prisma.task.findMany({
      where: buildWhereClause(agencyId, filters),
      orderBy: [
        { dueAt: "asc" },
        { updatedAt: "desc" },
      ],
      include: {
        assignedUser: { select: { id: true, fullName: true } },
        contact: { select: { id: true, fullName: true } },
        property: { select: { id: true, internalTitle: true } },
        searchRequest: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
        fieldSpotting: { select: { id: true, addressText: true } },
      },
      take: 100,
    });
  },
};
