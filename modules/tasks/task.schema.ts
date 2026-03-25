import { z } from "zod";
import { PriorityLevel, TaskStatus, TaskType } from "@prisma/client";

const optionalNullableTrimmedString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

const optionalCuid = z.string().cuid().nullable().optional();

const optionalDate = z
  .union([z.string(), z.date()])
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    return value instanceof Date ? value : new Date(value);
  });

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Titre requis"),
  description: optionalNullableTrimmedString,
  taskType: z.nativeEnum(TaskType).default(TaskType.FOLLOW_UP),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
  dueAt: optionalDate,
  completedAt: optionalDate,
  assignedUserId: optionalCuid,
  contactId: optionalCuid,
  propertyId: optionalCuid,
  searchRequestId: optionalCuid,
  dealId: optionalCuid,
  fieldSpottingId: optionalCuid,
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
