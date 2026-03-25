import { Prisma, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateTaskInput, UpdateTaskInput } from "./task.schema";
import { taskRepository } from "./task.repository";

function normalizeCompletedAt(status: TaskStatus, completedAt?: Date | null) {
  if (status === TaskStatus.DONE) return completedAt ?? new Date();
  return completedAt === undefined ? undefined : null;
}

function taskRelationConnectDisconnect(inputValue: string | null | undefined, relationName: string) {
  if (inputValue === undefined) return {};
  if (inputValue) return { [relationName]: { connect: { id: inputValue } } };
  return { [relationName]: { disconnect: true } };
}

export const taskService = {
  async createTask(params: { agencyId: string; createdByUserId: string; input: CreateTaskInput }) {
    const { agencyId, createdByUserId, input } = params;
    const finalStatus = input.status ?? TaskStatus.TODO;

    return prisma.$transaction(async (tx) => {
      const created = await taskRepository.create(tx, {
        agency: { connect: { id: agencyId } },
        createdByUser: { connect: { id: createdByUserId } },
        ...(input.assignedUserId ? { assignedUser: { connect: { id: input.assignedUserId } } } : {}),
        ...(input.contactId ? { contact: { connect: { id: input.contactId } } } : {}),
        ...(input.propertyId ? { property: { connect: { id: input.propertyId } } } : {}),
        ...(input.searchRequestId ? { searchRequest: { connect: { id: input.searchRequestId } } } : {}),
        ...(input.dealId ? { deal: { connect: { id: input.dealId } } } : {}),
        ...(input.fieldSpottingId ? { fieldSpotting: { connect: { id: input.fieldSpottingId } } } : {}),
        title: input.title,
        description: input.description,
        taskType: input.taskType,
        status: finalStatus,
        priority: input.priority,
        dueAt: input.dueAt,
        completedAt: normalizeCompletedAt(finalStatus, input.completedAt),
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: createdByUserId,
          actionType: "CREATED",
          entityType: "Task",
          entityId: created.id,
          afterJson: created as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.statusHistory.create({
        data: {
          agencyId,
          entityType: "TaskStatus",
          entityId: created.id,
          newStatus: created.status,
          changedByUserId: createdByUserId,
        },
      });

      return created;
    });
  },

  async updateTask(params: { agencyId: string; taskId: string; updatedByUserId: string; input: UpdateTaskInput }) {
    const { agencyId, taskId, updatedByUserId, input } = params;
    const existing = await taskRepository.findById(prisma, taskId, agencyId);
    if (!existing) throw new Error("Tâche introuvable");

    const nextStatus = input.status ?? existing.status;

    return prisma.$transaction(async (tx) => {
      const updated = await taskRepository.update(tx, taskId, {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.taskType !== undefined ? { taskType: input.taskType } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
        ...(input.completedAt !== undefined || input.status !== undefined
          ? { completedAt: normalizeCompletedAt(nextStatus, input.completedAt ?? existing.completedAt) }
          : {}),
        ...taskRelationConnectDisconnect(input.assignedUserId, "assignedUser"),
        ...taskRelationConnectDisconnect(input.contactId, "contact"),
        ...taskRelationConnectDisconnect(input.propertyId, "property"),
        ...taskRelationConnectDisconnect(input.searchRequestId, "searchRequest"),
        ...taskRelationConnectDisconnect(input.dealId, "deal"),
        ...taskRelationConnectDisconnect(input.fieldSpottingId, "fieldSpotting"),
      });

      await tx.auditLog.create({
        data: {
          agencyId,
          userId: updatedByUserId,
          actionType: "UPDATED",
          entityType: "Task",
          entityId: updated.id,
          beforeJson: existing as unknown as Prisma.InputJsonValue,
          afterJson: updated as unknown as Prisma.InputJsonValue,
        },
      });

      if (input.status && input.status !== existing.status) {
        await tx.statusHistory.create({
          data: {
            agencyId,
            entityType: "TaskStatus",
            entityId: updated.id,
            oldStatus: existing.status,
            newStatus: input.status,
            changedByUserId: updatedByUserId,
          },
        });
      }

      return updated;
    });
  },

  async listTasks(agencyId: string, filters: Parameters<typeof taskRepository.findMany>[1]) {
    return taskRepository.findMany(agencyId, filters);
  },

  async getTaskById(agencyId: string, taskId: string) {
    return taskRepository.findById(prisma, taskId, agencyId);
  },
};
